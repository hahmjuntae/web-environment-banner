/* 설정 화면 로직 */
(function () {
  'use strict';

  const D = EnvBannerDefaults;
  const t = EnvBannerI18n.t;
  const $ = (sel) => document.querySelector(sel);

  const envList = $('#envList');
  const template = $('#envTemplate');
  const tester = $('#tester');
  const testerResult = $('#testerResult');
  const toast = $('#toast');

  /* id → 값 종류. state.settings 의 키와 1:1 로 맞춰 둔다. */
  const SETTING_FIELDS = {
    enabled: 'bool',
    position: 'text',
    direction: 'text',
    height: 'number',
    fontSize: 'number',
    speed: 'number',
    gap: 'number',
    showWarning: 'bool',
    stripes: 'bool',
    pushContent: 'bool',
    offsetFixed: 'bool',
    pauseOnHover: 'bool',
    dismissible: 'bool'
  };

  const RANGE_UNITS = { height: 'px', fontSize: 'px', speed: 'px/s', gap: 'px' };

  let state = null;
  const previews = new Map();

  /* ── 저장 ─────────────────────────────── */
  let saveTimer = 0;
  let lastSavedJson = '';

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      saveTimer = 0;
      // 내가 쓴 값이 onChange 로 되돌아와 편집 중인 입력을 리렌더하지 않도록 기억해 둔다
      lastSavedJson = JSON.stringify(EnvBannerStore.normalize(state));
      await EnvBannerStore.set(state);
      showToast(t('optToastSaved', 'Saved'));
    }, 250);
  }

  let toastTimer = 0;
  function showToast(message) {
    toast.textContent = message;
    toast.dataset.show = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.dataset.show = '0';
    }, 1400);
  }

  /* ── 유틸 ─────────────────────────────── */
  function paintIcons(scope) {
    scope.querySelectorAll('[data-icon]').forEach((el) => {
      if (el.firstElementChild) return;
      el.innerHTML = EnvBannerIcons.icon(el.dataset.icon);
    });
  }

  function expandHex(hex, fallback) {
    const s = String(hex || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(s)) {
      return ('#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]).toLowerCase();
    }
    return fallback;
  }

  function findEnv(id) {
    return state.environments.find((e) => e.id === id) || null;
  }

  function newId() {
    return 'env-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e4).toString(36);
  }

  /* ── 환경 카드 ─────────────────────────── */
  function buildEnvCard(env) {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = env.id;
    node.dataset.off = env.enabled ? '0' : '1';

    node.querySelector('[data-f="enabled"]').checked = env.enabled;
    node.querySelector('[data-f="label"]').value = env.label;
    node.querySelector('[data-f="bg"]').value = expandHex(env.bg, '#2e2e2e');
    node.querySelector('[data-f="fg"]').value = expandHex(env.fg, '#f5f5f5');
    node.querySelector('[data-f="patterns"]').value = env.patterns.join('\n');

    const swatches = node.querySelector('[data-role="swatches"]');
    D.COLOR_PRESETS.forEach((preset) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch';
      btn.dataset.bg = preset.bg;
      btn.dataset.fg = preset.fg;
      btn.style.background = preset.bg;
      btn.title = preset.name;
      btn.textContent = preset.name;
      swatches.appendChild(btn);
    });

    paintIcons(node);
    EnvBannerI18n.apply(node);
    return node;
  }

  function renderEnvs() {
    previews.forEach((p) => p.destroy());
    previews.clear();
    envList.textContent = '';

    state.environments.forEach((env) => {
      const card = buildEnvCard(env);
      envList.appendChild(card);
      // 폭 측정을 위해 DOM 에 붙인 뒤 마운트
      const holder = card.querySelector('[data-role="preview"]');
      previews.set(
        env.id,
        EnvBannerUI.mount(holder, { env, settings: state.settings, mode: 'inline' })
      );
    });
  }

  function updatePreview(env) {
    const p = previews.get(env.id);
    if (p) p.update(env, state.settings);
  }

  function updateAllPreviews() {
    state.environments.forEach(updatePreview);
  }

  /* ── 환경 카드 이벤트 ───────────────────── */
  envList.addEventListener('input', (e) => {
    const card = e.target.closest('.env');
    const field = e.target.dataset.f;
    if (!card || !field) return;

    const env = findEnv(card.dataset.id);
    if (!env) return;

    if (field === 'enabled') {
      env.enabled = e.target.checked;
      card.dataset.off = env.enabled ? '0' : '1';
    } else if (field === 'label') {
      env.label = e.target.value;
    } else if (field === 'patterns') {
      env.patterns = e.target.value
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (field === 'bg' || field === 'fg') {
      env[field] = e.target.value;
    }

    updatePreview(env);
    updateTester();
    save();
  });

  envList.addEventListener('click', (e) => {
    const card = e.target.closest('.env');
    if (!card) return;
    const env = findEnv(card.dataset.id);
    if (!env) return;

    const swatch = e.target.closest('.swatch');
    if (swatch) {
      env.bg = swatch.dataset.bg;
      env.fg = swatch.dataset.fg;
      card.querySelector('[data-f="bg"]').value = expandHex(env.bg, '#2e2e2e');
      card.querySelector('[data-f="fg"]').value = expandHex(env.fg, '#f5f5f5');
      updatePreview(env);
      save();
      return;
    }

    const act = e.target.closest('[data-act]');
    if (!act) return;
    const index = state.environments.indexOf(env);

    if (act.dataset.act === 'up' && index > 0) {
      state.environments.splice(index - 1, 0, state.environments.splice(index, 1)[0]);
    } else if (act.dataset.act === 'down' && index < state.environments.length - 1) {
      state.environments.splice(index + 1, 0, state.environments.splice(index, 1)[0]);
    } else if (act.dataset.act === 'del') {
      if (!confirm(t('optConfirmDelete', 'Delete "$1"?', [env.label]))) return;
      state.environments.splice(index, 1);
    } else {
      return;
    }

    renderEnvs();
    updateTester();
    save();
  });

  $('#addEnv').addEventListener('click', () => {
    const preset = D.COLOR_PRESETS[state.environments.length % D.COLOR_PRESETS.length];
    state.environments.push({
      id: newId(),
      label: t('optNewEnvLabel', 'NEW'),
      enabled: true,
      bg: preset.bg,
      fg: preset.fg,
      patterns: []
    });
    renderEnvs();
    save();
    const last = envList.querySelector('.env:last-child .env-name');
    if (last) {
      last.focus();
      last.select();
    }
  });

  /* ── 배너 설정 ─────────────────────────── */
  function fillSettings() {
    Object.keys(SETTING_FIELDS).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (SETTING_FIELDS[id] === 'bool') el.checked = !!state.settings[id];
      else el.value = state.settings[id];
    });
    syncOutputs();
  }

  function syncOutputs() {
    Object.keys(RANGE_UNITS).forEach((id) => {
      const out = document.getElementById(id + 'Out');
      if (out) out.value = `${state.settings[id]}${RANGE_UNITS[id]}`;
    });
  }

  function bindSettings() {
    Object.keys(SETTING_FIELDS).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const kind = SETTING_FIELDS[id];
        state.settings[id] =
          kind === 'bool' ? el.checked : kind === 'number' ? Number(el.value) : el.value;
        syncOutputs();
        updateAllPreviews();
        save();
      });
    });
  }

  /* ── URL 확인 ──────────────────────────── */
  function updateTester() {
    const raw = tester.value.trim();
    testerResult.textContent = '';
    if (!raw) return;

    const url = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : 'https://' + raw;
    const found = EnvBannerMatch.find(url, state.environments);

    if (!found) {
      const none = document.createElement('span');
      none.className = 'dim';
      none.textContent = t('optNoMatch', 'No match');
      testerResult.appendChild(none);
      return;
    }

    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.style.background = found.env.bg;

    const label = document.createElement('span');
    label.textContent = found.env.label;

    const pattern = document.createElement('span');
    pattern.className = 'dim mono';
    pattern.textContent = found.pattern;

    testerResult.append(chip, label, pattern);
  }

  tester.addEventListener('input', updateTester);

  /* ── 설정 파일 ─────────────────────────── */
  $('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'web-environment-banner.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  $('#importBtn').addEventListener('click', () => $('#importFile').click());

  $('#importFile').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      state = EnvBannerStore.normalize(JSON.parse(text));
      fillSettings();
      renderEnvs();
      updateTester();
      await EnvBannerStore.set(state);
      showToast(t('optToastImported', 'Imported'));
    } catch (_) {
      showToast(t('optToastImportFailed', 'Import failed'));
    }
  });

  $('#resetBtn').addEventListener('click', async () => {
    if (!confirm(t('optConfirmReset', 'Reset all settings to defaults?'))) return;
    state = EnvBannerStore.normalize(null);
    fillSettings();
    renderEnvs();
    updateTester();
    await EnvBannerStore.set(state);
    showToast(t('optToastReset', 'Reset to defaults'));
  });

  /* ── 초기화 ───────────────────────────── */
  (async function init() {
    EnvBannerFont.ensure();
    $('#mark').innerHTML = EnvBannerIcons.MARK;
    paintIcons(document);
    EnvBannerI18n.apply(document);

    state = await EnvBannerStore.get();
    fillSettings();
    bindSettings();
    renderEnvs();
    updateTester();

    // 다른 탭·팝업에서 바꾼 설정만 반영한다
    EnvBannerStore.onChange((cfg) => {
      if (saveTimer) return;
      if (JSON.stringify(cfg) === lastSavedJson) return;
      if (envList.contains(document.activeElement)) return;
      state = cfg;
      fillSettings();
      renderEnvs();
      updateTester();
    });
  })();
})();
