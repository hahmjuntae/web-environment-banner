/*
 * UI 언어 헬퍼.
 *
 * 설정의 locale('auto' | 'en' | 'ko')로 문자열을 고른다. 'auto' 는 브라우저 표시 언어를 따른다.
 * chrome.i18n 은 브라우저 언어만 따르므로 사용자가 직접 고를 수 없어 사용하지 않는다
 * (_locales 는 스토어에 노출되는 확장 이름·설명 전용).
 */
(function (root) {
  'use strict';

  const M = root.EnvBannerMessages || { en: {}, ko: {} };
  const SUPPORTED = ['en', 'ko'];

  let requested = 'auto';

  function browserLocale() {
    let tag = '';
    try {
      if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getUILanguage) {
        tag = chrome.i18n.getUILanguage();
      }
    } catch (_) {
      /* 무시 */
    }
    if (!tag && typeof navigator !== 'undefined') {
      tag = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    }
    tag = String(tag).toLowerCase();
    return tag.startsWith('ko') ? 'ko' : 'en';
  }

  function resolved() {
    return SUPPORTED.indexOf(requested) !== -1 ? requested : browserLocale();
  }

  function setLocale(locale) {
    requested = locale === 'en' || locale === 'ko' ? locale : 'auto';
    return resolved();
  }

  function t(key, fallback, subs) {
    const table = M[resolved()] || M.en;
    let s = table[key];
    if (s === undefined) s = M.en[key];
    if (s === undefined) s = fallback !== undefined ? fallback : '';
    if (subs === undefined) return s;
    const list = Array.isArray(subs) ? subs : [subs];
    return String(s).replace(/\$(\d)/g, (m, i) => (list[i - 1] !== undefined ? list[i - 1] : m));
  }

  /* data-i18n(텍스트) · -title · -placeholder · -aria 속성을 치환 */
  function apply(scope) {
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

  root.EnvBannerI18n = {
    t,
    apply,
    setLocale,
    get locale() {
      return resolved();
    },
    LOCALES: M.LOCALES || []
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);
