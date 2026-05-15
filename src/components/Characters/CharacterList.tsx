import React, { useState, useEffect } from 'react';
import { User, UserPlus, Shield, Zap, Skull, Plus } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface Character {
  id: string;
  name: string;
  character_type: 'magus' | 'companion' | 'grog';
  house?: string;
  warp_score: number;
  birth_year?: number;
  death_year?: number | null;
  source_book?: string | null;
  page_reference?: string | null;
  visual_path?: string | null;
}

const CharacterList: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCharacters = async () => {
    try {
      const data: Character[] = await invoke('list_characters');
      setCharacters(data);
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'magus': return <Zap className="text-purple-400" size={20} />;
      case 'companion': return <Shield className="text-blue-400" size={20} />;
      case 'grog': return <Skull className="text-slate-400" size={20} />;
      default: return <User size={20} />;
    }
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
          Membres de l'Alliance
        </h1>
        <button className="sidebar-btn active" style={{ width: 'auto' }}>
          <UserPlus size={18} />
          <span>Nouveau Personnage</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--blue-500)', borderRadius: '50%' }}></div>
          </div>
        ) : characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => (
              <div key={char.id} className="codex-card group cursor-pointer">
                <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} className="w-16 h-16 flex items-center justify-center overflow-hidden relative shadow-md">
                      {char.visual_path ? (
                        <img src={char.visual_path} alt={char.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        getTypeIcon(char.character_type)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{char.name}</h3>
                      <p className="text-xs uppercase tracking-widest text-slate-500 mt-0.5">
                        {char.character_type} {char.birth_year ? `• ${char.birth_year} - ${char.death_year || 'Présent'}` : ''}
                      </p>
                    </div>
                  </div>
                  {char.source_book && (
                    <div className="text-right">
                      <span className="text-[10px] bg-slate-800/50 px-2 py-1 rounded text-slate-400 border border-slate-700/50 block">
                        {char.source_book} {char.page_reference ? `(${char.page_reference})` : ''}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 mt-6 pt-4 border-t border-slate-800">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-slate-500 uppercase">Warping</p>
                    <p className="font-bold text-slate-300">{char.warp_score}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-slate-500 uppercase">Maison</p>
                    <p className="font-bold text-slate-300">{char.house || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add card */}
            <div className="codex-card flex flex-col items-center justify-center border-dashed border-slate-700 bg-transparent hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group cursor-pointer py-10">
              <div className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center mb-4 group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                <Plus size={24} />
              </div>
              <p className="text-slate-500 font-medium group-hover:text-blue-400 transition-colors">Ajouter un membre</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
            <User size={64} className="text-slate-700 mb-4" />
            <p className="text-slate-500 text-lg">Votre alliance est encore déserte...</p>
            <button className="mt-6 sidebar-btn active" style={{ width: 'auto' }}>
              Créer le premier membre
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterList;
