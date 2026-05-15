import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Map as MapIcon
} from 'lucide-react';
import mapImage from '../../assets/mythic_europe_map.png';

const MapView: React.FC = () => {
  const { t } = useTranslation();

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
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
      </div>
    </div>
  );
};

export default MapView;
