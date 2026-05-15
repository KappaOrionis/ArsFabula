import React from 'react';
import { useTranslation } from 'react-i18next';
import mapImage from '../../assets/mythic_europe_map.png';

const MapView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar parchment-texture bg-background">
      <header className="sticky top-0 z-50 p-6 pointer-events-none mb-4">
        <div className="bg-surface-container/90 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/30 shadow-xl inline-block pointer-events-auto">
          <div>
            <h2 className="font-headline-lg text-on-surface flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-4xl">map</span>
              {t('map.title')}
            </h2>
            <p className="font-label-sm text-secondary tracking-[0.2em] mt-1">
              {t('map.subtitle')} — AN 1220
            </p>
            <p className="font-body-md text-on-surface-variant opacity-70 mt-4 max-w-2xl italic leading-relaxed border-l border-primary/30 pl-4">
              {t('map.purpose')}
            </p>
          </div>
        </div>
      </header>

      {/* Map Section */}
      <div className="relative w-full bg-[#0a0a08] shadow-inner overflow-hidden border-y border-outline-variant/30">
        <img 
          src={mapImage} 
          alt="Mythic Europe Map"
          className="w-full h-auto opacity-80 transition-opacity duration-1000"
        />
        
        {/* Vignette & Texture Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-0 opacity-10 pointer-events-none parchment-texture" />
        
        {/* Decorative Compass or Seal could go here */}
        <div className="absolute bottom-12 right-12 opacity-40">
           <span className="material-symbols-outlined text-[120px] text-secondary rotate-12">explore</span>
        </div>
      </div>

      {/* Map Legend or Info could go here */}
      <div className="p-12 max-w-6xl mx-auto space-y-12">
        <div className="h-px w-full bg-outline-variant/20" />
        <div className="grid md:grid-cols-3 gap-12">
           <div className="space-y-4">
              <span className="font-label-sm text-primary uppercase">Territoires</span>
              <h4 className="font-headline-md text-on-surface">Les Tribunaux</h4>
              <p className="font-body-md text-on-surface-variant opacity-70">
                L'Ordre d'Hermès est divisé en douze juridictions géographiques, chacune avec sa propre culture et ses propres défis politiques.
              </p>
           </div>
           <div className="space-y-4">
              <span className="font-label-sm text-secondary uppercase">Frontières</span>
              <h4 className="font-headline-md text-on-surface">Le Mundane</h4>
              <p className="font-body-md text-on-surface-variant opacity-70">
                Entre les Alliances s'étend le monde des mortels, une mosaïque de royaumes féodaux et de cités en pleine expansion.
              </p>
           </div>
           <div className="space-y-4">
              <span className="font-label-sm text-on-surface-variant uppercase">Mystères</span>
              <h4 className="font-headline-md text-on-surface">Les Aurae</h4>
              <p className="font-body-md text-on-surface-variant opacity-70">
                Cherchez les lieux de pouvoir où le voile est mince, là où la magie coule librement des sources de Vis.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
