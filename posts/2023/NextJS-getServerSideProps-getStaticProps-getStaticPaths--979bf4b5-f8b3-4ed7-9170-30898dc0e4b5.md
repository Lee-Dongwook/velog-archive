---
title: "[ NextJS ] SSR / SSG / CSR"
slug: NextJS-getServerSideProps-getStaticProps-getStaticPaths
velogId: 979bf4b5-f8b3-4ed7-9170-30898dc0e4b5
publishedAt: "2023-12-24T09:53:16.907Z"
updatedAt: "2026-10-15T04:28:30.217Z"
tags:
  - CSR
  - React
  - SSR
  - nextjs
  - ssg
source: >-
  https://velog.io/@dlehddnr99/NextJS-getServerSideProps-getStaticProps-getStaticPaths
---

### Intro

Next.js를 학습하기 전, React 라이브러리를 사용해왔습니다. React 라이브러리는 SPA 기반 CSR 렌더링 방식을 지원하며 초기 로딩 속도가 빠르고, 빠른 페이지 전환 기능을 제공하는 특징이 있습니다.

### SSR (서버 사이드 렌더링)

> 웹 페이지를 서버에서 렌더링 한 후 클라이언트에 전달하는 방식

클라이언트가 요청하면, 서버에서 페이지를 동적으로 생성하여 완성된 형태를 반환합니다.

서버에서 데이터를 가져와 동적으로 페이지를 생성하기 때문에 사용자에게 항상 최신의 정보를 제공할 수 있습니다.

또한, 브라우저에 완성된 페이지 형태로 전달되기 때문에 검색 엔진들이 정보들을 쉽게 수집할 수 있어서 SEO에 유리합니다.

그러나, 초기 로딩 속도 측면에서는 다소 느릴 수 있는 단점이 있습니다.

```ts

import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';

interface Dongwook {
 	name: string
    age: number
    email: string
    phone: string
}

export const getServerSideProps = (async() => {
 	const response = await fetch('./data/Lee-Dongwook');
    const data: Dongwook =  await res.json();

    return {
      props: { data }
    }
}) satisfies GetServerSideProps<{ data: Dongwook }>

export default function InfoPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main>
      <p>{data.name}</p>
    </main>
  )
}
```

### SSG (정적 사이트 생성)

> 빌드 시점에 미리 페이지를 생성하여 정적 파일로 제공하는 방식

사전에 빌드된 정적 파일을 웹 서버에 배포하여, 클라이언트에게 정적 형태의 파일을 제공합니다.

정적 파일로 빌드 되기 때문에 서버 부하가 적고, 호스팅 비용 또한 낮아집니다.

초기 로딩 속도가 빠르며, CDN을 활용한 빠른 속도의 콘텐츠 전달이 가능합니다.

그러나, 동적인 콘텐츠에는 한계가 있는 단점이 있습니다.

```ts
import type { InferGetStaticPropsType, GetStaticProps } from 'next';

interface Dongwook {
 	name: string
    age: number
    email: string
    phone: string
}

export const getStaticProps = (async(context) => {
  const response = await fetch('./data/Lee-Dongwook');
  const data: Dongwook = await response.json();

  return {
    props: { data }
  }
}) satifies GetStaticProps<{ data: Dongwook }>


export default function InfoPage({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return data.name
}

```

### CSR (클라이언트 사이드 렌더링)

> 초기 로딩 시에는 빈 페이지가 표시되고 클라이언트에서 동적으로 콘텐츠를 렌더링 하는 방식

사용자가 페이지를 이동할 때마다 서버에 데이터를 요청하고, 필요한 부분만 동적으로 업데이트가 되므로 빠른 페이지 전환과 좋은 사용자 경험을 제공합니다.

클라이언트에서 JavaScript를 사용하여 동적으로 페이지를 렌더링하기 때문에, 초기 로딩 시 빈 페이지 혹은 최소한의 HTML만 존재합니다. 이는, 검색엔진의 정보 수집을 어렵게 하여 SEO에 취약하다는 단점을 가지게 합니다.

```ts
import { useState, useEffect } from 'react';

interface Dongwook {
  	name: string
    age: number
    email: string
    phone: string
}


function InfoPage() {
  const [data, setData] = useState<Dongwook| null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
	fetch('./data/Lee-Dongwook')
    .then((res) => res.json())
    .then((data) => {
      setData(data);
      setLoading(false);
    })
  }, [])

  if(isLoading) return <p>Loading...</p>
  if(!data) return <p>No Info Detail</p>

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.age}</p>
      ...
   	</div>
  )
}
```

### Conclusion

NextJS에서 제공하는 SSR / SSG / CSR 렌더링 방식에 대해 학습하며, 상황에 적절한 렌더링 방식을 사용하면 사용자에게 최적화된 웹 애플리케이션을 제공할 수 있다고 생각합니다.

<hr />

#### 참고 문헌

- [Next.js 공식문서](https://nextjs.org/)
- [서적] : 실전에서 바로 쓰는 Next.js (미셸 라바, 박수현)
