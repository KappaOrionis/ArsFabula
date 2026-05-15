import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BrainStatus } from "./components/BrainStatus";
import CodexView from "./components/Codex/CodexView";
import CharacterList from "./components/Characters/CharacterList";
import MapView from "./components/Map/MapView";
import { LayoutDashboard, BookOpen, Users, Settings, Info, Map as MapIcon } from "lucide-react";
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
        <div className="mb-10 px-2 py-4">
          <h2 className="text-xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent hidden md:block">
            ArsFabula
          </h2>
          <div className="w-8 h-8 bg-blue-600 rounded-lg md:hidden mx-auto" />
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
            <span className="font-medium hidden md:block">Alliances</span>
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
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {activeTab === 'dashboard' && (
          <div className="flex-1 flex flex-col items-center p-10 overflow-y-auto custom-scrollbar">
             <header className="text-center mb-16 mt-10">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center backdrop-blur-xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <LayoutDashboard className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-500 bg-clip-text text-transparent mb-4">
                {t('app.title')}
              </h1>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                {t('app.subtitle')}
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mb-16">
              {/* Main Actions */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div onClick={() => setActiveTab('characters')} className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-left hover:border-slate-700 transition-all cursor-pointer group hover:bg-slate-900">
                  <Users className="w-10 h-10 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-3">Alliances</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Gérez vos mages et votre Covenant.</p>
                </div>
                <div onClick={() => setActiveTab('codex')} className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-left hover:border-slate-700 transition-all cursor-pointer group hover:bg-slate-900">
                  <BookOpen className="w-10 h-10 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-3">Codex</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Consultez les règles et sortilèges.</p>
                </div>
                <div onClick={() => setActiveTab('map')} className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-left hover:border-slate-700 transition-all cursor-pointer group hover:bg-slate-900">
                  <LayoutDashboard className="w-10 h-10 text-purple-500 mb-6 group-hover:scale-110 transition-transform" style={{ transform: 'rotate(45deg)' }} />
                  <h3 className="text-xl font-bold mb-3">Cartographie</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Explorez l'Europe de 1220.</p>
                </div>
              </div>

              {/* Status Sidebar */}
              <div className="flex flex-col gap-4">
                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                  <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info size={14} /> Tips
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Utilisez le Codex pour vérifier les portées de sorts pendant les sessions. L'IA peut vous aider à générer des conséquences narratives.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Start Guide */}
            <section className="w-full max-w-6xl mb-20">
              <h2 className="text-2xl font-bold mb-8 text-center">{t('app.guide.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
                    <h3 className="text-lg font-bold mb-2 text-slate-200">{t(`app.guide.step${step}.title`)}</h3>
                    <p className="text-sm text-slate-500">{t(`app.guide.step${step}.desc`)}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer / Legal */}
            <footer className="w-full max-w-4xl border-t border-slate-800/50 pt-10 pb-20 text-center">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{t('app.legal.title')}</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed max-w-2xl mx-auto italic">
                {t('app.legal.ogl')}
              </p>
            </footer>
          </div>
        )}

        {activeTab === 'characters' && <CharacterList />}
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
