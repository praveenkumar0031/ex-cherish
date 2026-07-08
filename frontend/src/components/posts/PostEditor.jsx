import React, { useState, useRef, useCallback } from "react";

// ─── Toolbar config ───────────────────────────────────────────────────────
const TOOLBAR = [
  { label: "B", title: "Bold (Ctrl+B)", before: "**", after: "**" },
  { label: "I", title: "Italic (Ctrl+I)", before: "*", after: "*" },
  { label: "~~", title: "Strikethrough", before: "~~", after: "~~" },
  { divider: true },
  { label: "H1", title: "Heading 1", line: "# ", wrap: false },
  { label: "H2", title: "Heading 2", line: "## ", wrap: false },
  { label: "H3", title: "Heading 3", line: "### ", wrap: false },
  { divider: true },
  { label: "< >", title: "Inline Code", before: "`", after: "`" },
  { label: "```", title: "Code Block", before: "```\n", after: "\n```" },
  { divider: true },
  { label: "—", title: "Bullet List", line: "- ", wrap: false },
  { label: "1.", title: "Numbered List", line: "1. ", wrap: false },
  { label: ">", title: "Blockquote", line: "> ", wrap: false },
  { divider: true },
  { label: "—", title: "Horizontal Rule", insert: "\n---\n" },
  { label: "🔗", title: "Link", before: "[", after: "](url)" },
];

// ─── PostEditor Component ─────────────────────────────────────────────────
const PostEditor = ({ value, onChange, placeholder = "Write your content here using Markdown...", minHeight = 400 }) => {
  const [mode, setMode] = useState("write"); // write | preview | split
  const textareaRef = useRef(null);
  const { renderMarkdown } = React.useMemo(() => {
    // Dynamic import to avoid circular deps
    return { renderMarkdown: null };
  }, []);

  const [previewHtml, setPreviewHtml] = useState("");

  // Lazy-load the renderer only when needed
  const getPreview = useCallback(async () => {
    const { renderMarkdown: render } = await import("../../utils/markdownRenderer.js");
    setPreviewHtml(render(value));
  }, [value]);

  React.useEffect(() => {
    if (mode === "preview" || mode === "split") {
      getPreview();
    }
  }, [mode, value, getPreview]);

  // ── Insert syntax around selection ─────────────────────────────────────
  const insertSyntax = useCallback(({ before, after, line, insert }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    let newValue = value;
    let newCursorStart = start;
    let newCursorEnd = end;

    if (insert) {
      // Direct insert (e.g. HR)
      newValue = value.slice(0, start) + insert + value.slice(end);
      newCursorStart = newCursorEnd = start + insert.length;
    } else if (line) {
      // Prepend to current line
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      newValue = value.slice(0, lineStart) + line + value.slice(lineStart);
      newCursorStart = newCursorEnd = start + line.length;
    } else if (before && after) {
      // Wrap selection
      newValue = value.slice(0, start) + before + selected + after + value.slice(end);
      newCursorStart = start + before.length;
      newCursorEnd = end + before.length;
    }

    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 0);
  }, [value, onChange]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") { e.preventDefault(); insertSyntax({ before: "**", after: "**" }); }
      if (e.key === "i") { e.preventDefault(); insertSyntax({ before: "*", after: "*" }); }
      if (e.key === "k") { e.preventDefault(); insertSyntax({ before: "[", after: "](url)" }); }
    }
    // Tab = 2 spaces in code blocks
    if (e.key === "Tab") {
      e.preventDefault();
      insertSyntax({ insert: "  " });
    }
  }, [insertSyntax]);

  const modes = [
    { id: "write", label: "Write" },
    { id: "split", label: "Split" },
    { id: "preview", label: "Preview" },
  ];

  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 flex-wrap gap-2">
        <div className="flex items-center gap-0.5 flex-wrap">
          {TOOLBAR.map((item, i) => {
            if (item.divider) return <div key={i} className="w-px h-5 bg-slate-200 mx-1" />;
            return (
              <button
                key={i}
                type="button"
                title={item.title}
                onClick={() => insertSyntax(item)}
                className="px-2 py-1 text-xs font-mono font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-all duration-150 min-w-[28px] text-center"
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-0 bg-slate-200 rounded-xl p-0.5">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                mode === m.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Editor / Preview Area ─────────────────────────────────────── */}
      <div className={`${mode === "split" ? "flex" : "block"}`} style={{ minHeight }}>
        {/* Write Pane */}
        {(mode === "write" || mode === "split") && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${
              mode === "split" ? "w-1/2 border-r border-slate-200" : "w-full"
            } p-5 resize-none outline-none font-mono text-sm text-slate-700 placeholder:text-slate-300 bg-white leading-relaxed`}
            style={{ minHeight, height: "100%" }}
          />
        )}

        {/* Preview Pane */}
        {(mode === "preview" || mode === "split") && (
          <div
            className={`${mode === "split" ? "w-1/2" : "w-full"} p-5 overflow-y-auto prose-excherish`}
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: previewHtml || "<p class='text-slate-300 text-sm'>Nothing to preview yet...</p>" }}
          />
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Markdown supported</span>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
