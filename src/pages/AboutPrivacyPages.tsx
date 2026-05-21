/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useVideo } from "../context/VideoContext";
import { Shield, FileText, Mail, HelpCircle, Users, Award, Landmark, Tv } from "lucide-react";

interface AboutPrivacyPagesProps {
  initialSubTab: 'about' | 'privacy' | 'terms' | 'contact';
}

export const AboutPrivacyPages: React.FC<AboutPrivacyPagesProps> = ({ initialSubTab }) => {
  const { language } = useVideo();
  const [subTab, setSubTab] = useState<'about' | 'privacy' | 'terms' | 'contact'>(initialSubTab);

  // Contact form state
  const [sentMsg, setSentMsg] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSentMsg("Support ticket successfully dispatched to StreamNexus Clearance! We will address your query within 24 hours.");
    setEmail("");
    setMsg("");
    setTimeout(() => setSentMsg(""), 6000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 animate-fade-in text-gray-200">
      
      {/* Sub tabs selectors */}
      <div className="flex border-b border-gray-800 text-xs font-bold uppercase tracking-wider select-none justify-center gap-1 sm:gap-4 font-mono pb-2 overflow-x-auto">
        <button 
          onClick={() => setSubTab('about')}
          className={`px-3 py-1.5 rounded-lg transition-transform cursor-pointer ${subTab === 'about' ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
        >
          About StreamNexus
        </button>
        <button 
          onClick={() => setSubTab('privacy')}
          className={`px-3 py-1.5 rounded-lg transition-transform cursor-pointer ${subTab === 'privacy' ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
        >
          Privacy Policy
        </button>
        <button 
          onClick={() => setSubTab('terms')}
          className={`px-3 py-1.5 rounded-lg transition-transform cursor-pointer ${subTab === 'terms' ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
        >
          Terms & Conditions
        </button>
        <button 
          onClick={() => setSubTab('contact')}
          className={`px-3 py-1.5 rounded-lg transition-transform cursor-pointer ${subTab === 'contact' ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
        >
          Contact Support
        </button>
      </div>

      {subTab === 'about' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Tv className="w-12 h-12 text-purple-400 mx-auto" />
            <h1 className="text-2xl font-extrabold text-white">StreamNexus High-Fidelity Network</h1>
            <p className="text-xs text-purple-300 font-mono">ESTABLISHED 2026</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-gray-300">
            <div className="p-4 rounded-xl border border-gray-800 bg-gray-905 space-y-2.5">
              <h3 className="font-bold text-gray-100 flex items-center gap-1.5 font-mono"><Users className="w-4 h-4 text-purple-400" /> OUR MISSION</h3>
              <p>StreamNexus facilitates a collaborative ecosystem empowering independent video producers and animators to publish cinematic movies. We handle CPM-rates ads, sponsor tips distribution, and streaming, letting viewers enjoy 1085p high-speed rendering catalog buffers.</p>
            </div>

            <div className="p-4 rounded-xl border border-gray-800 bg-gray-905 space-y-2.5">
              <h3 className="font-bold text-gray-100 flex items-center gap-1.5 font-mono"><Award className="w-4 h-4 text-pink-400" /> SYSTEM ARCHITECTURE</h3>
              <p>Built with React, Vite, and Tailwind, supporting both real-time Firebase Auth/Firestore and full localized data simulation fallbacks. It employs the Gemini model for content recommendation curations.</p>
            </div>
          </div>
        </div>
      )}

      {subTab === 'privacy' && (
        <div className="space-y-6 text-xs text-gray-300 leading-relaxed font-sans">
          <div className="flex items-center gap-2 border-b border-gray-900 pb-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Privacy Policy Agreement</h2>
          </div>
          
          <div className="space-y-4">
            <p><strong>Effective Epoch: May 2026</strong></p>
            <p>At StreamNexus, user-confidentiality is primary. When syncing accounts with our database (simDb or Firebase), your assets and credentials are protected by secure hashes and cryptographic guards in alignment with General Data Protection Regulation (GDPR) mandates.</p>
            
            <h4 className="font-bold text-white uppercase tracking-wider font-mono">1. Information Collect Node</h4>
            <p>We log your watch playing history progression indexes, favorite lists identifiers, and comments threads specifically to curate customized Gemini recommendations.</p>

            <h4 className="font-bold text-white uppercase tracking-wider font-mono">2. Third-Party Payments Gateways</h4>
            <p>Stripe and PayPal transactions bypasses local storage and are processed directly via secure SSL clearance handshakes. We never store credit Card details on our servers.</p>
          </div>
        </div>
      )}

      {subTab === 'terms' && (
        <div className="space-y-6 text-xs text-gray-300 leading-relaxed font-sans">
          <div className="flex items-center gap-2 border-b border-gray-900 pb-2">
            <FileText className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Terms of Licensing Agreement</h2>
          </div>

          <div className="space-y-4">
            <p>StreamNexus grants you a non-transferable streaming license to review digital video nodes explicitly published by verified authors under Creative Commons (CC BY) frameworks.</p>

            <h4 className="font-bold text-white uppercase tracking-wider font-mono">1. Account Abuse Invariants</h4>
            <p>Free tier users are metered by a daily 3-downloads limit threshold. Standard users must not inject bot scraper payloads or automate comments postings.</p>

            <h4 className="font-bold text-white uppercase tracking-wider font-mono">2. Creator Rights Retention</h4>
            <p>Uploader creators retain complete copyright assets claim over films uploaded, subject to immediate purge if flags or moderation review rejects content.</p>
          </div>
        </div>
      )}

      {subTab === 'contact' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-900 pb-2">
            <Mail className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Contact & Clearance Support</h2>
          </div>

          {sentMsg ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-400 font-bold uppercase tracking-wider font-mono animate-pulse">
              {sentMsg}
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="max-w-md mx-auto space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Your Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full px-3.5 py-2 rounded-lg bg-gray-905 border border-gray-800 text-gray-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Support Message</label>
                <textarea 
                  rows={4}
                  required
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="How can StreamNexus support nodes guide your queries today?..."
                  className="w-full px-3.5 py-2 rounded-lg bg-gray-905 border border-gray-800 text-gray-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold uppercase tracking-wider text-xs text-white shadow-xl shadow-purple-500/10 cursor-pointer"
              >
                Dispatch Ticket
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
