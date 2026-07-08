import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, TrendingUp, Tag, Filter, ChevronDown,
  BookOpen, HelpCircle, FileText, Lightbulb, Code2, Link2,
  Loader2, Bookmark, RefreshCw,
} from "lucide-react";
import API from "../services/api";
import { toast } from "react-hot-toast";
import PostCard from "../components/posts/PostCard";

// ─── Constants ────────────────────────────────────────────────────────────
const POST_TYPES = [
  { value: "all",          label: "All",       icon: Filter },
  { value: "question",     label: "Questions", icon: HelpCircle },
  { value: "article",      label: "Articles",  icon: BookOpen },
  { value: "note",         label: "Notes",     icon: FileText },
  { value: "tutorial",     label: "Tutorials", icon: Lightbulb },
  { value: "code-snippet", label: "Code",      icon: Code2 },
  { value: "resource",     label: "Resources", icon: Link2 },
];

const SORT_OPTIONS = [
  { value: "newest",  label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "trending",label: "Trending" },
];

const CATEGORIES = [
  "All", "Technology", "Programming", "Web Development", "Mobile Development",
  "Data Science & AI", "DevOps & Cloud", "Cybersecurity", "Design & UI/UX",
  "Business & Startup", "Science & Math", "Career & Learning", "General",
];

