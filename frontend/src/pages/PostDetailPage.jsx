import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft, Heart, Bookmark, Share2, Edit2, Trash2, Eye,
  CheckCircle2, Link2, Code2, BookOpen, FileText, Lightbulb, HelpCircle,
  Loader2, ExternalLink, Clock, Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { renderMarkdown } from "../utils/markdownRenderer";
import CommentSection from "../components/posts/CommentSection";

// ─── Post type config ─────────────────────────────────────────────────────
const TYPE_CONFIG = {
  question:       { label: "Question",     icon: HelpCircle,  color: "bg-blue-50 text-blue-600 border-blue-100",      accent: "from-blue-600 to-indigo-600" },
  article:        { label: "Article",      icon: BookOpen,    color: "bg-purple-50 text-purple-600 border-purple-100", accent: "from-purple-600 to-pink-600" },
  note:           { label: "Note",         icon: FileText,    color: "bg-amber-50 text-amber-600 border-amber-100",    accent: "from-amber-500 to-orange-600" },
  tutorial:       { label: "Tutorial",     icon: Lightbulb,   color: "bg-emerald-50 text-emerald-600 border-emerald-100", accent: "from-emerald-600 to-teal-600" },
  "code-snippet": { label: "Code Snippet", icon: Code2,       color: "bg-slate-100 text-slate-600 border-slate-200",   accent: "from-slate-700 to-slate-900" },
  resource:       { label: "Resource",     icon: Link2,       color: "bg-orange-50 text-orange-600 border-orange-100", accent: "from-orange-500 to-red-600" },
};

