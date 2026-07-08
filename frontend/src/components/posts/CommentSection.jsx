import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-hot-toast";
import CommentItem from "./CommentItem";

const Avatar = ({ user }) => {
  const initials = user?.name?.charAt(0)?.toUpperCase() || "?";
  return user?.profilePic ? (
    <img src={user.profilePic} alt={user.name} className="w-9 h-9 rounded-xl object-cover border border-slate-100 shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
      {initials}
    </div>
  );
};

const CommentSection = ({ postId, postAuthorId, postType, commentsCount }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(commentsCount || 0);

  const fetchComments = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`comments/post/${postId}?page=${p}&limit=15`);
      const { comments: fetched, hasMore: more, total: t } = res.data;
      setComments((prev) => (p === 1 ? fetched : [...prev, ...fetched]));
      setHasMore(more);
      setTotal(t);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await API.post("comments", { postId, content: text });
      setComments((prev) => [res.data.comment, ...prev]);
      setTotal((t) => t + 1);
      setText("");
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyAdded = (reply, parentId) => {
    setComments((prev) =>
      prev.map((c) =>
        c._id === parentId
          ? { ...c, replies: [...(c.replies || []), reply], repliesCount: (c.repliesCount || 0) + 1 }
          : c
      )
    );
    setTotal((t) => t + 1);
  };

  const handleDelete = async (commentId) => {
    try {
      await API.delete(`comments/${commentId}`);
      // Soft delete in UI — replace with deleted placeholder
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) return { ...c, isDeleted: true, content: "[Comment deleted]" };
          return {
            ...c,
            replies: (c.replies || []).map((r) =>
              r._id === commentId ? { ...r, isDeleted: true, content: "[Comment deleted]" } : r
            ),
          };
        })
      );
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleAccept = async (commentId) => {
    try {
      await API.post(`comments/${commentId}/accept`);
      setComments((prev) =>
        prev.map((c) => ({ ...c, isAccepted: c._id === commentId }))
      );
      toast.success("Answer accepted! ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept answer");
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  };

  return (
    <section id="comments" className="mt-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
          <MessageSquare size={16} className="text-blue-600" />
        </div>
        <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
          {total} {total === 1 ? "Comment" : "Comments"}
        </h3>
      </div>

      {/* Comment Input */}
      <div className="flex gap-3 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <Avatar user={user} />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={postType === "question" ? "Write your answer..." : "Add a comment..."}
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none transition-all"
            onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") handleSubmit(); }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-slate-400 font-bold">Ctrl+Enter to submit</span>
            <button
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {postType === "question" ? "Post Answer" : "Post Comment"}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <MessageSquare size={28} className="text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold text-sm">
            {postType === "question" ? "No answers yet. Be the first to help!" : "No comments yet. Start the conversation!"}
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postAuthorId={postAuthorId}
                postType={postType}
                onAccept={handleAccept}
                onDelete={handleDelete}
                onReplyAdded={handleReplyAdded}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Load More */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-6 w-full py-3 border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more comments"}
        </button>
      )}
    </section>
  );
};

export default CommentSection;
