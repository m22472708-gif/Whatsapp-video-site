import { Video, Banner, Comment, AppSettings } from '../types';

const STORAGE_KEYS = {
  VIDEOS: 'streampulse_videos_v1',
  BANNERS: 'streampulse_banners_v1',
  COMMENTS: 'streampulse_comments_v1',
  SETTINGS: 'streampulse_settings_v1',
  LIKED_VIDEOS: 'streampulse_liked_videos',
  THEME: 'streampulse_theme',
};

export const INITIAL_SETTINGS: AppSettings = {
  telegramChannelUrl: 'https://t.me/streampulse_official',
  telegramPopupTitle: 'Join Our Official Telegram Channel',
  telegramPopupDescription: 'Get daily direct HD movie links, latest web series, exclusive updates & requested videos first!',
  telegramPopupDelaySec: 4,
  telegramPopupEnabled: true,
  siteName: 'StreamPulse',
  siteNotice: '🚀 High-Speed Direct Streaming Servers Active',
};

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'Cyber Heist 2026: The Final Protocol',
    subtitle: 'Exclusive Sci-Fi Thriller | 4K Ultra HD Streaming',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    targetVideoId: 'v1',
    badge: 'Trending Now',
    active: true,
    order: 1,
  },
  {
    id: 'b2',
    title: 'Echoes of Dhaka: Urban Shadows',
    subtitle: 'Award Winning Bangla Action Mystery Series',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80',
    targetVideoId: 'v2',
    badge: 'Top Rated',
    active: true,
    order: 2,
  },
  {
    id: 'b3',
    title: 'Tokyo Velocity: Midnight Drifters',
    subtitle: 'Adrenaline Packed Underground Action',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    targetVideoId: 'v3',
    badge: 'New Release',
    active: true,
    order: 3,
  },
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Cyber Heist 2026 - Episode 1: The Breach',
    duration: '18:45',
    category: 'Web Series',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=700&auto=format&fit=crop&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    views: 45280,
    likes: 3420,
    description: 'In a dystopian mega-city, an elite rogue syndicate attempts to penetrate the quantum core database.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    tags: ['Sci-Fi', 'Cyberpunk', 'Action'],
  },
  {
    id: 'v2',
    title: 'Dhaka Underworld: Operation Red Alert (Bangla)',
    duration: '24:10',
    category: 'Bangla',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=700&auto=format&fit=crop&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    views: 38920,
    likes: 2890,
    description: 'Detective Fahim traces a shadow syndicate pulling strings in the heart of Old Dhaka.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    tags: ['Bangla', 'Mystery', 'Crime'],
  },
  {
    id: 'v3',
    title: 'Tokyo Midnight Highway Drifters 4K',
    duration: '14:20',
    category: 'Action',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&auto=format&fit=crop&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    views: 62100,
    likes: 5410,
    description: 'Modified Japanese twin-turbo monsters battle along the legendary Shuto expressway.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    tags: ['Cars', 'Tokyo', 'Adrenaline'],
  },
  {
    id: 'v4',
    title: 'The Himalayan Secret: Forbidden Valley',
    duration: '32:15',
    category: 'Movies',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&auto=format&fit=crop&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    views: 19400,
    likes: 1650,
    description: 'A team of mountaineers discovers an ancient relic buried deep beneath the permafrost.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    tags: ['Adventure', 'Mountain', 'Mystery'],
  },
  {
    id: 'v5',
    title: 'Shadow Agent: Protocol Zero',
    duration: '21:05',
    category: 'Thriller',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=700&auto=format&fit=crop&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    views: 27800,
    likes: 2190,
    description: 'Disavowed and hunted by his own handlers, an undercover operative must leak the truth before dawn.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    tags: ['Spy', 'Combat', 'Suspense'],
  },
  {
    id: 'v6',
    title: 'Laugh Out Loud: Dhaka Comedy Jam Special',
    duration: '16:50',
    category: 'Comedy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=700&auto=format&fit=crop&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    views: 54300,
    likes: 4780,
    description: 'The funniest standup comedy specials and crowd roast moments from top entertainers.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    tags: ['Comedy', 'Bangla', 'Entertainment'],
  },
  {
    id: 'v7',
    title: 'Demon Realm: Awakening - Official English Dub',
    duration: '23:30',
    category: 'Anime',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=700&auto=format&fit=crop&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    views: 78900,
    likes: 8100,
    description: 'The sealed portal breaks. A young swordsman awakens demonic powers to protect his village.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
    tags: ['Anime', 'Action', 'Supernatural'],
  },
  {
    id: 'v8',
    title: 'Grand Heist 3: Official Trailer 4K',
    duration: '03:15',
    category: 'Trailers',
    thumbnailUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&auto=format&fit=crop&q=80',
    directLink: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    views: 92400,
    likes: 9340,
    description: 'The first official trailer for the blockbuster theatrical release coming this winter.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    tags: ['Trailer', 'Hollywood', 'Teaser'],
  },
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    videoId: 'v1',
    authorName: 'Tanvir Ahmed',
    text: 'Bhai direct link load hoise super fast! Sound o video quality onk valo!',
    timestamp: Date.now() - 1000 * 60 * 18,
    likes: 34,
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 'c2',
    videoId: 'v1',
    authorName: 'Sadia Rahman',
    text: 'Next episode kobe ashbe? Waiting for part 2!',
    timestamp: Date.now() - 1000 * 60 * 55,
    likes: 19,
    avatarColor: 'bg-indigo-500',
  },
  {
    id: 'c3',
    videoId: 'v2',
    authorName: 'Shakil Khan',
    text: 'Bangla series er moddhe ata best! 10 sec por link ta khub shohoje open holo.',
    timestamp: Date.now() - 1000 * 60 * 120,
    likes: 42,
    avatarColor: 'bg-amber-500',
  },
];

