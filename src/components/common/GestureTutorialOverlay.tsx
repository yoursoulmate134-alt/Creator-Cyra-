import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Move,
  Maximize2,
  MousePointer,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Smartphone,
  Eye,
  Check,
} from 'lucide-react';

interface TutorialStep {
  title: string;
  subtitle: string;
  instruction: string;
  icon: React.ComponentType<{ className?: string }>;
  animationType: 'orbit' | 'pinch' | 'tap' | 'gizmo';
  tips: string[];
}

interface GestureTutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}

export const GestureTutorialOverlay: React.FC<GestureTutorialOverlayProps> = ({
  isOpen,
  onClose,
  onFinish,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const steps: TutorialStep[] = [
    {
      title: '360° Orbit & Camera Rotation',
      subtitle: 'One-Finger Drag Gesture',
      instruction: 'Swipe across the screen with one finger to orbit around your 3D avatar and examine outfit drape from any angle.',
      icon: RotateCcw,
      animationType: 'orbit',
      tips: [
        'Drag horizontally to spin 360°',
        'Drag vertically to look up or down',
        'Tap the camera icon for quick angle presets',
      ],
    },
    {
      title: 'Pinch to Zoom & Scale View',
      subtitle: 'Two-Finger Pinch Gesture',
      instruction: 'Place two fingers on the screen and pinch inward to zoom out, or spread outward to zoom in on intricate fashion textures and jewelry.',
      icon: Maximize2,
      animationType: 'pinch',
      tips: [
        'Pinch in for full silhouette & footwear overview',
        'Pinch out to inspect seam stitching & eye glints',
        'Desktop trackpads and mouse wheels also zoom smoothly',
      ],
    },
    {
      title: 'Touch to Select Garments',
      subtitle: 'Tap Raycasting Selection',
      instruction: 'Tap directly on any body part, hoodie, skirt, or sneakers to select that 3D layer and reveal on-screen transformation controls.',
      icon: MousePointer,
      animationType: 'tap',
      tips: [
        'Tap top clothing, bottom pants, or shoes directly',
        'Selected part name appears in the top gizmo toolbar',
        'Tap empty space or the (X) button to deselect',
      ],
    },
    {
      title: '3D Gizmo Move, Rotate & Scale',
      subtitle: 'Touchscreen Transform Buttons',
      instruction: 'Use the quick gizmo bar at the top to slide items along X and Y axes, rotate garments 15°, or scale custom 3D primitive blocks.',
      icon: Move,
      animationType: 'gizmo',
      tips: [
        'Use [←] and [→] buttons to move horizontally',
        'Use [↑] and [↓] to adjust garment drape height',
        'Tap [+ 3D Mesh] to add cubes, cuffs, and cloth patches',
      ],
    },
  ];

  if (!isOpen) return null;

  // Touch Swipe Handlers (Swipe left/right to change tutorial slides)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 45) {
      // Swiped left -> Next
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleComplete();
      }
    } else if (diff < -45) {
      // Swiped right -> Prev
      if (currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    }
    setTouchStartX(null);
  };

  const handleComplete = () => {
    localStorage.setItem('cyra_tutorial_seen', 'true');
    onFinish();
    onClose();
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden"
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Touch Gestures Guide ({currentStep + 1}/{steps.length})</span>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg"
            title="Close Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Gesture Animated Diagram */}
        <div className="relative h-44 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Gesture 1: Orbit Animation */}
          {step.animationType === 'orbit' && (
            <div className="relative flex flex-col items-center justify-center">
              {/* Central 3D avatar silhouette circle */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-500/60 flex items-center justify-center bg-indigo-500/10">
                <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
              </div>
              {/* Circular swipe path */}
              <div className="absolute w-28 h-28 rounded-full border border-indigo-400/40 animate-spin [animation-duration:8s]" />
              {/* Animated Finger Indicator */}
              <div className="absolute -bottom-2 animate-bounce flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-zinc-900/90 px-2 py-0.5 rounded-full border border-zinc-700 shadow">
                <span>👈 Swipe Horizontally 👉</span>
              </div>
            </div>
          )}

          {/* Gesture 2: Pinch Animation */}
          {step.animationType === 'pinch' && (
            <div className="relative flex items-center justify-center w-full">
              <div className="relative w-36 h-28 flex items-center justify-center border border-zinc-800 rounded-xl bg-zinc-900/40">
                {/* Expanding / contracting target */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500/30 to-pink-500/30 border border-pink-400/50 flex items-center justify-center animate-pulse">
                  <Maximize2 className="w-6 h-6 text-pink-300" />
                </div>
                {/* Finger touch points */}
                <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50 animate-ping [animation-duration:2s]" />
                <div className="absolute right-4 bottom-4 w-4 h-4 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50 animate-ping [animation-duration:2s]" />
              </div>
              <div className="absolute bottom-2 text-[10px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                Pinch In / Out
              </div>
            </div>
          )}

          {/* Gesture 3: Tap Raycast Animation */}
          {step.animationType === 'tap' && (
            <div className="relative flex flex-col items-center justify-center">
              <div className="w-20 h-24 rounded-2xl bg-zinc-900 border border-indigo-500/50 p-2 flex flex-col items-center justify-between shadow-xl">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/40" />
                <div className="w-12 h-10 rounded-lg bg-indigo-600/30 border border-indigo-400 text-[9px] text-indigo-200 flex items-center justify-center font-mono">
                  Hoodie
                </div>
              </div>
              {/* Tap cursor indicator */}
              <div className="absolute top-12 right-12 w-6 h-6 rounded-full bg-white/20 border border-white flex items-center justify-center shadow-lg animate-ping [animation-duration:1.5s]" />
              <div className="absolute bottom-2 text-[10px] text-indigo-300 font-mono bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                Tap to Select Mesh
              </div>
            </div>
          )}

          {/* Gesture 4: Gizmo Transform Animation */}
          {step.animationType === 'gizmo' && (
            <div className="relative flex flex-col items-center justify-center w-full px-4">
              <div className="flex items-center gap-1.5 p-1.5 bg-zinc-900 rounded-xl border border-indigo-500/40 text-xs shadow-lg">
                <span className="font-semibold text-indigo-300 px-1 text-[11px]">Top</span>
                <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded text-[10px]">←</span>
                <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded text-[10px]">→</span>
                <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded text-[10px]">↑</span>
                <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded text-[10px]">↓</span>
                <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[10px]">+ Scale</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                <span>Zero complex menus needed</span>
              </div>
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="flex flex-col gap-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <StepIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-zinc-100">{step.title}</h3>
              <span className="text-[11px] text-indigo-400 font-medium">{step.subtitle}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed mt-1">{step.instruction}</p>

          {/* Quick bullet points */}
          <div className="flex flex-col gap-1 mt-2 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
            {step.tips.map((tip, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep ? 'w-6 bg-indigo-500' : 'w-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
          {currentStep > 0 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 rounded-xl hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Skip
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md active:scale-95 transition-all"
            >
              <span>Next Gesture</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-lg active:scale-95 transition-all"
            >
              <span>Start Designing in 3D</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
