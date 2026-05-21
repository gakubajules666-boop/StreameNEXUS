/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "../types";
import { isFirebaseConfigured, auth, db, simDb, handleFirestoreError, OperationType } from "../firebase";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isSimulated: boolean;
  login: (email: string, role?: UserRole, displayName?: string) => Promise<void>;
  signUp: (email: string, displayName: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(!isFirebaseConfigured);

  // Watch Authentication State
  useEffect(() => {
    if (isFirebaseConfigured && auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const userDocRef = doc(db, "users", fbUser.uid);
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setUser(userDocSnap.data() as UserProfile);
            } else {
              // Create default profile for newly registered OAuth users
              const newProfile: UserProfile = {
                uid: fbUser.uid,
                email: fbUser.email || "",
                displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
                photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fbUser.uid}`,
                role: "user",
                subscribedCreators: [],
                subscribersCount: 0,
                favorites: [],
                watchHistory: [],
                notifications: [
                  { 
                    id: "welcome_oauth", 
                    title: "Welcome to StreamNexus!", 
                    message: "You've successfully connected through Google Authentication.", 
                    createdAt: new Date().toISOString(), 
                    read: false 
                  }
                ],
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, newProfile);
              setUser(newProfile);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Load offline simulated profile session
      const session = simDb.getCurrentSession();
      setUser(session);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, role: UserRole = "user", displayName?: string) => {
    setLoading(true);
    if (!isFirebaseConfigured) {
      const allUsers = simDb.getUsers();
      // Match existing simulated user or set-up profile
      let foundUser = Object.values(allUsers).find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        foundUser = {
          uid: `sim_user_${Date.now()}`,
          email,
          displayName: displayName || email.split("@")[0],
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
          role,
          subscribedCreators: [],
          subscribersCount: 0,
          favorites: [],
          watchHistory: [],
          notifications: [
            { id: "sim_not_1", title: "Signed In successfully!", message: "Enjoy complete platform access.", createdAt: new Date().toISOString(), read: false }
          ],
          creatorAnalytics: role === "creator" ? {
            totalViews: 0,
            totalDownloads: 0,
            totalDonations: 0,
            adEarnings: 0,
            cpm: 5.0,
            rpm: 3.5
          } : undefined,
          createdAt: new Date().toISOString()
        };
        const updatedUsers = { ...allUsers, [foundUser.uid]: foundUser };
        simDb.setUsers(updatedUsers);
      }
      
      simDb.setCurrentSession(foundUser);
      setUser(foundUser);
      setLoading(false);
      return;
    }
    // Note: OAuth handled directly in Firebase components via standard popups
    setLoading(false);
  };

  const signUp = async (email: string, displayName: string, role: UserRole) => {
    setLoading(true);
    if (!isFirebaseConfigured) {
      const newUser: UserProfile = {
        uid: `sim_user_${Date.now()}`,
        email,
        displayName,
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}`,
        role,
        subscribedCreators: [],
        subscribersCount: 0,
        favorites: [],
        watchHistory: [],
        notifications: [
          { id: "reg_welcome", title: "Account Created! 🎉", message: "Enjoy StreamNexus videos & services.", createdAt: new Date().toISOString(), read: false }
        ],
        creatorAnalytics: role === "creator" ? {
          totalViews: 0,
          totalDownloads: 0,
          totalDonations: 0,
          adEarnings: 0,
          cpm: 4.5,
          rpm: 3.0
        } : undefined,
        createdAt: new Date().toISOString()
      };
      const allUsers = simDb.getUsers();
      allUsers[newUser.uid] = newUser;
      simDb.setUsers(allUsers);
      simDb.setCurrentSession(newUser);
      setUser(newUser);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    } else {
      simDb.setCurrentSession(null);
      setUser(null);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const mergedUser = { ...user, ...updates };
    setUser(mergedUser);

    if (isFirebaseConfigured && db) {
      const userRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userRef, updates as any);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    } else {
      simDb.setCurrentSession(mergedUser);
      const allUsers = simDb.getUsers();
      if (allUsers[user.uid]) {
        allUsers[user.uid] = { ...allUsers[user.uid], ...updates };
        simDb.setUsers(allUsers);
      }
    }
  };

  const switchRole = async (targetRole: UserRole) => {
    if (!user) return;
    const analytics = targetRole === "creator" && !user.creatorAnalytics ? {
      totalViews: 0,
      totalDownloads: 0,
      totalDonations: 0,
      adEarnings: 0,
      cpm: 5.0,
      rpm: 3.5
    } : user.creatorAnalytics;

    await updateProfile({ 
      role: targetRole,
      creatorAnalytics: analytics
    });
  };

  const refreshUser = () => {
    if (!isFirebaseConfigured) {
      setUser(simDb.getCurrentSession());
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isSimulated, login, signUp, logout, updateProfile, switchRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