// Memory / LocalStorage based Store with event dispatch for reactive real-time updates
type StoreListener = () => void;

class StreamStore {
  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.VIDEOS)) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BANNERS)) {
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(INITIAL_BANNERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Store listener error:', e);
      }
    });
  }

  // --- VIDEOS ---
  public getVideos(): Video[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return raw ? JSON.parse(raw) : INITIAL_VIDEOS;
    } catch {
      return INITIAL_VIDEOS;
    }
  }

  public getVideo(id: string): Video | undefined {
    return this.getVideos().find((v) => v.id === id);
  }

  public addVideo(video: Omit<Video, 'id' | 'views' | 'likes' | 'createdAt'>): Video {
    const videos = this.getVideos();
    const newVideo: Video = {
      ...video,
      id: 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      views: 1,
      likes: 0,
      createdAt: Date.now(),
    };
    videos.unshift(newVideo);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    this.notify();
    return newVideo;
  }

  public updateVideo(id: string, updates: Partial<Video>): boolean {
    const videos = this.getVideos();
    const index = videos.findIndex((v) => v.id === id);
    if (index === -1) return false;

    videos[index] = { ...videos[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    this.notify();
    return true;
  }

  public deleteVideo(id: string): boolean {
    let videos = this.getVideos();
    const initialLen = videos.length;
    videos = videos.filter((v) => v.id !== id);
    if (videos.length === initialLen) return false;

    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    this.notify();
    return true;
  }

  public incrementViews(id: string): number {
    const videos = this.getVideos();
    const video = videos.find((v) => v.id === id);
    if (video) {
      video.views += 1;
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
      this.notify();
      return video.views;
    }
    return 0;
  }

  public toggleLike(id: string): { liked: boolean; likes: number } {
    const likedVideos = this.getLikedVideos();
    const isLiked = likedVideos.includes(id);
    const videos = this.getVideos();
    const video = videos.find((v) => v.id === id);
    let newLikes = video ? video.likes : 0;

    if (isLiked) {
      const updated = likedVideos.filter((vid) => vid !== id);
      localStorage.setItem(STORAGE_KEYS.LIKED_VIDEOS, JSON.stringify(updated));
      if (video && video.likes > 0) {
        video.likes -= 1;
        newLikes = video.likes;
      }
    } else {
      likedVideos.push(id);
      localStorage.setItem(STORAGE_KEYS.LIKED_VIDEOS, JSON.stringify(likedVideos));
      if (video) {
        video.likes += 1;
        newLikes = video.likes;
      }
    }

    if (video) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
      this.notify();
    }

    return { liked: !isLiked, likes: newLikes };
  }

  public isVideoLiked(id: string): boolean {
    return this.getLikedVideos().includes(id);
  }

  private getLikedVideos(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LIKED_VIDEOS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // --- COMMENTS ---
  public getComments(videoId?: string): Comment[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      const all: Comment[] = raw ? JSON.parse(raw) : INITIAL_COMMENTS;
      if (videoId) {
        return all.filter((c) => c.videoId === videoId).sort((a, b) => b.timestamp - a.timestamp);
      }
      return all;
    } catch {
      return INITIAL_COMMENTS;
    }
  }

  public addComment(videoId: string, authorName: string, text: string): Comment {
    const comments = this.getComments();
    const colors = [
      'bg-indigo-500',
      'bg-rose-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-purple-500',
      'bg-blue-500',
      'bg-teal-500',
    ];
    const newComment: Comment = {
      id: 'c_' + Date.now(),
      videoId,
      authorName: authorName.trim() || 'Anonymous Streamer',
      text: text.trim(),
      timestamp: Date.now(),
      likes: 0,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
    };
    comments.unshift(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    this.notify();
    return newComment;
  }

  public likeComment(commentId: string): number {
    const comments = this.getComments();
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      comment.likes += 1;
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
      this.notify();
      return comment.likes;
    }
    return 0;
  }

  // --- BANNERS ---
  public getBanners(): Banner[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BANNERS);
      const all: Banner[] = raw ? JSON.parse(raw) : INITIAL_BANNERS;
      return all.sort((a, b) => a.order - b.order);
    } catch {
      return INITIAL_BANNERS;
    }
  }

  public addBanner(banner: Omit<Banner, 'id' | 'order'>): Banner {
    const banners = this.getBanners();
    const newBanner: Banner = {
      ...banner,
      id: 'b_' + Date.now(),
      order: banners.length + 1,
    };
    banners.push(newBanner);
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    this.notify();
    return newBanner;
  }

  public updateBanner(id: string, updates: Partial<Banner>): boolean {
    const banners = this.getBanners();
    const index = banners.findIndex((b) => b.id === id);
    if (index === -1) return false;

    banners[index] = { ...banners[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    this.notify();
    return true;
  }

  public deleteBanner(id: string): boolean {
    let banners = this.getBanners();
    const initialLen = banners.length;
    banners = banners.filter((b) => b.id !== id);
    if (banners.length === initialLen) return false;

    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    this.notify();
    return true;
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public updateSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- RESET TO DEMO ---
  public resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(INITIAL_BANNERS));
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    this.notify();
  }
}

export const store = new StreamStore();
