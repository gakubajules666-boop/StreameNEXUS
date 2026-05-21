/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useVideo } from "../context/VideoContext";
import { CATEGORIES } from "../data";
import { simDb } from "../firebase";
import { 
  DollarSign, 
  Eye, 
  Download, 
  Heart, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  Film, 
  Trash2, 
  Check, 
  PieChart as ChartIcon, 
  FolderLock,
  Plus
} from "lucide-react";

interface DashboardPageProps {
  onOpenUpload: () => void;
  onSelectVideo: (v: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onOpenUpload,
  onSelectVideo 
}) => {
  const { user, updateProfile } = useAuth();
  const { videos, donations, deleteVideo, language } = useVideo();

  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawGateway, setWithdrawGateway] = useState<"stripe" | "paypal">("stripe");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  if (!user || user.role !== "creator") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400 space-y-4 font-mono text-xs">
        <FolderLock className="w-12 h-12 text-pink-500 mx-auto" />
        <p>Access Forbidden. Creator Studio requires a Creator account status.</p>
        <p className="text-[10px] text-gray-500">Go to your UserProfile dropdown menu and switch your active role to "creator" to unlock.</p>
      </div>
    );
  }

  // Load creator profile data from simDb (safe online/offline hybrid)
  const allUsers = simDb.getUsers();
  const creatorProfile = allUsers[user.uid] || user;
  const analytics = creatorProfile.creatorAnalytics || {
    totalViews: 0,
    totalDownloads: 0,
    totalDonations: 0,
    adEarnings: 0
  };

  const totalRevenue = analytics.adEarnings + analytics.totalDonations;
  const subscriberCount = creatorProfile.subscribersCount || 0;

  // Filter video list published by this creator specifically
  const myVideos = videos.filter(v => v.creatorId === user.uid);
  
  // Specific donations from patrons to this creator
  const myDonations = donations.filter(d => d.creatorId === user.uid);

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess(false);

    if (withdrawAmount <= 0) {
      setWithdrawError("Specify a valid dollar amount to withdraw.");
      return;
    }

    if (withdrawAmount > totalRevenue) {
      setWithdrawError("Requested withdrawal payout exceeds your available earnings balance.");
      return;
    }

    // Process secure simulated withdrawal and reduce user earnings
    const updatedRevenue = Number((analytics.adEarnings - withdrawAmount).toFixed(4));
    
    // Simulating deduction
    analytics.adEarnings = Math.max(0, updatedRevenue);
    
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawAmount(0);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-8 animate-fade-in text-gray-200">
      
      {/* Header Banner info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">Creator Studio Hub</h1>
          <p className="text-xs text-gray-400">
            Monitor CPM streaming metrics, ad payouts, and moderate your video publications catalog.
          </p>
        </div>

        <button 
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Video</span>
        </button>
      </div>

      {/* Grid of Ticker Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        
        {/* Metric 1: CPM Revenue */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 bg-gradient-to-tr from-purple-500/5 to-transparent space-y-2">
          <div className="flex justify-between items-center text-purple-400">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">CREATOR VALUATION</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono">${totalRevenue.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-[9px] text-gray-500">
            <span className="text-emerald-400 font-extrabold">+14.2%</span>
            <span>CPM streaming rates</span>
          </div>
        </div>

        {/* Metric 2: Views counter */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-indigo-400">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">TOTAL IMPRESSIONS</span>
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{analytics.totalViews.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[9px] text-gray-500">
            <span className="text-gray-400 font-bold">AVG RATE:</span>
            <span>$5.00 eCPM payout</span>
          </div>
        </div>

        {/* Metric 3: Subscriber count */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-pink-400">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">AUDIENCE RETENTION</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{subscriberCount.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[9px] text-gray-500">
            <span>Direct channel subscribers</span>
          </div>
        </div>

        {/* Metric 4: Direct Donations */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-amber-500">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">DIRECT SPONSORSHIPS</span>
            <Heart className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono">${analytics.totalDonations.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-[9px] text-gray-500">
            <span>From {myDonations.length} distinct patrons</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left pane: Videos publication catalog listing with admin controls */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-gray-200">My Video Publications ({myVideos.length})</h3>
            </div>
          </div>

          <div className="space-y-3">
            {myVideos.length === 0 ? (
              <div className="p-10 bg-white/5 border border-white/10 rounded-3xl text-center space-y-3 text-gray-400 text-xs shadow-inner">
                <p>You have not published any motion videos into StreamNexus yet.</p>
                <button 
                  onClick={onOpenUpload}
                  className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Publish first video
                </button>
              </div>
            ) : (
              myVideos.map((vid) => (
                <div 
                  key={vid.id}
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all flex gap-4 items-center justify-between"
                >
                  <div 
                    onClick={() => onSelectVideo(vid)}
                    className="flex gap-3 hover:opacity-85 cursor-pointer flex-1 min-w-0"
                  >
                    <img 
                      src={vid.thumbnailUrl} 
                      alt="" 
                      className="w-20 aspect-video rounded-lg object-cover bg-gray-950 shrink-0"
                    />
                    <div className="min-w-0 py-0.5 space-y-1">
                      <h4 className="text-xs font-bold text-gray-250 truncate">{vid.title}</h4>
                      <p className="text-[9px] text-gray-500 uppercase font-mono tracking-widest">{vid.category} | {vid.duration}</p>
                      
                      {/* State badge */}
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase tracking-wide ${
                        vid.status === "approved" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : vid.status === "rejected" 
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse"
                      }`}>
                        {vid.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-gray-400 font-mono text-right shrink-0 font-bold">
                    <div>
                      <p className="text-gray-500 text-[9px] font-bold">VIEWS</p>
                      <p className="font-bold text-gray-300">{vid.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[9px] font-bold">SPONSORS ADS</p>
                      <p className="font-bold text-gray-300">{vid.hasAds ? "YES" : "NO"}</p>
                    </div>
                    
                    <button 
                      onClick={() => deleteVideo(vid.id)}
                      className="p-2 rounded-xl hover:bg-pink-600/10 text-gray-500 hover:text-pink-500 transition-colors cursor-pointer"
                      title="Delete stream permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right pane: Earnings Withdrawal simulator panel */}
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 bg-gradient-to-b from-purple-500/5 to-transparent space-y-4 shadow-xl backdrop-blur-md">
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-bold font-mono text-purple-400 uppercase tracking-widest">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>SECURE PAYOUT CLEARANCE</span>
              </div>
              <h3 className="text-sm font-bold text-gray-250">Withdraw Creative Funds</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Unlock your accumulated ad views revenue and sponsor tips balances straight to your bank ledger.
              </p>
            </div>

            <form onSubmit={handleWithdrawal} className="space-y-3.5 text-xs">
              
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-gray-400 uppercase">Available Payout</label>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-lg font-black font-mono text-emerald-400 flex items-center gap-1 select-none">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <span>{totalRevenue.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Amount to withdraw */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-gray-400 uppercase">Amount to clear</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input 
                    type="number" 
                    required
                    min="1"
                    max={totalRevenue}
                    value={withdrawAmount || ""}
                    onChange={(e) => setWithdrawAmount(Math.min(totalRevenue, Number(e.target.value)))}
                    placeholder="e.g. 50"
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 text-xs text-gray-200 font-sans"
                  />
                </div>
              </div>

              {/* Gateway switch */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-gray-400 uppercase block">Receiving Terminal</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawGateway("stripe")}
                    className={`py-1.5 rounded-xl border text-center font-bold text-[10px] transition-all cursor-pointer ${
                      withdrawGateway === "stripe" 
                        ? "bg-purple-600/20 border-purple-500/50 text-purple-400"
                        : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-350"
                    }`}
                  >
                    Stripe Cashout
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawGateway("paypal")}
                    className={`py-1.5 rounded-xl border text-center font-bold text-[10px] transition-all cursor-pointer ${
                      withdrawGateway === "paypal" 
                        ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400"
                        : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-350"
                    }`}
                  >
                    PayPal Node
                  </button>
                </div>
              </div>

              {/* Alerts */}
              {withdrawError && <p className="text-[10px] font-semibold text-pink-500 text-center font-mono">{withdrawError}</p>}
              {withdrawSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold font-mono text-[10px] text-center animate-pulse uppercase">
                  Payout transfer cleared to your {withdrawGateway} wallet!
                </div>
              )}

              {/* Action */}
              <button 
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 font-extrabold text-[10px] text-gray-950 uppercase tracking-wider shadow-lg shadow-emerald-500/10 transform active:scale-95 transition-all cursor-pointer"
              >
                Clear payout transfer
              </button>
            </form>
          </div>

          {/* Activity Logs of Patrons Tips */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">Patrons ledger comments</h4>
            {myDonations.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic block">No sponsor sponsorships recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {myDonations.map((don) => (
                  <div key={don.id} className="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-[10px] hover:border-white/10 transition-all font-sans">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-200">{don.donorName}</span>
                      <span className="text-amber-400 font-mono font-bold">+${don.amount}</span>
                    </div>
                    <p className="text-gray-400 italic mt-1 leading-relaxed">"{don.message}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
