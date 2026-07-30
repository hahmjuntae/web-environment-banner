/*
 * 번들된 Pretendard Variable 을 현재 document 의 폰트 목록에 등록한다.
 *
 * Shadow DOM 안의 @font-face 는 무시되므로 배너는 document.fonts 경유가 유일한 방법이다.
 * 주입 대상 페이지가 font-src 를 좁게 잡은 CSP 를 쓰면 로드가 거부될 수 있고,
 * 그때는 FAMILY 의 system-ui 폴백이 받는다.
 */
(function (root) {
  'use strict';

  const FILE = 'assets/fonts/PretendardVariable.woff2';
  const FAMILY =
    '"Pretendard Variable", Pretendard, ui-sans-serif, system-ui, -apple-system, ' +
    'BlinkMacSystemFont, "Segoe UI", Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

  let pending = null;

  function ensure() {
    if (pending) return pending;

    const unsupported =
      typeof document === 'undefined' || !document.fonts || typeof FontFace === 'undefined';
    if (unsupported) {
      pending = Promise.resolve(false);
      return pending;
    }

    let url;
    try {
      url = chrome.runtime.getURL(FILE);
    } catch (_) {
      pending = Promise.resolve(false);
      return pending;
    }

    const face = new FontFace('Pretendard Variable', `url("${url}") format("woff2")`, {
      weight: '400 900',
      style: 'normal',
      display: 'swap'
    });

    pending = face
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        return true;
      })
      .catch(() => false);

    return pending;
  }

  root.EnvBannerFont = { ensure, FAMILY, MONO };
})(typeof globalThis !== 'undefined' ? globalThis : self);
