import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, Zap, Shield, Skull, Plus, Calendar, Sparkles, TrendingUp, BookOpen, ArrowRight, 
  Coins, MapPin, ChevronLeft, Landmark, History, Trash2, CheckCircle2, Wand2, X, ChevronRight,
  Search, Filter, Crown, Castle
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface Covenant {
  id: string;
  name: string;
  aura_type: string;
  aura_level: number;
  tribunal: string;
  founding_year: number;
  is_official: boolean;
  domus_magna: string | null;
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
  is_official: boolean;
}

interface Props {
  forceTab?: 'magi' | 'companions' | 'grogs';
}

const TRIBUNALS = [
  { id: "Greater Alps", label: "Alpes Rhétiques" },
  { id: "Hibernia", label: "Hibernie" },
  { id: "Iberia", label: "Ibérie" },
  { id: "Loch Leglean", label: "Loch Leglean" },
  { id: "Normandy", label: "Normandie" },
  { id: "Novgorod", label: "Novgorod" },
  { id: "Provençal", label: "Provence" },
  { id: "Rhine", label: "Rhin" },
  { id: "Rome", label: "Rome" },
  { id: "Stonehenge", label: "Stonehenge" },
  { id: "The Levant", label: "Levant" },
  { id: "Transylvania", label: "Transylvanie" }
];

