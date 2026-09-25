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
import { 
  Film, 
  Flame, 
  Search, 
  X, 
  TrendingUp, 
  Sparkles, 
  Heart,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Layers,
  Clock
} from 'lucide-react';

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
  const [categories, setCategories] = useState<string[]>(() => store.getCategories());
  const [settings, setSettings] = useState<AppSettings>(store.getSettings());

  // Navigation & Filter states
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [showAllRecent, setShowAllRecent] = useState(false);

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
      setCategories([...store.getCategories()]);
      setSettings({ ...store.getSettings() });
    };

    updateData();
    const unsubscribe = store.subscribe(updateData);
    return () => unsubscribe();
  }, []);

  // Dynamically sync document title and browser favicon from Firestore settings
  useEffect(() => {
    const siteTitle = settings.siteName || 'StreamPulse';
    const siteTag = settings.tagline && settings.tagline.trim() !== '' ? ` - ${settings.tagline.trim()}` : '';
    document.title = `${siteTitle}${siteTag}`;

    if (settings.logoUrl && settings.logoUrl.trim() !== '') {
      let faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.logoUrl;
    }
  }, [settings.siteName, settings.tagline, settings.logoUrl]);

  // Top 4 trending videos for the Featured & Trending section (sorted by highest views)
  const trendingVideos = useMemo(() => {
    return [...videos].sort((a, b) => b.views - a.views).slice(0, 4);
  }, [videos]);

  // Recent videos sorted with newest uploaded/posted first (createdAt descending)
  const recentVideos = useMemo(() => {
    return [...videos].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [videos]);

  // Displayed recent videos: first 20 videos, or all if View All is clicked
  const displayedRecentVideos = useMemo(() => {
    return showAllRecent ? recentVideos : recentVideos.slice(0, 20);
  }, [recentVideos, showAllRecent]);

  // Filter and sort videos dynamically for Search and Category views
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
      result = [...result].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative selection:bg-sky-500 selection:text-white">
      
      {/* Dynamic Ambient Background Aura with Telegram-Matching Subtle Blue */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-sky-500/10 via-indigo-500/5 to-transparent blur-3xl rounded-full" />
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
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        telegramUrl={settings.telegramChannelUrl}
        siteName={settings.siteName}
        logoUrl={settings.logoUrl}
        tagline={settings.tagline}
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
            telegramUrl={settings.telegramChannelUrl}
          />
        ) : (
          /* Home Page View */
          <div className="space-y-4 sm:space-y-5">
            
            {/* Banner Section ("tar niche banner") */}
            {!searchQuery && selectedCategory === 'All' && (
              <BannerHero
                banners={banners}
                onSelectBanner={handleSelectBanner}
              />
            )}

            {/* Main Video Content Area */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-10 sm:pb-12">
              
              {/* IF BROWSING SPECIFIC CATEGORY OR SEARCHING */}
              {(searchQuery || selectedCategory !== 'All') ? (
                <div>
                  {/* Category / Search Results Header & Toolbar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 pt-1">
                    
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
                              : `${selectedCategory} Collection`}
                          </h2>

                          {/* Active Filter Clear Pill */}
                          {selectedCategory !== 'All' && (
                            <button
                              onClick={() => setSelectedCategory('All')}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors cursor-pointer"
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
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Dynamic Sorting Segmented Control */}
                      <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs font-bold shrink-0">
                        <button
                          onClick={() => setSortBy('trending')}
                          className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
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
                          className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
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
                          className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
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

                  {/* Filtered Grid */}
                  {filteredAndSortedVideos.length === 0 ? (
                    <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <Film className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                        {videos.length === 0 ? 'No videos posted yet' : 'No videos match your filter'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {videos.length === 0
                          ? 'Videos uploaded from the Admin Panel will appear here automatically in real-time.'
                          : 'Try searching for another keyword or browse different categories in the menu.'}
                      </p>
                      {videos.length > 0 && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('All');
                          }}
                          className="mt-4 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-transform active:scale-95 cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                      )}
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
              ) : (
                /* DEFAULT HOME PAGE: 1. FEATURED & TRENDING (4 VIDEOS) + 2. RECENT VIDEOS (COMPACT PADDING & SPACING) */
                <div className="space-y-6 sm:space-y-7">
                  
                  {/* --- 1. FEATURED & TRENDING SECTION (TOP 4 VIDEOS) --- */}
                  {trendingVideos.length > 0 && (
                    <section>
                      {/* Section Header */}
                      <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/25 shrink-0">
                            <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                Featured & Trending
                              </h2>
                              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                                Top 4 Trending
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                              Most watched & high-engagement viral videos
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 4-Column Grid for Trending */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                        {trendingVideos.map((video) => (
                          <VideoCard
                            key={`trending-${video.id}`}
                            video={video}
                            onSelect={(v) => {
                              setActiveVideo(v);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            isLiked={store.isVideoLiked(video.id)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* --- 2. RECENT VIDEOS SECTION (NEWEST POSTS FIRST, 20 ITEMS + VIEW ALL) --- */}
                  <section className={trendingVideos.length > 0 ? 'pt-5 sm:pt-6 border-t border-slate-200/60 dark:border-slate-800/60' : ''}>
                    {/* Section Header with Live Counter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5 sm:mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/25 shrink-0">
                          <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                              Recent Videos
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25">
                              Latest Releases
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                            Newest uploads first · Showing {displayedRecentVideos.length} of {recentVideos.length} videos
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Empty State */}
                    {recentVideos.length === 0 ? (
                      <div className="py-14 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <Film className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                          No videos posted yet
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Videos uploaded from the Admin Panel will automatically appear here with the newest on top.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Responsive Video Grid for Recent Videos */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                          {displayedRecentVideos.map((video) => (
                            <VideoCard
                              key={`recent-${video.id}`}
                              video={video}
                              onSelect={(v) => {
                                setActiveVideo(v);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              isLiked={store.isVideoLiked(video.id)}
                            />
                          ))}
                        </div>

                        {/* VIEW ALL / LOAD MORE BUTTON (If more than 20 videos) */}
                        {recentVideos.length > 20 && (
                          <div className="pt-8 pb-4 text-center flex justify-center">
                            {!showAllRecent ? (
                              <button
                                onClick={() => setShowAllRecent(true)}
                                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer group"
                              >
                                <Layers className="w-4 h-4" />
                                <span>View All Videos ({recentVideos.length - 20} More)</span>
                                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowAllRecent(false);
                                  window.scrollTo({ top: 350, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                              >
                                <span>Show Less (Top 20)</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </section>

                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        categories={categories}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveVideo(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        telegramUrl={settings.telegramChannelUrl}
        siteName={settings.siteName}
        logoUrl={settings.logoUrl}
        tagline={settings.tagline}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    </div>
  );
}
