# 크롬 웹스토어 배포 가이드

이 문서만 따라가면 등록이 끝납니다. 대시보드에 입력할 문구는 모두 복붙할 수 있게 적어 뒀습니다.

---

## 0. 준비된 산출물

| 항목 | 경로 | 비고 |
|---|---|---|
| 업로드 ZIP | `dist/web-environment-banner-0.1.0.zip` | 2.0MB · 20개 파일 |
| 스토어 아이콘 128×128 | `assets/icon128.png` | |
| 스크린샷 1280×800 | `store/assets/screenshot-1-production.png` | 실제 사용 화면 |
| | `store/assets/screenshot-2-settings.png` | 설정 화면 |
| | `store/assets/screenshot-3-popup.png` | 툴바 팝업 |
| | `store/assets/screenshot-4-colors.png` | 환경별 색 구분 |
| 작은 프로모 타일 440×280 | `store/assets/promo-small-440x280.png` | 선택 항목이지만 노출에 유리 |
| 개인정보 처리방침 | `PRIVACY.md` | 3번 단계에서 URL로 호스팅 |

재생성이 필요하면:

```bash
bash store/package.sh      # dist/ ZIP 다시 만들기 (manifest·JS 문법 검사 포함)
bash store/make-assets.sh  # store/assets/ 스크린샷·프로모 타일 다시 만들기
```

ZIP에는 `test/`, `store/`, `dist/`, `README.md`, `PRIVACY.md`, `*.svg` 원본이 **들어가지 않습니다.**
폰트 라이선스(`assets/fonts/LICENSE-Pretendard.txt`)는 OFL 요구사항이라 반드시 포함되며, 스크립트가 챙깁니다.

---

## 1. 배포 전 실제 동작 확인 (필수)

스토어에 올리기 전에 로컬에서 한 번은 돌려봐야 합니다.

1. `chrome://extensions` → 개발자 모드 ON → **압축해제된 확장 프로그램을 로드** → 이 폴더 선택
2. `http://localhost:3000` 등 개발 서버를 열어 배너가 뜨는지 확인
3. 사이트에 고정 헤더가 있는 페이지에서 헤더가 배너만큼 내려가는지 확인
4. 툴바 아이콘 → 팝업에서 현재 주소가 보이고 `추가`가 동작하는지 확인
5. 팝업 → `설정`에서 색·높이·속도를 바꿨을 때 열려 있는 탭에 즉시 반영되는지 확인

ZIP 자체를 검증하고 싶으면 `dist/`의 ZIP을 아무 곳에 풀어 그 폴더를 같은 방법으로 로드하면 됩니다.

---

## 2. 개발자 계정 등록 (최초 1회)

1. https://chrome.google.com/webstore/devconsole 접속 (등록에 쓸 구글 계정으로 로그인)
2. **2단계 인증이 켜져 있어야** 개발자 등록이 됩니다. 안 켜져 있으면 먼저 계정 보안에서 활성화
3. 개발자 등록비 **US $5** 결제 (일회성, 계정당 1회, 환불 불가)
4. 개발자 이름(퍼블리셔 표시명) 입력 — 스토어에 공개되므로 실명 대신 조직·닉네임 사용 가능
5. 연락용 이메일 입력 후 **이메일 인증**까지 완료 (미인증이면 심사 제출이 막힙니다)

> 회사 명의로 낼 거면 개인 계정 대신 회사 계정으로 등록하세요. 나중에 퍼블리셔 이관은 번거롭습니다.

---

## 3. 개인정보 처리방침 URL

이미 준비돼 있습니다. 저장소가 공개되어 있으므로 아래 URL을 그대로 대시보드에 입력하세요.

```
https://github.com/hahmjuntae/web-environment-banner/blob/main/PRIVACY.md
```

접근 확인됨(HTTP 200). 시크릿 창에서 열리는지 한 번 더 확인하면 안전합니다.

방침 내용을 고쳤을 때는 `PRIVACY.md`를 수정해 push 하면 같은 URL에 반영됩니다.

> 더 깔끔한 URL을 원하면 저장소 Settings → Pages → Source를 `main` / `/ (root)`로 켜면
> `https://hahmjuntae.github.io/web-environment-banner/PRIVACY` 로도 열립니다 (빌드에 몇 분 소요).
> 심사에는 위 GitHub URL만으로 충분합니다.

---

## 4. ZIP 업로드

