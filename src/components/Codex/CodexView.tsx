import React, { useState } from 'react';
import { Search, Book, Sparkles, Ghost, X, ChevronRight } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface LoreEntry {
  id: string;
  title: string;
  content: string;
  entity_type: 'rule' | 'spell' | 'creature' | 'lore';
  metadata: any;
}

const CodexView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LoreEntry[]>([]);
  const [rawItems, setRawItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'search' | 'browse'>('search');
  const [browseTab, setBrowseTab] = useState<'lore' | 'alliance'>('lore');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data: LoreEntry[] = await invoke('search_lore', { query, filter_type: activeFilter });
      setResults(data);
    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.toString());
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRawData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (browseTab === 'lore') {
        const data: any[] = await invoke('list_lore');
        setRawItems(data);
      } else {
        const data: any[] = await invoke('list_spells');
        setRawItems(data);
      }
    } catch (err: any) {
      console.error('Failed to load raw data:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (viewMode === 'browse') {
      loadRawData();
    }
  }, [viewMode, browseTab]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'spell': return <Sparkles style={{ color: 'var(--blue-400)' }} />;
      case 'creature': return <Ghost style={{ color: 'var(--danger)' }} />;
      case 'rule': return <Book style={{ color: 'var(--success)' }} />;
      default: return <Book style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r bg-clip-text text-transparent" 
              style={{ backgroundImage: 'linear-gradient(to right, var(--blue-400), var(--purple-500))' }}>
            Codex Hermeticus
          </h1>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('search')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'search' ? 'bg-blue-500 text-white' : 'text-muted hover:text-white'}`}
            >
              Recherche
            </button>
            <button 
              onClick={() => setViewMode('browse')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'browse' ? 'bg-blue-500 text-white' : 'text-muted hover:text-white'}`}
            >
              Exploration
            </button>
          </div>
        </div>
        
        {viewMode === 'search' ? (
          <>
            <div className="flex gap-2">
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{ position: 'absolute', top: '50%', left: '1.25rem', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Search size={20} color="var(--text-muted)" />
                </div>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Rechercher un concept, un sort, une règle..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={handleSearch}
                className="sidebar-btn active"
                style={{ width: 'auto', padding: '0 1.5rem', borderRadius: '1rem' }}
              >
                Rechercher
              </button>
            </div>

            <div className="flex gap-3">
              {[
                { id: 'rule', label: 'Règles', icon: <Book size={16} /> },
                { id: 'spell', label: 'Sorts', icon: <Sparkles size={16} /> },
                { id: 'creature', label: 'Bestiaire', icon: <Ghost size={16} /> },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                  className={`sidebar-btn ${activeFilter === f.id ? 'active' : ''}`}
                  style={{ width: 'auto', padding: '0.5rem 1rem' }}
                >
                  {f.icon}
                  <span className="font-medium">{f.label}</span>
                  {activeFilter === f.id && <X size={12} style={{ marginLeft: '4px' }} />}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={() => setBrowseTab('lore')}
              className={`px-6 py-3 rounded-xl border flex items-center gap-3 transition-all ${browseTab === 'lore' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-muted'}`}
            >
              <Book size={20} />
              <div className="text-left">
                <p className="font-bold text-sm">Lore & Bibliothèque</p>
                <p className="text-[0.65rem] opacity-70">Données sémantiques (ChromaDB)</p>
              </div>
            </button>
            <button 
              onClick={() => setBrowseTab('alliance')}
              className={`px-6 py-3 rounded-xl border flex items-center gap-3 transition-all ${browseTab === 'alliance' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-white/5 border-white/10 text-muted'}`}
            >
              <Sparkles size={20} />
              <div className="text-left">
                <p className="font-bold text-sm">Grimoire de l'Alliance</p>
                <p className="text-[0.65rem] opacity-70">Données structurées (SQLite)</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Results Grid / Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--blue-500)', borderRadius: '50%' }}></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 px-10">
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500">
              <X size={24} />
            </div>
            <p className="text-red-400 font-medium mb-2">Erreur de chargement</p>
            <p className="text-muted text-sm max-w-md mx-auto">{error}</p>
          </div>
        ) : viewMode === 'browse' ? (
          <div className="grid grid-cols-1 gap-4" style={{ paddingBottom: '40px' }}>
            {rawItems.length > 0 ? rawItems.map((item) => (
              browseTab === 'alliance' ? (
                <div key={item.id} className="codex-card flex flex-col md:flex-row gap-6 items-center p-6">
                  <div className="flex flex-col items-center gap-1 min-w-[80px]">
                    <span className="text-2xl font-black text-blue-400">{item.level}</span>
                    <span className="text-[0.6rem] uppercase font-bold text-muted">Niveau</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{item.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[0.7rem] font-bold text-muted uppercase">
                        {item.technique} {item.form}
                      </span>
                    </div>
                    <p className="text-sm text-muted line-clamp-2">{item.description || 'Aucune description disponible.'}</p>
                  </div>
                  <button className="sidebar-btn" style={{ width: 'auto', background: 'var(--bg-sidebar)' }}>
                    Détails
                  </button>
                </div>
              ) : (
                <div key={item.id} className="codex-card p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[0.6rem] font-bold text-blue-400 uppercase border border-blue-500/20">
                      {item.metadata?.language || 'en'}
                    </span>
                    <span className="text-[0.65rem] text-muted font-medium truncate max-w-[200px]">
                      {item.metadata?.source_file || 'Source inconnue'}
                    </span>
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted line-clamp-3">{item.content}</p>
                </div>
              )
            )) : (
              <div className="text-center py-20">
                <p className="text-muted">Aucune donnée trouvée dans cette section.</p>
              </div>
            )}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ paddingBottom: '40px' }}>
            {results.map((entry) => (
              <div key={entry.id} className="codex-card">
                <div className="flex justify-between items-start mb-4">
                  <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    {getIcon(entry.entity_type)}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                    {entry.entity_type}
                  </span>
                </div>
                
                <h3 className="font-bold mb-2" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
                  {entry.title}
                </h3>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {entry.content}
                </p>
                
                <button className="sidebar-btn" style={{ marginTop: '1.5rem', background: 'var(--bg-sidebar)', justifyContent: 'space-between' }}>
                  <span>Détails</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>Aucun résultat trouvé pour "{query}"</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full" style={{ opacity: 0.1, pointerEvents: 'none' }}>
            <Book size={80} />
            <p className="text-4xl font-black tracking-tighter mt-4">LE GRIMOIRE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodexView;
