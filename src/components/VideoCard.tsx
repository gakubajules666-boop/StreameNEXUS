/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Video } from "../types";
import { useAuth } from "../context/AuthContext";
import { useVideo } from "../context/VideoContext";
import { Play, Heart, Eye, Download, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  onDeleteClick?: (videoId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, onDeleteClick }) => {
  const { user } = useAuth();
  const { toggleFavorite } = useVideo();

  const isFavorited = user?.favorites?.includes(video.id) || false;
  const isPremium = video.isPremium;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(video.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteClick) onDeleteClick(video.id);
  };

  return (
    <div 
      onClick={() => onClick(video)}
      className="group relative flex flex-col rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 shadow-xl overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 backdrop-blur-sm"
    >
      {/* Thumbnail Frame */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-950">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
        />

        {/* Shading overlay mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-85 transition-opacity" />

        {/* Hover Hover play circle */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg text-white transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Duration stamp */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-gray-950/80 border border-white/10 text-[9px] font-bold font-mono tracking-wider text-gray-300">
          {video.duration}
        </span>

        {/* Premium Badge indicator */}
        {isPremium && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-pink-500 text-[8px] font-bold tracking-widest text-white uppercase font-mono shadow-md shadow-pink-500/20">
            PREMIUM
          </span>
        )}

        {/* Moderation approval state tag if pending/rejected */}
        {!video.approved && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-yellow-500/90 text-[8px] font-bold tracking-wide text-gray-950 uppercase font-mono animate-pulse flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{video.status}</span>
          </span>
        )}
      </div>

      {/* Meta details body */}
      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Uploader section */}
          <div className="flex items-center gap-1.5">
            <img 
              src={video.creatorPhoto} 
              alt="Avatar" 
              className="w-4 h-4 rounded-full object-cover border border-purple-500/20"
            />
            <span className="text-[9px] font-medium text-gray-400 capitalize hover:text-purple-300 transition-colors">{video.creatorName}</span>
          </div>

          {/* Title */}
          <h3 className="text-xs font-bold text-gray-200 line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
            {video.title}
          </h3>
        </div>

        {/* Interactive Stats line */}
        <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-[9px] font-mono text-gray-500">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-0.5" title="Views Count">
              <Eye className="w-3 h-3 text-purple-500/60" />
              <span>{video.views >= 1000 ? `${(video.views/1000).toFixed(1)}k` : video.views}</span>
            </span>
            <span className="flex items-center gap-0.5" title="Likes">
              <Heart className="w-3 h-3 text-pink-500/65" />
              <span>{video.likes.length}</span>
            </span>
          </div>

          {/* Favorites heart selector & Administrative triggers */}
          <div className="flex items-center gap-2">
            {user && (
              <button 
                onClick={handleFavoriteClick}
                className={`p-1 rounded hover:bg-gray-800 transition-colors ${
                  isFavorited ? "text-pink-500" : "text-gray-500 hover:text-pink-400"
                }`}
                title="Add to Watchlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-current" : ""}`} />
              </button>
            )}

            {/* Admin Delete trigger */}
            {user?.role === "admin" && onDeleteClick && (
              <button 
                onClick={handleDelete}
                className="p-1 rounded bg-pink-500/15 border border-pink-500/40 hover:bg-pink-600 hover:text-white text-pink-500 transition-all"
                title="Admin Trash Delete"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
