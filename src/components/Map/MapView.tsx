import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Map as MapIcon, Search, ScrollText, 
  Sparkles, ChevronRight, Info, BookOpen
} from 'lucide-react';
import mapImage from '../../assets/mythic_europe_map.png';

interface Covenant {
  id: string;
  name: string;
  tribunal: string;
  x: number; 
  y: number; 
  description: string;
  domusMagna?: string;
  type?: 'covenant' | 'aura' | 'ruin';
}

const COVENANTS: Covenant[] = [
  // Rhine
  { id: 'durenmar', name: "Durenmar", tribunal: "Rhine", x: 54.5, y: 46.2, description: "Le cœur de l'Ordre d'Hermès. Fondée par Bonisagus, abrite la Grande Bibliothèque.", domusMagna: "Bonisagus" },
  { id: 'fengheld', name: "Fengheld", tribunal: "Rhine", x: 57.2, y: 43.1, description: "Alliance puissante et politique, rivale historique de Durenmar." },
  { id: 'irencilia', name: "Irencilia", tribunal: "Rhine", x: 58.8, y: 48.5, description: "Centre de la culture Merinita et des mystères de la féérie." },
  { id: 'cratera', name: "Cratera", tribunal: "Rhine", x: 52.1, y: 44.8, description: "Bastion de la Maison Tytalus dans le tribunal du Rhin." },

  // Stonehenge
  { id: 'blackthorn', name: "Blackthorn", tribunal: "Stonehenge", x: 41.2, y: 38.5, description: "Bastion de la maison Tremere en Angleterre." },
  { id: 'cad_gadu', name: "Cad Gadu", tribunal: "Stonehenge", x: 38.5, y: 36.2, description: "Siège spirituel de la Maison Ex Miscellanea." },
  { id: 'voluntas', name: "Voluntas", tribunal: "Stonehenge", x: 42.8, y: 40.1, description: "Alliance Jerbiton influente dans le sud de l'Angleterre." },
  { id: 'ungulus', name: "Ungulus", tribunal: "Stonehenge", x: 40.1, y: 34.5, description: "Ancienne alliance isolée dans le nord." },

  // Normandy
  { id: 'coeur_de_chene', name: "Cœur de Chêne", tribunal: "Normandy", x: 46.2, y: 46.5, description: "Alliance influente gérant les relations avec la noblesse." },
  { id: 'fudarus', name: "Fudarus", tribunal: "Normandy", x: 44.1, y: 48.2, description: "Centre de la Maison Tytalus.", domusMagna: "Tytalus" },
  { id: 'mont_saint_michel', name: "Mont-Saint-Michel", tribunal: "Normandy", x: 43.2, y: 50.8, description: "Alliance Jerbiton située dans l'abbaye célèbre." },

  // Roman
  { id: 'harco', name: "Harco", tribunal: "Rome", x: 53.5, y: 69.2, description: "Centre névralgique de la Maison Mercere.", domusMagna: "Mercere" },
  { id: 'magvillus', name: "Magvillus", tribunal: "Rome", x: 55.2, y: 72.1, description: "Siège de la Maison Guernicus.", domusMagna: "Guernicus" },
  { id: 'verdeir', name: "Verdeir", tribunal: "Rome", x: 57.5, y: 74.8, description: "La forge de la Maison Verditius.", domusMagna: "Verditius" },
  { id: 'metron', name: "Metron", tribunal: "Rome", x: 51.2, y: 71.5, description: "Alliance érudite proche de Rome." },

  // Greater Alps
  { id: 'cave_shadows', name: "Cave of Shadows", tribunal: "Greater Alps", x: 54.1, y: 60.2, description: "Centre de la Maison Criamon.", domusMagna: "Criamon" },
  { id: 'val_negra', name: "Val-Negra", tribunal: "Greater Alps", x: 52.5, y: 62.1, description: "Ancienne citadelle Flambeau.", domusMagna: "Flambeau" },

  // Transylvania
  { id: 'coeris', name: "Coeris", tribunal: "Transylvania", x: 69.2, y: 56.5, description: "Forteresse de la Maison Tremere.", domusMagna: "Tremere" },

  // Iberia
  { id: 'fenix', name: "Fénix", tribunal: "Iberia", x: 34.5, y: 76.2, description: "Alliance ancienne luttant pour le savoir hermétique." },
  { id: 'barcelona', name: "Barcelona", tribunal: "Iberia", x: 40.2, y: 68.5, description: "Alliance urbaine dynamique." },

  // Provençal
  { id: 'doissetep', name: "Doissetep", tribunal: "Provençal", x: 49.5, y: 63.2, description: "L'une des alliances les plus puissantes de l'Ordre." },
  { id: 'castra_solis', name: "Castra Solis", tribunal: "Provençal", x: 47.8, y: 61.5, description: "Haut lieu de la Maison Flambeau." },

  // The Levant
  { id: 'semita', name: "Semita Errabunda", tribunal: "The Levant", x: 86.2, y: 81.5, description: "Alliance isolée entre l'Occident et l'Orient." },

  // Novgorod
  { id: 'thousand_caves', name: "Thousand Caves", tribunal: "Novgorod", x: 76.5, y: 39.2, description: "Vaste réseau souterrain évitant la surface." },

  // Hibernia
  { id: 'leth_moga', name: "Leth Moga", tribunal: "Hibernia", x: 31.2, y: 34.5, description: "Gardiens des traditions gaéliques." },
  { id: 'ashengarden', name: "Ashengarden", tribunal: "Hibernia", x: 33.5, y: 31.2, description: "Alliance Merinita dans les bois d'Irlande." },

  // Loch Leglean
  { id: 'blackburn', name: "Blackburn", tribunal: "Loch Leglean", x: 38.2, y: 25.5, description: "Alliance de guerriers en Écosse." }
];

