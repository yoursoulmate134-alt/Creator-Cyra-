import React, { useState } from 'react';
import {
  User,
  Settings,
  Folder,
  Crown,
  Zap,
  Battery,
  Shield,
  Trash2,
  Play,
  RotateCcw,
  Check,
  Smartphone,
} from 'lucide-react';
import { CreatorProfile, PerformanceSettings, SavedProject } from '../../types';

interface ProfileViewProps {
  currentUser: CreatorProfile;
  savedProjects: SavedProject[];
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (projectId: string) => void;
  performanceSettings: PerformanceSettings;
  onUpdatePerformance: (updated: Partial<PerformanceSettings>) => void;
  isPremium: boolean;
  onOpenPremium: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  savedProjects,
  onLoadProject,
  onDeleteProject,
  performanceSettings,
  onUpdatePerformance,
  isPremium,
  onOpenPremium,
}) => {
  const [activeTab, setActiveTab] = useState<'creations' | 'settings'>('creations');
  const [loadedToast, setLoadedToast] = useState(false);

  const handleLoad = (proj: SavedProject) => {
    onLoadProject(proj);
    setLoadedToast(true);
    setTimeout(() => setLoadedToast(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] overflow-y-auto no-scrollbar bg-zinc-950 p-4 pb-20 max-w-md mx-auto">
      {/* Profile Header Card */}
      <div className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display font-bold text-base text-zinc-100">{currentUser.name}</h2>
                {isPremium ? (
                  <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20 font-semibold flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" /> PRO
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">
                    Free Creator
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-400">{currentUser.handle}</span>
            </div>
          </div>

          {!isPremium && (
            <button
              onClick={onOpenPremium}
              className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>₹200 PRO</span>
            </button>
          )}
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">{currentUser.bio}</p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center">
          <div>
            <div className="font-bold text-xs text-zinc-100">{currentUser.followersCount}</div>
            <div className="text-[10px] text-zinc-400">Followers</div>
          </div>
          <div>
            <div className="font-bold text-xs text-zinc-100">{currentUser.followingCount}</div>
            <div className="text-[10px] text-zinc-400">Following</div>
          </div>
          <div>
            <div className="font-bold text-xs text-zinc-100">{savedProjects.length}</div>
            <div className="text-[10px] text-zinc-400">Creations</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-900 rounded-xl my-3 border border-zinc-800">
        <button
          onClick={() => setActiveTab('creations')}
          className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 ${
            activeTab === 'creations' ? 'bg-zinc-800 text-indigo-400 font-semibold shadow-sm' : 'text-zinc-400'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>My 3D Projects ({savedProjects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-zinc-800 text-indigo-400 font-semibold shadow-sm' : 'text-zinc-400'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Performance & Safety</span>
        </button>
      </div>

      {/* Toast */}
      {loadedToast && (
        <div className="mb-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Project loaded into 3D Studio!</span>
        </div>
      )}

      {/* Tab 1: Saved Creations Portfolio */}
      {activeTab === 'creations' && (
        <div className="flex flex-col gap-2.5">
          {savedProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-900">
              No saved projects yet. Go to the Create tab and tap Save to store your designs!
            </div>
          ) : (
            savedProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-between gap-3 shadow-md"
              >
                <img
                  src={proj.thumbnail}
                  alt={proj.name}
                  className="w-16 h-16 rounded-xl object-cover border border-zinc-700 bg-zinc-950 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs text-zinc-100 truncate">{proj.name}</h3>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Updated: {proj.updatedAt}</div>
                  <div className="text-[10px] text-indigo-400/90 mt-1 capitalize">
                    {proj.avatar.style} avatar · {Object.keys(proj.clothing).length} wearable layers
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleLoad(proj)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs transition-colors flex items-center gap-1"
                    title="Load into 3D Workspace"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-xl transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Performance & Safety Settings */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-4">
          {/* Mobile Optimization & Low-End Phone Controls */}
          <div className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Mobile Graphics & Battery Optimizer</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Optimize rendering for older, entry-level, or weaker Android and iOS devices.
            </p>

            {/* Battery Saver */}
            <div className="flex items-center justify-between p-2 bg-zinc-950 rounded-xl">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-medium text-zinc-200">Battery Saver Mode</div>
                  <div className="text-[10px] text-zinc-500">Limits background frame updates</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={performanceSettings.batterySaver}
                onChange={(e) => onUpdatePerformance({ batterySaver: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Reduced Polygon Mode */}
            <div className="flex items-center justify-between p-2 bg-zinc-950 rounded-xl">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-medium text-zinc-200">Reduced Polygons Mode</div>
                  <div className="text-[10px] text-zinc-500">Halves 3D mesh vertices for weak GPUs</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={performanceSettings.reducedPolygons}
                onChange={(e) => onUpdatePerformance({ reducedPolygons: e.target.checked })}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </div>

            {/* Target FPS Limit */}
            <div className="flex items-center justify-between p-2 bg-zinc-950 rounded-xl text-xs">
              <span className="text-zinc-300">Framerate Target:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdatePerformance({ fpsLimit: 30 })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    performanceSettings.fpsLimit === 30
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  30 FPS (Cool Phone)
                </button>
                <button
                  onClick={() => onUpdatePerformance({ fpsLimit: 60 })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    performanceSettings.fpsLimit === 60
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  60 FPS (Silky)
                </button>
              </div>
            </div>
          </div>

          {/* Safety & Content Moderation Shield */}
          <div className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Safety & Anti-Harassment Protections</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Cyra Studio enforces strict automated content moderation on textures, community outfits, and messages. Sexually explicit, abusive, or copyrighted material is blocked.
            </p>
            <div className="p-2.5 bg-zinc-950 rounded-xl text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Automated Image Moderation</span>
              <span className="text-emerald-400 font-medium">Always Active</span>
            </div>
            <div className="p-2.5 bg-zinc-950 rounded-xl text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Anti-Bullying Chat Filters</span>
              <span className="text-emerald-400 font-medium">Always Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
