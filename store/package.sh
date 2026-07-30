#!/usr/bin/env bash
# 웹스토어 업로드용 ZIP 을 dist/ 에 생성한다.
# 사용법: bash store/package.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -e "process.stdout.write(require('$ROOT/manifest.json').version)")"
NAME="web-environment-banner-$VERSION"
DIST="$ROOT/dist"
STAGE="$DIST/$NAME"
ZIP="$DIST/$NAME.zip"

echo "▸ 사전 검사"
node -e "JSON.parse(require('fs').readFileSync('$ROOT/manifest.json','utf8'))" || exit 1
for f in "$ROOT"/src/lib/*.js "$ROOT"/src/content/*.js "$ROOT"/src/options/*.js "$ROOT"/src/popup/*.js; do
  node --check "$f" >/dev/null || { echo "  문법 오류: $f"; exit 1; }
done
echo "  manifest·JS 문법 통과"

echo "▸ 스테이징"
rm -rf "$STAGE" "$ZIP"
mkdir -p "$STAGE/assets/fonts"

cp "$ROOT/manifest.json" "$STAGE/"
cp "$ROOT"/assets/icon16.png "$ROOT"/assets/icon32.png \
   "$ROOT"/assets/icon48.png "$ROOT"/assets/icon128.png "$STAGE/assets/"
cp "$ROOT/assets/fonts/PretendardVariable.woff2" \
   "$ROOT/assets/fonts/LICENSE-Pretendard.txt" "$STAGE/assets/fonts/"
cp -R "$ROOT/src" "$STAGE/"

# 개발용 산출물은 제외 — test/ store/ dist/ README PRIVACY *.svg
find "$STAGE" -name '.DS_Store' -delete
find "$STAGE" -name '*.svg' -delete

echo "▸ manifest 참조 파일 확인"
node -e "
const fs=require('fs'),path=require('path');
const base='$STAGE';
const m=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));
const list=[...Object.values(m.icons),...Object.values(m.action.default_icon),
  m.action.default_popup,m.options_ui.page,...m.content_scripts[0].js,
  ...m.web_accessible_resources.flatMap(w=>w.resources)];
let bad=0;
for(const f of [...new Set(list)]) if(!fs.existsSync(path.join(base,f))){console.log('  누락: '+f);bad++}
if(bad) process.exit(1);
console.log('  참조 '+new Set(list).size+'개 모두 포함');
" || exit 1

echo "▸ 압축"
(cd "$STAGE" && zip -qr "$ZIP" .)
rm -rf "$STAGE"

SIZE="$(du -h "$ZIP" | cut -f1 | tr -d ' ')"
echo ""
echo "완료: $ZIP  ($SIZE)"
echo ""
unzip -Z1 "$ZIP" | sort | sed 's/^/  /'
