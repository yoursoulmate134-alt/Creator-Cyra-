import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Crown,
  Check,
  RefreshCw,
  Palette,
  Lightbulb,
  Shirt,
  HelpCircle,
} from 'lucide-react';
import {
  AvatarState,
  ClothingCategory,
  ClothingItem,
  CyraAiMessage,
  LightingPreset,
} from '../../types';
import { generatePatternCanvasUrl } from '../../utils/textureGenerator';

interface CyraAiPanelProps {
  avatar: AvatarState;
  clothing: Record<string, ClothingItem>;
  isPremium: boolean;
  onOpenPremium: () => void;
  onApplyOutfitConcept: (outfitData: any) => void;
  onApplyTextureToClothing: (category: ClothingCategory, patternUrl: string, name: string) => void;
}

export const CyraAiPanel: React.FC<CyraAiPanelProps> = ({
  avatar,
  clothing,
  isPremium,
  onOpenPremium,
  onApplyOutfitConcept,
  onApplyTextureToClothing,
}) => {
  const [messages, setMessages] = useState<CyraAiMessage[]>([
    {
      id: 'init-1',
      sender: 'cyra',
      text: "Hi! I'm Cyra, your 3D creative companion. I can design custom fabric textures, generate cohesive fashion concepts, suggest color harmonies, or explain any 3D tool. How can we elevate your avatar today?",
      timestamp: 'Just now',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(1);
  const freeLimit = 5;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    if (!isPremium && generationsUsed >= freeLimit) {
      onOpenPremium();
      return;
    }

    const userMsg: CyraAiMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);
    setGenerationsUsed((prev) => prev + 1);

    try {
      // Check if prompt is asking for a texture
      const lower = query.toLowerCase();
      if (lower.includes('texture') || lower.includes('pattern') || lower.includes('fabric')) {
        const texRes = await fetch('/api/cyra/generate-texture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            clothingType: 'top',
          }),
        });
        const texData = await texRes.json();
        if (texData.texture) {
          const t = texData.texture;
          const canvasUrl = generatePatternCanvasUrl(
            t.patternType || 'cherry_blossom',
            t.primaryColor || '#ff99b6',
            t.backgroundColor || '#fff0f5',
            512
          );

          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: 'cyra',
              text: `Here is a custom texture based on your request: "${t.name}"! ${t.description}. Would you like to apply it directly to your clothing?`,
              timestamp: 'Just now',
              generatedTexture: {
                name: t.name,
                patternType: t.patternType,
                primaryColor: t.primaryColor,
                secondaryColor: t.backgroundColor,
                roughness: t.roughness,
                metalness: t.metalness,
                canvasUrl,
              },
            },
          ]);
          setIsLoading(false);
          return;
        }
      }

      // Check if prompt is asking for complete outfit concept
      if (lower.includes('outfit') || lower.includes('concept') || lower.includes('look')) {
        const outfitRes = await fetch('/api/cyra/outfit-concept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: query,
          }),
        });
        const outfitData = await outfitRes.json();
        if (outfitData.outfit) {
          const o = outfitData.outfit;
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: 'cyra',
              text: `I designed a complete 3D look for you: "${o.outfitTitle}". ${o.styleNotes}`,
              timestamp: 'Just now',
              suggestedOutfit: o,
            },
          ]);
          setIsLoading(false);
          return;
        }
      }

      // General intelligent chat & 3D explanation
      const chatRes = await fetch('/api/cyra/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          avatarContext: {
            style: avatar.style,
            currentPose: avatar.currentPose,
            clothingSummary: Object.values(clothing).map((c) => `${c.category}: ${c.name} (${c.material})`),
          },
        }),
      });

      const chatData = await chatRes.json();
      const reply = chatData.reply || chatData.fallback || "I've styled your idea! Let's keep refining the 3D details.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'cyra',
          text: reply,
          timestamp: 'Just now',
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'cyra',
          text: 'Here is a quick creative tip: try balancing a high-contrast neon hue on accessories with matte dark fabrics to give your 3D avatar instant high-fashion presence!',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '🌸 Pastel Cherry Blossom Texture', prompt: 'Create a cute pastel cherry blossom fabric texture for a silk top' },
    { label: '⚡ Cyberpunk Outfit Concept', prompt: 'Generate a futuristic Cyberpunk streetwear outfit concept' },
    { label: '❓ Explain Normal Maps & Roughness', prompt: 'Explain how roughness, metalness, and 3D normal maps work for mobile fashion creators in simple terms' },
    { label: '🎨 Color Palette Recommendation', prompt: 'Suggest color combinations that match my avatar’s current hair and eyes' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] bg-zinc-950 p-3 max-w-md mx-auto">
      {/* Cyra Header & Quota Card */}
      <div className="p-3 bg-gradient-to-r from-purple-950/40 via-zinc-900 to-pink-950/40 rounded-2xl border border-purple-500/20 flex items-center justify-between shadow-lg mb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-zinc-100">Cyra AI Assistant</span>
              <span className="text-[10px] text-pink-400 bg-pink-500/10 px-1.5 py-0.2 rounded font-medium">
                3D Creative AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Powered by Gemini 3.8</p>
          </div>
        </div>

        {/* Free Generation Quota Tracker */}
        <div className="text-right">
          <div className="text-[11px] text-zinc-400 font-medium">
            {isPremium ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Unlimited PRO
              </span>
            ) : (
              <span>Free Quota: {Math.max(0, freeLimit - generationsUsed)}/{freeLimit}</span>
            )}
          </div>
          {!isPremium && (
            <button
              onClick={onOpenPremium}
              className="text-[10px] text-pink-400 hover:text-pink-300 font-semibold underline"
            >
              Unlock Unlimited (₹200)
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pr-1 pb-2">
        {messages.map((msg) => {
          const isCyra = msg.sender === 'cyra';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 max-w-[92%] ${
                isCyra ? 'self-start' : 'self-end flex-row-reverse'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                  isCyra
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isCyra ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  isCyra
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                <div>{msg.text}</div>

                {/* Cyra Generated Texture Card */}
                {msg.generatedTexture && (
                  <div className="mt-2.5 p-2 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={msg.generatedTexture.canvasUrl}
                        alt="Generated Pattern Tile"
                        className="w-14 h-14 rounded-lg object-cover border border-zinc-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-zinc-100 truncate text-[11px]">
                          {msg.generatedTexture.name}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          Colors: {msg.generatedTexture.primaryColor} · {msg.generatedTexture.secondaryColor}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-zinc-800/80">
                      <button
                        onClick={() =>
                          onApplyTextureToClothing('top', msg.generatedTexture!.canvasUrl, msg.generatedTexture!.name)
                        }
                        className="py-1 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-medium flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply to Top</span>
                      </button>
                      <button
                        onClick={() =>
                          onApplyTextureToClothing('bottom', msg.generatedTexture!.canvasUrl, msg.generatedTexture!.name)
                        }
                        className="py-1 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply to Bottom</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggested Outfit Concept Card */}
                {msg.suggestedOutfit && (
                  <div className="mt-2.5 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-100 text-xs">
                        {msg.suggestedOutfit.outfitTitle}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-medium">
                        Theme: {msg.suggestedOutfit.theme}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-300">
                      <div>Top: {msg.suggestedOutfit.top?.type} ({msg.suggestedOutfit.top?.material})</div>
                      <div>Bottom: {msg.suggestedOutfit.bottom?.type}</div>
                      <div>Shoes: {msg.suggestedOutfit.shoes?.type}</div>
                      <div>Accessory: {msg.suggestedOutfit.accessory?.type}</div>
                    </div>

                    <button
                      onClick={() => onApplyOutfitConcept(msg.suggestedOutfit)}
                      className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 mt-1 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply Complete Look to 3D Avatar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 self-start p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>Cyra is crafting fashion suggestions...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 shrink-0">
        {quickPrompts.map((qp) => (
          <button
            key={qp.label}
            onClick={() => handleSendMessage(qp.prompt)}
            className="text-[11px] text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl px-2.5 py-1 whitespace-nowrap transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-900 shrink-0">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Ask Cyra for textures, concepts, or 3D tips..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || isLoading}
          className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl disabled:opacity-50 transition-all shadow-md active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
