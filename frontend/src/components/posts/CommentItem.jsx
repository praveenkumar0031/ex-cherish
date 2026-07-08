import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Heart, CornerDownRight, MoreVertical, CheckCircle2, Trash2, Edit2, Send } from "lucide-react";
import API from "../../services/api";
import { toast } from "react-hot-toast";

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const Avatar = ({ user }) => {
  const initials = user?.name?.charAt(0)?.toUpperCase() || "?";
  return user?.profilePic ? (
    <img src={user.profilePic} alt={user.name} className="w-8 h-8 rounded-xl object-cover border border-slate-100 shrink-0" />
  ) : (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0">
      {initials}
    </div>
  );
};

// ─── Single Comment Item ──────────────────────────────────────────────────
const CommentItem = ({ comment, postAuthorId, postType, onAccept, onDelete, onReplyAdded, depth = 0 }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [savingEdit, setSavingEdit] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isOwner = user?._id === comment.author?._id || user?.id === comment.author?._id;
  const isPostAuthor = postAuthorId && (user?._id === postAuthorId || user?.id === postAuthorId);
  const isDeleted = comment.isDeleted;

  const handleLike = async () => {
    try {
      const res = await API.post(`comments/${comment._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await API.post("comments", {
        postId: comment.post,
        content: replyText,
        parentCommentId: comment._id,
      });
      setReplyText("");
      setShowReply(false);
      onReplyAdded?.(res.data.comment, comment._id);
      toast.success("Reply posted!");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditSave = async () => {
    if (!editText.trim()) return;
    setSavingEdit(true);
    try {
      await API.put(`comments/${comment._id}`, { content: editText });
      comment.content = editText;
      setEditing(false);
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update comment");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    setMenuOpen(false);
    onDelete?.(comment._id);
  };

  const handleAccept = async () => {
    setMenuOpen(false);
    onAccept?.(comment._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${depth > 0 ? "ml-10 pl-4 border-l-2 border-slate-100" : ""}`}
    >
      <Avatar user={comment.author} />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-slate-800">
              {comment.author?.name || "User"}
            </span>
            {comment.author?.isVerified && <CheckCircle2 size={12} className="text-blue-500" />}
            {comment.isAccepted && (
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <CheckCircle2 size={10} /> Accepted
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-medium">{timeAgo(comment.createdAt)}</span>
          </div>

          {/* Actions menu */}
          {!isDeleted && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <MoreVertical size={15} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 top-7 z-20 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden w-44"
                  >
                    {isOwner && (
                      <button onClick={() => { setEditing(true); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                        <Edit2 size={14} /> Edit
                      </button>
                    )}
                    {(isOwner || isPostAuthor) && (
                      <button onClick={handleDelete} className="flex items-center gap-2 w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50">
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                    {isPostAuthor && postType === "question" && !comment.isAccepted && depth === 0 && (
                      <button onClick={handleAccept} className="flex items-center gap-2 w-full px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50">
                        <CheckCircle2 size={14} /> Accept Answer
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content */}
        {editing ? (
          <div className="mb-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={handleEditSave} disabled={savingEdit} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-black rounded-xl disabled:opacity-50">
                {savingEdit ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-1.5 bg-slate-100 text-slate-600 text-xs font-black rounded-xl">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-sm leading-relaxed mb-2 ${isDeleted ? "text-slate-300 italic" : "text-slate-700"}`}>
            {comment.content}
          </p>
        )}

        {/* Action Bar */}
        {!isDeleted && !editing && (
          <div className="flex items-center gap-2">
            <button onClick={handleLike}
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-all ${liked ? "text-red-500 bg-red-50" : "text-slate-400 hover:text-red-500 hover:bg-red-50"}`}
            >
              <Heart size={12} fill={liked ? "currentColor" : "none"} />
              {likesCount > 0 && likesCount}
            </button>
            {depth === 0 && (
              <button onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <CornerDownRight size={12} />
                Reply {comment.repliesCount > 0 && `(${comment.repliesCount})`}
              </button>
            )}
          </div>
        )}

        {/* Reply Input */}
        <AnimatePresence>
          {showReply && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex gap-2"
            >
              <Avatar user={user} />
              <div className="flex-1 flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="flex-1 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-blue-500 resize-none"
                  onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") handleReplySubmit(); }}
                />
                <button onClick={handleReplySubmit} disabled={submittingReply || !replyText.trim()}
                  className="self-end px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested Replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                postAuthorId={postAuthorId}
                postType={postType}
                onDelete={onDelete}
                onReplyAdded={onReplyAdded}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentItem;
