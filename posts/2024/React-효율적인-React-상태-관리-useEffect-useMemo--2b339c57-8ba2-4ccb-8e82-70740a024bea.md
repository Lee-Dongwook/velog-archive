---
title: "[ React ] 효율적인 React 상태 관리 : useEffect ➝ useMemo"
slug: React-효율적인-React-상태-관리-useEffect-useMemo
velogId: 2b339c57-8ba2-4ccb-8e82-70740a024bea
publishedAt: "2024-12-02T12:44:32.507Z"
updatedAt: "2026-10-21T12:40:45.069Z"
tags:
  - Performance
  - React
  - useMemo
source: "https://velog.io/@dlehddnr99/React-효율적인-React-상태-관리-useEffect-useMemo"
---

### Intro

회사 프로젝트를 진행하면서 헤더의 드롭다운 부분 코드가 좀 수정이 필요함을 확인했다. 드롭다운을 렌더링하는 과정에서 불필요하게 `useEffect`를 호출하고 있어 렌더링 흐름에 맞지 않음을 발견하였고, `useMemo`를 활용하여 불필요한 렌더링을 방지하고자 했다.

### useMemo와 useEffect 실행 과정

![](https://velog.velcdn.com/images/dlehddnr99/post/831f61a4-8753-4cc9-8637-65d09c0e18b0/image.png)

useEffect의 경우 Initial Render -> Render DOM -> Render UI -> useEffect Execution 순으로 진행되며, 렌더링 이후에 실행되는 특징이 있다.

useMemo의 경우 Initial Render -> Render DOM -> useMemo Execution -> Render UI 순으로 진행되며, 렌더링 중에 실행되는 특징이 있다.

### 기존 코드

```ts
const dropdownRefs = useRef<{ [key: string]: RefObject<HTMLDivElement> }>({});

useEffect(() => {
  HeaderMenuItems.forEach((item) => {
    if (!dropdownRefs.current[item.key]) {
      dropdownRefs.current[item.key] = createRef<HTMLDivElement>();
    }
  });
}, []);

const refsArray = Object.keys(dropdownRefs.current).map(
  (key) => dropdownRefs.current[key],
);
```

기존 코드에서는`useEffect`가 렌더링 이후에 실행되어 `dropdownRefs`를 초기화하기 때문에 초기화 로직이 불필요한 렌더링 과정을 유발할 수 있는 문제가 있었다.

또한, dropdownRefs가 useRef로 선언되어 있어 초기화 시 객체를 직접 수정해야 하는 부분은 React의 선언형 프로그래밍 패러다임하고도 거리가 멀다고 한다.

### 수정한 코드

```ts
const dropdownRefs = useMemo(() => {
  return HeaderMenuItems.reduce(
    (acc, item) => {
      acc[item.key] = createRef<HTMLDivElement>();
      return acc;
    },
    {} as { [key: string]: RefObject<HTMLDivElement> },
  );
}, []);

const refsArray = Object.values(dropdownRefs);
```

수정한 코드에서는 우선 `useMemo`를 사용하여 불필요한 렌더링 과정을 해결하고자 하였다.
컴포넌트 렌더링 중에 dropdownRefs를 계산하기 때문에 초기화 로직을 간소화 할 수 있으면서도 불필요한 추가 렌더링을 방지할 수 있었다. 추가적으로 코드의 가독성과 유지보수성 역시 향상한 것 같다.

### 성능 향상 기대점

해당 로직의 변경을 통해서 특정 LightHouse 지표에서 개선 효과를 볼 수 있다고 한다.
프로젝트가 마감될 시기에 한번 더 측정을 해볼 예정이며, 우선 이번 변경을 통해 영향을 받을 수 있는 지표들은 다음과 같다.

#### 1. TTI (Time to Interactive)

useMemo로 렌더링 중에 dropdownRefs가 계산되기 때문에 초기화 작업이 렌더링 이후에 지연되지 않아 사용자가 더 빠르게 상호작용할 수 있는 상태에 도달한다.

#### 2. FCP (First Contentful Paint)

useMemo를 사용하여 초기화 작업이 렌더링 중에 완료되므로 페이지 콘텐츠가 더 빠르게 렌더링 되는데 기여할 수 있다.

#### 3. CLS (Cumulative Layout Shift)

useMemo를 사용하여 DOM 초기화를 렌더링 단계에서 완료하기 때문에 레이아웃 변경 가능성이 줄어든다.

#### 4. TBT (Total Blocking Time)

useMemo를 사용하면 렌더링 중에 초기화 작업이 완료되기 때문에 메인 스레드가 차단되는 시간이 준다.
