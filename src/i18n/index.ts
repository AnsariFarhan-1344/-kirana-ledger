import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lng: 'en' | 'hi' | 'mr') => {
  i18n.changeLanguage(lng);
};

export default i18n;
