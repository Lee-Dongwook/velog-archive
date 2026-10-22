---
title: "[TroubleShoot] Inefficent Regular Expression Complexity in nth-check"
slug: TroubleShoot-Inefficent-Regular-Expression-Complexity-in-nth-check
velogId: 643c2c0d-f3e8-4137-80c2-d617ddb42262
publishedAt: "2024-01-22T09:19:43.409Z"
updatedAt: "2026-10-16T09:42:25.045Z"
tags:
  - React-app-rewired
  - devDependencies
  - github
  - react scripts
  - troubleshoot
source: >-
  https://velog.io/@dlehddnr99/TroubleShoot-Inefficent-Regular-Expression-Complexity-in-nth-check
---

### Intro

> 알림을 발견한 위치
> 특정 레포지토리의 Security > Vulnerability alerts > Dependabot

![](https://velog.velcdn.com/images/dlehddnr99/post/e2807795-8cd5-4dc0-b6f3-82b9457aecf0/image.png)

최근 프론트엔드 성능 최적화와 관련된 여러 예제들을 만들어보던 중, 특정 레포지토리에서 다음과 같은 알림을 발견하였습니다.

결론부터 말하자면, 실제 프로덕션 번들에서는 문제가 되지 않는 알림이었지만 그래도 처음 보는 알림이었고, 위험도가 높음으로 되어있어서 한번 해결해보고 싶었습니다.

<hr />

### Redos (정규식을 이용한 공격)

위 사진에 나와있는 세부 내용을 읽어보니 `ReDoS(Regular Expression Denial of Service)`에 대한 취약점이 생김을 확인할 수 있었습니다.

ReDos란 정규 표현식을 이용한 서비스 거부 공격입니다.
정규 표현식이 특정 입력에 대해 비정상적으로 오랜 시간이 걸리는 경우 발생하며,
서버 리소스를 과도하게 사용하여 성능을 저하시키거나 마비시키는 악영향을 초래합니다.

ReDos를 방지하기 위해서는 안전한 정규 표현식을 작성하고, 입력 데이터에 대한 적절한 검증을 해야함을 알게 되었습니다.

<hr />

### 관련 내용

![](https://velog.velcdn.com/images/dlehddnr99/post/0a104c23-f0a4-4913-865d-f8786837abf3/image.png)

ReDos 공격에 취약하다는 내용을 파악했지만, 어느 부분에서의 잘못이 원인인지 모르겠어서 검색을 하던 중 이 문제와 관련하여 [stackoverflow](https://stackoverflow.com/questions/71282206/github-dependabot-alert-inefficient-regular-expression-complexity-in-nth-check) 에서 해답을 얻을 수 있었습니다.

react-scripts나 react-app-rewired의 경우에는 본질적으로 빌드 도구이기 때문에 개발 중에는 문제가 발생할 수 있으나 프로덕션 번들에서는 문제가 생기지 않을 것이라고 설명되어 있었습니다.

<hr />

### 해결 과정

#### react-scripts, react-app-rewired를 devDependencies 로 옮김

> pnpm uninstall react-scripts react-app-rewired
> pnpm install react-scripts react-app-rewired --save-dev

<hr />

### Conclusion

보안과 관련된 문제를 직접적으로 경험한 적이 드물어서인지 실제론 큰 문제는 아니었지만 처음 보았을 때 당황했던 것 같습니다. 애플리케이션이 점차 고도화되고 있는 현 시점에서 보안과 관련된 지식도 틈틈이 학습해야함을 느꼈습니다.

<hr />

### 참고 문헌

[stackoverflow - github-dependabot-alert-inefficient-regular-expression-complexity-in-nth-check](https://stackoverflow.com/questions/71282206/github-dependabot-alert-inefficient-regular-expression-complexity-in-nth-check)
