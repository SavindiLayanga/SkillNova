import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import siLK from './locales/si-LK.json';
import zhCN from './locales/zh-CN.json';
import es from './locales/es.json';
import hi from './locales/hi.json';

const resources = {
  en: { translation: en },
  'si-LK': { translation: siLK },
  'zh-CN': { translation: zhCN },
  es: { translation: es },
  hi: { translation: hi }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
