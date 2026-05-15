import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    lng: 'fr', // Default to French as per PRD
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      fr: {
        translation: {
          'brain.status.title': 'Connexion au Cerveau',
          'brain.status.connected': 'Connecté à LM Studio',
          'brain.status.disconnected': 'Déconnecté',
          'brain.status.model': 'Modèle actif',
          'brain.status.error': 'Erreur de connexion',
          'brain.status.retry': 'Réessayer',
          'app.title': 'Ars Fabula',
          'app.subtitle': 'Gestionnaire de Campagne Mythique',
        },
      },
    },
  });

export default i18n;