1. 대시보드 → **새 항목** (Add new item)
2. `dist/web-environment-banner-0.1.0.zip` 업로드
3. 업로드가 끝나면 `manifest.json`이 자동 파싱되어 이름·버전이 채워집니다

---

## 5. 스토어 등록정보 (Store listing) 입력

### 이름
```
Web Environment Banner
```

### 요약 (Summary · 132자 제한)
```
로컬·개발·운영 URL에 접속하면 페이지 최상단에 환경 배너를 띄워 서버를 착각한 작업을 막아 줍니다.
```

### 설명 (Description)
```
운영 서버를 개발 서버로 착각해서 데이터를 지우거나 잘못 배포한 적이 있다면, 이 확장이 그걸 막아 줍니다.

등록한 주소에 접속하면 페이지 최상단(또는 최하단)에 환경 이름이 계속 흘러가는 배너가 뜹니다.
색과 이름은 환경마다 직접 정할 수 있어서, 화면을 보는 순간 지금 어느 서버인지 알 수 있습니다.

■ 주요 기능

· 환경별 URL 등록 — 로컬 / 개발 / 운영 기본 제공, 스테이징·QA 등 원하는 만큼 추가
· 유연한 패턴 — localhost, localhost:3000, *.dev.example.com, dev.*, 경로 지정, 정규식까지
· 환경마다 배경색·글자색 지정
· 배너 높이, 글자 크기, 흐르는 속도와 방향, 간격, 사선 경고 패턴 조절
· 페이지가 가려지지 않게 컨텐츠를 배너 높이만큼 내려 줍니다
· 사이트가 직접 띄운 고정 헤더(fixed·sticky)도 함께 내려 줍니다
· 툴바 아이콘 클릭 → 현재 주소를 한 번에 등록
· 설정 JSON 내보내기·가져오기로 팀 전체가 같은 기준 공유
· 구글 계정에 로그인한 크롬끼리 설정 자동 동기화

■ 개인정보

어떤 데이터도 수집하지 않고, 외부로 전송하지 않습니다. 외부 서버와 통신하지 않으며 분석 도구도 없습니다.
확장이 저장하는 것은 사용자가 직접 입력한 환경 이름·URL 패턴·색상 설정뿐이고, 크롬 저장소에만 보관됩니다.
페이지 주소는 등록한 패턴과 일치하는지 기기 안에서 비교할 때만 사용하며, 페이지 내용은 읽지 않습니다.

■ 참고

· chrome:// 로 시작하는 브라우저 내부 페이지와 크롬 웹스토어에는 배너가 표시되지 않습니다 (브라우저 정책)
· 배너의 닫기 버튼은 해당 탭에서만 숨깁니다. 새 탭에서 열면 다시 표시됩니다
· 폰트는 Pretendard(SIL Open Font License 1.1)를 패키지에 포함해 사용합니다
```

### 카테고리
```
개발자 도구 (Developer Tools)
```

### 언어

**기본 언어: 한국어.** 여기에 영어를 추가합니다.

1. 스토어 등록정보 화면 상단의 언어 선택기에서 **언어 추가** 클릭
2. **English** 선택 → 영어 탭이 생깁니다
3. 아래 영문 문구를 그 탭에 입력 (한국어 탭 내용은 그대로 유지)

기본 언어가 한국어이므로, 영어 리스팅이 없는 지역에서는 한국어 리스팅이 노출됩니다.

#### English — Name
```
Web Environment Banner
```

#### English — Summary
```
Shows a rolling banner at the top of any page whose URL you registered as local, development, or production.
```

#### English — Description
```
Have you ever wiped data or shipped a deploy because you mistook production for development?
This extension stops that.

When you open a URL you registered, a banner with the environment name rolls across the top
(or bottom) of the page. You choose the color and the name per environment, so a single glance
tells you which server you are looking at.

■ Features

· Register URLs per environment — local / development / production out of the box, plus staging, QA, or anything you add
· Flexible patterns — localhost, localhost:3000, *.dev.example.com, dev.*, path scoping, and regular expressions
· Per-environment background and text color
· Adjustable banner height, font size, scroll speed and direction, spacing, and a diagonal warning stripe
· Pushes page content down by the banner height so nothing is hidden
· Also offsets the site's own fixed / sticky header, which page padding alone cannot move
· Click the toolbar icon to register the current URL in one step
· Export and import settings as JSON so a whole team shares the same rules
· Settings sync across Chrome instances signed in to the same Google account

■ Privacy

No data is collected and nothing is transmitted. The extension contacts no external server and
contains no analytics. It stores only what you type — environment names, URL patterns, and color
settings — in Chrome storage. Page URLs are compared against your own patterns on your device only,
and page content is never read.

■ Notes

· Banners do not appear on chrome:// internal pages or the Chrome Web Store (browser policy)
· The close button hides the banner for that tab only; it returns in a new tab
· The extension interface is currently in Korean
· Bundles Pretendard (SIL Open Font License 1.1)
```

