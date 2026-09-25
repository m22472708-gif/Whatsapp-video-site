import React from 'react';
import { Send, CheckCircle2, BellRing, Sparkles, ExternalLink } from 'lucide-react';

interface TelegramCommunityBannerProps {
  telegramUrl: string;
  siteName: string;
}

export const TelegramCommunityBanner: React.FC<TelegramCommunityBannerProps> = ({
  telegramUrl,
  siteName,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-sky-600 via-[#24A1DE] to-indigo-700 p-4 sm:p-6 text-white shadow-xl shadow-sky-600/20 border border-sky-400/30">
        {/* Ambient Backlight Elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left Details */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg border border-white/20">
              <Send className="w-6 h-6 sm:w-7 sm:h-7 text-white -rotate-12 translate-x-0.5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-base sm:text-lg tracking-tight">
                  Join {siteName} Official Telegram
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wide">
                  <CheckCircle2 className="w-3 h-3 text-sky-200" />
                  VERIFIED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-100/90 max-w-xl leading-relaxed">
                Get daily direct HD movie download links, upcoming web series alerts, 4K quality releases & request any video directly in our group!
              </p>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0 w-full md:w-auto">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full md:w-auto px-6 py-3 rounded-2xl bg-white text-sky-700 hover:text-sky-800 font-extrabold text-xs sm:text-sm shadow-lg shadow-black/15 hover:bg-sky-50 active:scale-95 transition-all group"
            >
              <span>Join Channel Free</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
