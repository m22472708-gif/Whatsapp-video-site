import { Video, Banner, Comment, AppSettings } from '../types';
import { db, rtdb } from './firebase';
import { 
  collection, 
  doc, 
  onSnapshot as onFirestoreSnapshot, 
  getDocs,
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  increment 
} from 'firebase/firestore';
import { 
  ref, 
  onValue as onRtdbValue, 
  get as getRtdb,
  set as setRtdb, 
  update as updateRtdb 
} from 'firebase/database';

const STORAGE_KEYS = {
  VIDEOS: 'streampulse_videos_live',
  BANNERS: 'streampulse_banners_live',
  COMMENTS: 'streampulse_comments_live',
  SETTINGS: 'streampulse_settings_live',
  CATEGORIES: 'streampulse_categories_live',
  LIKED_VIDEOS: 'streampulse_liked_videos',
};

export const INITIAL_SETTINGS: AppSettings = {
  telegramChannelUrl: 'https://t.me/streampulse_official',
  telegramPopupTitle: 'Join Our Official Telegram Channel',
  telegramPopupDescription: 'Get daily direct HD movie links, latest web series, exclusive updates & requested videos first!',
  telegramPopupDelaySec: 4,
  telegramPopupEnabled: true,
  siteName: 'StreamPulse',
  siteNotice: '🚀 High-Speed Direct Streaming Servers Active',
  categories: [],
};

type StoreListener = () => void;

function normalizeVideo(id: string, data: any): Video {
  const title = data.title || data.name || data.videoTitle || data.video_title || 'Untitled Video';
  const duration = data.duration || data.time || data.videoDuration || data.length || '';
  const category = data.category || data.categoryName || data.cat || data.genre || data.type || 'General';
  const directLink = data.directLink || data.link || data.videoUrl || data.streamUrl || data.url || data.video_link || data.source || '';
  const thumbnailUrl = data.thumbnailUrl || data.thumbnail || data.image || data.poster || data.posterUrl || data.imageUrl || data.cover || data.img || '';
  const views = Number(data.views || data.viewCount || data.view_count || 0) || 0;
  const likes = Number(data.likes || data.likeCount || data.like_count || 0) || 0;
  const description = data.description || data.desc || data.details || '';
  const createdAt = Number(data.createdAt || data.timestamp || data.created_at || data.date) || Date.now();
  const tags = Array.isArray(data.tags) ? data.tags : [];

  return {
    id,
    title: String(title).trim(),
    duration: String(duration).trim(),
    category: String(category).trim(),
    thumbnailUrl: String(thumbnailUrl).trim(),
    directLink: String(directLink).trim(),
    views,
    likes,
    description: String(description).trim(),
    createdAt,
    tags,
  };
}

function normalizeBanner(id: string, data: any): Banner {
  const imageUrl = data.imageUrl || data.bannerUrl || data.image || data.url || data.img || data.bannerImage || '';
  const title = data.title || data.name || '';
  const subtitle = data.subtitle || data.desc || '';
  const targetVideoId = data.targetVideoId || data.videoId || '';
  const targetLink = data.targetLink || data.link || data.url || '';
  const badge = data.badge || '';
  const active = data.active !== false;
  const order = Number(data.order || data.priority || 0) || 0;

  return {
    id,
    title: String(title),
    subtitle: String(subtitle),
    imageUrl: String(imageUrl).trim(),
    targetVideoId: String(targetVideoId),
    targetLink: String(targetLink),
    badge: String(badge),
    active,
    order,
  };
}

class StreamStore {
  private listeners: Set<StoreListener> = new Set();
  private videos: Video[] = [];
  private banners: Banner[] = [];
  private categories: string[] = [];
  private settings: AppSettings = INITIAL_SETTINGS;
  private comments: Comment[] = [];

  constructor() {
    this.cleanLegacyData();
    this.loadFromLocal();
    this.initFirebaseListeners();
    this.startActivePolling();
  }

