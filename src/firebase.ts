/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocFromServer
} from "firebase/firestore";

import firebaseConfig from "../firebase-applet-config.json";
import { Video, Comment, Donation, UserProfile, UserRole } from "./types";
import { INITIAL_VIDEOS } from "./data";

// Check if Firebase was provisioned with actual credentials
export const isFirebaseConfigured = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "");

let appInstance;
let authInstance: any;
let dbInstance: any;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(appInstance);
    // Explicitly pass Database ID according to Firebase integration guidelines
    dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId || "(default)");
  } catch (error) {
    console.warn("Firebase initialization failed. Falling back to simulation.", error);
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;

// Verification Test Call (Pillar mandatory from guidelines)
export async function testConnection() {
  if (!isFirebaseConfigured || !db) return;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}
testConnection();

// --- Firestore Hardened Error Logging (Required Scheme) ---
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = isFirebaseConfigured ? auth : null;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || "simulated_user",
      email: currentAuth?.currentUser?.email || "viewer@streamnexus.app",
      emailVerified: currentAuth?.currentUser?.emailVerified || true,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || false,
      tenantId: currentAuth?.currentUser?.tenantId || null,
      providerInfo: currentAuth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("StreamNexus Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// DEEP PERSISTENT STREAMNEXUS SIMULATION
// ==========================================

const LOCAL_STORAGE_KEYS = {
  VIDEOS: "streamnexus_videos_v1",
  USERS: "streamnexus_users_v1",
  COMMENTS: "streamnexus_comments_v1",
  DONATIONS: "streamnexus_donations_v1",
  CURRENT_USER: "streamnexus_session_v1"
};

// Seed initial values in LocalStorage if blank
const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  const store = localStorage.getItem(key);
  if (!store) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(store);
};

const setLocalStorageItem = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize simulated database tables
export const simDb = {
  getVideos: () => getLocalStorageItem<Video[]>(LOCAL_STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS),
  setVideos: (videos: Video[]) => setLocalStorageItem(LOCAL_STORAGE_KEYS.VIDEOS, videos),
  
  getUsers: () => getLocalStorageItem<Record<string, UserProfile>>(LOCAL_STORAGE_KEYS.USERS, {
    "blender_foundation_1": {
      uid: "blender_foundation_1",
      email: "studio@blender.org",
      displayName: "Blender Studio",
      photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      role: "creator",
      subscribedCreators: [],
      subscribersCount: 24500,
      favorites: ["sintel"],
      watchHistory: [],
      notifications: [],
      creatorAnalytics: {
        totalViews: 614002,
        totalDownloads: 12540,
        totalDonations: 1240,
        adEarnings: 1540.25,
        cpm: 4.5,
        rpm: 3.2
      },
      createdAt: "2026-01-10T12:00:00Z"
    },
    "gaming_apex": {
      uid: "gaming_apex",
      email: "apex@nexusgaming.com",
      displayName: "Apex Gaming",
      photoURL: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&q=80",
      role: "creator",
      subscribedCreators: [],
      subscribersCount: 12050,
      favorites: [],
      watchHistory: [],
      notifications: [],
      creatorAnalytics: {
        totalViews: 450124,
        totalDownloads: 16700,
        totalDonations: 3450,
        adEarnings: 2120.40,
        cpm: 6.0,
        rpm: 4.8
      },
      createdAt: "2026-02-14T09:15:00Z"
    }
  }),
  setUsers: (users: Record<string, UserProfile>) => setLocalStorageItem(LOCAL_STORAGE_KEYS.USERS, users),

  getComments: () => getLocalStorageItem<Comment[]>(LOCAL_STORAGE_KEYS.COMMENTS, [
    { id: "c1", videoId: "big_buck_bunny", userId: "user1", userName: "Sarah Jenkins", userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", text: "Reminds me of my childhood! Such simple humor and amazing framing.", createdAt: "2026-05-18T10:20:00Z" },
    { id: "c2", videoId: "big_buck_bunny", userId: "user2", userName: "David K.", userPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80", text: "The engineering behind this open render is still incredible in 2026.", createdAt: "2026-05-19T14:40:00Z" },
    { id: "c3", videoId: "sintel", userId: "user3", userName: "Elena Rostova", userPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", text: "That final scene always brings a tear to my eye. Brilliant narrative piece.", createdAt: "2026-05-20T11:05:00Z" },
    { id: "c4", videoId: "sintel", userId: "user4", userName: "Zack Storm", userPhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80", text: "Stunning colors! Blender's team has revolutionized free filmmaking.", createdAt: "2026-05-20T17:35:00Z" }
  ]),
  setComments: (comments: Comment[]) => setLocalStorageItem(LOCAL_STORAGE_KEYS.COMMENTS, comments),

  getDonations: () => getLocalStorageItem<Donation[]>(LOCAL_STORAGE_KEYS.DONATIONS, [
    { id: "d1", creatorId: "blender_foundation_1", creatorName: "Blender Studio", donorName: "John Doe", amount: 50.0, message: "Thank you for the open source software!", paymentMethod: "stripe", createdAt: "2026-05-10T15:20:00Z" },
    { id: "d2", creatorId: "gaming_apex", creatorName: "Apex Gaming", donorName: "Alice Woods", amount: 25.0, message: "Amazing finals coverage!", paymentMethod: "paypal", createdAt: "2026-05-19T22:15:00Z" }
  ]),
  setDonations: (donations: Donation[]) => setLocalStorageItem(LOCAL_STORAGE_KEYS.DONATIONS, donations),

  getCurrentSession: () => {
    const session = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    if (session) return JSON.parse(session);
    // Create default logged in user
    const defaultUser: UserProfile = {
      uid: "user_demo_nexus",
      email: "gamer.nexus@gmail.com",
      displayName: "Gamer Nexus Studio",
      photoURL: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
      role: "creator", // Allow creator tools by default so users can easily play with creator panels
      subscribedCreators: ["blender_foundation_1"],
      subscribersCount: 120,
      favorites: ["big_buck_bunny"],
      watchHistory: [
        { videoId: "big_buck_bunny", watchedAt: "2026-05-21T09:00:00Z", progress: 45 }
      ],
      notifications: [
        { id: "n1", title: "Welcome to StreamNexus! 🎉", message: "Enjoy cinema-grade streaming, explore creator metrics, and try the monetization dashboard.", createdAt: "2026-05-21T11:00:00Z", read: false }
      ],
      creatorAnalytics: {
        totalViews: 1250,
        totalDownloads: 43,
        totalDonations: 120,
        adEarnings: 8.45,
        cpm: 5.0,
        rpm: 3.5
      },
      createdAt: "2026-05-18T08:00:00Z"
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    return defaultUser;
  },
  setCurrentSession: (user: UserProfile | null) => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    }
  }
};