const Avatar = ({ user, size = 10 }) => {
  const initials = user?.name?.charAt(0)?.toUpperCase() || "?";
  return user?.profilePic ? (
    <img src={user.profilePic} alt={user.name} className={`w-${size} h-${size} rounded-2xl object-cover border border-slate-100`} />
  ) : (
    <div className={`w-${size} h-${size} rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg border border-blue-200`}>
      {initials}
    </div>
  );
};

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// ─── PostDetailPage ───────────────────────────────────────────────────────
const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`posts/${id}`);
      const p = res.data.post;
      setPost(p);
      setLiked(p.isLiked);
      setLikesCount(p.likesCount || 0);
      setBookmarked(p.isBookmarked);
    } catch {
      toast.error("Post not found");
      navigate("/feed");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  const handleLike = async () => {
    try {
      const res = await API.post(`posts/${id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch { toast.error("Failed to like"); }
  };

  const handleBookmark = async () => {
    try {
      const res = await API.post(`posts/${id}/bookmark`);
      setBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? "Post saved!" : "Removed from bookmarks");
    } catch { toast.error("Failed to bookmark"); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => toast.success("Link copied!"));
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setDeleting(true);
    try {
      await API.delete(`posts/${id}`);
      toast.success("Post deleted");
      navigate("/feed");
    } catch {
      toast.error("Failed to delete post");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
        <Loader2 size={36} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!post) return null;

  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.article;
  const TypeIcon = cfg.icon;
  const isOwner = user?._id === post.author?._id || user?.id === post.author?._id;
  const renderedContent = renderMarkdown(post.content);

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ── Back Button ─────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition-all group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </button>

        {/* ── Post Card ────────────────────────────────────── */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {/* Color header strip */}
          <div className={`h-1.5 bg-gradient-to-r ${cfg.accent}`} />

          <div className="p-6 md:p-8">
            {/* ── Meta row ────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${cfg.color}`}>
                  <TypeIcon size={12} />
                  {cfg.label}
                </span>

                {post.type === "question" && post.isAnswered && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CheckCircle2 size={12} /> Answered
                  </span>
                )}

                {post.category && post.category !== "General" && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    {post.category}
                  </span>
                )}
              </div>

              {/* Owner actions */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/post/${id}/edit`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* ── Title ───────────────────────────────────── */}
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-6">
              {post.title}
            </h1>

            {/* ── Author + Stats ───────────────────────────── */}
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Avatar user={post.author} size={10} />
                <div>
                  <p className="font-black text-slate-800 flex items-center gap-1.5">
                    {post.author?.name}
                    {post.author?.isVerified && <CheckCircle2 size={14} className="text-blue-500" />}
                  </p>
                  {post.author?.username && (
                    <p className="text-xs text-slate-400 font-medium">@{post.author.username}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {timeAgo(post.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={14} />
                  {post.views} views
                </span>
              </div>
            </div>

            {/* ── Resource URL banner ──────────────────────── */}
            {post.type === "resource" && post.resourceUrl && (
              <a
                href={post.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-4 mb-6 bg-orange-50 border border-orange-100 rounded-2xl text-sm font-bold text-orange-600 hover:bg-orange-100 transition-all"
              >
                <Link2 size={16} />
                {post.resourceUrl}
                <ExternalLink size={14} className="ml-auto shrink-0" />
              </a>
            )}

            {/* ── Code Language badge ──────────────────────── */}
            {post.type === "code-snippet" && post.codeLanguage && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 uppercase tracking-widest">
                  {post.codeLanguage}
                </span>
              </div>
            )}

            {/* ── Content ─────────────────────────────────── */}
            <div
              className="md-content prose-excherish"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {/* ── Tags ────────────────────────────────────── */}
            {post.tags?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-8 pt-6 border-t border-slate-50">
                <Tag size={14} className="text-slate-400" />
                {post.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/feed?tag=${tag}`)}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* ── Action Bar ──────────────────────────────── */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-50">
              {/* Like */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-black border transition-all ${
                  liked ? "bg-red-50 text-red-500 border-red-100 shadow-md shadow-red-100" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-red-200 hover:text-red-500"
                }`}
              >
                <Heart size={16} fill={liked ? "currentColor" : "none"} />
                {likesCount > 0 && likesCount} {likesCount === 1 ? "Like" : "Likes"}
              </motion.button>

              {/* Bookmark */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-black border transition-all ${
                  bookmarked ? "bg-blue-50 text-blue-600 border-blue-100 shadow-md shadow-blue-100" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
                {bookmarked ? "Saved" : "Save"}
              </motion.button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-black border bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 transition-all"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </motion.article>

        {/* ── Comment Section ─────────────────────────────── */}
        <div className="mt-6">
          <CommentSection
            postId={id}
            postAuthorId={post.author?._id}
            postType={post.type}
            commentsCount={post.commentsCount}
          />
        </div>
      </div>

      {/* ── Markdown Styles ──────────────────────────────── */}
      <style>{`
        .md-content { color: #374151; line-height: 1.8; }
        .md-content .md-h1 { font-size: 1.75rem; font-weight: 900; color: #0f172a; margin: 1.5rem 0 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
        .md-content .md-h2 { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 1.25rem 0 0.5rem; }
        .md-content .md-h3 { font-size: 1.15rem; font-weight: 700; color: #334155; margin: 1rem 0 0.5rem; }
        .md-content .md-h4, .md-content .md-h5, .md-content .md-h6 { font-weight: 700; color: #475569; margin: 0.75rem 0 0.4rem; }
        .md-content .md-p { margin: 0.6rem 0; }
        .md-content .md-ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
        .md-content .md-ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
        .md-content .md-li { margin: 0.3rem 0; }
        .md-content .md-blockquote { border-left: 4px solid #3b82f6; padding: 0.5rem 1rem; margin: 1rem 0; background: #eff6ff; border-radius: 0 0.75rem 0.75rem 0; color: #1e40af; font-style: italic; }
        .md-content .md-code-block { background: #0f172a; color: #e2e8f0; border-radius: 1rem; overflow: hidden; margin: 1rem 0; font-size: 0.875rem; }
        .md-content .md-code-lang { background: #1e293b; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 0.5rem 1rem; }
        .md-content .md-code-block code { display: block; padding: 1rem; overflow-x: auto; font-family: 'JetBrains Mono', 'Fira Code', monospace; line-height: 1.7; }
        .md-content .md-inline-code { background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.1em 0.4em; font-family: 'JetBrains Mono', monospace; font-size: 0.875em; }
        .md-content .md-link { color: #2563eb; text-decoration: underline; font-weight: 600; }
        .md-content .md-link:hover { color: #1d4ed8; }
        .md-content .md-hr { border: none; border-top: 2px solid #f1f5f9; margin: 1.5rem 0; }
        .md-content .md-image { max-width: 100%; border-radius: 0.75rem; margin: 0.75rem 0; }
        .md-content strong { font-weight: 800; color: #0f172a; }
        .md-content em { font-style: italic; }
        .md-content del { text-decoration: line-through; color: #94a3b8; }
      `}</style>
    </div>
  );
};

export default PostDetailPage;
