import React, { useState, useEffect } from 'react';
import {
  AppSection,
  AvatarState,
  ClothingCategory,
  ClothingItem,
  CommunityPost,
  CreatorProfile,
  LightingPreset,
  PerformanceSettings,
  SavedProject,
  ChatThread,
} from './types';
import {
  DEFAULT_AVATAR,
  DEFAULT_CLOTHING,
  DEFAULT_LIGHTING,
  CURRENT_USER,
  SAMPLE_POSTS,
  INITIAL_CHAT_THREADS,
  SAMPLE_PROJECTS,
} from './utils/sampleData';
import { Header } from './components/navigation/Header';
import { BottomTabBar } from './components/navigation/BottomTabBar';
import { StudioWorkspace } from './components/studio/StudioWorkspace';
import { AvatarCustomizer } from './components/avatar/AvatarCustomizer';
import { ClothingCustomizer } from './components/clothing/ClothingCustomizer';
import { TextureLab } from './components/textures/TextureLab';
import { CyraAiPanel } from './components/ai/CyraAiPanel';
import { CommunityView } from './components/community/CommunityView';
import { MessagesView } from './components/messages/MessagesView';
import { ProfileView } from './components/profile/ProfileView';
import { PremiumModal } from './components/common/PremiumModal';
import { ModerationModal } from './components/common/ModerationModal';
import { GestureTutorialOverlay } from './components/common/GestureTutorialOverlay';