const MapView: React.FC = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Covenant | null>(null);

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar bg-parchment-light">
      {/* 1. Header Overlay (Sticky) */}
      <div className="sticky top-0 z-50 p-6 pointer-events-none">
        <div className="bg-bg-sidebar/90 backdrop-blur-md p-6 rounded-2xl border border-accent/20 shadow-xl inline-block pointer-events-auto">
          <h2 className="text-3xl font-header text-text-main tracking-tight flex items-center gap-4">
            <MapIcon size={28} className="text-primary" />
            {t('map.title')}
          </h2>
          <p className="text-[0.6rem] font-label text-accent uppercase tracking-[0.3em] font-bold opacity-70">
            {t('map.subtitle')} — AN 1220
          </p>
        </div>
      </div>

      {/* 2. Map Section - Full Width, Scrollable flow */}
      <div className="relative w-full aspect-square bg-[#0a0a08] border-b-4 border-outline-variant shadow-inner">
        <img 
          src={mapImage} 
          alt="Mythic Europe Map"
          className="w-full h-full object-cover opacity-90"
        />
        
        {/* Interaction Layer */}
        <div className="absolute inset-0 z-10">
          {COVENANTS.map((cov) => (
            <div 
              key={cov.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer"
              style={{ left: `${cov.x}%`, top: `${cov.y}%` }}
              onClick={() => {
                setSelected(cov);
                document.getElementById(`cov-${cov.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              <div className={`map-sigil ${selected?.id === cov.id ? 'active' : ''} ${cov.domusMagna ? 'sigil-pulse' : ''}`}>
                {cov.domusMagna ? <Sparkles size={10} /> : <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              
              {/* Permanent Label (Visible on hover or if selected) */}
              <div className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 transition-all whitespace-nowrap bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-white/10 ${selected?.id === cov.id ? 'opacity-100' : 'opacity-0 group-hover/pin:opacity-100'}`}>
                <p className="text-[10px] font-header text-white leading-none">{cov.name}</p>
                <p className="text-[7px] font-label uppercase text-primary-light/70">{cov.tribunal}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* 3. Information Section - Scrolling below the map */}
      <div className="max-w-6xl mx-auto p-12">
        <div className="flex items-center gap-6 mb-12 border-b border-outline-variant pb-8">
           <ScrollText className="text-primary" size={40} />
           <div>
             <h3 className="text-4xl font-header text-text-main">Archives de l'Ordre</h3>
             <p className="text-text-muted font-body italic">"Catalogue exhaustif des alliances recensées par le Grand Tribunal."</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COVENANTS.map((cov) => (
            <div 
              key={cov.id}
              id={`cov-${cov.id}`}
              className={`p-8 rounded-3xl border transition-all duration-500 cursor-pointer group ${selected?.id === cov.id ? 'bg-white border-primary shadow-2xl scale-[1.02]' : 'bg-bg-sidebar/50 border-outline-variant hover:border-primary/40 hover:bg-white shadow-sm'}`}
              onClick={() => {
                setSelected(cov);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[10px] font-label uppercase tracking-widest px-3 py-1 rounded-full ${selected?.id === cov.id ? 'bg-primary text-white' : 'bg-outline-variant/20 text-text-muted'}`}>
                  {cov.tribunal}
                </span>
                {cov.domusMagna && <Sparkles size={16} className="text-accent" />}
              </div>

              <h4 className={`text-2xl font-header mb-4 transition-colors ${selected?.id === cov.id ? 'text-primary' : 'text-text-main group-hover:text-primary'}`}>
                {cov.name}
              </h4>
              
              <p className="text-text-muted font-body text-sm leading-relaxed mb-6 italic border-l-2 border-accent/20 pl-4">
                {cov.description}
              </p>

              {cov.domusMagna && (
                <div className="mt-4 pt-4 border-t border-outline-variant/10">
                   <p className="text-[10px] font-label uppercase tracking-widest text-accent flex items-center gap-2">
                     <Info size={12} /> Siège de la Maison {cov.domusMagna}
                   </p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[0.6rem] font-label uppercase text-primary flex items-center gap-1">
                  Localiser <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State / Legend Footer */}
        <div className="mt-20 text-center py-12 border-t border-dashed border-outline-variant opacity-40">
          <BookOpen size={48} className="mx-auto mb-4" />
          <p className="font-header text-xl">Fin de l'Index Actuel</p>
          <p className="font-body text-sm italic">D'autres manuscrits pourraient être découverts dans les bibliothèques perdues.</p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
