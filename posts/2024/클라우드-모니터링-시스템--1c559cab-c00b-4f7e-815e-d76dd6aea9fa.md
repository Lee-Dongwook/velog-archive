---
title: 클라우드 모니터링 (Cloud Monitoring)
slug: 클라우드-모니터링-시스템
velogId: 1c559cab-c00b-4f7e-815e-d76dd6aea9fa
publishedAt: "2024-03-27T03:23:14.820Z"
updatedAt: "2026-10-16T03:09:58.183Z"
tags:
  - Datasaker
  - cloud
  - datadog
source: "https://velog.io/@dlehddnr99/클라우드-모니터링-시스템"
---

### Intro

인턴 근무를 하는 동안 맡았던 프로젝트의 주제는 클라우드 모니터링 솔루션이었다. 근무 당시에는 E2E 테스트 구축 업무를 주로 담당하였지만, 클라우드 모니터링에 대한 전반적인 개념들을 이해하고자 추가적으로 학습하게 되었다.

### 전체 구조

```
.
├── Dashboard
├── Infrastructure/
│   ├── Host
│   ├── Container
│   └── Kubernetes /
│       ├── Cluster
│       ├── Nodes
│       └── Pods
├── Database/
│   ├── Top Query
│   └── Long Session
├── APM/
│   ├── Service
│   └── Trace
├── Log/
│   └── Live
├── Alert/
│   ├── Rule List
│   └── History
└── Agent
```

E2E 테스트를 구축하면서 경험하였던 클라우드 모니터링 솔루션의 전반적인 구조는 다음과 같았다.

### Dashboard

사용자에게 시각적인 인터페이스를 제공하여 클라우드 환경 전반의 상태를 한눈에 파악할 수 있게 해준다.

Agent에서 수집한 성능 지표들은 Widget이라는 컴포넌트로 구성되어 있고, 사용자가 하나의 Dashboard 내에 여러 개의 Widget을 배치하면서 생성/관리할 수 있다.

---

### Infrastructure

Host, Container, Kubernetes 등 다양한 인프라 구성 요소의 성능에 대해 추적한다.

#### Host

물리적 또는 가상 서버의 성능 및 상태를 모니터링한다. CPU, 메모리 사용량, 디스크 I/O 등의 지표를 통해 서버의 상태를 확인한다.

#### Container

Docker와 같은 컨테이너화된 환경의 성능과 상태를 모니터링한다. CPU 및 메모리 사용량, 특정 시간 단위 Container 네트워크 평균 송/수신량, Container에서 읽고 쓰는 byte 수 등을 측정한다.

#### Kubernetes

Cluster, Nodes, Pods의 상태와 성능을 모니터링 한다. 쿠버네티스 환경에서의 자원 할당, 스케일링, 장애 관리 등을 위한 정보를 제공한다.

---

### Database

대표적인 PostgreSQL, MariaDB, MySQL등의 데이터베이스의 성능을 모니터링한다.

#### Top Query

특정 시간 단위, 상위 Query 목록을 조회할 수 있다.

#### Long Session

데이터베이스의 성능 지표를 추적하고, 대표적으로 가장 많은 리소스를 사용하는 쿼리를 식별하여 최적화하는 Top Query와 데이터베이스에 오래 지속되는 세션을 감지하여 성능 저하의 원인을 찾는 Long Session으로 구성되었다.

---

### APM(Application Performance Monitoring)

![](https://velog.velcdn.com/images/dlehddnr99/post/93ab6570-d18b-45d7-a577-2040467851d6/image.png)

애플리케이션 성능을 모니터링하고 문제를 해결하는 프로세스이다.

Trace와 Span을 사용하여 애플리케이션의 성능에 영향을 미치는 요소들을 파악하고 해결하도록 한다.

#### Trace

애플리케이션의 성능을 추적하는 데 사용되는 개체로, 하나의 호출 스택에 여러 개의 Span이 포함된다.

#### Service

특정 시간 단, Trace Agent에서 수집되는 Span 정보를 표시한다. Span의 경우, 애플리케이션의 성능 추적하는 데 사용되는 단위이다.

---

### Log

시스템, 애플리케이션, 보안 로그를 수집하고 분석하여 상태와 이벤트를 기록한다.

---

### Alert

#### Rule-based Alerts (규칙 기반 알림)

특정 성능 지표가 설정한 임계값을 초과할 시, 알림을 받도록 설정할 수 있는 규칙이다.

#### Notification Channels (알림 채널)

알림 발생 시, 이메일, Slack 등의 메신저를 활용하여 사용자에게 즉각적인 알림을 제공한다.

---

### Agent

서버나 컨테이너에서 운영 체제 및 애플리케이션의 성능 지표를 주기적으로 수집하고, 수집된 데이터는 분석과 모니터링을 하기 위해 클라우드 모니터링 시스템으로 전송된다.

---

#### 참고 문헌

[DataSaker 공식문서](https://docs.datasaker.io/)

[APM이란 무엇인가 - wallarm 공식문서]
(https://www.wallarm.com/what/what-is-application-performance-monitoring-apm)
