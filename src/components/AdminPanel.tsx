import React, { useState } from 'react';
import { 
  Video, 
  Banner, 
  AppSettings, 
  Category 
} from '../types';
import { store } from '../services/store';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Heart, 
  Clock, 
  Image as ImageIcon, 
  Send, 
  ExternalLink, 
  Check, 
  X, 
  Save, 
  RotateCcw, 
  Copy, 
  Lock, 
  Film, 
  Sliders, 
  Layers, 
  Settings as SettingsIcon,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
  videos: Video[];
  banners: Banner[];
  settings: AppSettings;
  categories: Category[];
  isDarkMode: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onClose,
  videos,
  banners,
  settings,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'banners' | 'telegram' | 'adwall' | 'adsterra' | 'prompt'>('videos');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // --- VIDEO FORM STATE ---
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDuration, setVideoDuration] = useState('15:00');
  const [videoCategory, setVideoCategory] = useState<string>('Movies');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [videoDirectLink, setVideoDirectLink] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoSearch, setVideoSearch] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);

  // --- BANNER FORM STATE ---
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerBadge, setBannerBadge] = useState('Featured');
  const [bannerTargetLink, setBannerTargetLink] = useState('');
  const [showBannerModal, setShowBannerModal] = useState(false);

  // --- TELEGRAM SETTINGS FORM STATE ---
  const [tgUrl, setTgUrl] = useState(settings.telegramChannelUrl);
  const [tgTitle, setTgTitle] = useState(settings.telegramPopupTitle);
  const [tgDesc, setTgDesc] = useState(settings.telegramPopupDescription);
  const [tgDelay, setTgDelay] = useState(settings.telegramPopupDelaySec);
  const [tgEnabled, setTgEnabled] = useState(settings.telegramPopupEnabled);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // --- AD WALL & VIDEO UNLOCK FORM STATE ---
  const [adWallEnabled, setAdWallEnabled] = useState(settings.unlockAdEnabled !== false);
  const [adWallUrl, setAdWallUrl] = useState(settings.unlockAdUrl || '');
  const [adWallClicks, setAdWallClicks] = useState(settings.unlockAdRequiredClicks ?? 2);
  const [adWallWaitSec, setAdWallWaitSec] = useState(settings.unlockAdWaitSeconds ?? 10);
  const [adWallBtnText, setAdWallBtnText] = useState(settings.unlockAdButtonText || 'Unlock Video (Watch Ads to Play)');
  const [savedAdWallSuccess, setSavedAdWallSuccess] = useState(false);

  // --- ADSTERRA ADS ENGINE FORM STATE (5x Multiplier & Continuous) ---
  const [adsterraEnabled, setAdsterraEnabled] = useState(settings.adsterraEnabled !== false);
  const [adsterraScript, setAdsterraScript] = useState(settings.adsterraScriptCode || '//pl25910243.highratecpm.com/a4/09/b3/a409b300f2e0e5d17bb66487779f76a5.js');
  const [adsterraMultiplier, setAdsterraMultiplier] = useState(settings.adsterraMultiplier ?? 5);
  const [adsterraContinuous, setAdsterraContinuous] = useState(settings.adsterraContinuous !== false);
  const [adsterraPlacement, setAdsterraPlacement] = useState<'homepage' | 'video_page' | 'both'>(settings.adsterraPlacement || 'both');
  const [adsterraDirectLink, setAdsterraDirectLink] = useState(settings.adsterraDirectLinkUrl || '');
  const [savedAdsterraSuccess, setSavedAdsterraSuccess] = useState(false);

  // Preset thumbnails for easy one-click testing
  const PRESET_THUMBNAILS = [
    { label: 'Action/Cyber', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=700&auto=format&fit=crop&q=80' },
    { label: 'Bangla Cinema', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=700&auto=format&fit=crop&q=80' },
    { label: 'Thriller Night', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=700&auto=format&fit=crop&q=80' },
    { label: 'Racing & Cars', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&auto=format&fit=crop&q=80' },
    { label: 'Anime Fantasy', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=700&auto=format&fit=crop&q=80' },
  ];

  // Reset video form
  const resetVideoForm = () => {
    setVideoTitle('');
    setVideoDuration('15:00');
    setVideoCategory('Movies');
    setVideoThumbnail('');
    setVideoDirectLink('');
    setVideoDescription('');
    setIsEditingVideo(false);
    setEditingVideoId(null);
    setShowVideoModal(false);
  };

  const handleOpenAddVideo = () => {
    resetVideoForm();
    setShowVideoModal(true);
  };

  const handleEditVideo = (video: Video) => {
    setIsEditingVideo(true);
    setEditingVideoId(video.id);
    setVideoTitle(video.title);
    setVideoDuration(video.duration);
    setVideoCategory(video.category);
    setVideoThumbnail(video.thumbnailUrl);
    setVideoDirectLink(video.directLink);
    setVideoDescription(video.description || '');
    setShowVideoModal(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoThumbnail.trim() || !videoDirectLink.trim()) {
      alert('Please fill in Video Title, Thumbnail URL, and Direct Link!');
      return;
    }

    if (isEditingVideo && editingVideoId) {
      store.updateVideo(editingVideoId, {
        title: videoTitle.trim(),
        duration: videoDuration.trim() || '10:00',
        category: videoCategory,
        thumbnailUrl: videoThumbnail.trim(),
        directLink: videoDirectLink.trim(),
        description: videoDescription.trim(),
      });
      showToast('Video details updated successfully!');
    } else {
      store.addVideo({
        title: videoTitle.trim(),
        duration: videoDuration.trim() || '10:00',
        category: videoCategory,
        thumbnailUrl: videoThumbnail.trim(),
        directLink: videoDirectLink.trim(),
        description: videoDescription.trim(),
      });
      showToast('New video uploaded and published to homepage!');
    }
    resetVideoForm();
  };

  const handleDeleteVideo = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete video "${title}"?`)) {
      store.deleteVideo(id);
      showToast(`Video "${title}" deleted.`);
    }
  };

  // Banner Actions
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImage.trim()) {
      alert('Please fill in Banner Title and Image URL!');
      return;
    }

    store.addBanner({
      title: bannerTitle.trim(),
      subtitle: bannerSubtitle.trim() || 'Exclusive Streaming Release',
      imageUrl: bannerImage.trim(),
      badge: bannerBadge.trim() || 'Trending',
      targetLink: bannerTargetLink.trim(),
      active: true,
    });

    setBannerTitle('');
    setBannerSubtitle('');
    setBannerImage('');
    setBannerBadge('Featured');
    setBannerTargetLink('');
    setShowBannerModal(false);
    showToast('Banner slide added successfully!');
  };

  const handleDeleteBanner = (id: string) => {
    if (window.confirm('Delete this banner?')) {
      store.deleteBanner(id);
      showToast('Banner removed.');
    }
  };

  const handleToggleBannerActive = (banner: Banner) => {
    store.updateBanner(banner.id, { active: !banner.active });
    showToast(banner.active ? 'Banner hidden from site' : 'Banner activated on site');
  };

  // Telegram Settings Actions
  const handleSaveTelegramSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
      telegramChannelUrl: tgUrl.trim(),
      telegramPopupTitle: tgTitle.trim(),
      telegramPopupDescription: tgDesc.trim(),
      telegramPopupDelaySec: Number(tgDelay) || 4,
      telegramPopupEnabled: tgEnabled,
    });
    setSavedSettingsSuccess(true);
    showToast('Telegram channel and popup settings saved!');
    setTimeout(() => setSavedSettingsSuccess(false), 3000);
  };

  // Save Ad Wall & Video Unlock Settings
  const handleSaveAdWallSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
      unlockAdEnabled: adWallEnabled,
      unlockAdUrl: adWallUrl.trim(),
      unlockAdRequiredClicks: Math.max(1, Number(adWallClicks) || 1),
      unlockAdWaitSeconds: Math.max(1, Number(adWallWaitSec) || 1),
      unlockAdButtonText: adWallBtnText.trim() || 'Unlock Video (Watch Ads to Play)',
    });
    setSavedAdWallSuccess(true);
    showToast('Video Unlock & Ad Wall settings saved to Firestore!');
    setTimeout(() => setSavedAdWallSuccess(false), 3000);
  };

  // Save Adsterra Ads Engine Settings (5x Multiplier & Continuous)
  const handleSaveAdsterraSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
      adsterraEnabled,
      adsterraScriptCode: adsterraScript.trim(),
      adsterraMultiplier: Math.max(1, Math.min(20, Number(adsterraMultiplier) || 5)),
      adsterraContinuous,
      adsterraPlacement,
      adsterraDirectLinkUrl: adsterraDirectLink.trim(),
    });
    setSavedAdsterraSuccess(true);
    showToast(`Adsterra Engine (${adsterraMultiplier}x Multiplier + Continuous) saved!`);
    setTimeout(() => setSavedAdsterraSuccess(false), 3000);
  };

  // Filtered Videos
  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
    v.category.toLowerCase().includes(videoSearch.toLowerCase())
  );

  // Total stats
  const totalViews = videos.reduce((acc, v) => acc + v.views, 0);
  const totalLikes = videos.reduce((acc, v) => acc + v.likes, 0);

  // Standalone Admin Panel Prompt
  const standaloneAdminPrompt = `Create a standalone dedicated Admin Panel web application for "StreamPulse Video Portal" connected to Firebase Firestore and localStorage.

App Purpose:
This is the exclusive Admin Dashboard where administrators upload videos, manage home banners, and configure the Telegram join popup settings. Regular users will not access this site.

Firebase Schema & Collections:
1. "videos" collection:
   - id: string
   - title: string
   - duration: string (e.g. "18:45")
   - category: string ("Movies", "Web Series", "Action", "Drama", "Bangla", "Thriller", "Comedy", "Anime", "Trailers")
   - thumbnailUrl: string (image link)
   - directLink: string (the direct video/cloud link opened after 10-sec countdown)
   - views: number
   - likes: number
   - description: string
   - createdAt: timestamp / number

2. "banners" collection:
   - id: string
   - title: string
   - subtitle: string
   - imageUrl: string
   - badge: string (e.g. "Trending", "New Release")
   - active: boolean
   - order: number
   - targetVideoId: string (optional)

3. "settings" collection (document "general"):
   - telegramChannelUrl: string
   - telegramPopupTitle: string
   - telegramPopupDescription: string
   - telegramPopupDelaySec: number (default: 4)
   - telegramPopupEnabled: boolean
   - siteName: string

Key Admin Features Required:
1. Video Management:
   - Add New Video with title, duration, category dropdown, direct link, thumbnail URL (with preview), description.
   - List all videos with search, category filtering, views & likes counters.
   - Edit existing video details.
   - Delete video with confirmation dialog.
   - Test Direct Link button to verify if redirect destination is active.
2. Banner Management:
   - Add banner image URL, title, subtitle, badge, active toggle.
   - Reorder and delete banners.
3. Telegram Popup Control:
   - Set Telegram channel join link.
   - Edit popup title, description, and trigger delay (4 seconds).
   - Toggle popup active/inactive.
   - Live glassmorphic popup preview tester.
4. UI & Theme:
   - Clean, modern, uncluttered UI/UX (Tailwind CSS).
   - Light mode and Night/Dark mode toggle.
   - Responsive on mobile, tablet, and desktop.
   - Real-time Firestore synchronization with offline fallback.`;

  const handleCopyPrompt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(standaloneAdminPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex flex-col p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Container Card */}
      <div className="w-full max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col my-auto overflow-hidden">
        
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Admin Control Panel
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                  Protected Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage videos, banner slides, and Telegram popup settings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Exit Admin to User Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-500 text-white px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-between shadow-inner animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Total Videos</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{videos.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Total Views</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalViews.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Total Likes</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalLikes.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Active Banners</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{banners.filter(b => b.active).length}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-slate-50/50 dark:bg-slate-950/20 overflow-x-auto">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'videos'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Video Management ({videos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'banners'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Banner Images ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'telegram'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Telegram & Popup Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('adwall')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'adwall'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4 text-rose-500" />
            <span>Video Unlock & Ad Wall</span>
          </button>

          <button
            onClick={() => setActiveTab('adsterra')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'adsterra'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>Adsterra Engine ({adsterraMultiplier}x Continuous)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black">
              {adsterraMultiplier}x Power
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'prompt'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Standalone Admin Prompt</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
          
          {/* TAB 1: VIDEOS MANAGEMENT */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              
              {/* Header with Search & Add Video Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Search video by title or category..."
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  className="w-full sm:w-72 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />

                <button
                  onClick={handleOpenAddVideo}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload / Add New Video</span>
                </button>
              </div>

              {/* Video List Table */}
              <div className="space-y-2">
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No videos found matching your search.
                  </div>
                ) : (
                  filteredVideos.map((video) => (
                    <div
                      key={video.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-400/40 transition-colors"
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[10px] text-white font-bold">
                            {video.duration}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                              {video.category}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {video.views}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {video.likes}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-1 max-w-md">
                            <span className="font-semibold text-rose-500">10s Direct Link:</span> {video.directLink}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <a
                          href={video.directLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs"
                          title="Test Direct Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleEditVideo(video)}
                          className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs"
                          title="Edit Video"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteVideo(video.id, video.title)}
                          className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs"
                          title="Delete Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BANNERS MANAGEMENT */}
          {activeTab === 'banners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage featured hero slider banners displayed at the top of the user home page.
                </p>
                <button
                  onClick={() => setShowBannerModal(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Banner</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group"
                  >
                    <div className="h-40 w-full overflow-hidden">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                          {banner.badge || 'Banner'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleBannerActive(banner)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              banner.active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {banner.active ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="p-1 rounded bg-black/60 hover:bg-rose-600 text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white drop-shadow">{banner.title}</h4>
                        <p className="text-xs text-slate-200 line-clamp-1">{banner.subtitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TELEGRAM & POPUP SETTINGS */}
          {activeTab === 'telegram' && (
            <div className="max-w-2xl space-y-5">
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400 mb-1">
                  <Send className="w-4 h-4" />
                  <span>Telegram Channel & 4-Second Glass Popup</span>
                </div>
                Configure the channel link and automated glassmorphic popup that greets visitors 4 seconds after entering the website.
              </div>

              <form onSubmit={handleSaveTelegramSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telegram Channel URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={tgUrl}
                      onChange={(e) => setTgUrl(e.target.value)}
                      placeholder="https://t.me/your_channel_name"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <Send className="w-4 h-4 text-sky-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Popup Title
                  </label>
                  <input
                    type="text"
                    value={tgTitle}
                    onChange={(e) => setTgTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Popup Description / Message
                  </label>
                  <textarea
                    rows={2}
                    value={tgDesc}
                    onChange={(e) => setTgDesc(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Popup Trigger Delay (Seconds)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={tgDelay}
                      onChange={(e) => setTgDelay(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <input
                      type="checkbox"
                      id="tgEnabled"
                      checked={tgEnabled}
                      onChange={(e) => setTgEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 cursor-pointer"
                    />
                    <label htmlFor="tgEnabled" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Enable Telegram Popup on User Site
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </button>

                  {savedSettingsSuccess && (
                    <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-4 h-4" /> Saved Successfully!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB: VIDEO UNLOCK & AD WALL SETTINGS */}
          {activeTab === 'adwall' && (
            <div className="max-w-2xl space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/20 via-orange-950/10 to-transparent border border-rose-200 dark:border-rose-900/60 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400 mb-1">
                  <Lock className="w-4 h-4" />
                  <span>Video Unlock & Ad Wall Monetization System</span>
                </div>
                Configure the monetization paywall / ad gate for all video plays. Control the sponsor link, required number of visits, countdown timer, and button text in real-time.
              </div>

              <form onSubmit={handleSaveAdWallSettings} className="space-y-4">
                {/* Enable Ad Wall Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <label htmlFor="adWallToggle" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer block">
                      Enable Video Unlock Ad Wall
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      When enabled, videos remain locked until viewers complete the required ad views.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="adWallToggle"
                    checked={adWallEnabled}
                    onChange={(e) => setAdWallEnabled(e.target.checked)}
                    className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                {/* Ad Target Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monetization Ad / Sponsor Link (unlockAdUrl)
                  </label>
                  <input
                    type="url"
                    value={adWallUrl}
                    onChange={(e) => setAdWallUrl(e.target.value)}
                    placeholder="https://example.com/ad-monetization-link or https://t.me/your_channel"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    This URL opens in a new tab when the user clicks the "Unlock Video" button.
                  </p>
                </div>

                {/* Grid for Clicks and Countdown Seconds */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Required Ad Clicks (unlockAdRequiredClicks)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={adWallClicks}
                      onChange={(e) => setAdWallClicks(Math.max(1, Number(e.target.value)))}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Number of ads user must view (e.g. 2, 3, or 5).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Wait Countdown Seconds (unlockAdWaitSeconds)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={adWallWaitSec}
                      onChange={(e) => setAdWallWaitSec(Math.max(1, Number(e.target.value)))}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Countdown timer duration per click (e.g. 10s).
                    </p>
                  </div>
                </div>

                {/* Button Text Customization */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Button Text (unlockAdButtonText)
                  </label>
                  <input
                    type="text"
                    value={adWallBtnText}
                    onChange={(e) => setAdWallBtnText(e.target.value)}
                    required
                    placeholder="Unlock Video (Watch Ads to Play)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Text displayed on the action button before click.
                  </p>
                </div>

                {/* Save Button & Feedback */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Ad Wall Settings</span>
                  </button>

                  {savedAdWallSuccess && (
                    <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-4 h-4" /> Saved Successfully!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB: ADSTERRA ADS ENGINE (5x MULTIPLIER & CONTINUOUS EXECUTION) */}
          {activeTab === 'adsterra' && (
            <div className="max-w-2xl space-y-5">
              
              {/* Feature Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                  <Sliders className="w-4 h-4" />
                  <span>Adsterra Ads Engine — Multiplier & Continuous মোড</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  ১. <strong>Multi-Script Multiplier Injection:</strong> অ্যাডমিন থেকে যত Multiplier সেট করবেন (যেমন: {adsterraMultiplier}x), সাইটে সমান্তরালে {adsterraMultiplier}টি ইনস্ট্যান্স ইনজেক্ট হবে।<br/>
                  ২. <strong>Continuous Execution (কখনো অফ হবে না):</strong> ৫ বার বা তার বেশি ট্রানজেকশনের পরও অ্যাড বন্ধ হবে না। ব্যবহারকারী হোমপেজ বা ভিডিও পেজের যেকোনো জায়গায় ক্লিক করলেই আজীবন অবিরাম পপআন্ডার ট্রিগার হবে।<br/>
                  ৩. <strong>Placement & Real-time Sync:</strong> ফায়ারবেস Firestore-এর সাথে রিয়েল-টাইম সিঙ্ক।
                </p>
              </div>

              <form onSubmit={handleSaveAdsterraSettings} className="space-y-4">
                
                {/* 1. Engine Master Switch */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <label htmlFor="adsterraEnableToggle" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer block">
                      Enable Adsterra Ads Engine (বিজ্ঞাপন ইঞ্জিন সক্রিয় করুন)
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Master toggle to turn Adsterra monetization on or off site-wide.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="adsterraEnableToggle"
                    checked={adsterraEnabled}
                    onChange={(e) => setAdsterraEnabled(e.target.checked)}
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                {/* 2. Multiplier Setting (Multi-Script Multiplier Injection) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-900 dark:text-white block">
                        Multi-Script Multiplier ({adsterraMultiplier}x Instances)
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        একই সাথে সমান্তরালে সাইটে কতটি স্ক্রিপ্ট ইনস্ট্যান্স ইনজেক্ট হবে (ডিফল্ট: ৫x)।
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-sm shadow-sm">
                      {adsterraMultiplier}x
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={adsterraMultiplier}
                      onChange={(e) => setAdsterraMultiplier(Number(e.target.value))}
                      className="flex-1 accent-amber-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 5, 8, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAdsterraMultiplier(num)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                            adsterraMultiplier === num
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          {num}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Continuous Execution Mode Switch */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <label htmlFor="adsterraContinuousToggle" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer block">
                      Continuous Execution Mode (অবিরাম মোড - কখনো বন্ধ হবে না)
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      ব্যবহারকারী সাইটের যেকোনো জায়গায় ক্লিক করলে আজীবন অবিরাম পপআন্ডার/সোশ্যাল বার চলতে থাকবে।
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="adsterraContinuousToggle"
                    checked={adsterraContinuous}
                    onChange={(e) => setAdsterraContinuous(e.target.checked)}
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                {/* 4. Placement Selector (Homepage, Video Page, or Both) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Placement (কোন কোন পেজে চলবে)
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    হোমপেজ, ভিডিও প্লেয়ার পেজ নাকি উভয় পেজেই চলবে সিলেক্ট করুন।
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdsterraPlacement('both')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        adsterraPlacement === 'both'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      🌟 Both (উভয় পেজে)
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdsterraPlacement('homepage')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        adsterraPlacement === 'homepage'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      🏠 Homepage Only
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdsterraPlacement('video_page')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        adsterraPlacement === 'video_page'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      🎬 Video Page Only
                    </button>
                  </div>
                </div>

                {/* 5. Adsterra Script Code / Popunder Tag */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Adsterra Script Code / Popunder Tag (স্ক্রিপ্ট কোড বা URL)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAdsterraScript('//pl25910243.highratecpm.com/a4/09/b3/a409b300f2e0e5d17bb66487779f76a5.js')}
                        className="text-[10px] text-amber-500 hover:underline"
                      >
                        Reset High CPM Script
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={adsterraScript}
                    onChange={(e) => setAdsterraScript(e.target.value)}
                    placeholder="//pl25910243.highratecpm.com/a4/09/b3/a409b300f2e0e5d17bb66487779f76a5.js or <script ...></script>"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Paste your Adsterra Popunder, Social Bar, or In-Page Push script tag or JS link.
                  </p>
                </div>

                {/* 6. Adsterra Direct Link / Monetization URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Adsterra Direct Link (বিকল্প ডিরেক্ট লিংক)
                  </label>
                  <input
                    type="url"
                    value={adsterraDirectLink}
                    onChange={(e) => setAdsterraDirectLink(e.target.value)}
                    placeholder="https://www.highperformanceformat.com/... or direct link"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Optional fallback Smart Direct Link for maximum CPM monetization.
                  </p>
                </div>

                {/* Submit Buttons & Real-time Confirmation */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Adsterra Engine Settings</span>
                  </button>

                  {savedAdsterraSuccess && (
                    <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-4 h-4" /> Real-time Saved to Firestore!
                    </span>
                  )}
                </div>

              </form>
            </div>
          )}

          {/* TAB 4: STANDALONE ADMIN PROMPT FOR FUTURE USE */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Standalone Dedicated Admin Panel Prompt (একদম আলাদা অ্যাডমিন প্যানেল প্রম্পট)</span>
                </div>
                আপনি যেমন চেয়েছিলেন, পরবর্তীতে আপনি এই সম্পূর্ণ প্রম্পটটি কপি করে নতুন একটি অ্যাপলেট প্রজেক্টে পেস্ট করলেই হুবহু একই ফায়ারবেস ডেটাবেস কানেক্টেড একটি সম্পূর্ণ আলাদা স্বতন্ত্র অ্যাডমিন প্যানেল তৈরি হয়ে যাবে!
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto max-h-80 border border-slate-800 select-all">
                  {standaloneAdminPrompt}
                </pre>

                <button
                  onClick={handleCopyPrompt}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copied to Clipboard!' : 'Copy Full Prompt'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  How Both Sites Connect via Firebase:
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Both applications read and write from the same collections: <strong>&apos;videos&apos;</strong>, <strong>&apos;banners&apos;</strong>, and <strong>&apos;settings&apos;</strong>. When you upload a video in the admin panel, it instantly appears in the user panel in real time!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all videos, banners, and settings to original demo state?')) {
                        store.resetToDefaults();
                        alert('Reset to defaults complete!');
                      }
                    }}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Data to Factory Demo State</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer bar */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 text-xs text-slate-400">
          <span>StreamPulse Admin Management Mode</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors"
          >
            Return to User Panel Site
          </button>
        </div>

      </div>

      {/* --- ADD / EDIT VIDEO MODAL --- */}
      {showVideoModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {isEditingVideo ? 'Edit Video Details' : 'Upload / Add New Video'}
              </h3>
              <button
                onClick={resetVideoForm}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-3.5">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cyber Heist 2026 - Episode 1"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Duration & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Corner Minute) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 14:25 or 24:10"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={videoCategory}
                    onChange={(e) => setVideoCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {categories.filter(c => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Direct Link (10 sec redirect destination) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Direct Stream Link (10 Sec por je link a jabe) *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://example.com/video-stream or https://commondatastorage.googleapis.com/..."
                    value={videoDirectLink}
                    onChange={(e) => setVideoDirectLink(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  When a user clicks the play button on this video, after a 10s countdown they will be sent to this link.
                </p>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Thumbnail Image Link *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or poster image URL"
                  value={videoThumbnail}
                  onChange={(e) => setVideoThumbnail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />

                {/* Preset image selector for convenience */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Quick Presets:</span>
                  {PRESET_THUMBNAILS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setVideoThumbnail(preset.url)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 hover:text-rose-500"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Thumbnail Preview */}
                {videoThumbnail && (
                  <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden bg-black border border-slate-700">
                    <img
                      src={videoThumbnail}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=700&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span className="absolute bottom-1 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white">
                      Duration: {videoDuration || '10:00'}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Synopsis / Overview (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description about the storyline..."
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={resetVideoForm}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md"
                >
                  {isEditingVideo ? 'Save Changes' : 'Upload Video'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- ADD BANNER MODAL --- */}
      {showBannerModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Add New Banner Slide
              </h3>
              <button
                onClick={() => setShowBannerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blockbuster Release"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Watch in Ultra 4K Quality"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Banner Image URL *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge
                  </label>
                  <input
                    type="text"
                    placeholder="Trending / Top Rated"
                    value={bannerBadge}
                    onChange={(e) => setBannerBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={bannerTargetLink}
                    onChange={(e) => setBannerTargetLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Add Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
