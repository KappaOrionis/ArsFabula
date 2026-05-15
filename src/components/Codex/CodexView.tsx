import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
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

  const getEdition = (filename: string) => {
    if (filename.includes('Definitive Edition')) return 'Definitive';
    if (filename.includes('5e')) return '5e';
    if (filename.includes('4e')) return '4e';
    if (filename.includes('3e')) return '3e';
    return 'Autre';
  };

  const editions = ['Definitive', '5e', '4e', '3e'];

  const toggleEdition = (edition: string) => {
    setSelectedEditions(prev => 
      prev.includes(edition) 
        ? prev.filter(e => e !== edition) 
        : [...prev, edition]
    );
  };

  useEffect(() => {
    if (viewMode === 'library') {
      fetchSourceFiles();
    }
  }, [viewMode]);

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

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data: LoreEntry[] = await invoke('query_lore', { 
        query,
        entityType: activeFilter
      });
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
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
      console.error('Read failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'rule': return <span className="material-symbols-outlined">menu_book</span>;
      case 'spell': return <span className="material-symbols-outlined">auto_fix</span>;
      case 'creature': return <span className="material-symbols-outlined">skull</span>;
      default: return <span className="material-symbols-outlined">history_edu</span>;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar parchment-texture bg-background">
      <div className="max-w-7xl mx-auto w-full min-h-full">
        {loading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
            <div className="text-center">
              <p className="font-headline-md text-primary mb-2 italic">Déchiffrement du manuscrit...</p>
              <p className="font-label-sm animate-pulse text-on-surface-variant">
                Consultation des archives de l'Ordre
              </p>
            </div>
          </div>
        )}

        {viewMode === 'home' && (
          <div className="flex flex-col items-center justify-center py-24 px-12 space-y-20">
            <header className="text-center">
              <span className="font-label-sm text-secondary tracking-[0.3em] uppercase">Scriptorium Imperialis</span>
              <h2 className="font-display-lg text-on-surface mt-4">{t('codex.portal.archives')}</h2>
              <div className="h-[1px] w-24 bg-primary/20 mx-auto mt-8 mb-6" />
              <p className="font-body-lg italic text-on-surface-variant opacity-70">"Scientia est potentia, sed sapientia est libertas."</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl">
              <div 
                onClick={() => setViewMode('library')}
                className="flex flex-col items-center text-center p-12 bg-surface rounded-3xl border border-outline-variant/30 hover:border-primary/40 hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="w-24 h-24 rounded-full bg-primary-container/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-5xl">library_books</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-4 group-hover:text-primary transition-colors">{t('codex.portal.library.title')}</h3>
                <p className="font-body-md text-on-surface-variant opacity-80 leading-relaxed">
                  {t('codex.portal.library.desc')}
                </p>
                <div className="mt-10 px-8 py-3 bg-surface-container rounded-xl font-label-sm text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  {t('codex.portal.library.action')}
                </div>
              </div>

              <div 
                onClick={() => setViewMode('search')}
                className="flex flex-col items-center text-center p-12 bg-surface rounded-3xl border border-outline-variant/30 hover:border-primary/40 hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="w-24 h-24 rounded-full bg-primary-container/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-5xl">search_sparkle</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-4 group-hover:text-primary transition-colors">{t('codex.portal.archiviste.title')}</h3>
                <p className="font-body-md text-on-surface-variant opacity-80 leading-relaxed">
                  {t('codex.portal.archiviste.desc')}
                </p>
                <div className="mt-10 px-8 py-3 bg-surface-container rounded-xl font-label-sm text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  {t('codex.portal.archiviste.action')}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'library' && (
          selectedFile ? (
            <div className="flex flex-col w-full">
              <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md py-6 px-12 flex justify-between items-center border-b border-outline-variant/30 shadow-sm">
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="flex items-center gap-3 text-primary hover:text-secondary transition-colors font-headline-md !text-xl"
                >
                  <span className="material-symbols-outlined">arrow_back</span> {t('common.back_archives')}
                </button>
                <div className="flex flex-col items-end">
                  <span className="font-label-sm !text-[9px] text-on-surface-variant tracking-widest">{t('codex.label.archive_royal')}</span>
                  <span className="font-headline-md !text-sm text-secondary italic">
                    {selectedFile.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-12 max-w-4xl mx-auto w-full">
                <div className="reading-sheet bg-surface p-12 rounded-xl shadow-sm border border-outline-variant/20">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="font-display-lg text-primary mb-12 border-b border-outline-variant/30 pb-6" {...props} />,
                      h2: ({node, ...props}) => <h2 className="font-headline-lg text-on-surface mt-16 mb-8 border-l-4 border-secondary/30 pl-6" {...props} />,
                      h3: ({node, ...props}) => <h3 className="font-headline-md text-secondary mt-12 mb-6" {...props} />,
                      p: ({node, ...props}) => <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed text-justify" {...props} />,
                      li: ({node, ...props}) => <li className="font-body-md text-on-surface-variant mb-4 pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-secondary" {...props} />,
                      hr: () => <div className="h-px w-full bg-outline-variant/20 my-16" />,
                      table: ({node, ...props}) => (
                        <div className="my-12 overflow-x-auto border border-outline-variant/30 rounded-xl">
                          <table className="w-full text-left border-collapse" {...props} />
                        </div>
                      ),
                      th: ({node, ...props}) => <th className="bg-surface-container p-4 font-label-sm border-b border-outline-variant/30" {...props} />,
                      td: ({node, ...props}) => <td className="p-4 font-body-md border-b border-outline-variant/10" {...props} />
                    }}
                  >
                    {fileContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 space-y-12">
              <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-outline-variant/20 pb-12">
                <div>
                  <span className="font-label-sm text-secondary tracking-widest uppercase">Bibliothèque de l'Ordre</span>
                  <h2 className="font-headline-lg text-on-surface mt-2">{t('codex.label.manuscripts_title')}</h2>
                  <p className="font-body-md text-on-surface-variant mt-2 italic">{t('codex.label.manuscripts_desc')}</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {editions.map(ed => (
                    <button
                      key={ed}
                      onClick={() => toggleEdition(ed)}
                      className={`px-6 py-2 rounded-full border font-label-sm !text-[10px] tracking-widest transition-all ${
                        selectedEditions.includes(ed)
                          ? 'bg-primary text-white border-primary shadow-lg'
                          : 'bg-surface text-on-surface-variant border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      {ed}
                    </button>
                  ))}
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sourceFiles
                  .filter(file => selectedEditions.length === 0 || selectedEditions.includes(getEdition(file)))
                  .map((file) => (
                  <div 
                    key={file} 
                    onClick={() => readSourceFile(file)}
                    className="bg-surface p-6 rounded-2xl border border-outline-variant/30 hover:border-primary/40 hover:shadow-xl transition-all group cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-label-sm !text-[8px] px-2 py-0.5 rounded border border-outline-variant/30 text-secondary uppercase tracking-widest">
                          {getEdition(file)}
                        </span>
                        <h3 className="font-headline-md !text-lg mt-1 group-hover:text-primary transition-colors truncate">
                          {file.replace('.md', '').split(' - ').pop()}
                        </h3>
                        <p className="font-label-sm !text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">Savoir Fondamental</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant group-hover:text-primary group-hover:translate-x-2 transition-all">arrow_forward</span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {viewMode === 'search' && (
          <div className="p-12 space-y-16">
            <header className="text-center space-y-6">
              <h2 className="font-headline-lg text-on-surface">{t('codex.portal.archiviste.title')}</h2>
              <div className="max-w-2xl mx-auto relative group">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity">search</span>
                <input
                  type="text"
                  className="input-ruled !text-3xl !py-8 !pl-16 !bg-transparent !border-b-2"
                  placeholder={t('codex.search.placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex justify-center gap-4">
                {[
                  { id: 'rule', label: 'Règles', icon: 'menu_book' },
                  { id: 'spell', label: 'Sorts', icon: 'auto_fix' },
                  { id: 'creature', label: 'Bestiaire', icon: 'skull' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                    className={`flex items-center gap-3 px-8 py-3 rounded-xl border font-label-sm transition-all ${activeFilter === f.id ? 'bg-primary text-white border-primary shadow-lg' : 'bg-surface text-on-surface-variant border-outline-variant hover:border-primary/40'}`}
                  >
                    <span className="material-symbols-outlined text-sm">{f.icon}</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </header>

            <div className="max-w-4xl mx-auto space-y-10">
              {results.length > 0 ? (
                results.map((entry) => (
                  <div key={entry.id} className="bg-surface p-10 rounded-3xl border border-outline-variant/30 shadow-sm hover:shadow-xl transition-all group relative alchemical-border manuscript-border">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
                          {getIcon(entry.entity_type)}
                        </div>
                        <span className="font-label-sm text-secondary tracking-widest uppercase">
                          {entry.entity_type}
                        </span>
                      </div>
                      <span className="font-label-sm !text-[9px] text-on-surface-variant opacity-40 italic">
                        {entry.metadata?.source_file || 'Inconnu'}
                      </span>
                    </div>
                    <h3 className="font-headline-lg text-3xl mb-6 text-on-surface group-hover:text-primary transition-colors leading-tight">
                      {entry.title}
                    </h3>
                    <div className="font-body-lg text-on-surface-variant leading-relaxed border-l-2 border-outline-variant/20 pl-8 ml-4">
                      {entry.content}
                    </div>
                  </div>
                ))
              ) : query && !loading ? (
                <div className="text-center py-24 bg-surface-container/20 rounded-[3rem] border border-dashed border-outline-variant/30">
                  <span className="material-symbols-outlined text-6xl text-outline-variant opacity-30 mb-6">search_off</span>
                  <p className="font-headline-md text-on-surface-variant">{t('codex.search.empty')}</p>
                  <p className="font-body-md text-on-surface-variant opacity-50 mt-2 italic">{t('codex.search.empty_hint')}</p>
                </div>
              ) : (
                <div className="text-center py-32 opacity-[0.03] select-none">
                  <span className="material-symbols-outlined text-[160px]">auto_stories</span>
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
