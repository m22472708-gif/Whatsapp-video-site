import React, { useState } from 'react';
import { Play, Eye, Clock, Heart, Sparkles } from 'lucide-react';
import { Video } from '../types';
import { store } from '../services/store';

interface VideoCardProps {
  video: Video;
  onSelect: (video: Video) => void;
  isLiked?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect, isLiked: initialLiked }) => {
  const [liked, setLiked] = useState(initialLiked ?? store.isVideoLiked(video.id));
  const [likesCount, setLikesCount] = useState(video.likes);
  const [isLiking, setIsLiking] = useState(false);

  const formatViews = (views: number): string => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiking(true);
    const res = store.toggleLike(video.id);
    setLiked(res.liked);
    setLikesCount(res.likes);
    setTimeout(() => setIsLiking(false), 400);
  };

  const fallbackThumbnail = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=700&auto=format&fit=crop&q=80';
  const thumbnailSrc = (video.thumbnailUrl && video.thumbnailUrl.trim() !== '') ? video.thumbnailUrl : fallbackThumbnail;

  return (
    <div
      onClick={() => onSelect(video)}
      className="group cursor-pointer flex flex-col bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-2xl hover:shadow-rose-600/15 hover:border-rose-500/50 dark:hover:border-rose-500/50 transition-all duration-300 transform hover:-translate-y-1.5 active:scale-[0.98] select-none"
    >
      {/* Cinematic Thumbnail Canvas */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <img
          src={thumbnailSrc}
          alt={video.title || 'Video'}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Top Badges: Category & Quality Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-rose-300 border border-white/10 uppercase tracking-wider">
            {video.category}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-rose-600/90 text-white text-[9px] font-black tracking-widest shadow-xs">
            HD
          </span>
        </div>

        {/* Top-Right Quick Like Button */}
        <button
          onClick={handleLikeClick}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-xl backdrop-blur-md transition-all duration-200 ${
            liked 
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40' 
              : 'bg-black/50 text-white/80 hover:bg-black/75 hover:text-white opacity-0 group-hover:opacity-100'
          } ${isLiking ? 'scale-125' : 'scale-100'}`}
          title={liked ? 'Unlike' : 'Like'}
          aria-label="Like video"
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-white' : ''}`} />
        </button>

        {/* Center Hover Play Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/70 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Corner Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold tracking-wider shadow-md border border-white/10 font-mono">
            <Clock className="w-3 h-3 text-rose-400" />
            <span>{video.duration}</span>
          </div>
        )}
      </div>

      {/* Meta Information */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <h3 className="font-extrabold text-xs sm:text-sm md:text-[15px] text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
          {video.title}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-rose-500" />
            <span>{formatViews(video.views)} views</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Heart className={`w-3 h-3 ${liked ? 'text-rose-500 fill-rose-500' : ''}`} />
            <span>{formatViews(likesCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
