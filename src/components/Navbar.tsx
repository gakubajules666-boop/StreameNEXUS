/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useVideo } from "../context/VideoContext";
import { 
  Tv, 
  Search, 
  Bell, 
  User as UserIcon, 
  Globe, 
  Sparkles, 
  ShieldAlert, 
  LayoutDashboard, 
  Video as VideoIcon, 
  LogOut,
  ChevronDown
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  searchQuery, 
  setSearchQuery 
}) => {
  const { user, logout, switchRole } = useAuth();
  const { language, setLanguage } = useVideo();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = user?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLangChange = () => {
    const next = language === "en" ? "es" : language === "es" ? "fr" : "en";
    setLanguage(next);
  };

  const getLangLabel = () => {
    if (language === "en") return "EN";
    if (language === "es") return "ES";
    return "FR";
  };

  return (
    <nav className="sticky top-0 z-50 h-20 px-6 sm:px-10 flex items-center justify-between bg-[#0a0514]/80 border-b border-white/10 backdrop-blur-md shadow-lg shadow-black/20">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => setCurrentTab("home")}
      >
        <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
          <Tv className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-blue-400 transition-all">
          STREAM<span className="text-white group-hover:text-purple-300 transition-colors">NEXUS</span>
        </span>
      </div>

      {/* Navigation center links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <button 
          onClick={() => setCurrentTab("home")}
          className={`hover:text-white transition-colors cursor-pointer py-1 ${currentTab === "home" ? "text-purple-400 border-b-2 border-purple-500 font-bold" : "text-gray-400"}`}
        >
          {language === "en" ? "Home" : language === "es" ? "Inicio" : "Accueil"}
        </button>
        <button 
          onClick={() => setCurrentTab("movies")}
          className={`hover:text-white transition-colors cursor-pointer py-1 ${currentTab === "movies" ? "text-purple-400 border-b-2 border-purple-500 font-bold" : "text-gray-400"}`}
        >
          {language === "en" ? "Movies" : language === "es" ? "Películas" : "Films"}
        </button>
        <button 
          onClick={() => setCurrentTab("categories")}
          className={`hover:text-white transition-colors cursor-pointer py-1 ${currentTab === "categories" ? "text-purple-400 border-b-2 border-purple-500 font-bold" : "text-gray-400"}`}
        >
          {language === "en" ? "Categories" : language === "es" ? "Categorías" : "Catégories"}
        </button>
        <button 
          onClick={() => setCurrentTab("about")}
          className={`hover:text-white transition-colors cursor-pointer py-1 ${currentTab === "about" ? "text-purple-400 border-b-2 border-purple-500 font-bold" : "text-gray-400"}`}
        >
          {language === "en" ? "About" : language === "es" ? "Nosotros" : "À propos"}
        </button>
      </div>

      {/* Search and User Widgets */}
      <div className="flex items-center gap-4 relative">
        {/* Search Input */}
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-2.5" />
          <input 
            type="text" 
            placeholder={language === "en" ? "Search videos, creators..." : language === "es" ? "Buscar..." : "Recherche..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 lg:w-64 pl-9 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 text-xs text-gray-200 placeholder-gray-500 transition-all font-sans"
          />
        </div>

        {/* Translation Toggle */}
        <button 
          onClick={handleLangChange}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs transition-colors cursor-pointer"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="font-mono font-bold text-[10px]">{getLangLabel()}</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors relative cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0a0514]/95 border border-white/10 rounded-xl shadow-2xl p-4 z-50 text-xs max-h-96 overflow-y-auto backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 font-semibold text-gray-300">
                <span>{language === "en" ? "Notifications" : "Notificaciones"}</span>
                {unreadCount > 0 && <span className="text-pink-500 text-[10px] bg-pink-500/10 px-1.5 py-0.5 rounded-full">{unreadCount} unread</span>}
              </div>
              {notifications.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  {language === "en" ? "No new notification alerts" : "Sin notificaciones."}
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-2 rounded bg-white/5 border border-white/5 hover:border-purple-500/20 transition-transform">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-gray-200">{notif.title}</span>
                        <span className="text-[9px] text-gray-500 shrink-0">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-400 mt-1 text-[10px] break-words">{notif.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Profile controls */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              <img 
                src={user.photoURL} 
                alt="Avatar" 
                className="w-7 h-7 rounded-full object-cover border border-purple-500/40"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs text-gray-300 font-medium hidden lg:inline max-w-[120px] truncate px-1">{user.displayName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 mr-1" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0a0514]/95 border border-white/10 rounded-xl shadow-2xl p-2.5 z-50 text-xs backdrop-blur-md">
                {/* Header info */}
                <div className="p-2 border-b border-white/10 mb-2">
                  <p className="font-bold text-gray-200 truncate">{user.displayName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded border border-purple-500/30 text-[9px] text-purple-400 font-bold uppercase tracking-wider font-mono">
                    {user.role}
                  </div>
                </div>

                {/* Quick actions */}
                <button 
                  onClick={() => { setCurrentTab("profile"); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-white/5 hover:text-white rounded-lg text-left text-gray-400 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  {language === "en" ? "My Profile" : "Mi Perfil"}
                </button>

                {/* Role Switcher Emulator for demo */}
                <div className="border-t border-white/10 my-1.5 pt-1.5 px-2">
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Switch Role (Simulated)</p>
                  <div className="grid grid-cols-3 gap-1">
                    {(["user", "creator", "admin"] as const).map(role => (
                      <button
                        key={role}
                        onClick={() => { switchRole(role); setShowProfileMenu(false); }}
                        className={`px-1 py-0.5 text-[8px] rounded-md border uppercase font-bold text-center transition-all cursor-pointer ${
                          user.role === role 
                            ? "bg-purple-600/20 border-purple-500/50 text-white shadow-sm shadow-purple-500/10" 
                            : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {user.role === "creator" && (
                  <button 
                    onClick={() => { setCurrentTab("dashboard"); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-white/5 hover:text-indigo-400 rounded-lg text-left text-gray-400 transition-colors border-t border-white/10"
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    <span>{language === "en" ? "Creator Studio" : "Estudio Creador"}</span>
                  </button>
                )}

                {user.role === "admin" && (
                  <button 
                    onClick={() => { setCurrentTab("admin"); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-white/5 hover:text-pink-400 rounded-lg text-left text-gray-400 transition-colors border-t border-white/10"
                  >
                    <ShieldAlert className="w-4 h-4 text-pink-400" />
                    <span>{language === "en" ? "Admin Audit" : "Auditoría Admin"}</span>
                  </button>
                )}

                <button 
                  onClick={() => { logout(); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 p-2 mt-1.5 hover:bg-pink-600/15 hover:text-pink-400 rounded-lg text-left text-gray-400 border border-transparent hover:border-pink-500/30 transition-all font-semibold"
                >
                  <LogOut className="w-4 h-4 text-pink-500" />
                  {language === "en" ? "Sign Out" : "Cerrar Sesión"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setCurrentTab("auth")}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-purple-500/10 transition-all transform active:scale-95 cursor-pointer"
          >
            {language === "en" ? "Sign In" : "Iniciar Sesión"}
          </button>
        )}
      </div>
    </nav>
  );
};
