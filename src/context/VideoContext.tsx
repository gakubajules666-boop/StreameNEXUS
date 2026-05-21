/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { Video, Comment, Donation, AppNotification, UserProfile } from "../types";
import { isFirebaseConfigured, db, simDb, handleFirestoreError, OperationType } from "../firebase";
import { useAuth } from "./AuthContext";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";

interface VideoContextType {
  videos: Video[];
  comments: Comment[];
  donations: Donation[];
  loadingVideos: boolean;
  activeVideo: Video | null;
  adPlaying: boolean;
  currentAd: any | null;
  downloadCountToday: number;
  aiRecommendations: {
    curatedHeadline: string;
    explanation: string;
    recoIds: string[];
    personalizedTip: string;
  } | null;
  loadingAI: boolean;
  setActiveVideo: (video: Video | null) => void;
  incrementViews: (video: Video) => Promise<void>;
  toggleLike: (video: Video) => Promise<void>;
  toggleDislike: (video: Video) => Promise<void>;
  addComment: (videoId: string, text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  uploadVideo: (videoData: Partial<Video>) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  approveVideo: (videoId: string, approve: boolean) => Promise<void>;
  addDonation: (creatorId: string, creatorName: string, donorName: string, amount: number, message: string, paymentMethod: "stripe" | "paypal") => Promise<any>;
  triggerAdForVideo: (video: Video) => void;
  finishAd: () => void;
  triggerDownload: (video: Video, quality: string) => Promise<boolean>;
  toggleFavorite: (videoId: string) => Promise<void>;
  subscribeToCreator: (creatorId: string) => Promise<void>;
  fetchAIRecommendations: () => Promise<void>;
  language: string;
  setLanguage: (lang: string) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(true);
  
  const [activeVideo, setActiveVideoState] = useState<Video | null>(null);
  
  // Monetization Ads Engine
  const [adPlaying, setAdPlaying] = useState<boolean>(false);
  const [currentAd, setCurrentAd] = useState<any | null>(null);
  
  // Download metrics
  const [downloadCountToday, setDownloadCountToday] = useState<number>(0);
  
  // AI Recommendations state
  const [aiRecommendations, setAiRecommendations] = useState<any | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  
  // Accessibility Multi-Language state
  const [language, setLanguage] = useState<string>("en");

  // Load Downloads from today
  useEffect(() => {
    const savedDownloads = localStorage.getItem("streamnexus_downloads_today");
    if (savedDownloads) {
      const { count, date } = JSON.parse(savedDownloads);
      const isToday = new Date(date).toDateString() === new Date().toDateString();
      if (isToday) {
        setDownloadCountToday(count);
      } else {
        localStorage.setItem("streamnexus_downloads_today", JSON.stringify({ count: 0, date: new Date().toISOString() }));
      }
    }
  }, []);

  // Sync databases (Real Firebase or Local Simulation)
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      // Real Firebase Listeners
      const qVideos = query(collection(db, "videos"));
      const unsubVideos = onSnapshot(qVideos, (snapshot) => {
        const list: Video[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as Video, id: doc.id });
        });
        setVideos(list);
        setLoadingVideos(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, "videos");
      });

      const qDonations = query(collection(db, "donations"));
      const unsubDonations = onSnapshot(qDonations, (snapshot) => {
        const list: Donation[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as Donation, id: doc.id });
        });
        setDonations(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, "donations");
      });

      return () => {
        unsubVideos();
        unsubDonations();
      };
    } else {
      // Offline Simulated Database Core
      setVideos(simDb.getVideos());
      setComments(simDb.getComments());
      setDonations(simDb.getDonations());
      setLoadingVideos(false);
    }
  }, []);

  // Fetch comments when video changes
  useEffect(() => {
    if (!activeVideo) return;
    
    if (isFirebaseConfigured && db) {
      const qComments = query(collection(db, `videos/${activeVideo.id}/comments`));
      const unsubComments = onSnapshot(qComments, (snapshot) => {
        const list: Comment[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as Comment, id: doc.id });
        });
        setComments(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `videos/${activeVideo.id}/comments`);
      });
      return unsubComments;
    } else {
      const allComments = simDb.getComments();
      const filtered = allComments.filter(c => c.videoId === activeVideo.id);
      setComments(filtered);
    }
  }, [activeVideo, videos]);

  // Handle active video setting
  const setActiveVideo = (video: Video | null) => {
    setActiveVideoState(video);
    if (video) {
      incrementViews(video);
      triggerAdForVideo(video);
    }
  };

  // 1. Ads Integration System (Earn money per views if ad triggers)
  const triggerAdForVideo = (video: Video) => {
    if (video.hasAds) {
      // Free users get ads, Premium users do NOT get any ads
      if (!user || user.role === "user") {
        setAdPlaying(true);
        setCurrentAd({
          id: `ad_${Math.random().toString(36).substring(3, 8)}`,
          title: "Ad: StreamNexus Cloud Accelerator Upgrade",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          ctaText: "Discover Premium (Go Ad-Free)",
          ctaUrl: "#upgrade"
        });
      }
    }
  };

  const finishAd = () => {
    setAdPlaying(false);
    setCurrentAd(null);
  };

  // 2. View increments (Generates ad earnings for the creator!)
  const incrementViews = async (video: Video) => {
    const updatedVideos = videos.map(v => {
      if (v.id === video.id) {
        return { ...v, views: v.views + 1 };
      }
      return v;
    });

    // Update state to render immediately
    setVideos(updatedVideos);

    // Track user's playing watch history
    if (user) {
      const newHistoryNode = {
        videoId: video.id,
        watchedAt: new Date().toISOString(),
        progress: 0
      };
      const filteredHistory = user.watchHistory.filter(h => h.videoId !== video.id);
      await updateProfile({
        watchHistory: [newHistoryNode, ...filteredHistory].slice(0, 50) as any
      });
    }

    if (isFirebaseConfigured && db) {
      try {
        const videoRef = doc(db, "videos", video.id);
        await updateDoc(videoRef, { views: video.views + 1 });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `videos/${video.id}`);
      }
    } else {
      simDb.setVideos(updatedVideos);
      
      // Calculate earnings metrics for the creator profile
      const usersList = simDb.getUsers();
      const creatorProfile = usersList[video.creatorId];
      if (creatorProfile && creatorProfile.creatorAnalytics) {
        const analytics = creatorProfile.creatorAnalytics;
        const previousViews = analytics.totalViews;
        
        // Simulating CPM payout - Earn money per views! ($0.005 per view)
        const earned = video.hasAds ? 0.005 : 0.001; 
        
        creatorProfile.creatorAnalytics = {
          ...analytics,
          totalViews: previousViews + 1,
          adEarnings: Number((analytics.adEarnings + earned).toFixed(4))
        };
        usersList[video.creatorId] = creatorProfile;
        simDb.setUsers(usersList);
      }
    }
  };

  // Like System (Pillar ABAC: User can toggle array entry)
  const toggleLike = async (video: Video) => {
    if (!user) return;
    let updatedLikes = [...video.likes];
    let updatedDislikes = [...video.dislikes];

    if (updatedLikes.includes(user.uid)) {
      updatedLikes = updatedLikes.filter(uid => uid !== user.uid);
    } else {
      updatedLikes.push(user.uid);
      updatedDislikes = updatedDislikes.filter(uid => uid !== user.uid); // remove dislike
    }

    const updatedVideos = videos.map(v => {
      if (v.id === video.id) {
        return { ...v, likes: updatedLikes, dislikes: updatedDislikes };
      }
      return v;
    });
    setVideos(updatedVideos);

    if (isFirebaseConfigured && db) {
      try {
        const videoRef = doc(db, "videos", video.id);
        await updateDoc(videoRef, { likes: updatedLikes, dislikes: updatedDislikes });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `videos/${video.id}`);
      }
    } else {
      simDb.setVideos(updatedVideos);
    }
  };

  const toggleDislike = async (video: Video) => {
    if (!user) return;
    let updatedLikes = [...video.likes];
    let updatedDislikes = [...video.dislikes];

    if (updatedDislikes.includes(user.uid)) {
      updatedDislikes = updatedDislikes.filter(uid => uid !== user.uid);
    } else {
      updatedDislikes.push(user.uid);
      updatedLikes = updatedLikes.filter(uid => uid !== user.uid); // remove like
    }

    const updatedVideos = videos.map(v => {
      if (v.id === video.id) {
        return { ...v, likes: updatedLikes, dislikes: updatedDislikes };
      }
      return v;
    });
    setVideos(updatedVideos);

    if (isFirebaseConfigured && db) {
      try {
        const videoRef = doc(db, "videos", video.id);
        await updateDoc(videoRef, { likes: updatedLikes, dislikes: updatedDislikes });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `videos/${video.id}`);
      }
    } else {
      simDb.setVideos(updatedVideos);
    }
  };

  // Favorite toggle system
  const toggleFavorite = async (videoId: string) => {
    if (!user) return;
    const oldFavorites = user.favorites || [];
    let updatedFavorites;

    if (oldFavorites.includes(videoId)) {
      updatedFavorites = oldFavorites.filter(id => id !== videoId);
    } else {
      updatedFavorites = [...oldFavorites, videoId];
    }

    await updateProfile({ favorites: updatedFavorites });
  };

  // Subscribing to Creators
  const subscribeToCreator = async (creatorId: string) => {
    if (!user) return;
    const currentSubs = user.subscribedCreators || [];
    let updatedSubs;
    let adding = false;

    if (currentSubs.includes(creatorId)) {
      updatedSubs = currentSubs.filter(id => id !== creatorId);
    } else {
      updatedSubs = [...currentSubs, creatorId];
      adding = true;
    }

    await updateProfile({ subscribedCreators: updatedSubs });

    // Track statistics for the creator
    if (!isFirebaseConfigured) {
      const allUsers = simDb.getUsers();
      const creator = allUsers[creatorId];
      if (creator) {
        creator.subscribersCount = Math.max(0, creator.subscribersCount + (adding ? 1 : -1));
        allUsers[creatorId] = creator;
        simDb.setUsers(allUsers);
        
        // Push notification alerts to subscribers
        if (adding) {
          const authorProfile = simDb.getUsers()[creatorId];
          const newAlert: AppNotification = {
            id: `alert_${Date.now()}`,
            title: "New Subscription Match!",
            message: `${user.displayName} clicked subscribe on your channel!`,
            createdAt: new Date().toISOString(),
            read: false
          };
          authorProfile.notifications = [newAlert, ...(authorProfile.notifications || [])];
          allUsers[creatorId] = authorProfile;
          simDb.setUsers(allUsers);
        }
      }
    }
  };

  // Comments Section mutations
  const addComment = async (videoId: string, text: string) => {
    if (!user) return;
    
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      videoId,
      userId: user.uid,
      userName: user.displayName,
      userPhoto: user.photoURL,
      text,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const commentRef = doc(db, `videos/${videoId}/comments`, newComment.id);
        await setDoc(commentRef, newComment);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `videos/${videoId}/comments/${newComment.id}`);
      }
    } else {
      const allComments = simDb.getComments();
      const news = [newComment, ...allComments];
      simDb.setComments(news);
      setComments(news.filter(c => c.videoId === videoId));
    }
  };

  const deleteComment = async (commentId: string) => {
    if (isFirebaseConfigured && db && activeVideo) {
      try {
        const commentRef = doc(db, `videos/${activeVideo.id}/comments`, commentId);
        await deleteDoc(commentRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `videos/${activeVideo.id}/comments/${commentId}`);
      }
    } else {
      const allComments = simDb.getComments();
      const filtered = allComments.filter(c => c.id !== commentId);
      simDb.setComments(filtered);
      if (activeVideo) {
        setComments(filtered.filter(c => c.videoId === activeVideo.id));
      }
    }
  };

  // Movie video publishing system
  const uploadVideo = async (videoData: Partial<Video>) => {
    if (!user) return;
    
    const newId = videoData.id || `video_${Math.random().toString(36).substring(3, 9)}`;
    const fullVideo: Video = {
      id: newId,
      title: videoData.title || "Untitled Motion Project",
      description: videoData.description || "No description provided.",
      videoUrl: videoData.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnailUrl: videoData.thumbnailUrl || "https://images.unsplash.com/photo-1542204172-e7052809a86e?auto=format&fit=crop&w=800&q=80",
      category: videoData.category || "vlogs",
      creatorId: user.uid,
      creatorName: user.displayName,
      creatorPhoto: user.photoURL,
      views: 0,
      likes: [],
      dislikes: [],
      downloadsCount: 0,
      isPremium: videoData.isPremium || false,
      duration: videoData.duration || "5:00",
      hasAds: videoData.hasAds ?? true,
      approved: user.role === "admin", // Admin bypasses moderation approvals automatically!
      status: user.role === "admin" ? "approved" : "pending",
      createdAt: new Date().toISOString(),
      qualityOptions: videoData.qualityOptions || ["1080p", "720p"]
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "videos", newId);
        await setDoc(docRef, fullVideo);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `videos/${newId}`);
      }
    } else {
      const allVideos = simDb.getVideos();
      const updated = [fullVideo, ...allVideos];
      simDb.setVideos(updated);
      setVideos(updated);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "videos", videoId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `videos/${videoId}`);
      }
    } else {
      const allVideos = simDb.getVideos();
      const filtered = allVideos.filter(v => v.id !== videoId);
      simDb.setVideos(filtered);
      setVideos(filtered);
      if (activeVideo?.id === videoId) {
        setActiveVideoState(null);
      }
    }
  };

  const approveVideo = async (videoId: string, approve: boolean) => {
    const updatedVideos = videos.map(v => {
      if (v.id === videoId) {
        return { 
          ...v, 
          approved: approve, 
          status: (approve ? "approved" : "rejected") as any 
        };
      }
      return v;
    });
    setVideos(updatedVideos);

    if (isFirebaseConfigured && db) {
      try {
        const videoRef = doc(db, "videos", videoId);
        await updateDoc(videoRef, { 
          approved: approve, 
          status: approve ? "approved" : "rejected" 
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `videos/${videoId}`);
      }
    } else {
      simDb.setVideos(updatedVideos);
      
      // Send alert alert notifications to uploader
      const videoNode = videos.find(v => v.id === videoId);
      if (videoNode && !isFirebaseConfigured) {
        const allUsers = simDb.getUsers();
        const uploader = allUsers[videoNode.creatorId];
        if (uploader) {
          const newAlert: AppNotification = {
            id: `alert_${Date.now()}`,
            title: approve ? "Video Approved! 🎬" : "Video Flagged/Rejected",
            message: approve 
              ? `Your video '${videoNode.title}' is now streaming live globally.`
              : `Your video '${videoNode.title}' was reviewed and set to rejected status.`,
            createdAt: new Date().toISOString(),
            read: false
          };
          uploader.notifications = [newAlert, ...(uploader.notifications || [])];
          allUsers[videoNode.creatorId] = uploader;
          simDb.setUsers(allUsers);
        }
      }
    }
  };

  // Patrons Donating and Sponsorship payments simulator
  const addDonation = async (
    creatorId: string, 
    creatorName: string, 
    donorName: string, 
    amount: number, 
    message: string, 
    paymentMethod: "stripe" | "paypal"
  ) => {
    // 1. Process secure simulation backend checkout
    try {
      const payRes = await fetch("/api/monetization/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "donation", amount, paymentMethod })
      });
      const gateData = await payRes.json();
      
      const newDonation: Donation = {
        id: gateData.transactionId || `donation_${Math.random().toString(36).substring(3, 9)}`,
        creatorId,
        creatorName,
        donorName: donorName || "Anonymous Patron",
        amount,
        message: message || "Keep up the phenomenal streaming catalog!",
        paymentMethod,
        createdAt: new Date().toISOString()
      };

      if (isFirebaseConfigured && db) {
        try {
          const donationsRef = collection(db, "donations");
          await addDoc(donationsRef, newDonation);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, "donations");
        }
      } else {
        const allDonations = simDb.getDonations();
        const updated = [newDonation, ...allDonations];
        simDb.setDonations(updated);
        setDonations(updated);

        // Update creator earnings statistics immediately
        const usersList = simDb.getUsers();
        const creator = usersList[creatorId];
        if (creator && creator.creatorAnalytics) {
          creator.creatorAnalytics.totalDonations += amount;
          usersList[creatorId] = creator;
          simDb.setUsers(usersList);
          
          // Dispatch direct alert
          const alert: AppNotification = {
            id: `alert_patron_${Date.now()}`,
            title: `Received Donation: $${amount}! 💖`,
            message: `${donorName || "A viewer"} sponsored your stream with $${amount}. Note: "${message}"`,
            createdAt: new Date().toISOString(),
            read: false
          };
          creator.notifications = [alert, ...(creator.notifications || [])];
          simDb.setUsers(usersList);
        }
      }
      return gateData;
    } catch (e) {
      console.error("Monetization checkout crash:", e);
      return { success: false, error: e };
    }
  };

  // Quality Select and Download tracker limit guards
  const triggerDownload = async (video: Video, quality: string): Promise<boolean> => {
    // Check download limits for free accounts (3 per day limit!)
    const isPremiumTier = user && (user.role === "admin" || user.role === "creator" || localStorage.getItem("streamnexus_premium") === "true");
    
    if (!isPremiumTier) {
      if (downloadCountToday >= 3) {
        return false; // blocks download
      }
    }

    const nextCount = downloadCountToday + 1;
    setDownloadCountToday(nextCount);
    localStorage.setItem("streamnexus_downloads_today", JSON.stringify({ count: nextCount, date: new Date().toISOString() }));

    // Simulating MP4 source stream download trigger
    const link = document.createElement("a");
    link.href = video.videoUrl;
    link.setAttribute("download", `${video.title.replaceAll(" ", "_")}_${quality}.mp4`);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track analytics stats for the uploader
    if (!isFirebaseConfigured) {
      const allUsers = simDb.getUsers();
      const creator = allUsers[video.creatorId];
      if (creator && creator.creatorAnalytics) {
        creator.creatorAnalytics.totalDownloads += 1;
        simDb.setUsers(allUsers);
      }
    }

    return true;
  };

  // AI Recommendation Engine calling server process
  const fetchAIRecommendations = async () => {
    if (!user) return;
    setLoadingAI(true);
    try {
      const res = await fetch("/api/gemini/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videos,
          watchHistory: user.watchHistory,
          favorites: user.favorites,
          userPreferences: {
            role: user.role,
            displayName: user.displayName
          }
        })
      });
      const data = await res.json();
      setAiRecommendations(data);
    } catch (err) {
      console.error("AI Curation retrieval error:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Auto trigger recommendations on login
  useEffect(() => {
    if (user && videos.length > 0) {
      fetchAIRecommendations();
    }
  }, [user, videos.length]);

  return (
    <VideoContext.Provider value={{
      videos,
      comments,
      donations,
      loadingVideos,
      activeVideo,
      adPlaying,
      currentAd,
      downloadCountToday,
      aiRecommendations,
      loadingAI,
      setActiveVideo,
      incrementViews,
      toggleLike,
      toggleDislike,
      addComment,
      deleteComment,
      uploadVideo,
      deleteVideo,
      approveVideo,
      addDonation,
      triggerAdForVideo,
      finishAd,
      triggerDownload,
      toggleFavorite,
      subscribeToCreator,
      fetchAIRecommendations,
      language,
      setLanguage
    }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};
