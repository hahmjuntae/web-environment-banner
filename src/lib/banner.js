/*
 * 배너 렌더러. Shadow DOM 안에서만 그리므로 페이지 CSS 와 서로 간섭하지 않는다.
 * content script 와 설정 화면의 미리보기가 같은 코드를 공유한다.
 */
(function (root) {
  'use strict';

  const ICONS = root.EnvBannerIcons;
  const FONT = root.EnvBannerFont || { FAMILY: 'ui-sans-serif, system-ui, sans-serif' };

  const CSS = `
:host {
  all: initial;
  display: block;
}
* {
  box-sizing: border-box;
  border-radius: 0;
}
.bar {
  position: relative;
  height: var(--eb-h);
  overflow: hidden;
  background: var(--eb-bg);
  color: var(--eb-fg);
  font-family: ${FONT.FAMILY};
  font-size: var(--eb-fs);
  font-weight: 700;
  font-feature-settings: normal;
  letter-spacing: 0.04em;
  line-height: 1;
  user-select: none;
  -webkit-font-smoothing: antialiased;
  contain: content;
}
.bar[data-pos="top"] { border-bottom: 1px solid rgba(10, 10, 10, 0.3); }
.bar[data-pos="bottom"] { border-top: 1px solid rgba(10, 10, 10, 0.3); }
.stripes {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    115deg,
    rgba(10, 10, 10, 0.16) 0 12px,
    rgba(10, 10, 10, 0) 12px 26px
  );
  pointer-events: none;
  display: none;
}
.bar[data-stripes="1"] .stripes { display: block; }
.viewport {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.track {
  display: flex;
  flex: none;
  animation: eb-roll var(--eb-dur) linear infinite;
  will-change: transform;
}
.bar[data-dir="right"] .track { animation-direction: reverse; }
.bar[data-hoverpause="1"]:hover .track { animation-play-state: paused; }
@keyframes eb-roll {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
.group {
  display: flex;
  flex: none;
  align-items: center;
}
.item {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: calc(var(--eb-gap) * 0.42);
  padding-right: var(--eb-gap);
  white-space: nowrap;
}
.warn {
  display: inline-flex;
  align-items: center;
  height: var(--eb-icon);
}
.warn svg { display: block; height: 100%; width: auto; }
.close {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: calc(var(--eb-h) * 1.9);
  padding: 0 calc(var(--eb-h) * 0.24) 0 calc(var(--eb-h) * 0.7);
  border: 0;
  background: linear-gradient(90deg, transparent 0%, var(--eb-bg) 52%);
  color: inherit;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: flex-end;
  opacity: 0.65;
  transition: opacity 160ms cubic-bezier(0.22, 1, 0.36, 1);
}
.bar[data-close="1"] .close { display: flex; }
.close:hover { opacity: 1; }
.close svg { display: block; height: var(--eb-icon); width: auto; }
@media (prefers-reduced-motion: reduce) {
  .track { animation: none; }
  .close { transition: none; }
}
`;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  function itemHTML(env, settings) {
    const label = `<span class="label">${escapeHtml(env.label)}</span>`;
    if (!settings.showWarning) return `<span class="item">${label}</span>`;
    return `<span class="item">${label}<span class="warn">${ICONS.icon('warning')}</span></span>`;
  }

  /*
   * host: shadow root 를 붙일 요소
   * mode: 'fixed'(실제 페이지) | 'inline'(설정 화면 미리보기)
   */
  function mount(host, options) {
    const opts = options || {};
    const mode = opts.mode === 'inline' ? 'inline' : 'fixed';
    const onDismiss = typeof opts.onDismiss === 'function' ? opts.onDismiss : null;

    let env = opts.env;
    let settings = opts.settings;

    const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${CSS}</style>
<div class="bar">
  <div class="viewport"><div class="track"><div class="group"></div><div class="group"></div></div></div>
  <div class="stripes"></div>
  <button class="close" type="button" title="이 탭에서 숨기기" aria-label="숨기기">${ICONS.icon('x')}</button>
</div>`;

    const bar = shadow.querySelector('.bar');
    const groups = shadow.querySelectorAll('.group');
    const closeBtn = shadow.querySelector('.close');

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onDismiss) onDismiss();
    });

    function applyHostStyle() {
      if (mode !== 'fixed') {
        host.setAttribute('style', 'all: initial; display: block; width: 100%;');
        return;
      }
      const edge = settings.position === 'bottom' ? 'bottom: 0' : 'top: 0';
      host.setAttribute(
        'style',
        [
          'all: initial',
          'display: block',
          'position: fixed',
          edge,
          'left: 0',
          'right: 0',
          'width: 100%',
          'height: ' + settings.height + 'px',
          'margin: 0',
          'padding: 0',
          'border-radius: 0',
          'z-index: 2147483647',
          'pointer-events: auto',
          'color-scheme: normal'
        ].join(' !important;') + ' !important;'
      );
    }

    function applyVars() {
      bar.style.setProperty('--eb-h', settings.height + 'px');
      bar.style.setProperty('--eb-fs', settings.fontSize + 'px');
      bar.style.setProperty('--eb-gap', settings.gap + 'px');
      bar.style.setProperty('--eb-icon', Math.max(8, Math.round(settings.height * 0.5)) + 'px');
      bar.style.setProperty('--eb-bg', env.bg);
      bar.style.setProperty('--eb-fg', env.fg);
      bar.dataset.pos = settings.position;
      bar.dataset.dir = settings.direction;
      bar.dataset.stripes = settings.stripes ? '1' : '0';
      bar.dataset.hoverpause = settings.pauseOnHover ? '1' : '0';
      bar.dataset.close = mode === 'fixed' && settings.dismissible ? '1' : '0';
    }

    function layout() {
      const single = itemHTML(env, settings);
      groups[0].innerHTML = single;
      const first = groups[0].firstElementChild;
      const oneWidth = first ? first.getBoundingClientRect().width : 0;

      const viewWidth =
        (mode === 'fixed' ? window.innerWidth : host.getBoundingClientRect().width) || 1000;
      const unit = oneWidth > 4 ? oneWidth : 140;
      const count = Math.max(2, Math.ceil(viewWidth / unit) + 1);

      const html = single.repeat(count);
      groups[0].innerHTML = html;
      groups[1].innerHTML = html;

      const groupWidth = groups[0].getBoundingClientRect().width || unit * count;
      const duration = groupWidth / Math.max(5, settings.speed);
      bar.style.setProperty('--eb-dur', duration.toFixed(2) + 's');
    }

    let raf = 0;
    function relayout() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
    }

    applyHostStyle();
    applyVars();
    layout();

    // 폰트가 늦게 붙으면 글자 폭이 달라지므로 다시 계산한다
    if (root.EnvBannerFont) root.EnvBannerFont.ensure().then(relayout);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(relayout).catch(() => {});
    }

    const onResize = () => relayout();
    if (mode === 'fixed') window.addEventListener('resize', onResize, { passive: true });

    let ro = null;
    if (mode === 'inline' && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(relayout);
      ro.observe(host);
    }

    return {
      get height() {
        return settings.height;
      },
      update(nextEnv, nextSettings) {
        env = nextEnv || env;
        settings = nextSettings || settings;
        applyHostStyle();
        applyVars();
        layout();
      },
      destroy() {
        cancelAnimationFrame(raf);
        if (mode === 'fixed') window.removeEventListener('resize', onResize);
        if (ro) ro.disconnect();
        shadow.innerHTML = '';
        host.removeAttribute('style');
      }
    };
  }

  root.EnvBannerUI = { mount };
})(typeof globalThis !== 'undefined' ? globalThis : self);
