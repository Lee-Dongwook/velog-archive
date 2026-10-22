---
title: "[ Next.js ] IndexedDB를 활용하여 비디오 파일 캐싱하여 여러 컴포넌트에 적용하기"
slug: Next.js-IndexedDB를-활용하여-비디오-파일-캐싱하여-여러-컴포넌트에-적용하기
velogId: 4183ebda-4e9a-41f6-90ce-2016d5321877
publishedAt: "2024-12-04T01:08:16.019Z"
updatedAt: "2026-10-21T12:50:54.212Z"
tags:
  - indexedDB
  - next.js
  - video
source: "https://velog.io/@dlehddnr99/Next.js-IndexedDB를-활용하여-비디오-파일-캐싱하여-여러-컴포넌트에-적용하기"
---

### Intro

저번 시간에 video-proxy API를 만들어 Vercel Blob에 저장된 비디오를 가져오는 로직을 구현하였다. 기획에 따라 여러 컴포넌트에서 동영상을 렌더링해야 하는 경우가 생겼고, 그때마다 동영상을 호출하는 과정을 줄이고자 IndexedDB에 동영상 파일을 저장하기로 하였다.

### IndexedDB

IndexedDB란 브라우저에서 제공하는 비동기 NoSQL 데이터베이스이다.

localStorage보다 훨씬 많은 데이터를 다룰 수 있으며, 구조화된 데이터를 효율적으로 저장하고 검색할 수 있도록 되어 있다.

특히 비동기로 작동하여 애플리케이션의 성능에 영향을 주지 않으며, 네트워크 연결이 없어도 저장된 데이터를 사용할 수 있는 장점이 있다.

### 적용 과정

우선 `lib/videoCache.ts`를 작성하였다.

idb 라이브러리를 사용하여 `VideoCacheDB`라는 데이터베이스와 `video`라는 객체 저장소를 생성한다.

`fetchAndCacheVideo` 함수는 URL을 키 값으로 사용하여 IndexedDB에서 동영상 데이터를 조회하고, 캐시 유효기간 (1시간으로 지정) 내 데이터가 있으면 반환한다.

만약 캐시가 없거나 만료된 경우 새로운 데이터를 가져와 blob와 현재 타임스탬프를 IndexedDB로 저장하고

저장된 Blob 객체를 `URL.createObjectURL`로 변환하여 `<video>` 태그에 사용할 수 있도록 URL을 반환한다.

```ts
import { openDB } from "idb";

const DB_NAME = "VideoCacheDB";
const STORE_NAME = "videos";
const CACHE_EXPIRATION = 3600 * 1000;

interface CachedVideo {
  blob: Blob;
  timestamp: number;
}

async function initDB() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function fetchAndCacheVideo(url: string): Promise<string> {
  const db = await initDB();

  const cachedData = (await db.get(STORE_NAME, url)) satisfies
    | CachedVideo
    | undefined;

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
    return URL.createObjectURL(cachedData.blob);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${url}`);
  }

  const blob = await response.blob();

  const dataToCache: CachedVideo = { blob, timestamp: Date.now() };

  await db.put(STORE_NAME, dataToCache, url);

  return URL.createObjectURL(blob);
}
```

### 사용 예시

IndexedDB에 캐싱된 동영상을 로드하거나, 네트워크에서 가져와서 `useState`를 사용하여 videoSrc 상태 관리를 한다.

위 상태를 활용하여 `<video>` 태그를 통해 배경 동영상을 자동 재생 및 반복 재생하여 렌더링을 수행하였다.

```ts
'use client';

import React, { useEffect, useState } from 'react';

// 생략 ...

import { fetchAndCacheVideo } from '@/lib/videoCache';

const MainHeroOrganism = () => {

// 생략 ...

  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const paddingClass = isMobile || isMobileTablet ? 'p-10' : 'p-48';

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const cachedVideoUrl = await fetchAndCacheVideo('/api/video-proxy');
        setVideoSrc(cachedVideoUrl);
      } catch (error) {
        console.error('Failed to load video:', error);
      }
    };

    loadVideo();
  }, []);

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

  // 생략 ...

    </section>
  );
};

export default MainHeroOrganism;

```

### 결과

다음과 같이 Application 탭의 IndexedDB에 설정한 키-값이 저장된 형태를 확인할 수 있었다.

![](https://velog.velcdn.com/images/dlehddnr99/post/101a80d3-1d26-48b4-8b4f-d5d834fda510/image.png)
