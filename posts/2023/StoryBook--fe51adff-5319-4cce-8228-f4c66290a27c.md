---
title: "[StoryBook] StoryBook 초기 설정 및 Chromatic 으로 배포하기"
slug: StoryBook
velogId: fe51adff-5319-4cce-8228-f4c66290a27c
publishedAt: "2023-11-21T02:27:13.425Z"
updatedAt: "2026-10-02T21:08:36.642Z"
tags:
  - React
  - chromatic
  - deploy
  - storybook
  - unit test
source: "https://velog.io/@dlehddnr99/StoryBook"
---

### Unit Test

가장 작은 범위의 테스트 중 하나로, `기능, 메소드` 등의 모듈을 기준으로 진행되는 테스트입니다.

새로운 기능들을 개발하면서, Unit Test 스크립트를 같이 작성한다면 보다 작은 범위에서 테스트를 빠르게 수행할 수 있는 이점이 있고, 추후에 코드를 리팩토링 할 때도 변경되는 부분에 관하여 Context를 빠르게 파악하는 데 도움이 될 수 있습니다.

<hr />

### StoryBook

![](https://velog.velcdn.com/images/dlehddnr99/post/fe1d8b0d-5662-48da-99d7-a51a740dcb72/image.png)

Components 기반으로 UI를 구축하고 테스트 할 수 있게 해주는 환경을 제공하며, 시각적인 테스트를 도와주는 도구입니다.

#### 초기설정

1. `yarn dlx storybook@latest init`

   storybook의 dependency를 추가합니다

2. `package.json`를

   ```ts
     "scripts": {
        ...
        "storybook" : "storybook dev -p 6006",
        "build-storybook" : "storybook build",
        ...
     }
   ```

   다음과 같이 설정합니다.
   `build-storybook` 의 경우, `Storybook`을 배포하기 위한 과정에 사용됩니다.

3. `yarn storybook`을 통해 기본적으로 설정한 6006 포트에서 실행할 수 있습니다.

<hr />

### Chromatic

클라우드 기반 Storybook을 위한 toolchain이며,
Storybook의 배포, CI 환경 제공을 통해 팀 내 협업을 도와주는 도구입니다.

![](https://velog.velcdn.com/images/dlehddnr99/post/72277dbf-1c26-4afb-9e67-31b2be52c535/image.png)

`package.json` 에서 설정한 대로 `yarn build-storybook`을 통해 생성한 Storybook의 배포 준비 과정을 거쳤습니다.

#### 초기설정

1. Chromatic 사이트에 접속합니다. (https://www.chromatic.com/)

2. 계정을 생성하고, Storybook이 포함된 레포지토리를 import 합니다.

3. `yarn add --dev chromatic` : chromatic을 해당 레포지토리의 devDependencies에 추가합니다.

4. `npx chromatic --project-token=토큰` : Chromatic에서 제공하는 토큰을 입력하여 배포 과정을 진행합니다.

![](https://velog.velcdn.com/images/dlehddnr99/post/df40cc3a-74e5-4dee-bfdf-ca03b0cb8cfa/image.png)
