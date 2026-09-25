import React from 'react';
import {
  Sparkles,
  Smile,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { AvatarState, AvatarStyle, CharacterPose } from '../../types';

interface AvatarCustomizerProps {
  avatar: AvatarState;
  onChangeAvatar: (updated: Partial<AvatarState>) => void;
  onResetAvatar: () => void;
  isPremium: boolean;
  onOpenPremium: () => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  avatar,
  onChangeAvatar,
  onResetAvatar,
  isPremium,
  onOpenPremium,
}) => {
  const [activeTab, setActiveTab] = React.useState<'appearance' | 'hair' | 'proportions' | 'poses'>('appearance');

  const skinTones = [
    { label: 'Porcelain', color: '#ffede0' },
    { label: 'Peach Cream', color: '#fbe2d3' },
    { label: 'Warm Sand', color: '#eed0b4' },
    { label: 'Honey Gold', color: '#d8a97f' },
    { label: 'Caramel', color: '#b68058' },
    { label: 'Deep Espresso', color: '#684530' },
    { label: 'Obsidian', color: '#3f2b20' },
    { label: 'Fantasy Lilac', color: '#e9d5ff' },
  ];

  const eyeColors = [
    { label: 'Violet', color: '#7c3aed' },
    { label: 'Electric Blue', color: '#06b6d4' },
    { label: 'Emerald', color: '#10b981' },
    { label: 'Ruby Pink', color: '#ec4899' },
    { label: 'Amber Gold', color: '#f59e0b' },
    { label: 'Espresso', color: '#3f2e22' },
  ];

  const hairColors = [
    { label: 'Bubblegum Pink', color: '#ec4899' },
    { label: 'Midnight Black', color: '#18181b' },
    { label: 'Platinum Blonde', color: '#fef08a' },
    { label: 'Chestnut Brown', color: '#78350f' },
    { label: 'Cyber Cyan', color: '#06b6d4' },
    { label: 'Lilac Dream', color: '#a855f7' },
    { label: 'Silver White', color: '#f4f4f5' },
    { label: 'Fiery Crimson', color: '#ef4444' },
  ];

  const hairStyles: { id: AvatarState['hairStyle']; label: string; isPro?: boolean }[] = [
    { id: 'twin_tails', label: 'Twin Tails' },
    { id: 'anime_spikes', label: 'Anime Spikes' },
    { id: 'long_bob', label: 'Long Bob' },
    { id: 'wavy_curls', label: 'Wavy Curls' },
    { id: 'sleek_fade', label: 'Sleek Fade' },
    { id: 'afro_puffs', label: 'Afro Puffs' },
  ];

  const poses: { id: CharacterPose; label: string; desc: string }[] = [
    { id: 'runway_model', label: 'Runway Model', desc: 'Hand on hip, confident stance' },
    { id: 'casual_selfie', label: 'Casual Selfie', desc: 'Hand raised near cheek' },
    { id: 'peace_sign', label: 'Peace Sign', desc: 'Playful cute anime gesture' },
    { id: 'hero_stance', label: 'Hero Stance', desc: 'Solid stance, fists at waist' },
    { id: 'sitting', label: 'Chill Sitting', desc: 'Relaxed seated pose' },
    { id: 't_pose', label: 'T-Pose', desc: 'Neutral rigging calibration' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] overflow-y-auto no-scrollbar bg-zinc-950 p-4 pb-20 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
        <div>
          <h2 className="font-display font-bold text-lg text-zinc-100">Avatar Studio</h2>
          <p className="text-xs text-zinc-400">Customize 3D face, hair, and character proportions</p>
        </div>
        <button
          onClick={onResetAvatar}
          title="Reset to Default"
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900/90 rounded-xl my-3 border border-zinc-800/80">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'appearance' ? 'bg-zinc-800 text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Smile className="w-3.5 h-3.5" />
          <span>Face</span>
        </button>
        <button
          onClick={() => setActiveTab('hair')}
          className={`py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'hair' ? 'bg-zinc-800 text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hair</span>
        </button>
        <button
          onClick={() => setActiveTab('proportions')}
          className={`py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'proportions' ? 'bg-zinc-800 text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Body</span>
        </button>
        <button
          onClick={() => setActiveTab('poses')}
          className={`py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'poses' ? 'bg-zinc-800 text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Poses</span>
        </button>
      </div>

      {/* Tab 1: Appearance (Style, Skin, Eyes) */}
      {activeTab === 'appearance' && (
        <div className="flex flex-col gap-4">
          {/* Character Style Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-zinc-300">Style Aesthetic</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeAvatar({ style: 'anime' })}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  avatar.style === 'anime'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ✨ Stylized Anime
              </button>
              <button
                onClick={() => onChangeAvatar({ style: 'realistic' })}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  avatar.style === 'realistic'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🌟 Semi-Realistic
              </button>
            </div>
          </div>

          {/* Skin Tone Palette */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-zinc-300">Skin Tone</span>
            <div className="grid grid-cols-4 gap-2">
              {skinTones.map((tone) => (
                <button
                  key={tone.color}
                  onClick={() => onChangeAvatar({ skinTone: tone.color })}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                    avatar.skinTone === tone.color
                      ? 'border-indigo-500 bg-zinc-900 ring-2 ring-indigo-500/20'
                      : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full shadow-inner border border-black/20"
                    style={{ backgroundColor: tone.color }}
                  />
                  <span className="text-[10px] text-zinc-400 truncate max-w-full">
                    {tone.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Eye Color */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-zinc-300">Eye Iris Color</span>
            <div className="grid grid-cols-6 gap-2">
              {eyeColors.map((eye) => (
                <button
                  key={eye.color}
                  onClick={() => onChangeAvatar({ eyeColor: eye.color })}
                  className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center border transition-transform ${
                    avatar.eyeColor === eye.color
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-zinc-800 hover:scale-105'
                  }`}
                  style={{ backgroundColor: eye.color }}
                  title={eye.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hair Customizer */}
      {activeTab === 'hair' && (
        <div className="flex flex-col gap-4">
          {/* Hair Style selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-zinc-300">Hair Cut / Style</span>
            <div className="grid grid-cols-2 gap-2">
              {hairStyles.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeAvatar({ hairStyle: item.id })}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all ${
                    avatar.hairStyle === item.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Dye Color */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-zinc-300">Hair Dye Color</span>
            <div className="grid grid-cols-4 gap-2">
              {hairColors.map((hc) => (
                <button
                  key={hc.color}
                  onClick={() => onChangeAvatar({ hairColor: hc.color })}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                    avatar.hairColor === hc.color
                      ? 'border-pink-500 bg-zinc-900 ring-2 ring-pink-500/20'
                      : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full shadow-inner border border-black/20"
                    style={{ backgroundColor: hc.color }}
                  />
                  <span className="text-[10px] text-zinc-400 truncate max-w-full">
                    {hc.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Proportions (Body math) */}
      {activeTab === 'proportions' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">Head Ratio</span>
              <span className="text-zinc-500 font-mono">{avatar.headScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.25"
              step="0.05"
              value={avatar.headScale}
              onChange={(e) => onChangeAvatar({ headScale: parseFloat(e.target.value) })}
              className="accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">Body Height</span>
              <span className="text-zinc-500 font-mono">{avatar.bodyHeight.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.2"
              step="0.05"
              value={avatar.bodyHeight}
              onChange={(e) => onChangeAvatar({ bodyHeight: parseFloat(e.target.value) })}
              className="accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">Shoulder Width</span>
              <span className="text-zinc-500 font-mono">{avatar.shoulderWidth.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.25"
              step="0.05"
              value={avatar.shoulderWidth}
              onChange={(e) => onChangeAvatar({ shoulderWidth: parseFloat(e.target.value) })}
              className="accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">Waist & Hip Fit</span>
              <span className="text-zinc-500 font-mono">{avatar.waistWidth.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={avatar.waistWidth}
              onChange={(e) => onChangeAvatar({ waistWidth: parseFloat(e.target.value) })}
              className="accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Poses */}
      {activeTab === 'poses' && (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-zinc-400">
            Select a dynamic pose to view how garments drape and capture fashion snapshots:
          </span>
          <div className="grid grid-cols-1 gap-2">
            {poses.map((pose) => (
              <button
                key={pose.id}
                onClick={() => onChangeAvatar({ currentPose: pose.id })}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  avatar.currentPose === pose.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{pose.label}</div>
                  <div className="text-[11px] text-zinc-400">{pose.desc}</div>
                </div>
                {avatar.currentPose === pose.id && (
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-md font-medium">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
