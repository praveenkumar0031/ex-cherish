/**
 * Lightweight Markdown → HTML renderer.
 * Handles: headings, bold, italic, strikethrough, inline code,
 * fenced code blocks, blockquotes, ordered/unordered lists,
 * links, images, horizontal rules, and paragraphs.
 */

const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const processInline = (text) =>
  text
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>'
    )
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="md-image" />'
    );

export const renderMarkdown = (markdown) => {
  if (!markdown || typeof markdown !== "string") return "";

  const lines = markdown.split("\n");
  let html = "";
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ── Fenced Code Blocks ───────────────────────────────────────────────
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        closeList();
        inCodeBlock = true;
        codeLang = line.slice(3).trim() || "text";
        codeLines = [];
      } else {
        const escaped = escapeHtml(codeLines.join("\n"));
        html += `<pre class="md-code-block"><div class="md-code-lang">${codeLang}</div><code class="language-${codeLang}">${escaped}</code></pre>`;
        inCodeBlock = false;
        codeLang = "";
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // ── Empty Line ───────────────────────────────────────────────────────
    if (line.trim() === "") {
      closeList();
      continue;
    }

    // ── Headings ─────────────────────────────────────────────────────────
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      const content = processInline(headingMatch[2]);
      html += `<h${level} class="md-h${level}">${content}</h${level}>`;
      continue;
    }

    // ── Horizontal Rule ──────────────────────────────────────────────────
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeList();
      html += '<hr class="md-hr" />';
      continue;
    }

    // ── Blockquote ───────────────────────────────────────────────────────
    if (line.startsWith("> ")) {
      closeList();
      html += `<blockquote class="md-blockquote">${processInline(line.slice(2))}</blockquote>`;
      continue;
    }

    // ── Unordered List ───────────────────────────────────────────────────
    const ulMatch = line.match(/^[\-\*\+]\s+(.*)/);
    if (ulMatch) {
      if (inOl) { html += "</ol>"; inOl = false; }
      if (!inUl) { html += '<ul class="md-ul">'; inUl = true; }
      html += `<li class="md-li">${processInline(ulMatch[1])}</li>`;
      continue;
    }

    // ── Ordered List ─────────────────────────────────────────────────────
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (!inOl) { html += '<ol class="md-ol">'; inOl = true; }
      html += `<li class="md-li">${processInline(olMatch[1])}</li>`;
      continue;
    }

    // ── Paragraph ────────────────────────────────────────────────────────
    closeList();
    html += `<p class="md-p">${processInline(line)}</p>`;
  }

  closeList();
  return html;
};

/** Strip all markdown and return plain text excerpt */
export const getExcerpt = (markdown, maxLength = 200) => {
  if (!markdown) return "";
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/[#*_~>\[\]!]/g, "")
    .replace(/\(https?:\/\/[^)]+\)/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, maxLength);
};
