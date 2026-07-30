/*
 * 로케일 문자열 헬퍼.
 *
 * HTML·JS 에는 영어 원문을 그대로 두고, 확장 안에서 실행될 때만 chrome.i18n 값으로 교체한다.
 * 그래서 chrome API 가 없는 환경(test/preview.html, test/harness.html)에서도 영어로 읽힌다.
 */
(function (root) {
  'use strict';

  const available =
    typeof chrome !== 'undefined' && chrome.i18n && typeof chrome.i18n.getMessage === 'function';

  function t(key, fallback, subs) {
    if (available) {
      try {
        const s = chrome.i18n.getMessage(key, subs);
        if (s) return s;
      } catch (_) {
        /* 무시하고 폴백 */
      }
    }
    if (fallback === undefined) return '';
    if (subs === undefined) return fallback;
    const list = Array.isArray(subs) ? subs : [subs];
    return String(fallback).replace(/\$(\d)/g, (m, i) =>
      list[i - 1] !== undefined ? list[i - 1] : m
    );
  }

  /* data-i18n(텍스트) · -title · -placeholder · -aria 속성을 치환 */
  function apply(scope) {
    if (!available) return;

    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      const s = t(el.dataset.i18n);
      if (s) el.textContent = s;
    });
    scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const s = t(el.dataset.i18nTitle);
      if (s) el.title = s;
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const s = t(el.dataset.i18nPlaceholder);
      if (s) el.placeholder = s;
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const s = t(el.dataset.i18nAria);
      if (s) el.setAttribute('aria-label', s);
    });
  }

  root.EnvBannerI18n = { t, apply, available };
})(typeof globalThis !== 'undefined' ? globalThis : self);
