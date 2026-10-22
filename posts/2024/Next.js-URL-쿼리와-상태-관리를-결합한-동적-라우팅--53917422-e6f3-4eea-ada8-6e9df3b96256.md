---
title: "[ Next.js ] URL 쿼리와 상태 관리를 결합한 동적 라우팅"
slug: Next.js-URL-쿼리와-상태-관리를-결합한-동적-라우팅
velogId: 53917422-e6f3-4eea-ada8-6e9df3b96256
publishedAt: "2024-12-02T00:03:27.740Z"
updatedAt: "2026-10-21T14:46:50.511Z"
tags:
  - navigation
  - next.js
  - url
  - 동적 라우팅
  - 상태 관리
source: "https://velog.io/@dlehddnr99/Next.js-URL-쿼리와-상태-관리를-결합한-동적-라우팅"
---

### Intro

동적 라우팅은 현대 웹 애플리케이션에서 사용자 경험을 개선하고, 유지보수성을 높이는 데 자주 사용되는 기술 중 하나이다. 특히 Next.js에서는 파일 기반 라우팅 (App Router)을 제공하여 보다 쉽게 동적 라우팅을 구현할 수 있다.

URL 쿼리와 상태 관리를 결합하여 SEO 최적화 및 직관적인 URL 구조를 유지하면서 동적 라우팅 구현 과정에 대해서 작성하고자 한다.

### 동적 라우팅이란?

동적 라우팅은 URL의 일부를 동적으로 변경하여 다양한 페이지를 렌더링하는 기술이다.
특정 포스트의 ID에 따라 URL을 다르게 설정하고 해당 데이터를 렌더링함으로써 보다 유연한 페이지 구성이 가능하고, SEO 최적화에도 도움이 되는 기술이라고 할 수 있다.

#### 주요 이점

1. 유연한 페이지 구성 : ID, 이름, 필터와 같은 변수를 URL에 직접 반영할 수 있다.
2. SEO 최적화 : URL에 의미 있는 정보를 포함하므로 검색 엔진 친화적인 구조를 생성할 수 있다.
3. 북마크와 공유 가능성 : 사용자가 특정 상태를 URL로 저장하고 공유가 가능하다.

### Next.js에서 `useSearchParams`를 활용한 동적 라우팅

Next.js 13버전 이후부터는 App Router 구조를 통해 파일 기반 라우팅과 URL 쿼리 관리를 효율적으로 제공한다.

next/navigation에서 제공하는 `useSearchParams` 와 `useRouter` 훅을 사용하여 URL의 상태를 읽거나 변경하는 작업을 보다 간단하게 처리가 가능하다.

#### 1. useSearchParams

useSearchParams는 URL의 쿼리 파라미터를 읽을 수 있도록 도와주는 훅이다.

```ts
const searchParams = useSearchParams();
const queryCategory = searchParams.get("name"); // URL에서 'name' 파라미터를 읽는다.
```

React 컴포넌트 내에서 상태 관리 시, URL의 쿼리 파라미터를 동적으로 반영하고 싶을 때 유용하다.

현재 URL에서 특정 쿼리 값을 읽을 수 있고, URL이 변경되면 쿼리 값을 실시간으로 반영한다는 특징이 있다.

#### 2. useRouter

useRouter는 URL의 이동을 제어하는 훅으로, 동적 라우팅에서 필수적인 역할을 한다.

```ts
router.replace(`/service?name=${encodeURIComponent(selectedButtonName)}`, {
  scroll: false,
});
```

`push` 와 `replace` 메서드를 활용하여 사용자가 특정 동작을 트리거 하였을 때, URL을 동적으로 업데이트할 수 있는 기능을 제공한다.

`router.push` : 새 URL로 이동하며 브라우저 기록에 추가된다.
`router.replace` : 현재 URL을 새 URL로 교체하며 브라우저 기록에 추가되지 않는다.

### 동작방식 관련 간략한 순서도

1. URL 쿼리를 읽고 (useSearchParams),
2. dispatch로 Redux Store 상태를 업데이트 한다.
3. 상태가 변경되면 React Component에 반영된다.
4. router.replace를 통해 URL을 업데이트 한다.
5. 업데이트 된 URL은 상태와 동기화가 되어 사용자가 동일한 화면을 볼 수 있도록 동작한다.
   ![](https://velog.velcdn.com/images/dlehddnr99/post/3063af68-2d19-4ef5-a046-600a2d3c6b60/image.png)

### 프로젝트 내 일부 코드 적용 예시

```ts
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  setServiceHospitalCategory,
  setServiceMainCategory,
} from '@/store/slice/serviceCategorySlice';
import {
  ServiceSectionButtonName,
  ServiceHospitalCategorySchema,
} from '@/lib/ServiceSectionContentMapZodSchema';

const ServiceSectionOrganism = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [selectedButtonName, setSelectedButtonName] = useState('');
  const [selectedHospitalButtonName, setSelectedHospitalButtonName] = useState(
    '의료 관광 제휴 병원 모집'
  );

  useEffect(() => {
    const queryCategory = searchParams.get('name');
    if (queryCategory) {
      dispatch(setServiceMainCategory(queryCategory));
    }
  }, [searchParams, dispatch]);

  const handleClickButton = (buttonName: string) => {
    const newSelectedButtonName =
      selectedButtonName === buttonName ? '' : buttonName;
    setSelectedButtonName(newSelectedButtonName);
    dispatch(setServiceMainCategory(buttonName));

    router.replace(`/service?name=${encodeURIComponent(newSelectedButtonName)}`, {
      scroll: false,
    });
  };

  const handleClickHospitalButton = (buttonName: string) => {
    const newSelectedButtonName =
      selectedHospitalButtonName === buttonName ? '' : buttonName;
    setSelectedHospitalButtonName(newSelectedButtonName);
    dispatch(setServiceHospitalCategory(buttonName));

    router.replace(
      `/service?name=병원 제휴&subName=${encodeURIComponent(newSelectedButtonName)}`,
      { scroll: false }
    );
  };

  return (
    <div>
      {/* 생략 */}
    </div>
  );
};

export default ServiceSectionOrganism;

```
