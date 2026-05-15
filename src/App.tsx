import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BrainStatus } from "./components/BrainStatus";
import CodexView from "./components/Codex/CodexView";
import CovenantDashboard from "./components/Covenant/CovenantDashboard";
import MapView from "./components/Map/MapView";
import { LayoutDashboard, BookOpen, Users, Settings, Info, Map as MapIcon } from "lucide-react";
import logo from "./assets/logo.png";
import icon from "./assets/icon.png";
import "./App.css";

type Tab = 'dashboard' | 'codex' | 'characters' | 'map';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 md:w-80 sidebar border-r border-white/5 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto`}>
        <div className="mb-12 px-6 py-8">
          <img src={logo} alt="Ars Fabula" className="w-full h-auto max-w-[180px]" />
          <div className="h-px w-12 bg-accent mt-6 opacity-30" />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium hidden md:block">Tableau de Bord</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('characters')}
            className={`sidebar-btn ${activeTab === 'characters' ? 'active' : ''}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium hidden md:block">L'Alliance</span>
          </button>

          <button 
            onClick={() => setActiveTab('codex')}
            className={`sidebar-btn ${activeTab === 'codex' ? 'active' : ''}`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium hidden md:block">Codex</span>
          </button>

          <button 
            onClick={() => setActiveTab('map')}
            className={`sidebar-btn ${activeTab === 'map' ? 'active' : ''}`}
          >
            <MapIcon className="w-5 h-5" />
            <span className="font-medium hidden md:block">Cartographie</span>
          </button>

          {/* AI Connection section moved here */}
          <div className="mt-4">
            <BrainStatus />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium hidden md:block">Paramètres</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden main-content">
        {activeTab === 'dashboard' && (
          <div className="flex-1 flex flex-col items-center p-10 overflow-y-auto custom-scrollbar">
             <header className="text-center mb-20 mt-16 max-w-4xl">
              <h1 className="text-8xl font-header mb-6 leading-tight">
                {t('app.title')}
              </h1>
              <p className="text-primary text-3xl font-header italic opacity-90 mb-12">
                {t('app.subtitle')}
              </p>
              
              <div className="text-left font-body text-lg leading-relaxed text-text-muted space-y-6 px-8 border-l-2 border-accent/20 mb-20">
                <p>
                  Bienvenue dans l'Europe Mythique de l'an 1220. Un monde où les peurs des paysans sont réelles, où les fées hantent les forêts profondes et où les anges et les démons luttent pour l'âme de l'humanité. Mais au-dessus de ce tumulte médiéval s'élève l'Ordre d'Hermès, une société secrète de mages liés par le Code de l'Honnêteté et unis par la quête de la connaissance arcane.
                </p>
                <p>
                  En tant que membre d'une Alliance — une communauté de mages et de leurs serviteurs — vous résidez dans des lieux de pouvoir appelés <i>Aurae</i>. Ici, loin des yeux inquisiteurs de l'Église et de la Noblesse, vous menez des recherches qui s'étendent sur des décennies. Vous étudiez les quinze Arts de la Magie, manipulant les formes de l'Ignem (le feu), de l'Animal (les bêtes) ou du Mentem (l'esprit) pour plier la réalité à votre volonté.
                </p>
                <p>
                  Ars Magica n'est pas seulement un jeu de sorts et de batailles. C'est une chronique de passage du temps. C'est l'histoire de la montée et de la chute des Alliances, de la politique complexe entre les maisons de l'Ordre, et de la lutte constante pour préserver votre magie alors que le monde se rationalise et que le Divin étend son emprise. Vos mages vieilliront, vos apprentis deviendront des maîtres, et chaque décision laissera une trace indélébile dans les archives de votre Scriptorium.
                </p>
                <p>
                  <strong>ArsFabula</strong> a été conçu comme votre compagnon hermétique ultime. Il ne se contente pas de stocker des données ; il devient votre Grimoire Vivant, un réceptacle pour la sagesse de votre Alliance et un outil pour naviguer dans les méandres de l'Europe Mythique.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full text-left mb-20 px-4">
                <div className="space-y-2">
                  <h4 className="font-header text-primary text-xl">L'Archive Lore</h4>
                  <p className="text-xs font-label uppercase tracking-widest text-text-muted opacity-60">RAG Intégré</p>
                  <p className="text-sm font-body">Accédez instantanément aux règles et aux traditions de l'Ordre via notre moteur de recherche sémantique local.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-header text-primary text-xl">Le Sigillum</h4>
                  <p className="text-xs font-label uppercase tracking-widest text-text-muted opacity-60">Gestion d'Alliance</p>
                  <p className="text-sm font-body">Suivez l'évolution de vos mages, de vos ressources de Vis et la croissance séculaire de votre Alliance.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-header text-primary text-xl">L'Atlas Mythique</h4>
                  <p className="text-xs font-label uppercase tracking-widest text-text-muted opacity-60">Cartographie</p>
                  <p className="text-sm font-body">Visualisez votre influence sur l'Europe et découvrez les Regiones cachées grâce à notre carte interactive.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-header text-primary text-xl">Le Laboratoire</h4>
                  <p className="text-xs font-label uppercase tracking-widest text-text-muted opacity-60">IA Narrative</p>
                  <p className="text-sm font-body">Générez des conséquences narratives, des rumeurs et des événements de saison assistés par l'intelligence hermétique.</p>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <div className="h-px w-48 bg-accent opacity-30" />
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl mb-20">
              <div 
                onClick={() => setActiveTab('map')} 
                className="codex-card flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-20 h-20 mb-8 rounded-full border-2 border-accent/20 flex items-center justify-center group-hover:border-accent/60 transition-all duration-500">
                  <MapIcon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-3xl font-header mb-4 text-text-main group-hover:text-primary transition-colors">
                  Cartographie
                </h3>
                <p className="text-text-muted font-body leading-relaxed max-w-xs">
                  Explorez les frontières de l'Europe Mythique et les domaines de l'Ordre d'Hermès.
                </p>
                <div className="mt-8 text-xs font-label uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Ouvrir l'Atlas &rarr;
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('codex')} 
                className="codex-card flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-20 h-20 mb-8 rounded-full border-2 border-accent/20 flex items-center justify-center group-hover:border-accent/60 transition-all duration-500">
                  <BookOpen className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-3xl font-header mb-4 text-text-main group-hover:text-primary transition-colors">
                  Codex Hermeticus
                </h3>
                <p className="text-text-muted font-body leading-relaxed max-w-xs">
                  Consultez les archives interdites, les sortilèges et les chroniques de votre Alliance.
                </p>
                <div className="mt-8 text-xs font-label uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Consulter les Archives &rarr;
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex gap-12 items-center text-text-muted font-label text-sm uppercase tracking-widest opacity-60">
              <div 
                onClick={() => setActiveTab('characters')}
                className="cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
              >
                <Users size={16} /> Alliances
              </div>
              <div className="w-1 h-1 rounded-full bg-outline" />
              <div className="cursor-pointer hover:text-primary transition-colors flex items-center gap-2">
                <Settings size={16} /> Scriptorium
              </div>
            </div>
          </div>
        )}

        {activeTab === 'characters' && <CovenantDashboard />}
        {activeTab === 'codex' && <CodexView />}
        {activeTab === 'map' && <MapView />}

        <footer className="absolute bottom-6 right-8 text-slate-600 text-xs font-mono uppercase tracking-widest pointer-events-none">
          ArsFabula // Local-First // v2.0
        </footer>
      </main>
    </div>
  );
}

export default App;
