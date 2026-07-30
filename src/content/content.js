/* 페이지에 배너를 붙이는 content script */
(function () {
  'use strict';

  // iframe 안에서는 그리지 않는다
  if (window.top !== window) return;

  const TAG = 'web-env-banner-root';
  const DISMISS_KEY = '__webEnvBannerDismissed';
  const OFFSET_MARK = 'data-web-env-banner-offset';

  let config = null;
  let host = null;
  let instance = null;
  let pushedProp = null;
  let lastUrl = location.href;

  /* 고정 요소의 원래 인라인 값 보관 — 원복할 때 사이트 값을 잃지 않도록 */
  const savedOffsets = new WeakMap();

  function isDismissed() {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function setDismissed() {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch (_) {
      /* 스토리지가 막힌 사이트면 이번 페이지에서만 사라진다 */
    }
  }

  /* 문서 흐름을 배너 높이만큼 밀어낸다 */
  function setPush(on, settings) {
    const el = document.documentElement;
    const prop = settings.position === 'bottom' ? 'padding-bottom' : 'padding-top';

    if (pushedProp && (!on || pushedProp !== prop)) {
      el.style.removeProperty(pushedProp);
      pushedProp = null;
    }
    if (on) {
      el.style.setProperty(prop, settings.height + 'px', 'important');
      pushedProp = prop;
    }
  }

  /*
   * 사이트가 직접 띄운 fixed·sticky 헤더는 문서 흐름 밖이라 padding 으로 밀리지 않는다.
   * 배너와 겹치는 것만 찾아 top(또는 bottom)을 배너 높이만큼 내려준다.
   */
  function offsetFixed(settings) {
    const height = settings.height;
    const atTop = settings.position !== 'bottom';
    const prop = atTop ? 'top' : 'bottom';
    const probeY = atTop
      ? height + 2
      : Math.max(1, window.innerHeight - height - 2);

    const candidates = new Set();
    const xs = [0.12, 0.5, 0.88].map((r) => Math.max(1, Math.round(window.innerWidth * r)));

    for (const x of xs) {
      let stack;
      try {
        stack = document.elementsFromPoint(x, probeY);
      } catch (_) {
        continue;
      }
      for (const el of stack) {
        let node = el;
        let depth = 0;
        while (
          node &&
          node.nodeType === 1 &&
          node !== document.body &&
          node !== document.documentElement &&
          depth < 12
        ) {
          if (node !== host && !(host && host.contains(node))) candidates.add(node);
          node = node.parentElement;
          depth++;
        }
      }
    }

    candidates.forEach((el) => {
      if (el.hasAttribute(OFFSET_MARK)) return;

      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') return;

      const current = parseFloat(cs[prop]);
      if (!Number.isFinite(current)) return; // auto 는 상단 고정이 아니다

      const rect = el.getBoundingClientRect();
      if (rect.height > 260) return; // 전면 오버레이·모달은 건드리지 않는다
      if (atTop && rect.top > height + 4) return;
      if (!atTop && rect.bottom < window.innerHeight - height - 4) return;

      savedOffsets.set(el, {
        prop,
        value: el.style.getPropertyValue(prop),
        priority: el.style.getPropertyPriority(prop)
      });
      el.setAttribute(OFFSET_MARK, '');
      el.style.setProperty(prop, current + height + 'px', 'important');
    });
  }

  function clearFixedOffsets() {
    document.querySelectorAll('[' + OFFSET_MARK + ']').forEach((el) => {
      const saved = savedOffsets.get(el);
      el.removeAttribute(OFFSET_MARK);
      if (!saved) {
        el.style.removeProperty('top');
        el.style.removeProperty('bottom');
        return;
      }
      savedOffsets.delete(el);
      if (saved.value) el.style.setProperty(saved.prop, saved.value, saved.priority);
      else el.style.removeProperty(saved.prop);
    });
  }

  function teardown() {
    if (instance) {
      instance.destroy();
      instance = null;
    }
    if (host) {
      host.remove();
      host = null;
    }
    if (pushedProp) {
      document.documentElement.style.removeProperty(pushedProp);
      pushedProp = null;
    }
    clearFixedOffsets();
  }

  function apply() {
    if (!config) return;

    const found = config.settings.enabled
      ? EnvBannerMatch.find(location.href, config.environments)
      : null;

    if (!found || isDismissed()) {
      teardown();
      return;
    }

    // body 를 기다리지 않는다 — <html> 에 붙이면 body 의 transform 영향도 받지 않는다
    if (!host || !host.isConnected) {
      if (host) host.remove();
      host = document.createElement(TAG);
      document.documentElement.appendChild(host);
      instance = null;
    }

    if (!instance) {
      instance = EnvBannerUI.mount(host, {
        env: found.env,
        settings: config.settings,
        mode: 'fixed',
        onDismiss: () => {
          setDismissed();
          teardown();
        }
      });
    } else {
      instance.update(found.env, config.settings);
    }

    setPush(config.settings.pushContent, config.settings);

    if (config.settings.offsetFixed) offsetFixed(config.settings);
    else clearFixedOffsets();
  }

  EnvBannerFont.ensure();

  EnvBannerStore.get().then((cfg) => {
    config = cfg;
    apply();
  });

  EnvBannerStore.onChange((cfg) => {
    const prev = config;
    config = cfg;
    // 높이·위치가 바뀌면 이전 보정값이 어긋나므로 걷어내고 다시 잡는다
    if (
      prev &&
      (prev.settings.height !== cfg.settings.height ||
        prev.settings.position !== cfg.settings.position ||
        prev.settings.offsetFixed !== cfg.settings.offsetFixed)
    ) {
      clearFixedOffsets();
    }
    apply();
  });

  /*
   * SPA 라우팅은 격리된 실행 컨텍스트에서 history 이벤트를 직접 받을 수 없어 1초 폴링.
   * 나중에 렌더된 고정 헤더를 잡고, 페이지가 배너를 지웠을 때 되살리는 역할도 겸한다.
   */
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      apply();
      return;
    }
    if (host && !host.isConnected) {
      instance = null;
      apply();
      return;
    }
    if (instance && config && config.settings.offsetFixed) offsetFixed(config.settings);
  }, 1000);
})();
