import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Users, Zap, Shield, Skull, 
  Plus, Calendar, Sparkles, TrendingUp, BookOpen,
  ArrowRight, Coins, Droplets
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface Covenant {
  id: string;
  name: string;
  aura_type: string;
  aura_level: number;
  tribunal: string;
  founding_year: number;
}

interface Season {
  id: string;
  year: number;
  quarter: string;
}

interface Character {
  id: string;
  name: string;
  character_type: 'magus' | 'companion' | 'grog';
  house?: string;
  warp_score: number;
}

const CovenantDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [covenant, setCovenant] = useState<Covenant | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCovenantData = async () => {
    try {
      const covenants: Covenant[] = await invoke('list_covenants');
      if (covenants.length > 0) {
        const cov = covenants[0];
        setCovenant(cov);
        
        const currentSeason: Season = await invoke('get_current_season', { covenantId: cov.id });
        setSeason(currentSeason);
        
        const chars: Character[] = await invoke('list_characters');
        setCharacters(chars);
      }
    } catch (error) {
      console.error('Failed to load covenant data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCovenantData();
  }, []);

  const handleAdvanceSeason = async () => {
    if (!covenant) return;
    try {
      setLoading(true);
      const nextSeason: Season = await invoke('advance_season', { covenantId: covenant.id });
      setSeason(nextSeason);
    } catch (error) {
      console.error('Failed to advance season:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'magus': return <Zap className="text-purple-400" size={18} />;
      case 'companion': return <Shield className="text-blue-400" size={18} />;
      case 'grog': return <Skull className="text-slate-400" size={18} />;
      default: return <Users size={18} />;
    }
  };

  if (loading && !covenant) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-primary font-header text-2xl">Consultation des archives...</div>
      </div>
    );
  }

  if (!covenant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
        <div className="w-24 h-24 rounded-full border-2 border-accent/20 flex items-center justify-center mb-10">
          <Sparkles size={48} className="text-primary" />
        </div>
        <h2 className="text-5xl font-header mb-6">Fonder une Alliance</h2>
        <p className="text-text-muted font-body max-w-lg mb-12 text-lg">
          Chaque grande saga commence par un premier pas. Choisissez un lieu de pouvoir et rassemblez vos mages pour ériger votre sanctuaire hermétique.
        </p>
        <button 
          onClick={async () => {
            await invoke('create_covenant', { 
              name: "Nova Castra", 
              auraType: "magic", 
              auraLevel: 3, 
              foundingYear: 1220, 
              tribunal: "Rhine" 
            });
            loadCovenantData();
          }}
          className="bg-primary text-white px-10 py-4 rounded-full font-header text-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20"
        >
          Ériger l'Alliance
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-10 bg-parchment-light">
      {/* Top Banner: Covenant Identity & Season */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 border-b border-outline-variant pb-10">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[10px] font-label uppercase tracking-[0.3em] bg-accent/10 text-accent px-4 py-1 rounded-full border border-accent/20">
              Tribunal du {covenant.tribunal}
            </span>
            <span className="text-[10px] font-label uppercase tracking-[0.3em] bg-primary/10 text-primary px-4 py-1 rounded-full border border-primary/20">
              Aura {covenant.aura_type} {covenant.aura_level}
            </span>
          </div>
          <h1 className="text-7xl font-header text-text-main tracking-tight">{covenant.name}</h1>
        </div>

        <div className="flex items-center gap-6 bg-bg-sidebar/40 backdrop-blur-sm p-6 rounded-3xl border border-outline-variant shadow-sm">
          <Calendar className="text-primary" size={32} />
          <div className="pr-6 border-r border-outline-variant">
            <p className="text-[10px] font-label uppercase text-text-muted mb-1">Saison Actuelle</p>
            <p className="text-2xl font-header text-text-main capitalize">
              {season?.quarter} {season?.year}
            </p>
          </div>
          <button 
            onClick={handleAdvanceSeason}
            className="group flex flex-col items-center gap-1 hover:text-primary transition-colors pl-2"
          >
            <TrendingUp size={24} className="group-hover:translate-y-[-2px] transition-transform" />
            <span className="text-[9px] font-label uppercase font-bold">Avancer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Resources & Stats */}
        <div className="space-y-10">
          {/* Resources Mini-Card */}
          <div className="bg-white p-8 rounded-3xl border border-outline-variant shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-header text-xl flex items-center gap-3">
                 <Coins className="text-accent" size={20} />
                 Trésorerie
               </h3>
               <span className="text-xs font-label text-text-muted">Archives 1220</span>
             </div>
             
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="font-body text-sm">Argent (Livres)</span>
                  </div>
                  <span className="font-header text-lg">450</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="font-body text-sm">Vis en Stock</span>
                  </div>
                  <span className="font-header text-lg">12</span>
                </div>
             </div>
             
             <button className="w-full mt-8 pt-4 border-t border-outline-variant text-[10px] font-label uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-2">
               Gérer les ressources <ArrowRight size={12} />
             </button>
          </div>

          {/* Library Quick View */}
          <div className="bg-white p-8 rounded-3xl border border-outline-variant shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-header text-xl flex items-center gap-3">
                 <BookOpen className="text-primary" size={20} />
                 Scriptorium
               </h3>
             </div>
             <p className="text-text-muted font-body text-sm italic mb-6">
               "La connaissance est la seule monnaie qui ne se dévalue jamais."
             </p>
             <div className="flex gap-4">
                <div className="flex-1 bg-parchment py-4 rounded-xl text-center border border-accent/10">
                  <p className="text-2xl font-header">8</p>
                  <p className="text-[8px] font-label uppercase">Summae</p>
                </div>
                <div className="flex-1 bg-parchment py-4 rounded-xl text-center border border-accent/10">
                  <p className="text-2xl font-header">24</p>
                  <p className="text-[8px] font-label uppercase">Tractatus</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Character Roster (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-header flex items-center gap-4">
              <Users className="text-primary" size={28} />
              Conseil de l'Alliance
            </h2>
            <button className="flex items-center gap-2 bg-text-main text-white px-6 py-2 rounded-full text-xs font-label uppercase tracking-widest hover:bg-primary transition-colors">
              <Plus size={14} /> Recruter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map((char) => (
              <div key={char.id} className="bg-white p-6 rounded-3xl border border-outline-variant hover:border-primary/40 hover:shadow-xl hover:scale-[1.01] transition-all group cursor-pointer">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-parchment flex items-center justify-center border border-accent/10 group-hover:bg-primary/5 transition-colors">
                    {getTypeIcon(char.character_type)}
                  </div>
                  <div>
                    <h4 className="text-xl font-header group-hover:text-primary transition-colors">{char.name}</h4>
                    <p className="text-[10px] font-label uppercase tracking-widest text-text-muted">{char.house || char.character_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/50">
                   <div>
                     <p className="text-[9px] font-label uppercase text-text-muted">Warping</p>
                     <div className="flex items-center gap-2">
                       <div className="flex-1 h-1 bg-bg-sidebar rounded-full overflow-hidden">
                         <div className="h-full bg-purple-400" style={{ width: `${Math.min(100, char.warp_score * 10)}%` }} />
                       </div>
                       <span className="text-xs font-header">{char.warp_score}</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-[9px] font-label uppercase text-text-muted">Activité</p>
                     <p className="text-[10px] font-body italic text-accent">Étude de l'Ignem</p>
                   </div>
                </div>
              </div>
            ))}

            {/* Empty Spot */}
            <div className="border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center p-8 opacity-40 hover:opacity-100 hover:border-primary/50 transition-all cursor-pointer group">
               <Plus size={32} className="text-text-muted group-hover:text-primary mb-2" />
               <p className="text-xs font-label uppercase tracking-widest">Nouveau Siège</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CovenantDashboard;
