import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageSquare, Eye, Bookmark, CheckCircle2, Code2, BookOpen, FileText, Lightbulb, HelpCircle, Link2 } from "lucide-react";
import { getExcerpt } from "../../utils/markdownRenderer";

// ─── Post type config ─────────────────────────────────────────────────────
const TYPE_CONFIG = {
  question:      { label: "Question",     icon: HelpCircle,  color: "bg-blue-50 text-blue-600 border-blue-100",     accent: "border-l-blue-500" },
  article:       { label: "Article",      icon: BookOpen,    color: "bg-purple-50 text-purple-600 border-purple-100", accent: "border-l-purple-500" },
  note:          { label: "Note",         icon: FileText,    color: "bg-amber-50 text-amber-600 border-amber-100",   accent: "border-l-amber-500" },
  tutorial:      { label: "Tutorial",     icon: Lightbulb,   color: "bg-emerald-50 text-emerald-600 border-emerald-100", accent: "border-l-emerald-500" },
  "code-snippet":{ label: "Code",         icon: Code2,       color: "bg-slate-100 text-slate-600 border-slate-200",  accent: "border-l-slate-500" },
  resource:      { label: "Resource",     icon: Link2,       color: "bg-orange-50 text-orange-600 border-orange-100", accent: "border-l-orange-500" },
};

const Avatar = ({ user, size = 8 }) => {
  const initials = user?.name?.charAt(0)?.toUpperCase() || "?";
  return user?.profilePic ? (
    <img
      src={user.profilePic}
      alt={user.name}
      className={`w-${size} h-${size} rounded-xl object-cover border border-slate-100`}
    />
  ) : (
    <div className={`w-${size} h-${size} rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm border border-blue-200`}>
      {initials}
    </div>
  );
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

// ─── PostCard Component ───────────────────────────────────────────────────
const PostCard = ({ post, onLike, onBookmark }) => {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.article;
  const TypeIcon = cfg.icon;
  const excerpt = post.summary || getExcerpt(post.content, 180);

  const handleCardClick = () => navigate(`/post/${post._id}`);
  const handleLike = (e) => { e.stopPropagation(); onLike?.(post._id); };
  const handleBookmark = (e) => { e.stopPropagation(); onBookmark?.(post._id); };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-l-4 ${cfg.accent}`}
    >
      <div className="p-5">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Badge */}
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${cfg.color}`}>
              <TypeIcon size={11} />
              {cfg.label}
            </span>

            {/* Answered badge for questions */}
            {post.type === "question" && post.isAnswered && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 size={11} />
                Answered
              </span>
            )}

            {/* Draft badge */}
            {post.status === "draft" && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                Draft
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-bold shrink-0">
            {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* ── Title ───────────────────────────────────────────────── */}
        <h2 className="font-black text-slate-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>

        {/* ── Excerpt ─────────────────────────────────────────────── */}
        {excerpt && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {excerpt}
          </p>
        )}

        {/* ── Tags ─────────────────────────────────────────────────── */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                onClick={(e) => { e.stopPropagation(); navigate(`/feed?tag=${tag}`); }}
                className="text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 cursor-pointer transition-all"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Avatar user={post.author} size={7} />
            <div>
              <p className="text-xs font-bold text-slate-700 leading-none">
                {post.author?.name}
                {post.author?.isVerified && (
                  <CheckCircle2 size={11} className="inline ml-1 text-blue-500" />
                )}
              </p>
              {post.author?.username && (
                <p className="text-[10px] text-slate-400 font-medium">@{post.author.username}</p>
              )}
            </div>
          </div>

          {/* Stats + Actions */}
          <div className="flex items-center gap-1">
            {/* Views */}
            <span className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-bold text-slate-400">
              <Eye size={13} />
              {post.views || 0}
            </span>

            {/* Comments */}
            <span
              onClick={(e) => { e.stopPropagation(); navigate(`/post/${post._id}#comments`); }}
              className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
            >
              <MessageSquare size={13} />
              {post.commentsCount || 0}
            </span>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-2 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                post.isLiked
                  ? "text-red-500 bg-red-50 hover:bg-red-100"
                  : "text-slate-400 hover:text-red-500 hover:bg-red-50"
              }`}
            >
              <Heart size={13} fill={post.isLiked ? "currentColor" : "none"} />
              {post.likesCount || 0}
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 px-2 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                post.isBookmarked
                  ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                  : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Bookmark size={13} fill={post.isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
