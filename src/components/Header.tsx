import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  Play,
  Search,
  Film,
  Tv,
  Zap,
  Heart,
  Globe,
  Ghost,
  Smile,
  Flame,
  Clapperboard
} from 'lucide-react';
import { Category, Video } from '../types';

interface HeaderProps {
  currentCategory: Category;
  onSelectCategory: (cat: Category) => void;
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenAdmin?: () => void;
  telegramUrl: string;
  siteName: string;
  logoUrl?: string;
  tagline?: string;
  onLogoClick: () => void;
  videos?: Video[];
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  categories,
  searchQuery,
  onSearchChange,
  telegramUrl,
  siteName,
  logoUrl,
  tagline,
  onLogoClick,
  videos = [],
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Reset logo error when logoUrl changes
  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleCategoryClick = (cat: Category) => {
    onSelectCategory(cat);
    setMenuOpen(false);
  };

  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case 'All': return <Film className="w-4 h-4" />;
      case 'Movies': return <Clapperboard className="w-4 h-4" />;
      case 'Web Series': return <Tv className="w-4 h-4" />;
      case 'Action': return <Zap className="w-4 h-4" />;
      case 'Drama': return <Heart className="w-4 h-4" />;
      case 'Bangla': return <Globe className="w-4 h-4" />;
      case 'Thriller': return <Ghost className="w-4 h-4" />;
      case 'Comedy': return <Smile className="w-4 h-4" />;
      case 'Anime': return <Flame className="w-4 h-4" />;
      default: return <Film className="w-4 h-4" />;
    }
  };

  const getCategoryCount = (cat: Category) => {
    if (cat === 'All') return videos.length;
    return videos.filter((v) => v.category === cat).length;
  };

  const displayTagline = tagline !== undefined ? tagline.trim() : 'HD Movies & Series';
  const hasValidLogo = logoUrl && logoUrl.trim() !== '' && !logoError;

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Header Bar: Left [Menu + Logo] --- Right [Telegram Icon ONLY] */}
          <div className="flex items-center justify-between h-15 sm:h-18">
            
            {/* Left: Menu & Brand Logo */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              
              {/* Clean Hamburger Menu Button */}
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/90 active:scale-90 transition-all"
                aria-label="Open Navigation Menu"
                title="Browse Categories"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Shondor Cinema Logo */}
              <div 
                onClick={onLogoClick}
                className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
              >
                {/* Brand Logo: Dynamic Image or Gradient Icon */}
                {hasValidLogo ? (
                  <div className="relative">
                    <img 
                      src={logoUrl} 
                      alt={siteName}
                      onError={() => setLogoError(true)}
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl object-cover shadow-lg shadow-rose-600/20 border border-slate-200/60 dark:border-slate-800 group-hover:scale-105 active:scale-95 transition-transform duration-300"
                    />
                    <div className="absolute -inset-1 rounded-2xl bg-rose-500/20 blur-sm -z-10 group-hover:bg-rose-500/40 transition-colors" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-400 p-0.5 shadow-lg shadow-rose-600/30 group-hover:scale-105 active:scale-95 transition-transform duration-300">
                      <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
                        {/* Subtle reflection */}
                        <div className="absolute inset-0 bg-gradient-to-t from-rose-600/30 via-transparent to-amber-400/20" />
                        {/* Center Play glyph */}
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500 text-rose-500 ml-0.5 group-hover:fill-amber-400 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </div>
                    {/* Subtle ambient backglow */}
                    <div className="absolute -inset-1 rounded-2xl bg-rose-500/20 blur-sm -z-10 group-hover:bg-rose-500/40 transition-colors" />
                  </div>
                )}

                {/* Clean, Bold Logo Typography */}
                <div className="flex flex-col">
                  <span className="font-black text-lg sm:text-2xl tracking-tight leading-none bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    {siteName}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-0.5 max-w-[180px] sm:max-w-xs truncate">
                    {displayTagline}
                  </span>
                </div>
              </div>

            </div>

            {/* Right: Authentic Official Telegram Button */}
            <div className="flex items-center">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:from-[#229ED9] hover:to-[#1b8bc2] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#24A1DE]/40 hover:shadow-xl hover:shadow-[#24A1DE]/60 hover:scale-105 active:scale-95 transition-all duration-300 group overflow-hidden"
                aria-label="Join Official Telegram"
                title="Join Our Official Telegram"
              >
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-xs group-hover:rotate-12 transition-transform">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z"/>
                  </svg>
                </div>
                <span className="hidden sm:inline-block tracking-wide">Join Telegram</span>
                <span className="sm:hidden tracking-wide">Telegram</span>
              </a>
            </div>

          </div>
        </div>
      </header>

      {/* Modern Slide-In Drawer Navigation Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-5/6 max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 z-10 animate-in slide-in-from-left duration-250">
            
            <div className="p-5 flex flex-col h-full overflow-hidden">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  {hasValidLogo ? (
                    <img 
                      src={logoUrl} 
                      alt={siteName} 
                      className="w-8 h-8 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-700" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-sm">
                      <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 fill-rose-500 text-rose-500 ml-0.5" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-extrabold text-base bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent leading-none">
                      {siteName}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 truncate max-w-[130px]">
                      {displayTagline}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Search inside Drawer */}
              <div className="mt-3.5 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories list in Drawer */}
              <div className="mt-4 flex-1 overflow-y-auto pr-1">
                <div className="flex items-center gap-1.5 mb-2.5 px-1 text-slate-400">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Categories
                  </span>
                </div>

                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isActive = currentCategory === cat;
                    const count = getCategoryCount(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? 'text-white' : 'text-rose-500 dark:text-rose-400'}>
                            {getCategoryIcon(cat)}
                          </span>
                          <span>{cat}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {count}
                          </span>
                          <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Telegram Channel in Drawer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-[#24A1DE] hover:bg-[#1d93ce] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#24A1DE]/25 active:scale-98 transition-all"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z"/>
                  </svg>
                  <span>Join Official Telegram</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
