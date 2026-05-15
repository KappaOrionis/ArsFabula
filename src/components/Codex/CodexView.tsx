import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { 
  Book, Search, Sparkles, Ghost, ChevronRight, 
  AlertCircle, X, ArrowLeft, Wand2, FlaskConical, ScrollText,
  Hourglass
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const [selectedEditions, setSelectedEditions] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [browseTab, setBrowseTab] = useState<'lore' | 'alliance'>('lore');
  const [rawItems, setRawItems] = useState<any[]>([]);

  const getEdition = (filename: string) => {
    if (filename.includes('Definitive Edition')) return 'Definitive';
    if (filename.includes('5e')) return '5e';
    if (filename.includes('4e')) return '4e';
    if (filename.includes('3e')) return '3e';
    return 'Autre';
  };

  const editionOrder: Record<string, number> = {
    'Definitive': 4,
    '5e': 3,
    '4e': 2,
    '3e': 1,
    'Autre': 0
  };

  const filteredAndSortedFiles = sourceFiles
    .filter(file => selectedEditions.length === 0 || selectedEditions.includes(getEdition(file)))
    .sort((a, b) => {
      const orderA = editionOrder[getEdition(a)] || 0;
      const orderB = editionOrder[getEdition(b)] || 0;
      if (orderA !== orderB) return orderB - orderA;
      return a.localeCompare(b);
    });

  const editions = ['Definitive', '5e', '4e', '3e'];

  const toggleEdition = (edition: string) => {
    setSelectedEditions(prev => 
      prev.includes(edition) 
        ? prev.filter(e => e !== edition) 
        : [...prev, edition]
    );
  };

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
      {/* Navigation Header - Cartouche Style */}
      <div className="sticky top-0 z-50 p-6 pointer-events-none">
        <div className="bg-bg-sidebar/90 backdrop-blur-md p-6 rounded-2xl border border-accent/20 shadow-xl flex justify-between items-center pointer-events-auto w-full">
          <div className="flex items-center gap-6 cursor-pointer group" onClick={() => setViewMode('home')}>
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all border border-primary/20 shadow-inner">
              <Book className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-header text-text-main tracking-tight leading-none mb-1">
                {t('codex.title')}
              </h1>
              <p className="text-[0.6rem] font-label text-accent uppercase tracking-[0.3em] font-bold opacity-70">
                {t('codex.header.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {viewMode !== 'home' && (
              <>
                <div className="flex bg-bg-main/50 p-1 rounded-full border border-outline-variant/30">
                  <button 
                    onClick={() => setViewMode('library')}
                    className={`px-6 py-2 rounded-full font-label text-[10px] uppercase tracking-widest transition-all ${viewMode === 'library' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
                  >
                    {t('codex.nav.library')}
                  </button>
                  <button 
                    onClick={() => setViewMode('search')}
                    className={`px-6 py-2 rounded-full font-label text-[10px] uppercase tracking-widest transition-all ${viewMode === 'search' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
                  >
                    {t('codex.nav.archiviste')}
                  </button>
                </div>
                <div className="h-8 w-px bg-outline-variant/20 mx-2" />
                <button 
                  onClick={() => setViewMode('home')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 text-[0.6rem] font-label uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <ArrowLeft size={12} /> {t('common.back_portal')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6">
            <div className="relative">
              <Hourglass size={48} className="text-primary animate-[spin_3s_linear_infinite]" />
              <div className="absolute inset-0 border-4 border-accent/20 rounded-full scale-150 animate-pulse"></div>
            </div>
            <div className="text-center">
              <p className="font-header text-2xl text-primary mb-2 italic">Déchiffrement du manuscrit...</p>
              <p className="font-label text-[0.6rem] uppercase tracking-[0.3em] text-text-muted animate-pulse">
                Consultation des archives de l'Ordre
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 px-6 bg-danger/5 border border-danger/20 rounded-2xl mb-8 max-w-4xl mx-auto">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h3 className="text-xl font-header text-danger mb-2">Savoir Interdit ou Erreur</h3>
            <p className="text-text-muted text-sm">{error}</p>
          </div>
        )}

        {viewMode === 'home' && (
          <div className="flex flex-col items-center justify-center h-full max-w-6xl mx-auto py-24 px-12">
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
            <div className="flex flex-col gap-8 w-full mx-auto pb-20">
              <div className="sticky top-0 z-30 bg-bg-main py-6 px-12 flex justify-between items-center border-b border-accent/20 shadow-md">
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="flex items-center gap-3 text-primary hover:text-accent transition-colors font-header text-xl border border-primary/20 px-6 py-2 rounded bg-bg-main shadow-sm"
                >
                  <ArrowLeft size={22} /> {t('common.back_archives')}
                </button>
                <div className="flex flex-col items-end">
                  <div className="text-[0.65rem] font-label uppercase tracking-[0.3em] text-text-muted mb-1">{t('codex.label.archive_royal')}</div>
                  <div className="text-sm font-header text-accent border-l-2 border-accent/40 pl-4 py-1">
                    {selectedFile.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="px-12">
                <div className="reading-sheet">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-4xl font-header text-primary mb-8 border-b-2 border-accent/20 pb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-header text-accent mt-12 mb-6 flex items-center gap-4" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-header text-text-main mt-8 mb-4 border-l-4 border-primary/30 pl-4" {...props} />,
                    p: ({node, ...props}) => {
                      const isFirstPara = node?.position?.start.line === 1;
                      return <p className={`mb-6 leading-relaxed text-lg ${isFirstPara ? 'manuscript-dropcap' : ''}`} {...props} />;
                    },
                    li: ({node, ...props}) => <li className="mb-3 pl-6 relative before:content-['◈'] before:absolute before:left-0 before:text-accent font-body" {...props} />,
                    hr: () => (
                      <div className="alchemical-divider">
                        <FlaskConical size={24} />
                      </div>
                    ),
                    table: ({node, ...props}) => (
                      <div className="my-10 overflow-x-auto custom-scrollbar">
                        <table className="manuscript-table" {...props} />
                      </div>
                    ),
                    code: ({node, ...props}) => (
                      <code className="bg-primary/5 px-2 py-0.5 rounded text-primary font-mono text-sm" {...props} />
                    )
                  }}
                >
                  {fileContent}
                </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto p-12">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                <div>
                  <h2 className="text-3xl font-header text-text-main mb-2">{t('codex.label.manuscripts_title')}</h2>
                  <p className="text-text-muted font-body italic">{t('codex.label.manuscripts_desc')}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {editions.map(ed => (
                    <button
                      key={ed}
                      onClick={() => toggleEdition(ed)}
                      className={`px-4 py-1.5 rounded-full border text-[0.65rem] font-label uppercase tracking-widest transition-all ${
                        selectedEditions.includes(ed)
                          ? 'bg-primary border-primary text-white shadow-md'
                          : 'bg-white border-outline-variant text-text-muted hover:border-primary/40'
                      }`}
                    >
                      {ed}
                    </button>
                  ))}
                  {selectedEditions.length > 0 && (
                    <button 
                      onClick={() => setSelectedEditions([])}
                      className="ml-2 text-[0.6rem] font-label text-accent uppercase tracking-widest hover:underline"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAndSortedFiles.map((file) => (
                  <div 
                    key={file} 
                    onClick={() => readSourceFile(file)}
                    className="library-item group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-bg-sidebar flex items-center justify-center text-primary border border-outline-variant group-hover:bg-primary group-hover:text-white transition-all">
                        <Book size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[0.55rem] font-label px-2 py-0.5 rounded border ${
                            getEdition(file) === 'Definitive' ? 'bg-primary/10 border-primary/30 text-primary' :
                            'bg-accent/5 border-accent/20 text-accent'
                          }`}>
                            {getEdition(file)}
                          </span>
                        </div>
                        <h3 className="font-header text-lg group-hover:text-primary transition-colors truncate">
                          {file.replace('.md', '').split(' - ').pop()}
                        </h3>
                        <p className="text-[0.6rem] text-text-muted uppercase tracking-widest font-label mt-1">{t('codex.label.fundamental_knowledge')}</p>
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
          <div className="max-w-6xl mx-auto p-12">
            <div className="flex flex-col gap-10 mb-16 items-center">
              <div className="text-center">
                <h2 className="text-4xl font-header text-text-main mb-4">{t('codex.portal.archiviste.title')}</h2>
                <p className="text-text-muted font-body italic">{t('codex.search.quote')}</p>
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
                  <p className="font-body text-sm text-text-muted/60 italic mt-2">{t('codex.search.empty_hint')}</p>
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
