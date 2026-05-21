/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Video } from "../types";
import { Play, Info, Sparkles, Star, Eye, Calendar, Award } from "lucide-react";

interface NetflixHeroProps {
  featuredVideo: Video;
  onPlay: (video: Video) => void;
  onInfo: (video: Video) => void;
  language: string;
}

export const NetflixHero: React.FC<NetflixHeroProps> = ({ 
  featuredVideo, 
  onPlay, 
  onInfo, 
  language 
}) => {
  return (
    <div className="relative w-full h-[65vh] lg:h-[75vh] overflow-hidden bg-black flex items-end">
      {/* Dynamic Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 select-none scale-[1.02]"
        style={{ backgroundImage: `url(${featuredVideo.thumbnailUrl})` }}
      />

      {/* Cinematic Dark Gradient Masks (Netflix Look) */}
      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[#0a0514] via-[#0a0514]/60 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-full md:w-[60%] bg-gradient-to-r from-[#0a0514] to-transparent" />

      {/* Hero Content Panel */}
      <div className="relative z-10 p-8 lg:p-14 max-w-3xl space-y-4">
        {/* Quality Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-bold tracking-widest text-white uppercase shadow-md shadow-purple-500/15">
            <Sparkles className="w-3" />
            <span>AI FEATURED</span>
          </div>
          {featuredVideo.isPremium && (
            <div className="px-2 py-0.5 rounded bg-pink-500 text-[9px] font-bold text-white uppercase font-mono tracking-widest">
              PREMIUM ONLY
            </div>
          )}
          <div className="px-1.5 py-0.5 rounded bg-gray-900 border border-purple-500/30 text-[9px] text-purple-400 font-bold uppercase font-mono tracking-widest">
            {featuredVideo.category}
          </div>
        </div>

        {/* Big Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans drop-shadow-md">
          {featuredVideo.title}
        </h1>

        {/* Stars and analytical metadata info */}
        <div className="flex items-center gap-4 text-xs text-gray-300 font-mono">
          <div className="flex items-center gap-0.5 text-amber-500 font-bold">
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-transparent text-amber-500" />
            <span className="text-white ml-1">4.8</span>
          </div>

          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>{featuredVideo.views.toLocaleString()} {language === "en" ? "views" : "vistas"}</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>2026</span>
          </div>
        </div>

        {/* Narrative Description summary */}
        <p className="text-xs md:text-sm text-gray-300 lead-relaxed line-clamp-3 md:line-clamp-4">
          {featuredVideo.description}
        </p>

        {/* Direct Action triggers */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Stream Action Button */}
          <button 
            onClick={() => onPlay(featuredVideo)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-purple-100 text-gray-950 font-bold text-xs tracking-wide shadow-2xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-4.5 h-4.5 fill-current" />
            <span>{language === "en" ? "Stream Now" : "Ver Ahora"}</span>
          </button>

          {/* Details toggle Button */}
          <button 
            onClick={() => onInfo(featuredVideo)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-200 border border-gray-800 hover:border-purple-500/40 text-xs font-semibold transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Info className="w-4.5 h-4.5" />
            <span>{language === "en" ? "Review Details" : "Detalles"}</span>
          </button>
        </div>

        {/* Creator Attribution info card */}
        <div className="flex items-center gap-2.5 pt-4 border-t border-purple-950/20 max-w-xs select-none">
          <img 
            src={featuredVideo.creatorPhoto} 
            alt="Uploader Avatar" 
            className="w-8 h-8 rounded-full border border-purple-500/30 object-cover"
          />
          <div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold uppercase tracking-wider font-mono">
              <Award className="w-3 h-3 text-purple-400" />
              <span>Publisher</span>
            </div>
            <p className="text-xs font-bold text-gray-300">{featuredVideo.creatorName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
