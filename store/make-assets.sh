#!/usr/bin/env bash
# 웹스토어 등록용 스크린샷·프로모 타일을 store/assets 에 생성한다.
# 사용법: bash store/make-assets.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT="$ROOT/store/assets"

[ -x "$CHROME" ] || { echo "Chrome 을 찾을 수 없습니다: $CHROME"; exit 1; }
mkdir -p "$OUT"

shot() { # 1:파일명 2:너비 3:높이 4:URL
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --force-device-scale-factor=1 --allow-file-access-from-files \
    --window-size="$2,$3" --virtual-time-budget=3000 \
    --screenshot="$OUT/$1.png" "$4" >/dev/null 2>&1
  echo "  $1.png  ($2x$3)"
}

echo "생성 중..."
shot screenshot-1-production 1280 800 "file://$ROOT/store/shots/shot1-production.html"

# 설정 화면은 영어·기본값 상태로 고정해 캡처한다.
# locale 이 auto 면 실행 환경의 시스템 언어를 따라가므로 스토어 기본 언어(영어)와 어긋난다.
TMP="$ROOT/src/options/.shot-settings.html"
node -e "
const fs=require('fs');
require('$ROOT/src/lib/defaults.js');
const D=globalThis.EnvBannerDefaults;
const cfg={
  settings: Object.assign({}, D.DEFAULT_SETTINGS, { locale: 'en' }),
  environments: D.DEFAULT_ENVIRONMENTS
};
const stub='<script>window.chrome={storage:{sync:{get:()=>Promise.resolve({envBannerConfig:'
  + JSON.stringify(cfg) + '}),set:()=>Promise.resolve()},onChanged:{addListener(){},removeListener(){}}}};</'+'script>';
const html=fs.readFileSync('$ROOT/src/options/options.html','utf8').replace('</head>', stub+'\n</head>');
fs.writeFileSync('$TMP', html);
"
shot screenshot-2-settings   1280 800 "file://$TMP"
rm -f "$TMP"

shot screenshot-3-popup      1280 800 "file://$ROOT/store/shots/shot3-popup.html"
shot screenshot-4-colors     1280 800 "file://$ROOT/store/shots/shot4-colors.html"
shot promo-small-440x280      440  280 "file://$ROOT/store/shots/promo-440x280.html"

echo "완료: $OUT"
