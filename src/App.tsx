/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { VideoProvider, useVideo } from "./context/VideoContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { NetflixHero } from "./components/NetflixHero";
import { VideoCard } from "./components/VideoCard";
import { UploadModal } from "./components/UploadModal";
import { VideoDetailsPage } from "./pages/VideoDetailsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPanel } from "./pages/AdminPanel";
import { AboutPrivacyPages } from "./pages/AboutPrivacyPages";
import { CATEGORIES } from "./data";
import { Video } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Tv, 
  Flame, 
  User, 
  FolderHeart, 
  Compass, 
  History, 
  Plus, 
  MonitorPlay,
  Mail,
  Lock,
  ArrowRight,
  LogOut,
  Sliders,
  AlertCircle
} from "lucide-react";

function AppInner() {
  const { user, login, signUp, logout } = useAuth();
  const { 
    videos, 
    loadingVideos, 
    activeVideo, 
    setActiveVideo, 
    aiRecommendations, 
    loadingAI, 
    fetchAIRecommendations, 
    language,
    deleteVideo 
  } = useVideo();

  const [currentTab, setCurrentTab] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [showUpload, setShowUpload] = useState<boolean>(false);

  // Authentication forms states
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authRole, setAuthRole] = useState<"user" | "creator" | "admin">("user");
  const [authFeedback, setAuthFeedback] = useState("");

  // Handle video card clicks
  const handleVideoSelect = (video: Video) => {
    setActiveVideo(video);
    setCurrentTab("watching");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Safe Back handle from detail pages
  const handleBackToCatalog = () => {
    setActiveVideo(null);
    setCurrentTab("home");
  };

  // Quick preset account authorization simulator
  const handleSocialClick = async (presetType: "user" | "creator" | "admin") => {
    await login(`${presetType}@streamnexus.com`, presetType);
    setAuthFeedback(`Logged in successfully as verified test ${presetType}!`);
    setTimeout(() => {
      setAuthFeedback("");
      setCurrentTab("home");
    }, 1500);
  };

  // Standard authentication submission
  const handleFormAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthFeedback("");

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthFeedback("All credential input nodes are required.");
      return;
    }

    if (authMode === "login") {
      login(authEmail, "user").then(() => {
        setAuthFeedback("Success! Navigating stream database...");
        setTimeout(() => {
          setAuthFeedback("");
          setCurrentTab("home");
        }, 1200);
      }).catch((err) => {
        setAuthFeedback("Incorrect email or security verification mismatch.");
      });
    } else {
      if (!authName.trim()) {
        setAuthFeedback("Provide an audience display name tag.");
        return;
      }
      signUp(authEmail, authName, authRole).then(() => {
        setAuthFeedback("New account provisioned! Logged in as profile.");
        setTimeout(() => {
          setAuthFeedback("");
          setCurrentTab("home");
        }, 1500);
      });
    }
  };

  // Filter video list based on general category search parameters
  const getFilteredCatalog = () => {
    return videos
      .filter(v => v.approved) // Only show approved on home screen
      .filter(v => {
        if (selectedGenre === "all") return true;
        return v.category === selectedGenre;
      })
      .filter(v => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return v.title.toLowerCase().includes(q) || v.creatorName.toLowerCase().includes(q);
      });
  };

  const filteredCatalog = getFilteredCatalog();

  // Premium category subset
  const premiumCatalog = videos
    .filter(v => v.approved && v.isPremium)
    .slice(0, 6);

  // Fallback featured video banner (e.g. Sintel or first item)
  const featuredVideo = videos.find(v => v.id === "sintel") || videos[0];

  return (
    <div className="min-h-screen bg-[#0a0514] text-white flex flex-col font-sans antialiased selection:bg-purple-600 selection:text-white relative overflow-hidden">
      
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Top Navbar */}
      <Navbar 
        currentTab={currentTab === "watching" ? "home" : currentTab}
        setCurrentTab={(tab) => {
          setActiveVideo(null);
          setCurrentTab(tab);
        }}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q.trim() && currentTab !== "home") {
            setCurrentTab("home");
          }
        }}
      />

      {/* Main Container Workspace */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* 1. VIEW PLAYER PAGE */}
          {currentTab === "watching" && activeVideo && (
            <motion.div 
              key="watching"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <VideoDetailsPage 
                video={activeVideo}
                onBack={handleBackToCatalog}
                onSelectVideo={handleVideoSelect}
              />
            </motion.div>
          )}

          {/* 2. MAIN CATALOG / HOME LANDING PAGE */}
          {currentTab === "home" && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 pb-12"
            >
              {/* Grand Banner */}
              {featuredVideo && !searchQuery && (
                <NetflixHero 
                  featuredVideo={featuredVideo}
                  onPlay={handleVideoSelect}
                  onInfo={(v) => handleVideoSelect(v)}
                  language={language}
                />
              )}

              {/* Browse Categories row slider */}
              <div className="max-w-7xl mx-auto px-6 space-y-3 z-10 relative">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest block">Stream Categories</span>
                <div className="flex gap-2 pb-2 overflow-x-auto select-none no-scrollbar">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedGenre(cat.id)}
                      className={`px-4 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedGenre === cat.id 
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 border border-purple-500/50 text-white shadow-lg shadow-purple-500/20" 
                          : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini AI Personalized recommendation module */}
              {user && aiRecommendations && !searchQuery && (
                <div className="max-w-7xl mx-auto px-6 z-10 relative">
                  <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-spin" />
                        <h2 className="text-sm font-bold font-mono tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-purple-400">
                          {aiRecommendations.curatedHeadline || "AI RECOMMENDED CURATIONS"}
                        </h2>
                      </div>
                      <button 
                        onClick={fetchAIRecommendations}
                        disabled={loadingAI}
                        className="text-[10px] font-mono hover:text-white font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        {loadingAI ? "Re-syncing AI..." : "FORCE RE-SYNC"}
                      </button>
                    </div>

                    <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                      {aiRecommendations.explanation}
                    </p>

                    {/* Highly curated selection horizontal row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {videos
                        .filter(v => aiRecommendations.recoIds?.includes(v.id))
                        .map(item => (
                          <div 
                            key={item.id}
                            onClick={() => handleVideoSelect(item)}
                            className="p-1 rounded-xl bg-[#0a0514] border border-white/10 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-[1.02]"
                          >
                            <img src={item.thumbnailUrl} alt="" className="aspect-video w-full rounded-lg object-cover" />
                            <p className="text-[11px] font-bold text-gray-200 mt-1.5 truncate px-1">{item.title}</p>
                          </div>
                      ))}
                    </div>

                    <div className="text-[10px] font-mono text-gray-400 bg-white/5 p-2.5 rounded border border-white/10">
                      <strong>Personalized Streaming Tip:</strong> {aiRecommendations.personalizedTip}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Catalog dynamic Grid */}
              <div className="max-w-7xl mx-auto px-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4.5 h-4.5 text-purple-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-gray-300">
                    {searchQuery ? `Search Results (${filteredCatalog.length})` : "General catalog broad streams"}
                  </h3>
                </div>

                {loadingVideos ? (
                  <div className="text-center py-20 text-xs text-gray-500 font-mono animate-pulse">
                    BUFFERS CLEARING. PARSING PLATFORM CATALOG NODES...
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <div className="p-20 text-center rounded-2xl bg-gray-950 border border-gray-900 border-dashed space-y-2">
                    <p className="text-xs text-gray-400">No streams comply with active filters specified.</p>
                    <p className="text-[10px] text-gray-600 font-mono">Try searching with other generic keywords.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredCatalog.map((video) => (
                      <VideoCard 
                        key={video.id}
                        video={video}
                        onClick={handleVideoSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 3. DEDICATED MOVIES PAGE */}
          {currentTab === "movies" && (
            <motion.div 
              key="movies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 py-8 space-y-6"
            >
              <div>
                <h1 className="text-xl font-extrabold text-white">StreamNexus Premium Cinematic Block</h1>
                <p className="text-xs text-gray-400">Unlock luxury features, multi-device syncing, and ad-free offline playbacks limits.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {videos.filter(v => v.approved).map((video) => (
                  <VideoCard 
                    key={video.id}
                    video={video}
                    onClick={handleVideoSelect}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* 4. DEDICATED CATEGORIES GENERAL PAGE */}
          {currentTab === "categories" && (
            <motion.div 
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 py-8 space-y-6 text-gray-200 z-10 relative"
            >
              <div>
                <h1 className="text-xl font-extrabold text-white">Dynamic Genres Catalog Nodes</h1>
                <p className="text-xs text-gray-400">Segment movie archives into distinct channels directly mapped by categories.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CATEGORIES.filter(cat => cat.id !== "all").map(cat => {
                  const subset = videos.filter(v => v.approved && v.category === cat.id);
                  return (
                    <div 
                      key={cat.id} 
                      className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all space-y-4 cursor-pointer backdrop-blur-md shadow-lg"
                      onClick={() => {
                        setSelectedGenre(cat.id);
                        setCurrentTab("home");
                      }}
                    >
                      <div className="flex justify-between items-center text-purple-400">
                        <span className="text-xs font-bold tracking-widest font-mono uppercase">{cat.name} channel</span>
                        <MonitorPlay className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-sans">A curated selection of movies and animations filed under our {cat.name} channel category.</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                        <span>STREAMS SIZE:</span>
                        <span className="font-bold text-gray-300">{subset.length} digital files</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 5. USER PROFILE PAGE */}
          {currentTab === "profile" && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-6 py-10 space-y-8 text-gray-200 z-10 relative"
            >
              {user ? (
                <div className="space-y-6">
                  {/* Outer Frame header */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center gap-5 backdrop-blur-md shadow-lg">
                    <img 
                      src={user.photoURL} 
                      alt="" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500 shadow-lg"
                    />
                    <div className="space-y-1.5 text-center sm:text-left">
                      <h2 className="text-lg font-bold text-white">{user.displayName}</h2>
                      <p className="text-xs text-gray-400 font-mono">{user.email}</p>
                      
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 font-bold uppercase tracking-wider font-mono">
                        Verified {user.role} Privilege
                      </div>
                    </div>
                  </div>

                  {/* Sandbox Premium Plan status switcher */}
                  <div className="p-4 rounded-3xl border border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-purple-500/5 backdrop-blur-md flex items-center justify-between text-xs shadow-md">
                    <div>
                      <p className="font-bold text-gray-200">StreamNexus Premium status</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {localStorage.getItem("streamnexus_premium") === "true" ? "ACTIVE MEMBERSHIP" : "FREE PLAN (3 DOWNLOADS CAP)"}
                      </p>
                    </div>
                    {localStorage.getItem("streamnexus_premium") === "true" ? (
                      <button 
                        onClick={() => {
                          localStorage.removeItem("streamnexus_premium");
                          window.location.reload();
                        }}
                        className="px-3 py-1 rounded-lg bg-pink-500/10 border border-pink-500/30 hover:bg-pink-600 hover:text-white text-pink-400 font-bold font-mono tracking-wider text-[9px] cursor-pointer"
                      >
                        DEACTIVATE MEMBERSHIP
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          localStorage.setItem("streamnexus_premium", "true");
                          window.location.reload();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-extrabold text-[10px] cursor-pointer transition-opacity"
                      >
                        ACTIVATE PREMIUM
                      </button>
                    )}
                  </div>

                  {/* Watch history list */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <History className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-bold uppercase text-gray-300">My Watch History history</h3>
                    </div>

                    {user.watchHistory?.length === 0 ? (
                      <p className="text-[10px] text-gray-500 italic">No watch history cataloged. Streams you watch will appear here.</p>
                    ) : (
                      <div className="space-y-2">
                        {user.watchHistory?.map((hist) => {
                          const matchingVideo = videos.find(v => v.id === hist.videoId);
                          if (!matchingVideo) return null;
                          return (
                            <div 
                              key={hist.videoId}
                              onClick={() => handleVideoSelect(matchingVideo)}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between cursor-pointer hover:border-purple-500/30 hover:bg-white/10 transition-all font-sans"
                            >
                              <div className="flex items-center gap-3">
                                <img src={matchingVideo.thumbnailUrl} className="w-12 aspect-video rounded-lg object-cover border border-white/5" alt="" />
                                <span className="text-xs font-bold text-gray-300">{matchingVideo.title}</span>
                              </div>
                              <span className="text-[9px] text-gray-500 font-mono">{new Date(hist.watchedAt).toLocaleTimeString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* My Subscribed creators references */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">Subscribed Channels</h4>
                    {user.subscribedCreators?.length === 0 ? (
                      <p className="text-[10px] text-gray-500 italic block">You have not subscribed to any channel creators.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        {user.subscribedCreators?.map((id) => (
                          <div key={id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-purple-400 font-bold font-mono">
                            CREATOR ID: {id.slice(0, 8)}...
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">Login required.</div>
              )}
            </motion.div>
          )}

          {/* 6. CREATOR DASHBOARD STUDIO */}
          {currentTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DashboardPage 
                onOpenUpload={() => setShowUpload(true)}
                onSelectVideo={handleVideoSelect}
              />
            </motion.div>
          )}

          {/* 7. ADMIN PANEL */}
          {currentTab === "admin" && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel onSelectVideo={handleVideoSelect} />
            </motion.div>
          )}

          {/* 8. AUTHENTICATION PAGES */}
          {currentTab === "auth" && (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto px-6 py-12"
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl space-y-6 backdrop-blur-md">
                {/* Brand Title */}
                <div className="text-center space-y-2">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white w-fit mx-auto shadow-md">
                    <Tv className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-100">
                    {authMode === "login" ? "Access StreamNexus Node" : "Register Streaming Account"}
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Connect with our simulated sandbox db network credentials.
                  </p>
                </div>

                {/* Preset Fast Login console */}
                <div className="p-3.5 border border-white/10 rounded-2xl bg-white/5 space-y-2.5">
                  <p className="text-[9px] font-mono font-bold text-purple-400 tracking-wider text-center">FAST SANDBOX PROFILE SELECTOR</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button 
                      onClick={() => handleSocialClick("user")}
                      className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 text-[9px] text-gray-300 font-bold font-mono transition-colors text-center cursor-pointer"
                    >
                      USER LOGIN
                    </button>
                    <button 
                      onClick={() => handleSocialClick("creator")}
                      className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 text-[9px] text-gray-300 font-bold font-mono transition-colors text-center cursor-pointer"
                    >
                      CREATOR
                    </button>
                    <button 
                      onClick={() => handleSocialClick("admin")}
                      className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 text-[9px] text-gray-300 font-bold font-mono transition-colors text-center cursor-pointer"
                    >
                      ADMIN DB
                    </button>
                  </div>
                </div>

                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-[9px] text-gray-400 font-mono font-bold">OR SUBMIT KEYS</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <form onSubmit={handleFormAuth} className="space-y-4 text-xs font-sans">
                  
                  {authMode === "signup" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-gray-400">DISPLAY NAME</label>
                      <input 
                        type="text" 
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-250 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400">EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. user@streamnexus.com"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-250 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400">PASSWORD PIN</label>
                    <input 
                      type="password" 
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-250 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {authMode === "signup" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-gray-400 block">INITIAL SECURITY LEVEL</label>
                      <select
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-purple-500"
                      >
                        <option value="user">USER (WATCH & COMMENT)</option>
                        <option value="creator">CREATOR (UPLOAD & EARN)</option>
                        <option value="admin">ADMIN (AUDIT MODERATION)</option>
                      </select>
                    </div>
                  )}

                  {authFeedback && (
                    <p className="text-[10px] text-pink-500 font-mono font-bold text-center">{authFeedback}</p>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/10 cursor-pointer"
                  >
                    {authMode === "login" ? "Verify Credentials" : "Instantiate New UserProfile"}
                  </button>
                </form>

                <div className="text-center pt-2.5 border-t border-white/10">
                  <button 
                    onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline font-mono cursor-pointer"
                  >
                    {authMode === "login" ? "Create a free subscription account" : "Already registered? Login instead"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 9. STATIC ABOUT/PRIVACY PAGES */}
          {["about", "privacy", "terms", "contact"].includes(currentTab) && (
            <motion.div 
              key="policies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AboutPrivacyPages initialSubTab={currentTab as any} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Upload Video Popup Overlay */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} />
      )}

      {/* Dynamic Bottom Footer */}
      <Footer setCurrentTab={setCurrentTab} language={language} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VideoProvider>
        <AppInner />
      </VideoProvider>
    </AuthProvider>
  );
}
