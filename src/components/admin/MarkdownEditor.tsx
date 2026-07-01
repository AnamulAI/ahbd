import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

type Props = {
  value: string;
  onChange: (md: string) => void;
  placeholder?: string;
};

const GUIDE: { label: string; example: string }[] = [
  { label: "Headings", example: "## Section title\n### Subsection" },
  { label: "Numbered section badge", example: "## 1. Section with number badge" },
  { label: "Bold / italic / link", example: "**bold**, *italic*, [label](https://url)" },
  { label: "Bullet / numbered list", example: "- item\n- item\n\n1. first\n2. second" },
  { label: "Quick Answer callout", example: "> First blockquote on the page becomes the Quick Answer card." },
  { label: "Rule callout", example: "> **Rule:** Keep it under 90 seconds." },
  { label: "Pull-quote / blockquote", example: "> Any other blockquote renders as a pull-quote." },
  { label: "Table", example: "| Column | Column |\n| --- | --- |\n| Cell | Cell |" },
  { label: "Code", example: "`inline code` or\n```\nblock of code\n```" },
  { label: "Image", example: "![alt text](https://image-url.jpg)" },
  { label: "Divider", example: "---" },
  { label: "FAQ section", example: "## Common Questions\n### First question?\nAnswer paragraph.\n### Second question?\nAnswer paragraph." },
  { label: "Decision checklist", example: "## Decision Checklist\n- First check\n- Second check" },
];

export function MarkdownEditor({ value, onChange, placeholder }: Props) {
  const [guideOpen, setGuideOpen] = useState(false);
  return (
    <div className="rounded-md border border-white/[0.1] bg-[#0B0F1A]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
          Markdown
        </span>
        <button
          type="button"
          onClick={() => setGuideOpen((s) => !s)}
          className="inline-flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Formatting guide
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${guideOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {guideOpen && (
        <div className="grid gap-3 border-b border-white/[0.08] bg-[#0F1526] p-4 sm:grid-cols-2">
          {GUIDE.map((g) => (
            <div key={g.label} className="rounded-md border border-white/[0.06] bg-[#0B0F1A] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3B82F6]">
                {g.label}
              </p>
              <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-white/70">
                {g.example}
              </pre>
            </div>
          ))}
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Write in Markdown. Paste from ChatGPT/Claude also works."}
        rows={22}
        spellCheck={false}
        className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-white placeholder:text-white/30 focus:outline-none"
      />
    </div>
  );
}
