---
title: K8S - BI Visualization Library
slug: K8S-BI-Visualization-Library
velogId: 29474b4f-d700-4464-8a31-5c7e9d0eaa20
publishedAt: "2026-10-17T06:00:54.985Z"
updatedAt: "2026-10-22T06:11:58.531Z"
tags:
  - BI(Business Intelligence)
  - kubernetes
  - visualization
source: "https://velog.io/@dlehddnr99/K8S-BI-Visualization-Library"
---

### Intro

온프레미스 환경 내 사용을 위한, BI 제품의 프론트엔드 계층을 독립적으로 라이브러리화 작업을 진행해보고 있다.

사용자가 Dataset을 고르고, Dimension/Measure/Filter 등 옵션을 선택 시 차트가 생성되며, 설정 옵션은 대시보드에 저장하는 흐름이다.

실제로 기업체 내 네트워크 환경은 각기 다른 구성일 것이다. 그 중 가장 엄격한 케이스는, 외부로 나가는 경로가 하나도 없는 완전 폐쇄망이다.

윗 케이스의 경우, CDN 스크립트 하나, 웹 폰트 하나만 원격에서 불러와도 폐쇄망 내 화면 렌더링에 문제가 생길 수 있다.

### 검증 목표

1. **라이브러리 수준** : 빌드 산출물에서 원격 참조가 있는 탐색 / 외부 접속을 막은 브라우저로 실제 요청을 기록

2. **인프라** : 외부 Internet 접속이 없는 K8s 노드를 만들어 반입한 파일만으로 클러스터와 라이브러리를 적재

### 설계

#### 1. 라이브러리의 외부 반출 여부 확인

먼저 규칙을 다음과 같이 정해봤다.

- `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` 등 외부와의 통신에 용이한 객체를 직접 호출하지 않고, props로 데이터를 받는다.
- 폰트 또한 원격에서 호출하지 않으며, 호스트 앱에서 상속을 받는다.
- 외부 지도 / 타일 API와 CDN을 참조하지 않는다. (Storybook 내 동일 설정)

먼저 **정적 스캔**을 진행하였다.

빌드 산출물 `dist`와 `storybook-static`에서 `https?://` 문자열과 `@font-face`를 발견하였고, 특히 `dist` 내 URL은 zod의 JSON Schema 식별자 (`json-schema.org/draft-...`)로 구성이 되어 있었다. 이는 접속 주소 자체라기보단 스키마를 구분하는 문자열이다.

Storybook에는 SVG 네임스페이스와 문서 링크가 다량 있었고, 폰트는 `/.sb-common-assets/`에 번들되어 있었다.

문자열이 있다고 요청을 보내는 것도 아니고, 문자열이 없다고 하여 요청을 보내지 않는다는 보장이 없다고 조사하였다. URL을 런타임 환경에서 연결시킨다면 정적 스캔에서 확인을 할 수가 없다.

**차단된 브라우저로 실제 요청 기록**

--host-resolver-rules 옵션으로 localhost를 제외한 모든 호스트의 이름 조회를 실패 상태로 만들었다.

이후, Network.requestWillbeSent 이벤트로 페이지가 시도한 요청을 전부 수집하였다.

```bash
chrome --headless = new \
	--host-resolver-rules="MAP * -NOTFOUND, EXCLUDE locahost, EXCLUDE 127.0.0.1" \
    --disable-background-networking --disable-component-update
```

검증 결과 외부 요청 자체는 0건으로 측정이 되었으나, 아직 이 부분을 완전한 폐쇄망이라고 정의하기에는 힘들었다. 서버는 여전히 인터넷이 접속되는 노트북 환경이고, 라이브러리를 빌드하고 서빙, 배포하는 과정에서도 인터넷의 필요 여부 등 조건을 알 수는 없었다.

### 2. 폐쇄망 구축

