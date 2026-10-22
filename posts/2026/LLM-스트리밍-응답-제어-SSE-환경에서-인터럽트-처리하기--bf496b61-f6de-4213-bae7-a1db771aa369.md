---
title: "LLM 스트리밍 응답 제어 : SSE 환경에서 인터럽트 처리하기"
slug: LLM-스트리밍-응답-제어-SSE-환경에서-인터럽트-처리하기
velogId: bf496b61-f6de-4213-bae7-a1db771aa369
publishedAt: "2026-02-11T06:01:43.217Z"
updatedAt: "2026-10-20T02:56:49.885Z"
tags:
  - Human in the Loop
  - LLM
  - sse
source: "https://velog.io/@dlehddnr99/LLM-스트리밍-응답-제어-SSE-환경에서-인터럽트-처리하기"
---

### Intro

LLM을 활용한 서비스에서 스트리밍은 사용자 경험 향상에 필수적인 기능으로 알고 있다.
하지만, 단순히 텍스트를 넘겨주는 방법이 아닌, 중간에 사용자의 개입이 필요하거나 (Human-in-the-loop), 특정 조건에서 생성을 일시 정지해야하는 복잡한 비즈니스 로직이 추가되면 프론트엔드에서의 스트림 처리 로직은 다소 복잡해진다.

최근 사내 프로젝트에서 SSE(Server-Sent Events) 기반의 스트리밍 구조를 개선하며, 'Interrupt' 이벤트를 안정적으로 도입하는 과정을 공유하고자 한다.

### Requirements

기존 스트리밍 로직은 progress(생성 중), complete(완료), error(에러)라는 세 가지의 state만 존재했다.

하지만, 이번에는 interrupt(중간 검토)의 상태를 추가했어야 했다.

- Server가 interrupt 이벤트를 보낼 시, 메시지 내용(node_output)이 비어 있을 수 있음
- 빈 메시지가 들어온다면 UI에 '내용 없는 ~' 메시지가 보여지거나 파싱 에러가 발생한다.
- 스트림 루프가 complete를 받기 전에 종료되어선 안된다.

### Solution

#### 1. 파싱 계층의 유연성 (Stream Utils)

서버마다 응답 필드명이 다를 수 있다.(예: message vs node_output). 이를 추상화하여 파싱 계층에서 우선순위를 정해 데이터를 추출하도록 개선하고자 했다. 빈 문자열이 들어와도 에러를 내지 않고 '의도된 빈 값'으로 반환하는 것이 핵심이다.

```ts
const parseStreamLine = (line) => {
  const data = JSON.parse(line);
  return {
    message: data.node_output ?? data.message ?? "",
    type: data.type,
    id: data.id,
  };
};
```

#### 2. 상태 관리 계층의 필터링 (Streaming State)

다음에는, 모든 청크를 UI에 쌓는 것이 아니라, interrupt이면서 메시지가 없는 경우(단순 상태 알림 등)는 UI 업데이트를 스킵하도록 구성하고자 했다.

```ts
if (chunk.type === "interrupt" && !chunk.message) {
  return; // UI에 빈 메시지 생성을 방지
}
```

#### 3. 제어 흐름의 무결성 (Loop Control)

본 작업 중 가장 중요한 부분이라도 볼 수 있다.
루프 종료 조건이며, interrupt가 와도 연결은 유지되어야 하므로, 오직 complete 또는 error 타입이 명시될 때만 break 하도록 설계를 고정했다.

```ts
for await (const chunk of stream) {
  process(chunk);
  if (chunk.type === "complete") break;
}
```

### About Architecture

**아키텍처적 고민: FSD(Feature-Sliced Design) 준수**

프로젝트 전반에 걸쳐 SSE 로직을 사용하다 보니 엔티티 간 참조 문제가 발생했다. A 엔티티의 스트림 유틸을 B 엔티티가 직접 참조하면 계층 구조가 깨진다는 내용이며, FSD 아키텍처 미 준수 사항에 해당한다.

이를 해결하고자,SSE 파싱 로직 및 버퍼 처리와 같은 공통 로직을 Shared 레이어로 추출하였고, 각 도메인 엔티티는 Shared 유틸을 사용하여 자신만의 응답 타입을 정의하되, 핵심 알고리즘은 공유하여 코드 중복을 최소화했다.

### Conclusion

스트리밍 응답 처리는 단순히 데이터를 받는 것을 넘어, **서버와 클라이언트 간의 약속(Protocol)**을 얼마나 견고하게 코드로 구현하느냐에 더 초점이 맞춰진거로 파악이 되었다. interrupt 처리를 통해 더 세밀한 LLM 인터랙션을 구현할 수 있었고, 유연한 파싱 로직 덕분에 백엔드 변화에도 민첩하게 대응할 수 있는 구조를 만들수 있었던거 같다.
