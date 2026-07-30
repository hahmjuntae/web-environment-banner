/* 팝업: 현재 탭의 매칭 상태 확인 + 원클릭 등록 */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const statusEl = $('#status');
  const urlEl = $('#url');
  const assignEl = $('#assign');
  const envSelect = $('#envSelect');
  const patternSelect = $('#patternSelect');
  const previewFrame = $('#previewFrame');
  const enabledEl = $('#enabled');

  let config = null;
  let tabUrl = '';
  let preview = null;

  function paintIcons(scope) {
    scope.querySelectorAll('[data-icon]').forEach((el) => {
      if (el.firstElementChild) return;
      el.innerHTML = EnvBannerIcons.icon(el.dataset.icon);
    });
  }

  function text(content, cls) {
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = content;
    return span;
  }

  function chip(color) {
    const el = document.createElement('span');
    el.className = 'chip';
    el.style.background = color;
    return el;
  }

  /* manifest 의 content_scripts matches 와 일치해야 한다 */
  function isInjectable(url) {
    return /^https?:\/\//i.test(url);
  }

  function render() {
    enabledEl.checked = config.settings.enabled;
    urlEl.textContent = tabUrl || '';
    urlEl.hidden = !tabUrl;
    statusEl.textContent = '';

    if (!isInjectable(tabUrl)) {
      previewFrame.hidden = true;
      assignEl.hidden = true;
      statusEl.appendChild(text('이 페이지에는 넣을 수 없습니다', 'dim'));
      return;
    }

    const found = EnvBannerMatch.find(tabUrl, config.environments);

    if (found) {
      assignEl.hidden = true;
      previewFrame.hidden = false;
      const holder = $('#preview');
      if (preview) preview.update(found.env, config.settings);
      else {
        preview = EnvBannerUI.mount(holder, {
          env: found.env,
          settings: config.settings,
          mode: 'inline'
        });
      }

      statusEl.append(chip(found.env.bg), text(found.env.label), text(found.pattern, 'dim mono'));
      if (!config.settings.enabled) statusEl.appendChild(text('· 꺼져 있음', 'dim'));
      return;
    }

    previewFrame.hidden = true;
    assignEl.hidden = false;
    statusEl.appendChild(text('일치 없음', 'dim'));

    envSelect.textContent = '';
    config.environments.forEach((env) => {
      const opt = document.createElement('option');
      opt.value = env.id;
      opt.textContent = env.label;
      envSelect.appendChild(opt);
    });

    patternSelect.textContent = '';
    EnvBannerMatch.suggestPatterns(tabUrl).forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      patternSelect.appendChild(opt);
    });
  }

  $('#addBtn').addEventListener('click', async () => {
    const env = config.environments.find((e) => e.id === envSelect.value);
    const pattern = patternSelect.value;
    if (!env || !pattern) return;

    if (!env.patterns.includes(pattern)) env.patterns.push(pattern);
    env.enabled = true;
    await EnvBannerStore.set(config);
    config = await EnvBannerStore.get();
    render();
  });

  enabledEl.addEventListener('change', async () => {
    config.settings.enabled = enabledEl.checked;
    await EnvBannerStore.set(config);
    render();
  });

  $('#openOptions').addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
    else window.open(chrome.runtime.getURL('src/options/options.html'));
    window.close();
  });

  (async function init() {
    EnvBannerFont.ensure();
    $('#mark').innerHTML = EnvBannerIcons.MARK;
    paintIcons(document);

    config = await EnvBannerStore.get();

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      tabUrl = (tabs && tabs[0] && tabs[0].url) || '';
    } catch (_) {
      tabUrl = '';
    }

    render();
  })();
})();
