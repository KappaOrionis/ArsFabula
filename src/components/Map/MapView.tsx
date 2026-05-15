import React, { useState } from 'react';
import { Map as MapIcon, Info, MapPin } from 'lucide-react';
import mapImage from '../../assets/mythic_europe_map.png';

const covenants = [
  { id: 1, name: "Doissetep", tribunal: "Provençal", x: 42, y: 58, description: "La plus puissante alliance du Tribunal Provençal, située dans les Pyrénées." },
  { id: 2, name: "Durenmar", tribunal: "Rhine", x: 55, y: 45, description: "Le cœur de l'Ordre d'Hermès, situé dans la Forêt Noire." },
  { id: 3, name: "Cœur de Chêne", tribunal: "Normandy", x: 45, y: 42, description: "Une alliance influente dans les forêts du nord de la France." },
  { id: 4, name: "Fénix", tribunal: "Iberia", x: 35, y: 65, description: "Une alliance ancienne nichée dans les montagnes espagnoles." },
];

const MapView: React.FC = () => {
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Map Area */}
      <div className="flex-1 relative bg-slate-950 p-6 overflow-hidden">
        <div className="h-full w-full rounded-3xl border border-slate-800 overflow-hidden relative group">
          {/* Legend Overlay */}
          <div className="absolute top-6 left-6 z-10 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <h2 className="text-xl font-black tracking-tight mb-1 flex items-center gap-2">
              <MapIcon size={20} className="text-blue-400" />
              EUROPE MYTHIQUE
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">An 1220 après l'Incarnation</p>
          </div>

          {/* Map Image Placeholder */}
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
             <img 
               src={mapImage} 
               alt="Mythic Europe Map"
               className="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-transform duration-[20s] ease-linear"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
          </div>

          {/* Map Pins */}
          {covenants.map((cov) => (
            <div 
              key={cov.id}
              className="absolute cursor-pointer transition-transform hover:scale-125"
              style={{ left: `${cov.x}%`, top: `${cov.y}%` }}
              onClick={() => setSelected(cov)}
            >
              <div className="relative">
                <MapPin size={24} className={selected?.id === cov.id ? 'text-blue-400' : 'text-slate-400'} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Sidebar */}
      <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-2">
           <Info className="text-blue-400" size={24} />
           <h3 className="text-lg font-bold">Alliances Connues</h3>
        </div>

        {selected ? (
          <div className="p-6 bg-slate-800/50 rounded-2xl border border-blue-500/20 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{selected.tribunal}</span>
            <h4 className="text-2xl font-black mt-1 mb-4">{selected.name}</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {selected.description}
            </p>
            <button className="sidebar-btn" style={{ background: 'var(--blue-600)', color: 'white', border: 'none' }}>
              Consulter les archives
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
             <MapPin size={48} className="mb-4" />
             <p className="text-sm">Sélectionnez une alliance sur la carte pour voir ses détails.</p>
          </div>
        )}

        <div className="mt-auto">
          <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Légende</h5>
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-3 text-xs text-slate-500">
               <div className="w-2 h-2 bg-blue-500 rounded-full" />
               <span>Alliance Hermétique</span>
             </div>
             <div className="flex items-center gap-3 text-xs text-slate-500">
               <div className="w-2 h-2 bg-purple-500 rounded-full" />
               <span>Lieu de Pouvoir (Vis)</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
