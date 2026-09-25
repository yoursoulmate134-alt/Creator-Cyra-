import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Users,
  Search,
  Flag,
  UserX,
  MoreVertical,
  Check,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { CommunityPost, CreatorProfile } from '../../types';

interface CommunityViewProps {
  posts: CommunityPost[];
  currentUser: CreatorProfile;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onRemixOutfit: (post: CommunityPost) => void;
  onFollowCreator: (creatorId: string) => void;
  onSendCollabInvite: (creator: CreatorProfile) => void;
  onReportContent: (type: 'post' | 'user', id: string, title: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  currentUser,
  onLikePost,
  onAddComment,
  onRemixOutfit,
  onFollowCreator,
  onSendCollabInvite,
  onReportContent,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [menuOpenPostId, setMenuOpenPostId] = useState<string | null>(null);
  const [remixSuccessPostId, setRemixSuccessPostId] = useState<string | null>(null);

  const tags = ['All', 'Anime', 'Streetwear', 'Fantasy', 'Cyberpunk', 'Floral'];

  const filteredPosts = posts.filter((post) => {
    const matchesTag = selectedTag === 'All' || post.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleCommentSubmit = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput.trim());
    setCommentInput('');
  };

  const handleRemix = (post: CommunityPost) => {
    onRemixOutfit(post);
    setRemixSuccessPostId(post.id);
    setTimeout(() => setRemixSuccessPostId(null), 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] overflow-y-auto no-scrollbar bg-zinc-950 p-4 pb-20 max-w-md mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col gap-2 pb-3 border-b border-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-zinc-100">Creator Community</h2>
            <p className="text-xs text-zinc-400">Discover 3D fashion, collaborate & remix styles</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search outfits, anime tags, creators..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs px-3 py-1 rounded-xl whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Community Feed */}
      <div className="flex flex-col gap-4 mt-3">
        {filteredPosts.map((post) => {
          const isCommentsOpen = activeCommentsPostId === post.id;
          const isMenuOpen = menuOpenPostId === post.id;

          return (
            <article
              key={post.id}
              className="bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl"
            >
              {/* Post Header: Author info */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-zinc-100">{post.author.name}</span>
                      {post.author.isPremium && (
                        <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1 rounded border border-amber-400/20">
                          PRO
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400">{post.author.handle} · {post.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 relative">
                  {/* Follow Creator */}
                  {post.author.id !== currentUser.id && (
                    <button
                      onClick={() => onFollowCreator(post.author.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        post.author.isFollowing
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {post.author.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}

                  {/* Context Menu (Report, Block) */}
                  <button
                    onClick={() => setMenuOpenPostId(isMenuOpen ? null : post.id)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-zinc-950 border border-zinc-800 rounded-xl p-1 shadow-2xl z-30 flex flex-col gap-1 text-xs">
                      <button
                        onClick={() => {
                          onReportContent('post', post.id, post.title);
                          setMenuOpenPostId(null);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 text-zinc-300 hover:bg-zinc-800 rounded-lg text-left"
                      >
                        <Flag className="w-3.5 h-3.5 text-rose-400" />
                        <span>Report Post</span>
                      </button>
                      <button
                        onClick={() => {
                          onReportContent('user', post.author.id, post.author.name);
                          setMenuOpenPostId(null);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 text-zinc-300 hover:bg-zinc-800 rounded-lg text-left"
                      >
                        <UserX className="w-3.5 h-3.5 text-amber-400" />
                        <span>Block Creator</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Outfit Thumbnail / Snapshot */}
              <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                {/* 3D Outfit Tag */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold bg-black/70 backdrop-blur-md text-zinc-200 px-2 py-0.5 rounded-lg border border-white/10">
                    3D Garment
                  </span>
                  {post.allowsCollaboration && (
                    <span className="text-[10px] font-semibold bg-indigo-600/80 backdrop-blur-md text-white px-2 py-0.5 rounded-lg">
                      Collab Open
                    </span>
                  )}
                </div>
              </div>

              {/* Post Details & Actions */}
              <div className="p-3 flex flex-col gap-2">
                <div>
                  <h3 className="font-semibold text-xs text-zinc-100">{post.title}</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{post.description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((t) => (
                    <span key={t} className="text-[10px] text-indigo-400/90 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Interaction Buttons Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    {/* Like */}
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1 text-xs font-medium ${
                        post.isLiked ? 'text-rose-500' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    {/* Comments */}
                    <button
                      onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.id)}
                      className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Collab Invite Button */}
                    {post.allowsCollaboration && post.author.id !== currentUser.id && (
                      <button
                        onClick={() => onSendCollabInvite(post.author)}
                        className="text-[11px] px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-indigo-300 font-medium rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Users className="w-3 h-3 text-indigo-400" />
                        <span>Collab</span>
                      </button>
                    )}

                    {/* Remix Outfit in 3D Studio Button */}
                    <button
                      onClick={() => handleRemix(post)}
                      className="text-[11px] px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      {remixSuccessPostId === post.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" />
                          <span>Loaded!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>Remix 3D</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Comments Drawer */}
                {isCommentsOpen && (
                  <div className="mt-2 pt-2 border-t border-zinc-800/60 flex flex-col gap-2">
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
                      {post.comments.length === 0 ? (
                        <div className="text-[11px] text-zinc-500 text-center py-2">
                          No comments yet. Start the conversation!
                        </div>
                      ) : (
                        post.comments.map((c) => (
                          <div key={c.id} className="text-xs bg-zinc-950 p-2 rounded-xl flex items-start gap-2">
                            <img
                              src={c.authorAvatar}
                              alt={c.authorName}
                              className="w-5 h-5 rounded-full object-cover mt-0.5"
                            />
                            <div className="flex-1">
                              <span className="font-semibold text-zinc-300 mr-1.5">{c.authorName}:</span>
                              <span className="text-zinc-400">{c.text}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        placeholder="Write a comment..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentInput.trim()}
                        className="p-1.5 bg-indigo-600 text-white rounded-xl disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
