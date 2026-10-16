import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw,
  Sun,
  Eye,
  Download,
  Save,
  Check,
  Smartphone,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Studio3DEngine } from '../../engine/Studio3DEngine';
import {
  AvatarState,
  ClothingItem,
  LightingPreset,
  PerformanceSettings,
  StudioLighting,
} from '../../types';
import { TouchGizmoControls } from './TouchGizmoControls';
import { exportSceneToOBJ } from '../../utils/objExporter';

interface StudioWorkspaceProps {
  avatar: AvatarState;
  clothing: Record<string, ClothingItem>;
  lighting: StudioLighting;
  performanceSettings: PerformanceSettings;
  isPremium: boolean;
  onOpenPremium: () => void;
  onOpenCyraAi: () => void;
  onSaveProject: (title: string, thumbnail: string) => void;
  onUpdateLighting: (preset: LightingPreset) => void;
  onToggleWireframe: () => void;
  onOpenTutorial?: () => void;
  snapshotTrigger: number;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  avatar,
  clothing,
  lighting,
  performanceSettings,
  isPremium,
  onOpenPremium,
  onOpenCyraAi,
  onSaveProject,
  onUpdateLighting,
  onToggleWireframe,
  onOpenTutorial,
  snapshotTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Studio3DEngine | null>(null);

  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [isTurntable, setIsTurntable] = useState(false);
  const [showLightingMenu, setShowLightingMenu] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [renderPreviewUrl, setRenderPreviewUrl] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('My Cyra Creation');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize 3D Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new Studio3DEngine(
      containerRef.current,
      avatar,
      clothing,
      lighting,
      performanceSettings
    );

    engine.onSelectPart = (part) => {
      setSelectedPart(part);
    };

    engineRef.current = engine;

    
    const handleResize = () => {
      const container = containerRef.current;
      const activeEngine = engineRef.current;
      if (!container || !activeEngine) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width > 0 && height > 0) {
        activeEngine.resize(width, height);
      }
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(handleResize)
      : null;

