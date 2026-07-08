import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HelpCircle, BookOpen, FileText, Lightbulb, Code2, Link2,
  ChevronLeft, Save, Send, Eye, Globe, Lock, Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../services/api";
import PostEditor from "../components/posts/PostEditor";
import TagInput from "../components/posts/TagInput";

// ─── Post Type Options ────────────────────────────────────────────────────
const POST_TYPES = [
  {
    value: "question",
    label: "Question",
    icon: HelpCircle,
    desc: "Ask for help or clarification",
    color: "border-blue-200 bg-blue-50 text-blue-600",
    activeColor: "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200",
  },
  {
    value: "article",
    label: "Article",
    icon: BookOpen,
    desc: "Share in-depth knowledge",
    color: "border-purple-200 bg-purple-50 text-purple-600",
    activeColor: "border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-200",
  },
  {
    value: "note",
    label: "Note",
    icon: FileText,
    desc: "Quick thoughts or tips",
    color: "border-amber-200 bg-amber-50 text-amber-600",
    activeColor: "border-amber-500 bg-amber-600 text-white shadow-lg shadow-amber-200",
  },
  {
    value: "tutorial",
    label: "Tutorial",
    icon: Lightbulb,
    desc: "Step-by-step guide",
    color: "border-emerald-200 bg-emerald-50 text-emerald-600",
    activeColor: "border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-200",
  },
  {
    value: "code-snippet",
    label: "Code",
    icon: Code2,
    desc: "Share useful code",
    color: "border-slate-200 bg-slate-100 text-slate-600",
    activeColor: "border-slate-500 bg-slate-700 text-white shadow-lg shadow-slate-200",
  },
  {
    value: "resource",
    label: "Resource",
    icon: Link2,
    desc: "Useful links & references",
    color: "border-orange-200 bg-orange-50 text-orange-600",
    activeColor: "border-orange-500 bg-orange-600 text-white shadow-lg shadow-orange-200",
  },
];

const CATEGORIES = [
  "General", "Technology", "Programming", "Web Development", "Mobile Development",
  "Data Science & AI", "DevOps & Cloud", "Cybersecurity", "Design & UI/UX",
  "Business & Startup", "Science & Math", "Career & Learning",
];

const CODE_LANGUAGES = [
  "javascript", "typescript", "python", "java", "c", "cpp", "csharp", "go",
  "rust", "php", "ruby", "swift", "kotlin", "sql", "bash", "html", "css",
  "json", "yaml", "markdown", "text",
];

