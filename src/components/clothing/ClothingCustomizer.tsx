import React, { useRef, useState } from 'react';
import {
  Upload,
  AlertTriangle,
  Sparkles,
  Sliders,
  Check,
  Crown,
  Eye,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  ClothingCategory,
  ClothingItem,
  ClothingType,
  MaterialType,
  PatternType,
} from '../../types';
import { convertImageToSeamlessTexture } from '../../utils/textureGenerator';

interface ClothingCustomizerProps {
  clothing: Record<string, ClothingItem>;
  onChangeClothingItem: (category: ClothingCategory, updated: Partial<ClothingItem>) => void;
  isPremium: boolean;
  onOpenPremium: () => void;
  onOpenTextureLab: () => void;
  onOpenCyraAi: () => void;
}

export const ClothingCustomizer: React.FC<ClothingCustomizerProps> = ({
  clothing,
  onChangeClothingItem,
  isPremium,
  onOpenPremium,
  onOpenTextureLab,
  onOpenCyraAi,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory>('top');
  const [activeTab, setActiveTab] = useState<'items' | 'colors' | 'materials' | 'patterns' | 'upload'>('items');

  // Phone Image Upload & Seamless Texture State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  const [copyrightConfirmed, setCopyrightConfirmed] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const currentItem = clothing[selectedCategory] || {
    id: `${selectedCategory}-default`,
    category: selectedCategory,
    type: 'tshirt',
    name: 'Default Garment',
    color: '#3b82f6',
    material: 'cotton',
    roughness: 0.7,
    metalness: 0.05,
    pattern: 'none',
    patternScale: 3,
    fit: { length: 1.0, puffiness: 1.0, scaleY: 1.0 },
  };

  // Garment Types Catalog
  const clothingCatalog: Record<
    ClothingCategory,
    { type: ClothingType; label: string; desc: string; isPro?: boolean }[]
  > = {
    top: [
      { type: 'hoodie', label: 'Streetwear Hoodie', desc: 'Relaxed oversized fit with hood' },
      { type: 'jacket', label: 'Tech Bomber Jacket', desc: 'Structured zipper lapels' },
      { type: 'tshirt', label: 'Classic Crew Tee', desc: 'Versatile cotton base' },
      { type: 'crop_top', label: 'Fitted Crop Top', desc: 'Summer athletic cut' },
      { type: 'dress', label: 'Flowing Silk Dress', desc: 'Elegant flared silhouette' },
    ],
    bottom: [
      { type: 'pleated_skirt', label: 'Pleated Anime Skirt', desc: 'Sharp accordion folds' },
      { type: 'cargo_pants', label: 'Multi-Pocket Cargos', desc: 'Tactical streetwear' },
      { type: 'jeans', label: 'Straight Denim Jeans', desc: 'Authentic stitch texture' },
      { type: 'skirt', label: 'A-Line Mini Skirt', desc: 'Clean minimal silhouette' },
      { type: 'shorts', label: 'Activewear Shorts', desc: 'Comfortable cut' },
    ],
    shoes: [
      { type: 'sneakers', label: 'Chunky Platform Kicks', desc: 'Bold streetwear soles' },
      { type: 'boots', label: 'Combat Ankle Boots', desc: 'Durable reinforced leather' },
      { type: 'sandals', label: 'Strappy Minimal Sandals', desc: 'Light summer footwear' },
    ],
    accessory: [
      { type: 'headphones', label: 'Neon Studio Headphones', desc: 'Glow rim earcups' },
      { type: 'cyber_wings', label: 'Angular Hologram Wings', desc: 'Sci-fi spatial wings', isPro: true },
      { type: 'glasses', label: 'Cyber Visor Frames', desc: 'Sleek geometric eyewear' },
      { type: 'beret', label: 'Classic Parisian Beret', desc: 'Angled felt fashion hat' },
    ],
    outerwear: [],
  };

  const materials: { id: MaterialType; label: string; roughness: number; metalness: number; isPro?: boolean }[] = [
    { id: 'cotton', label: 'Soft Cotton', roughness: 0.85, metalness: 0.05 },
    { id: 'denim', label: 'Sturdy Denim', roughness: 0.8, metalness: 0.05 },
    { id: 'silk', label: 'Lustrous Silk', roughness: 0.28, metalness: 0.15 },
    { id: 'leather', label: 'Polished Leather', roughness: 0.35, metalness: 0.2 },
    { id: 'metallic', label: 'Reflective Foil', roughness: 0.2, metalness: 0.8 },
    { id: 'velvet', label: 'Deep Matte Velvet', roughness: 0.95, metalness: 0.02 },
    { id: 'holographic', label: 'Prismatic Hologram', roughness: 0.18, metalness: 0.75, isPro: true },
    { id: 'liquid_chrome', label: 'Liquid Chrome Mirror', roughness: 0.05, metalness: 0.95, isPro: true },
  ];

  const patterns: { id: PatternType; label: string }[] = [
    { id: 'none', label: 'Solid Solid' },
    { id: 'cherry_blossom', label: 'Cherry Blossom' },
    { id: 'plaid', label: 'Tartan Plaid' },
    { id: 'houndstooth', label: 'Houndstooth' },
    { id: 'cyber_grid', label: 'Cyber Grid' },
    { id: 'stripes', label: 'Pinstripes' },
    { id: 'dots', label: 'Polka Dots' },
    { id: 'stars', label: 'Cosmic Stars' },
  ];

  const paletteColors = [
    '#27272a', '#fafafa', '#f43f5e', '#ec4899', '#a855f7',
    '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
    '#b45309', '#1e293b', '#ffb7c5', '#7dd3fc',
  ];

  // Handle phone file upload & convert to seamless texture
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!copyrightConfirmed) {
      setModerationWarning('Please check the copyright agreement checkbox before converting.');
      return;
    }

    setIsProcessingUpload(true);
    setModerationWarning(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rawBase64 = reader.result as string;
        setUploadedPreview(rawBase64);

        // Call backend automated moderation check
        const modRes = await fetch('/api/cyra/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: `User fabric upload for 3D ${selectedCategory}: ${file.name}`,
          }),
        });
        const modData = await modRes.json();

        if (!modData.approved) {
          setModerationWarning(`Upload flagged: ${modData.flags.join(', ')}`);
          setIsProcessingUpload(false);
          return;
        }

        // Convert uploaded photo to seamless repeating pattern
        const seamlessUrl = await convertImageToSeamlessTexture(rawBase64, 512, 0.25);

        onChangeClothingItem(selectedCategory, {
          pattern: 'custom_uploaded',
          patternCanvasUrl: seamlessUrl,
        });

        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err: any) {
        setModerationWarning('Could not process image into seamless texture. Please try another image.');
      } finally {
        setIsProcessingUpload(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] overflow-y-auto no-scrollbar bg-zinc-950 p-4 pb-20 max-w-md mx-auto">
      {/* Category Segmented Bar */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl mb-3 border border-zinc-800">
        {(['top', 'bottom', 'shoes', 'accessory'] as ClothingCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              selectedCategory === cat
                ? 'bg-zinc-800 text-indigo-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Customizer Subtabs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-900/90 rounded-xl mb-3 border border-zinc-800/80">
        <button
          onClick={() => setActiveTab('items')}
          className={`py-1 text-[11px] font-medium rounded-lg ${
            activeTab === 'items' ? 'bg-zinc-800 text-indigo-300' : 'text-zinc-400'
          }`}
        >
          Style
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`py-1 text-[11px] font-medium rounded-lg ${
            activeTab === 'colors' ? 'bg-zinc-800 text-indigo-300' : 'text-zinc-400'
          }`}
        >
          Colors
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`py-1 text-[11px] font-medium rounded-lg ${
            activeTab === 'materials' ? 'bg-zinc-800 text-indigo-300' : 'text-zinc-400'
          }`}
        >
          Fabric
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`py-1 text-[11px] font-medium rounded-lg ${
            activeTab === 'patterns' ? 'bg-zinc-800 text-indigo-300' : 'text-zinc-400'
          }`}
        >
          Patterns
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`py-1 text-[11px] font-medium rounded-lg ${
            activeTab === 'upload' ? 'bg-zinc-800 text-pink-400 font-semibold' : 'text-zinc-400'
          }`}
        >
          Upload
        </button>
      </div>

      {/* Subtab 1: Garment Styles Catalog */}
      {activeTab === 'items' && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-zinc-400 font-medium">Choose {selectedCategory} silhouette:</div>
          <div className="grid grid-cols-1 gap-2">
            {clothingCatalog[selectedCategory]?.map((g) => {
              const isSelected = currentItem.type === g.type;
              return (
                <button
                  key={g.type}
                  onClick={() => {
                    if (g.isPro && !isPremium) {
                      onOpenPremium();
                    } else {
                      onChangeClothingItem(selectedCategory, { type: g.type, name: g.label });
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{g.label}</span>
                      {g.isPro && (
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20 flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> PRO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">{g.desc}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              );
            })}
          </div>

          {/* Fit & Puffiness Sliders */}
          <div className="mt-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Garment Fit & Length</span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Length / Crop</span>
                <span className="font-mono">{currentItem.fit.length.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.35"
                step="0.05"
                value={currentItem.fit.length}
                onChange={(e) =>
                  onChangeClothingItem(selectedCategory, {
                    fit: { ...currentItem.fit, length: parseFloat(e.target.value) },
                  })
                }
                className="accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Oversized Puffiness</span>
                <span className="font-mono">{currentItem.fit.puffiness.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.9"
                max="1.3"
                step="0.05"
                value={currentItem.fit.puffiness}
                onChange={(e) =>
                  onChangeClothingItem(selectedCategory, {
                    fit: { ...currentItem.fit, puffiness: parseFloat(e.target.value) },
                  })
                }
                className="accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Colors */}
      {activeTab === 'colors' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Base Fabric Color</span>
            <span className="text-xs font-mono text-zinc-400">{currentItem.color}</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {paletteColors.map((hex) => (
              <button
                key={hex}
                onClick={() => onChangeClothingItem(selectedCategory, { color: hex })}
                className={`w-9 h-9 rounded-xl border transition-all ${
                  currentItem.color.toLowerCase() === hex.toLowerCase()
                    ? 'border-indigo-400 scale-110 shadow-lg ring-2 ring-indigo-500/30'
                    : 'border-zinc-800 hover:scale-105'
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-zinc-400">Custom Hex:</span>
            <input
              type="color"
              value={currentItem.color}
              onChange={(e) => onChangeClothingItem(selectedCategory, { color: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={currentItem.color}
              onChange={(e) => onChangeClothingItem(selectedCategory, { color: e.target.value })}
              className="bg-zinc-900 border border-zinc-800 text-xs px-2 py-1 rounded-lg text-zinc-200 font-mono w-24"
            />
          </div>
        </div>
      )}

      {/* Subtab 3: Materials & Shading */}
      {activeTab === 'materials' && (
        <div className="flex flex-col gap-3">
          <div className="text-xs text-zinc-400 font-medium">Select fabric weave and surface reflectivity:</div>
          <div className="grid grid-cols-2 gap-2">
            {materials.map((mat) => {
              const isSelected = currentItem.material === mat.id;
              return (
                <button
                  key={mat.id}
                  onClick={() => {
                    if (mat.isPro && !isPremium) {
                      onOpenPremium();
                    } else {
                      onChangeClothingItem(selectedCategory, {
                        material: mat.id,
                        roughness: mat.roughness,
                        metalness: mat.metalness,
                      });
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{mat.label}</span>
                    {mat.isPro && (
                      <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20">
                        ₹200
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Roughness {(mat.roughness * 100).toFixed(0)}% · Metal {(mat.metalness * 100).toFixed(0)}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 4: Patterns & Texture Lab */}
      {activeTab === 'patterns' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Seamless Patterns</span>
            <button
              onClick={onOpenTextureLab}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Texture Lab</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {patterns.map((p) => {
              const isSelected = currentItem.pattern === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() =>
                    onChangeClothingItem(selectedCategory, {
                      pattern: p.id,
                      patternCanvasUrl: undefined,
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-medium">{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Repeat scale */}
          {currentItem.pattern !== 'none' && (
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>Pattern Tiling Repeat</span>
                <span className="font-mono text-zinc-400">{currentItem.patternScale}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={currentItem.patternScale}
                onChange={(e) =>
                  onChangeClothingItem(selectedCategory, {
                    patternScale: parseInt(e.target.value, 10),
                  })
                }
                className="accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* Cyra AI suggestion box */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-pink-300">Need custom fabric design?</div>
              <div className="text-[11px] text-zinc-400">Ask Cyra AI to generate cherry blossoms, grids, or weaves</div>
            </div>
            <button
              onClick={onOpenCyraAi}
              className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-medium shrink-0"
            >
              Ask Cyra
            </button>
          </div>
        </div>
      )}

      {/* Subtab 5: Upload Phone Image & Convert to Texture */}
      {activeTab === 'upload' && (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold text-zinc-200">
            Convert Phone Photo to 3D Fabric Texture
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Upload any photo from your phone (fabric swatch, art sketch, or wallpaper pattern). Cyra Studio will
            automatically cross-fade the edges into a seamless repeating texture tile.
          </p>

          {/* Safety & Copyright Warning Notice */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="leading-snug">
              <span className="font-semibold">Copyright & Safety Policy:</span> You must only upload images you own or
              have explicit permission to use. Cyra AI automatically scans uploads for moderation compliance.
            </div>
          </div>

          {/* Copyright Agreement Checkbox */}
          <label className="flex items-center gap-2 p-2 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer">
            <input
              type="checkbox"
              checked={copyrightConfirmed}
              onChange={(e) => setCopyrightConfirmed(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
            />
            <span className="text-xs text-zinc-300">
              I certify that I have the right to use this image and it complies with community guidelines.
            </span>
          </label>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Upload Button */}
          <button
            onClick={() => {
              if (!copyrightConfirmed) {
                setModerationWarning('Please confirm the copyright agreement checkbox first.');
                return;
              }
              fileInputRef.current?.click();
            }}
            disabled={isProcessingUpload}
            className={`w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
              copyrightConfirmed
                ? 'border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300'
                : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 opacity-70 cursor-not-allowed'
            }`}
          >
            {isProcessingUpload ? (
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            ) : (
              <Upload className="w-6 h-6 text-indigo-400" />
            )}
            <span className="text-xs font-semibold">
              {isProcessingUpload ? 'Converting to Seamless Texture...' : 'Select Image from Phone'}
            </span>
            <span className="text-[10px] text-zinc-400">Supports JPG, PNG, WEBP</span>
          </button>

          {/* Moderation error banner */}
          {moderationWarning && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{moderationWarning}</span>
            </div>
          )}

          {/* Success message */}
          {uploadSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Moderation approved! Seamless fabric texture applied to {selectedCategory}.</span>
            </div>
          )}

          {/* Preview of uploaded texture tile */}
          {uploadedPreview && (
            <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
              <img
                src={uploadedPreview}
                alt="Uploaded Fabric Preview"
                className="w-14 h-14 rounded-lg object-cover border border-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-200 truncate">Uploaded Pattern Tile</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" />
                  <span>Applied seamlessly to {selectedCategory}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
