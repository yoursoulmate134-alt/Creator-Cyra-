import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  Check,
  X,
  Zap,
  Download,
  Layers,
  Palette,
  ShieldCheck,
} from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivatePremium: () => void;
  isPremium: boolean;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onActivatePremium,
  isPremium,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      onActivatePremium();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  const premiumPerks = [
    {
      title: 'Advanced 3D Modeling Tools',
      desc: 'Unlock mesh subdivisions, advanced sculpt deformers, and spatial primitives.',
      icon: Layers,
    },
    {
      title: 'Prismatic & Liquid Chrome Materials',
      desc: 'Access liquid metal, holographic refraction, and high-shine iridescent fabrics.',
      icon: Palette,
    },
    {
      title: 'Unlimited Cyra AI Generations',
      desc: 'Generate endless custom fabric textures, pattern tiles, and complete 3D outfit concepts.',
      icon: Sparkles,
    },
    {
      title: '4K Renders & OBJ 3D Model Exports',
      desc: 'Export high-res transparent snapshots and full 3D models (.OBJ) for Blender and Maya.',
      icon: Download,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-2">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-bold text-lg text-zinc-100">Cyra Creator PRO</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
            Supercharge your mobile 3D fashion studio with pro materials and unlimited AI.
          </p>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="font-display font-black text-2xl text-amber-400">₹200</span>
            <span className="text-xs text-zinc-400">/ one-time creator pass</span>
          </div>
        </div>

        {/* Perks List */}
        <div className="flex flex-col gap-2 my-1">
          {premiumPerks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div key={perk.title} className="flex items-start gap-2.5 p-2 bg-zinc-950/70 rounded-xl border border-zinc-800/80">
                <div className="p-1.5 rounded-lg bg-zinc-900 text-amber-400 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">{perk.title}</div>
                  <div className="text-[10px] text-zinc-400 leading-tight">{perk.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Assurance note */}
        <p className="text-[10px] text-center text-zinc-500 leading-relaxed">
          The basic creator studio, standard avatars, clothing creation, community, messaging, and collaborations remain 100% free forever.
        </p>

        {/* Upgrade / Simulation Button */}
        {isPremium ? (
          <div className="py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4 text-amber-400" />
            <span>PRO Plan Active</span>
          </div>
        ) : (
          <button
            onClick={handleSimulatedPayment}
            disabled={isProcessing || success}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-pink-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {success ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Activated Successfully!</span>
              </>
            ) : isProcessing ? (
              <span>Securing PRO Access...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Upgrade Now for ₹200</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
