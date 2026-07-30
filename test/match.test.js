/*
 * URL 패턴 매칭 유닛 테스트.
 * 실행: node test/match.test.js
 */
const path = require('path');
const LIB = path.join(__dirname, '..', 'src', 'lib');

require(path.join(LIB, 'defaults.js'));
require(path.join(LIB, 'match.js'));

const M = globalThis.EnvBannerMatch;
const D = globalThis.EnvBannerDefaults;

let fail = 0;

function expectMatch(pattern, url, expected) {
  const got = M.testPattern(url, pattern);
  const ok = got === expected;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${pattern.padEnd(24)} ${url.padEnd(40)} → ${got}`);
}

function expectEnv(url, expected) {
  const found = M.find(url, D.DEFAULT_ENVIRONMENTS);
  const label = found ? found.env.label : null;
  const ok = label === expected;
  if (!ok) fail++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${url.padEnd(44)} → ${String(label)}` +
      (ok ? '' : `  (기대 ${expected})`)
  );
}

console.log('── 패턴 문법 ──');
[
  ['localhost', 'http://localhost:3000/app', true],
  ['localhost', 'https://localhost/', true],
  ['localhost', 'http://localhost', true],
  ['localhost', 'https://mylocalhost.com/', false],
  ['localhost', 'https://localhost.evil.com/', false],
  ['localhost:3000', 'http://localhost:3000/x', true],
  ['localhost:3000', 'http://localhost:3001/x', false],
  ['127.0.0.1', 'http://127.0.0.1:8080/', true],
  ['127.0.0.1', 'http://127.0.0.15/', false],
  ['*.localhost', 'http://api.localhost:3000/', true],
  ['*.localhost', 'http://localhost:3000/', true],

  // local 계열 — 하이픈 위치별
  ['local.*', 'https://local.acme.com/', true],
  ['local.*', 'http://localhost:3000/', false],
  ['local.*', 'https://mylocal.acme.com/', false],
  ['local-*', 'https://local-api.acme.com/', true],
  ['local-*', 'http://localhost/', false],
  ['*-local.*', 'https://admin-local.acme.com/', true],
  ['*-local.*', 'https://local.acme.com/', false],

  // dev 계열
  ['dev.*', 'https://dev.acme.com/', true],
  ['dev.*', 'https://develop.acme.com/', false],
  ['dev.*', 'https://api.dev.acme.com/', false],
  ['dev-*', 'https://dev-api.acme.com/', true],
  ['dev-*', 'https://dev.acme.com/', false],
  ['*-dev.*', 'https://api-dev.acme.com/', true],
  ['*.dev.*', 'https://api.dev.acme.com/', true],
  ['*.dev.*', 'https://dev.acme.com/', true],
  // 끝이 * 인 패턴은 뒤에 무엇이 붙어도 매칭된다 (열린 패턴의 성질)
  ['*.dev.*', 'https://dev.acme.com.evil.io/', true],
  // 끝까지 적으면 서픽스가 붙은 유사 도메인을 막는다
  ['*.dev.acme.com', 'https://api.dev.acme.com/', true],
  ['*.dev.acme.com', 'https://dev.acme.com.evil.io/', false],

  // scheme·경로·정규식
  ['https://example.com/admin/*', 'https://example.com/admin/users', true],
  ['https://example.com/admin/*', 'https://example.com/', false],
  ['https://example.com/admin/*', 'http://example.com/admin/users', false],
  ['example.com/admin/*', 'http://example.com/admin/users', true],
  ['acme.co.kr', 'https://acme.co.kr/', true],
  ['acme.co.kr', 'https://www.acme.co.kr/', false],
  ['*.acme.co.kr', 'https://www.acme.co.kr/', true],
  ['/^https:\\/\\/\\w+\\.corp\\./', 'https://intra.corp.acme/', true],
  ['/^https:\\/\\/\\w+\\.corp\\./', 'http://intra.corp.acme/', false]
].forEach((c) => expectMatch(c[0], c[1], c[2]));

console.log('');
console.log('── 기본 환경 매칭 (배열 순서 = 우선순위) ──');
[
  ['http://localhost:5173/', 'LOCAL'],
  ['http://127.0.0.1:8000/', 'LOCAL'],
  ['https://local.acme.com/', 'LOCAL'],
  ['https://local-api.acme.com/', 'LOCAL'],
  ['https://admin-local.acme.com/', 'LOCAL'],
  ['https://dev.acme.com/', 'DEVELOPMENT'],
  ['https://dev-api.acme.com/', 'DEVELOPMENT'],
  ['https://dev-admin.boncaremall.com/', 'DEVELOPMENT'],
  ['https://boncaremall.com/', null],
  ['https://api-dev.acme.com/', 'DEVELOPMENT'],
  ['https://api.dev.acme.com/', 'DEVELOPMENT'],
  ['https://stg.acme.com/', 'DEVELOPMENT'],
  // local 이 dev 보다 앞이므로 둘 다 걸리면 LOCAL 이 이긴다
  ['https://dev-local.acme.com/', 'LOCAL'],
  // 운영은 기본 패턴이 비어 있어 아무 환경에도 걸리지 않는다
  ['https://acme.com/', null]
].forEach((c) => expectEnv(c[0], c[1]));

console.log('');
console.log('── 패턴 추천 (팝업) ──');
const suggested = M.suggestPatterns('https://admin.dev.acme.co.kr:8443/board/list');
console.log(suggested.join('  '));
if (suggested.includes('*.co.kr')) {
  console.log('FAIL  등록 불가한 상위 도메인이 추천되었습니다');
  fail++;
}

console.log('');
console.log(fail === 0 ? '전체 통과' : `실패 ${fail}건`);
process.exit(fail === 0 ? 0 : 1);
