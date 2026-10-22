---
title: requestAnimationFrame을 활용한 주사율 성능 평가 및 분석
slug: requestAnimationFrame을-활용한-주사율-성능-평가-및-분석-웹-애니메이션-성능-개선을-위한-기술적-고찰
velogId: 09e377d5-a2b9-42dd-b8e1-7aaaea26b256
publishedAt: "2024-03-07T07:26:36.344Z"
updatedAt: "2026-09-26T18:11:34.807Z"
tags: []
source: >-
  https://velog.io/@dlehddnr99/requestAnimationFrame을-활용한-주사율-성능-평가-및-분석-웹-애니메이션-성능-개선을-위한-기술적-고찰
---

### Intro

인턴으로 근무하면서 SVG 형식의 이미지 컴포넌트를 Canvas API를 활용하여 동적으로 변화하는 데이터에 따라 시각화하는 컴포넌트로 변경하는 업무를 맡게 되었습니다.

이를 위해 JavaScript의 requestAnimationFrame 함수를 사용하여 실시간 데이터의 변화에 따라 부드러운 애니메이션과 렌더링을 구현하고자 했고, 이전보다 생동감 있고 유연한 사용자 경험을 제공할 수 있었습니다.

requestAnimationFrame 함수에 대한 자세한 이해를 위해 추가적으로 알아보고자 합니다.

### 브라우저 렌더링 단계

> DOM, CSSOM 생성 → 렌더 트리 형성 → Layout → Paint → Composite

### setInterval, setTimeout의 한계점 ?

호출 스케줄링은 특정 함수를 일정 시간이 지난 후에 실행하도록 하는 방법입니다.

이를 구현하기 위해 일반적으로 Web API에서 제공하는 `setTimeout`과 `setInterval`을 활용합니다.

그러나, 이러한 스케줄링 메서드에는 몇 가지 한계가 있습니다.

지정된 시간 간격이 정확하게 보장되지 않을 수 있습니다.

이는 CPU 과부하나 브라우저 탭이 백그라운드 모드에 있을 때와 같이 브라우저가 원활하게 작동하지 못할 때 발생할 수 있습니다.

### requestAnimationFrame

mdn 문서에 따르면 `window.requestAnimationFrame()` 메서드는 브라우저에게 수행하기 원하는 애니메이션을 알려주고, 다음 리페인트 전에 브라우저가 애니메이션을 업데이트할 지정된 함수를 호출하도록 요청한다고 정의되어 있습니다.

requestAnimationFrame 메서드의 장점으로는 다음과 같습니다.

1. 백그라운드 동작 중지

2. 디스플레이 주사율에 맞게 호출 횟수

3. Animation Frames 큐에서 처리함

### 활용 예시

```js
class App {
  constructor() {
    this.circleWaveCanvas = document.getElementById("circleWave");
    this.circleWaveCtx = this.circleWaveCanvas.getContext("2d");
    this.circleWaveWidth = this.circleWaveCanvas.width;
    this.circleWaveHeight = this.circleWaveCanvas.height;

    this.circleRotateCanvas = document.getElementById("circleRotate");
    this.circleRotateCtx = this.circleRotateCanvas.getContext("2d");
    this.circleRotateWidth = this.circleRotateCanvas.width;
    this.circleRotateHeight = this.circleRotateCanvas.height;

    document.body.appendChild(this.circleWaveCanvas);
    document.body.appendChild(this.circleRotateCanvas);

    this.waveGroup = new WaveGroup();

    window.addEventListener("resize", this.resize.bind(this), false);
    this.resize();

    requestAnimationFrame(this.animate.bind(this));
  }

  animate(time) {
    this.clearCanvas(
      this.circleWaveCtx,
      this.circleWaveWidth,
      this.circleWaveHeight,
    );
    this.drawCircle(this.circleWaveCtx, circleWaveConfig, true);
    this.waveGroup.draw(this.circleWaveCtx);
    this.drawCircle(this.circleWaveCtx, circleWaveConfig, false);

    this.clearCanvas(
      this.circleRotateCtx,
      this.circleRotateWidth,
      this.circleRotateHeight,
    );
    this.drawRotateCircle(
      this.circleRotateCtx,
      circleWaveConfig,
      (rotate * Math.PI) / 180,
    );

    requestAnimationFrame(this.animate.bind(this));
  }

  clearCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
  }

  drawCircle(ctx, config, isInner) {
    if (isInner) {
      buildInnerCircle(
        ctx,
        this.circleWaveWidth,
        this.circleWaveHeight,
        config,
      );
    } else {
      buildOuterCircle(
        ctx,
        this.circleWaveWidth,
        this.circleWaveHeight,
        config,
      );
    }
  }

  drawRotateCircle(ctx, config, rotation) {
    buildRotateOuterCircle(
      ctx,
      this.circleRotateWidth,
      this.circleRotateHeight,
      config,
      rotation,
    );
  }
}
```

---

### 참고 문헌

[mdn 문서 - requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

[블로그 - setTimeout과 setInterval을 이용한 호출 스케줄링](https://ko.javascript.info/settimeout-setinterval)

[블로그 - 웹 애니메이션 최적화] (https://inpa.tistory.com/entry/%F0%9F%8C%90-requestAnimationFrame-%EA%B0%80%EC%9D%B4%EB%93%9C)
