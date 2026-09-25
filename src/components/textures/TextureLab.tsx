import React, { useRef, useState, useEffect } from 'react';
import {
  Sparkles,
  Paintbrush,
  Eraser,
  RotateCcw,
  Check,
  Send,
  Loader2,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { ClothingCategory, ClothingItem, PatternType } from '../../types';
import { generatePatternCanvasUrl } from '../../utils/textureGenerator';

interface TextureLabProps {
  clothing: Record<string, ClothingItem>;
  onApplyTextureToClothing: (category: ClothingCategory, patternUrl: string, name: string) => void;
  isPremium: boolean;
  onOpenPremium: () => void;
}

export const TextureLab: React.FC<TextureLabProps> = ({
  clothing,
  onApplyTextureToClothing,
  isPremium,
  onOpenPremium,
}) => {
  const [targetCategory, setTargetCategory] = useState<ClothingCategory>('top');
  const [mode, setMode] = useState<'ai_generator' | 'hand_paint' | 'presets'>('ai_generator');

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('Create a cute pastel cherry blossom fabric texture');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGeneratedResult, setAiGeneratedResult] = useState<any | null>(null);

  // Hand-Painting Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [brushColor, setBrushColor] = useState('#ec4899');
  const [brushSize, setBrushSize] = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [isSymmetry, setIsSymmetry] = useState(true);
  const [appliedToast, setAppliedToast] = useState(false);

  // Preset patterns
  const presetTemplates = [
    { name: 'Cherry Blossom Silk', pattern: 'cherry_blossom' as PatternType, pri: '#ff99b6', sec: '#fff0f5' },
    { name: 'Tokyo Neon Grid', pattern: 'cyber_grid' as PatternType, pri: '#06b6d4', sec: '#09090b' },
    { name: 'Highland Tartan Plaid', pattern: 'plaid' as PatternType, pri: '#f43f5e', sec: '#18181b' },
    { name: 'Chic Houndstooth', pattern: 'houndstooth' as PatternType, pri: '#fafafa', sec: '#18181b' },
    { name: 'Midnight Starlight', pattern: 'stars' as PatternType, pri: '#fef08a', sec: '#0f172a' },
    { name: 'Cyberpunk Pinstripes', pattern: 'stripes' as PatternType, pri: '#a855f7', sec: '#18181b' },
  ];

  // Initialize paint canvas
  useEffect(() => {
    if (mode === 'hand_paint' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, 512, 512);
      }
    }
  }, [mode]);

  // Cyra AI Generate Texture
  const handleGenerateAiTexture = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/cyra/generate-texture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          clothingType: targetCategory,
        }),
      });
      const data = await res.json();
      if (data.texture) {
        // Generate actual preview data url
        const tex = data.texture;
        const url = generatePatternCanvasUrl(
          tex.patternType || 'cherry_blossom',
          tex.primaryColor || '#ff99b6',
          tex.backgroundColor || '#fff0f5',
          512
        );
        setAiGeneratedResult({ ...tex, previewUrl: url });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Hand Painting Event Handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsPainting(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsPainting(false);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPainting && e.type !== 'pointerdown') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.fillStyle = isEraser ? '#1e1b4b' : brushColor;

    // Draw main point
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    // Symmetry mirror along center X
    if (isSymmetry) {
      const mirrorX = canvas.width - x;
      ctx.beginPath();
      ctx.arc(mirrorX, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const applyCanvasToClothing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    onApplyTextureToClothing(targetCategory, url, 'Hand-Painted Texture');
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2500);
  };

  const applyAiTexture = () => {
    if (!aiGeneratedResult?.previewUrl) return;
    onApplyTextureToClothing(targetCategory, aiGeneratedResult.previewUrl, aiGeneratedResult.name || 'Cyra AI Texture');
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] overflow-y-auto no-scrollbar bg-zinc-950 p-4 pb-20 max-w-md mx-auto">
      {/* Target Garment Picker */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
        <div>
          <h2 className="font-display font-bold text-lg text-zinc-100">Texture & Fabric Lab</h2>
          <p className="text-xs text-zinc-400">Design seamless patterns, paint textures, or use Cyra AI</p>
        </div>
        <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-xl border border-zinc-800 text-xs">
          <span className="text-zinc-400">Apply to:</span>
          <select
            value={targetCategory}
            onChange={(e) => setTargetCategory(e.target.value as ClothingCategory)}
            className="bg-transparent text-indigo-400 font-semibold focus:outline-none capitalize cursor-pointer"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="shoes">Shoes</option>
            <option value="accessory">Accessory</option>
          </select>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900/90 rounded-xl my-3 border border-zinc-800/80">
        <button
          onClick={() => setMode('ai_generator')}
          className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 ${
            mode === 'ai_generator' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-sm' : 'text-zinc-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cyra AI</span>
        </button>
        <button
          onClick={() => setMode('hand_paint')}
          className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 ${
            mode === 'hand_paint' ? 'bg-zinc-800 text-indigo-300 font-semibold shadow-sm' : 'text-zinc-400'
          }`}
        >
          <Paintbrush className="w-3.5 h-3.5" />
          <span>Paint Studio</span>
        </button>
        <button
          onClick={() => setMode('presets')}
          className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 ${
            mode === 'presets' ? 'bg-zinc-800 text-indigo-300 font-semibold shadow-sm' : 'text-zinc-400'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
      </div>

      {/* Toast */}
      {appliedToast && (
        <div className="mb-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Applied texture directly to 3D {targetCategory}!</span>
        </div>
      )}

      {/* Mode 1: Cyra AI Texture Prompt Generator */}
      {mode === 'ai_generator' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-300">Prompt Cyra for Fabric Texture:</span>
            <div className="relative">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Create a cute pastel cherry blossom fabric texture..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                onClick={handleGenerateAiTexture}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="absolute right-2 bottom-3 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-md disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isGeneratingAi ? 'Generating...' : 'Generate'}</span>
              </button>
            </div>

            {/* Quick Inspiration chips */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {[
                '🌸 Pastel cherry blossom fabric',
                '⚡ Cyberpunk glowing circuit weave',
                '🖤 Gothic velvet damask embroidery',
                '🫐 Y2K metallic butterfly pattern',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setAiPrompt(chip.replace(/^[^\w\s]+\s*/, ''))}
                  className="text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 px-2 py-1 rounded-md transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* AI Result Card */}
          {aiGeneratedResult && (
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-100">{aiGeneratedResult.name}</span>
                  <p className="text-[11px] text-zinc-400">{aiGeneratedResult.description}</p>
                </div>
                <button
                  onClick={applyAiTexture}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply to 3D {targetCategory}</span>
                </button>
              </div>

              {/* Texture Tile Preview */}
              <div className="w-full aspect-square rounded-xl overflow-hidden border border-zinc-800 relative bg-zinc-950">
                <img
                  src={aiGeneratedResult.previewUrl}
                  alt="AI Texture Tile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-zinc-300 font-mono">
                  Seamless UV Tile
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Hand Painting Studio */}
      {mode === 'hand_paint' && (
        <div className="flex flex-col gap-3">
          {/* Painting Toolbar */}
          <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
            {/* Color Palette */}
            <div className="flex items-center gap-1.5">
              {['#ec4899', '#f43f5e', '#a855f7', '#06b6d4', '#22c55e', '#fef08a', '#ffffff'].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setBrushColor(c);
                    setIsEraser(false);
                  }}
                  className={`w-6 h-6 rounded-full border transition-transform ${
                    brushColor === c && !isEraser ? 'scale-125 border-white shadow' : 'border-zinc-700'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={brushColor}
                onChange={(e) => {
                  setBrushColor(e.target.value);
                  setIsEraser(false);
                }}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            {/* Eraser & Symmetry Toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEraser(!isEraser)}
                className={`p-1.5 rounded-lg border ${
                  isEraser ? 'bg-pink-600 text-white border-pink-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsSymmetry(!isSymmetry)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                  isSymmetry ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
                title="Mirror Symmetry"
              >
                Mirror
              </button>
              <button
                onClick={clearCanvas}
                className="p-1.5 bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg"
                title="Clear Canvas"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Paint Canvas */}
          <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-zinc-800 relative shadow-2xl bg-[#1e1b4b] touch-none">
            <canvas
              ref={canvasRef}
              width={512}
              height={512}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              className="w-full h-full cursor-crosshair"
            />
            {isSymmetry && (
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/20 pointer-events-none border-dashed border-l" />
            )}
          </div>

          {/* Brush Size Slider */}
          <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
            <span className="text-zinc-400 text-[11px] shrink-0">Brush Size: {brushSize}px</span>
            <input
              type="range"
              min="2"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
              className="accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer flex-1"
            />
          </div>

          {/* Apply Hand Paint Button */}
          <button
            onClick={applyCanvasToClothing}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply Hand-Painted Pattern to 3D {targetCategory}</span>
          </button>
        </div>
      )}

      {/* Mode 3: Presets Gallery */}
      {mode === 'presets' && (
        <div className="grid grid-cols-2 gap-2">
          {presetTemplates.map((item) => {
            const previewUrl = generatePatternCanvasUrl(item.pattern, item.pri, item.sec, 256);
            return (
              <button
                key={item.name}
                onClick={() => {
                  onApplyTextureToClothing(targetCategory, previewUrl, item.name);
                  setAppliedToast(true);
                  setTimeout(() => setAppliedToast(false), 2500);
                }}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-left transition-all flex flex-col gap-2 group"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                  <img src={previewUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200 truncate">{item.name}</span>
                  <span className="text-[10px] text-indigo-400 font-medium">Apply</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
