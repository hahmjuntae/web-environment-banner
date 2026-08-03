/* chrome.storage.sync 래퍼 + 설정 정규화 */
(function (root) {
  'use strict';

  const D = root.EnvBannerDefaults;
  const KEY = D.STORAGE_KEY;
  const hasChrome = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;

  function clampNumber(v, min, max, fallback) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function normalizeEnv(raw, index) {
    const base = { id: '', label: 'ENV', enabled: true, bg: '#334155', fg: '#ffffff', patterns: [] };
    const env = Object.assign(base, raw && typeof raw === 'object' ? raw : {});
    env.id = String(env.id || `env${index}-${Math.abs(hash(env.label + index))}`);
    env.label = String(env.label || 'ENV').slice(0, 40);
    env.enabled = env.enabled !== false;
    env.bg = normalizeColor(env.bg, base.bg);
    env.fg = normalizeColor(env.fg, base.fg);
    env.patterns = (Array.isArray(env.patterns) ? env.patterns : [])
      .map((p) => String(p || '').trim())
      .filter(Boolean);
    return env;
  }

  function normalizeColor(v, fallback) {
    const s = String(v || '').trim();
    return /^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/i.test(s) ? s : fallback;
  }

  function hash(str) {
    let h = 0;
    for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) | 0;
    return h;
  }

  const BOOL_KEYS = [
    'enabled',
    'showWarning',
    'stripes',
    'pushContent',
    'offsetFixed',
    'pauseOnHover',
    'dismissible'
  ];

  function normalize(raw) {
    const cfg = raw && typeof raw === 'object' ? raw : {};
    const source = cfg.settings && typeof cfg.settings === 'object' ? cfg.settings : {};

    // 기본값에 있는 키만 남긴다 — 예전 버전에서 저장된 항목이 따라오지 않도록
    const settings = {};
    Object.keys(D.DEFAULT_SETTINGS).forEach((k) => {
      settings[k] = source[k] !== undefined ? source[k] : D.DEFAULT_SETTINGS[k];
    });

    settings.locale = ['auto', 'en', 'ko'].indexOf(settings.locale) !== -1 ? settings.locale : 'auto';
    settings.position = settings.position === 'bottom' ? 'bottom' : 'top';
    settings.direction = settings.direction === 'right' ? 'right' : 'left';
    settings.height = clampNumber(settings.height, 14, 80, D.DEFAULT_SETTINGS.height);
    settings.fontSize = clampNumber(settings.fontSize, 8, 32, D.DEFAULT_SETTINGS.fontSize);
    settings.speed = clampNumber(settings.speed, 0, 400, D.DEFAULT_SETTINGS.speed);
    settings.gap = clampNumber(settings.gap, 4, 160, D.DEFAULT_SETTINGS.gap);
    BOOL_KEYS.forEach((k) => {
      settings[k] = settings[k] !== false;
    });

    const list = Array.isArray(cfg.environments) && cfg.environments.length
      ? cfg.environments
      : D.DEFAULT_ENVIRONMENTS;

    return { settings, environments: list.map(normalizeEnv) };
  }

  async function get() {
    if (!hasChrome) return normalize(null);
    try {
      const res = await chrome.storage.sync.get(KEY);
      return normalize(res && res[KEY]);
    } catch (_) {
      return normalize(null);
    }
  }

  async function set(config) {
    if (!hasChrome) return;
    await chrome.storage.sync.set({ [KEY]: normalize(config) });
  }

  function onChange(callback) {
    if (!hasChrome || !chrome.storage.onChanged) return () => {};
    const handler = (changes, area) => {
      if (area !== 'sync' || !changes[KEY]) return;
      callback(normalize(changes[KEY].newValue));
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }

  root.EnvBannerStore = { get, set, onChange, normalize, KEY };
})(typeof globalThis !== 'undefined' ? globalThis : self);
