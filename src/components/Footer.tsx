/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Tv, Github, Twitter, MessageSquare, Play, HelpCircle, FileText, Shield } from "lucide-react";

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  language: string;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, language }) => {
  return (
    <footer className="bg-[#0a0514] border-t border-white/10 text-xs text-gray-500 py-12 px-6 z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab("home")}>
            <div className="p-1.5 rounded bg-purple-600">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wider text-gray-200">
              STREAM<span className="text-purple-400">NEXUS</span>
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-400">
            {language === "en" 
              ? "The ultimate cross-category motion pictures streaming engine, facilitating high-fidelity monetization for global video designers."
              : "La plataforma definitiva de streaming y monetización de video con analíticas para creadores."
            }
          </p>
          <div className="flex items-center gap-3 text-gray-400">
            <a href="#github" className="hover:text-purple-400 transition-colors"><Github className="w-4 h-4" /></a>
            <a href="#twitter" className="hover:text-purple-400 transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#discord" className="hover:text-purple-400 transition-colors"><MessageSquare className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Resources tab links */}
        <div>
          <h4 className="font-bold text-gray-300 uppercase tracking-widest font-mono mb-4">Discovery</h4>
          <ul className="space-y-2 text-[11px] text-gray-400">
            <li><button onClick={() => setCurrentTab("home")} className="hover:text-purple-400 cursor-pointer">Streaming Home</button></li>
            <li><button onClick={() => setCurrentTab("movies")} className="hover:text-purple-400 cursor-pointer">Premium Movies</button></li>
            <li><button onClick={() => setCurrentTab("categories")} className="hover:text-purple-400 cursor-pointer">Dynamic Genres</button></li>
          </ul>
        </div>

        {/* Platform metrics info */}
        <div>
          <h4 className="font-bold text-gray-300 uppercase tracking-widest font-mono mb-4">Creator Services</h4>
          <ul className="space-y-2 text-[11px] text-gray-400">
            <li><button onClick={() => setCurrentTab("profile")} className="hover:text-purple-400 cursor-pointer">Creator Dashboard</button></li>
            <li><a href="#cpm" className="hover:text-purple-400">CPM Revenue System</a></li>
            <li><a href="#paypal" className="hover:text-purple-400">PayPal & Stripe Setups</a></li>
            <li><a href="#ads" className="hover:text-purple-400">Watch Ads to Unlock</a></li>
          </ul>
        </div>

        {/* Standards privacy & legal policy */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-300 uppercase tracking-widest font-mono mb-4">Platform Policies</h4>
          <div className="flex flex-col gap-2.5">
            <button 
              onClick={() => setCurrentTab("privacy")}
              className="flex items-center gap-2 hover:text-purple-400 text-left cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-purple-500" />
              <span>Privacy Policy</span>
            </button>
            <button 
              onClick={() => setCurrentTab("terms")}
              className="flex items-center gap-2 hover:text-purple-400 text-left cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span>Terms of Service</span>
            </button>
            <button 
              onClick={() => setCurrentTab("contact")}
              className="flex items-center gap-2 hover:text-purple-400 text-left cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
              <span>Support & Contact</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-gray-600">
          &copy; 2026 StreamNexus Inc. Built with Google AI Studio. Open Blender Foundation footage utilized under Creative Commons licenses.
        </p>
        <div className="flex items-center gap-4 text-[10px] text-gray-600">
          <span>Server Status: <span className="text-emerald-500 font-bold font-mono">ONLINE</span></span>
          <span>Version: <span className="font-mono">1.2.0-stable</span></span>
        </div>
      </div>
    </footer>
  );
};
