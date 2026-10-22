---
title: "[ Next.js ] Vercel Blob 활용하여 비디오 파일 배포하기"
slug: Next.js-Vercel-Blob-활용하여-비디오-파일-배포하기
velogId: decbb806-f094-47c3-89c1-8fd0bba29f74
publishedAt: "2024-12-03T05:25:08.280Z"
updatedAt: "2026-10-21T12:39:51.631Z"
tags:
  - Vercel
  - Vercel Blob
  - next.js
  - video
source: "https://velog.io/@dlehddnr99/Next.js-Vercel-Blob-활용하여-비디오-파일-배포하기"
---

### Intro

회사 프로젝트를 수행하면서 동영상 파일을 백그라운드에 집어넣어야 하는 상황이 있었다. 크기가 1.3MB밖에 되지 않는 짧은 길이의 영상이라 `assets/` 폴더에 직접 넣어도 무방하지만 권장하지 않는 방법이라고 한다. 그렇다고 AWS S3 버킷에 넣기에는 과도한 설정인거 같아서 다른 방법을 생각해본 결과 `Vercel Blob`를 활용하면 되었다.

### Vercel Blob

Vercel에서 제공하는 이미지, 동영상, 오디오 파일 등 정적 자산을 위한 확장 가능하고 비용 효율적인 객체 스토리지 서비스이다.

https://vercel.com/docs/storage/vercel-blob

![](https://velog.velcdn.com/images/dlehddnr99/post/7cf5f932-968d-4fd5-8ad7-701d7ffa4710/image.png)

빌드 시점에 프로그래밍 방식으로 업로드되거나 생성되는 스크린샷, 아바타, 커버 이미지 및 동영상과 같은 파일, 그리고 글로벌 네트워크를 활용하기 위한 동영상 및 오디오 파일을 주로 저장하며, AWS S3와 같은 외부 파일 스토리지보다 Vercel에 호스팅된 프로젝트에서 더 쉽게 접근하고 관리할 수 있는 특징이 있다.

### 적용과정

프로젝트에서는 직접 동영상 파일을 Vercel Blob에 저장하여 주소를 얻어내는 방식으로 구현하였다. 그러나, Vercel에서 제공하는 방식도 한번 적용해보고자 하였다.

먼저 `app/api/videos/route.ts` 에 Blob 스토리지에 파일을 업로드하는 과정을 작성하였다. `fs` 모듈로 파일 스트림을 생성하여 `put` 메서드를 통해 Vercel Blob에 동영상을 업로드하고, 업로드 시 동영상 정적 파일을 빠르게 제공하기 위해 `access: 'public'` 옵션을 설정해 누구나 접근할 수 있는 공개 URL을 생성하였다.

```ts
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";
import fs from "fs";

export async function PUT() {
  try {
    const videoPath = path.join(
      process.cwd(),
      "public/videos/sample-video.mp4",
    );
    const stream = fs.createReadStream(videoPath);

    const { url } = await put("videos/sample-video.mp4", stream, {
      access: "public",
      contentType: "video/mp4",
    });

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("Error uploading video:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
```

Blob 스토리지에 저장된 비디오를 불러오는 video-proxy API를 만들었는데 다음과 같다.
`fetch()` 함수를 사용하여 비디오 데이터를 가져와 `response.body`에 비디오 스트림을 전달하며 서버로의 과도한 호출을 방지하기 위해 캐싱 설정을 하였다.

구체적인 캐시 설정을 다음과 같이 하였다.
`max-age=3600`으로 클라이언트가 로컬 캐시에 데이터를 1시간 가량 유지할 수 있도록 설정하였고,
`s-maxage=86400`으로 CDN에서 캐시를 24시간 동안 유지하도록 하였으며,
`immutable` 옵션을 지정하여 데이터가 변경되지 않음을 명시하여 브라우저가 이 파일을 다시 가져오지 않도록 설정하였다.

```ts
import { NextRequest, NextResponse } from "next/server";

const videoUrl = "비디오 주소";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(videoUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch the video",
        },
        { status: response.status },
      );
    }

    const videoStream = response.body;

    return new NextResponse(videoStream, {
      headers: {
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, immutable", // 캐싱 설정
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
```

이제 이 video-proxy API를 이용해서 `<video/>` 태그에 적용시키는 과정이다.

```ts
'use client';

import React, { useEffect, useState } from 'react';

// 생략 ...

const MainHeroOrganism = () => {

  // 생략 ...

  const [videoSrc, setVideoSrc] = useState<string | null>();

  useEffect(() => {
    fetch('/api/video-proxy')
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setVideoSrc(url);
      })
      .catch((error) => console.error(error));
  });

  return (
    <section className={`relative bg-black/60 text-center ${paddingClass}`}>
      {videoSrc && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

	//생략 ...
    </section>
  );
};

export default MainHeroOrganism;

```

### 적용 결과

https://healthpedia-hompage.vercel.app

![](https://velog.velcdn.com/images/dlehddnr99/post/12230161-c38e-4b4d-bf5a-e9a5b52c0481/image.png)
