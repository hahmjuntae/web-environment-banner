/*
 * UI 문자열 카탈로그.
 *
 * chrome.i18n(_locales)은 브라우저 표시 언어만 따르므로 사용자가 UI 언어를 직접 고를 수 없다.
 * 그래서 화면 문자열은 이 파일에서 관리하고 설정의 locale 값으로 전환한다.
 * _locales 에는 스토어에 노출되는 확장 이름·설명(appName·appDesc)만 남겨 둔다.
 *
 * $1 은 치환 자리표시자.
 */
(function (root) {
  'use strict';

  const en = {
    optLanguage: 'Language',
    optLanguageAuto: 'Auto',
    optEnabled: 'Enabled',
    optSectionEnvironments: 'Environments',
    optAddEnvironment: 'Add environment',
    optSectionBanner: 'Banner',
    optSectionCheckUrl: 'Check URL',
    optSectionSettingsFile: 'Settings file',

    optPosition: 'Position',
    optPositionTop: 'Top',
    optPositionBottom: 'Bottom',
    optDirection: 'Direction',
    optDirectionLeft: 'Left',
    optDirectionRight: 'Right',
    optHeight: 'Height',
    optFontSize: 'Font size',
    optSpeed: 'Speed',
    optGap: 'Gap',

    optShowWarning: 'Warning icon',
    optStripes: 'Diagonal stripes',
    optPushContent: 'Push page content',
    optOffsetFixed: 'Offset fixed headers',
    optPauseOnHover: 'Pause on hover',
    optDismissible: 'Close button',

    optExport: 'Export',
    optImport: 'Import',
    optReset: 'Reset',

    optEnvEnabledTitle: 'Enable this environment',
    optMoveUp: 'Move up',
    optMoveDown: 'Move down',
    optDelete: 'Delete',
    optColor: 'Color',
    optBackground: 'Background',
    optText: 'Text',
    optUrlPatterns: 'URL patterns',

    optEnvNamePlaceholder: 'LOCAL',
    optPatternsPlaceholder: 'localhost:3000\n*.dev.example.com\nhttps://admin.example.com/*',
    optTesterPlaceholder: 'https://dev.example.com/login',

    optNoMatch: 'No match',
    optToastSaved: 'Saved',
    optToastImported: 'Imported',
    optToastImportFailed: 'Import failed',
    optToastReset: 'Reset to defaults',
    optConfirmDelete: 'Delete "$1"?',
    optConfirmReset: 'Reset all settings to defaults?',
    optNewEnvLabel: 'NEW',

    popCannotInject: 'This page cannot show a banner',
    popNoMatch: 'No match',
    popDisabled: '· disabled',
    popAdd: 'Add',
    popSettings: 'Settings',

    bannerHideTitle: 'Hide on this page (comes back on reload)',
    bannerHideLabel: 'Hide'
  };

  const ko = {
    optLanguage: '언어',
    optLanguageAuto: '자동',
    optEnabled: '사용',
    optSectionEnvironments: '환경',
    optAddEnvironment: '환경 추가',
    optSectionBanner: '배너',
    optSectionCheckUrl: 'URL 확인',
    optSectionSettingsFile: '설정 파일',

    optPosition: '위치',
    optPositionTop: '최상단',
    optPositionBottom: '최하단',
    optDirection: '방향',
    optDirectionLeft: '왼쪽',
    optDirectionRight: '오른쪽',
    optHeight: '높이',
    optFontSize: '글자',
    optSpeed: '속도',
    optGap: '간격',

    optShowWarning: '경고 아이콘',
    optStripes: '사선 패턴',
    optPushContent: '컨텐츠 밀어내기',
    optOffsetFixed: '고정 헤더 함께 내리기',
    optPauseOnHover: '마우스 올리면 정지',
    optDismissible: '닫기 버튼',

    optExport: '내보내기',
    optImport: '가져오기',
    optReset: '초기화',

    optEnvEnabledTitle: '이 환경 사용',
    optMoveUp: '위로',
    optMoveDown: '아래로',
    optDelete: '삭제',
    optColor: '색',
    optBackground: '배경',
    optText: '글자',
    optUrlPatterns: 'URL 패턴',

    optEnvNamePlaceholder: 'LOCAL',
    optPatternsPlaceholder: 'localhost:3000\n*.dev.example.com\nhttps://admin.example.com/*',
    optTesterPlaceholder: 'https://dev.example.com/login',

    optNoMatch: '일치 없음',
    optToastSaved: '저장됨',
    optToastImported: '가져왔습니다',
    optToastImportFailed: '가져오기 실패',
    optToastReset: '초기화됨',
    optConfirmDelete: '"$1" 삭제할까요?',
    optConfirmReset: '모든 설정을 기본값으로 되돌릴까요?',
    optNewEnvLabel: 'NEW',

    popCannotInject: '이 페이지에는 배너를 넣을 수 없습니다',
    popNoMatch: '일치 없음',
    popDisabled: '· 꺼져 있음',
    popAdd: '추가',
    popSettings: '설정',

    bannerHideTitle: '이 페이지에서 숨기기 (새로고침하면 다시 나옴)',
    bannerHideLabel: '숨기기'
  };

  root.EnvBannerMessages = {
    en,
    ko,
    /* 설정의 언어 드롭다운에 그대로 쓰는 목록 */
    LOCALES: [
      { value: 'auto', labelKey: 'optLanguageAuto' },
      { value: 'en', label: 'English' },
      { value: 'ko', label: '한국어' }
    ]
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);
