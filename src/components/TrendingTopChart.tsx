import React from 'react';
import { Play, TrendingUp, Eye, Clock } from 'lucide-react';
import { Video } from '../types';

interface TrendingTopChartProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
}

export const TrendingTopChart: React.FC<TrendingTopChartProps> = ({ videos, onSelectVideo }) => {
  if (!videos || videos.length === 0) return null;

  // Take top 5 or 6 videos by views
  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 6);
  if (topVideos.length < 2) return null;

  const formatViews = (views: number): string => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white shadow-md shadow-rose-500/20">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Top Trending Chart
              <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                TOP {topVideos.length}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Most watched videos today
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Shelf */}
      <div className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar">
        {topVideos.map((video, index) => {
          const rank = index + 1;
          const fallbackThumbnail = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=700&auto=format&fit=crop&q=80';
          const thumbnailSrc = video.thumbnailUrl && video.thumbnailUrl.trim() !== '' ? video.thumbnailUrl : fallbackThumbnail;

          return (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="group cursor-pointer flex items-center shrink-0 w-64 sm:w-72 bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-xl hover:shadow-rose-600/15 hover:border-rose-500/50 transition-all duration-300 transform hover:-translate-y-1 select-none"
            >
              {/* Giant Rank Number */}
              <div className="w-14 sm:w-16 h-full bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center shrink-0 border-r border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden">
                <span className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-300 dark:text-slate-700/60 group-hover:text-rose-600 dark:group-hover:text-rose-500 transition-colors font-mono">
                  {rank}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Poster Thumbnail */}
              <div className="relative w-24 sm:w-28 h-28 sm:h-32 shrink-0 bg-slate-950 overflow-hidden">
                <img
                  src={thumbnailSrc}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />
                
                {/* Center Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[9px] font-mono font-bold text-white flex items-center gap-1 border border-white/10">
                    <Clock className="w-2.5 h-2.5 text-rose-400" />
                    <span>{video.duration}</span>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-3 flex flex-col justify-between flex-1 min-w-0 h-28 sm:h-32">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 block truncate">
                    {video.category}
                  </span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug mt-0.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {video.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <Eye className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate">{formatViews(video.views)} views</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
