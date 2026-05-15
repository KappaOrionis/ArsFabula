import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BrainStatus } from "./components/BrainStatus";
import CodexView from "./components/Codex/CodexView";
import CovenantDashboard from "./components/Covenant/CovenantDashboard";
import MapView from "./components/Map/MapView";
import { LayoutDashboard, BookOpen, Users, Settings, Info, Map as MapIcon, Zap, Shield, Skull } from "lucide-react";
import logo from "./assets/logo.png";
import icon from "./assets/icon.png";
import "./App.css";

type Tab = 'dashboard' | 'map' | 'covenants' | 'magi' | 'companions' | 'grogs' | 'codex';

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
            <span className="font-medium hidden md:block">Accueil</span>
          </button>

          <button 
            onClick={() => setActiveTab('map')}
            className={`sidebar-btn ${activeTab === 'map' ? 'active' : ''}`}
          >
            <MapIcon className="w-5 h-5" />
            <span className="font-medium hidden md:block">Europe mythique</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('covenants')}
            className={`sidebar-btn ${activeTab === 'covenants' ? 'active' : ''}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium hidden md:block">Alliances</span>
          </button>

          <div className="h-px w-8 bg-outline/20 mx-6 my-2" />

          <button 
            onClick={() => setActiveTab('magi')}
            className={`sidebar-btn ${activeTab === 'magi' ? 'active' : ''}`}
          >
            <Zap className="w-5 h-5" />
            <span className="font-medium hidden md:block">Magi</span>
          </button>

          <button 
            onClick={() => setActiveTab('companions')}
            className={`sidebar-btn ${activeTab === 'companions' ? 'active' : ''}`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium hidden md:block">Custodes</span>
          </button>

          <button 
            onClick={() => setActiveTab('grogs')}
            className={`sidebar-btn ${activeTab === 'grogs' ? 'active' : ''}`}
          >
            <Skull className="w-5 h-5" />
            <span className="font-medium hidden md:block">Grogs</span>
          </button>

          <div className="h-px w-8 bg-outline/20 mx-6 my-2" />

          <button 
            onClick={() => setActiveTab('codex')}
            className={`sidebar-btn ${activeTab === 'codex' ? 'active' : ''}`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium hidden md:block">Codex</span>
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
             <header className="text-center mb-16 mt-16 max-w-4xl">
              <h1 className="text-8xl font-header mb-6 leading-tight">
                {t('app.title')}
              </h1>
              <p className="text-primary text-3xl font-header italic opacity-90 mb-12">
                {t('app.subtitle')}
              </p>
              
              <div className="text-left space-y-16 max-w-4xl mx-auto mb-20">
                <section>
                  <div className="inline-block bg-bg-sidebar/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-accent/20 mb-8 shadow-sm">
                    <h2 className="text-sm font-label uppercase tracking-[0.4em] text-accent font-bold">L'Europe Mythique</h2>
                  </div>
                  <div className="font-body text-xl leading-relaxed text-text-main manuscript-dropcap space-y-6">
                    <p>
                      Bienvenue dans l'Europe Mythique de l'an 1220. Un monde où les peurs des paysans sont réelles, où les fées hantent les forêts profondes et où les puissances du Divin, de l'Infernal, du Féérique et du Magique s'affrontent pour l'âme de l'humanité. Au-dessus de ce tumulte médiéval s'élève l'Ordre d'Hermès, une société secrète de mages liés par le Code et unis par la quête de la connaissance arcane. En tant que membre d'une Alliance, vous résidez dans des lieux de pouvoir appelés <i>Aurae</i>, étudiant les quinze Arts de la Magie pour plier la réalité à votre volonté.
                    </p>
                    <p>
                      Ars Magica n'est pas seulement un jeu de sorts ; c'est une chronique du passage du temps. C'est l'histoire de la montée et de la chute des Alliances, de la politique complexe entre les Maisons de l'Ordre, et de la lutte pour préserver la magie alors que le monde se rationalise. Vos mages vieilliront, vos apprentis deviendront des maîtres, et chaque décision laissera une trace indélébile dans les archives de votre Scriptorium. Dans ce monde, la connaissance est le pouvoir ultime, et chaque saison de recherche vous rapproche soit de l'immortalité, soit de la folie finale du Crépuscule.
                    </p>
                  </div>
                </section>

                <div className="alchemical-divider">
                  <Zap size={20} className="text-accent opacity-30" />
                </div>

                <section>
                  <div className="inline-block bg-bg-sidebar/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-accent/20 mb-8 shadow-sm">
                    <h2 className="text-sm font-label uppercase tracking-[0.4em] text-accent font-bold">Le Grimoire Numérique</h2>
                  </div>
                  <div className="font-body text-lg leading-relaxed text-text-muted border-l-2 border-accent/20 pl-8 py-2">
                    <p>
                      <strong>ArsFabula</strong> est votre compagnon hermétique ultime, un Grimoire Vivant conçu pour naviguer dans les méandres de l'Europe Mythique. Bien plus qu'un simple gestionnaire, il devient le réceptacle de la sagesse de votre Alliance. Grâce à son moteur de recherche sémantique local, accédez instantanément aux règles et aux traditions de l'Ordre. Suivez l'évolution séculaire de vos mages, gérez vos ressources de Vis et visualisez votre influence via l'Atlas interactif. ArsFabula donne vie à vos chroniques, automatisant les calculs complexes pour laisser place au récit, assurant ainsi que chaque décision prise dans votre laboratoire marque l'histoire de l'Ordre.
                    </p>
                  </div>
                </section>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mb-24 px-4">
              {[
                { id: 'map', icon: MapIcon, title: 'dashboard.tile.map.title', desc: 'dashboard.tile.map.desc' },
                { id: 'covenants', icon: Users, title: 'dashboard.tile.covenants.title', desc: 'dashboard.tile.covenants.desc' },
                { id: 'magi', icon: Zap, title: 'dashboard.tile.magi.title', desc: 'dashboard.tile.magi.desc' },
                { id: 'companions', icon: Shield, title: 'dashboard.tile.companions.title', desc: 'dashboard.tile.companions.desc' },
                { id: 'grogs', icon: Skull, title: 'dashboard.tile.grogs.title', desc: 'dashboard.tile.grogs.desc' },
                { id: 'codex', icon: BookOpen, title: 'dashboard.tile.codex.title', desc: 'dashboard.tile.codex.desc' },
              ].map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)} 
                  className="codex-portal-tile group"
                >
                  <div className="w-16 h-16 mb-6 rounded-full border border-accent/20 flex items-center justify-center group-hover:border-accent/60 transition-all duration-500 bg-bg-sidebar/50">
                    <item.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-2xl font-header mb-3 text-text-main group-hover:text-primary transition-colors">
                    {t(item.title)}
                  </h3>
                  <p className="text-text-muted font-body text-sm leading-relaxed">
                    {t(item.desc)}
                  </p>
                  <div className="mt-6 text-[10px] font-label uppercase tracking-[0.2em] text-accent opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    Accéder à la section &rarr;
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Footer */}
            <div className="flex gap-12 items-center text-text-muted font-label text-sm uppercase tracking-widest opacity-40 mb-10">
              <div className="flex items-center gap-2">
                <Info size={14} /> Scriptorium v2.0
              </div>
              <div className="w-1 h-1 rounded-full bg-outline" />
              <div className="flex items-center gap-2">
                <Shield size={14} /> Protection Hermétique Active
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && <MapView />}
        {activeTab === 'covenants' && <CovenantDashboard />}
        {activeTab === 'magi' && <CovenantDashboard forceTab="magi" />}
        {activeTab === 'companions' && <CovenantDashboard forceTab="companions" />}
        {activeTab === 'grogs' && <CovenantDashboard forceTab="grogs" />}
        {activeTab === 'codex' && <CodexView />}

        <footer className="absolute bottom-6 right-8 text-slate-600 text-xs font-mono uppercase tracking-widest pointer-events-none">
          ArsFabula // Local-First // v2.0
        </footer>
      </main>
    </div>
  );
}

export default App;
