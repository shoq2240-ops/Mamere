/**
 * jvng. 다국어 번역
 * locale: 'ko' | 'en'
 */
export const translations = {
  ko: {
    nav: {
      outerwear: '아웃웨어',
      top: '상의',
      bottom: '하의',
    },
    common: {
      search: '검색',
      close: '닫기',
      back: '뒤로',
      backToMenu: '메뉴로 돌아가기',
    },
  },
  en: {
    nav: {
      outerwear: 'Outerwear',
      top: 'Tops',
      bottom: 'Bottoms',
    },
    common: {
      search: 'Search',
      close: 'Close',
      back: 'Back',
      backToMenu: 'Back to Menu',
    },
  },
};

export const t = (locale, key) => {
  const keys = key.split('.');
  let value = translations[locale] || translations.ko;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key;
  }
  return value || key;
};
