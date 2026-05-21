/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useVideo } from "../context/VideoContext";
import { useAuth } from "../context/AuthContext";
import { Heart, DollarSign, X, Check, Wallet, Send, Sparkles } from "lucide-react";

interface DonationModalProps {
  creatorId: string;
  creatorName: string;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ 
  creatorId, 
  creatorName, 
  onClose 
}) => {
  const { user } = useAuth();
  const { addDonation } = useVideo();

  const [donorName, setDonorName] = useState(user?.displayName || "");
  const [amount, setAmount] = useState<number>(10);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  
  const [submitting, setSubmitting] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any | null>(null);

  const presets = [5, 10, 25, 50, 100];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > 10000) return;

    setSubmitting(true);
    const details = await addDonation(
      creatorId, 
      creatorName, 
      donorName, 
      amount, 
      message, 
      paymentMethod
    );

    setSubmitting(false);
    if (details && details.success) {
      setTransactionDetails(details);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0a0514]/95 border border-white/10 p-6 shadow-2xl space-y-4 backdrop-blur-md">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {transactionDetails ? (
          /* Transaction Completed Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-200">Patronage Confirmed!</h3>
              <p className="text-xs text-gray-400">
                You've successfully transferred <span className="font-bold text-emerald-400">${amount} USD</span> to <span className="text-purple-400 font-semibold">{creatorName}</span>.
              </p>
            </div>

            {/* Receipt Details card */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left font-mono text-[10px] space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-500">TRANSACTION ID:</span><span className="text-gray-300 font-bold">{transactionDetails.transactionId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">GATEWAY:</span><span className="text-gray-300 uppercase">{transactionDetails.gateway} SECURE PROXY</span></div>
              <div className="flex justify-between"><span className="text-gray-500">STATUS:</span><span className="text-emerald-400 font-bold">SETTLED</span></div>
              <div className="flex justify-between"><span className="text-gray-500">AUTHORIZED AT:</span><span className="text-gray-400">{new Date(transactionDetails.timestamp).toLocaleTimeString()}</span></div>
            </div>

            <button 
              onClick={onClose}
              className="w-full px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 font-bold text-xs text-white uppercase transition-all shadow-lg cursor-pointer"
            >
              Return to Video
            </button>
          </div>
        ) : (
          /* Checkout Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-purple-400 text-xs font-bold font-mono uppercase tracking-wide">
                <Heart className="w-4 h-4 fill-current text-pink-500" />
                <span>MONETIZATION HUB</span>
              </div>
              <h2 className="text-lg font-bold text-gray-100">Sponsor {creatorName}</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Creators receive 100% of all direct donations. Upgrade their streaming tools and celebrate their production quality!
              </p>
            </div>

            {/* Donor Name input */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400">YOUR SCREEN NAME</label>
              <input 
                type="text" 
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Anonymous Patron"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 text-xs text-gray-200"
              />
            </div>

            {/* Amount picker presets */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-gray-400 block">SELECT DONATION PRESETS (USD)</label>
              <div className="grid grid-cols-5 gap-1.5">
                {presets.map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-1.5 rounded-xl border text-xs font-bold font-mono transition-colors cursor-pointer ${
                      amount === val 
                        ? "bg-purple-600 border-purple-500/50 text-white shadow-md shadow-purple-500/10"
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>

              {/* Custom number entry */}
              <div className="relative">
                <DollarSign className="w-4 h-4 text-purple-500 absolute left-3 top-2.5" />
                <input 
                  type="number" 
                  min="1"
                  max="10000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Custom amount"
                  className="w-full pl-8 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 text-xs text-gray-250 font-sans"
                />
              </div>
            </div>

            {/* Optional message */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400">ATTACH COMMENT/SUPPORT MESSAGE (OPTIONAL)</label>
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Keep up the incredible content creation qualities!"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 text-xs text-gray-250 font-sans"
              />
            </div>

            {/* Processor Picker */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 block">SECURE PROCESSOR GATEWAYS</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === "stripe" 
                      ? "bg-purple-600/20 border-purple-500/50 text-purple-400" 
                      : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Wallet className="w-4 h-4 text-purple-400" />
                  <span>Stripe Secure</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === "paypal" 
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400" 
                      : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Send className="w-4 h-4 text-indigo-400" />
                  <span>PayPal Node</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 mt-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-xs text-white shadow-xl shadow-purple-500/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
              <span>{submitting ? "Processing transaction..." : `Authorize Payout of $${amount} USD`}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
