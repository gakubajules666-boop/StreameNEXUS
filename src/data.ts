/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Video, SubscriptionPlan, AdCampaign } from "./types";

export const CATEGORIES = [
  { id: "all", name: "All", icon: "Tv" },
  { id: "movies", name: "Movies", icon: "Film" },
  { id: "animation", name: "Animation", icon: "Sparkles" },
  { id: "sci-fi", name: "Sci-Fi", icon: "Globe" },
  { id: "gaming", name: "Gaming", icon: "Gamepad" },
  { id: "vlogs", name: "Vlogs", icon: "Camera" },
  { id: "tech", name: "Tech", icon: "Cpu" },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free Tier",
    price: 0,
    interval: "month",
    features: [
      "Stream standard resolution (480p/720p)",
      "Ad-supported playback",
      "Up to 3 high-quality downloads per day",
      "Interact in comments & liking videos"
    ]
  },
  {
    id: "premium_monthly",
    name: "Nexus Premium Monthly",
    price: 9.99,
    interval: "month",
    features: [
      "Ad-free cinematic experience",
      "Stream in Ultra HD & 4K quality",
      "Unlimited ultra-fast downloads",
      "Access to exclusive Creator Behind-the-Scenes",
      "Premium subscriber avatar badge & custom chat borders",
      "Support creators directly (percentage of sub revenue)"
    ]
  },
  {
    id: "premium_yearly",
    name: "Nexus Premium Annual",
    price: 89.99,
    interval: "year",
    features: [
      "All Premium Monthly features",
      "25% savings compared to monthly rates",
      "Early bird access to newly uploaded studio content",
      "Exclusive streaming events & live VR coverage option",
      "Direct direct support lines with StreamNexus hosts"
    ]
  }
];

