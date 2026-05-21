/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { Video } from "../types";
import { useVideo } from "../context/VideoContext";
import { useAuth } from "../context/AuthContext";

const Player = ReactPlayer as any;
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Sparkles, 
  AlertTriangle,
  RotateCcw,
  Zap,
  Layout,
  ExternalLink,
  Flame,
  UserCheck
} from "lucide-react";

interface MiniPlayerProps {
  video: Video;
  onAdViewed?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ video, onAdViewed }) => {
  const { user } = useAuth();
  const { 
    adPlaying, 
    currentAd, 
    finishAd, 
    addDonation, 
    triggerDownload 
  } = useVideo();

  const [playing, setPlaying] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>("1080p");
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string>("");

  // Ad counters
  const [adCountdown, setAdCountdown] = useState<number>(5);
  const [canSkipAd, setCanSkipAd] = useState<boolean>(false);

  // Monitor Ad Pre-roll state
  useEffect(() => {
    if (adPlaying) {
      setAdCountdown(5);
      setCanSkipAd(false);
      setPlaying(true); // force ad playback
      
      const timer = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            setCanSkipAd(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [adPlaying, video.id]);

  const handleSkipAd = () => {
    finishAd();
    if (onAdViewed) onAdViewed();
  };

  const handleQualityChange = (q: string) => {
    setSelectedQuality(q);
    setShowQualityMenu(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadSuccessMessage("");
    const ok = await triggerDownload(video, selectedQuality);
    
    if (ok) {
      setDownloadSuccessMessage(`Content successfully packaged in ${selectedQuality}!`);
    } else {
      setDownloadSuccessMessage("Daily download cap exceeded! Upgrade to Premium monthly for unlimited files.");
    }
    
    setDownloading(false);
    setTimeout(() => setDownloadSuccessMessage(""), 4500);
  };

  // Determine actual playing URL - either Ad Campaign video file or movie file
  const activeStreamUrl = adPlaying && currentAd ? currentAd.videoUrl : video.videoUrl;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-purple-950/40 shadow-2xl">
      
      {/* Monetization Interactive Pre-roll Ad Overlay */}
      {adPlaying && currentAd && (
        <div className="absolute inset-0 z-40 bg-black/45 backdrop-blur-sm flex flex-col justify-between p-6 text-white animate-fade-in pointer-events-auto">
          {/* Ad Tag badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-bold tracking-widest text-yellow-400 font-mono animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>SPONSORED AD SEQUENCE</span>
            </div>
            
            <a 
              href={currentAd.ctaUrl} 
              target="_blank" 
              rel="referrer"
              className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white underline font-medium cursor-pointer"
            >
              <span>{currentAd.title}</span>
              <ExternalLink className="w-3" />
            </a>
          </div>

          {/* Center info */}
          <div className="text-center space-y-2 max-w-md mx-auto py-8">
            <h3 className="text-xl font-bold font-sans tracking-wide bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
              {currentAd.title}
            </h3>
            <p className="text-xs text-gray-300">
              Advertisements allow creators to publish cinema-grade streams for free. Support this creator by exploring below.
            </p>
            <div className="pt-2">
              <a 
                href={currentAd.ctaUrl} 
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:scale-105 transition-transform text-gray-950 font-bold text-xs cursor-pointer"
              >
                <span>{currentAd.ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Ad skip action bar */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <p className="text-[11px] text-gray-400 font-mono">
              Ad revenue earning rate: <span className="text-emerald-400 font-bold">$0.005 / view (CPM)</span>
            </p>

            {canSkipAd ? (
              <button 
                onClick={handleSkipAd}
                className="flex items-center gap-2 px-5 py-1.5 rounded-lg bg-white text-gray-950 font-extrabold text-xs shadow-lg transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Skip Ad</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <div className="px-4 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800 text-xs font-bold text-gray-400 font-mono">
                Skip in {adCountdown}s...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Video-Canvas (using absolute aspect ratio wrapper) */}
      <div className="aspect-video w-full bg-black relative">
        <Player
          url={activeStreamUrl}
          playing={playing}
          muted={muted}
          volume={volume}
          width="100%"
          height="100%"
          playbackRate={playbackRate}
          controls={!adPlaying} // Hide default controls when ads play to block bypasses
          style={{ position: "absolute", top: 0, left: 0 }}
          onEnded={() => {
            if (adPlaying) {
              handleSkipAd();
            }
          }}
        />
      </div>

      {/* Embedded Action Overlay panels (Only when actual video is active) */}
      {!adPlaying && (
        <div className="p-4 bg-gray-950 border-t border-purple-950/20 text-white flex flex-wrap gap-4 items-center justify-between">
          {/* Playback speed multiplier toggles */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPlaying(!playing)}
              className="p-2 rounded-lg bg-purple-900/20 border border-purple-900/30 text-purple-400 hover:text-white hover:bg-purple-600 transition-colors cursor-pointer"
              title={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            
            <button 
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Custom Playback speed switcher */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-900 border border-gray-800">
              <span className="text-[10px] text-gray-500 font-mono font-bold">SPEED:</span>
              {[1, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackRate(speed)}
                  className={`px-1.5 py-0.5 text-[9px] rounded font-bold font-mono transition-colors cursor-pointer ${
                    playbackRate === speed 
                      ? "bg-purple-600 text-white" 
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Download Quality selection widget */}
          <div className="flex items-center gap-4">
            {/* Resolution dropdown menu */}
            <div className="relative">
              <button 
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-purple-400 transition-colors cursor-pointer"
              >
                <Layout className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono">{selectedQuality}</span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-10 right-0 mt-2 w-32 bg-gray-950 border border-purple-950/80 rounded-lg p-1 shadow-2xl z-50 text-xs font-mono">
                  {video.qualityOptions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={`w-full text-left p-1.5 rounded hover:bg-purple-600/20 hover:text-purple-300 transition-colors cursor-pointer ${
                        selectedQuality === q ? "text-purple-400 font-bold bg-purple-500/10" : "text-gray-400"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download mechanism */}
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                downloading 
                  ? "bg-gray-900 text-gray-500 border border-gray-800 cursor-not-allowed" 
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/10"
              }`}
            >
              <Maximize className="w-3.5 h-3.5 rotate-45" />
              <span>{downloading ? "Formatting..." : "Download"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive notification alerts logs */}
      {downloadSuccessMessage && (
        <div className={`p-3 text-xs font-semibold text-center border-t transition-all uppercase tracking-wide tracking-wider font-mono ${
          downloadSuccessMessage.includes("success") || downloadSuccessMessage.includes("packaged")
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-pink-500/10 border-pink-500/30 text-pink-400 animate-bounce"
        }`}>
          {downloadSuccessMessage}
        </div>
      )}
    </div>
  );
};
