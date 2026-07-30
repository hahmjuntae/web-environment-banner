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
shot screenshot-2-settings   1280 800 "file://$ROOT/src/options/options.html"
shot screenshot-3-popup      1280 800 "file://$ROOT/store/shots/shot3-popup.html"
shot screenshot-4-colors     1280 800 "file://$ROOT/store/shots/shot4-colors.html"
shot promo-small-440x280      440  280 "file://$ROOT/store/shots/promo-440x280.html"

echo "완료: $OUT"