export const AD_CAMPAIGNS: AdCampaign[] = [
  {
    id: "gemini_ad",
    title: "Google Gemini: Elevate Everyday Creativity",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    ctaText: "Try Gemini Free",
    ctaUrl: "https://gemini.google.com",
    durationSeconds: 5
  },
  {
    id: "nexus_pro_ad",
    title: "StreamNexus Creator Tools: Upgrade to Pro Studio",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    ctaText: "Become a Creator",
    ctaUrl: "https://streamnexus.app/creator",
    durationSeconds: 5
  }
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: "big_buck_bunny",
    title: "Big Buck Bunny - An Animated Classic",
    description: "A large and lovable rabbit deals with three bullying rodents who bully him and destroy his beloved forest. This classic open-source animation shows what happens when one gentle giant decides he's had enough, leading to hilarious high-tech traps.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?auto=format&fit=crop&w=800&q=80",
    category: "animation",
    creatorId: "blender_foundation_1",
    creatorName: "Blender Studio",
    creatorPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    views: 124050,
    likes: ["user1", "user2", "user3", "creator1"],
    dislikes: [],
    downloadsCount: 1450,
    isPremium: false,
    duration: "9:56",
    hasAds: true,
    approved: true,
    status: "approved",
    createdAt: "2026-04-10T14:30:00Z",
    qualityOptions: ["1080p", "720p", "480p"]
  },
  {
    id: "sintel",
    title: "Sintel - Cinematic Storytelling",
    description: "Sintel is a gripping fantasy animation about a lonely girl who rescues a baby dragon she names Scales. After Scales is stolen by a mature dragon, Sintel embarks on a dangerous and emotional quest across desolate lands, only to find a shocking truth.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
    category: "animation",
    creatorId: "blender_foundation_1",
    creatorName: "Blender Studio",
    creatorPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    views: 489210,
    likes: ["user1", "user4", "user5", "user10"],
    dislikes: ["user2"],
    downloadsCount: 11090,
    isPremium: true,
    duration: "14:48",
    hasAds: false,
    approved: true,
    status: "approved",
    createdAt: "2026-05-01T09:15:00Z",
    qualityOptions: ["4K", "1080p", "720p"]
  },
  {
    id: "tears_of_steel",
    title: "Tears of Steel - Live Action & CGI Integration",
    description: "Set in dystopian Amsterdam, this gripping science-fiction drama explores a group of scientists trying to salvage the world from runaway robotic militarization. Merging state-of-the-art VFX tracking with physical performances, Celia's memory creates the ultimate AI nexus core.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80",
    category: "sci-fi",
    creatorId: "blender_foundation_1",
    creatorName: "Blender Studio",
    creatorPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    views: 89312,
    likes: ["user1", "user2"],
    dislikes: [],
    downloadsCount: 520,
    isPremium: false,
    duration: "12:14",
    hasAds: true,
    approved: true,
    status: "approved",
    createdAt: "2026-05-12T18:45:00Z",
    qualityOptions: ["1080p", "720p"]
  },
  {
    id: "elephants_dream",
    title: "Elephant's Dream - The First Open Movie",
    description: "The pioneering world of Proog and Emo, two humans living inside a bizarre, chaotic machine that might be of their own making. This film explores relationships, boundaries, and how machines mirror human fears in a highly surreal visual masterpiece.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    category: "sci-fi",
    creatorId: "retro_future",
    creatorName: "Retro Future Inc.",
    creatorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    views: 31050,
    likes: ["user3"],
    dislikes: ["user4"],
    downloadsCount: 154,
    isPremium: false,
    duration: "10:53",
    hasAds: true,
    approved: true,
    status: "approved",
    createdAt: "2026-05-15T11:20:00Z",
    qualityOptions: ["1080p", "720p"]
  },
  {
    id: "for_bigger_blazes",
    title: "For Bigger Blazes - Extreme Fire Trails",
    description: "Experience the adrenaline of high-speed forest firefighting, extreme wildfire control, and smokejumper missions. Witness the raw intensity of pilots performing low-altitude fire retardant drops as they combat some of the largest wildfires in cinematic detail.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    category: "movies",
    creatorId: "action_sports",
    creatorName: "Nexus Action Sports",
    creatorPhoto: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80",
    views: 75402,
    likes: ["user5", "user6"],
    dislikes: [],
    downloadsCount: 890,
    isPremium: true,
    duration: "0:15",
    hasAds: false,
    approved: true,
    status: "approved",
    createdAt: "2026-05-18T16:00:00Z",
    qualityOptions: ["4K", "1080p"]
  },
  {
    id: "creative_vlog_tech",
    title: "Vlog: Building My Dream Ultimate Streaming Setup",
    description: "In this walkthrough vlogger vlog episode, we rebuild the editing workbench from scratch. Setting up professional sound panels, dynamic RGB background lighting, a motorized sit-stand high-end desk, and custom sound mixers to record crisp podcasts.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    category: "vlogs",
    creatorId: "tech_vlog",
    creatorName: "Marcus Tech",
    creatorPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    views: 184501,
    likes: ["user2", "user7", "user8", "user9"],
    dislikes: ["user1"],
    downloadsCount: 2130,
    isPremium: false,
    duration: "4:32",
    hasAds: true,
    approved: true,
    status: "approved",
    createdAt: "2026-05-19T20:10:00Z",
    qualityOptions: ["1080p", "720p"]
  },
  {
    id: "gaming_highlight",
    title: "Nexus Pro Championship: Grand Finals Highlight Reel",
    description: "Relive the absolute best, most nail-biting plays and tactics from the international Nexus Esports Arena Championship. Highlighting the masterwork strategies, flawless co-ordination, and insane final clutches that decided the million-dollar trophy.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
    category: "gaming",
    creatorId: "esports_channel",
    creatorName: "Apex Esports",
    creatorPhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
    views: 450124,
    likes: ["user1", "user2", "user3", "user5", "user11", "user12"],
    dislikes: ["user7"],
    downloadsCount: 16700,
    isPremium: false,
    duration: "2:50",
    hasAds: true,
    approved: true,
    status: "approved",
    createdAt: "2026-05-20T08:00:00Z",
    qualityOptions: ["1080p", "720p"]
  }
];
