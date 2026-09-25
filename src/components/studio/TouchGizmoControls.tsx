import React from 'react';
import {
  Move,
  RotateCw,
  Maximize2,
  Box,
  Cylinder,
  Grid,
  X,
  Plus,
} from 'lucide-react';

interface TouchGizmoControlsProps {
  selectedPart: string | null;
  onDeselect: () => void;
  onTransform: (action: 'moveX' | 'moveY' | 'scale' | 'rotateY', delta: number) => void;
  onAddPrimitive: (type: 'cube' | 'cylinder' | 'cloth_patch') => void;
  isPremium: boolean;
  onOpenPremium: () => void;
  onOpenTutorial?: () => void;
}

export const TouchGizmoControls: React.FC<TouchGizmoControlsProps> = ({
  selectedPart,
  onDeselect,
  onTransform,
  onAddPrimitive,
  isPremium,
  onOpenPremium,
  onOpenTutorial,
}) => {
  const [showAddMenu, setShowAddMenu] = React.useState(false);

  return (
    <div className="absolute top-3 left-3 right-3 pointer-events-none flex flex-col gap-2 z-20">
      <div className="flex items-center justify-between">
        {/* Selected Part Badge & Transforms */}
        {selectedPart ? (
          <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-zinc-900/90 backdrop-blur-md rounded-xl border border-zinc-800 text-xs shadow-xl animate-in fade-in">
            <span className="font-medium text-indigo-300 px-1 truncate max-w-[120px]">
              {selectedPart.replace(/^(Clothing_|Avatar_|Custom_)/, '')}
            </span>

            {/* Move X */}
            <div className="flex items-center bg-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => onTransform('moveX', -0.05)}
                className="px-1.5 py-1 text-zinc-300 hover:text-white active:bg-zinc-700 rounded text-[11px]"
                title="Move Left"
              >
                ←
              </button>
              <Move className="w-3 h-3 text-zinc-400 mx-0.5" />
              <button
                onClick={() => onTransform('moveX', 0.05)}
                className="px-1.5 py-1 text-zinc-300 hover:text-white active:bg-zinc-700 rounded text-[11px]"
                title="Move Right"
              >
                →
              </button>
            </div>

            {/* Move Y */}
            <div className="flex items-center bg-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => onTransform('moveY', -0.05)}
                className="px-1.5 py-1 text-zinc-300 hover:text-white active:bg-zinc-700 rounded text-[11px]"
                title="Move Down"
              >
                ↓
              </button>
              <span className="text-[10px] text-zinc-400 font-mono">Y</span>
              <button
                onClick={() => onTransform('moveY', 0.05)}
                className="px-1.5 py-1 text-zinc-300 hover:text-white active:bg-zinc-700 rounded text-[11px]"
                title="Move Up"
              >
                ↑
              </button>
            </div>

            {/* Rotate Y */}
            <button
              onClick={() => onTransform('rotateY', 0.2)}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg"
              title="Rotate 15°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Scale */}
            <div className="flex items-center bg-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => onTransform('scale', -0.05)}
                className="px-1.5 py-1 text-zinc-300 hover:text-white active:bg-zinc-700 rounded text-[11px]"
                title="Scale Down"
              >
                -
              </button>
              <Maximize2 className="w-3 h-3 text-zinc-400 mx-0.5" />
              <button
                onClick={() => onTransform('scale', 0.05)}
                className="px-1.5 py-1 text-zinc-300 hover:text-white active:bg-zinc-700 rounded text-[11px]"
                title="Scale Up"
              >
                +
              </button>
            </div>

            {/* Deselect */}
            <button
              onClick={onDeselect}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
              title="Deselect"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenTutorial}
            className="pointer-events-auto text-[11px] text-zinc-300 hover:text-white bg-zinc-950/80 hover:bg-zinc-900 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-zinc-800/80 flex items-center gap-1.5 transition-colors"
          >
            <span>👉 Tap clothing to edit</span>
            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded font-medium border border-indigo-500/20">
              Gestures ?
            </span>
          </button>
        )}

        {/* 3D Modeling Primitives Tool */}
        <div className="relative pointer-events-auto ml-auto">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-xs border border-zinc-800 backdrop-blur-md shadow-lg"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ 3D Mesh</span>
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 shadow-2xl z-30 flex flex-col gap-1">
              <div className="text-[10px] font-semibold text-zinc-400 px-2 py-1">
                Add 3D Modeling Primitive
              </div>
              <button
                onClick={() => {
                  onAddPrimitive('cube');
                  setShowAddMenu(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg text-left"
              >
                <Box className="w-3.5 h-3.5 text-indigo-400" />
                <span>3D Box / Block</span>
              </button>
              <button
                onClick={() => {
                  onAddPrimitive('cylinder');
                  setShowAddMenu(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg text-left"
              >
                <Cylinder className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cylinder / Cuff</span>
              </button>
              <button
                onClick={() => {
                  onAddPrimitive('cloth_patch');
                  setShowAddMenu(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg text-left"
              >
                <Grid className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cloth Patch Sheet</span>
              </button>
              {!isPremium && (
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    onOpenPremium();
                  }}
                  className="mt-1 pt-1 border-t border-zinc-800 text-[10px] text-pink-400 hover:underline px-2 py-1 flex items-center justify-between"
                >
                  <span>Advanced Sculpt Mesh</span>
                  <span className="font-bold">₹200</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
