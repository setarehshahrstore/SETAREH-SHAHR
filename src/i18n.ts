import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from './locales/en.json';
import fa from './locales/fa.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import ps from './locales/ps.json';

const resources = {
  en: { translation: en },
  fa: { translation: fa },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
  ps: { translation: ps } // Pashto
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fa',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
