---
title: >-
  [TroubleShoot] Webpack < 5 used to include polyfills for node.js core modules
  by default.
slug: Webpack-5-Polyfill
velogId: 9d8ed575-6e99-4063-bcc1-f35c81c30550
publishedAt: "2024-01-22T04:32:34.229Z"
updatedAt: "2026-10-17T00:45:39.031Z"
tags:
  - polyfill
  - react scripts
  - v5
  - webpack
source: "https://velog.io/@dlehddnr99/Webpack-5-Polyfill"
---

## Intro

![](https://velog.velcdn.com/images/dlehddnr99/post/b20f233f-16b6-4931-b28b-680708be5b18/image.png)

오랜만에 CRA로 React 프로젝트를 만들고 실행하는 과정에서 다음의 오류가 발생하였습니다.

문제를 해결하고 난 후 내용을 잊어버리지 않고자 간단하게 PR을 작성했었는데,

오늘은 이 내용과 관련하여 글을 올리고자 합니다.

<hr />

## 문제 발생 원인

![](https://velog.velcdn.com/images/dlehddnr99/post/5a60b6ff-9fce-4cca-9062-bd9f8a5762c2/image.png)

간단하게 남긴 PR의 내용에서도 확인 할 수 있듯이, react-scripts와 webpack의 버전과 관련된 문제였습니다.

react-scripts 버전 5부터는 기본적으로 webpack 버전 5를 활용한다고 합니다.

webpack의 이전 버전들은 자동적으로 polyfill을 주입해줘왔지만, 버전 5부터는 직접 주입을 해야하는 사실을 알게 되었습니다.

<hr />

## 해결 과정

### 1. react-app-rewired 설치

`react-app-rewired`를 사용하여 Webpack 설정을 직접 수정하고자 하였습니다.

> pnpm install react-app-rewired

### 2. 루트 폴더에 config-overrides.js 파일 생성

오류가 발생한 부분과 관련한 Webpack 설정을 변경하였습니다.

path, os, crypto, stream, buffer 모듈들을 브라우저 환경에서 사용 가능하도록 각각의 의존성을 설치한 후, `config.resolve.fallback` 을 통해 지정하였습니다.

```js
module.exports = function override(config) {
  config.resolve.fallback = {
    path: require.resolve("path-browserify"),
    os: require.resolve("os-browserify"),
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer"),
  };
  return config;
};
```

### 3. package.json 파일에서 react-app-rewired 사용을 할 수 있게 scripts 부분 수정

마지막으로 package.json의 script 설정을 변경하여 react-app-rewired를 활용한 프로그램 실행이 가능하도록 하였습니다.

```json
"scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
    "eject": "react-app-rewired eject"
  },

```

<hr />

### Conclusion

보통 처음에 React App을 실행할 때, CRA(Create React App)을 많이 사용했었습니다.

CRA는 필요한 부분을 자동으로 구성해주기 때문에 편리하다는 장점이 있지만, 사용자가 더 세부적인 설정을 변경하기 어렵다는 단점도 존재합니다.
