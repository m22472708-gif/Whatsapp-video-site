import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause,
  Eye, 
  Heart, 
  Share2, 
  Clock, 
  MessageSquare, 
  Send, 
  Check, 
  ExternalLink, 
  ThumbsUp,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Lock,
  Unlock,
  Sparkles,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { Video, Comment, AppSettings } from '../types';
import { store } from '../services/store';
import { VideoCard } from './VideoCard';

interface VideoPlayViewProps {
  video: Video;
  onBack: () => void;
  onSelectRelatedVideo: (video: Video) => void;
  allVideos: Video[];
  telegramUrl?: string;
}

export const VideoPlayView: React.FC<VideoPlayViewProps> = ({
  video,
  onBack,
  onSelectRelatedVideo,
  allVideos,
  telegramUrl = 'https://t.me/streampulse_official',
}) => {
  // Real-time state
  const [currentVideo, setCurrentVideo] = useState<Video>(video);
  const [isLiked, setIsLiked] = useState<boolean>(store.isVideoLiked(video.id));
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  // Settings from Firestore doc "settings/general"
  const [settings, setSettings] = useState<AppSettings>(store.getSettings());

  // Refs
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const unlockButtonRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const hasIncrementedRef = useRef(false);

  // Unlock Ad Wall Configurations
  const unlockAdEnabled = settings.unlockAdEnabled !== false;
  const unlockAdUrl = settings.unlockAdUrl && settings.unlockAdUrl.trim() !== '' 
    ? settings.unlockAdUrl.trim() 
    : (settings.telegramChannelUrl || 'https://t.me/streampulse_official');
  const unlockAdRequiredClicks = Math.max(1, Number(settings.unlockAdRequiredClicks) || 2);
  const unlockAdWaitSeconds = Math.max(1, Number(settings.unlockAdWaitSeconds) || 10);
  const unlockAdButtonText = settings.unlockAdButtonText && settings.unlockAdButtonText.trim() !== ''
    ? settings.unlockAdButtonText.trim()
    : 'Unlock Video (Watch Ads to Play)';

  // Completed Ad Clicks & Countdown State (Always start locked on video load so unlock button is always visible)
  const [completedClicks, setCompletedClicks] = useState<number>(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [showUnlockSuccess, setShowUnlockSuccess] = useState(false);
  const [highlightUnlockBtn, setHighlightUnlockBtn] = useState(false);

  // Determine lock state
  const isUnlocked = !unlockAdEnabled || completedClicks >= unlockAdRequiredClicks;

  // Smooth scroll to unlock button in title box & highlight it
  const scrollToUnlock = () => {
    if (unlockButtonRef.current) {
      unlockButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightUnlockBtn(true);
      setTimeout(() => setHighlightUnlockBtn(false), 2500);
    }
  };

  // Reset lock (allows testing anytime)
  const handleResetLock = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedClicks(0);
    setIsLoadingStream(false);
    setShowUnlockSuccess(false);
    scrollToUnlock();
  };

  // Player State
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [redirectTriggered, setRedirectTriggered] = useState(false);

  // Reset & setup per video ID
  useEffect(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    setIsCountingDown(false);
    setSecondsRemaining(0);
    setShowUnlockSuccess(false);

    let savedClicks = 0;
    try {
      const saved = sessionStorage.getItem(`streampulse_ad_clicks_${video.id}`);
      savedClicks = saved ? Number(saved) || 0 : 0;
    } catch {}
    setCompletedClicks(savedClicks);

    if (!hasIncrementedRef.current) {
      hasIncrementedRef.current = true;
      store.incrementViews(video.id);
    }
    const updated = store.getVideo(video.id);
    if (updated) {
      setCurrentVideo(updated);
    }
    setComments(store.getComments(video.id));
    setIsLiked(store.isVideoLiked(video.id));
    setIsLoadingStream(false);
    setRedirectTriggered(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [video.id]);

  // Subscribe to real-time store updates (views, comments, likes, settings)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const updated = store.getVideo(currentVideo.id);
      if (updated) {
        setCurrentVideo({ ...updated });
      }
      setIsLiked(store.isVideoLiked(currentVideo.id));
      setComments(store.getComments(currentVideo.id));
      setSettings(store.getSettings());
    });
    return () => unsubscribe();
  }, [currentVideo.id]);

  // Handle authentic video buffering loading without showing any seconds
  useEffect(() => {
    if (!isLoadingStream) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Buffering time (~5 seconds) before opening stream
    timerRef.current = setTimeout(() => {
      handleExecuteRedirect();
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoadingStream]);

  const handleStartPlay = () => {
    if (!isUnlocked) {
      scrollToUnlock();
      return;
    }
    setIsLoadingStream(true);
    setRedirectTriggered(false);
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUnlocked) {
      scrollToUnlock();
      return;
    }
    if (isLoadingStream) {
      setIsLoadingStream(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      handleStartPlay();
    }
  };

  const handleExecuteRedirect = () => {
    setRedirectTriggered(true);
    const targetUrl = currentVideo.directLink || 'https://www.youtube.com';
    
    try {
      const win = window.open(targetUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = targetUrl;
      }
    } catch {
      window.location.href = targetUrl;
    }
  };

  // Flow: Handle Click on Unlock Video Button
  const handleUnlockButtonClick = () => {
    if (isCountingDown || isUnlocked) return;

    // a) Open unlockAdUrl in a new browser tab using window.open(unlockAdUrl, '_blank')
    try {
      window.open(unlockAdUrl, '_blank');
    } catch (e) {
      console.warn('Ad link window.open error:', e);
    }

    // b) Start a countdown timer for unlockAdWaitSeconds
    setIsCountingDown(true);
    setSecondsRemaining(unlockAdWaitSeconds);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    let currentSec = unlockAdWaitSeconds;
    countdownTimerRef.current = setInterval(() => {
      currentSec -= 1;
      if (currentSec > 0) {
        setSecondsRemaining(currentSec);
      } else {
        // Countdown reached 0
        clearInterval(countdownTimerRef.current);
        setIsCountingDown(false);
        setSecondsRemaining(0);

        // d) When countdown reaches 0, increment completedClicks by 1
        setCompletedClicks((prev) => {
          const next = prev + 1;

          // 4. Video Unlock & Auto-Scroll when completedClicks >= unlockAdRequiredClicks
          if (next >= unlockAdRequiredClicks) {
            setShowUnlockSuccess(true);

            // b) Smoothly scroll the window/view directly back to the top of the video player
            setTimeout(() => {
              videoPlayerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 150);

            // c) Automatically start playing the video
            setTimeout(() => {
              setIsLoadingStream(true);
              setRedirectTriggered(false);
            }, 600);

            setTimeout(() => {
              setShowUnlockSuccess(false);
            }, 8000);
          }

          return next;
        });
      }
    }, 1000);
  };

  const handleLikeToggle = () => {
    const res = store.toggleLike(currentVideo.id);
    setIsLiked(res.liked);
    setCurrentVideo((prev) => ({ ...prev, likes: res.likes }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const author = commentName.trim() || 'Viewer #' + Math.floor(Math.random() * 9000 + 1000);
    store.addComment(currentVideo.id, author, commentText.trim());
    setCommentText('');
  };

  const handleLikeComment = (commentId: string) => {
    store.likeComment(commentId);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentVideo.title,
        text: `Watch ${currentVideo.title} in HD`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Related videos
  const relatedVideos = allVideos
    .filter((v) => v.id !== currentVideo.id)
    .slice(0, 6);

  const fallbackThumbnail = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=700&auto=format&fit=crop&q=80';
  const currentThumbnail = (currentVideo.thumbnailUrl && currentVideo.thumbnailUrl.trim() !== '') ? currentVideo.thumbnailUrl : fallbackThumbnail;

  const progressPct = Math.min(100, Math.round((completedClicks / unlockAdRequiredClicks) * 100));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Top Breadcrumb / Back Button */}
      <div className="mb-3 sm:mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors py-1.5 px-2 -ml-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Videos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left 2 Columns: Video Player View & Comments */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Main Cinematic Video Player Card with Full Player Layer */}
          <div 
            ref={videoPlayerRef}
            onClick={handleStartPlay}
            className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-800 cursor-pointer group select-none scroll-mt-20"
          >
            
            {/* Video Canvas Container */}
            <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center bg-black">
              <img
                src={currentThumbnail}
                alt={currentVideo.title || 'Video'}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isLoadingStream ? 'opacity-50 blur-xs' : 'opacity-85 group-hover:scale-102'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

              {/* Video Player Lock State: Clean Overlay */}
              {!isUnlocked && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToUnlock();
                  }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-all cursor-pointer select-none group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 border border-white/20 transform group-hover:scale-105 active:scale-95 transition-transform duration-200">
                    <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>

                  <h3 className="mt-3 text-sm sm:text-base font-black text-white text-center tracking-tight drop-shadow-md">
                    🔒 Video Locked — Click to Unlock
                  </h3>

                  <span className="mt-1 text-xs text-amber-300 font-semibold underline underline-offset-4 animate-bounce">
                    Click to go to Unlock button below ↓
                  </span>
                </div>
              )}

              {/* Center Play / Authentic Buffering Spinner (When Unlocked) */}
              {isUnlocked && (
                isLoadingStream ? (
                  /* Authentic Media Buffering Ring Loader */
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-[3.5px] border-white/20 border-t-rose-500 animate-spin" />
                    </div>
                  </div>
                ) : (
                  /* Ready State: Big Glowing Play Button */
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 transform group-hover:scale-110 active:scale-95 transition-all duration-300">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                    </div>
                  </div>
                )
              )}

              {/* If Redirect was triggered, discreet fallback banner */}
              {redirectTriggered && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="absolute top-4 inset-x-4 mx-auto max-w-sm z-30 p-2.5 rounded-xl bg-slate-900/95 border border-rose-500/50 backdrop-blur-md shadow-xl text-center animate-in fade-in"
                >
                  <a
                    href={currentVideo.directLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:underline"
                  >
                    <span>Click here to open direct stream</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Authentic Video Player Layer */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 sm:p-4 z-20 flex flex-col gap-2"
              >
                
                {/* Scrub Progress Bar Layer */}
                <div className="relative w-full h-1.5 bg-white/25 hover:h-2 rounded-full overflow-hidden transition-all cursor-pointer">
                  <div className="absolute left-0 top-0 bottom-0 w-3/5 bg-white/40" />
                  <div 
                    className={`absolute left-0 top-0 bottom-0 bg-rose-600 transition-all ${
                      isLoadingStream ? 'w-1/4 animate-pulse' : 'w-0'
                    }`} 
                  />
                </div>

                {/* Player Controls Toolbar Layer */}
                <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                  
                  {/* Left Controls: Play/Pause, Volume, Time */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTogglePlay}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                      title={!isUnlocked ? "Unlock Required" : (isLoadingStream ? "Pause" : "Play")}
                    >
                      {!isUnlocked ? (
                        <Lock className="w-4 h-4 text-amber-400" />
                      ) : isLoadingStream ? (
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                      )}
                    </button>

                    {/* Volume Toggle */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>

                    {/* Time Display */}
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-300 font-medium">
                      <span>0:00</span>
                      <span>/</span>
                      <span>{currentVideo.duration}</span>
                    </div>
                  </div>

                  {/* Right Controls: HD Badge, Settings, Fullscreen */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold tracking-wider">
                      HD 1080P
                    </span>

                    <button 
                      onClick={handleStartPlay}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors hidden sm:inline-flex"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={handleStartPlay}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Fullscreen"
                    >
                      <Maximize className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>


          {/* Video Metadata & Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            
            {/* Title */}
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
              {currentVideo.title}
            </h1>

            {/* Clean Unlock Button in Title Box without clutter */}
            <div 
              ref={unlockButtonRef} 
              className={`mt-4 scroll-mt-28 transition-all duration-300 ${
                highlightUnlockBtn ? 'ring-4 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900 rounded-2xl scale-[1.02]' : ''
              }`}
            >
              {!isUnlocked ? (
                <button
                  onClick={handleUnlockButtonClick}
                  disabled={isCountingDown}
                  className={`w-full py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2.5 transition-all duration-300 ${
                    isCountingDown
                      ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-300 cursor-not-allowed animate-pulse shadow-amber-500/20'
                      : 'bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-rose-600/40 hover:shadow-rose-600/60 hover:scale-[1.01] active:scale-[0.99] border border-white/20'
                  }`}
                >
                  {isCountingDown ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-amber-400 shrink-0" />
                      <span className="truncate">
                        ⏳ Please wait {secondsRemaining}s... ({completedClicks + 1}/{unlockAdRequiredClicks})
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 shrink-0" />
                      <span className="truncate">
                        🔓 {unlockAdButtonText} {unlockAdRequiredClicks > 1 ? `(${completedClicks + 1}/${unlockAdRequiredClicks})` : ''}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 rounded-xl sm:rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>🎉 Video Unlocked! Ready to Play</span>
                    </div>
                    <button 
                      onClick={handleStartPlay}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play Now</span>
                    </button>
                  </div>
                  <button
                    onClick={handleResetLock}
                    title="Relock to test unlock flow again"
                    className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Lock className="w-4 h-4" />
                    <span className="hidden sm:inline">Test Relock</span>
                  </button>
                </div>
              )}
            </div>

            {/* Description Display */}
            {currentVideo.description && currentVideo.description.trim() !== '' && (
              <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {currentVideo.description}
              </div>
            )}

            {/* Real-time Stats & Action Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              
              {/* Real-time Views */}
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold text-sm">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-500">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
                    {formatViews(currentVideo.views)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">Real-time Views</div>
                </div>
              </div>

              {/* Action Buttons: Like, Share */}
              <div className="flex items-center gap-2">
                
                {/* Like Button */}
                <button
                  onClick={handleLikeToggle}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all transform active:scale-95 ${
                    isLiked
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                  <span>{formatViews(currentVideo.likes)}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-500">Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Telegram Channel Join Call-To-Action */}
            {telegramUrl && (
              <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-transparent border border-sky-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#24A1DE] flex items-center justify-center text-white shrink-0 shadow-md shadow-sky-500/30">
                    <Send className="w-5 h-5 ml-0.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Join Our Official Telegram Channel
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Get daily direct HD video links & movie requests first!
                    </p>
                  </div>
                </div>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#24A1DE] hover:bg-[#1d93ce] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/25 transition-all transform active:scale-95 shrink-0"
                >
                  <span>Join Telegram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

          </div>

          {/* Real-time Comments Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-500" />
                <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  Comments
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                  {comments.length}
                </span>
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="Join the discussion... Share your thoughts about this movie!"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3.5 pt-2">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
                  No comments yet. Be the first to comment on this video!
                </div>
              ) : (
                comments.map((comment) => (
                  <div 
                    key={comment.id}
                    className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${comment.avatarColor} text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs`}>
                          {comment.authorName.charAt(0)}
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-200">
                          {comment.authorName}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatTimeAgo(comment.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 pl-9">
                      {comment.text}
                    </p>

                    <div className="pl-9 pt-1 flex items-center gap-3">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{comment.likes > 0 ? comment.likes : 'Like'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

        {/* Right 1 Column: Up Next / Recommended Videos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Related & Up Next</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold">
                {relatedVideos.length}
              </span>
            </h3>
          </div>

          <div className="space-y-3">
            {relatedVideos.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-400">
                No related videos available.
              </div>
            ) : (
              relatedVideos.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelectRelatedVideo(item)}
                  className="cursor-pointer group flex items-start gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                >
                  <div className="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-black shrink-0 shadow-sm">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[10px] text-white font-bold">
                      {item.duration}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 py-0.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="truncate">{item.category}</span>
                      <span>•</span>
                      <span>{formatViews(item.views)} views</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
