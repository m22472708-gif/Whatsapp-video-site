import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../types';

interface BannerHeroProps {
  banners: Banner[];
  onSelectBanner: (banner: Banner) => void;
}

export const BannerHero: React.FC<BannerHeroProps> = ({ banners, onSelectBanner }) => {
  // Only use banners that have a valid non-empty imageUrl
  const activeBanners = banners.filter(
    (b) => b.active && typeof b.imageUrl === 'string' && b.imageUrl.trim() !== ''
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex] || activeBanners[0];
  if (!current || !current.imageUrl) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
      {/* Dynamic Ambient Glow Behind Banner (Theater backlight effect) */}
      {current.imageUrl && (
        <div className="absolute inset-x-8 top-6 bottom-4 -z-10 rounded-3xl overflow-hidden opacity-45 dark:opacity-35 blur-3xl transition-all duration-1000 transform scale-102 pointer-events-none">
          <img
            src={current.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div 
        onClick={() => onSelectBanner(current)}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer group bg-slate-950 shadow-2xl border border-slate-200/50 dark:border-slate-800/80 transition-all duration-300"
      >
        {/* Banner Picture Only (no buttons, clean high-impact cinema visual) */}
        <div className="relative h-44 sm:h-72 md:h-96 lg:h-[420px] w-full overflow-hidden bg-slate-950">
          {current.imageUrl && (
            <img
              key={current.id || currentIndex}
              src={current.imageUrl}
              alt={current.title || 'Featured Banner'}
              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out animate-in fade-in duration-500"
              loading="eager"
            />
          )}

          {/* Subtle Cinema Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Navigation Arrows for desktop on hover */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-all duration-200 opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center border border-white/10 active:scale-95 shadow-lg"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-all duration-200 opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center border border-white/10 active:scale-95 shadow-lg"
                aria-label="Next banner"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Minimalist Dynamic Indicator Dots */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === i 
                      ? 'w-6 bg-gradient-to-r from-rose-500 to-amber-400 shadow-sm' 
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
