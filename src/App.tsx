import { useState } from "react";
import { useTranslation } from "react-i18next";
import CodexView from "./components/Codex/CodexView";
import CovenantDashboard from "./components/Covenant/CovenantDashboard";
import MapView from "./components/Map/MapView";
import "./App.css";

type Tab = 'dashboard' | 'map' | 'covenants' | 'magi' | 'companions' | 'grogs' | 'codex';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background text-on-surface overflow-hidden font-body-md parchment-texture">
      {/* Sidebar - Navigation Drawer style */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 md:w-80 sidebar flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto shadow-2xl`}>
        <div className="p-8 mb-6">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">menu_book</span>
            <h1 className="font-headline-lg text-primary transition-colors">Ars Fabula</h1>
          </div>
          <div className="h-[1px] w-12 bg-secondary/30 mt-4" />
        </div>

        <nav className="flex flex-col px-4 gap-1">

          <button
            onClick={() => setActiveTab('map')}
            className={`sidebar-btn ${activeTab === 'map' ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">map</span>
            <span className="font-label-sm">Europe mythique</span>
          </button>

          <button
            onClick={() => setActiveTab('covenants')}
            className={`sidebar-btn ${activeTab === 'covenants' ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">castle</span>
            <span className="font-label-sm">Alliances</span>
          </button>

          <div className="h-[0.5px] w-8 bg-outline-variant/30 mx-6 my-4" />

          <button
            onClick={() => setActiveTab('magi')}
            className={`sidebar-btn ${activeTab === 'magi' ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">bolt</span>
            <span className="font-label-sm">Magi</span>
          </button>

          <button
            onClick={() => setActiveTab('companions')}
            className={`sidebar-btn ${activeTab === 'companions' ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">shield</span>
            <span className="font-label-sm">Custodes</span>
          </button>

          <button
            onClick={() => setActiveTab('grogs')}
            className={`sidebar-btn ${activeTab === 'grogs' ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">skull</span>
            <span className="font-label-sm">Grogs</span>
          </button>

          <div className="h-[0.5px] w-8 bg-outline-variant/30 mx-6 my-4" />

          <button
            onClick={() => setActiveTab('codex')}
            className={`sidebar-btn ${activeTab === 'codex' ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">auto_stories</span>
            <span className="font-label-sm">Codex</span>
          </button>

        </nav>

        <div className="mt-auto p-8 opacity-30 font-label-sm text-center pointer-events-none">
          Ars Fabula // Local-First // v2.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden ml-0 md:ml-64 lg:ml-80">
        {activeTab === 'dashboard' && (
          <div className="flex-1 flex flex-col items-center p-10 overflow-y-auto custom-scrollbar parchment-texture">
            <header className="text-center mb-48 mt-32 max-w-4xl space-y-96 animate-fade-in">
              <h1 className="font-display-lg text-on-surface">
                {t('app.title')}: Le Cœur de votre <span className="text-primary italic">Saga Mythique</span>
              </h1>

              <div className="space-y-96 text-left max-w-3xl mx-auto border-l-2 border-primary/20 pl-20 py-16">
                <div className="space-y-12">
                  <span className="font-label-sm text-primary tracking-widest uppercase text-[10px]">L'Ordre d'Hermès & L'Europe Mythique</span>
                  <p className="font-body-lg text-on-surface leading-relaxed text-justify opacity-90">
                    {t('app.intro.ars_magica')}
                  </p>
                </div>

                <div className="space-y-12">
                  <span className="font-label-sm text-secondary tracking-widest uppercase text-[10px]">La plateforme</span>
                  <p className="font-body-lg text-on-surface-variant leading-relaxed text-justify italic">
                    {t('app.intro.ars_fabula')}
                  </p>
                </div>
              </div>
            </header>

            <div className="w-full max-w-6xl mb-48 pt-96 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { id: 'map', icon: 'map', title: 'dashboard.tile.map.title', desc: 'dashboard.tile.map.desc' },
                  { id: 'covenants', icon: 'castle', title: 'dashboard.tile.covenants.title', desc: 'dashboard.tile.covenants.desc' },
                  { id: 'magi', icon: 'bolt', title: 'dashboard.tile.magi.title', desc: 'dashboard.tile.magi.desc' },
                  { id: 'companions', icon: 'shield', title: 'dashboard.tile.companions.title', desc: 'dashboard.tile.companions.desc' },
                  { id: 'grogs', icon: 'skull', title: 'dashboard.tile.grogs.title', desc: 'dashboard.tile.grogs.desc' },
                  { id: 'codex', icon: 'auto_stories', title: 'dashboard.tile.codex.title', desc: 'dashboard.tile.codex.desc' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className="flex flex-col items-center text-center p-8 border border-outline-variant/20 bg-surface rounded-xl hover:bg-surface-container-low transition-all group cursor-pointer shadow-sm hover:shadow-2xl hover:scale-[1.02] manuscript-border"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-primary text-3xl">{item.icon}</span>
                    </div>
                    <h3 className="font-headline-md mb-2 text-on-surface group-hover:text-primary transition-colors">
                      {t(item.title)}
                    </h3>
                    <p className="font-body-md text-on-surface-variant opacity-80 text-sm line-clamp-2">
                      {t(item.desc)}
                    </p>
                  </div>
                ))}
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
      </main>
    </div>
  );
}

export default App;
