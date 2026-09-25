import React from 'react';
import {
  Sparkles,
  User,
  Shirt,
  Palette,
  Bot,
  Users,
  MessageSquare,
  UserCheck,
} from 'lucide-react';
import { AppSection } from '../../types';

interface BottomTabBarProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  unreadMessagesCount: number;
}

interface NavItem {
  id: AppSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  highlight?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeSection,
  onSelectSection,
  unreadMessagesCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'create', label: 'Create', icon: Sparkles },
    { id: 'avatar', label: 'Avatar', icon: User },
    { id: 'clothing', label: 'Clothing', icon: Shirt },
    { id: 'textures', label: 'Textures', icon: Palette },
    { id: 'cyra_ai', label: 'Cyra AI', icon: Bot, highlight: true },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center overflow-x-auto no-scrollbar px-1 py-1 max-w-lg mx-auto sm:justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`flex-1 min-w-[58px] flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? item.highlight
                    ? 'text-pink-400 bg-pink-500/10 font-medium'
                    : 'text-indigo-400 bg-indigo-500/10 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  } ${item.highlight && !isActive ? 'text-pink-400/80' : ''}`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-zinc-950 animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
