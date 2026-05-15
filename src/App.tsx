import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BrainStatus } from "./components/BrainStatus";
import CodexView from "./components/Codex/CodexView";
import CharacterList from "./components/Characters/CharacterList";
import { LayoutDashboard, BookOpen, Users, Settings, Info } from "lucide-react";
import "./App.css";

type Tab = 'dashboard' | 'codex' | 'characters';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <nav className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4">
        <div className="mb-10 px-2 py-4">
          <h2 className="text-xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent hidden md:block">
            ARS FABULA
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
            <span className="font-medium hidden md:block">Personnages</span>
          </button>

          <button 
            onClick={() => setActiveTab('codex')}
            className={`sidebar-btn ${activeTab === 'codex' ? 'active' : ''}`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium hidden md:block">Codex Hermeticus</span>
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium hidden md:block">Paramètres</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {activeTab === 'dashboard' && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-10">
             <header>
              <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-500 bg-clip-text text-transparent mb-4">
                {t('app.title')}
              </h1>
              <p className="text-slate-400 text-xl max-w-2xl">
                {t('app.subtitle')}
              </p>
            </header>

            <div className="w-full max-w-md">
              <BrainStatus />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mt-10">
              <div onClick={() => setActiveTab('characters')} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl text-left hover:border-slate-700 transition-colors cursor-pointer group">
                <Users className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2">Membres de l'Alliance</h3>
                <p className="text-slate-500 text-sm">Gérez vos mages, compagnons et grogs.</p>
              </div>
              <div onClick={() => setActiveTab('codex')} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl text-left hover:border-slate-700 transition-colors cursor-pointer group">
                <BookOpen className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-2">Codex Hermeticus</h3>
                <p className="text-slate-500 text-sm">Consultez les grimoires et les règles.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'characters' && <CharacterList />}
        {activeTab === 'codex' && <CodexView />}

        <footer className="absolute bottom-6 right-8 text-slate-600 text-xs font-mono uppercase tracking-widest pointer-events-none">
          Ars Fabula // Local-First // v2.0
        </footer>
      </main>
    </div>
  );
}

export default App;