![](https://velog.velcdn.com/images/dlehddnr99/post/1fe3100e-f17a-4a73-975d-272a10700c8b/image.png)

이전에 Mac 환경에서 Multipass VM 3대에 Kubeadm, Calico, MetalLB, Envoy Gateway를 적재한 온프레미스 K8s 클러스터를 구축한 경험이 있다. (참고 레포 : https://github.com/Lee-Dongwook/OnPrem_Infa_Simulation)

설치 당시에는 Github에서 manifest를 받고 공개 레지스트리에서 이미지를 받았기 때문에, 설치 이후 외부를 끊는다 하더라도 설치 절차가 폐쇄망에서 통하지는 검증할 수가 없는 한계가 있었다.

그래서 이번에는 구조부터 조금 다르게 잡아봤다. 실제 고객사 반입 절차를 따른다고 생각을 하고,

`airgap-stage` VM과 `airgap-node` VM을 Ubuntu 24.04 이미지로 만들어,

airgap-stage는 필요한 파일을 번들 하나로 모으는 인터넷망 PC,
airgap-node는 번들만으로 k8s와 앱을 설치하는 폐쇄망 서버 역할을 수행하도록 배선했다.

#### 부팅

VM을 띄운 뒤 방화벽을 두는 방식에는 허점이 있다고 조사하였다. `snapd`나 `apt`타이머가 이미 외부로 나갈 수 있는 가능성 때문이다.

```bash
table inet airgap {
	set allowed {
    	type ipv4_addr; flags interval
        elements = { 127.0.0.0/8, $subnet, 10.244.0.0/16, 10.96.0.0/12 }
    }

    chain blocked {
    	limit rate 30/minute log prefix "airgap-drop "
        counter drop
    }

    chain egress {
    	oifname "lo" accept
        ct state established,related accept
        udp dport 67 accept
        ip daddr $gw goto blocked
        ip daddr @allowed accept
        meta l4proto ipv6-icmp ip6 daddr { fe80::/10, ff02::/16 } accept
        goto blocked

     }

     chain output  { type filter hook output  priority -10; jump egress; }
  chain forward { type filter hook forward priority -10; jump egress; }

}

```

_솔직히 처음 접하는 내용이다보니 조금 부실한 설정이라고 볼 수도 있다..._

윗 nfttables 규칙은 다음을 의미한다.

- 허용 대역 : VM 서브넷, Pod CIDR(10.244.0.0/16), Service CIDR(10.96.0.0/12)
- **호스트 게이트웨이는 같은 서브넷이어도 막음** - 게이트웨이가 인터넷 NAT와 DNS를 담당하기 때문, 단 IP 임대를 갱신하는 부분과 관련한 DHCP(67번) 포트는 예외로 열어둔다.
- **호스트에서 들어오는 연결을 막진 않았다.** - SSH와 파일 반입이 이 부분에 해당하며, 응답 패킷은 established로 통과한다.
- **forward 체인** - Pod에서 나가는 트래픽을 output이 아닌 forward를 거치도록.
- 막힌 패킷은 로그로 남김.

#### 반입 번들 / 오프라인 설치

폐쇄망에 들어간 497MB 크기의 `bundle.tgz` - 이를 인터넷이 되는 VM (`airgap-stage`) 에서 생성하고, 호스트를 거쳐 폐쇄망 노드로 옮겼다.

사용한 스펙은 다음과 같다.

| 항목         | 내용                                                                      | 크기  |
| ------------ | ------------------------------------------------------------------------- | ----- |
| deb          | containerd 2.2.1, runc, kubelet, kubeadm, kubectl 1.34.12, kubernetes-cni | 6개   |
| k8s.tar      | kube-apiserver 등 kubeadm 이미지, etcd, coredns, pause                    | 118MB |
| calico.tar   | calico/node, cni, kube-controllers v3.30.0                                | 254MB |
| registry.tar | registry:2.8.3                                                            | 9.3MB |
| viz-kit.tar  | nginx + Storybook 정적 파일 등                                            | 24MB  |
| manifest     | Pod CIDR을 바꾼 `calico.yaml`                                             |       |

부트스트랩 이미지 (k8s, Calico, registry) : `ctr -n k8s.io images import`로 containerd에 직접 넣는다. 클러스터가 활성화되기 전 레지스트리도 띄울수가 없었다.

워크로드 이미지 (viz-kit) : 클러스터 내부에 띄운 내부 레지스트리(`registry.airgap.local:5000`) 에 적재한 뒤 kubelet이 이를 통해서 내용을 전달받도록 한다.

### 3. TroubleShoot

K8s에 아직 익숙치 않다보니, 시행착오를 겪었었다. 그중 명확하게 알게 된 부분을 기술해본다.

#### containerd 2.2가 hosts.toml을 무시하는 문제

기본적으로 Kubernetes 환경을 구축하거나 Air-gapped 환경에서 이미지를 내려 받을 경우, 내부 레지스트리가 HTTP를 사용한다면, `certs.d` 설정을 통해 HTTPS 강제 접속을 막아야한다.

```bash
failed to do request: Head "https://registry.airgap.local:5000/v2/viz-kit/manifests/0.1.0":
http: server gave HTTP response to HTTPS client

```

문제는 `/etc/containerd/certs.d/registry.airgap.local:5000/host.toml` 에 HTTP 설정을 명시하였는데도, containerd가 계속 HTTPS로 접속을 시도하면서 윗 에러를 발생시켰다.

혹시나 hosts.toml 설정이 잘못되었나 확인을 위해서,

```bash
ctr images pull --hosts-dir /etc/containerd/certs.d registry.airgap.local:5000/my-image:latest
```

ctr 명령어로 직접 테스트를 수행했을때는 정상적으로 이미지를 잘 받아왔다는 성공의 상태를 보여줬다. `hosts.toml` 파일 자체에서는 문제가 없는듯 하였다.

그렇다면, Container Runtime Interface가 이미지 다운로드 시 Transfer 서비스를 사용하다보니 그 부분에서의 설정이 잘못되어 문제가 생기나 생각되어

Transfer 플러그인의 설정 파일에서 빈 값이던 `config_path`를 명시적으로 설정해봤으나, 여전히 같은 오류가 사라지진 않았다.

한참을 디버깅 해보니, CRI의 `config_path` 쪽에서 문제를 일으키는 부분은 맞았다.

> 콜론으로 구분된 다중 경로 지원 방식이나 순서 처리 과정에서 containerd의 레지스트리 인증서 경로 탐색 로직에 누락이나 버그가 있었을 것으로 추정됩니다.

Ubuntu 환경 containerd 2.2.1의 기본 설정값은 config_path에 두 경로를 콜론(:)으로 이어 붙여 사용하고 있었다.

`config_path = '/etc/containerd/certs.d:/etc/docker/certs.d'`

근데 이 부분을 단일 경로로 수정하니, 드디어 레지스트리에서 이미지를 정상적으로 받아오기 시작했다.

`config_path = '/etc/containerd/certs.d'`

### Conclusion

네트워크 / 데이터 통신 관련 영역을 다시금 학습해야겠다는 생각이 절실히 들었다. 코드 레벨에서 발생하는 문제도 있겠지만 인터넷 사용을 전제하는 도구들 (kubeadm 버전 조회, containerd 레지스트리 설정, OS DNS 등등)이 병목을 일으키는 케이스를 발견해본거 같다.

구축을 하고, 검증을 해보며 이번 구성 자체에도 한계가 있음을 새로 알게 되었다.

- 아직 워커 조인, MetalLB, Gateway 등 멀티 노드 구성 시 반입 절차를 검증해보질 않음.
- 내부 DNS, NTP, apt 미러가 없음 (실제 폐쇄망에선 기본적으로 구성 되어 있다고 함.)
- 내부 레지스트리는 TLS와 인증 없이 평문 HTTP로만 수행한 한계

다음에는 좀 더 유사하게 사내 폐쇄망 환경을 경험해보기 위한 준비 과정을 해보고자 한다.
