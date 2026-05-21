/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useVideo } from "../context/VideoContext";
import { 
  ShieldAlert, 
  Check, 
  X, 
  Trash2, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle,
  FolderLock,
  Tv,
  Eye,
  Heart
} from "lucide-react";

interface AdminPanelProps {
  onSelectVideo: (v: any) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSelectVideo }) => {
  const { user } = useAuth();
  const { videos, approveVideo, deleteVideo, language } = useVideo();

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400 space-y-4 font-mono text-xs">
        <FolderLock className="w-12 h-12 text-pink-500 mx-auto" />
        <p>Access Blacklisted. This control space is reserved for Administrator clearance nodes only.</p>
        <p className="text-[10px] text-gray-500">Go to your UserProfile dropdown menu and switch your active role to "admin" to unlock.</p>
      </div>
    );
  }

  // Segment streams by pending state vs. approved library catalog
  const pendingVideos = videos.filter(v => !v.approved);
  const activeCatalog = videos.filter(v => v.approved);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-8 animate-fade-in text-gray-200">
      
      {/* Overview Node Description */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-pink-500" />
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">Administrative Moderation Centre</h1>
        </div>
        <p className="text-xs text-gray-400">
          Authorize creator uploads, moderate pending copyright complaints, and purge videos violating StreamNexus content guidelines.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center font-mono space-y-1">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PENDING QUEUE SIZE</p>
          <p className="text-xl font-black text-white">{pendingVideos.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center font-mono space-y-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">APPROVED LIBRARY</p>
          <p className="text-xl font-black text-white">{activeCatalog.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center font-mono space-y-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ADMIN PRIVILEGE STATUS</p>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">ROOT_VERIFIED</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Moderation Queue */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 font-mono">
            <AlertTriangle className="w-4.5 h-4.5 text-yellow-500" />
            <h3 className="text-xs font-bold uppercase text-gray-300 tracking-wider">Pending Approvals Queue ({pendingVideos.length})</h3>
          </div>

          <div className="space-y-3">
            {pendingVideos.length === 0 ? (
              <div className="p-10 border border-dashed border-white/10 rounded-2xl text-center text-xs text-gray-500 font-sans italic">
                Moderation cleared. No pending videos are awaiting review.
              </div>
            ) : (
              pendingVideos.map((vid) => (
                <div 
                  key={vid.id}
                  className="p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl flex gap-3.5 items-center justify-between transition-all"
                >
                  <div 
                    onClick={() => onSelectVideo(vid)}
                    className="flex gap-3 hover:opacity-85 cursor-pointer max-w-[65%]"
                  >
                    <img 
                      src={vid.thumbnailUrl} 
                      alt="" 
                      className="w-16 aspect-video object-cover rounded-lg bg-gray-950"
                    />
                    <div className="min-w-0 py-0.5 space-y-1">
                      <h4 className="text-xs font-bold text-gray-200 truncate">{vid.title}</h4>
                      <p className="text-[9px] text-gray-500 font-mono">By {vid.creatorName}</p>
                      <span className="inline-block px-1 rounded bg-yellow-500/10 text-[8px] font-bold text-yellow-500 font-mono">PENDING APPROVAL</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Approve check trigger */}
                    <button
                      onClick={() => approveVideo(vid.id, true)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                      title="Approve Film"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    {/* Reject trigger */}
                    <button
                      onClick={() => approveVideo(vid.id, false)}
                      className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-600 hover:text-white transition-all cursor-pointer"
                      title="Reject & Flag Film"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* Hard purge */}
                    <button
                      onClick={() => deleteVideo(vid.id)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Purge Video Node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active catalog overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 font-mono">
            <Tv className="w-4.5 h-4.5 text-purple-400" />
            <h3 className="text-xs font-bold uppercase text-gray-350 tracking-wider">Active Stream Catalog ({activeCatalog.length})</h3>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {activeCatalog.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">
                Streaming catalog is empty.
              </div>
            ) : (
              activeCatalog.map((vid) => (
                <div 
                  key={vid.id}
                  className="p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl flex gap-3.5 items-center justify-between transition-all"
                >
                  <div 
                    onClick={() => onSelectVideo(vid)}
                    className="flex gap-3 hover:opacity-85 cursor-pointer max-w-[70%]"
                  >
                    <img 
                      src={vid.thumbnailUrl} 
                      alt="" 
                      className="w-14 aspect-video object-cover rounded-lg bg-gray-950"
                    />
                    <div className="min-w-0 py-0.5 space-y-0.5">
                      <h4 className="text-[11px] font-bold text-gray-300 truncate">{vid.title}</h4>
                      <p className="text-[9px] text-gray-500 font-mono">Publisher: {vid.creatorName}</p>
                      
                      {vid.isPremium && (
                        <span className="inline-block px-1 rounded bg-pink-500/10 text-[8px] font-bold text-pink-400 font-mono">PREMIUM TIER</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-gray-500 font-bold shrink-0">
                    <span className="flex items-center gap-0.5 text-purple-400">
                      <Eye className="w-3 h-3" />
                      <span>{vid.views}</span>
                    </span>
                    <button 
                      onClick={() => approveVideo(vid.id, false)}
                      className="text-[9px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded uppercase hover:bg-yellow-500 hover:text-gray-950 cursor-pointer"
                      title="Flag & Revoke video active clearance"
                    >
                      Flag Content
                    </button>
                    <button 
                      onClick={() => deleteVideo(vid.id)}
                      className="p-1 rounded text-gray-500 hover:text-pink-500 transition-colors cursor-pointer"
                      title="Hard Trash purge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