> 마지막 항목처럼 **UI 언어가 한국어라는 점을 영문 설명에 명시**해 두세요. 이걸 빼면 설치 후 낮은 평점의
> 원인이 되고, 심사에서 "설명과 실제가 다르다"로 지적될 수 있습니다.

### 이미지 업로드
- **스토어 아이콘**: `assets/icon128.png`
- **스크린샷**: `store/assets/screenshot-1~4` 4장 (최소 1장, 최대 5장)
- **작은 프로모 타일**: `store/assets/promo-small-440x280.png`
- 마퀴 프로모 타일(1400×560)은 비워도 됩니다 — 스토어 메인 피처링 후보에만 쓰입니다

### 추가 필드
- 홈페이지 URL: `https://github.com/hahmjuntae/web-environment-banner`
- 지원 URL: `https://github.com/hahmjuntae/web-environment-banner/issues`

---

## 6. 개인정보보호 관행 (Privacy practices) 입력

여기가 심사에서 가장 많이 막히는 곳입니다. 아래를 그대로 쓰세요.

### 단일 목적 설명 (Single purpose description)
```
사용자가 등록한 URL 패턴과 현재 페이지 주소가 일치할 때, 그 페이지 상단에 환경 이름 배너를 표시합니다.
개발자가 로컬·개발·운영 환경을 혼동하는 것을 막는 것이 이 확장의 유일한 목적입니다.
```

영문:
```
Displays an environment name banner at the top of a page when its URL matches a pattern the user
registered. Its single purpose is to prevent developers from confusing local, development, and
production environments.
```

### 권한 정당화 (Permission justification)

**storage**
```
사용자가 입력한 환경 이름, URL 패턴, 색상·배너 스타일 설정을 저장하고 기기 간에 동기화하기 위해 필요합니다.
다른 용도로는 사용하지 않습니다.
```
```
Required to save and sync the user's own settings: environment names, URL patterns, colors, and
banner style. Nothing else is stored.
```

**activeTab**
```
툴바 팝업을 열었을 때 현재 탭의 주소를 표시하고, 그 주소를 환경에 한 번에 등록하는 기능에만 사용합니다.
사용자가 팝업을 클릭한 순간에만 접근하며, 페이지 내용은 읽지 않습니다.
```
```
Used only when the user opens the toolbar popup, to show the current tab's URL and let the user
register it with one click. Page content is never read.
```

**호스트 권한 (`http://*/*`, `https://*/*`)**

> 제출 시 "광범위한 호스트 권한" 지연 경고가 뜹니다. 아래 문구는 그 경고가 제안하는 두 대안
> (`activeTab` 전환 / 사이트 지정)을 왜 적용할 수 없는지까지 답하도록 작성했습니다. **이 내용을 빼면
> 심사가 더 길어지거나 거절될 수 있습니다.**

