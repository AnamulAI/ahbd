import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag and press Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const t = draft.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft("");
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-white/[0.1] bg-[#16181D] px-2 py-1.5 transition-colors duration-[250ms] ease hover:border-white/20 focus-within:border-[#3B82F6]/60 focus-within:ring-2 focus-within:ring-[#3B82F6]/20">
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded-md border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2 py-0.5 text-xs text-[#93C5FD]"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            aria-label="Remove"
            className="text-[#93C5FD]/70 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder={placeholder}
        className="min-w-[160px] flex-1 bg-transparent px-1 py-0.5 text-xs text-white placeholder:text-white/30 focus:outline-none"
      />
    </div>
  );
}