// ─── CreatePostPage ───────────────────────────────────────────────────────
const CreatePostPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // present if editing existing post
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    type: "article",
    title: "",
    content: "",
    category: "General",
    tags: [],
    status: "published",
    codeLanguage: "javascript",
    resourceUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingPost, setFetchingPost] = useState(isEditing);
  const [savingDraft, setSavingDraft] = useState(false);

  // Load existing post data when editing
  useEffect(() => {
    if (!isEditing) return;
    const fetchPost = async () => {
      try {
        const res = await API.get(`posts/${id}`);
        const p = res.data.post;
        setForm({
          type: p.type,
          title: p.title,
          content: p.content,
          category: p.category || "General",
          tags: p.tags || [],
          status: p.status,
          codeLanguage: p.codeLanguage || "javascript",
          resourceUrl: p.resourceUrl || "",
        });
      } catch {
        toast.error("Failed to load post");
        navigate("/feed");
      } finally {
        setFetchingPost(false);
      }
    };
    fetchPost();
  }, [id, isEditing, navigate]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return false; }
    if (!form.content.trim()) { toast.error("Content is required"); return false; }
    if (form.title.trim().length < 10) { toast.error("Title must be at least 10 characters"); return false; }
    if (form.content.trim().length < 20) { toast.error("Content must be at least 20 characters"); return false; }
    return true;
  };

  const handleSubmit = async (status = "published") => {
    if (!validate()) return;

    const isDraft = status === "draft";
    isDraft ? setSavingDraft(true) : setLoading(true);

    try {
      const payload = { ...form, status };
      let res;
      if (isEditing) {
        res = await API.put(`posts/${id}`, payload);
        toast.success("Post updated! ✨");
      } else {
        res = await API.post("posts", payload);
        toast.success(isDraft ? "Draft saved!" : "Post published! 🎉");
      }
      navigate(`/post/${res.data.post._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save post");
    } finally {
      setLoading(false);
      setSavingDraft(false);
    }
  };

  const selectedType = POST_TYPES.find((t) => t.value === form.type);

  if (fetchingPost) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {isEditing ? "Edit Post" : "Create Post"}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Share your knowledge with the ExCherish community
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ── Post Type Selector ───────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Post Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {POST_TYPES.map(({ value, label, icon: Icon, desc, color, activeColor }) => (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => setField("type", value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                    form.type === value ? activeColor : `${color} hover:opacity-90`
                  }`}
                >
                  <Icon size={22} strokeWidth={form.type === value ? 2.5 : 2} />
                  <span className="font-black text-sm">{label}</span>
                  <span className={`text-[10px] font-medium leading-tight ${form.type === value ? "opacity-80" : "opacity-60"}`}>
                    {desc}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Title ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              {form.type === "question" ? "Your Question" : "Title"}
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder={
                form.type === "question"
                  ? "e.g. How do I implement binary search in Python?"
                  : form.type === "code-snippet"
                  ? "e.g. Debounce function in JavaScript"
                  : "Write a clear, descriptive title..."
              }
              className="w-full text-xl font-bold text-slate-800 placeholder:text-slate-300 outline-none border-b border-slate-100 pb-3 focus:border-blue-400 transition-colors"
            />
            <div className="flex justify-end mt-2">
              <span className={`text-[10px] font-bold ${form.title.length > 280 ? "text-red-500" : "text-slate-300"}`}>
                {form.title.length}/300
              </span>
            </div>
          </div>

          {/* ── Content Editor ───────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              {form.type === "question" ? "Describe Your Problem" : "Content"}
            </label>
            <PostEditor
              value={form.content}
              onChange={(v) => setField("content", v)}
              placeholder={
                form.type === "question"
                  ? "Explain your problem in detail. Include what you've already tried...\n\n**Code Example:**\n```python\n# your code here\n```"
                  : form.type === "code-snippet"
                  ? "```javascript\n// Your code here\n```\n\nExplain what it does..."
                  : "Share your knowledge using Markdown...\n\n## Getting Started\n\nWrite your content here..."
              }
              minHeight={320}
            />
          </div>

          {/* ── Code Language (for code-snippet) ─────────────── */}
          {form.type === "code-snippet" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Primary Language
              </label>
              <div className="flex flex-wrap gap-2">
                {CODE_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setField("codeLanguage", lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      form.codeLanguage === lang
                        ? "bg-slate-700 text-white border-slate-700"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Resource URL (for resource) ──────────────────── */}
          {form.type === "resource" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Resource URL
              </label>
              <input
                type="url"
                value={form.resourceUrl}
                onChange={(e) => setField("resourceUrl", e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          )}

          {/* ── Metadata Row ─────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
              <select
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Tags <span className="font-medium opacity-60">(max 10)</span>
              </label>
              <TagInput tags={form.tags} onChange={(tags) => setField("tags", tags)} />
            </div>
          </div>

          {/* ── Action Bar ───────────────────────────────────── */}
          <div className="flex items-center gap-3 justify-between sticky bottom-4">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={savingDraft || loading}
              className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 font-black text-sm rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all disabled:opacity-50"
            >
              {savingDraft ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>

            <div className="flex items-center gap-2">
              {/* Visibility indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-white border border-slate-200 px-3 py-2 rounded-xl">
                <Globe size={13} className="text-emerald-500" />
                Public
              </div>

              <motion.button
                type="button"
                onClick={() => handleSubmit("published")}
                disabled={loading || savingDraft}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isEditing ? "Update Post" : "Publish Post"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