```
이 확장의 기능은 "사용자가 등록한 주소에 접속하면 그 페이지에 환경 배너를 자동으로 표시하는 것"입니다.
페이지가 열리는 시점에 배너가 떠 있어야 목적(운영 서버를 개발 서버로 착각하는 것을 막는 것)이 달성되므로,
사용자가 등록한 주소라면 어디서든 실행될 수 있는 content script 가 필요합니다.

권장 대안을 검토했으나 적용할 수 없었습니다.

1) activeTab: 이미 선언해 두었고 툴바 팝업에서만 사용합니다. 다만 activeTab 은 사용자가 확장 아이콘을
   클릭한 시점에만 유효하므로, 페이지 로드 시 자동으로 배너를 띄우는 이 확장의 핵심 동작을 대체할 수
   없습니다. 매번 아이콘을 눌러야 한다면 착각을 막는 기능이 성립하지 않습니다.

2) host_permissions 로 사이트 지정: 대상 사이트는 개발자가 아니라 사용자가 정하며, 설치 시점에는 알 수
   없습니다. 또한 이 확장은 dev.*, dev-*, *-local.*, 정규식 같은 패턴 문법을 제공하는데, 이는 Chrome
   match pattern 으로 표현할 수 없습니다(match pattern 은 호스트 앞의 *. 만 허용). 따라서 사용자가 입력한
   패턴을 host_permissions 목록으로 변환하는 것이 불가능합니다.

범위는 최소화했습니다. <all_urls> 대신 http://*/* 와 https://*/* 만 요청하며 file://, ftp:// 등은
제외했습니다. iframe 에는 주입하지 않습니다(all_frames: false).

content script 가 실제로 하는 일은 두 가지뿐입니다.
- location.href 를 사용자가 저장한 패턴과 기기 내에서 문자열 비교
- 일치하면 Shadow DOM 배너 요소를 추가하고, 배너에 가려지는 상단 고정 요소의 top 값을 보정

페이지의 DOM 내용, 입력값, 쿠키, 토큰, localStorage 를 읽지 않습니다. 네트워크 요청을 전혀 하지 않으며
(외부 통신 코드가 없습니다), 어떤 데이터도 기기를 떠나지 않습니다. 원격 코드도 사용하지 않고 폰트까지
패키지에 포함했습니다.

전체 소스가 공개되어 있어 위 내용을 직접 확인하실 수 있습니다.
https://github.com/hahmjuntae/web-environment-banner
content script: src/content/content.js · 패턴 매칭: src/lib/match.js
```

```
The extension's purpose is to automatically display an environment banner on pages whose URL the
user registered. The banner must already be visible when the page loads — that is the entire point
(preventing a developer from mistaking production for development) — so a content script that can
run on any user-registered address is required.

We evaluated both recommended alternatives and neither is applicable.

1) activeTab: already declared, and used only by the toolbar popup. However activeTab grants access
   only at the moment the user clicks the extension icon, so it cannot replace the core behavior of
   showing the banner on page load. Requiring a click every time would defeat the feature.

2) Specifying sites via host_permissions: the target sites are chosen by the user, not the
   developer, and are unknown at install time. Furthermore this extension offers pattern syntax such
   as dev.*, dev-*, *-local.*, and regular expressions, which cannot be expressed as Chrome match
   patterns (match patterns only allow a leading *. for subdomains). Converting user-entered
   patterns into a host_permissions list is therefore not possible.

The scope is minimized: instead of <all_urls> we request only http://*/* and https://*/*, excluding
file:// and ftp://. The script is not injected into iframes (all_frames: false).

The content script does exactly two things:
- compares location.href against the user's stored patterns, locally, as string matching
- on a match, appends a Shadow DOM banner element and offsets the `top` of fixed elements the banner
  would cover

It never reads page DOM content, form values, cookies, tokens, or localStorage. It makes no network
requests at all (there is no outbound networking code), and no data ever leaves the device. No remote
code is used; even the font is bundled.

The full source is public so the above can be verified directly:
https://github.com/hahmjuntae/web-environment-banner
content script: src/content/content.js · pattern matching: src/lib/match.js
```

### 원격 코드 사용 여부
```
아니요 — 원격 코드를 사용하지 않습니다.
```
모든 JS·CSS·폰트가 패키지에 포함되어 있고, 외부에서 스크립트를 불러오지 않습니다.

### 데이터 사용 (Data usage)
아래 항목은 **하나도 체크하지 않습니다.** 개인 식별 정보, 건강 정보, 금융 정보, 인증 정보, 개인 통신,
위치, 웹 방문 기록, 사용자 활동 — 전부 수집하지 않습니다.

그리고 하단 인증 체크박스 3개를 모두 체크합니다.
- 승인된 사용 사례를 준수합니다
- 사용자 데이터를 제3자에게 판매·양도하지 않습니다
- 승인된 사용 사례와 무관한 목적으로 사용·전송하지 않습니다

### 개인정보 처리방침 URL
3번 단계에서 만든 URL을 입력합니다.

---

## 7. 배포 설정 (Distribution)

| 항목 | 값 | 설명 |
|---|---|---|
| 공개 상태 | **공개(Public)** | 검색·리스팅 노출. 사내에서만 쓸 거면 **미등록(Unlisted)** 으로 두고 링크로 배포 |
| 배포 지역 | 전체 또는 대한민국 | 전체로 두어도 무료 확장은 별도 절차가 없습니다 |
| 가격 | 무료 | |

