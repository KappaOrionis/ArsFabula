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
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      {/* Header & Search */}
      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r bg-clip-text text-transparent" 
            style={{ backgroundImage: 'linear-gradient(to right, var(--blue-400), var(--purple-500))' }}>
          Codex Hermeticus
        </h1>
        
        <div className="flex gap-2">
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', top: '50%', left: '1.25rem', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Search size={20} color="var(--text-muted)" />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher un sort, une créature ou une règle..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

        {/* Filters */}
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
      </div>

      {/* Results Grid */}
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
            <p className="text-red-400 font-medium mb-2">Erreur de recherche</p>
            <p className="text-muted text-sm max-w-md mx-auto">{error}</p>
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
