/* 페이지에 배너를 붙이는 content script */
(function () {
  'use strict';

  // iframe 안에서는 그리지 않는다
  if (window.top !== window) return;

  const TAG = 'web-env-banner-root';
  const PUSH_STYLE_ID = 'web-env-banner-push';
  const DISMISS_KEY = '__webEnvBannerDismissed';
  const OFFSET_MARK = 'data-web-env-banner-offset';
  const PUSH_PROPS = ['padding-top', 'padding-bottom'];

  let config = null;
  let host = null;
  let instance = null;
  let lastUrl = location.href;

  /* 밀어내기 상태 — 사이트가 지워도 다시 세울 수 있게 기대값을 들고 있는다 */
  let pushStyleEl = null;
  let pushProp = null;
  let pushPx = 0;
  let lastPushCheck = 0;

  /*
   * 보정한 고정 요소들. 마커 속성은 사이트 스크립트가 지울 수 있어 추적에 쓰지 않고,
   * 이 Set 을 기준으로 순회한다. 끊긴 요소는 순회 중에 걷어낸다.
   */
  const offsetEls = new Set();
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

  /*
   * 문서 흐름을 배너 높이만큼 밀어낸다.
   * 인라인 스타일은 사이트가 html 의 style 속성을 리셋하거나 cssText 로 덮어쓰면 함께 날아가
   * 배너가 콘텐츠를 가린 채 남는다. 그래서 주입한 <style> 을 1차 수단으로 쓰고,
   * 그래도 밀리지 않으면 인라인 !important 로 승급한다. 둘 다 매 틱마다 검증한다.
   */
  function setPush(on, settings) {
    if (!on) {
      clearPush();
      return;
    }
    const prop = settings.position === 'bottom' ? 'padding-bottom' : 'padding-top';
    if (pushProp && pushProp !== prop) clearPush();
    pushProp = prop;
    pushPx = settings.height;
    enforcePush();
  }

  function pushCssText() {
    return 'html{' + pushProp + ':' + pushPx + 'px !important;}';
  }

  function enforcePush() {
    if (!pushProp) return;
    const html = document.documentElement;
    const css = pushCssText();
    let recreated = false;

    if (!pushStyleEl || !pushStyleEl.isConnected) {
      const stale = document.getElementById(PUSH_STYLE_ID);
      if (stale) stale.remove();
      pushStyleEl = document.createElement('style');
      pushStyleEl.id = PUSH_STYLE_ID;
      pushStyleEl.textContent = css;
      html.appendChild(pushStyleEl);
      recreated = true;
    } else if (pushStyleEl.textContent !== css) {
      pushStyleEl.textContent = css;
      recreated = true;
    }

    /*
     * 사이트 규칙이 우리 시트보다 뒤에 오면 시트만으로는 안 밀린다. 실제 적용값으로 확인하되
     * getComputedStyle 은 레이아웃을 강제하므로 시트를 새로 세운 직후이거나 간격이 지났을 때만 본다.
     */
    const now = Date.now();
    if (!recreated && now - lastPushCheck < 250) return;
    lastPushCheck = now;

    const applied = parseFloat(getComputedStyle(html)[pushProp]);
    if (Math.abs((Number.isFinite(applied) ? applied : 0) - pushPx) > 0.5) {
      html.style.setProperty(pushProp, pushPx + 'px', 'important');
    }
  }

  function clearPush() {
    if (pushStyleEl) {
      pushStyleEl.remove();
      pushStyleEl = null;
    }
    const stale = document.getElementById(PUSH_STYLE_ID);
    if (stale) stale.remove();
    PUSH_PROPS.forEach((p) => document.documentElement.style.removeProperty(p));
    pushProp = null;
    lastPushCheck = 0;
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
      if (offsetEls.has(el)) return; // 이미 보정한 요소는 enforceOffsets 가 지킨다

      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') return;

      const current = parseFloat(cs[prop]);
      if (!Number.isFinite(current)) return; // auto 는 상단 고정이 아니다

      const rect = el.getBoundingClientRect();
      if (rect.height > 260) return; // 전면 오버레이·모달은 건드리지 않는다
      if (atTop && rect.top > height + 4) return;
      if (!atTop && rect.bottom < window.innerHeight - height - 4) return;

      pushElement(el, prop, current, height);
    });
  }

  /* 요소 하나를 배너 높이만큼 내린다. 원래 인라인 값은 원복용으로 보관한다 */
  function pushElement(el, prop, base, height) {
    const applied = base + height + 'px';
    savedOffsets.set(el, {
      prop,
      value: el.style.getPropertyValue(prop),
      priority: el.style.getPropertyPriority(prop),
      applied
    });
    offsetEls.add(el);
    el.setAttribute(OFFSET_MARK, '');
    el.style.setProperty(prop, applied, 'important');
  }

  /*
   * 프레임워크가 리렌더하며 헤더의 인라인 style 을 다시 쓰면 보정값이 지워진다.
   * 마커만 보고 건너뛰면 그 헤더는 영구히 배너에 가린 채 남으므로, 값이 우리 것이
   * 아니게 된 순간 사이트가 새로 쓴 값을 기준으로 다시 밀어낸다.
   */
  function enforceOffsets(settings) {
    if (!offsetEls.size) return;
    const height = settings.height;
    const prop = settings.position !== 'bottom' ? 'top' : 'bottom';

    offsetEls.forEach((el) => {
      const saved = savedOffsets.get(el);
      if (!el.isConnected || !saved || saved.prop !== prop) {
        offsetEls.delete(el);
        savedOffsets.delete(el);
        return;
      }

      const inline = el.style.getPropertyValue(prop);
      if (inline === saved.applied) return; // 그대로 유지되고 있다

      // 사이트가 방금 쓴 값을 새 기준으로 삼는다 — 없으면 계산값에서 읽는다
      let base = parseFloat(inline);
      if (!Number.isFinite(base)) {
        el.style.removeProperty(prop);
        base = parseFloat(getComputedStyle(el)[prop]);
      }
      if (!Number.isFinite(base)) {
        // top/bottom 이 auto 로 바뀌었으면 더는 상단 고정이 아니다 — 손대지 않는다
        offsetEls.delete(el);
        savedOffsets.delete(el);
        el.removeAttribute(OFFSET_MARK);
        return;
      }
      pushElement(el, prop, base, height);
    });
  }

  function clearFixedOffsets() {
    const targets = new Set(offsetEls);
    document.querySelectorAll('[' + OFFSET_MARK + ']').forEach((el) => targets.add(el));

    targets.forEach((el) => {
      const saved = savedOffsets.get(el);
      offsetEls.delete(el);
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
    clearPush();
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
    EnvBannerI18n.setLocale(cfg.settings.locale);
    apply();
  });

  EnvBannerStore.onChange((cfg) => {
    const prev = config;
    config = cfg;
    EnvBannerI18n.setLocale(cfg.settings.locale);
    // 언어가 바뀌면 배너의 버튼 라벨을 다시 만들어야 한다
    if (prev && prev.settings.locale !== cfg.settings.locale && instance) {
      instance.destroy();
      instance = null;
    }
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

  /* 배너가 세운 상태가 아직 유효한지 확인하고 어긋난 것만 되돌린다 */
  function enforce() {
    if (!config || !instance) return;
    if (host && !host.isConnected) {
      instance = null;
      apply();
      return;
    }
    if (config.settings.pushContent) enforcePush();
    if (config.settings.offsetFixed) enforceOffsets(config.settings);
  }

  let tickRaf = 0;
  let lastScan = 0;

  /*
   * DOM 이 움직일 때마다 한 프레임에 한 번만 점검한다.
   * SPA 라우팅은 격리된 실행 컨텍스트에서 pushState 를 후킹할 수 없지만,
   * 라우팅에는 반드시 DOM 변화가 따라오므로 폴링보다 훨씬 빠르게 붙잡을 수 있다.
   */
  function scheduleTick() {
    if (tickRaf) return;
    tickRaf = requestAnimationFrame(() => {
      tickRaf = 0;
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        apply();
        return;
      }
      enforce();
      // 새로 렌더된 고정 헤더 탐색은 비싸므로 간격을 둔다
      if (config && instance && config.settings.offsetFixed && Date.now() - lastScan > 300) {
        lastScan = Date.now();
        offsetFixed(config.settings);
      }
    });
  }

  new MutationObserver(scheduleTick).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  window.addEventListener('popstate', scheduleTick);
  window.addEventListener('hashchange', scheduleTick);

  /* 배경 탭에서는 rAF 가 멈추므로 폴링을 안전망으로 남긴다 */
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      apply();
      return;
    }
    enforce();
    if (instance && config && config.settings.offsetFixed) offsetFixed(config.settings);
  }, 1000);
})();