export default function App() {
  // Navigation Section
  const [activeSection, setActiveSection] = useState<AppSection>('create');

  // 3D Model State
  const [avatar, setAvatar] = useState<AvatarState>(() => {
    const saved = localStorage.getItem('cyra_avatar_state');
    return saved ? JSON.parse(saved) : DEFAULT_AVATAR;
  });

  const [clothing, setClothing] = useState<Record<string, ClothingItem>>(() => {
    const saved = localStorage.getItem('cyra_clothing_state');
    return saved ? JSON.parse(saved) : DEFAULT_CLOTHING;
  });

  const [lighting, setLighting] = useState(DEFAULT_LIGHTING);
  const [projectName, setProjectName] = useState('Sakura Cyber Creation');
  const [snapshotTrigger, setSnapshotTrigger] = useState(0);

  // Performance & Device Settings
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    mode: 'auto',
    batterySaver: false,
    reducedPolygons: false,
    textureResolution: '1024',
    fpsLimit: 60,
    wireframe: false,
  });

  // Monetization & Premium Tier (₹200)
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem('cyra_is_premium') === 'true';
  });
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // Swipe-based Interactive Gestures Tutorial State
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    return localStorage.getItem('cyra_tutorial_seen') !== 'true';
  });

  // Community & Social State
  const [posts, setPosts] = useState<CommunityPost[]>(SAMPLE_POSTS);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(INITIAL_CHAT_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(SAMPLE_PROJECTS);

  // Safety & Moderation Dialog
  const [moderationTarget, setModerationTarget] = useState<{
    type: 'post' | 'user';
    title: string;
  } | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('cyra_avatar_state', JSON.stringify(avatar));
  }, [avatar]);

  useEffect(() => {
    localStorage.setItem('cyra_clothing_state', JSON.stringify(clothing));
  }, [clothing]);

  useEffect(() => {
    localStorage.setItem('cyra_is_premium', isPremium ? 'true' : 'false');
  }, [isPremium]);

  // Avatar Handlers
  const handleUpdateAvatar = (updated: Partial<AvatarState>) => {
    setAvatar((prev) => ({ ...prev, ...updated }));
  };

  const handleResetAvatar = () => {
    setAvatar(DEFAULT_AVATAR);
  };

  // Clothing Handlers
  const handleUpdateClothingItem = (category: ClothingCategory, updated: Partial<ClothingItem>) => {
    setClothing((prev) => {
      const existing = prev[category] || {
        id: `${category}-new`,
        category,
        type: 'tshirt',
        name: 'Custom Garment',
        color: '#ffffff',
        material: 'cotton',
        roughness: 0.7,
        metalness: 0.1,
        pattern: 'none',
        patternScale: 3,
        fit: { length: 1, puffiness: 1, scaleY: 1 },
      };
      return {
        ...prev,
        [category]: { ...existing, ...updated },
      };
    });
  };

  const handleApplyTextureToClothing = (category: ClothingCategory, patternUrl: string, name: string) => {
    setClothing((prev) => {
      const existing = prev[category];
      if (!existing) return prev;
      return {
        ...prev,
        [category]: {
          ...existing,
          pattern: 'custom_uploaded',
          patternCanvasUrl: patternUrl,
          name: name ? `${existing.name} (${name})` : existing.name,
        },
      };
    });
  };

  // Lighting & Studio Handlers
  const handleUpdateLighting = (preset: LightingPreset) => {
    setLighting((prev) => ({ ...prev, preset }));
  };

  const handleToggleWireframe = () => {
    setPerformanceSettings((prev) => ({ ...prev, wireframe: !prev.wireframe }));
  };

  const handleToggleBatterySaver = () => {
    setPerformanceSettings((prev) => ({
      ...prev,
      batterySaver: !prev.batterySaver,
      reducedPolygons: !prev.batterySaver,
      fpsLimit: !prev.batterySaver ? 30 : 60,
    }));
  };

  // Project Save & Load
  const handleSaveProject = (title: string, thumbnail: string) => {
    const newProj: SavedProject = {
      id: `proj-${Date.now()}`,
      name: title,
      updatedAt: 'Just now',
      thumbnail,
      avatar,
      clothing,
      lighting,
    };
    setSavedProjects((prev) => [newProj, ...prev]);
    setProjectName(title);
  };

  const handleLoadProject = (project: SavedProject) => {
    setAvatar(project.avatar);
    setClothing(project.clothing);
    setLighting(project.lighting);
    setProjectName(project.name);
    setActiveSection('create');
  };

  const handleDeleteProject = (projectId: string) => {
    setSavedProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  // Community Interactions
  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `c-${Date.now()}`,
                authorName: CURRENT_USER.name,
                authorHandle: CURRENT_USER.handle,
                authorAvatar: CURRENT_USER.avatarUrl,
                text,
                createdAt: 'Just now',
              },
            ],
          };
        }
        return p;
      })
    );
  };

  const handleRemixOutfit = (post: CommunityPost) => {
    if (post.outfitSnapshot) {
      setAvatar(post.outfitSnapshot.avatar);
      setClothing(post.outfitSnapshot.clothing);
      setLighting((prev) => ({ ...prev, preset: post.outfitSnapshot.lightingPreset }));
      setProjectName(`Remix of ${post.title}`);
      setActiveSection('create');
    }
  };

  const handleFollowCreator = (creatorId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.author.id === creatorId) {
          return {
            ...p,
            author: {
              ...p.author,
              isFollowing: !p.author.isFollowing,
            },
          };
        }
        return p;
      })
    );
  };

  // Collaboration Invitation
  const handleSendCollabInvite = (creator: CreatorProfile) => {
    const existingThread = chatThreads.find((t) => t.participant.id === creator.id);
    const newCollabMsg = {
      id: `m-${Date.now()}`,
      senderId: CURRENT_USER.id,
      text: 'Would you like to collaborate on a fantasy outfit? We can merge our 3D styles!',
      timestamp: 'Just now',
      isCollabInvite: true,
      collabTitle: `Fantasy Collab with ${creator.name}`,
    };

    if (existingThread) {
      setChatThreads((prev) =>
        prev.map((t) =>
          t.id === existingThread.id
            ? {
                ...t,
                lastMessage: newCollabMsg.text,
                lastTimestamp: 'Just now',
                messages: [...t.messages, newCollabMsg],
              }
            : t
        )
      );
      setActiveThreadId(existingThread.id);
    } else {
      const newThread: ChatThread = {
        id: `thread-${creator.id}`,
        participant: creator,
        lastMessage: newCollabMsg.text,
        lastTimestamp: 'Just now',
        unreadCount: 0,
        messages: [newCollabMsg],
      };
      setChatThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
    }
    setActiveSection('messages');
  };

  const handleAcceptCollaboration = (threadId: string, messageId: string, collabTitle: string) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            messages: t.messages.map((m) =>
              m.id === messageId ? { ...m, collabAccepted: true } : m
            ),
          };
        }
        return t;
      })
    );
    setProjectName(`[Co-op] ${collabTitle}`);
  };

  const handleDeclineCollaboration = (threadId: string, messageId: string) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            messages: t.messages.map((m) =>
              m.id === messageId ? { ...m, collabDeclined: true } : m
            ),
          };
        }
        return t;
      })
    );
  };

  const handleSendMessage = (threadId: string, text: string) => {
    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: CURRENT_USER.id,
      text,
      timestamp: 'Just now',
    };
    setChatThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              lastMessage: text,
              lastTimestamp: 'Just now',
              messages: [...t.messages, newMsg],
            }
          : t
      )
    );
  };

  // Apply Cyra AI Outfit Concept
  const handleApplyOutfitConcept = (outfitData: any) => {
    if (!outfitData) return;

    if (outfitData.top) {
      handleUpdateClothingItem('top', {
        type: outfitData.top.type,
        color: outfitData.top.color,
        pattern: outfitData.top.pattern || 'none',
        material: outfitData.top.material || 'cotton',
        name: `Cyra ${outfitData.top.type}`,
      });
    }
    if (outfitData.bottom) {
      handleUpdateClothingItem('bottom', {
        type: outfitData.bottom.type,
        color: outfitData.bottom.color,
        material: outfitData.bottom.material || 'denim',
        name: `Cyra ${outfitData.bottom.type}`,
      });
    }
    if (outfitData.shoes) {
      handleUpdateClothingItem('shoes', {
        type: outfitData.shoes.type,
        color: outfitData.shoes.color,
      });
    }
    if (outfitData.accessory) {
      handleUpdateClothingItem('accessory', {
        type: outfitData.accessory.type,
        color: outfitData.accessory.color,
      });
    }
    if (outfitData.hairColor) {
      handleUpdateAvatar({ hairColor: outfitData.hairColor });
    }
    if (outfitData.lightingPreset) {
      handleUpdateLighting(outfitData.lightingPreset);
    }
    if (outfitData.outfitTitle) {
      setProjectName(outfitData.outfitTitle);
    }

    setActiveSection('create');
  };

  const unreadMessagesCount = chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Mobile App Header */}
      <Header
        isPremium={isPremium}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        onOpenCyraAi={() => setActiveSection('cyra_ai')}
        onSnapshot={() => setSnapshotTrigger((prev) => prev + 1)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        performanceSettings={performanceSettings}
        onToggleBatterySaver={handleToggleBatterySaver}
        projectName={projectName}
      />

      {/* Main View Area */}
      <main className="flex-1 relative overflow-hidden">
        {activeSection === 'create' && (
          <StudioWorkspace
            avatar={avatar}
            clothing={clothing}
            lighting={lighting}
            performanceSettings={performanceSettings}
            isPremium={isPremium}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            onOpenCyraAi={() => setActiveSection('cyra_ai')}
            onSaveProject={handleSaveProject}
            onUpdateLighting={handleUpdateLighting}
            onToggleWireframe={handleToggleWireframe}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            snapshotTrigger={snapshotTrigger}
          />
        )}

        {activeSection === 'avatar' && (
          <AvatarCustomizer
            avatar={avatar}
            onChangeAvatar={handleUpdateAvatar}
            onResetAvatar={handleResetAvatar}
            isPremium={isPremium}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
          />
        )}

        {activeSection === 'clothing' && (
          <ClothingCustomizer
            clothing={clothing}
            onChangeClothingItem={handleUpdateClothingItem}
            isPremium={isPremium}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            onOpenTextureLab={() => setActiveSection('textures')}
            onOpenCyraAi={() => setActiveSection('cyra_ai')}
          />
        )}

        {activeSection === 'textures' && (
          <TextureLab
            clothing={clothing}
            onApplyTextureToClothing={handleApplyTextureToClothing}
            isPremium={isPremium}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
          />
        )}

        {activeSection === 'cyra_ai' && (
          <CyraAiPanel
            avatar={avatar}
            clothing={clothing}
            isPremium={isPremium}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            onApplyOutfitConcept={handleApplyOutfitConcept}
            onApplyTextureToClothing={handleApplyTextureToClothing}
          />
        )}

        {activeSection === 'community' && (
          <CommunityView
            posts={posts}
            currentUser={CURRENT_USER}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onRemixOutfit={handleRemixOutfit}
            onFollowCreator={handleFollowCreator}
            onSendCollabInvite={handleSendCollabInvite}
            onReportContent={(type, id, title) => setModerationTarget({ type, title })}
          />
        )}

        {activeSection === 'messages' && (
          <MessagesView
            threads={chatThreads}
            currentUser={CURRENT_USER}
            activeThreadId={activeThreadId}
            onSelectThread={setActiveThreadId}
            onSendMessage={handleSendMessage}
            onAcceptCollaboration={handleAcceptCollaboration}
            onDeclineCollaboration={handleDeclineCollaboration}
            onReportUser={(userId, name) => setModerationTarget({ type: 'user', title: name })}
            onBlockUser={(userId, name) => {
              setChatThreads((prev) => prev.filter((t) => t.participant.id !== userId));
              setActiveThreadId(null);
            }}
          />
        )}

        {activeSection === 'profile' && (
          <ProfileView
            currentUser={CURRENT_USER}
            savedProjects={savedProjects}
            onLoadProject={handleLoadProject}
            onDeleteProject={handleDeleteProject}
            performanceSettings={performanceSettings}
            onUpdatePerformance={(updated) =>
              setPerformanceSettings((prev) => ({ ...prev, ...updated }))
            }
            isPremium={isPremium}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (8 Sections) */}
      <BottomTabBar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* ₹200 Premium Plan Modal */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onActivatePremium={() => setIsPremium(true)}
        isPremium={isPremium}
      />

      {/* Safety & Moderation Report Modal */}
      <ModerationModal
        isOpen={!!moderationTarget}
        onClose={() => setModerationTarget(null)}
        targetType={moderationTarget?.type || 'post'}
        targetTitle={moderationTarget?.title || ''}
      />

      {/* Swipe-Based Interactive Gesture Tutorial Overlay */}
      <GestureTutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onFinish={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
