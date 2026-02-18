import React, { createContext, useContext, useState, useEffect } from 'react';
import { t as translate } from '../lib/translations';

const STORAGE_KEY = 'jvng-locale';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === 'undefined') return 'ko';
    return localStorage.getItem(STORAGE_KEY) || 'ko';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (lang) => {
    if (lang === 'ko' || lang === 'en') setLocaleState(lang);
  };

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === 'ko' ? 'en' : 'ko'));
  };

  const t = (key) => translate(locale, key);

  const value = {
    locale,
    setLocale,
    toggleLocale,
    isEn: locale === 'en',
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
