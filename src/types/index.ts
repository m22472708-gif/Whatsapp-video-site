export interface Video {
  id: string;
  title: string;
  duration: string; // e.g., "12:45"
  category: string;
  thumbnailUrl: string;
  directLink: string; // The URL to redirect to after 10s
  views: number;
  likes: number;
  description?: string;
  createdAt: number; // timestamp
  tags?: string[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  targetVideoId?: string;
  targetLink?: string;
  badge?: string;
  active: boolean;
  order: number;
}

export interface Comment {
  id: string;
  videoId: string;
  authorName: string;
  text: string;
  timestamp: number;
  likes: number;
  avatarColor: string;
}

export interface AppSettings {
  telegramChannelUrl: string;
  telegramPopupTitle: string;
  telegramPopupDescription: string;
  telegramPopupDelaySec: number;
  telegramPopupEnabled: boolean;
  siteName: string;
  siteNotice?: string;
  firebaseConfig?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
}

export type Category = 
  | 'All'
  | 'Movies'
  | 'Web Series'
  | 'Action'
  | 'Drama'
  | 'Bangla'
  | 'Thriller'
  | 'Comedy'
  | 'Anime'
  | 'Trailers';
