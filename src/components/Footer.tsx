import React, { useState, useEffect } from 'react';
import { Film, Send, Heart, Shield, ExternalLink, Sun, Moon, Play } from 'lucide-react';
import { Category } from '../types';

interface FooterProps {
  categories: Category[];
  onSelectCategory: (cat: Category) => void;
  telegramUrl: string;
  onOpenAdmin?: () => void;
  siteName: string;
  logoUrl?: string;
  tagline?: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  onSelectCategory,
  telegramUrl,
  siteName,
  logoUrl,
  tagline,
  isDarkMode,
  onToggleTheme,
}) => {
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

  const hasValidLogo = logoUrl && logoUrl.trim() !== '' && !logoError;
  const displayTagline = tagline && tagline.trim() !== '' ? tagline.trim() : 'Your premier direct video streaming platform. Ultra-fast buffering-free experience with top movies and web series.';

  return (
    <footer className="w-full mt-12 sm:mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              {hasValidLogo ? (
                <img 
                  src={logoUrl} 
                  alt={siteName}
                  onError={() => setLogoError(true)}
                  className="w-9 h-9 rounded-xl object-cover shadow-md border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              )}
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                {siteName}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {displayTagline}
            </p>

            {/* Telegram Community Card */}
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 max-w-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Official Telegram</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant updates & requests</p>
                  </div>
                </div>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                >
                  <span>Join</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Explore Categories
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Information & Help
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>DMCA & Disclaimer</span>
              </li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Fast Direct Servers</li>
              <li className="pt-2">
                <button
                  onClick={onToggleTheme}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {isDarkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3" />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Fast CDN Streaming</span>
            <span>•</span>
            <span>Mobile Optimized</span>
            <span>•</span>
            <span className="text-rose-500 font-semibold">100% Free</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
