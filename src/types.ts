/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "admin" | "creator" | "user";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  subscribedCreators: string[]; // List of creator UIDs subscribed to
  subscribersCount: number;
  favorites: string[]; // List of video IDs
  watchHistory: {
    videoId: string;
    watchedAt: string;
    progress: number; // in seconds
  }[];
  notifications: AppNotification[];
  creatorAnalytics?: CreatorAnalytics;
  createdAt: string;
}

export interface CreatorAnalytics {
  totalViews: number;
  totalDownloads: number;
  totalDonations: number;
  adEarnings: number;
  cpm: number; // cost per mille (1000 views)
  rpm: number; // revenue per mille
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  creatorId: string;
  creatorName: string;
  creatorPhoto: string;
  views: number;
  likes: string[]; // array of user UIDs
  dislikes: string[]; // array of user UIDs
  downloadsCount: number;
  isPremium: boolean;
  duration: string; // e.g., "5:20"
  hasAds: boolean;
  approved: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  qualityOptions: string[]; // e.g. ["1080p", "720p", "480p"]
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  creatorId: string;
  creatorName: string;
  donorName: string;
  amount: number;
  message: string;
  paymentMethod: "stripe" | "paypal";
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AdCampaign {
  id: string;
  title: string;
  videoUrl: string;
  ctaText: string;
  ctaUrl: string;
  durationSeconds: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
}
