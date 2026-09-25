export type AppSection =
  | 'create'
  | 'avatar'
  | 'clothing'
  | 'textures'
  | 'cyra_ai'
  | 'community'
  | 'messages'
  | 'profile';

export type AvatarStyle = 'anime' | 'realistic';

export type CharacterPose =
  | 't_pose'
  | 'runway_model'
  | 'casual_selfie'
  | 'hero_stance'
  | 'sitting'
  | 'peace_sign';

export type ClothingCategory = 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear';

export type ClothingType =
  // Tops
  | 'tshirt'
  | 'hoodie'
  | 'crop_top'
  | 'jacket'
  | 'dress'
  // Bottoms
  | 'jeans'
  | 'cargo_pants'
  | 'skirt'
  | 'shorts'
  | 'pleated_skirt'
  // Shoes
  | 'sneakers'
  | 'boots'
  | 'sandals'
  // Accessories
  | 'headphones'
  | 'cyber_wings'
  | 'glasses'
  | 'beret';

export type MaterialType =
  | 'cotton'
  | 'silk'
  | 'denim'
  | 'leather'
  | 'metallic'
  | 'velvet'
  | 'holographic' // Premium
  | 'liquid_chrome'; // Premium

export type PatternType =
  | 'none'
  | 'cherry_blossom'
  | 'plaid'
  | 'houndstooth'
  | 'stripes'
  | 'dots'
  | 'cyber_grid'
  | 'camo'
  | 'stars'
  | 'custom_uploaded';

export interface ClothingItem {
  id: string;
  category: ClothingCategory;
  type: ClothingType;
  name: string;
  color: string;
  material: MaterialType;
  roughness: number;
  metalness: number;
  pattern: PatternType;
  patternScale: number;
  patternCanvasUrl?: string;
  fit: {
    length: number;
    puffiness: number;
    scaleY: number;
  };
  isPremium?: boolean;
}

export interface AvatarState {
  style: AvatarStyle;
  skinTone: string;
  eyeColor: string;
  hairStyle: 'anime_spikes' | 'long_bob' | 'twin_tails' | 'sleek_fade' | 'wavy_curls' | 'afro_puffs';
  hairColor: string;
  hairSecondaryColor?: string;
  headScale: number;
  bodyHeight: number;
  shoulderWidth: number;
  waistWidth: number;
  currentPose: CharacterPose;
}

export type LightingPreset = 'studio' | 'sunset' | 'cyber' | 'neon' | 'soft' | 'rim';

export interface StudioLighting {
  preset: LightingPreset;
  intensity: number;
  ambientIntensity: number;
  mainColor: string;
  rimColor: string;
  showShadows: boolean;
}

export interface PerformanceSettings {
  mode: 'auto' | 'high' | 'medium' | 'low';
  batterySaver: boolean;
  reducedPolygons: boolean;
  textureResolution: '512' | '1024' | '2048';
  fpsLimit: 30 | 60;
  wireframe: boolean;
  lowPowerMode?: boolean;
}

export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  creationsCount: number;
  isPremium: boolean;
  isFollowing?: boolean;
  badges: string[];
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  author: CreatorProfile;
  title: string;
  description: string;
  tags: string[];
  likes: number;
  isLiked?: boolean;
  comments: CommunityComment[];
  thumbnail: string;
  outfitSnapshot: {
    avatar: AvatarState;
    clothing: Record<string, ClothingItem>;
    lightingPreset: LightingPreset;
  };
  allowsCollaboration: boolean;
  remixCount: number;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isCollabInvite?: boolean;
  collabTitle?: string;
  collabAccepted?: boolean;
  collabDeclined?: boolean;
}

export interface ChatThread {
  id: string;
  participant: CreatorProfile;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: DirectMessage[];
}

export interface CyraAiMessage {
  id: string;
  sender: 'cyra' | 'user';
  text: string;
  timestamp: string;
  generatedTexture?: {
    name: string;
    patternType: PatternType;
    primaryColor: string;
    secondaryColor: string;
    roughness: number;
    metalness: number;
    canvasUrl: string;
  };
  suggestedOutfit?: any;
}

export interface SavedProject {
  id: string;
  name: string;
  updatedAt: string;
  thumbnail: string;
  avatar: AvatarState;
  clothing: Record<string, ClothingItem>;
  lighting: StudioLighting;
  collaborators?: string[];
}
