import React, { useState, useEffect } from 'react';
import { 
  Send, 
  X, 
  Sparkles, 
  Zap, 
  Film, 
  ShieldCheck, 
  ArrowRight,
  Check
} from 'lucide-react';
import { AppSettings } from '../types';

interface TelegramPopupProps {
  settings: AppSettings;
}

/**
 * Normalizes user-entered image URLs (Google Drive, Imgur, Dropbox, etc.)
 * into direct embeddable image source URLs.
 */
export function cleanImageUrl(url?: string): string {
  if (!url) return '';
  let cleaned = String(url).trim();
  if (!cleaned) return '';

  // Google Drive: convert view link to direct thumbnail/image stream
  if (cleaned.includes('drive.google.com')) {
    const fileIdMatch = cleaned.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1200`;
    }
    const idParamMatch = cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}&sz=w1200`;
    }
  }

  // Dropbox: convert dl=0 to raw=1
  if (cleaned.includes('dropbox.com')) {
    return cleaned.replace(/[?&]dl=0/, '?raw=1');
  }

  // Imgur page to direct image
  if (cleaned.includes('imgur.com') && !cleaned.includes('i.imgur.com') && !cleaned.endsWith('.jpg') && !cleaned.endsWith('.png') && !cleaned.endsWith('.webp') && !cleaned.endsWith('.gif')) {
    const imgId = cleaned.split('/').filter(Boolean).pop()?.split('.')[0];
    if (imgId) return `https://i.imgur.com/${imgId}.jpg`;
  }

  return cleaned;
}

