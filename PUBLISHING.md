# 크롬 웹스토어 배포 가이드

대시보드에 넣을 문구를 전부 복붙할 수 있게 적어 두었습니다. **기본 언어는 영어(English)**, 한국어는 추가
언어로 등록합니다.

---

## 0. 준비된 산출물

| 항목 | 경로 |
|---|---|
| 업로드 ZIP | `dist/web-environment-banner-0.1.0.zip` |
| 스토어 아이콘 128×128 | `assets/icon128.png` |
| 캡처화면 1280×800 | `store/assets/screenshot-1-production.png` (사용 화면) |
| | `store/assets/screenshot-2-settings.png` (설정) |
| | `store/assets/screenshot-3-popup.png` (팝업) |
| | `store/assets/screenshot-4-colors.png` (환경별 색) |
| 작은 프로모션 타일 440×280 | `store/assets/promo-small-440x280.png` |
| 개인정보 처리방침 | https://github.com/hahmjuntae/web-environment-banner/blob/main/PRIVACY.md |

캡처화면·프로모 타일은 8비트 RGB, 알파 없음으로 생성되어 "24비트 PNG(알파 비포함)" 요구를 만족합니다.

재생성:

```bash
bash store/package.sh      # ZIP (manifest·JS 문법·로케일 검사 포함)
bash store/make-assets.sh  # 캡처화면·프로모 타일
```

---

## 1. 배포 전 실제 동작 확인 (필수)

1. `chrome://extensions` → 개발자 모드 ON → **압축해제된 확장 프로그램을 로드** → 이 폴더
2. `http://localhost:3000` 등에서 배너가 뜨는지
3. 고정 헤더가 있는 사이트에서 헤더가 배너만큼 내려가는지
4. 툴바 아이콘 → 현재 주소 표시·`Add` 동작
5. `Settings`에서 값을 바꿨을 때 열려 있는 탭에 즉시 반영되는지
6. 크롬 언어를 한국어로 두면 UI가 한국어로, 그 외 언어에서는 영어로 나오는지

---

## 2. 개발자 계정 등록 (최초 1회)

1. https://chrome.google.com/webstore/devconsole 로그인
2. **2단계 인증 필수** — 안 켜져 있으면 계정 보안에서 먼저 활성화
3. 등록비 **US $5** 결제 (일회성, 환불 불가)
4. 퍼블리셔 표시명 + 연락 이메일 **인증까지** 완료 (미인증이면 제출 불가)

---

## 3. ZIP 업로드

대시보드 → **새 항목** → `dist/web-environment-banner-0.1.0.zip`

`manifest.json`의 이름·설명은 `_locales`에서 자동으로 채워집니다.

---

## 4. 스토어 등록정보 — 영어 (기본 언어)

### 언어
```
English
```

### 설명 (Description)
```
Have you ever wiped data or shipped a deploy because you mistook production for development?
This extension stops that.

When you open a URL you registered, a banner with the environment name rolls across the top
(or bottom) of the page. You choose the color and the name per environment, so a single glance
tells you which server you are looking at.

■ Features

· Register URLs per environment — local / development / production out of the box, plus staging, QA, or anything you add
· Flexible patterns — localhost, localhost:3000, *.dev.example.com, dev.*, dev-*, path scoping, and regular expressions
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

· Works on http and https pages; browser-internal pages such as chrome:// cannot show a banner
· The close button hides the banner for that tab only; it returns in a new tab
· The interface is available in English and Korean, following your Chrome language
· Bundles Pretendard (SIL Open Font License 1.1)
```

### 카테고리
```
개발자 도구 (Developer Tools)
```

### 그래픽 저작물

| 필드 | 파일 |
|---|---|
| 스토어 아이콘 | `assets/icon128.png` |
| 캡처화면 | `store/assets/screenshot-1~4-*.png` (4장) |
| 작은 프로모션 타일 | `store/assets/promo-small-440x280.png` |
| 마키 프로모션 타일 · 프로모션 동영상 | 비움 |