// ─── FeedPage ────────────────────────────────────────────────────────────
const FeedPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [popularTags, setPopularTags] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSortMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    if (!append) setLoading(true); else setLoadingMore(true);

    try {
      const endpoint = showBookmarks ? "posts/bookmarked" : "posts";
      const params = new URLSearchParams({
        page: pageNum, limit: 10,
        ...(type !== "all" && { type }),
        ...(sort && { sort }),
        ...(category && category !== "All" && { category }),
        ...(activeTag && { tag: activeTag }),
        ...(search && { search }),
      });

      const res = await API.get(`${endpoint}?${params}`);
      const { posts: fetched, hasMore: more, total: t } = res.data;

      setPosts((prev) => (append ? [...prev, ...fetched] : fetched));
      setHasMore(more);
      setTotal(t);
      setPage(pageNum);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [type, sort, category, activeTag, search, showBookmarks]);

  useEffect(() => { fetchPosts(1); }, [type, sort, category, activeTag, showBookmarks]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchPosts(1), 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  useEffect(() => {
    API.get("posts/tags/popular?limit=15").then((res) => setPopularTags(res.data?.tags || [])).catch(() => {});
  }, []);

  // Sync URL params
  useEffect(() => {
    const p = {};
    if (type !== "all") p.type = type;
    if (sort !== "newest") p.sort = sort;
    if (category && category !== "All") p.category = category;
    if (activeTag) p.tag = activeTag;
    if (search) p.search = search;
    setSearchParams(p);
  }, [type, sort, category, activeTag, search]);

  const handleLike = async (postId) => {
    try {
      const res = await API.post(`posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) => p._id === postId ? { ...p, isLiked: res.data.liked, likesCount: res.data.likesCount } : p)
      );
    } catch { toast.error("Failed to like"); }
  };

  const handleBookmark = async (postId) => {
    try {
      const res = await API.post(`posts/${postId}/bookmark`);
      setPosts((prev) =>
        prev.map((p) => p._id === postId ? { ...p, isBookmarked: res.data.bookmarked, bookmarksCount: res.data.bookmarksCount } : p)
      );
      if (showBookmarks && !res.data.bookmarked) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    } catch { toast.error("Failed to bookmark"); }
  };

  const clearFilters = () => {
    setType("all"); setSort("newest"); setCategory(""); setActiveTag(""); setSearch("");
  };

  const hasActiveFilters = type !== "all" || sort !== "newest" || category || activeTag || search;

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Top Bar ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search posts, questions, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm transition-all"
            />
          </div>

          {/* Bookmarks Toggle */}
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`p-3 rounded-2xl border shadow-sm transition-all ${showBookmarks ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"}`}
          >
            <Bookmark size={18} fill={showBookmarks ? "currentColor" : "none"} />
          </button>

          {/* Create Post */}
          <button
            onClick={() => navigate("/post/create")}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={3} />
            <span className="hidden sm:block">Create Post</span>
          </button>
        </div>

        <div className="flex gap-6">
          {/* ── Left Sidebar ─────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
            {/* Post Types */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post Type</p>
              </div>
              {POST_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setType(value)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold transition-all ${type === value ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <Icon size={15} strokeWidth={type === value ? 2.5 : 2} />
                  {label}
                </button>
              ))}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat === "All" ? "" : cat)}
                    className={`flex items-center w-full px-4 py-2 text-sm font-bold transition-all ${(cat === "All" && !category) || category === cat ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main Content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Filter Bar */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              {/* Type Pills (mobile) */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
                {POST_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setType(value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${type === value ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"}`}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-slate-500 hover:text-red-500 bg-white border border-slate-200 rounded-xl transition-all">
                    <RefreshCw size={11} /> Clear
                  </button>
                )}

                {/* Sort */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all"
                  >
                    <TrendingUp size={12} />
                    {SORT_OPTIONS.find((s) => s.value === sort)?.label}
                    <ChevronDown size={11} className={`transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        className="absolute right-0 top-10 z-20 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden w-44"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button key={opt.value} onClick={() => { setSort(opt.value); setShowSortMenu(false); }}
                            className={`flex items-center w-full px-4 py-3 text-sm font-bold transition-all ${sort === opt.value ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Active filters display */}
            {(activeTag || category) && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {activeTag && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <Tag size={11} /> #{activeTag}
                    <button onClick={() => setActiveTag("")} className="ml-1 hover:text-red-500">×</button>
                  </span>
                )}
                {category && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                    {category}
                    <button onClick={() => setCategory("")} className="ml-1 hover:text-red-500">×</button>
                  </span>
                )}
              </div>
            )}

            {/* Bookmark header */}
            {showBookmarks && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <Bookmark size={14} className="text-blue-600" fill="currentColor" />
                <span className="text-sm font-black text-blue-700">Showing your saved posts</span>
              </div>
            )}

            {/* Posts */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 size={36} className="animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Loading posts...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 shadow-md flex items-center justify-center mb-6">
                  <BookOpen size={36} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-600 mb-2">
                  {showBookmarks ? "No bookmarks yet" : "No posts found"}
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  {showBookmarks ? "Save posts to read them later." : "Be the first to share knowledge!"}
                </p>
                {!showBookmarks && (
                  <button onClick={() => navigate("/post/create")}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-blue-200"
                  >
                    <Plus size={16} /> Create First Post
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{total} {total === 1 ? "post" : "posts"}</p>
                <div className="space-y-4">
                  <AnimatePresence>
                    {posts.map((post, i) => (
                      <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <PostCard post={post} onLike={handleLike} onBookmark={handleBookmark} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {hasMore && (
                  <button onClick={() => fetchPosts(page + 1, true)} disabled={loadingMore}
                    className="mt-6 w-full py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {loadingMore ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Load more posts"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* ── Right Sidebar ──────────────────────────────────── */}
          <aside className="hidden xl:flex flex-col gap-4 w-52 shrink-0">
            {/* Popular Tags */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-blue-600" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Popular Tags</p>
              </div>
              {popularTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {popularTags.map(({ tag, count }) => (
                    <button key={tag} onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition-all ${activeTag === tag ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 bg-slate-50 border-slate-100 hover:border-blue-300 hover:text-blue-600"}`}
                    >
                      #{tag} <span className="opacity-60">{count}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-300 font-medium">No tags yet</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-80">Quick Actions</p>
              <button onClick={() => navigate("/post/create")}
                className="flex items-center gap-2 w-full py-2.5 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-black transition-all mb-2"
              >
                <Plus size={14} /> New Post
              </button>
              <button onClick={() => { setType("question"); setShowBookmarks(false); }}
                className="flex items-center gap-2 w-full py-2.5 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-black transition-all"
              >
                <HelpCircle size={14} /> Ask Question
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
