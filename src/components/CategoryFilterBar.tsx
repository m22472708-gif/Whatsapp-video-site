import React, { useRef } from 'react';
import { 
  Film, 
  Tv, 
  Zap, 
  Heart, 
  Globe, 
  Ghost, 
  Smile, 
  Flame, 
  Clapperboard,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Category, Video } from '../types';

interface CategoryFilterBarProps {
  categories: Category[];
  currentCategory: Category;
  onSelectCategory: (cat: Category) => void;
  videos: Video[];
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  currentCategory,
  onSelectCategory,
  videos,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case 'All': return <Sparkles className="w-3.5 h-3.5" />;
      case 'Movies': return <Clapperboard className="w-3.5 h-3.5" />;
      case 'Web Series': return <Tv className="w-3.5 h-3.5" />;
      case 'Action': return <Zap className="w-3.5 h-3.5" />;
      case 'Drama': return <Heart className="w-3.5 h-3.5" />;
      case 'Bangla': return <Globe className="w-3.5 h-3.5" />;
      case 'Thriller': return <Ghost className="w-3.5 h-3.5" />;
      case 'Comedy': return <Smile className="w-3.5 h-3.5" />;
      case 'Anime': return <Flame className="w-3.5 h-3.5" />;
      default: return <Film className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryCount = (cat: Category) => {
    if (cat === 'All') return videos.length;
    return videos.filter((v) => v.category === cat).length;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="relative flex items-center group/cat">
        {/* Left Arrow Button for Desktop */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex items-center justify-center absolute -left-2 z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 opacity-0 group-hover/cat:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Category Row */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none scroll-smooth w-full no-scrollbar px-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => {
            const isActive = currentCategory === cat;
            const count = getCategoryCount(cat);

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 select-none ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-rose-500 dark:text-rose-400'}>
                  {getCategoryIcon(cat)}
                </span>
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button for Desktop */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex items-center justify-center absolute -right-2 z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 opacity-0 group-hover/cat:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
