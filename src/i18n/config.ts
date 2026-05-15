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
          'app.title': 'ArsFabula',
          'app.subtitle': 'Gestionnaire de Campagne Mythique',
          'app.welcome': 'Bienvenue dans votre grimoire numérique.',
          'app.legal.title': 'Mentions Légales',
          'app.legal.ogl': 'ArsFabula est une application indépendante utilisant le système de règles d\'Ars Magica 5ème Édition, sous licence Open Game License (OGL). Les contenus narratifs et le code source sont la propriété du projet.',
          'app.guide.title': 'Guide de Démarrage',
          'app.guide.step1.title': '1. Configurez votre Alliance',
          'app.guide.step1.desc': 'Créez votre Covenant dans l\'onglet Personnages pour commencer à suivre vos ressources.',
          'app.guide.step2.title': '2. Explorez le Codex',
          'app.guide.step2.desc': 'Utilisez la recherche sémantique pour trouver des sorts ou des points de règles instantanément.',
          'app.guide.step3.title': '3. Connectez l\'IA',
          'app.guide.step3.desc': 'Lancez LM Studio pour activer la narration assistée et les analyses de lore.',
        },
      },
    },
  });

export default i18n;
