/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Video } from "../types";
import { useVideo } from "../context/VideoContext";
import { useAuth } from "../context/AuthContext";
import { MiniPlayer } from "../components/MiniPlayer";
import { DonationModal } from "../components/DonationModal";
import { 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  MessageSquare, 
  DollarSign, 
  UserPlus, 
  UserMinus, 
  Trash2,
  Lock,
  ArrowLeft,
  Tv,
  CheckCircle,
  HelpCircle
} from "lucide-react";

interface VideoDetailsPageProps {
  video: Video;
  onBack: () => void;
  onSelectVideo: (v: Video) => void;
}

export const VideoDetailsPage: React.FC<VideoDetailsPageProps> = ({ 
  video, 
  onBack, 
  onSelectVideo 
}) => {
  const { user } = useAuth();
  const { 
    videos, 
    comments, 
    toggleLike, 
    toggleDislike, 
    addComment, 
    deleteComment, 
    subscribeToCreator, 
    toggleFavorite,
    language 
  } = useVideo();

  const [commentText, setCommentText] = useState("");
  const [showDonation, setShowDonation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isLiked = user ? video.likes.includes(user.uid) : false;
  const isDisliked = user ? video.dislikes.includes(user.uid) : false;
  const isFavorited = user?.favorites?.includes(video.id) || false;
  const isSubscribed = user?.subscribedCreators?.includes(video.creatorId) || false;

  const currentPremium = user && (user.role === "admin" || user.role === "creator" || localStorage.getItem("streamnexus_premium") === "true");
  const isPremiumLocked = video.isPremium && !currentPremium;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(video.id, commentText);
    setCommentText("");
  };

  // Safe related suggestions logic
  const relatedVideos = videos
    .filter(v => v.id !== video.id && v.approved)
    .filter(v => v.category === video.category || v.creatorId === video.creatorId)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-gray-200">
      
      {/* Navigation Return Hook */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-purple-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{language === "en" ? "Return to catalog" : "Volver a catálogo"}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left pane: Video stream player, analytics descriptions, comments */}
        <div className="lg:col-span-2 space-y-5">
          {isPremiumLocked ? (
            /* Premium Subscription Lock state card */
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center space-y-6 shadow-xl backdrop-blur-md">
              <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-400">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-extrabold text-white">Cinematics Plan Locked</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  '{video.title}' is cataloged under StreamNexus Premium. Enjoy 4K buffering, unlimited downloads, and support independent animators.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                <button 
                  onClick={() => {
                    localStorage.setItem("streamnexus_premium", "true");
                    window.location.reload();
                  }}
                  className="w-full px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-pink-500/15 transition-transform truncate cursor-pointer"
                >
                  Unlock Simulator Premium
                </button>
              </div>
            </div>
          ) : (
            <MiniPlayer video={video} />
          )}

          {/* Title description metadata summary block */}
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">{video.title}</h1>

            {/* Creator Attribution, Like Counter tools, tipping triggers */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              
              {/* Creator details */}
              <div className="flex items-center gap-3">
                <img 
                  src={video.creatorPhoto} 
                  alt="Uploader" 
                  className="w-10 h-10 rounded-full border border-purple-500/30 object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-200 flex items-center gap-1.5">
                    <span>{video.creatorName}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400 fill-current" />
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono">Channel Producer</p>
                </div>

                {/* Subscribe Button */}
                {user && user.uid !== video.creatorId && (
                  <button
                    onClick={() => subscribeToCreator(video.creatorId)}
                    className={`ml-4 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                      isSubscribed 
                        ? "bg-gray-800 border border-gray-700 text-gray-400"
                        : "bg-purple-600 text-white shadow-md hover:bg-purple-500"
                    }`}
                  >
                    {isSubscribed ? <span className="flex items-center gap-1"><UserMinus className="w-3 h-3" /> Subscribed</span> : <span className="flex items-center gap-1"><UserPlus className="w-3 h-3" /> Subscribe</span>}
                  </button>
                )}
              </div>

              {/* Like/Dislike controls & Donations sponsorship trigger */}
              <div className="flex items-center gap-2">
                {/* Sponsorship Patron Tipping Trigger */}
                <button 
                  onClick={() => setShowDonation(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-gray-950 font-bold text-xs shadow-lg shadow-yellow-500/10 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 text-gray-950 stroke-[2.5]" />
                  <span>Sponsor Stream</span>
                </button>

                {/* Likes panel */}
                <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-0.5">
                  <button 
                    onClick={() => toggleLike(video)}
                    disabled={!user}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      isLiked ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{video.likes.length}</span>
                  </button>
                  <div className="w-px h-6 bg-white/10" />
                  <button 
                    onClick={() => toggleDislike(video)}
                    disabled={!user}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      isDisliked ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{video.dislikes.length}</span>
                  </button>
                </div>

                {/* Share URL copy */}
                <button 
                  onClick={handleShare}
                  className="p-2 ml-1 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy video link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sharing link alerts */}
            {copiedLink && (
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] text-purple-400 font-mono text-center">
                Link copied to clipboard! Share the StreamNexus media node.
              </div>
            )}

            {/* Detailed text description plot */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase font-mono tracking-wider">Synopsis & plot details</h4>
              <p className="text-xs leading-relaxed text-gray-300 whitespace-pre-wrap">{video.description}</p>
            </div>
          </div>

          {/* Comments and Conversation threads */}
          <div className="space-y-4 pt-4 border-t border-purple-950/25">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-gray-200">Discussion Comments ({comments.length})</h3>
            </div>

            {/* Comment Form */}
            {user ? (
               <form onSubmit={handleCommentSubmit} className="flex gap-3">
                <img 
                  src={user.photoURL} 
                  alt="My UserProfile" 
                  className="w-8 h-8 rounded-full border border-purple-500/20 object-cover"
                />
                <div className="flex-1 space-y-2">
                  <input 
                    type="text" 
                    required
                    maxLength={1000}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={language === "en" ? "Leave a respectful comment thread..." : "Deja un comentario..."}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-250 focus:outline-none focus:border-purple-500 font-sans"
                  />
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-[10px] text-white uppercase tracking-wider cursor-pointer"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-3.5 border border-white/10 rounded-2xl bg-white/5 text-center text-xs text-gray-300 backdrop-blur-md">
                You must login to participate in video conversations.
              </div>
            )}

            {/* Comments Lists */}
            <div className="space-y-3.5 mt-2">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500 italic">
                  No conversations yet. Be the first to start the discussion!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all">
                    <img 
                      src={comment.userPhoto} 
                      alt="User Avatar" 
                      className="w-8 h-8 rounded-full object-cover border border-purple-500/20"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-200">{comment.userName}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-gray-500 font-mono">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          {(user?.uid === comment.userId || user?.role === "admin") && (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="p-1 rounded text-gray-500 hover:text-pink-500 hover:bg-gray-800 transition-colors cursor-pointer"
                              title="Delete Comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 font-sans">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right pane: Related movie selection Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-gray-300">Related Streams</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {relatedVideos.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-gray-400">
                No similar genre suggestions found. Expand categories to explore.
              </div>
            ) : (
              relatedVideos.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelectVideo(item)}
                  className="flex gap-3 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group"
                >
                  <div className="w-32 aspect-video shrink-0 rounded-lg overflow-hidden bg-gray-950">
                    <img 
                      src={item.thumbnailUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-1 flex flex-col justify-between py-0.5 text-xs">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-200 line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono">{item.creatorName}</p>
                    </div>
                    <p className="text-[9px] text-gray-500 font-mono">
                      {item.views.toLocaleString()} {language === "en" ? "views" : "vistas"} | {item.duration}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Direct tipping portal Modal */}
      {showDonation && (
        <DonationModal
          creatorId={video.creatorId}
          creatorName={video.creatorName}
          onClose={() => setShowDonation(false)}
        />
      )}
    </div>
  );
};
