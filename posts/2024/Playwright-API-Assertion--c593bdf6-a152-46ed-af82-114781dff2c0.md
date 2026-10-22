---
title: Playwright를 활용한 API Response 테스트
slug: Playwright-API-Assertion
velogId: c593bdf6-a152-46ed-af82-114781dff2c0
publishedAt: "2024-01-22T16:06:56.333Z"
updatedAt: "2026-10-20T09:09:09.020Z"
tags:
  - API
  - S/W Test
  - playwright
source: "https://velog.io/@dlehddnr99/Playwright-API-Assertion"
---

### Intro

Playwright로 가장 많이 작성하였던 로직 중 하나는 API 응답 검증이었습니다.
E2E 테스트에서는 사용자가 특정 페이지에서 특정 작업을 원활히 수행할 수 있는지를 주로 검증하는데 이를 위해선 API 관련한 테스트는 거의 필연적이라고 생각합니다.

<hr />

### 구성 방법

보통 다음의 순서를 토대로 작성하였습니다.

> 1.  &nbsp;API 응답을 확인하기 위한 Promise 객체를 생성합니다.
> 2.  &nbsp;API 응답을 받을 수 있도록 특정 동작을 수행합니다. (ex : 페이지 이동 , 버튼 클릭 )
> 3.  &nbsp;API 응답이 도착하면 해당 응답을 변수에 저장합니다.
> 4.  &nbsp;저장된 API 응답의 상태를 확인합니다.
> 5.  &nbsp;API 응답에서 데이터를 추출합니다.
> 6.  &nbsp;추출한 데이터의 정합성을 검증합니다.

```ts
 const request = page.waitForResponse((res) => res.url().endsWith('URI'));

 특정 동작 실행!

 const response = await response;

 expect(response.status()).toEqual(200);

 const data = await response.json();

 expect(data).not.toBeNull();

```

**여기서 중요한 부분은 `특정 동작의 실행 부분`을 Promise 객체를 정의한 `request` 변수와 API 응답을 정의한 `response` 변수 사이에 두었다는 점입니다.**

<hr />

실제로 이 로직과 관련하여 동료로부터 **만약 특정 동작을 실행하는 로직이 길어진다면 가독성이 떨어질 수 있다** 라는 의견을 들었습니다.

저도 그 의견을 들었을 당시에는 `waitForResponse`의 정확한 동작 방식에 대해서는 알지 못했던 상태였어서 동료의 의견을 받아들여 다음과 같은 로직을 작성해봤습니다.

```ts
 특정 동작 실행!

 const request = page.waitForResponse((res) => res.url().endsWith('URI'));

 const response = await response;

 expect(response.status()).toEqual(200);

 const data = await response.json();

 expect(data).not.toBeNull();

```

가독성은 더 향상됐지만, 실제로 테스트를 해본 결과 수행시간이 초과되는 문제가 발생하였습니다.

**원인은 waitForResponse()는 비동기 함수이기 때문입니다.**

**특정 동작의 수행을 API 응답을 기다리는 Promise 객체보다 전방 선언하면, 테스트 수행 시 이미 도착한 API 응답을 나중에 계속 기다리기 때문에 시간 초과 문제가 발생하는 것이었습니다.**

<hr />

### 코드 예시

회사에서 실제로 작성하였던 방식을 적용하였고, 일부 내용들은 보안상의 이유로 생략하거나 각색하여 작성한 코드 예시입니다.

```ts
import { test, expect, type Page } from '@playwright/test';

test('클러스터 리스트 조회 테스트', async({ page } : {page : Page}) => {

  await test.step('1) API 응답 확인 ', async() => {
    const clusterListRequest = page.waitForResponse((res) => res.url().endsWith('클러스터 API URI');

    await page.goto('클러스터 리스트 조회 페이지 주소');

    const clusterListResponse = await clusterListRequest;

    expect(clusterListResponse.status()).toBeLessThan(400);

    const clusterList = await clusterListResponse.json();

    for (const cluster of clusterList) {
     	 expect(cluster).not.toBeNull();
    }

  })


  // 이하 생략

});
```

<hr />
