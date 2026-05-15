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
  description: string | null;
  domus_magna: string | null;
  season_status: string | null;
  location_desc: string | null;
  gps_coords: string | null;
  notable_magi: string | null;
  custodes: string | null;
  grogs_desc: string | null;
  vis_sources: string | null;
  laboratories: string | null;
  library: string | null;
  visual_path?: string | null;
  created_at: string;
  updated_at: string;
}

interface Season {
  id: string;
  covenant_id: string;
  year: number;
  quarter: string;
  event_summary: string | null;
  is_current: boolean;
  completed_at: string | null;
  created_at: string;
}

interface Character {
  id: string;
  covenant_id: string;
  name: string;
  character_type: 'magus' | 'companion' | 'grog';
  house?: string;
  birth_year: number;
  warp_score: number;
  warp_points: number;
  confidence_score: number;
  confidence_points: number;
  description?: string;
  is_active: boolean;
  is_official: boolean;
  death_year?: number | null;
  favored_arts?: string | null;
  familiar_link?: string | null;
  apprentice_registry?: string | null;
  biographical_notice?: string | null;
  source_book?: string | null;
  page_reference?: string | null;
  visual_path?: string | null;
  created_at: string;
  updated_at: string;
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
  // const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    name: '',
    tribunal: 'Rhine',
    auraType: 'magic',
    auraLevel: 3,
    founding_year: 1220,
    description: ''
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAllCovenants = async () => {
    try {
      setErrorMsg(null);
      const data: Covenant[] = await invoke('list_covenants');
      setAllCovenants(data);
      if (!selectedCov && data.length > 0 && forceTab) {
        handleSelectCovenant(data[0]);
      }
    } catch (error: any) {
      console.error('Failed to fetch covenants:', error);
      setErrorMsg(error.toString());
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

  /*
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
  */

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

  if (errorMsg) {
    return (
      <div className="p-20 text-center">
        <h2 className="font-headline-lg text-red-500">Erreur lors de la lecture des archives</h2>
        <p className="font-body-md text-on-surface-variant opacity-80 mt-4 max-w-2xl mx-auto p-4 bg-red-500/10 rounded-lg border border-red-500/30">
          {errorMsg}
        </p>
      </div>
    );
  }

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
              <p className="font-body-md text-on-surface-variant opacity-70 mt-4 max-w-2xl italic leading-relaxed border-l border-primary/30 pl-4">
                {t('covenant.list.purpose')}
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
          <div className="max-w-6xl mb-12 space-y-4">
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

            {/* Compteur d'alliances sous le filtre */}
            <div className="flex items-center gap-2 px-4 text-on-surface-variant opacity-80 font-label-sm animate-fade-in">
              <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
              <span>
                {filteredCovenants.length} alliance{filteredCovenants.length > 1 ? 's' : ''} affichée{filteredCovenants.length > 1 ? 's' : ''} sur {allCovenants.length} au total
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCovenants.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20 mb-4">search_off</span>
              <p className="font-headline-md text-on-surface-variant opacity-50">Aucune alliance trouvée dans les archives.</p>
              <p className="font-body-md text-on-surface-variant opacity-40 mt-2">Vérifiez vos filtres ou créez une nouvelle alliance.</p>
            </div>
          )}
          {filteredCovenants.map((cov) => (
            <div 
              key={cov.id}
              onClick={() => handleSelectCovenant(cov)}
              className="bg-surface rounded-[2.5rem] border border-outline-variant/60 shadow-md hover:shadow-2xl hover:-translate-y-2.5 transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col alchemical-border backdrop-blur-sm"
            >
              {cov.visual_path ? (
                <div className="h-64 w-full relative overflow-hidden bg-surface-container">
                  <img src={cov.visual_path} alt={cov.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                  <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
                    {cov.is_official && (
                      <div className="bg-surface/90 backdrop-blur-md text-secondary px-3.5 py-1.5 rounded-full border border-secondary/30 flex items-center gap-1.5 shadow-lg">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        <span className="font-label-sm !text-[10px] tracking-widest font-bold uppercase">Officiel</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-5 right-5 z-10">
                    <span className="font-label-sm !text-[10px] bg-surface/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-outline-variant/40 shadow-lg text-on-surface tracking-widest uppercase font-bold">
                      {TRIBUNALS.find(t => t.id === cov.tribunal)?.label || cov.tribunal}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-6 right-6 z-10 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="font-label-sm !text-[10px] text-primary tracking-widest uppercase bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20 shadow-md">Explorer l'Alliance</span>
                  </div>
                </div>
              ) : (
                <div className="p-10 pb-0 flex justify-between items-center mb-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-container/10 p-5 rounded-2xl border border-primary/20 shadow-inner">
                        <span className="material-symbols-outlined text-primary text-3xl">{cov.domus_magna ? 'workspace_premium' : 'castle'}</span>
                      </div>
                      {cov.is_official && (
                        <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-3.5 py-1.5 rounded-full border border-secondary/20 shadow-sm">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          <span className="font-label-sm !text-[10px] tracking-widest font-bold uppercase">Officiel</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-label-sm !text-[10px] bg-surface-container px-4 py-1.5 rounded-full border border-outline-variant/30 tracking-widest uppercase font-bold shadow-sm">
                      {TRIBUNALS.find(t => t.id === cov.tribunal)?.label || cov.tribunal}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-8 pt-6 flex-1 flex flex-col justify-between z-10 bg-gradient-to-b from-transparent to-surface/50">
                <div>
                  <h3 className="font-headline-md !text-2xl mb-6 group-hover:text-primary transition-colors duration-300 flex items-center justify-between gap-2">
                    <span className="truncate">{cov.name}</span>
                    {cov.domus_magna && (
                      <span className="material-symbols-outlined text-secondary text-xl" title={`Domus Magna: Maison ${cov.domus_magna}`}>workspace_premium</span>
                    )}
                  </h3>

                  <div className="space-y-3 mb-8">
                     <div className="flex items-center gap-3.5 text-on-surface-variant bg-surface-container-low/80 p-3.5 rounded-2xl border border-outline-variant/30 shadow-sm group-hover:border-primary/20 transition-colors">
                        <div className="p-2 bg-secondary/10 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary text-base">my_location</span>
                        </div>
                        <span className="font-body-md !text-sm">Aura <strong className="text-primary capitalize">{cov.aura_type}</strong> • Niveau <strong className="text-primary">{cov.aura_level}</strong></span>
                     </div>
                     <div className="flex items-center gap-3.5 text-on-surface-variant bg-surface-container-low/80 p-3.5 rounded-2xl border border-outline-variant/30 shadow-sm group-hover:border-primary/20 transition-colors">
                        <div className="p-2 bg-primary/10 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-base">history_edu</span>
                        </div>
                        <span className="font-body-md !text-sm">Fondée en l'an <strong className="text-on-surface">{cov.founding_year}</strong></span>
                     </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/40 flex justify-between items-center mt-auto">
                   <span className="font-label-sm !text-[11px] text-primary tracking-widest uppercase group-hover:tracking-[0.2em] transition-all duration-300 font-bold">Ouvrir le Registre</span>
                   <div className="w-8 h-8 rounded-full bg-primary-container/10 group-hover:bg-primary flex items-center justify-center transition-colors duration-300">
                     <span className="material-symbols-outlined text-primary group-hover:text-on-primary group-hover:translate-x-0.5 transition-all duration-300 text-sm">arrow_forward</span>
                   </div>
                </div>
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
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-sm !text-xs tracking-widest uppercase font-bold py-2 px-4 rounded-xl hover:bg-surface-container/50 border border-transparent hover:border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> Retour aux Alliances
          </button>
        </div>
      )}

      {/* Top Banner */}
      <header className="sticky top-0 z-50 p-6 pointer-events-none mb-6">
        <div className="bg-surface/95 backdrop-blur-xl rounded-[2.5rem] border border-outline-variant/50 shadow-2xl overflow-hidden pointer-events-auto w-full relative min-h-[240px] flex flex-col justify-center alchemical-border">
          {!forceTab && selectedCov?.visual_path && (
            <>
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img src={selectedCov.visual_path} alt={selectedCov?.name} className="w-full h-full object-cover object-center filter saturate-50 opacity-25 pointer-events-none transform scale-105" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-transparent md:to-surface/20" />
            </>
          )}
          <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 w-full">
            <div className="space-y-4 max-w-3xl flex-1">
              {!forceTab && selectedCov && (
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="font-label-sm !text-[10px] bg-secondary/20 text-secondary px-4 py-1.5 rounded-full border border-secondary/30 uppercase tracking-widest shadow-sm font-bold">
                    {TRIBUNALS.find(t => t.id === selectedCov?.tribunal)?.label || selectedCov?.tribunal}
                  </span>
                  <span className="font-label-sm !text-[10px] bg-primary-container/20 text-primary px-4 py-1.5 rounded-full border border-primary/30 uppercase tracking-widest shadow-sm font-bold">
                    Aura {selectedCov?.aura_type} • Niveau {selectedCov?.aura_level}
                  </span>
                  {selectedCov?.is_official && (
                    <span className="font-label-sm !text-[10px] bg-secondary text-on-secondary px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 font-bold tracking-widest uppercase">
                      <span className="material-symbols-outlined text-xs">verified</span> Officiel
                    </span>
                  )}
                </div>
              )}
              <h1 className="font-display-lg text-on-surface flex items-center gap-5 drop-shadow-sm">
                <span className="material-symbols-outlined text-primary text-5xl p-4 bg-primary-container/10 rounded-[1.75rem] border border-primary/20 shadow-inner flex items-center justify-center">
                  {forceTab === 'magi' ? 'bolt' :
                   forceTab === 'companions' ? 'shield' :
                   forceTab === 'grogs' ? 'skull' :
                   selectedCov?.domus_magna ? 'workspace_premium' : 'castle'}
                </span>
                <span>
                  {forceTab === 'magi' ? t('dashboard.tile.magi.title') :
                   forceTab === 'companions' ? t('dashboard.tile.companions.title') :
                   forceTab === 'grogs' ? t('dashboard.tile.grogs.title') :
                   selectedCov?.name}
                </span>
              </h1>
              {forceTab === 'magi' && (
                <p className="font-body-md text-on-surface-variant opacity-80 mt-4 max-w-2xl italic leading-relaxed border-l-2 border-primary pl-4 py-1 bg-surface-container-low/50 rounded-r-xl">
                  {t('character.magi.purpose')}
                </p>
              )}
              {forceTab === 'companions' && (
                <p className="font-body-md text-on-surface-variant opacity-80 mt-4 max-w-2xl italic leading-relaxed border-l-2 border-secondary pl-4 py-1 bg-surface-container-low/50 rounded-r-xl">
                  {t('character.companions.purpose')}
                </p>
              )}
              {forceTab === 'grogs' && (
                <p className="font-body-md text-on-surface-variant opacity-80 mt-4 max-w-2xl italic leading-relaxed border-l-2 border-outline-variant pl-4 py-1 bg-surface-container-low/50 rounded-r-xl">
                  {t('character.grogs.purpose')}
                </p>
              )}
              {!forceTab && selectedCov?.domus_magna && (
                <p className="font-label-sm text-primary tracking-widest uppercase flex items-center gap-2 mt-2 font-bold">
                  <span className="material-symbols-outlined text-base animate-pulse">workspace_premium</span> Domus Magna de la Maison {selectedCov.domus_magna}
                </p>
              )}
            </div>
            {!forceTab && selectedCov?.gps_coords && (
              <div className="flex items-center gap-4 bg-surface/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-outline-variant/50 shadow-xl self-start md:self-center">
                <div className="p-3 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-3xl animate-spin" style={{ animationDuration: '20s' }}>explore</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant/70 !text-[10px] uppercase tracking-widest font-bold">Coordonnées Hermétiques</p>
                  <p className="font-mono font-bold text-on-surface text-base mt-0.5">{selectedCov.gps_coords}</p>
                </div>
              </div>
            )}
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
          className="btn-hermetic !flex-row !gap-3 !py-3.5 !px-8 shadow-lg hover:shadow-xl"
        >
          <span className="material-symbols-outlined text-2xl">person_add</span>
          <span className="font-bold tracking-widest">
            {forceTab === 'magi' ? t('character.action.create_magus') :
             forceTab === 'companions' ? t('character.action.create_companion') :
             forceTab === 'grogs' ? t('character.action.create_grog') :
             "Recruter"}
          </span>
        </button>
      </div>

      <div className="px-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {!forceTab && selectedCov && (
            <div className="col-span-full bg-surface p-10 md:p-12 rounded-[2.5rem] border border-outline-variant/60 alchemical-border shadow-2xl mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-outline-variant/40 relative z-10">
                <div>
                  <span className="font-label-sm text-secondary tracking-widest uppercase font-bold flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm">menu_book</span> Recensement Hermétique
                  </span>
                  <h3 className="font-display-lg text-on-surface mt-1">Archives & Spécifications</h3>
                </div>
                <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-2xl border border-outline-variant/40 shadow-sm">
                  <span className="material-symbols-outlined text-secondary text-lg">history</span>
                  <span className="font-label-sm font-mono text-on-surface-variant font-bold">Fondation : An {selectedCov.founding_year}</span>
                </div>
              </div>

              {selectedCov.description && (
                <div className="mb-12 p-8 bg-surface-container/60 rounded-[2rem] border-l-4 border-primary italic font-body-lg text-on-surface-variant leading-relaxed shadow-inner relative overflow-hidden">
                  <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-9xl text-primary/5 select-none pointer-events-none">format_quote</span>
                  <p className="relative z-10">"{selectedCov.description}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
                {selectedCov.location_desc && (
                  <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/40 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-primary mb-4 pb-3 border-b border-outline-variant/20">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                          <span className="material-symbols-outlined text-lg">landscape</span>
                        </div>
                        <h4 className="font-label-sm uppercase tracking-widest font-bold">Emplacement</h4>
                      </div>
                      <p className="font-body-md text-on-surface-variant leading-relaxed">{selectedCov.location_desc}</p>
                    </div>
                  </div>
                )}
                {selectedCov.season_status && (
                  <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/40 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-secondary mb-4 pb-3 border-b border-outline-variant/20">
                        <div className="p-2.5 bg-secondary/10 rounded-xl">
                          <span className="material-symbols-outlined text-lg">change_history</span>
                        </div>
                        <h4 className="font-label-sm uppercase tracking-widest font-bold">Saison Hermétique</h4>
                      </div>
                      <p className="font-body-md text-on-surface-variant leading-relaxed">{selectedCov.season_status}</p>
                    </div>
                  </div>
                )}
                {selectedCov.domus_magna && (
                  <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/40 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-primary mb-4 pb-3 border-b border-outline-variant/20">
                        <div className="p-2.5 bg-primary-container/10 rounded-xl">
                          <span className="material-symbols-outlined text-lg">workspace_premium</span>
                        </div>
                        <h4 className="font-label-sm uppercase tracking-widest font-bold">Statut Domiciliaire</h4>
                      </div>
                      <p className="font-body-md text-on-surface-variant leading-relaxed">{selectedCov.domus_magna}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-outline-variant/30 relative z-10">
                {selectedCov.notable_magi && (
                  <div className="bg-surface-container/40 p-8 rounded-3xl border border-outline-variant/30 shadow-sm hover:border-primary/40 hover:shadow-lg transition-all space-y-4 group">
                    <div className="flex items-center gap-3 text-primary border-b border-outline-variant/20 pb-4">
                      <div className="p-3 bg-primary-container/10 rounded-2xl group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">bolt</span>
                      </div>
                      <h4 className="font-label-sm uppercase tracking-widest !text-sm font-bold">Mages Notables</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant leading-relaxed pt-1">{selectedCov.notable_magi}</p>
                  </div>
                )}
                {selectedCov.custodes && (
                  <div className="bg-surface-container/40 p-8 rounded-3xl border border-outline-variant/30 shadow-sm hover:border-secondary/40 hover:shadow-lg transition-all space-y-4 group">
                    <div className="flex items-center gap-3 text-secondary border-b border-outline-variant/20 pb-4">
                      <div className="p-3 bg-secondary/10 rounded-2xl group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                        <span className="material-symbols-outlined text-xl">shield</span>
                      </div>
                      <h4 className="font-label-sm uppercase tracking-widest !text-sm font-bold">Custodes & Érudits</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant leading-relaxed pt-1">{selectedCov.custodes}</p>
                  </div>
                )}
                {selectedCov.grogs_desc && (
                  <div className="bg-surface-container/40 p-8 rounded-3xl border border-outline-variant/30 shadow-sm hover:border-outline/40 hover:shadow-lg transition-all space-y-4 group">
                    <div className="flex items-center gap-3 text-on-surface-variant border-b border-outline-variant/20 pb-4">
                      <div className="p-3 bg-surface-container-high rounded-2xl group-hover:bg-on-surface-variant group-hover:text-surface transition-colors">
                        <span className="material-symbols-outlined text-xl">military_tech</span>
                      </div>
                      <h4 className="font-label-sm uppercase tracking-widest !text-sm font-bold">Garnison & Grogs</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant leading-relaxed pt-1">{selectedCov.grogs_desc}</p>
                  </div>
                )}
                {selectedCov.vis_sources && (
                  <div className="bg-surface-container/40 p-8 rounded-3xl border border-outline-variant/30 shadow-sm hover:border-primary/40 hover:shadow-lg transition-all space-y-4 group">
                    <div className="flex items-center gap-3 text-primary border-b border-outline-variant/20 pb-4">
                      <div className="p-3 bg-primary-container/10 rounded-2xl group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">diamond</span>
                      </div>
                      <h4 className="font-label-sm uppercase tracking-widest !text-sm font-bold">Sources de Vis</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant leading-relaxed pt-1">{selectedCov.vis_sources}</p>
                  </div>
                )}
                {selectedCov.laboratories && (
                  <div className="bg-surface-container/40 p-8 rounded-3xl border border-outline-variant/30 shadow-sm hover:border-secondary/40 hover:shadow-lg transition-all space-y-4 group">
                    <div className="flex items-center gap-3 text-secondary border-b border-outline-variant/20 pb-4">
                      <div className="p-3 bg-secondary/10 rounded-2xl group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                        <span className="material-symbols-outlined text-xl">experiment</span>
                      </div>
                      <h4 className="font-label-sm uppercase tracking-widest !text-sm font-bold">Laboratoires</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant leading-relaxed pt-1">{selectedCov.laboratories}</p>
                  </div>
                )}
                {selectedCov.library && (
                  <div className="bg-surface-container/40 p-8 rounded-3xl border border-outline-variant/30 shadow-sm hover:border-primary/40 hover:shadow-lg transition-all space-y-4 group">
                    <div className="flex items-center gap-3 text-primary border-b border-outline-variant/20 pb-4">
                      <div className="p-3 bg-primary-container/10 rounded-2xl group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">auto_stories</span>
                      </div>
                      <h4 className="font-label-sm uppercase tracking-widest !text-sm font-bold">Bibliothèque</h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant leading-relaxed pt-1">{selectedCov.library}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!forceTab && (
            <div className="space-y-10">
              <div className="bg-surface p-10 rounded-[2.5rem] border border-outline-variant/50 shadow-xl manuscript-border relative overflow-hidden group hover:shadow-2xl transition-shadow">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full filter blur-2xl pointer-events-none" />
                 <div className="flex items-center justify-between mb-10 pb-6 border-b border-outline-variant/30">
                   <h3 className="font-headline-md !text-2xl flex items-center gap-4 text-on-surface">
                     <div className="p-3 bg-secondary/10 rounded-2xl text-secondary flex items-center justify-center border border-secondary/20 shadow-sm">
                       <span className="material-symbols-outlined text-2xl">payments</span>
                     </div>
                     Trésorerie
                   </h3>
                   <span className="font-label-sm !text-[11px] bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30 font-bold text-on-surface-variant shadow-sm">An {season?.year}</span>
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 shadow-sm hover:border-secondary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-secondary shadow-md" />
                        <span className="font-body-md font-bold text-on-surface">Argent (Livres)</span>
                      </div>
                      <span className="font-headline-md !text-2xl text-secondary font-bold">450</span>
                    </div>
                    <div className="flex justify-between items-center bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-primary shadow-md" />
                        <span className="font-body-md font-bold text-on-surface">Vis en Stock</span>
                      </div>
                      <span className="font-headline-md !text-2xl text-primary font-bold">12</span>
                    </div>
                 </div>
              </div>

              <div className="bg-surface p-10 rounded-[2.5rem] border border-outline-variant/50 shadow-xl manuscript-border relative overflow-hidden group hover:shadow-2xl transition-shadow">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-2xl pointer-events-none" />
                 <div className="flex items-center justify-between mb-10 pb-6 border-b border-outline-variant/30">
                   <h3 className="font-headline-md !text-2xl flex items-center gap-4 text-on-surface">
                     <div className="p-3 bg-primary-container/10 rounded-2xl text-primary flex items-center justify-center border border-primary/20 shadow-sm">
                       <span className="material-symbols-outlined text-2xl">menu_book</span>
                     </div>
                     Scriptorium
                   </h3>
                 </div>
                 <div className="flex gap-6">
                    <div className="flex-1 bg-surface-container-low p-6 rounded-2xl text-center border border-outline-variant/30 shadow-sm hover:border-primary/30 transition-colors group/item">
                      <p className="font-display-lg text-3xl text-primary mb-1 group-hover/item:scale-110 transition-transform">8</p>
                      <p className="font-label-sm !text-[11px] tracking-widest uppercase font-bold text-on-surface-variant">Summae</p>
                    </div>
                    <div className="flex-1 bg-surface-container-low p-6 rounded-2xl text-center border border-outline-variant/30 shadow-sm hover:border-primary/30 transition-colors group/item">
                      <p className="font-display-lg text-3xl text-primary mb-1 group-hover/item:scale-110 transition-transform">24</p>
                      <p className="font-label-sm !text-[11px] tracking-widest uppercase font-bold text-on-surface-variant">Tractatus</p>
                    </div>
                 </div>
              </div>
            </div>
          )}
          
          <div className={`${forceTab ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-8`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {characters
                .filter(char => {
                  if (forceTab === 'magi') return char.character_type === 'magus';
                  if (forceTab === 'companions') return char.character_type === 'companion';
                  if (forceTab === 'grogs') return char.character_type === 'grog';
                  return true;
                })
                .map((char) => (
                  <div key={char.id} className="bg-surface p-8 rounded-[2.5rem] border border-outline-variant/50 hover:border-primary/60 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer alchemical-border shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-outline-variant/20">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 rounded-[1.75rem] bg-surface-container flex items-center justify-center border border-outline-variant/30 group-hover:border-primary/40 transition-colors overflow-hidden relative shadow-lg group-hover:shadow-xl">
                            {char.visual_path ? (
                              <img src={char.visual_path} alt={char.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                            ) : (
                              getTypeIcon(char.character_type)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h4 className="font-headline-md !text-2xl group-hover:text-primary transition-colors duration-300 font-bold">{char.name}</h4>
                              {char.is_official && (
                                <span className="font-label-sm !text-[9px] bg-secondary/15 text-secondary px-2.5 py-1 rounded-full border border-secondary/30 font-bold tracking-widest uppercase shadow-sm">
                                  {t('character.label.official')}
                                </span>
                              )}
                            </div>
                            <p className="font-label-sm !text-[11px] text-on-surface-variant uppercase tracking-widest mt-1 font-bold">
                              {char.house ? `Maison ${char.house}` : char.character_type}
                              {char.birth_year ? ` • ${char.birth_year} - ${char.death_year || 'Présent'}` : ''}
                            </p>
                          </div>
                        </div>
                        {char.source_book && (
                          <div className="text-right hidden sm:block">
                            <span className="font-label-sm !text-[10px] bg-surface-container px-3.5 py-1.5 rounded-full border border-outline-variant/30 text-on-surface-variant block font-bold shadow-sm tracking-widest uppercase">
                              {char.source_book} {char.page_reference ? `(${char.page_reference})` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {char.description && (
                        <p className="font-body-md text-sm text-on-surface-variant mb-6 line-clamp-3 italic leading-relaxed bg-surface-container-low/50 p-4 rounded-2xl border-l-2 border-outline-variant">
                          "{char.description}"
                        </p>
                      )}

                      {char.biographical_notice && (
                        <div className="mb-6 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30 font-body-sm text-xs text-on-surface-variant leading-relaxed shadow-sm">
                          {char.biographical_notice}
                        </div>
                      )}

                      {char.character_type === 'magus' && (char.favored_arts || (char.familiar_link && char.familiar_link !== 'Aucun')) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm text-xs">
                          {char.favored_arts && (
                            <div>
                              <span className="text-primary font-label-sm uppercase tracking-widest block mb-1.5 font-bold">Arts de Prédilection</span>
                              <span className="font-body-md text-sm text-on-surface font-semibold">{char.favored_arts}</span>
                            </div>
                          )}
                          {char.familiar_link && char.familiar_link !== 'Aucun' && (
                            <div>
                              <span className="text-secondary font-label-sm uppercase tracking-widest block mb-1.5 font-bold">Lien de Familier</span>
                              <span className="font-body-md text-sm text-on-surface font-semibold">{char.familiar_link}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-outline-variant/30 mt-auto items-center">
                      <div>
                        <p className="font-label-sm !text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Altération</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, char.warp_score * 10)}%` }} />
                          </div>
                          <span className="font-headline-md !text-sm font-bold text-primary">{char.warp_score}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-label-sm !text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Statut</p>
                        <p className="font-body-md !text-sm font-bold italic text-secondary mt-0.5">{char.is_active ? 'Actif' : 'Inactif'}</p>
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