  // Clear any legacy demo mock data
  private cleanLegacyData() {
    try {
      const legacyKeys = [
        'streampulse_videos_v1',
        'streampulse_videos_v2',
        'streampulse_videos_v3',
        'streampulse_banners_v1',
        'streampulse_banners_v2',
        'streampulse_banners_v3',
        'streampulse_demo_purged_v1',
        'streampulse_demo_purged_v2',
        'streampulse_demo_purged_v3',
      ];
      legacyKeys.forEach((k) => {
        try { localStorage.removeItem(k); } catch {}
      });
    } catch {
      // Ignore
    }
  }

  private loadFromLocal() {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      this.videos = v ? JSON.parse(v) : [];
      this.videos = this.videos.filter((item) => item && !item.id.startsWith('demo_') && !['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'].includes(item.id));

      const b = localStorage.getItem(STORAGE_KEYS.BANNERS);
      this.banners = b ? JSON.parse(b) : [];
      this.banners = this.banners.filter((item) => item && !item.id.startsWith('demo_') && !['b1', 'b2', 'b3'].includes(item.id));

      const cat = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      this.categories = cat ? JSON.parse(cat) : [];

      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      this.settings = s ? { ...INITIAL_SETTINGS, ...JSON.parse(s) } : INITIAL_SETTINGS;

      const c = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      this.comments = c ? JSON.parse(c) : [];
    } catch {
      this.videos = [];
      this.banners = [];
      this.categories = [];
      this.settings = INITIAL_SETTINGS;
      this.comments = [];
    }
  }

  private startActivePolling() {
    const fetchAll = async () => {
      await this.fetchFirestoreData();
      await this.fetchRtdbData();
    };

    setTimeout(fetchAll, 800);
    setInterval(fetchAll, 3500);

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', fetchAll);
    }
  }

  private async fetchFirestoreData() {
    try {
      // 1. Fetch Videos collection
      const collectionsToCheck = ['videos', 'Videos'];
      for (const colName of collectionsToCheck) {
        try {
          const snap = await getDocs(collection(db, colName));
          if (!snap.empty) {
            const list: Video[] = [];
            snap.forEach((docSnap) => {
              list.push(normalizeVideo(docSnap.id, docSnap.data()));
            });
            if (list.length > 0) {
              this.mergeVideos(list);
            }
          }
        } catch {}
      }

      // 2. Fetch Banners collection
      try {
        const snap = await getDocs(collection(db, 'banners'));
        if (!snap.empty) {
          const list: Banner[] = [];
          snap.forEach((docSnap) => {
            const b = normalizeBanner(docSnap.id, docSnap.data());
            if (b.imageUrl && b.active) list.push(b);
          });
          list.sort((a, b) => a.order - b.order);
          this.banners = list;
          localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(list));
          this.notify();
        }
      } catch {}

      // 3. Fetch Categories doc ("settings/categories")
      try {
        const catDocSnap = await getDoc(doc(db, 'settings', 'categories'));
        if (catDocSnap.exists()) {
          const data = catDocSnap.data() as any;
          const list = data.list || data.categories || [];
          if (Array.isArray(list)) {
            this.categories = list.filter((c) => typeof c === 'string' && c.trim() !== '');
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
            this.notify();
          }
        } else {
          // Fallback: Check collection 'categories'
          const catColSnap = await getDocs(collection(db, 'categories'));
          if (!catColSnap.empty) {
            const catList: string[] = [];
            catColSnap.forEach((d) => {
              const item = d.data() as any;
              const name = item.name || item.title || d.id;
              if (name && typeof name === 'string' && !catList.includes(name.trim())) {
                catList.push(name.trim());
              }
            });
            if (catList.length > 0) {
              this.categories = catList;
              localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(catList));
              this.notify();
            }
          }
        }
      } catch {}

      // 4. Fetch Settings doc ("settings/general")
      try {
        const setSnap = await getDoc(doc(db, 'settings', 'general'));
        if (setSnap.exists()) {
          const data = setSnap.data() as any;
          this.settings = { ...this.settings, ...data };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
          this.notify();
        }
      } catch {}

    } catch (err) {
      console.warn('Direct Firestore fetch:', err);
    }
  }

  private async fetchRtdbData() {
    try {
      const snap = await getRtdb(ref(rtdb, 'videos'));
      const val = snap.val();
      if (val) {
        const list: Video[] = [];
        if (Array.isArray(val)) {
          val.filter(Boolean).forEach((item, idx) => {
            list.push(normalizeVideo(item.id || `v_${idx}`, item));
          });
        } else if (typeof val === 'object') {
          Object.keys(val).forEach((k) => {
            if (val[k]) list.push(normalizeVideo(val[k].id || k, val[k]));
          });
        }
        if (list.length > 0) {
          this.mergeVideos(list);
        }
      }
    } catch {}
  }

  private mergeVideos(newVideos: Video[]) {
    const map = new Map<string, Video>();
    newVideos.forEach((v) => map.set(v.id, v));

    const merged = Array.from(map.values());
    merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    this.videos = merged;
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(merged));
    this.notify();
  }

  // --- FIREBASE REAL-TIME LISTENERS ---
  private initFirebaseListeners() {
    // 1. FIRESTORE REAL-TIME SNAPSHOT LISTENERS
    try {
      // Videos Collection
      onFirestoreSnapshot(collection(db, 'videos'), (snapshot) => {
        const list: Video[] = [];
        snapshot.forEach((docSnap) => {
          list.push(normalizeVideo(docSnap.id, docSnap.data()));
        });
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        this.videos = list;
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(list));
        this.notify();
      }, (err) => {
        console.warn('Firestore videos listener:', err.message);
      });

      // Banners Collection
      onFirestoreSnapshot(collection(db, 'banners'), (snapshot) => {
        const list: Banner[] = [];
        snapshot.forEach((docSnap) => {
          const b = normalizeBanner(docSnap.id, docSnap.data());
          if (b.imageUrl && b.active) list.push(b);
        });
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        this.banners = list;
        localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(list));
        this.notify();
      }, (err) => {
        console.warn('Firestore banners listener:', err.message);
      });

      // Dynamic Categories Doc: "settings/categories"
      onFirestoreSnapshot(doc(db, 'settings', 'categories'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          const list = data.list || data.categories || [];
          if (Array.isArray(list)) {
            this.categories = list.filter((c) => typeof c === 'string' && c.trim() !== '');
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
            this.notify();
          }
        }
      }, (err) => {
        console.warn('Firestore settings/categories listener:', err.message);
      });

      // Dynamic Categories Collection fallback: "categories"
      onFirestoreSnapshot(collection(db, 'categories'), (snapshot) => {
        const list: string[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const name = data.name || data.title || docSnap.id;
          if (name && typeof name === 'string' && !list.includes(name.trim())) {
            list.push(name.trim());
          }
        });
        if (list.length > 0) {
          this.categories = Array.from(new Set([...this.categories, ...list]));
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
          this.notify();
        }
      }, (err) => {
        console.warn('Firestore categories listener:', err.message);
      });

      // Settings General Doc: "settings/general"
      onFirestoreSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as AppSettings;
          this.settings = { ...this.settings, ...data };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
          this.notify();
        }
      }, (err) => {
        console.warn('Firestore settings/general listener:', err.message);
      });

      // Comments Collection
      onFirestoreSnapshot(collection(db, 'comments'), (snapshot) => {
        const list: Comment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          list.push({
            id: docSnap.id,
            videoId: data.videoId,
            authorName: data.authorName || 'Viewer',
            text: data.text || '',
            timestamp: Number(data.timestamp) || Date.now(),
            likes: Number(data.likes) || 0,
            avatarColor: data.avatarColor || 'bg-rose-500',
          });
        });
        this.comments = list;
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(list));
        this.notify();
      }, (err) => {
        console.warn('Firestore comments listener:', err.message);
      });

    } catch (e) {
      console.warn('Firestore listener setup error:', e);
    }

    // 2. REALTIME DATABASE LISTENERS
    try {
      onRtdbValue(ref(rtdb, 'videos'), (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list: Video[] = [];
          if (Array.isArray(val)) {
            val.filter(Boolean).forEach((item, idx) => {
              list.push(normalizeVideo(item.id || `v_${idx}`, item));
            });
          } else if (typeof val === 'object') {
            Object.keys(val).forEach((k) => {
              if (val[k]) list.push(normalizeVideo(val[k].id || k, val[k]));
            });
          }
          if (list.length > 0) {
            this.mergeVideos(list);
          }
        }
      });

      onRtdbValue(ref(rtdb, 'banners'), (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list: Banner[] = [];
          if (Array.isArray(val)) {
            val.filter(Boolean).forEach((item, idx) => {
              const b = normalizeBanner(item.id || `b_${idx}`, item);
              if (b.imageUrl && b.active) list.push(b);
            });
          } else if (typeof val === 'object') {
            Object.keys(val).forEach((k) => {
              if (val[k]) {
                const b = normalizeBanner(val[k].id || k, val[k]);
                if (b.imageUrl && b.active) list.push(b);
              }
            });
          }
          if (list.length > 0) {
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            this.banners = list;
            localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(list));
            this.notify();
          }
        }
      });
    } catch (e) {
      console.warn('RTDB listener setup error:', e);
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

  // --- DYNAMIC CATEGORIES ---
  // If Firestore has 0 categories, returns only ['All']
  public getCategories(): string[] {
    const list = new Set<string>();
    list.add('All');

    if (this.categories && this.categories.length > 0) {
      this.categories.forEach((cat) => {
        if (cat && cat.trim()) list.add(cat.trim());
      });
    }

    // Also include any categories present in current active videos
    this.videos.forEach((v) => {
      if (v.category && v.category.trim() && v.category !== 'General') {
        list.add(v.category.trim());
      }
    });

    return Array.from(list);
  }

  // --- VIDEOS ---
  public getVideos(): Video[] {
    return this.videos;
  }

  public getVideo(id: string): Video | undefined {
    return this.videos.find((v) => v.id === id);
  }

  public incrementViews(id: string): number {
    const video = this.videos.find((v) => v.id === id);
    if (video) {
      video.views += 1;
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(this.videos));
      this.notify();

      try {
        updateDoc(doc(db, 'videos', id), {
          views: increment(1)
        }).catch(() => {});
      } catch {}

      return video.views;
    }
    return 0;
  }

  public toggleLike(id: string): { liked: boolean; likes: number } {
    const likedVideos = this.getLikedVideos();
    const isLiked = likedVideos.includes(id);
    const video = this.videos.find((v) => v.id === id);
    let newLikes = video ? video.likes : 0;

    let nextLiked = false;
    if (isLiked) {
      const filtered = likedVideos.filter((vId) => vId !== id);
      localStorage.setItem(STORAGE_KEYS.LIKED_VIDEOS, JSON.stringify(filtered));
      if (video && video.likes > 0) {
        video.likes -= 1;
        newLikes = video.likes;
      }
      nextLiked = false;
      try {
        updateDoc(doc(db, 'videos', id), { likes: increment(-1) }).catch(() => {});
      } catch {}
    } else {
      likedVideos.push(id);
      localStorage.setItem(STORAGE_KEYS.LIKED_VIDEOS, JSON.stringify(likedVideos));
      if (video) {
        video.likes += 1;
        newLikes = video.likes;
      }
      nextLiked = true;
      try {
        updateDoc(doc(db, 'videos', id), { likes: increment(1) }).catch(() => {});
      } catch {}
    }

    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(this.videos));
    this.notify();
    return { liked: nextLiked, likes: newLikes };
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
    if (videoId) {
      return this.comments
        .filter((c) => c.videoId === videoId)
        .sort((a, b) => b.timestamp - a.timestamp);
    }
    return [...this.comments].sort((a, b) => b.timestamp - a.timestamp);
  }

  public async addComment(videoId: string, authorName: string, text: string): Promise<Comment> {
    const avatarColors = [
      'bg-rose-500',
      'bg-blue-500',
      'bg-amber-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-indigo-500',
      'bg-pink-500',
    ];
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const id = 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newComment: Comment = {
      id,
      videoId,
      authorName: authorName.trim() || 'Viewer',
      text: text.trim(),
      timestamp: Date.now(),
      likes: 0,
      avatarColor,
    };

    this.comments.unshift(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(this.comments));
    this.notify();

    try {
      await setDoc(doc(db, 'comments', id), newComment);
    } catch (e) {
      console.warn('Firebase addComment error:', e);
    }

    return newComment;
  }

  public likeComment(commentId: string): number {
    const comment = this.comments.find((c) => c.id === commentId);
    if (comment) {
      comment.likes += 1;
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(this.comments));
      this.notify();

      try {
        updateDoc(doc(db, 'comments', commentId), {
          likes: increment(1)
        }).catch(() => {});
      } catch {}

      return comment.likes;
    }
    return 0;
  }

  // --- BANNERS ---
  public getBanners(): Banner[] {
    return this.banners;
  }

  public async addBanner(banner: Omit<Banner, 'id' | 'order'>): Promise<Banner> {
    const id = 'b_' + Date.now();
    const newBanner: Banner = {
      ...banner,
      id,
      order: this.banners.length + 1,
    };
    this.banners.push(newBanner);
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(this.banners));
    this.notify();

    try {
      await setDoc(doc(db, 'banners', id), newBanner);
      setRtdb(ref(rtdb, `banners/${id}`), newBanner).catch(() => {});
    } catch (e) {
      console.warn('Firebase addBanner error:', e);
    }

    return newBanner;
  }

  public async updateBanner(id: string, updates: Partial<Banner>): Promise<boolean> {
    const index = this.banners.findIndex((b) => b.id === id);
    if (index === -1) return false;

    this.banners[index] = { ...this.banners[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(this.banners));
    this.notify();

    try {
      await updateDoc(doc(db, 'banners', id), updates);
      updateRtdb(ref(rtdb, `banners/${id}`), updates).catch(() => {});
    } catch (e) {
      console.warn('Firebase updateBanner error:', e);
    }

    return true;
  }

  public async deleteBanner(id: string): Promise<boolean> {
    const initialLen = this.banners.length;
    this.banners = this.banners.filter((b) => b.id !== id);
    if (this.banners.length === initialLen) return false;

    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(this.banners));
    this.notify();

    try {
      await deleteDoc(doc(db, 'banners', id));
      setRtdb(ref(rtdb, `banners/${id}`), null).catch(() => {});
    } catch (e) {
      console.warn('Firebase deleteBanner error:', e);
    }

    return true;
  }

  // --- VIDEO MUTATIONS ---
  public async addVideo(video: Omit<Video, 'id' | 'views' | 'likes' | 'createdAt'>): Promise<Video> {
    const id = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newVideo: Video = {
      ...video,
      id,
      views: 0,
      likes: 0,
      createdAt: Date.now(),
    };

    this.videos.unshift(newVideo);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(this.videos));
    this.notify();

    try {
      await setDoc(doc(db, 'videos', id), newVideo);
      setRtdb(ref(rtdb, `videos/${id}`), newVideo).catch(() => {});
    } catch (e) {
      console.warn('Firebase addVideo error:', e);
    }

    return newVideo;
  }

  public async updateVideo(id: string, updates: Partial<Video>): Promise<boolean> {
    const index = this.videos.findIndex((v) => v.id === id);
    if (index === -1) return false;

    this.videos[index] = { ...this.videos[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(this.videos));
    this.notify();

    try {
      await updateDoc(doc(db, 'videos', id), updates);
      updateRtdb(ref(rtdb, `videos/${id}`), updates).catch(() => {});
    } catch (e) {
      console.warn('Firebase updateVideo error:', e);
    }

    return true;
  }

  public async deleteVideo(id: string): Promise<boolean> {
    const initialLen = this.videos.length;
    this.videos = this.videos.filter((v) => v.id !== id);
    if (this.videos.length === initialLen) return false;

    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(this.videos));
    this.notify();

    try {
      await deleteDoc(doc(db, 'videos', id));
      setRtdb(ref(rtdb, `videos/${id}`), null).catch(() => {});
    } catch (e) {
      console.warn('Firebase deleteVideo error:', e);
    }

    return true;
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    return this.settings;
  }

  public async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    this.notify();

    try {
      await setDoc(doc(db, 'settings', 'general'), this.settings, { merge: true });
    } catch (e) {
      console.warn('Firebase updateSettings error:', e);
    }

    return this.settings;
  }

  public resetToDefaults() {
    this.videos = [];
    this.banners = [];
    this.categories = [];
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]));
    this.notify();
  }
}

export const store = new StreamStore();