    if (containerRef.current) {
      resizeObserver?.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    const initialResizeFrame = window.requestAnimationFrame(handleResize);


    return () => {
window.cancelAnimationFrame(initialResizeFrame);
resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Update avatar when props change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateAvatar(avatar);
    }
  }, [avatar]);

  // Update clothing when props change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateClothing(clothing);
    }
  }, [clothing]);

  // Update lighting when props change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.applyLighting(lighting);
    }
  }, [lighting]);

  // Update performance
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPerformanceSettings(performanceSettings);
      engineRef.current.rebuildAvatar();
      engineRef.current.rebuildClothing();
    }
  }, [performanceSettings]);

  // Trigger snapshot when header snapshot button pressed
  useEffect(() => {
    if (snapshotTrigger > 0 && engineRef.current) {
      const img = engineRef.current.captureRenderImage(false);
      setRenderPreviewUrl(img);
      setShowExportModal(true);
    }
  }, [snapshotTrigger]);

  const handleCameraPreset = (preset: 'front' | 'side' | 'back' | 'closeup' | 'shoes') => {
    if (engineRef.current) {
      engineRef.current.setCameraPreset(preset);
    }
    setShowCameraMenu(false);
  };

  const handleToggleTurntable = () => {
    if (engineRef.current) {
      const next = !isTurntable;
      engineRef.current.isTurntableActive = next;
      setIsTurntable(next);
    }
  };

  const handleTransform = (action: 'moveX' | 'moveY' | 'scale' | 'rotateY', delta: number) => {
    if (engineRef.current) {
      engineRef.current.transformSelectedObject(action, delta);
    }
  };

  const handleAddPrimitive = (type: 'cube' | 'cylinder' | 'cloth_patch') => {
    if (engineRef.current) {
      const name = engineRef.current.addPrimitive(type);
      setSelectedPart(name);
    }
  };

  const handleDownloadPNG = (transparent: boolean) => {
    if (!engineRef.current) return;
    const url = engineRef.current.captureRenderImage(transparent);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_render.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportOBJ = () => {
    if (!engineRef.current) return;
    exportSceneToOBJ(engineRef.current.rootGroup, projectTitle);
  };

  const handleSave = () => {
    if (engineRef.current) {
      const thumb = engineRef.current.captureRenderImage(false);
      onSaveProject(projectTitle, thumb);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const lightingPresets: { id: LightingPreset; label: string; color: string }[] = [
    { id: 'studio', label: 'Studio Clean', color: '#ffffff' },
    { id: 'sunset', label: 'Golden Sunset', color: '#f59e0b' },
    { id: 'cyber', label: 'Cyberpunk Neon', color: '#06b6d4' },
    { id: 'neon', label: 'Electric Toxic', color: '#22c55e' },
    { id: 'soft', label: 'Soft Beauty Glow', color: '#fef08a' },
    { id: 'rim', label: 'Dark Rim Dramatic', color: '#38bdf8' },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-105px)] bg-radial from-zinc-900 to-zinc-950 overflow-hidden select-none touch-none">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Touch Gizmo Bar */}
      <TouchGizmoControls
        selectedPart={selectedPart}
        onDeselect={() => setSelectedPart(null)}
        onTransform={handleTransform}
        onAddPrimitive={handleAddPrimitive}
        isPremium={isPremium}
        onOpenPremium={onOpenPremium}
        onOpenTutorial={onOpenTutorial}
      />

      {/* Floating Viewport Quick Controls (Left Column) */}
      <div className="absolute left-3 bottom-14 flex flex-col gap-2 z-20">
        {/* Turntable Auto-Spin Toggle */}
        <button
          onClick={handleToggleTurntable}
          title="Toggle Turntable 360°"
          className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
            isTurntable
              ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white'
          }`}
        >
          <RotateCcw className={`w-4 h-4 ${isTurntable ? 'animate-spin' : ''}`} />
        </button>

        {/* Camera Views Preset */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCameraMenu(!showCameraMenu);
              setShowLightingMenu(false);
            }}
            title="Camera Views"
            className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white backdrop-blur-md shadow-lg transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>

          {showCameraMenu && (
            <div className="absolute left-full bottom-0 ml-2 w-32 bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-2xl z-30 flex flex-col gap-1 text-xs">
              <span className="text-[10px] text-zinc-400 font-semibold px-2 py-0.5">Camera Angle</span>
              <button
                onClick={() => handleCameraPreset('front')}
                className="px-2 py-1.5 hover:bg-zinc-800 rounded-lg text-left text-zinc-200"
              >
                Front View
              </button>
              <button
                onClick={() => handleCameraPreset('closeup')}
                className="px-2 py-1.5 hover:bg-zinc-800 rounded-lg text-left text-zinc-200"
              >
                Face Close-Up
              </button>
              <button
                onClick={() => handleCameraPreset('side')}
                className="px-2 py-1.5 hover:bg-zinc-800 rounded-lg text-left text-zinc-200"
              >
                Side Profile
              </button>
              <button
                onClick={() => handleCameraPreset('shoes')}
                className="px-2 py-1.5 hover:bg-zinc-800 rounded-lg text-left text-zinc-200"
              >
                Footwear Focus
              </button>
              <button
                onClick={() => handleCameraPreset('back')}
                className="px-2 py-1.5 hover:bg-zinc-800 rounded-lg text-left text-zinc-200"
              >
                Back View
              </button>
            </div>
          )}
        </div>

        {/* Lighting Atmosphere Preset */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLightingMenu(!showLightingMenu);
              setShowCameraMenu(false);
            }}
            title="Lighting Presets"
            className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white backdrop-blur-md shadow-lg transition-all"
          >
            <Sun className="w-4 h-4 text-amber-400" />
          </button>

          {showLightingMenu && (
            <div className="absolute left-full bottom-0 ml-2 w-44 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 shadow-2xl z-30 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400 font-semibold px-2 py-0.5">Lighting Mood</span>
              {lightingPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onUpdateLighting(preset.id);
                    setShowLightingMenu(false);
                  }}
                  className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg text-left transition-colors ${
                    lighting.preset === preset.id
                      ? 'bg-zinc-800 text-indigo-300 font-medium'
                      : 'text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Wireframe Toggle for 3D creators */}
        <button
          onClick={onToggleWireframe}
          title={performanceSettings.wireframe ? 'Disable Wireframe' : 'Enable 3D Wireframe'}
          className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
            performanceSettings.wireframe
              ? 'bg-purple-600 border-purple-400 text-white'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Bottom Quick Bar (Right Column) */}
      <div className="absolute right-3 bottom-14 flex flex-col gap-2 z-20 items-end">
        {/* Save Project Button */}
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs backdrop-blur-md shadow-lg transition-all active:scale-95"
        >
          {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saveSuccess ? 'Saved!' : 'Save'}</span>
        </button>

        {/* Quick Advice from Cyra AI */}
        <button
          onClick={onOpenCyraAi}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 text-xs backdrop-blur-md shadow-lg transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Ask Cyra AI</span>
        </button>
      </div>

      {/* High-Res Snapshot & 3D Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-4 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-zinc-100">Export 3D Render</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm px-2 py-1"
              >
                Close
              </button>
            </div>

            {/* Snapshot Preview */}
            {renderPreviewUrl && (
              <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 aspect-square flex items-center justify-center">
                <img
                  src={renderPreviewUrl}
                  alt="Snapshot Render Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Project Name Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-zinc-400 font-medium">Creation Title</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => handleDownloadPNG(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG Image</span>
              </button>

              <button
                onClick={() => handleDownloadPNG(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Transparent PNG</span>
              </button>
            </div>

            {/* 3D Wavefront OBJ Export */}
            <button
              onClick={handleExportOBJ}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export 3D Model (.OBJ) for Blender/Maya</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
