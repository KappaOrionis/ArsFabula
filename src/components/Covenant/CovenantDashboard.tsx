import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    founding_year: 1220,
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
      console.error('Failed to select covenant:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCovenants();
  }, [forceTab]);

  const filteredCovenants = allCovenants.filter(cov => {
    const matchesSearch = cov.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTribunal = selectedTribunal === 'all' || cov.tribunal === selectedTribunal;
    return matchesSearch && matchesTribunal;
  });

  const handleAdvanceSeason = async () => {
    if (!selectedCov) return;
    try {
      await invoke('advance_season', { covenantId: selectedCov.id });
      handleSelectCovenant(selectedCov);
    } catch (error) {
      console.error('Failed to advance season:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t('covenant.action.delete_confirm'))) {
      try {
        await invoke('delete_covenant', { id });
        fetchAllCovenants();
        if (selectedCov?.id === id) setSelectedCov(null);
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'magus': return <span className="material-symbols-outlined text-primary">bolt</span>;
      case 'companion': return <span className="material-symbols-outlined text-secondary">shield</span>;
      case 'grog': return <span className="material-symbols-outlined text-on-surface-variant">skull</span>;
      default: return null;
    }
  };

  const renderWizard = () => {
    if (!showWizard) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <div className="bg-surface w-full max-w-2xl alchemical-border p-1 shadow-2xl rounded-xl">
          <div className="bg-surface p-10 space-y-8 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-label-sm text-secondary tracking-widest">Fondation</span>
                <h2 className="font-headline-lg text-on-surface">Nouvelle Alliance</h2>
              </div>
              <button onClick={() => setShowWizard(false)} className="material-symbols-outlined text-on-surface-variant hover:text-primary">close</button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-label-sm text-on-surface-variant">Nom de l'Alliance</label>
                <input 
                  type="text" 
                  value={wizardData.name}
                  onChange={e => setWizardData({...wizardData, name: e.target.value})}
                  className="input-ruled"
                  placeholder="ex: Doissetep, Coeris..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-label-sm text-on-surface-variant">Tribunal</label>
                  <select 
                    value={wizardData.tribunal}
                    onChange={e => setWizardData({...wizardData, tribunal: e.target.value})}
                    className="input-ruled cursor-pointer"
                  >
                    {TRIBUNALS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-label-sm text-on-surface-variant">Année de Fondation</label>
                  <input 
                    type="number" 
                    value={wizardData.founding_year}
                    onChange={e => setWizardData({...wizardData, founding_year: parseInt(e.target.value)})}
                    className="input-ruled"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4">
              <button onClick={() => setShowWizard(false)} className="px-8 py-3 font-label-sm text-on-surface-variant">Annuler</button>
              <button 
                onClick={async () => {
                  try {
                    await invoke('create_covenant', { ...wizardData });
                    setShowWizard(false);
                    fetchAllCovenants();
                  } catch (e) { console.error(e); }
                }}
                className="btn-hermetic !flex-row !gap-2 !py-3 !px-8 !min-w-0"
              >
                <span className="material-symbols-outlined">auto_fix</span>
                <span>Sceller le Pacte</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !allCovenants.length) return <div className="p-20 text-center font-headline-md opacity-50 animate-pulse">Consultation des Archives...</div>;

  // 2. List View (All Alliances)
  if (!selectedCov && !forceTab) {
    return (
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar parchment-texture relative">
        {renderWizard()}
        
        <header className="sticky top-0 z-50 p-6 pointer-events-none mb-4">
          <div className="bg-surface-container/90 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/30 shadow-xl inline-block pointer-events-auto">
            <div>
              <h2 className="font-headline-lg text-on-surface flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-4xl">castle</span>
                {t('covenant.list.title')}
              </h2>
              <p className="font-label-sm text-secondary tracking-[0.2em] mt-1">
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
            <span className="material-symbols-outlined">add</span>
            <span>{t('covenant.action.found')}</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-10 pb-10">
          <div className="max-w-6xl mb-12">
            <div className="flex items-center gap-4 bg-surface p-2 pl-6 rounded-full border border-outline-variant shadow-sm w-full">
              <span className="material-symbols-outlined text-on-surface-variant opacity-60">search</span>
              <input 
                type="text" 
                placeholder={t('covenant.list.filter')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-body-md"
              />
              <div className="h-8 w-px bg-outline-variant/30" />
              <div className="flex items-center gap-2 px-4">
                <span className="material-symbols-outlined text-on-surface-variant opacity-60">filter_list</span>
                <select 
                  value={selectedTribunal}
                  onChange={(e) => setSelectedTribunal(e.target.value)}
                  className="bg-transparent border-none outline-none font-label-sm tracking-widest cursor-pointer pr-4 hover:text-primary transition-colors"
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
              className="bg-surface p-10 rounded-[2rem] border border-outline-variant/50 shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[80px]">{cov.domus_magna ? 'workspace_premium' : 'castle'}</span>
              </div>

              <div className="flex justify-between items-start mb-10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-container/10 p-4 rounded-2xl">
                      <span className="material-symbols-outlined text-primary text-2xl">{cov.domus_magna ? 'workspace_premium' : 'castle'}</span>
                    </div>
                    {cov.is_official && (
                      <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1 rounded-full border border-secondary/20">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        <span className="font-label-sm !text-[9px]">Officiel</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-label-sm !text-[10px] bg-surface-container px-3 py-1 rounded-full">
                    {TRIBUNALS.find(t => t.id === cov.tribunal)?.label || cov.tribunal}
                  </span>
                </div>
              </div>

              <h3 className="font-headline-md mb-6 group-hover:text-primary transition-colors">
                {cov.name}
              </h3>

              <div className="space-y-4 mb-10">
                 <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">location_on</span>
                    <span className="font-body-md !text-xs">Aura {cov.aura_type} de niveau {cov.aura_level}</span>
                 </div>
                 <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">history</span>
                    <span className="font-body-md !text-xs">Fondée en l'an {cov.founding_year}</span>
                 </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/30 flex justify-between items-center">
                 <span className="font-label-sm !text-[10px] text-primary">Ouvrir le Registre</span>
                 <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">arrow_forward</span>
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
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar parchment-texture">
      {/* Back Button */}
      {!forceTab && (
        <div className="px-10 pt-8">
          <button 
            onClick={() => setSelectedCov(null)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-sm !text-xs"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> Retour aux Alliances
          </button>
        </div>
      )}

      {/* Top Banner */}
      <header className="sticky top-0 z-50 p-6 pointer-events-none mb-4">
        <div className="bg-surface-container/90 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/30 shadow-xl flex justify-between items-end pointer-events-auto w-full">
          <div>
            {!forceTab && (
              <div className="flex items-center gap-4 mb-3">
                <span className="font-label-sm !text-[8px] bg-secondary/10 text-secondary px-3 py-1 rounded-full border border-secondary/20 uppercase tracking-widest">
                  {TRIBUNALS.find(t => t.id === selectedCov?.tribunal)?.label || selectedCov?.tribunal}
                </span>
                <span className="font-label-sm !text-[8px] bg-primary-container/10 text-primary px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">
                  Aura {selectedCov?.aura_type} {selectedCov?.aura_level}
                </span>
              </div>
            )}
            <h1 className="font-headline-lg text-on-surface flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-4xl">
                {forceTab === 'magi' ? 'bolt' :
                 forceTab === 'companions' ? 'shield' :
                 forceTab === 'grogs' ? 'skull' :
                 selectedCov?.domus_magna ? 'workspace_premium' : 'castle'}
              </span>
              {forceTab === 'magi' ? t('dashboard.tile.magi.title') :
               forceTab === 'companions' ? t('dashboard.tile.companions.title') :
               forceTab === 'grogs' ? t('dashboard.tile.grogs.title') :
               selectedCov?.name}
            </h1>
            <p className="font-label-sm text-secondary tracking-[0.2em] mt-2">
              Archives de l'Ordre d'Hermès — An {season?.year}
            </p>
          </div>

        </div>
      </header>

      {/* Action Bar */}
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
          <span className="material-symbols-outlined text-2xl">person_add</span>
          <span>
            {forceTab === 'magi' ? t('character.action.create_magus') :
             forceTab === 'companions' ? t('character.action.create_companion') :
             forceTab === 'grogs' ? t('character.action.create_grog') :
             "Recruter"}
          </span>
        </button>

      </div>

      <div className="px-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {!forceTab && (
            <div className="space-y-10">
              <div className="bg-surface p-8 rounded-3xl border border-outline-variant/30 shadow-sm manuscript-border">
                 <div className="flex items-center justify-between mb-8">
                   <h3 className="font-headline-md !text-xl flex items-center gap-3">
                     <span className="material-symbols-outlined text-secondary">payments</span>
                     Trésorerie
                   </h3>
                   <span className="font-label-sm !text-[10px] text-on-surface-variant">An {season?.year}</span>
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="font-body-md !text-sm">Argent (Livres)</span>
                      </div>
                      <span className="font-headline-md !text-lg">450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-body-md !text-sm">Vis en Stock</span>
                      </div>
                      <span className="font-headline-md !text-lg">12</span>
                    </div>
                 </div>
              </div>

              <div className="bg-surface p-8 rounded-3xl border border-outline-variant/30 shadow-sm manuscript-border">
                 <div className="flex items-center justify-between mb-8">
                   <h3 className="font-headline-md !text-xl flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary">menu_book</span>
                     Scriptorium
                   </h3>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1 bg-surface-container py-4 rounded-xl text-center border border-outline-variant/10">
                      <p className="font-headline-md text-2xl">8</p>
                      <p className="font-label-sm !text-[8px] opacity-60">Summae</p>
                    </div>
                    <div className="flex-1 bg-surface-container py-4 rounded-xl text-center border border-outline-variant/10">
                      <p className="font-headline-md text-2xl">24</p>
                      <p className="font-label-sm !text-[8px] opacity-60">Tractatus</p>
                    </div>
                 </div>
              </div>
            </div>
          )}
          
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
                  <div key={char.id} className="bg-surface p-6 rounded-3xl border border-outline-variant/50 hover:border-primary/40 hover:shadow-xl transition-all group cursor-pointer alchemical-border">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant/20 group-hover:bg-primary-container/10 transition-colors">
                        {getTypeIcon(char.character_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline-md !text-xl group-hover:text-primary transition-colors">{char.name}</h4>
                          {char.is_official && (
                            <span className="font-label-sm !text-[7px] bg-secondary/10 text-secondary px-2 py-0.5 rounded border border-secondary/20">
                              {t('character.label.official')}
                            </span>
                          )}
                        </div>
                        <p className="font-label-sm !text-[10px] text-on-surface-variant uppercase tracking-widest">{char.house || char.character_type}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20">
                      <div>
                        <p className="font-label-sm !text-[9px] text-on-surface-variant">Altération</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${Math.min(100, char.warp_score * 10)}%` }} />
                          </div>
                          <span className="font-headline-md !text-xs">{char.warp_score}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-label-sm !text-[9px] text-on-surface-variant">Activité</p>
                        <p className="font-body-md !text-xs italic text-secondary">Étude de l'Ignem</p>
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
