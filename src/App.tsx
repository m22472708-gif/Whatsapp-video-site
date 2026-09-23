/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Video, 
  Banner, 
  AppSettings, 
  Category 
} from './types';
import { store } from './services/store';
import { Header } from './components/Header';
import { BannerHero } from './components/BannerHero';
import { VideoCard } from './components/VideoCard';
import { VideoPlayView } from './components/VideoPlayView';
import { TelegramPopup } from './components/TelegramPopup';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { 
  Film, 
  Flame, 
  Search, 
  X, 
  TrendingUp, 
  Sparkles, 
  Heart,
  SlidersHorizontal
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'All',
  'Movies',
  'Web Series',
  'Action',
  'Drama',
  'Bangla',
  'Thriller',
  'Comedy',
  'Anime',
  'Trailers',
];

type SortOption = 'trending' | 'latest' | 'liked';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('streampulse_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark for cinema experience
  });

  // Store data states
  const [videos, setVideos] = useState<Video[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<AppSettings>(store.getSettings());

  // Navigation & Filter states
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // Admin states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Initialize theme class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('streampulse_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('streampulse_theme', 'light');
    }
  }, [isDarkMode]);

  // Load store data & subscribe to real-time changes
  useEffect(() => {
    const updateData = () => {
      setVideos([...store.getVideos()]);
      setBanners([...store.getBanners()]);
      setSettings({ ...store.getSettings() });
    };

    updateData();
    const unsubscribe = store.subscribe(updateData);
    return () => unsubscribe();
  }, []);

  // Check for #admin in URL hash or query params
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        setIsAdminOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Filter and sort videos dynamically
  const filteredAndSortedVideos = useMemo(() => {
    let result = videos.filter((video) => {
      const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        video.title.toLowerCase().includes(q) ||
        video.category.toLowerCase().includes(q) ||
        (video.description && video.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });

    // Apply sorting
    if (sortBy === 'trending') {
      result = [...result].sort((a, b) => b.views - a.views);
    } else if (sortBy === 'latest') {
      result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'liked') {
      result = [...result].sort((a, b) => b.likes - a.likes);
    }

    return result;
  }, [videos, selectedCategory, searchQuery, sortBy]);

  const handleSelectBanner = (banner: Banner) => {
    if (banner.targetVideoId) {
      const vid = videos.find((v) => v.id === banner.targetVideoId);
      if (vid) {
        setActiveVideo(vid);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    // Fallback: pick first video or open targetLink
    if (banner.targetLink) {
      window.open(banner.targetLink, '_blank');
    } else if (videos.length > 0) {
      setActiveVideo(videos[0]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative selection:bg-rose-500 selection:text-white">
      
      {/* Dynamic Ambient Background Aura */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-rose-500/10 via-amber-500/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-sky-500/5 dark:bg-sky-500/10 blur-3xl rounded-full" />
      </div>

      {/* 4-Second Glass Telegram Popup */}
      <TelegramPopup settings={settings} />

      {/* Header */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveVideo(null);
        }}
        categories={CATEGORIES}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
        telegramUrl={settings.telegramChannelUrl}
        siteName={settings.siteName}
        videos={videos}
        onLogoClick={() => {
          setActiveVideo(null);
          setSelectedCategory('All');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeVideo ? (
          /* Video Play Page View */
          <VideoPlayView
            video={activeVideo}
            onBack={() => {
              setActiveVideo(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectRelatedVideo={(v) => {
              setActiveVideo(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            allVideos={videos}
          />
        ) : (
          /* Home Page View */
          <div className="space-y-5 sm:space-y-7">
            
            {/* Banner Section ("tar niche banner") */}
            {!searchQuery && selectedCategory === 'All' && (
              <BannerHero
                banners={banners}
                onSelectBanner={handleSelectBanner}
              />
            )}

            {/* Video Listing Section */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-12">
              
              {/* Dynamic Header & Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pt-1">
                
                {/* Title & Active Filter Tag */}
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/25 shrink-0">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        {searchQuery
                          ? `Results for "${searchQuery}"`
                          : selectedCategory === 'All'
                          ? 'Featured & Trending'
                          : `${selectedCategory} Collection`}
                      </h2>

                      {/* Active Filter Clear Pill */}
                      {selectedCategory !== 'All' && (
                        <button
                          onClick={() => setSelectedCategory('All')}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors"
                          title="Reset Category Filter"
                        >
                          <span>{selectedCategory}</span>
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                      High-Definition Video Streaming Hub · {filteredAndSortedVideos.length} Available
                    </p>
                  </div>
                </div>

                {/* Dynamic Controls: Instant Search & Sort */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  
                  {/* Inline Instant Search */}
                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Quick search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 shadow-xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dynamic Sorting Segmented Control */}
                  <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs font-bold shrink-0">
                    <button
                      onClick={() => setSortBy('trending')}
                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                        sortBy === 'trending'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="Sort by Most Views"
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span className="hidden sm:inline">Views</span>
                    </button>

                    <button
                      onClick={() => setSortBy('latest')}
                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                        sortBy === 'latest'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="Sort by Newest"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span className="hidden sm:inline">New</span>
                    </button>

                    <button
                      onClick={() => setSortBy('liked')}
                      className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                        sortBy === 'liked'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="Sort by Most Liked"
                    >
                      <Heart className="w-3 h-3" />
                      <span className="hidden sm:inline">Likes</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* Dynamic Responsive Video Grid */}
              {filteredAndSortedVideos.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <Film className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                    No videos match your filter
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try searching for another keyword or browse different categories in the menu.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-4 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-transform active:scale-95"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                  {filteredAndSortedVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onSelect={(v) => {
                        setActiveVideo(v);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      isLiked={store.isVideoLiked(video.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        categories={CATEGORIES}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveVideo(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
        telegramUrl={settings.telegramChannelUrl}
        siteName={settings.siteName}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Admin Login Dialog */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminOpen(true);
        }}
      />

      {/* Full Admin Management Panel */}
      {isAdminOpen && (
        <AdminPanel
          onClose={() => setIsAdminOpen(false)}
          videos={videos}
          banners={banners}
          settings={settings}
          categories={CATEGORIES}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
