import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { 
  Book, Search, Sparkles, Ghost, ChevronRight, 
  AlertCircle, X, ArrowLeft
} from 'lucide-react';

interface LoreEntry {
  id: string;
  title: string;
  content: string;
  entity_type: string;
  metadata: any;
}

type ViewMode = 'home' | 'library' | 'search' | 'browse';

const CodexView: React.FC = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceFiles, setSourceFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [browseTab, setBrowseTab] = useState<'lore' | 'alliance'>('lore');
  const [rawItems, setRawItems] = useState<any[]>([]);

  // Fetch source files on mount
  useEffect(() => {
    if (viewMode === 'library') {
      fetchSourceFiles();
    }
  }, [viewMode]);

  // Real-time search with debounce
  useEffect(() => {
    if (viewMode === 'search') {
      const timer = setTimeout(() => {
        if (query.trim().length >= 2) {
          handleSearch();
        } else if (query.trim().length === 0) {
          setResults([]);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [query, activeFilter, viewMode]);

  const fetchSourceFiles = async () => {
    try {
      setLoading(true);
      const files = await invoke<string[]>('list_source_files');
      setSourceFiles(files);
    } catch (err) {
      console.error('Failed to list source files:', err);
      setError("Le bibliothécaire est introuvable.");
    } finally {
      setLoading(false);
    }
  };

  const readSourceFile = async (filename: string) => {
    try {
      setLoading(true);
      const content = await invoke<string>('read_source_file', { filename });
      setFileContent(content);
      setSelectedFile(filename);
    } catch (err) {
      setError(`Impossible de lire le manuscrit : ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await invoke<LoreEntry[]>('search_lore', { 
        query, 
        filterType: activeFilter 
      });
      setResults(res);
    } catch (err) {
      setError(`L'invocation a échoué : ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'spell': return <Sparkles size={20} />;
      case 'creature': return <Ghost size={20} />;
      default: return <Book size={20} />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-parchment-light">
      {/* Navigation Header */}
      <div className="flex justify-between items-center px-12 py-6 border-b border-outline-variant bg-bg-sidebar/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setViewMode('home')}>
          <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary group-hover:text-white transition-all">
            <Book className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-header text-text-main tracking-tight">{t('codex.title')}</h1>
        </div>
        
        {viewMode !== 'home' && (
          <div className="flex gap-2">
            <div 
              onClick={() => setViewMode('search')}
              className={`codex-nav-item ${viewMode === 'search' ? 'active' : ''}`}
            >
              {t('codex.nav.archiviste')}
            </div>
            <div 
              onClick={() => setViewMode('library')}
              className={`codex-nav-item ${viewMode === 'library' ? 'active' : ''}`}
            >
              {t('codex.nav.library')}
            </div>
            <div 
              onClick={() => setViewMode('browse')}
              className={`codex-nav-item ${viewMode === 'browse' ? 'active' : ''}`}
            >
              {t('codex.nav.exploration')}
            </div>
          </div>
        )}

        <div className="w-32 flex justify-end">
          {viewMode !== 'home' && (
            <button 
              onClick={() => setViewMode('home')}
              className="flex items-center gap-2 text-[0.6rem] font-label uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
            >
              <ArrowLeft size={12} /> RETOUR PORTAIL
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
        {loading && !selectedFile && !results.length && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="font-label text-xs uppercase tracking-widest text-text-muted animate-pulse">Consultation des archives...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 px-6 bg-danger/5 border border-danger/20 rounded-2xl mb-8 max-w-2xl mx-auto">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h3 className="text-xl font-header text-danger mb-2">Savoir Interdit ou Erreur</h3>
            <p className="text-text-muted text-sm">{error}</p>
          </div>
        )}

        {viewMode === 'home' && (
          <div className="flex flex-col items-center justify-center h-full max-w-5xl mx-auto py-12">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-header mb-4 text-text-main">{t('codex.portal.archives')}</h2>
              <div className="h-px w-24 bg-accent mx-auto mb-6" />
              <p className="text-text-muted font-body italic text-lg">"Scientia est potentia, sed sapientia est libertas."</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
              {/* Bibliothèque Tile */}
              <div 
                onClick={() => setViewMode('library')}
                className="codex-portal-tile group"
              >
                <div className="w-20 h-20 mb-8 rounded-full bg-accent/5 flex items-center justify-center border border-accent/20 group-hover:scale-110 transition-transform">
                  <Book className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-header mb-4 text-text-main">{t('codex.portal.library.title')}</h2>
                <p className="text-text-muted font-body text-sm leading-relaxed opacity-80">
                  {t('codex.portal.library.desc')}
                </p>
                <div className="mt-8 px-6 py-2 border border-primary/20 rounded font-label text-[0.6rem] uppercase tracking-widest text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  {t('codex.portal.library.action')}
                </div>
              </div>

              {/* Archiviste Tile */}
              <div 
                onClick={() => setViewMode('search')}
                className="codex-portal-tile group"
              >
                <div className="w-20 h-20 mb-8 rounded-full bg-accent/5 flex items-center justify-center border border-accent/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-header mb-4 text-text-main">{t('codex.portal.archiviste.title')}</h2>
                <p className="text-text-muted font-body text-sm leading-relaxed opacity-80">
                  {t('codex.portal.archiviste.desc')}
                </p>
                <div className="mt-8 px-6 py-2 border border-primary/20 rounded font-label text-[0.6rem] uppercase tracking-widest text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  {t('codex.portal.archiviste.action')}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'library' && (
          selectedFile ? (
            <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="flex items-center gap-2 text-primary hover:text-primary-container font-header text-lg transition-colors"
                >
                  <ArrowLeft size={20} /> Retour aux Manuscrits
                </button>
                <div className="text-[0.6rem] font-label uppercase tracking-[0.2em] text-text-muted border-l border-accent/30 pl-4">
                  Archive: {selectedFile}
                </div>
              </div>
              <div className="reading-sheet">
                <h2 className="text-5xl font-header mb-12 text-primary border-b border-accent/10 pb-8 text-center">{selectedFile.replace('.md', '')}</h2>
                <div className="font-body text-lg text-text-main leading-relaxed selection:bg-primary/10 whitespace-pre-wrap">
                  {fileContent}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl font-header text-text-main mb-2">Manuscrits Reviewed</h2>
                <p className="text-text-muted font-body italic">Documents officiels et règles fondamentales.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sourceFiles.map((file) => (
                  <div 
                    key={file} 
                    onClick={() => readSourceFile(file)}
                    className="library-item group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-bg-sidebar flex items-center justify-center text-primary border border-outline-variant group-hover:bg-primary group-hover:text-white transition-all">
                        <Book size={20} />
                      </div>
                      <div>
                        <h3 className="font-header text-lg group-hover:text-primary transition-colors">{file.replace('.md', '')}</h3>
                        <p className="text-[0.6rem] text-text-muted uppercase tracking-widest font-label mt-1">Savoir Fondamental</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-outline group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {viewMode === 'search' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-10 mb-16 items-center">
              <div className="text-center">
                <h2 className="text-4xl font-header text-text-main mb-4">{t('codex.portal.archiviste.title')}</h2>
                <p className="text-text-muted font-body italic">"Que cherchez-vous dans les replis du temps ?"</p>
              </div>

              <div className="w-full relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-primary/40 w-6 h-6" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('codex.search.placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex gap-6">
                {[
                  { id: 'rule', label: 'Règles', icon: <Book size={16} /> },
                  { id: 'spell', label: 'Sorts', icon: <Sparkles size={16} /> },
                  { id: 'creature', label: 'Bestiaire', icon: <Ghost size={16} /> },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                    className={`flex items-center gap-3 px-6 py-2 rounded-full border transition-all font-label text-xs uppercase tracking-widest ${activeFilter === f.id ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-outline-variant text-text-muted hover:border-primary/40'}`}
                  >
                    {f.icon}
                    <span>{f.label}</span>
                    {activeFilter === f.id && <X size={12} className="ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              {results.length > 0 ? (
                results.map((entry) => (
                  <div key={entry.id} className="codex-card group bg-white shadow-sm border-outline-variant">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded bg-primary/5 text-primary border border-primary/10">
                          {getIcon(entry.entity_type)}
                        </div>
                        <span className="text-[0.6rem] font-label uppercase tracking-[0.2em] text-accent font-bold">
                          {entry.entity_type}
                        </span>
                      </div>
                      <span className="text-[0.6rem] font-label uppercase tracking-widest text-text-muted/40 italic">
                        {entry.metadata?.source_file || 'Inconnu'}
                      </span>
                    </div>
                    <h3 className="text-3xl font-header mb-6 text-text-main group-hover:text-primary transition-colors leading-tight">
                      {entry.title}
                    </h3>
                    <div className="text-text-muted text-lg leading-relaxed font-body border-l-2 border-accent/10 pl-8 ml-2">
                      {entry.content}
                    </div>
                  </div>
                ))
              ) : query && !loading ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-outline-variant">
                  <Ghost className="w-12 h-12 mx-auto mb-4 text-outline/30" />
                  <p className="text-xl font-header text-text-muted">{t('codex.search.empty')}</p>
                  <p className="font-body text-sm text-text-muted/60 italic mt-2">Peut-être le savoir a-t-il été perdu avec l'Alliance de Val-Negra ?</p>
                </div>
              ) : (
                <div className="text-center py-20 opacity-[0.03] select-none">
                  <Book size={120} className="mx-auto" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodexView;
