/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useVideo } from "../context/VideoContext";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../data";
import { X, Video, Film, Eye, Sparkles, Upload, AlertCircle } from "lucide-react";

interface UploadModalProps {
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose }) => {
  const { uploadVideo } = useVideo();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("vlogs");
  const [isPremium, setIsPremium] = useState(false);
  const [hasAds, setHasAds] = useState(true);
  const [duration, setDuration] = useState("2:45");
  
  // Quick pickers for demo
  const [thumbnailPreset, setThumbnailPreset] = useState("sci-fi");
  const [videoPreset, setVideoPreset] = useState("tears_of_steel");
  const [submitting, setSubmitting] = useState(false);

  const presetThumbnails: Record<string, string> = {
    "vlogs": "https://images.unsplash.com/photo-1542204172-e7052809a86e?auto=format&fit=crop&w=800&q=80",
    "movies": "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    "sci-fi": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80",
    "gaming": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
  };

  const presetVideos: Record<string, string> = {
    "tears_of_steel": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "elephants_dream": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "big_buck_bunny": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "subaru_dirt": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    
    const selectedThumbnail = presetThumbnails[thumbnailPreset] || presetThumbnails["vlogs"];
    const selectedVideo = presetVideos[videoPreset] || presetVideos["tears_of_steel"];

    await uploadVideo({
      title,
      description,
      category,
      isPremium,
      hasAds,
      duration,
      thumbnailUrl: selectedThumbnail,
      videoUrl: selectedVideo,
      qualityOptions: isPremium ? ["4K", "1080p", "720p"] : ["1080p", "720p"]
    });

    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0a0514]/95 border border-white/10 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto backdrop-blur-md">
        
        {/* Close trigger */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header summary info */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-indigo-400 uppercase tracking-wide">
            <Film className="w-4 h-4 text-purple-400" />
            <span>CREATOR CHANNEL UPLOADER</span>
          </div>
          <h2 className="text-lg font-bold text-gray-100">Publish New Cinematic Stream</h2>
          <p className="text-xs text-gray-400">
            Submit video metadata. Content must comply with StreamNexus Copyright and DMCA Guidelines.
          </p>
        </div>

        {/* Verification banner if standard creator */}
        {user?.role !== "admin" && (
          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-500 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              <strong>Moderation Active</strong> Your upload is cataloged as <strong>pending review</strong>. An Administrator can inspect and approve files directly from the Admin Panel.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Title entry */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Movie Title</label>
            <input 
              type="text" 
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sintel: Journey in the desolate lands"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 text-gray-200 font-sans"
            />
          </div>

          {/* Description summary */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Brief Description / Synopsis</label>
            <textarea 
              rows={3}
              required
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summarize the narrative elements, key creative credits, or vlogging walkthrough outlines..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 text-gray-200 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Genre category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-purple-500 font-sans"
              >
                {CATEGORIES.filter(cat => cat.id !== "all").map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#0a0514] text-gray-200">{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Play play length stamp */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Duration (Length)</label>
              <input 
                type="text" 
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 14:12"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 text-gray-200 font-sans"
              />
            </div>
          </div>

          {/* Presets and mockup settings for sandbox speed */}
          <div className="border border-white/10 p-3 rounded-2xl bg-white/5 space-y-3">
            <p className="text-[9px] font-mono font-bold text-purple-400 tracking-wider block">DEMO SIMULATOR PLAYLOADS</p>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Media preset */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-gray-400">Pick Demo Video File</label>
                <select 
                  value={videoPreset}
                  onChange={(e) => setVideoPreset(e.target.value)}
                  className="w-full p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300 font-sans"
                >
                  <option value="tears_of_steel" className="bg-[#0a0514] text-gray-200">Tears of Steel (Sci-Fi)</option>
                  <option value="elephants_dream" className="bg-[#0a0514] text-gray-200">Elephants Dream (Sci-Fi)</option>
                  <option value="big_buck_bunny" className="bg-[#0a0514] text-gray-200">Big Buck Bunny (Animation)</option>
                  <option value="subaru_dirt" className="bg-[#0a0514] text-gray-200">Subaru Dirt Trails (Vlog)</option>
                </select>
              </div>

              {/* Graphic preset */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-gray-400">Pick Thumbnail Presets</label>
                <select 
                  value={thumbnailPreset}
                  onChange={(e) => setThumbnailPreset(e.target.value)}
                  className="w-full p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300 font-sans"
                >
                  <option value="sci-fi" className="bg-[#0a0514] text-gray-200">Sci-Fi (Tears of Steel)</option>
                  <option value="vlogs" className="bg-[#0a0514] text-gray-200">Vlogs Walkthrough Cover</option>
                  <option value="movies" className="bg-[#0a0514] text-gray-200">Cinematic Hollywood Cinema</option>
                  <option value="gaming" className="bg-[#0a0514] text-gray-200">Apex Esports Arena</option>
                </select>
              </div>
            </div>
          </div>

          {/* Monetization details check box sliders */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <label className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:border-purple-500/20 hover:bg-white/10 transition-all">
              <input 
                type="checkbox" 
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-4 h-4 rounded text-purple-500 bg-white/5 focus:ring-0"
              />
              <div>
                <p className="font-bold text-gray-300">Premium-Only</p>
                <p className="text-[9px] text-gray-500 font-mono">Requires subscription plan</p>
              </div>
            </label>

            <label className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:border-purple-500/20 hover:bg-white/10 transition-all">
              <input 
                type="checkbox" 
                checked={hasAds}
                onChange={(e) => setHasAds(e.target.checked)}
                className="w-4 h-4 rounded text-purple-500 bg-white/5 focus:ring-0"
              />
              <div>
                <p className="font-bold text-gray-300">Monetization Ads</p>
                <p className="text-[9px] text-gray-500 font-mono">Injects CPM video sequences</p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-xs text-white shadow-xl shadow-purple-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>{submitting ? "Compiling metadata..." : "Publish Motion Video"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
