---
title: "[Android] emulator: FATAL | Broken AVD system path 에러 해결을 위한 재 설정"
slug: Android-emulator-FATAL-Broken-AVD-system-path-에러-해결을-위한-재-설정
velogId: d1506348-ad86-427f-935f-de07c86599fb
publishedAt: "2026-07-11T04:34:38.148Z"
updatedAt: "2026-10-08T15:24:34.591Z"
tags:
  - AVD
  - Emulator
  - MacOS
  - SDK
  - android
  - homebrew
source: >-
  https://velog.io/@dlehddnr99/Android-emulator-FATAL-Broken-AVD-system-path-에러-해결을-위한-재-설정
---

### Intro

맥북에서 터미널을 통해 안드로이드 에뮬레이터를 구동하려다 보면 다음과 같은 치명적인 에러를 마주할 때가 있습니다.

저 또한, 오랜만에 안드로이드 에뮬레이터를 실행하려다가 다음의 문제를 발견했는데요.

> **FATAL | Broken AVD system path. Check your ANDROID_SDK_ROOT value!**

이 에러는 에뮬레이터 실행 파일(emulator)이 구동에 필요한 실제 SDK 경로 및 시스템 이미지 (system-images) 폴더 구조를 찾지 못한 환경 설정의 오류였습니다.

### Solutuion

#### 1. 기존 Homebrew 패키지 삭제

저는 기존에 꼬여있는 구성들을 초기화 하고 재 설치를 하기로 결정했습니다. 먼저 해당 패키지들을 완전히 삭제해줍니다.

```
brew uninstall android-commandlinetools android-sdk
```

#### 2. 환경변수 재 설정 (`~/.zshrc`)

```
# .zshrc 파일 열기
nano ~/.zshrc


# .zshrc

...

export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
...


# 수정 내용 반영
source ~/.zshrc

```

제 환경은 기본적으로 zsh을 사용하고 있었기에, .zshrc 내부에서 환경변수 설정을 윗 문장 처럼 재 구성하였습니다.

#### 3. Command Line Tools 수동 설치 및 폴더 구조 생성

이번에는 안드로이드 공식 SDK 도구가 올바른 위치에 설치 될 수 있도록 최신 커맨드라인 툴 패키지를 다운로드하였습니다.

먼저 SDK 하위의 cmdline-tools 폴더 생성 및 이동해줍니다.

```
mkdir -p ~/Library/Android/sdk/cmdline-tools
cd ~/Library/Android/sdk/cmdline-tools

```

이후 Command Line Tools을 설치해줬습니다.

```
예시: 최신 툴 다운로드 및 압축 해제 (버전은 상이할 수 있습니다.)

curl -O https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip
unzip commandlinetools-mac-11076708_latest.zip


```

마지막으로 폴더명을 다음과 같이 변경하였습니다.

```
mv cmdline-tools latest
rm commandlinetools-mac-11076708_latest.zip

```

#### 4. sdkmanager를 이용한 핵심 구성 요소 설치

윗 단계에서 Android command line tools를 설치해 줬으니, 이제 `sdkmanager`를 사용하여 필요한 플랫폼 도구, 에뮬레이터 엔진, 그리고 시스템 이미지를 내려받았습니다.

```
sdkmanager --licenses  (// 전부 동의 y)

```

저는 API 35 arm64 기준으로 설치해줬습니다.

```
sdkmanager "platform-tools" "emulator" "system-images;android-35;google_apis_playstore;arm64-v8a"

```

#### 5. AVD 가상 기기 새로 생성 및 실행

이제 새롭게 받은 시스템 이미지를 새로운 가상 기기로 정의하여 `Medium_Phone_API_35`로 생성하였습니다.

```
avdmanager create avd -n Medium_Phone_API_35 -k "system-images;android-35;google_apis_playstore;arm64-v8a" --device "pixel_5"

```

(만약 실행 중, 커스텀 하드웨어 프로필 설정 여부를 묻는 질문이 나온다면 no를 입력 후, 엔터를 누르셔도 됩니다.)

#### 결과

지금까지의 과정을 토대로 이제 에뮬레이터를 백그라운드로 실행하면 다음과 같이 구동시킬 수 있습니다.

```
emulator -avd Medium_Phone_API_35 &

```

![](https://velog.velcdn.com/images/dlehddnr99/post/29303579-c0f3-4ac4-a589-fa5acfa08944/image.png)
