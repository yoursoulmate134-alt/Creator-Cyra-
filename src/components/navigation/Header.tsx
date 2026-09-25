import React from 'react';
import {
  Sparkles,
  Zap,
  Camera,
  Crown,
  Share2,
  Check,
  HelpCircle,
} from 'lucide-react';
import { PerformanceSettings } from '../../types';

interface HeaderProps {
  isPremium: boolean;
  onOpenPremium: () => void;
  onOpenCyraAi: () => void;
  onSnapshot: () => void;
  onOpenTutorial: () => void;
  performanceSettings: PerformanceSettings;
  onToggleBatterySaver: () => void;
  projectName: string;
}

export const Header: React.FC<HeaderProps> = ({
  isPremium,
  onOpenPremium,
  onOpenCyraAi,
  onSnapshot,
  onOpenTutorial,
  performanceSettings,
  onToggleBatterySaver,
  projectName,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Cyra Creator Studio',
        text: `Check out my 3D outfit "${projectName}" created in Cyra Studio!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 py-2 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900">
      {/* Brand & Project */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <span className="font-display font-black text-white text-base tracking-tighter">C</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-sm tracking-tight text-zinc-100 truncate">
              Cyra Studio
            </span>
            {isPremium ? (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                <Crown className="w-2.5 h-2.5" /> PRO
              </span>
            ) : (
              <button
                onClick={onOpenPremium}
                className="text-[10px] font-semibold text-pink-400 hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 px-1.5 py-0.5 rounded transition-colors border border-pink-500/20"
              >
                ₹200 PRO
              </button>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 truncate max-w-[140px] sm:max-w-[200px]">
            {projectName}
          </p>
        </div>
      </div>

      {/* Header Quick Actions */}
      <div className="flex items-center gap-1.5">
        {/* Battery / Low Power Mode Quick Toggle */}
        <button
          onClick={onToggleBatterySaver}
          title={performanceSettings.batterySaver ? 'Battery Saver Active (Optimized for low-end phones)' : 'Standard Graphics'}
          className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs ${
            performanceSettings.batterySaver
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline text-[11px]">
            {performanceSettings.batterySaver ? 'Lite 60fps' : 'Auto'}
          </span>
        </button>

        {/* Cyra AI Assistant Button */}
        <button
          onClick={onOpenCyraAi}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cyra AI</span>
        </button>

        {/* Help & Swipe Gesture Tutorial Button */}
        <button
          onClick={onOpenTutorial}
          title="3D Gestures Guide & Tutorial"
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-indigo-400 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          title="Share Creation"
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>

        {/* Snapshot / Render Button */}
        <button
          onClick={onSnapshot}
          title="Capture Render Snapshot"
          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center gap-1"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden xs:inline text-[11px]">Render</span>
        </button>
      </div>
    </header>
  );
};
