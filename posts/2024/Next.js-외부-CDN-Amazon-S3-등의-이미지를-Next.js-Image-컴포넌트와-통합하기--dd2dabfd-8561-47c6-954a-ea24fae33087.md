---
title: "[ Next.js ] 외부 CDN (Amazon S3 등)의 이미지를 Next.js Image 컴포넌트와 통합하기"
slug: Next.js-외부-CDN-Amazon-S3-등의-이미지를-Next.js-Image-컴포넌트와-통합하기
velogId: dd2dabfd-8561-47c6-954a-ea24fae33087
publishedAt: "2024-12-02T03:18:02.040Z"
updatedAt: "2026-10-21T12:24:52.815Z"
tags:
  - Amazon S3
  - CDN
  - image
  - next.js
source: >-
  https://velog.io/@dlehddnr99/Next.js-외부-CDN-Amazon-S3-등의-이미지를-Next.js-Image-컴포넌트와-통합하기
---

### Intro

Next.js는 next/image에서 이미지 최적화 기능을 제공하여 애플리케이션의 성능을 향상시킬 수 있다. 하지만, 외부 CDN (Amazon S3 등)에서 이미지를 가져올 때는 별도의 설정이 필요하다. 회사 프로젝트를 진행하면서 대다수의 이미지 파일이 S3에 배포되어 있기 때문에 `remotePatterns`를 활용하여 외부 CDN 이미지를 Next.js 프로젝트에 통합하는 방법이 필요했다.

### AWS S3와 CloudFront 동작 방식

브라우저에서 외부 CDN(Amazon CloudFront)을 통해 Amazon S3에 저장된 이미지를 요청하는 과정은 다음과 같다.

![](https://velog.velcdn.com/images/dlehddnr99/post/51f9febe-6c20-4cb2-bdee-6f45c8de6e14/image.png)

먼저 브라우저가 DNS를 통해 CDN의 도메인 이름을 IP 주소로 변환한다.

변환된 주소로 CloudFront에 요청이 전달되면, 캐시에 이미지가 있을 경우 `Cache Hit`으로 즉시 브라우저에 응답을 한다.

만약 캐시에 이미지가 없을 경우 `Cache Miss`로 Amazon S3에서 이미지를 가져와 브라우저에 반환한다.

위 방식을 적용했을 때 장점으로는 다음과 같다.

**1. 이미지 요청 속도 최적화 **
**2. S3로의 직접적인 요청을 줄여 서버 비용 절감 가능 **
**3. CloudFront를 통한 안전한 데이터 제공 **

### Next.js Image

Next.js의 `next/image` 컴포넌트는 서버 사이드에서 이미지 크기를 조정하고 webp와 같은 포맷을 지원하며 더 빠른 로딩 속도를 제공하지만, 기본적으로는 로컬 이미지나 Next.js가 제어하는 URL에만 유효하다.

외부 이미지를 사용할 경우 next.config.js에서 remtePatterns를 별도로 지정하여 최적화를 허용하도록 구현해야 했다.

```js
/* eslint-disable no-undef */
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/media/contents_card/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/media/board_image/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/media/notice_image/**",
      },
    ],
  },

  // 이하 생략...
};

module.exports = nextConfig;
```

### 발생하였던 문제

위 과정을 적용하면서 2가지 문제가 발생했었다.

#### 1. 이미지가 로드되지 않음

원인을 알아보니 S3 버킷 정책에서 퍼블릭 읽기 권한 설정이 올바르게 되지 않았음을 확인했다.

S3 버킷이 외부에서 접근이 가능하도록 퍼블릭 읽기 권한을 설정하였고,

추가적으로 CloudFront를 통한 접근을 허용하고자 OAI를 설정하였다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront-user-id:~~~"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::~~~/*"
    }
  ]
}
```

#### 2. 로컬 개발 환경에서 느린 로딩

원인을 알아보니 S3의 위치와 브라우저 간 거리가 문제가 될 수 있다고 하였다.

이미지가 업데이트 되었을 때 CloudFront 캐시를 무효화하는 AWS CLI를 작성하였다.

또한 CloudFront 배포에서 캐싱 정책 (TTL)을 Maximum TTL로 지정하면서 성능 최적화를 하고자 하였다.

```bash

aws cloudfront create-invalidation \
  --distribution-id ~~~~ \
  --paths "/media/board_image/*"

```

### 결과

아래와 같이 응답하는 json에 대한 결과를 추출하여 화면에 보여줄 수 있게 되었다.

```json

{
            "id": 1,
            "title": "아프지마 앱 내 홈트레이닝 동영상 콘텐츠 제작 안내 요청",
            "link": "",
            "post_type": 1,
            "image": "https://afzima-s3-dev.s3.ap-northeast-2.amazonaws.com/media/board_image/~~~~",
            "thumb": "https://afzima-s3-dev.s3.ap-northeast-2.amazonaws.com/media/board_image/~~~~",
            "is_draft": false
        },

```

![](https://velog.velcdn.com/images/dlehddnr99/post/2d2010bf-f0f4-4b72-9c0e-9bed23c10fe0/image.png)