> 팀 내부용으로만 쓰려면 **미등록(Unlisted)** 이 편합니다. 심사는 동일하게 받지만 검색에 노출되지 않고,
> 링크를 아는 사람만 설치할 수 있습니다.

---

## 8. 심사 제출

1. 좌측 메뉴의 항목마다 경고 표시가 없는지 확인
2. 우측 상단 **검토를 위해 제출** (Submit for review)
3. "게시 방식"은 보통 **심사 통과 후 즉시 게시**를 선택

### "게시가 지연됩니다 — 광범위한 호스트 권한" 경고

제출 화면에 이 경고가 뜨는 것은 **정상이며 거절이 아닙니다.** 그대로 제출할 수 있습니다.

이 확장은 구조적으로 광범위한 호스트 권한이 필요합니다(사용자가 대상 주소를 정하고, 제공하는 패턴 문법이
Chrome match pattern 으로 표현되지 않음). 6번의 정당화 문구가 그 이유를 설명합니다.

지금 적용된 완화 조치:

| 조치 | 내용 |
|---|---|
| scheme 축소 | `<all_urls>` → `http://*/*` + `https://*/*` (file·ftp 제외) |
| 프레임 제한 | `all_frames: false` — iframe 에 주입하지 않음 |
| 원격 코드 없음 | JS·CSS·폰트 전부 패키지 내장 |
| 네트워크 없음 | 외부 통신 코드가 존재하지 않음 |
| 소스 공개 | 심사자가 코드를 직접 확인 가능 |

권한 경고 자체는 사라지지 않습니다(모든 http/https 사이트를 여전히 포함하므로). 다만 위 근거가 갖춰지면
심사는 통과됩니다.

### 소요 시간
- 대부분 **1~3일**
- 광범위한 호스트 권한 때문에 이 확장은 더 오래 걸릴 수 있습니다 (길면 수 주)
- 첫 등록은 재심사보다 오래 걸리는 편입니다

---

## 9. 거절되면

거절 메일에 코드(예: `Blue Argon`, `Purple Potassium`)와 사유가 옵니다. 이 확장에서 나올 수 있는 것:

| 사유 | 대응 |
|---|---|
| 광범위한 호스트 권한의 정당성 부족 | 6번의 호스트 권한 정당화 문구를 **전문 그대로** 넣었는지 확인. `activeTab`·`host_permissions` 두 대안을 왜 못 쓰는지 답하는 부분이 핵심입니다 |
| 개인정보 처리방침 접근 불가 | Secret gist·로그인 필요 페이지가 아닌지 확인. 시크릿 창에서 URL이 열리는지 테스트 |
| 단일 목적 위반 | 기능을 추가할 때 "환경 표시"와 무관한 것(예: 페이지 내용 수정, 통계 수집)을 넣지 않기 |
| 스크린샷 품질 | 1280×800 정확히, 흐릿하거나 텍스트가 잘리지 않게. 제공된 4장은 이 기준을 만족합니다 |

수정 후 같은 항목에서 다시 제출하면 됩니다. 버전을 올릴 필요는 없지만, 코드를 고쳤다면 올리는 게 맞습니다.

---

## 10. 업데이트 배포

1. 코드 수정
2. `manifest.json`의 `version` 올리기 (예: `0.1.0` → `0.1.1`) — **이전 버전과 같은 번호는 업로드가 거부됩니다**
3. `bash store/package.sh`
4. 대시보드 → 해당 항목 → **패키지** → 새 ZIP 업로드 → 제출

스토어 등록정보만 바꾸는 경우(설명·스크린샷)에는 ZIP 재업로드 없이 제출할 수 있습니다.

---

## 11. 최종 체크리스트

- [ ] 로컬에서 실제 동작 확인 (1번)
- [ ] 개발자 계정 등록 + 이메일 인증 완료
- [ ] 개인정보 처리방침 URL이 시크릿 창에서 열림
- [ ] `dist/` ZIP이 최신 코드로 만들어졌는지 (`bash store/package.sh`)
- [ ] `manifest.json` version이 이전 배포보다 큼
- [ ] 스크린샷 4장 + 아이콘 + 프로모 타일 업로드
- [ ] 언어: 한국어(기본) + 영어 탭 문구 입력 완료
- [ ] 권한 정당화 3개(storage / activeTab / 호스트) 모두 입력
- [ ] 원격 코드 "아니요"
- [ ] 데이터 수집 항목 전부 미체크 + 인증 3개 체크
- [ ] 공개 범위(공개 / 미등록) 결정
