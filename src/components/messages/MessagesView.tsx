import React, { useState } from 'react';
import {
  Send,
  Users,
  Check,
  X,
  Flag,
  UserX,
  Sparkles,
  ArrowLeft,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { ChatThread, CreatorProfile, DirectMessage } from '../../types';

interface MessagesViewProps {
  threads: ChatThread[];
  currentUser: CreatorProfile;
  activeThreadId: string | null;
  onSelectThread: (threadId: string | null) => void;
  onSendMessage: (threadId: string, text: string) => void;
  onAcceptCollaboration: (threadId: string, messageId: string, collabTitle: string) => void;
  onDeclineCollaboration: (threadId: string, messageId: string) => void;
  onReportUser: (userId: string, name: string) => void;
  onBlockUser: (userId: string, name: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  threads,
  currentUser,
  activeThreadId,
  onSelectThread,
  onSendMessage,
  onAcceptCollaboration,
  onDeclineCollaboration,
  onReportUser,
  onBlockUser,
}) => {
  const [inputText, setInputText] = useState('');
  const [showCollabWorkspaceModal, setShowCollabWorkspaceModal] = useState(false);
  const [activeCollabTitle, setActiveCollabTitle] = useState('Fantasy Outfit Collaboration');
  const [activeCollabPartner, setActiveCollabPartner] = useState<CreatorProfile | null>(null);

  const currentThread = threads.find((t) => t.id === activeThreadId);

  const handleSend = () => {
    if (!inputText.trim() || !activeThreadId) return;
    onSendMessage(activeThreadId, inputText.trim());
    setInputText('');
  };

  const handleAcceptCollab = (messageId: string, title?: string) => {
    if (!activeThreadId) return;
    const finalTitle = title || 'Fantasy Outfit Collaboration';
    onAcceptCollaboration(activeThreadId, messageId, finalTitle);
    setActiveCollabTitle(finalTitle);
    setActiveCollabPartner(currentThread?.participant || null);
    setShowCollabWorkspaceModal(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] bg-zinc-950 p-4 pb-20 max-w-md mx-auto">
      {/* View 1: Thread List */}
      {!currentThread ? (
        <div className="flex flex-col gap-3">
          <div className="pb-3 border-b border-zinc-900">
            <h2 className="font-display font-bold text-lg text-zinc-100">Private Messages</h2>
            <p className="text-xs text-zinc-400">Direct chat & 3D collaboration invites</p>
          </div>

          <div className="flex flex-col gap-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className="p-3 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3 transition-colors text-left"
              >
                <div className="relative">
                  <img
                    src={thread.participant.avatarUrl}
                    alt={thread.participant.name}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                  />
                  {thread.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-pink-500 w-3.5 h-3.5 rounded-full border-2 border-zinc-900" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-100 truncate">
                      {thread.participant.name}
                    </span>
                    <span className="text-[10px] text-zinc-500">{thread.lastTimestamp}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{thread.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* View 2: Active Chat Conversation */
        <div className="flex flex-col h-full">
          {/* Active Chat Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectThread(null)}
                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img
                src={currentThread.participant.avatarUrl}
                alt={currentThread.participant.name}
                className="w-8 h-8 rounded-full object-cover border border-zinc-700"
              />
              <div>
                <div className="font-semibold text-xs text-zinc-100">
                  {currentThread.participant.name}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Online for 3D Collabs</span>
                </div>
              </div>
            </div>

            {/* Safety Options */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  onReportUser(currentThread.participant.id, currentThread.participant.name)
                }
                title="Report user"
                className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg"
              >
                <Flag className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  onBlockUser(currentThread.participant.id, currentThread.participant.name)
                }
                title="Block user"
                className="p-1.5 text-zinc-500 hover:text-amber-400 rounded-lg"
              >
                <UserX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages History */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-2.5">
            {currentThread.messages.map((m) => {
              const isMe = m.senderId === currentUser.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                    }`}
                  >
                    <div>{m.text}</div>

                    {/* Collaboration Request Card inside Chat */}
                    {m.isCollabInvite && (
                      <div className="mt-2.5 p-2.5 bg-zinc-950 rounded-xl border border-indigo-500/30 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
                          <Users className="w-3.5 h-3.5" />
                          <span>Collaboration Invitation</span>
                        </div>
                        <div className="text-[11px] text-zinc-300 font-medium">
                          "{m.collabTitle || 'Fantasy Outfit Design'}"
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          Co-design shared 3D layers with co-creator badges & equal credit attribution.
                        </div>

                        {/* Accept / Decline actions */}
                        {!m.collabAccepted && !m.collabDeclined ? (
                          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-zinc-800">
                            <button
                              onClick={() => handleAcceptCollab(m.id, m.collabTitle)}
                              className="py-1 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg text-[10px] flex items-center justify-center gap-1 shadow"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept Collab</span>
                            </button>
                            <button
                              onClick={() => onDeclineCollaboration(currentThread.id, m.id)}
                              className="py-1 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] flex items-center justify-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Decline</span>
                            </button>
                          </div>
                        ) : m.collabAccepted ? (
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" /> Collaboration Active
                            </span>
                            <button
                              onClick={() => {
                                setActiveCollabTitle(m.collabTitle || 'Fantasy Outfit Collaboration');
                                setActiveCollabPartner(currentThread.participant);
                                setShowCollabWorkspaceModal(true);
                              }}
                              className="text-[10px] text-indigo-400 underline font-semibold"
                            >
                              Open Workspace
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-500 pt-1">Invitation declined</div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-0.5 px-1">{m.timestamp}</span>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={`Message ${currentThread.participant.name}...`}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Collaboration Workspace Modal */}
      {showCollabWorkspaceModal && activeCollabPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-4 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-display font-bold text-sm text-zinc-100">
                  Shared Collab Workspace
                </h3>
              </div>
              <button
                onClick={() => setShowCollabWorkspaceModal(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xs px-2 py-1"
              >
                Close
              </button>
            </div>

            {/* Ownership & Co-Creator Credits */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex flex-col gap-2">
              <span className="text-[11px] text-zinc-400 font-semibold">Attribution & Ownership:</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-300 font-semibold">
                  Co-Created by: {currentUser.handle} & {activeCollabPartner.handle}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Both creators retain 50/50 portfolio rights, remix credits, and public badge verification on this design.
              </p>
            </div>

            {/* Shared Layers Breakdown */}
            <div className="flex flex-col gap-1.5 text-xs text-zinc-300">
              <span className="font-semibold text-zinc-400 text-[11px]">Layer Contributions:</span>
              <div className="flex items-center justify-between p-2 bg-zinc-800/60 rounded-lg">
                <span>Top Mesh & Draping</span>
                <span className="text-[10px] text-indigo-400 font-medium">Assigned to You</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-800/60 rounded-lg">
                <span>Fabric Textures & Embroidery</span>
                <span className="text-[10px] text-purple-400 font-medium">Assigned to {activeCollabPartner.name}</span>
              </div>
            </div>

            <button
              onClick={() => setShowCollabWorkspaceModal(false)}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-lg"
            >
              Start Designing in 3D Studio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
