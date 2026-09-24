import React, { useState, useEffect } from 'react';
import { Send, X, BellRing, Sparkles } from 'lucide-react';
import { AppSettings } from '../types';

interface TelegramPopupProps {
  settings: AppSettings;
}

export const TelegramPopup: React.FC<TelegramPopupProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Only disable if explicitly set to false
    if (settings && settings.telegramPopupEnabled === false) return;

    // Check if user explicitly checked "Don't show again"
    const dismissed = localStorage.getItem('streampulse_tg_permanent_dismiss');
    if (dismissed === 'true') return;

    const delaySec = Number(settings?.telegramPopupDelaySec) || 4;
    const delayMs = Math.max(1000, delaySec * 1000);

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [settings?.telegramPopupEnabled, settings?.telegramPopupDelaySec]);

  const handleClose = () => {
    setIsOpen(false);
    if (dontShowAgain) {
      localStorage.setItem('streampulse_tg_permanent_dismiss', 'true');
    }
  };

  const handleJoin = () => {
    if (dontShowAgain) {
      localStorage.setItem('streampulse_tg_permanent_dismiss', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const title = settings?.telegramPopupTitle || 'Join Our Official Telegram Channel';
  const description = settings?.telegramPopupDescription || 'Get daily direct HD movie links, latest web series, exclusive updates & requested videos first!';
  const telegramUrl = settings?.telegramChannelUrl || 'https://t.me/streampulse_official';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-slate-900 dark:text-white transform animate-in zoom-in-95 duration-250">
        
        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-sky-500/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Telegram Icon with Pulse Rings */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#29b6f6] to-[#01579b] flex items-center justify-center text-white shadow-xl shadow-sky-500/35">
              <svg viewBox="0 0 24 24" className="w-9 h-9 sm:w-10 sm:h-10 fill-white translate-x-[-1px]">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-rose-500 text-white shadow-md">
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-sky-200 dark:border-sky-800">
            <Sparkles className="w-3 h-3" />
            <span>VIP Community</span>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
            {title}
          </h2>

          {/* Description */}
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
            {description}
          </p>

          {/* Primary CTA Button */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleJoin}
            className="w-full mt-5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-sky-500/30 transition-all transform active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>Join Telegram Channel Now</span>
          </a>

          {/* Secondary Actions */}
          <div className="mt-4 flex items-center justify-between w-full text-xs text-slate-500 dark:text-slate-400 px-1">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Don&apos;t show again</span>
            </label>

            <button
              onClick={handleClose}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
