/* 인라인 SVG 아이콘. lucide 라인 아이콘 규격(24 그리드, stroke 1.5)을 따른다. */
(function (root) {
  'use strict';

  /* 확장 마크 — 배너 띠 + 그 아래로 밀려난 컨텐츠 */
  const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
<rect x="0" y="3" width="32" height="9"/>
<rect x="0" y="17" width="32" height="4" opacity="0.45"/>
<rect x="0" y="24" width="20" height="4" opacity="0.45"/>
</svg>`;

  /*
   * 채움형 아이콘. 삼각형은 같은 색 stroke + round join 으로 모서리를 굴리고,
   * 느낌표는 mask 로 뚫어 배너 배경색이 그대로 비치게 한다.
   */
  const FILLED = {
    warning:
      '<mask id="eb-warn" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">' +
      '<rect width="24" height="24" fill="#fff"/>' +
      '<rect x="10.65" y="7.3" width="2.7" height="7.5" rx="1.35" fill="#000"/>' +
      '<circle cx="12" cy="17.75" r="1.55" fill="#000"/>' +
      '</mask>' +
      '<path d="M12 3.7 21.5 20.3H2.5Z" stroke="currentColor" stroke-width="3.4" ' +
      'stroke-linejoin="round" mask="url(#eb-warn)"/>'
  };

  const PATHS = {
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    chevronUp: '<path d="m18 15-6-6-6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8"/><path d="M3 3v5h5"/>',
    sliders: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/>'
  };

  function icon(name) {
    if (FILLED[name]) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${FILLED[name]}</svg>`;
    }
    const body = PATHS[name];
    if (!body) return '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  root.EnvBannerIcons = { MARK, icon };
})(typeof globalThis !== 'undefined' ? globalThis : self);
