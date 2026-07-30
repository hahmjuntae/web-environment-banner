# Web Environment Banner

[English](README.md) · **한국어**

등록한 URL에 접속하면 페이지 최상단에 환경 배너를 띄우는 크롬 확장입니다.
운영 서버를 개발 서버로 착각하고 작업하는 사고를 막습니다.

![운영 사이트에 표시된 배너](store/assets/screenshot-1-production.png)

- 환경별 URL 등록 — 로컬 / 개발 / 운영, 필요하면 얼마든지 추가
- 환경마다 배경색·글자색 지정
- 높이, 글자 크기, 흐르는 속도와 방향, 간격, 사선 패턴 조절
- Shadow DOM 안에서만 렌더되므로 페이지 CSS와 섞이지 않음
- 화면 언어는 영어·한국어 중에서 설정 화면에서 직접 선택
- 데이터를 수집하지 않고 외부 통신도 하지 않음

## 설치

[최신 릴리스](https://github.com/hahmjuntae/web-environment-banner/releases/latest)에서 ZIP을 내려받아
압축을 풀고:

1. `chrome://extensions` 접속
2. **개발자 모드** 켜기
3. **압축해제된 확장 프로그램을 로드** → 압축 푼 폴더 선택

기본값이 준비되어 있어 `http://localhost:3000`을 열면 바로 배너가 뜹니다.
Chrome 88 이상이 필요합니다.

| 환경 | 색 | 기본 패턴 |
|---|---|---|
| LOCAL | `#34b27c` | `localhost` `127.0.0.1` `0.0.0.0` `*.localhost` `local.*` `local-*` `*-local.*` |
| DEVELOPMENT | `#f5a312` | `dev.*` `dev-*` `*.dev.*` `*-dev.*` `stg.*` `*.stg.*` |
| PRODUCTION | `#ec4860` | *(비어 있음 — 직접 등록)* |

## 사용법

**빠르게 등록** — 등록할 사이트에서 툴바 아이콘 클릭 → 패턴·환경 선택 → **추가**. 현재 탭에 즉시 반영됩니다.

**세부 설정** — 팝업의 **설정**. 환경 추가·삭제·순서 변경, 색상과 배너 스타일을 조정할 수 있고 입력하는
즉시 저장됩니다. 환경 카드마다 실제와 같은 미리보기가 붙어 있습니다.

**설치 없이 모양만 보기** — `test/preview.html`을 브라우저로 열면 됩니다.

## URL 패턴 문법

| 패턴 | 매칭 | 비매칭 |
|---|---|---|
| `localhost` | `http://localhost:3000/app`, `https://localhost/` | `https://mylocalhost.com/` |
| `localhost:3000` | `http://localhost:3000/x` | `http://localhost:3001/x` |
| `dev.*` | `https://dev.example.com/` | `https://api.dev.example.com/` |
| `dev-*` | `https://dev-admin.example.com/` | `https://dev.example.com/` |
| `*-dev.*` | `https://api-dev.example.com/` | |
| `*.dev.example.com` | `api.dev.example.com`, `dev.example.com` | `dev.example.com.evil.io` |
| `example.com/admin/*` | `http://example.com/admin/users` | `http://example.com/` |
| `https://example.com/admin/*` | https 만 | `http://example.com/admin/users` |
| `/^https:\/\/\w+\.corp\./` | 슬래시로 감싸면 정규식 그대로 사용 | |

- scheme을 생략하면 모든 scheme, 포트를 생략하면 모든 포트에 매칭됩니다.
- 경로를 생략하면 해당 호스트의 모든 경로에 매칭됩니다.
- 호스트 자리의 `*`는 점·하이픈 경계를 구분합니다. `dev.*`는 `dev.`로 시작하는 것만,
  `dev-*`는 `dev-`로 시작하는 것만 잡습니다.
- **끝이 `*`인 패턴은 열려 있습니다.** `dev.*`는 `dev.example.com.other.io`도 매칭합니다.
  범위를 제한하려면 `*.dev.example.com`처럼 끝까지 적으세요.
- 여러 환경에 걸리면 **설정 화면에서 위에 있는 환경**이 이깁니다. `↑` `↓`로 순서를 조정하세요.

## 배너가 페이지를 가리지 않는 방식

배너는 `position: fixed`이므로 두 가지로 페이지를 밀어냅니다.

| 옵션 | 대상 | 방식 |
|---|---|---|
| 컨텐츠 밀어내기 | 일반 문서 흐름 | `<html>`에 배너 높이만큼 `padding-top` |
| 고정 헤더 함께 내리기 | 사이트가 직접 띄운 `fixed`·`sticky` 헤더 | 배너와 겹치는 요소를 찾아 `top`에 배너 높이를 더함 |

두 번째가 필요한 이유는 `fixed`·`sticky` 요소가 문서 흐름 밖이라 `padding`으로 밀리지 않기 때문입니다.
배너 바로 아래 지점만 `elementsFromPoint`로 찍으므로 전체 DOM을 순회하지 않습니다. 높이 260px을 넘는
요소(모달·전면 오버레이)는 건드리지 않고, 배너를 닫거나 옵션을 끄면 원래 인라인 값으로 되돌립니다.

사이트가 스크롤에 맞춰 헤더의 `top`을 직접 조작하면 충돌할 수 있습니다. 그럴 때는 이 옵션만 끄세요.

## 팀에 공유하기

설정 화면의 **내보내기**로 JSON을 받아 전달하고, 받는 사람은 **가져오기**로 불러옵니다.
설정은 `chrome.storage.sync`에 저장되므로 같은 구글 계정으로 로그인한 크롬끼리 자동 동기화됩니다.

## 개발

```
manifest.json               MV3 매니페스트
_locales/{en,ko}/           스토어에 노출되는 이름·설명 (기본 로케일은 영어)
assets/icon*.png            툴바·스토어 아이콘 (icon.svg / icon-small.svg 가 원본)
assets/fonts/               번들된 Pretendard + 라이선스
src/lib/messages.js         UI 문자열 카탈로그 (en / ko)
src/lib/i18n.js             로케일 헬퍼 — 자동 / en / ko
src/lib/icons.js            인라인 SVG (마크 + lucide 규격 라인 아이콘)
src/lib/font.js             번들 폰트를 document.fonts 에 등록
src/lib/defaults.js         기본 설정값, 색상 프리셋
src/lib/match.js            URL 패턴 → 정규식 변환
src/lib/store.js            chrome.storage.sync 래퍼 + 값 정규화
src/lib/banner.js           배너 렌더러 (Shadow DOM, 마퀴 계산)
src/content/content.js      배너 삽입 + 컨텐츠·고정헤더 오프셋
src/options/                설정 화면
src/popup/                  툴바 팝업
```

```bash
node test/match.test.js    # 패턴 매칭 — 패턴 43개 + 환경 매칭 14개
open test/harness.html     # 삽입·위치·헤더 보정·원복 — 22개 검사
open test/preview.html     # 설치 없이 시각 확인
bash store/package.sh      # dist/ ZIP 생성 (manifest·문법·로케일 검사 포함)
bash store/make-assets.sh  # 스토어 스크린샷·프로모 타일 재생성
```

개인정보 처리방침은 [PRIVACY.md](PRIVACY.md)입니다.

## 디자인

모노크롬 · radius 0 시스템을 따릅니다 — `#1d1d1d` 캔버스, `#f5f5f5` 잉크, `#2e2e2e` 헤어라인,
그림자 대신 1px 보더, 시맨틱 색은 상태 신호로만(`#34b27c` `#f5a312` `#ec4860` `#3d8bf5`).
타이포는 Pretendard 단일 서체입니다.

## 알려진 한계

- `http`·`https` 페이지에서만 동작합니다. 권한 범위를 최소화하기 위해 `file://`을 제외했습니다.
- `chrome://`, `chrome-extension://`, 크롬 웹스토어에는 확장이 주입될 수 없어 배너가 뜨지 않습니다.
- iframe 안에서는 그리지 않습니다(최상위 프레임만).
- `100vh` 기준으로 만든 사이트에서는 컨텐츠 밀어내기로 스크롤이 배너 높이만큼 생길 수 있습니다.
- SPA 라우팅은 1초 간격 폴링으로 감지합니다(격리된 실행 컨텍스트에서 history 이벤트를 직접 못 받기 때문).
- 배너의 닫기 버튼은 그 탭에서만 숨깁니다. 새 탭에서 열면 다시 표시됩니다.

## 라이선스

MIT — [LICENSE](LICENSE) 참고. 번들된 Pretendard는 SIL Open Font License 1.1이 적용됩니다.