### 추가 입력란

| 필드 | 값 |
|---|---|
| 공식 URL | `없음` (Search Console 소유 확인된 도메인만 선택 가능) |
| 홈페이지 URL | `https://github.com/hahmjuntae/web-environment-banner` |
| 지원 URL | `https://github.com/hahmjuntae/web-environment-banner/issues` |
| 성인용 콘텐츠 | OFF |

---

## 5. 스토어 등록정보 — 한국어 (추가 언어)

등록정보 화면 상단의 언어 선택기에서 **언어 추가 → 한국어**를 고른 뒤 아래를 입력합니다.
캡처화면·아이콘은 "전 언어 공통 애셋"이라 다시 올리지 않아도 됩니다.

### 설명
```
운영 서버를 개발 서버로 착각해서 데이터를 지우거나 잘못 배포한 적이 있다면, 이 확장이 그걸 막아 줍니다.

등록한 주소에 접속하면 페이지 최상단(또는 최하단)에 환경 이름이 계속 흘러가는 배너가 뜹니다.
색과 이름은 환경마다 직접 정할 수 있어서, 화면을 보는 순간 지금 어느 서버인지 알 수 있습니다.

■ 주요 기능

· 환경별 URL 등록 — 로컬 / 개발 / 운영 기본 제공, 스테이징·QA 등 원하는 만큼 추가
· 유연한 패턴 — localhost, localhost:3000, *.dev.example.com, dev.*, dev-*, 경로 지정, 정규식까지
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

· http·https 페이지에서 동작하며, chrome:// 같은 브라우저 내부 페이지에는 배너가 표시되지 않습니다
· 배너의 닫기 버튼은 해당 탭에서만 숨깁니다. 새 탭에서 열면 다시 표시됩니다
· 화면 언어는 크롬 언어에 따라 영어·한국어로 표시됩니다
· 폰트는 Pretendard(SIL Open Font License 1.1)를 패키지에 포함해 사용합니다
```

---

## 6. 개인정보보호 관행 (Privacy practices)

심사에서 가장 많이 막히는 화면입니다.

### 단일 목적 설명 (Single purpose)
```
Displays an environment name banner at the top of a page when its URL matches a pattern the user
registered. Its single purpose is to prevent developers from confusing local, development, and
production environments.
```

### 권한 정당화 — storage
```
Required to save and sync the user's own settings: environment names, URL patterns, colors, and
banner style. Nothing else is stored.
```

### 권한 정당화 — activeTab
```
Used only when the user opens the toolbar popup, to show the current tab's URL and let the user
register it with one click. Page content is never read.
```

### 권한 정당화 — 호스트 권한 (998자, 1000자 제한 통과)

> 제출 시 "광범위한 호스트 권한" 지연 경고가 뜹니다. 이 문구는 그 경고가 제안하는 두 대안
> (`activeTab` 전환 / 사이트 지정)을 왜 쓸 수 없는지까지 답합니다. **줄이면 심사가 길어질 수 있습니다.**

```
Shows an environment banner on pages the user registered, so production is not mistaken for development. It must be visible at page load, so the script must run on any address the user registers.

Neither alternative works:

1) activeTab is declared and used by the popup, but grants access only on icon click — it cannot show a banner at page load.

2) host_permissions cannot be enumerated: sites are chosen by the user, unknown at install time. Patterns like dev.*, dev-* and regexes cannot be expressed as Chrome match patterns (only a leading *. is allowed), so user input cannot become a permission list.

Scope is minimized to http://*/* and https://*/* (no file, no ftp); iframes excluded.

The script only compares location.href with the user's patterns locally, then appends a Shadow DOM banner. It never reads DOM content, form values, cookies or tokens, makes no network requests, and sends no data. No remote code; font is bundled.

Source: github.com/hahmjuntae/web-environment-banner
```