export const TelegramPopup: React.FC<TelegramPopupProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coverLoadFailed, setCoverLoadFailed] = useState(false);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);

  useEffect(() => {
    // Clear any previous dismiss flags so every refresh shows the popup
    try {
      sessionStorage.removeItem('streampulse_tg_session_dismiss');
      localStorage.removeItem('streampulse_tg_dismissed');
    } catch {}

    // Only skip if explicitly turned off in settings
    if (settings && settings.telegramPopupEnabled === false) return;

    // Show promptly on every refresh/page load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [settings?.telegramPopupEnabled]);

  // Support custom event to open popup on demand
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('streampulse_open_telegram_popup', handleOpen);
    return () => window.removeEventListener('streampulse_open_telegram_popup', handleOpen);
  }, []);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  const handleJoin = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const title = settings?.telegramPopupTitle || 'StreamPulse VIP Channel';
  const description = settings?.telegramPopupDescription || 'Direct HD movie links, newly released web series & zero ads download links!';
  const telegramUrl = settings?.telegramChannelUrl || 'https://t.me/streampulse_official';

  const rawCover = settings?.telegramCoverPicUrl;
  const rawProfile = settings?.telegramProfilePicUrl;

  const coverPic = rawCover ? cleanImageUrl(rawCover) : '';
  const profilePic = rawProfile ? cleanImageUrl(rawProfile) : '';

  const showCover = coverPic && !coverLoadFailed;
  const showProfile = profilePic && !profileLoadFailed;

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-300 cursor-pointer"
    >
      {/* Ultra-Luxury Cinema Glass Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[400px] rounded-[32px] overflow-hidden bg-[#0b1120] text-white border border-sky-500/30 shadow-[0_0_80px_-10px_rgba(14,165,233,0.5)] backdrop-blur-2xl transform animate-in zoom-in-95 duration-250 cursor-default select-none"
      >
        
        {/* Top Cinematic Header Banner with Ambient Glow & Optional Custom Cover Image */}
        <div className={`relative h-28 sm:h-32 p-4 flex flex-col justify-between overflow-hidden ${showCover ? 'bg-slate-950' : 'bg-gradient-to-br from-[#0088cc] via-[#0284c7] to-[#4338ca]'}`}>
          
          {/* Custom Cover Photo from Admin */}
          {showCover && (
            <>
              <img 
                src={coverPic} 
                alt="Channel Cover" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-center z-0" 
                onError={() => {
                  console.warn('Cover image failed to load:', coverPic);
                  setCoverLoadFailed(true);
                }}
              />
              {/* Subtle dark vignette over cover photo so text stays razor sharp */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[#0b1120] z-0" />
            </>
          )}

          {/* Background Ambient Radial Highlights & Film Grain Feel (when no cover) */}
          {!showCover && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)] pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            </>
          )}
          
          {/* Top Row: VIP Badge & Quick Close */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Official VIP Channel</span>
            </div>

            {/* Instant 1-Click Close Button */}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-black/50 hover:bg-black/75 border border-white/20 backdrop-blur-md transition-all duration-150 active:scale-90"
              aria-label="Close popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Glowing bottom line transition */}
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-sky-300/40 to-transparent z-10" />
        </div>

        {/* Floating 3D Telegram Brand Crest / Custom Profile Picture */}
        <div className="relative -mt-9 flex justify-center z-10">
          <div className="relative group">
            {/* Pulsing Outer Glow */}
            <div className="absolute -inset-2 rounded-full bg-sky-400/35 blur-md animate-pulse" />
            
            {/* 3D Circular Crest Container */}
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#006da8] via-[#0088cc] to-[#38bdf8] p-1 shadow-2xl shadow-sky-500/50 flex items-center justify-center border-4 border-[#0b1120]">
              {showProfile ? (
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative flex items-center justify-center">
                  <img 
                    src={profilePic} 
                    alt={title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                    onError={() => {
                      console.warn('Profile image failed to load:', profilePic);
                      setProfileLoadFailed(true);
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0088cc] to-[#005f99] flex items-center justify-center relative overflow-hidden">
                  <svg viewBox="0 0 24 24" className="w-9 h-9 sm:w-10 sm:h-10 fill-white drop-shadow-md translate-x-[-1px]">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Mini Telegram Corner Badge if custom profile image is loaded */}
            {showProfile && (
              <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 rounded-full bg-[#0088cc] flex items-center justify-center text-white border-2 border-[#0b1120] shadow-md z-10" title="Telegram Verified">
                <Send className="w-3 h-3 translate-x-[-0.5px]" />
              </div>
            )}

            {/* Live Online Badge */}
            <div className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black tracking-wider flex items-center gap-1 shadow-lg shadow-emerald-500/40 border-2 border-[#0b1120] z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>LIVE</span>
            </div>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="px-6 pt-3 pb-6 flex flex-col items-center text-center">
          
          {/* Channel Name with Telegram Verified Badge */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <h2 className="text-xl sm:text-[22px] font-black tracking-tight text-white leading-tight">
              {title}
            </h2>
            <div className="w-5 h-5 rounded-full bg-[#0088cc] flex items-center justify-center text-white shrink-0 shadow-xs" title="Verified Channel">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          {/* Social Proof: Member Stack & Live Count */}
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
            <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 border border-[#0b1120] flex items-center justify-center text-[9px] font-bold text-white">M</div>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 border border-[#0b1120] flex items-center justify-center text-[9px] font-bold text-white">R</div>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 border border-[#0b1120] flex items-center justify-center text-[9px] font-bold text-white">S</div>
            </div>
            <span className="text-sky-300 font-bold">28,500+ Members</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              3,410 online
            </span>
          </div>

          {/* Description */}
          <p className="mt-2.5 text-xs sm:text-[13px] text-slate-300/85 max-w-xs leading-relaxed">
            {description}
          </p>

          {/* VIP Benefits 3-Box Strip */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4 p-2 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <div className="p-1.5 rounded-xl bg-white/[0.02]">
              <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[11px] font-extrabold text-white">Direct Links</div>
              <div className="text-[9px] text-slate-400">Zero Wait</div>
            </div>

            <div className="p-1.5 rounded-xl bg-white/[0.02]">
              <Film className="w-4 h-4 text-sky-400 mx-auto mb-1" />
              <div className="text-[11px] font-extrabold text-white">4K & 1080p</div>
              <div className="text-[9px] text-slate-400">Daily Movies</div>
            </div>

            <div className="p-1.5 rounded-xl bg-white/[0.02]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[11px] font-extrabold text-white">Zero Ads</div>
              <div className="text-[9px] text-slate-400">100% Free</div>
            </div>
          </div>

          {/* High-Impact Glowing Join Button */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleJoin}
            className="group relative w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0088cc] via-[#0284c7] to-[#0ea5e9] hover:from-[#0099e6] hover:to-[#38bdf8] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_10px_30px_rgba(0,136,204,0.45)] hover:shadow-[0_15px_40px_rgba(0,136,204,0.65)] transition-all duration-200 transform active:scale-97 border border-white/20 overflow-hidden"
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <span>Join VIP Telegram Channel</span>
            <ArrowRight className="w-4 h-4 text-sky-200 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Instant 1-Click "Maybe Later" */}
          <button
            onClick={handleClose}
            className="mt-3 text-xs font-medium text-slate-400 hover:text-slate-200 hover:underline transition-colors py-1 px-3"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
