import React, { useEffect, useRef } from 'react';
import { AppSettings } from '../types';
import { triggerAdsterraPopunder } from './AdsterraEngine';
import { Sparkles, ExternalLink, Play, Zap } from 'lucide-react';

interface AdsterraBannerSlotProps {
  settings: AppSettings;
  slotPosition: 'homepage_banner' | 'video_player_bottom';
  className?: string;
}

export const AdsterraBannerSlot: React.FC<AdsterraBannerSlotProps> = ({
  settings,
  slotPosition,
  className = '',
}) => {
  const isEnabled = settings.adsterraEnabled !== false && settings.adsterraBannerEnabled !== false;
  const customBannerCode = settings.adsterraBannerCode?.trim() || '';
  const directLink = settings.adsterraDirectLinkUrl || settings.unlockAdUrl || settings.telegramChannelUrl || 'https://t.me/streampulse_official';

  const containerRef = useRef<HTMLDivElement>(null);

  // If custom snippet is provided with script tags or iframe, inject it into the slot container
  useEffect(() => {
    if (!isEnabled || !customBannerCode || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(customBannerCode, 'text/html');
      
      // Inject non-script nodes
      Array.from(doc.body.childNodes).forEach((node) => {
        if (node.nodeName !== 'SCRIPT') {
          container.appendChild(node.cloneNode(true));
        }
      });

      // Execute scripts
      const scripts = doc.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.innerHTML = oldScript.innerHTML;
        container.appendChild(newScript);
      });
    } catch (e) {
      console.warn('Adsterra banner render error:', e);
    }
  }, [isEnabled, customBannerCode]);

  if (!isEnabled) {
    return null;
  }

  const handleBannerClick = () => {
    // 1. Trigger Popunder Engine
    triggerAdsterraPopunder();

    // 2. Open Direct Monetization Link in new tab
    if (directLink) {
      window.open(directLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-3 sm:my-5 ${className}`}>
      
      {/* Sponsored Ad Container Card */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 dark:border-amber-500/25 shadow-xl shadow-amber-500/5 transition-all duration-300 hover:border-amber-500/60">
        
        {/* Top Minimalist Ad Header Label */}
        <div className="px-3.5 py-1 bg-black/40 border-b border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-amber-400 tracking-wider">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>ADSTERRA SPONSORED ADVERTISEMENT</span>
          </div>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
            High CPM Direct Partner Stream
          </span>
        </div>

        {/* Custom Ad Code Container OR Fallback Dynamic Adsterra Sponsor Banner */}
        {customBannerCode ? (
          <div 
            ref={containerRef}
            onClick={handleBannerClick}
            className="w-full flex items-center justify-center p-3 sm:p-4 min-h-[90px] cursor-pointer"
          />
        ) : (
          <div
            onClick={handleBannerClick}
            className="cursor-pointer group relative p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-transform duration-200 active:scale-[0.99]"
          >
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Left Sponsor Info */}
            <div className="flex items-center gap-3.5 z-10 text-center sm:text-left">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-6 h-6 fill-white" />
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                    {slotPosition === 'homepage_banner' 
                      ? '🚀 Watch Trending Movies & Series in Ultra HD (1080P/4K)'
                      : '⚡ High-Speed Direct Cloud Streaming Server'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                    Fast CDN
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                  Click here for uninterrupted superfast streaming, cloud downloads & VIP servers.
                </p>
              </div>
            </div>

            {/* Right CTA Button */}
            <div className="z-10 shrink-0 w-full sm:w-auto">
              <div className="w-full sm:w-auto px-5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 group-hover:scale-105 transition-all">
                <span>Play / Download</span>
                <ExternalLink className="w-4 h-4 text-slate-950" />
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
