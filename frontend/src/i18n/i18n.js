import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import am from './locales/am.json'

const STORAGE_KEY = 'wms-language'

const stored = localStorage.getItem(STORAGE_KEY)
const initialLng = stored && ['en', 'am'].includes(stored) ? stored : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
      business: en.business,
      onDemand: en.onDemand,
    },
    am: {
      translation: am,
      business: am.business,
      onDemand: am.onDemand,
    },
  },
  ns: ['translation', 'business', 'onDemand'],
  defaultNS: 'translation',
  fallbackNS: 'translation',
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

document.documentElement.lang = i18n.language

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
  localStorage.setItem(STORAGE_KEY, lng)
})

export default i18n