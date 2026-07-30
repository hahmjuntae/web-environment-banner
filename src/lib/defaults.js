/* 기본 설정값과 색상 프리셋 (DESIGN.md 시맨틱 팔레트) */
(function (root) {
  'use strict';

  const COLOR_PRESETS = [
    { name: 'Success', bg: '#34b27c', fg: '#0a0a0a' },
    { name: 'Warning', bg: '#f5a312', fg: '#0a0a0a' },
    { name: 'Danger', bg: '#ec4860', fg: '#0a0a0a' },
    { name: 'Info', bg: '#3d8bf5', fg: '#0a0a0a' },
    { name: 'Ink', bg: '#f5f5f5', fg: '#0a0a0a' },
    { name: 'Graphite', bg: '#2e2e2e', fg: '#f5f5f5' }
  ];

  const DEFAULT_SETTINGS = {
    enabled: true,
    locale: 'auto',       // auto | en | ko — auto 는 브라우저 표시 언어
    position: 'top',      // top | bottom
    height: 40,           // px
    fontSize: 16,         // px
    speed: 55,            // px/s
    direction: 'left',    // left | right
    gap: 28,              // 반복 아이템 간격(px)
    showWarning: true,    // 경고 아이콘
    stripes: true,        // 사선 패턴
    pushContent: true,    // 문서 흐름을 배너 높이만큼 밀어내기
    offsetFixed: true,    // 사이트의 고정 헤더도 함께 내리기
    pauseOnHover: true,
    dismissible: true     // 닫기 버튼 (탭 세션 동안만 숨김)
  };

  const DEFAULT_ENVIRONMENTS = [
    {
      id: 'local',
      label: 'LOCAL',
      enabled: true,
      bg: '#34b27c',
      fg: '#0a0a0a',
      patterns: [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '*.localhost',
        'local.*',
        'local-*',
        '*-local.*'
      ]
    },
    {
      id: 'development',
      label: 'DEVELOPMENT',
      enabled: true,
      bg: '#f5a312',
      fg: '#0a0a0a',
      patterns: ['dev.*', 'dev-*', '*.dev.*', '*-dev.*', 'stg.*', '*.stg.*']
    },
    {
      id: 'production',
      label: 'PRODUCTION',
      enabled: true,
      bg: '#ec4860',
      fg: '#0a0a0a',
      patterns: []
    }
  ];

  root.EnvBannerDefaults = {
    COLOR_PRESETS,
    DEFAULT_SETTINGS,
    DEFAULT_ENVIRONMENTS,
    STORAGE_KEY: 'envBannerConfig'
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);
