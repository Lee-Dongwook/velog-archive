---
title: Playwright
slug: Testing-Tool-Playwright
velogId: b58df4bf-0123-4bb9-8879-bd6e5e9280c2
publishedAt: "2023-12-28T18:39:38.696Z"
updatedAt: "2026-10-17T18:07:12.843Z"
tags:
  - S/W Test
  - e2e-test
  - playwright
source: "https://velog.io/@dlehddnr99/Testing-Tool-Playwright"
---

### Intro

서비스의 규모가 확장되면서, 품질 높은 서비스를 사용자들에게 제공하고자 테스트 설계 과정이 점차 중시되고 있습니다. IT 회사에서 프론트엔드 인턴으로 근무하면서 이를 실감하였고, Playwright 자동화 도구를 이용하여 E2E 테스트 자동화 구축을 한 경험이 있습니다. 오늘은 사용자 경험을 최우선으로 고려하는 `E2E 테스트` 와 `Playwright` 에 대해서 알아보고자 합니다.

### E2E(End-To-End) Test

![](https://velog.velcdn.com/images/dlehddnr99/post/8a134ad3-b55f-45e9-901b-257399f5430b/image.png)

사용자의 관점에서 애플리케이션의 전체적인 흐름을 테스트하는 S/W Test 방식 중 하나입니다.

예를 들어, 학생이 학교 홈페이지에서 본인의 성적을 조회하는 과정을 E2E 테스트로 설계한다면 다음과 같습니다.

> 1. 학교 홈페이지에 접속하여 로그인을 진행합니다.
> 2. 상단 메뉴에 위치하는 `강의실` 버튼을 클릭합니다.
> 3. 좌단 메뉴에 위치하는 `성적 정보 > 전체 성적 조회` 버튼을 클릭합니다.
> 4. 학생은 본인이 현재까지 받은 성적의 전체 정보를 열람하게 됩니다.

`E2E Test` 목적은 실제 사용자 환경에서 전체 시스템이 원활하게 동작하는 지 확인하는 것입니다. 개별 컴포넌트의 작동을 검증하는 `Unit Test`나, 애플리케이션 내부 각 요소들의 상호작용을 검증하는 `Integration Test`보다 더욱 포괄적인 테스트를 수행합니다. 구조가 복잡하고 수행시간이 상대적으로 느린 점이 있지만, 실제 사용자의 행동과 가장 가깝고 시스템의 연계성을 확인하기에 적합한 테스트입니다.

### Playwright

![](https://velog.velcdn.com/images/dlehddnr99/post/a52124e2-a633-4945-aefb-67588279f715/image.png)

`playwright`는 Microsoft사에서 개발한 브라우저 테스트 및 웹 스크래핑용 오픈소스 자동화 라이브러리입니다.

공식문서에서는 playwright를 다음과 같이 소개합니다.

> 1. Cross-browser/Platform/Language (크로스 브라우저/플랫폼/언어)
> 2. Resilient (회복력 있는)
> 3. No trade-offs / No limit (트레이드 오프와 한계가 없는)
> 4. Fast Execution (빠른 실행)
> 5. Powerful Tooling (강력한 도구)

playwright는 Chromium(크롬)/Firefox/Webkit 등의 여러 브라우저를 지원하고, Windows/MacOS/Linux 등 다양한 플랫폼에서 실행 가능하며, JavaScript/TypeScript/Python/C# 등의 다양한 언어를 지원합니다.

또한, playwright로 작성한 테스트 스크립트를 실행할 때 네트워크 문제나 요소가 로딩되지 않는 상황이 발생하여도 자동으로 재시도 및 재연결 메커니즘을 제공하기 때문에 테스트의 안정성을 보장합니다.

다른 일부 도구들은 사용자가 해당 도구들을 사용 시, 성능면이나 다른 기능에 제약이 생길 수 있습니다. 그러나 Playwright는 브라우저 자동화를 실행하여도 성능면에서 제한이 거의 없고, 사용자가 다른 기능을 실행하는 데 지장을 주지 않습니다.

여러 개의 테스트 스크립트들을 실행할 때, Playwright는 병렬 실행/ 헤드리스 모드를 지원하여 실행 속도를 빠르게 합니다.

마지막으로, 스크린샷/비디오 녹화(UI모드)/Codegen 등의 다양한 디버깅 관련 도구들을 제공해주어 사용자가 테스트 결과를 시각화하고 분석하는 데 도움을 줍니다.

<hr />

### 코드 예시

```ts
import { test, expect, type Page } from "@playwright/test";

test("로그인 실행", async ({ page }: { page: Page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*login/);

  await page.goto("/login");

  await page.getByPlaceholder("Enter email account").click();
  await page
    .getByPlaceholder("Enter email account")
    .fill(process.env.USER_ACCOUNT ?? "");
  await page.getByPlaceholder("Enter email account").press("Tab");
  await page
    .getByPlaceholder("Enter password")
    .fill(process.env.USER_PASSWORD ?? "");

  await page.getByRole("button", { name: "Login" }).waitFor();
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForFunction(() => {
    return localStorage.getItem("accessToken") !== null;
  });

  await page.context().storageState({ path: STORAGE_STATE });
});
```

다음 코드는 Playwright를 사용하여 실제 작성하였던 테스트 스크립트의 일부입니다.
개인적인 생각으로는, JavaScript의 비동기 실행 방식에 사용되는 async/await를 그대로 적용할 수 있어서 테스트 스크립트를 작성할 때 수월하였던 것 같습니다.

### Conclusion

playwright를 사용한 빠르고 안정적인 자동화 테스팅으로 기존 검증 수행 시간을 10배 이상 단축시켰습니다. 또한, 개발 과정에서 발생할 수 있는 오류를 조기에 검출하여 수정함으로써 안정성 또한 확보할 수 있었습니다.

<hr />

참고 문헌

https://playwright.dev/ (playwright 공식 문서)

https://medium.com/delivus/e2e-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EA%B5%AC%EC%B6%95%EA%B8%B0-used-aws-step-functions-2fccb930218c

https://betterprogramming.pub/the-test-pyramid-80d77535573 (사진 출처)