### 원격 코드 사용
```
아니요 — 사용하지 않습니다. (JS·CSS·폰트 전부 패키지 내장)
```

### 데이터 사용
수집 항목을 **하나도 체크하지 않습니다.** 하단 인증 체크박스 3개는 모두 체크합니다.

### 개인정보 처리방침 URL
```
https://github.com/hahmjuntae/web-environment-banner/blob/main/PRIVACY.md
```

---

## 7. 배포 설정

| 항목 | 값 |
|---|---|
| 공개 상태 | **공개(Public)** — 사내용이면 **미등록(Unlisted)** |
| 배포 지역 | 전체 |
| 가격 | 무료 |

---

## 8. 제출과 심사

좌측 메뉴 항목에 경고가 없으면 우측 상단 **검토를 위해 제출**.

### "게시가 지연됩니다 — 광범위한 호스트 권한" 경고

**거절이 아니며 그대로 제출할 수 있습니다.** 이 확장은 구조적으로 광범위한 호스트 권한이 필요합니다
(대상 주소를 사용자가 정하고, 제공하는 패턴 문법이 Chrome match pattern으로 표현되지 않음).

적용된 완화 조치:

| 조치 | 내용 |
|---|---|
| scheme 축소 | `<all_urls>` → `http://*/*` + `https://*/*` |
| 프레임 제한 | `all_frames: false` |
| 원격 코드 없음 | JS·CSS·폰트 전부 내장 |
| 네트워크 없음 | 외부 통신 코드 부재 |
| 소스 공개 | 심사자가 코드 확인 가능 |

권한 경고 자체는 사라지지 않습니다. 근거가 갖춰지면 심사는 통과됩니다.

### 소요 시간
- 보통 **1~3일**
- 광범위한 호스트 권한 때문에 더 걸릴 수 있습니다 (길면 수 주)
- 첫 등록이 재심사보다 오래 걸립니다

---

## 9. 거절되면

| 사유 | 대응 |
|---|---|
| 호스트 권한 정당성 부족 | 6번 문구를 **전문 그대로** 넣었는지 확인. 두 대안을 왜 못 쓰는지 답하는 부분이 핵심입니다 |
| 개인정보 처리방침 접근 불가 | 시크릿 창에서 URL이 열리는지 확인 |
| 단일 목적 위반 | "환경 표시"와 무관한 기능(페이지 내용 수정, 통계 수집)을 넣지 않기 |
| 캡처화면 품질 | 1280×800 정확히, 알파 없는 24비트 PNG. 제공된 4장은 이 기준을 만족합니다 |

수정 후 같은 항목에서 재제출하면 됩니다.

---

## 10. 업데이트 배포

1. 코드 수정
2. `manifest.json`의 `version` 올리기 (예: `0.1.0` → `0.1.1`) — 같은 번호는 업로드 거부
3. `bash store/package.sh`
4. 대시보드 → 항목 → **패키지** → 새 ZIP 업로드 → 제출

등록정보만 바꾸는 경우 ZIP 재업로드 없이 제출할 수 있습니다.

---

## 11. 최종 체크리스트

- [ ] 로컬 실제 동작 확인 (1번) — 영어·한국어 UI 둘 다
- [ ] 개발자 계정 등록 + 이메일 인증
- [ ] 처리방침 URL이 시크릿 창에서 열림
- [ ] ZIP이 최신 코드로 생성됨 (`bash store/package.sh`)
- [ ] 기본 언어 English 설명 입력
- [ ] 추가 언어 한국어 설명 입력
- [ ] 캡처화면 4장 + 아이콘 + 프로모 타일
- [ ] 권한 정당화 3개 (storage / activeTab / 호스트) — 호스트는 998자 전문
- [ ] 원격 코드 "아니요"
- [ ] 데이터 수집 전부 미체크 + 인증 3개 체크
- [ ] 공개 범위 결정
