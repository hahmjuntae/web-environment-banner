/*
 * URL 패턴 매칭.
 *
 * 지원 형식
 *   localhost                 → 모든 scheme/포트/경로의 localhost
 *   localhost:3000            → 포트까지 고정
 *   *.dev.example.com         → 서브도메인 와일드카드 (dev.example.com 자체도 포함)
 *   dev.*                     → dev 로 시작하는 호스트
 *   https://example.com/admin/*  → scheme·경로까지 지정
 *   /^https:\/\/\w+\.corp\./   → 슬래시로 감싸면 정규식 그대로 사용
 */
(function (root) {
  'use strict';

  const cache = new Map();

  function escapeRe(s) {
    return s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  }

  /* 호스트(+포트) 구간: * 는 점/슬래시를 제외한 아무 문자 */
  function hostToRe(host) {
    let out = '';
    let rest = host;

    // 선행 "*." 은 "서브도메인이 있거나 없거나"로 처리
    if (rest.startsWith('*.')) {
      out += '(?:[^/]*\\.)?';
      rest = rest.slice(2);
    }

    out += escapeRe(rest).replace(/\*/g, '[^/:]*');

    // 패턴에 포트가 없으면 어떤 포트든 허용
    if (!/:/.test(rest)) out += '(?::\\d+)?';

    return out;
  }

  function pathToRe(path) {
    return escapeRe(path).replace(/\*/g, '.*');
  }

  function toRegExp(pattern) {
    const raw = String(pattern || '').trim();
    if (!raw) return null;
    if (cache.has(raw)) return cache.get(raw);

    let re = null;
    try {
      const literal = raw.match(/^\/(.+)\/([gimsuy]*)$/);
      if (literal) {
        re = new RegExp(literal[1], literal[2].replace(/g/g, ''));
      } else {
        let body = raw;
        let scheme = '[a-z][a-z0-9+.\\-]*';

        const withScheme = body.match(/^([A-Za-z*][A-Za-z0-9+.*\-]*):\/\/(.*)$/);
        if (withScheme) {
          scheme = withScheme[1] === '*'
            ? '[a-z][a-z0-9+.\\-]*'
            : escapeRe(withScheme[1].toLowerCase()).replace(/\*/g, '[a-z0-9+.\\-]*');
          body = withScheme[2];
        }

        const slash = body.indexOf('/');
        const host = slash === -1 ? body : body.slice(0, slash);
        const path = slash === -1 ? '/*' : body.slice(slash);

        if (!host) return null;
        re = new RegExp('^' + scheme + '://' + hostToRe(host) + pathToRe(path) + '$', 'i');
      }
    } catch (_) {
      re = null;
    }

    cache.set(raw, re);
    return re;
  }

  /* 비교용으로 URL 정규화 — 경로 없는 URL도 항상 "/" 를 갖도록 */
  function normalizeUrl(url) {
    try {
      const u = new URL(url);
      return u.href;
    } catch (_) {
      return String(url || '');
    }
  }

  function testPattern(url, pattern) {
    const re = toRegExp(pattern);
    if (!re) return false;
    const target = normalizeUrl(url);
    return re.test(target) || re.test(target.replace(/\/$/, ''));
  }

  /* 매칭되는 첫 환경을 { env, pattern } 으로 반환. 배열 순서 = 우선순위 */
  function find(url, environments) {
    if (!Array.isArray(environments)) return null;
    for (const env of environments) {
      if (!env || env.enabled === false) continue;
      const patterns = Array.isArray(env.patterns) ? env.patterns : [];
      for (const p of patterns) {
        if (testPattern(url, p)) return { env, pattern: p };
      }
    }
    return null;
  }

  /* co.kr / co.uk 처럼 등록 불가한 상위 도메인이면 와일드카드 제안에서 빼야 한다 */
  const SECOND_LEVEL = new Set(['co', 'or', 'ne', 'go', 'ac', 're', 'pe', 'com', 'net', 'org', 'edu', 'gov']);

  function isPublicSuffixLike(host) {
    const parts = host.split('.');
    if (parts.length === 1) return true;
    if (parts.length === 2) return SECOND_LEVEL.has(parts[0].toLowerCase());
    return false;
  }

  /* 현재 URL 에서 패턴 후보를 뽑아준다 (팝업의 "추가" 버튼용) */
  function suggestPatterns(url) {
    try {
      const u = new URL(url);
      const host = u.hostname;
      const out = [u.port ? `${host}:${u.port}` : host];
      if (u.port) out.push(host);

      const parts = host.split('.');
      if (parts.length > 2) {
        const parent = parts.slice(1).join('.');
        if (!isPublicSuffixLike(parent)) out.push('*.' + parent);
      }

      const path = u.pathname.replace(/\/+$/, '');
      if (path) out.push(`${u.protocol}//${u.host}${path}/*`);

      return [...new Set(out)];
    } catch (_) {
      return [];
    }
  }

  root.EnvBannerMatch = { toRegExp, testPattern, find, suggestPatterns, normalizeUrl };
})(typeof globalThis !== 'undefined' ? globalThis : self);
