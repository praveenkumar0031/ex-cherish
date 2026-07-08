import React, { useState, useRef } from "react";
import { X } from "lucide-react";

const TagInput = ({ tags = [], onChange, maxTags = 10, placeholder = "Add tag and press Enter..." }) => {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const tag = raw
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (!tag || tags.includes(tag) || tags.length >= maxTags) return;
    onChange([...tags, tag]);
    setInput("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-xl bg-white cursor-text min-h-[48px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all"
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100"
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-red-500 transition-colors ml-0.5"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </span>
      ))}

      {tags.length < maxTags && (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none text-sm text-slate-700 placeholder:text-slate-300 bg-transparent"
        />
      )}

      <div className="w-full flex justify-end">
        <span className="text-[10px] text-slate-300 font-bold">
          {tags.length}/{maxTags} tags
        </span>
      </div>
    </div>
  );
};

export default TagInput;