const CovenantDashboard: React.FC<Props> = ({ forceTab }) => {
  const { t } = useTranslation();
  const [allCovenants, setAllCovenants] = useState<Covenant[]>([]);
  const [selectedCov, setSelectedCov] = useState<Covenant | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTribunal, setSelectedTribunal] = useState('all');

  // Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    name: '',
    tribunal: 'Rhine',
    auraType: 'magic',
    auraLevel: 3,
    foundingYear: 1220,
    description: ''
  });

  const fetchAllCovenants = async () => {
    try {
      const data: Covenant[] = await invoke('list_covenants');
      setAllCovenants(data);
      if (!selectedCov && data.length > 0 && forceTab) {
        handleSelectCovenant(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch covenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCovenant = async (cov: Covenant) => {
    setLoading(true);
    setSelectedCov(cov);
    try {
      const currentSeason: Season = await invoke('get_current_season', { covenantId: cov.id });
      setSeason(currentSeason);
      
      const chars: Character[] = await invoke('list_characters');
      setCharacters(chars);
    } catch (error) {
      console.error('Failed to load covenant details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCovenants();
  }, [forceTab]);

  const handleAdvanceSeason = async () => {
    if (!selectedCov) return;
    try {
      setLoading(true);
      const nextSeason: Season = await invoke('advance_season', { covenantId: selectedCov.id });
      setSeason(nextSeason);
    } catch (error) {
      console.error('Failed to advance season:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Voulez-vous vraiment supprimer cette alliance ? Cette action est irréversible.")) return;
    try {
      setLoading(true);
      await invoke('delete_covenant', { id });
      fetchAllCovenants();
    } catch (error) {
      console.error('Failed to delete covenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeWizard = async () => {
    try {
      setLoading(true);
      await invoke('create_covenant', { 
        name: wizardData.name, 
        auraType: wizardData.auraType, 
        auraLevel: wizardData.auraLevel, 
        foundingYear: wizardData.foundingYear, 
        tribunal: wizardData.tribunal 
      });
      setShowWizard(false);
      setWizardStep(1);
      setWizardData({
        name: '',
        tribunal: 'Rhine',
        auraType: 'magic',
        auraLevel: 3,
        foundingYear: 1220,
        description: ''
      });
      fetchAllCovenants();
    } catch (error) {
      console.error('Failed to create covenant:', error);
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

  const filteredCovenants = allCovenants.filter(cov => {
    const matchesSearch = cov.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTribunal = selectedTribunal === 'all' || cov.tribunal === selectedTribunal;
    return matchesSearch && matchesTribunal;
  });

  if (loading && allCovenants.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-parchment-light">
        <div className="animate-pulse text-primary font-header text-2xl italic">Consultation des registres...</div>
      </div>
    );
  }

  // WIZARD OVERLAY
  const renderWizard = () => {
    if (!showWizard) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-primary/20 overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Wizard Header */}
          <div className="bg-primary p-8 text-white relative">
            <button 
              onClick={() => setShowWizard(false)}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-4 mb-2">
              <Wand2 size={32} />
              <h2 className="text-3xl font-header">Fonder une Alliance</h2>
            </div>
            <p className="text-white/60 font-body italic">Étape {wizardStep} sur 3 — {
              wizardStep === 1 ? "Identité & Territoire" :
              wizardStep === 2 ? "Environnement Magique" :
              "Héritage & Chroniques"
            }</p>
          </div>

          {/* Wizard Content */}
          <div className="p-10">
            {wizardStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-text-muted">Nom du Sanctuaire</label>
                  <input 
                    type="text" 
                    value={wizardData.name}
                    onChange={(e) => setWizardData({...wizardData, name: e.target.value})}
                    placeholder="Ex: Val-Ronce, Tour de l'Éclipse..."
                    className="w-full bg-parchment border border-outline-variant rounded-xl p-4 font-header text-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-text-muted">Tribunal d'Affiliation</label>
                  <select 
                    value={wizardData.tribunal}
                    onChange={(e) => setWizardData({...wizardData, tribunal: e.target.value})}
                    className="w-full bg-parchment border border-outline-variant rounded-xl p-4 font-body focus:border-primary outline-none cursor-pointer"
                  >
                    {TRIBUNALS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-label uppercase tracking-widest text-text-muted">Nature de l'Aura</label>
                    <select 
                      value={wizardData.auraType}
                      onChange={(e) => setWizardData({...wizardData, auraType: e.target.value})}
                      className="w-full bg-parchment border border-outline-variant rounded-xl p-4 font-body focus:border-primary outline-none"
                    >
                      <option value="magic">Magique (Standard)</option>
                      <option value="faerie">Féérique (Mystérieuse)</option>
                      <option value="divine">Divine (Sacrée)</option>
                      <option value="infernal">Infernale (Maudite)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-label uppercase tracking-widest text-text-muted">Puissance (1-10)</label>
                    <input 
                      type="number" 
                      min="1" max="10"
                      value={wizardData.auraLevel}
                      onChange={(e) => setWizardData({...wizardData, auraLevel: parseInt(e.target.value)})}
                      className="w-full bg-parchment border border-outline-variant rounded-xl p-4 font-header text-xl focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-text-muted">Année de Fondation</label>
                  <input 
                    type="number" 
                    value={wizardData.foundingYear}
                    onChange={(e) => setWizardData({...wizardData, foundingYear: parseInt(e.target.value)})}
                    className="w-full bg-parchment border border-outline-variant rounded-xl p-4 font-header text-xl focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-text-muted">Description & Chroniques</label>
                  <textarea 
                    value={wizardData.description}
                    onChange={(e) => setWizardData({...wizardData, description: e.target.value})}
                    placeholder="L'histoire de cette alliance commence par..."
                    className="w-full bg-parchment border border-outline-variant rounded-xl p-4 font-body min-h-[120px] focus:border-primary outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Wizard Footer */}
            <div className="mt-12 flex justify-between items-center">
              <button 
                onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                disabled={wizardStep === 1}
                className="text-text-muted font-label uppercase text-xs tracking-widest disabled:opacity-30 flex items-center gap-2 hover:text-primary transition-colors"
              >
                <ChevronLeft size={16} /> Précédent
              </button>
              
              {wizardStep < 3 ? (
                <button 
                  onClick={() => setWizardStep(wizardStep + 1)}
                  disabled={!wizardData.name && wizardStep === 1}
                  className="bg-primary text-white px-8 py-3 rounded-full font-label uppercase text-xs tracking-widest hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  Suivant <ChevronRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleFinalizeWizard}
                  className="bg-accent text-white px-8 py-3 rounded-full font-label uppercase text-xs tracking-widest hover:bg-accent/80 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                  <CheckCircle2 size={16} /> Finaliser l'Érection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. List View (All Alliances)
  if (!selectedCov && !forceTab) {
    return (
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-parchment-light relative">
        {renderWizard()}
        
        <header className="sticky top-0 z-50 p-6 pointer-events-none mb-4">
          <div className="bg-bg-sidebar/90 backdrop-blur-md p-6 rounded-2xl border border-accent/20 shadow-xl inline-block pointer-events-auto">
            <div>
              <h2 className="text-3xl font-header text-text-main tracking-tight flex items-center gap-4">
                <Landmark size={28} className="text-primary" />
                {t('covenant.list.title')}
              </h2>
              <p className="text-[0.6rem] font-label text-accent uppercase tracking-[0.3em] font-bold opacity-70">
                {t('covenant.list.subtitle')}
              </p>
            </div>
          </div>
        </header>

        {/* Action Bar (Below Header) */}
        <div className="px-10 mb-10">
          <button 
            onClick={() => setShowWizard(true)}
            className="btn-hermetic !flex-row !gap-3 !py-3 !px-8"
          >
            <Plus size={18} />
            <span>{t('covenant.action.found')}</span>
          </button>
        </div>

        {/* Search & Filter Bar - Positioned below header */}
        <div className="px-10 pb-10">
          {/* Search & Filter Bar - Positioned below header */}
          <div className="max-w-6xl mb-12">
            <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-full border border-outline-variant shadow-sm w-full">
              <Search size={18} className="text-text-muted opacity-60" />
              <input 
                type="text" 
                placeholder={t('covenant.list.filter')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-body text-sm"
              />
              <div className="h-8 w-px bg-outline-variant/30" />
              <div className="flex items-center gap-2 px-2">
                <Filter size={16} className="text-text-muted opacity-60" />
                <select 
                  value={selectedTribunal}
                  onChange={(e) => setSelectedTribunal(e.target.value)}
                  className="bg-transparent border-none outline-none font-label uppercase text-[10px] tracking-widest cursor-pointer pr-4 font-bold text-text-muted hover:text-primary transition-colors"
                >
                  <option value="all">{t('covenant.list.tribunals')}</option>
                  {TRIBUNALS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCovenants.map((cov) => (
            <div 
              key={cov.id}
              onClick={() => handleSelectCovenant(cov)}
              className="bg-white p-10 rounded-[2rem] border border-outline-variant shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                {cov.domus_magna ? <Crown size={80} /> : <Landmark size={80} />}
              </div>

              <div className="flex justify-between items-start mb-10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      {cov.domus_magna ? <Crown className="text-accent" size={24} /> : <Landmark className="text-primary" size={24} />}
                    </div>
                    {cov.is_official && (
                      <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20">
                        <CheckCircle2 size={12} />
                        <span className="text-[9px] font-label uppercase font-bold tracking-wider">Officiel</span>
                      </div>
                    )}
                  </div>
                  {cov.domus_magna && (
                    <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-700 px-3 py-1 rounded-full border border-yellow-500/20 w-fit">
                      <Sparkles size={10} className="text-yellow-500" />
                      <span className="text-[8px] font-label uppercase font-bold tracking-widest">Domus Magna {cov.domus_magna}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-label uppercase tracking-widest text-text-muted bg-bg-sidebar px-3 py-1 rounded-full">
                    {TRIBUNALS.find(t => t.id === cov.tribunal)?.label || cov.tribunal}
                  </span>
                  {!cov.is_official && (
                    <button 
                      onClick={(e) => handleDelete(e, cov.id)}
                      className="p-2 text-text-muted hover:text-danger hover:bg-danger/5 rounded-full transition-all"
                      title="Supprimer l'Alliance"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-3xl font-header text-text-main mb-6 group-hover:text-primary transition-colors">
                {cov.name}
              </h3>

              <div className="space-y-4 mb-10">
                 <div className="flex items-center gap-3 text-text-muted">
                    <MapPin size={14} className="text-accent" />
                    <span className="text-xs font-body">Aura {cov.aura_type === 'magic' ? 'Magique' : 
                                                            cov.aura_type === 'faerie' ? 'Féérique' :
                                                            cov.aura_type === 'divine' ? 'Divine' :
                                                            cov.aura_type === 'infernal' ? 'Infernale' : 'Neutre'} de niveau {cov.aura_level}</span>
                 </div>
                 <div className="flex items-center gap-3 text-text-muted">
                    <History size={14} className="text-accent" />
                    <span className="text-xs font-body">Fondée en l'an {cov.founding_year}</span>
                 </div>
              </div>

              <div className="pt-6 border-t border-outline-variant flex justify-between items-center">
                 <span className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Ouvrir le Registre</span>
                 <ArrowRight size={16} className="text-primary translate-x-0 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

  // 3. Detail View (Selected Alliance)
  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-parchment-light">
      {/* Back Button */}
      {!forceTab && (
        <div className="px-10 pt-8">
          <button 
            onClick={() => setSelectedCov(null)}
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-label text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Retour aux Alliances
          </button>
        </div>
      )}

      {/* Top Banner: Covenant Identity & Season */}
      <header className="sticky top-0 z-50 p-6 pointer-events-none mb-4">
        <div className="bg-bg-sidebar/90 backdrop-blur-md p-6 rounded-2xl border border-accent/20 shadow-xl flex justify-between items-end pointer-events-auto w-full">
          <div>
            {!forceTab && (
              <div className="flex items-center gap-4 mb-3">
                <span className="text-[8px] font-label uppercase tracking-[0.3em] bg-accent/10 text-accent px-3 py-0.5 rounded-full border border-accent/20">
                  {TRIBUNALS.find(t => t.id === selectedCov?.tribunal)?.label || selectedCov?.tribunal}
                </span>
                <span className="text-[8px] font-label uppercase tracking-[0.3em] bg-primary/10 text-primary px-3 py-0.5 rounded-full border border-primary/20">
                  Aura {selectedCov?.aura_type} {selectedCov?.aura_level}
                </span>
              </div>
            )}
            <h1 className="text-4xl font-header text-text-main tracking-tight flex items-center gap-4">
              {forceTab === 'magi' ? <Zap className="text-purple-400" size={32} /> :
               forceTab === 'companions' ? <Shield className="text-blue-400" size={32} /> :
               forceTab === 'grogs' ? <Skull className="text-slate-400" size={32} /> :
               selectedCov?.domus_magna ? <Crown className="text-accent" size={32} /> : 
               <Landmark className="text-primary" size={32} />}
              {forceTab === 'magi' ? t('dashboard.tile.magi.title') :
               forceTab === 'companions' ? t('dashboard.tile.companions.title') :
               forceTab === 'grogs' ? t('dashboard.tile.grogs.title') :
               selectedCov?.name}
            </h1>
            {forceTab && (
              <p className="text-[0.6rem] font-label text-accent uppercase tracking-[0.3em] font-bold opacity-70 mt-2">
                Archives de l'Ordre d'Hermès — An {season?.year}
              </p>
            )}
          </div>

          <div className="flex items-center gap-6 border-l border-outline-variant/20 pl-8 ml-8">
            <Calendar className="text-primary opacity-60" size={24} />
            <div className="pr-6">
              <p className="text-[8px] font-label uppercase text-text-muted mb-0.5">{t('covenant.detail.season_label')}</p>
              <p className="text-xl font-header text-text-main capitalize">
                {season?.quarter === 'spring' ? t('season.spring') :
                season?.quarter === 'summer' ? t('season.summer') :
                season?.quarter === 'autumn' ? t('season.autumn') :
                season?.quarter === 'winter' ? t('season.winter') : season?.quarter} {season?.year}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Action Bar (Below Header) */}
      <div className="px-10 mb-10 flex items-center gap-6">
        <button 
          onClick={() => {
            const type = forceTab === 'magi' ? 'magus' : forceTab === 'companions' ? 'companion' : 'grog';
            const label = forceTab === 'magi' ? "du Mage" : forceTab === 'companions' ? "du Custos" : "du Grog";
            const name = prompt(`Nom ${label} ?`);
            if (name) {
              invoke('create_character', { 
                name, 
                characterType: type, 
                covenantId: selectedCov?.id 
              }).then(() => handleSelectCovenant(selectedCov!));
            }
          }}
          className="btn-hermetic !flex-row !gap-3 !py-3"
        >
          <Skull size={20} />
          <span>
            {forceTab === 'magi' ? t('character.action.create_magus') :
             forceTab === 'companions' ? t('character.action.create_companion') :
             forceTab === 'grogs' ? t('character.action.create_grog') :
             "Recruter"}
          </span>
        </button>

        <button 
          onClick={handleAdvanceSeason}
          className="btn-hermetic !flex-row !min-w-0 !px-6 !py-3 !gap-2 !rounded-lg"
        >
          <TrendingUp size={16} />
          <span className="text-[10px] font-bold">{t('covenant.detail.advance')}</span>
        </button>
      </div>

      <div className="px-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Resources & Stats */}
        {!forceTab && (
          <div className="space-y-10">
          <div className="bg-white p-8 rounded-3xl border border-outline-variant shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-header text-xl flex items-center gap-3">
                 <Coins className="text-accent" size={20} />
                 Trésorerie
               </h3>
               <span className="text-xs font-label text-text-muted">Archives {season?.year}</span>
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
          </div>

          <div className="bg-white p-8 rounded-3xl border border-outline-variant shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-header text-xl flex items-center gap-3">
                 <BookOpen className="text-primary" size={20} />
                 Scriptorium
               </h3>
             </div>
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
      )}
        
        {/* Right Column: Character Roster */}
        <div className={`${forceTab ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters
              .filter(char => {
                if (forceTab === 'magi') return char.character_type === 'magus';
                if (forceTab === 'companions') return char.character_type === 'companion';
                if (forceTab === 'grogs') return char.character_type === 'grog';
                return true;
              })
              .map((char) => (
                <div key={char.id} className="bg-white p-6 rounded-3xl border border-outline-variant hover:border-primary/40 hover:shadow-xl hover:scale-[1.01] transition-all group cursor-pointer">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-parchment flex items-center justify-center border border-accent/10 group-hover:bg-primary/5 transition-colors">
                      {getTypeIcon(char.character_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-header group-hover:text-primary transition-colors">{char.name}</h4>
                        {char.is_official && (
                          <span className="text-[7px] font-label uppercase tracking-[0.1em] bg-accent/10 text-accent px-1.5 py-0.5 rounded border border-accent/20 font-bold">
                            {t('character.label.official')}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-label uppercase tracking-widest text-text-muted">{char.house || char.character_type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/50">
                    <div>
                      <p className="text-[9px] font-label uppercase text-text-muted">Altération</p>
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
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default CovenantDashboard;
