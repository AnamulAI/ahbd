import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckSquare,
  Clock,
  Loader2,
  Mail,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { SiFacebook, SiX } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { marked } from "marked";
import anamAvatar from "@/assets/anam-avatar.png.asset.json";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CtaRevealCard } from "@/components/site/CtaRevealCard";
import { BlogCard, CategoryBadge } from "@/components/site/BlogCard";
import { FloatingShareBar, InlineShareBar } from "@/components/site/FloatingShareBar";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  formatPublishedDate,
  type BlogPost,
  type ContentBlock,
} from "@/lib/blog-data";
import { useAllBlogPosts, useBlogPostBySlug } from "@/lib/blog-loader";
import { supabase } from "@/integrations/supabase/client";

type TocHeading = { id: string; text: string; level: 2 | 3 };

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || "section";
}

/** Convert markdown → HTML. Content saved before markdown support starts with a
 *  `<` (legacy TipTap HTML) and is passed through unchanged. */
function toHtml(source: string): string {
  const trimmed = (source ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("<")) return trimmed;
  marked.setOptions({ gfm: true, breaks: false });
  return marked.parse(trimmed, { async: false }) as string;
}

type HtmlSegment =
  | { kind: "html"; html: string }
  | { kind: "checklist"; id: string; title: string; items: string[] }
  | { kind: "faq"; id: string; title: string; items: { q: string; a: string }[] }
  | { kind: "quickanswer"; text: string }
  | { kind: "rule"; html: string };


const FAQ_RE = /(frequently\s*asked|faq|common\s*questions)/i;
const CHECKLIST_RE = /checklist/i;

/** Parse rendered HTML, add IDs to h2/h3, extract headings, and split into segments
 *  where headings matching FAQ/Checklist patterns become special renderable blocks. */
function processHtmlWithHeadings(html: string): {
  headings: TocHeading[];
  segments: HtmlSegment[];
} {
  if (typeof window === "undefined" || !html) return { headings: [], segments: html ? [{ kind: "html", html }] : [] };
  const doc = new DOMParser().parseFromString(html, "text/html");
  const headings: TocHeading[] = [];
  const used = new Set<string>();
  doc.querySelectorAll("h2, h3").forEach((el) => {
    const text = (el.textContent ?? "").trim();
    if (!text) return;
    let id = el.getAttribute("id") || slugifyHeading(text);
    let n = 2;
    while (used.has(id)) id = `${slugifyHeading(text)}-${n++}`;
    used.add(id);
    el.setAttribute("id", id);
    (el as HTMLElement).classList.add("scroll-mt-28");
    // Numbered badge for H2 headings like "1. Title"
    if (el.tagName === "H2") {
      const m = text.match(/^(\d+)\.\s+(.+)$/);
      if (m) {
        const badge = `<span class="mr-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#F97316] font-mono text-sm font-bold text-white align-middle">${m[1]}</span>`;
        el.innerHTML = `${badge}<span class="align-middle">${m[2]}</span>`;
      }
    }
    headings.push({ id, text, level: el.tagName === "H3" ? 3 : 2 });
  });

  const children = Array.from(doc.body.children) as HTMLElement[];
  const segments: HtmlSegment[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer.trim()) segments.push({ kind: "html", html: buffer });
    buffer = "";
  };

  let sawHeading = false;
  let i = 0;
  while (i < children.length) {
    const el = children[i];
    const tag = el.tagName;
    const text = (el.textContent ?? "").trim();

    if ((tag === "H2" || tag === "H3") && FAQ_RE.test(text)) {
      flush();
      const stopAt = tag === "H2" ? ["H2"] : ["H2", "H3"];
      let j = i + 1;
      const inner: HTMLElement[] = [];
      while (j < children.length && !stopAt.includes(children[j].tagName)) {
        inner.push(children[j]);
        j++;
      }
      const items = extractFaqItems(inner);
      if (items.length > 0) {
        segments.push({ kind: "faq", id: el.id, title: text, items });
        sawHeading = true;
        i = j;
        continue;
      }
    } else if (
      (tag === "H2" || tag === "H3") &&
      CHECKLIST_RE.test(text) &&
      children[i + 1] &&
      (children[i + 1].tagName === "UL" || children[i + 1].tagName === "OL")
    ) {
      flush();
      const list = children[i + 1];
      const items = Array.from(list.querySelectorAll(":scope > li")).map(
        (li) => (li.textContent ?? "").trim(),
      ).filter(Boolean);
      if (items.length > 0) {
        segments.push({ kind: "checklist", id: el.id, title: text, items });
        sawHeading = true;
        i += 2;
        continue;
      }
    }

    if (tag === "H2" || tag === "H3") sawHeading = true;

    // Blockquote transforms
    if (tag === "BLOCKQUOTE") {
      const strong = el.querySelector("strong, b");
      const strongText = (strong?.textContent ?? "").trim();
      if (/^rule\b/i.test(strongText)) {
        flush();
        segments.push({ kind: "rule", html: el.innerHTML });
        i++;
        continue;
      }
      // First blockquote before any heading → Quick Answer
      if (!sawHeading && !segments.some((s) => s.kind === "quickanswer")) {
        flush();
        segments.push({ kind: "quickanswer", text: (el.textContent ?? "").trim() });
        i++;
        continue;
      }
    }

    buffer += el.outerHTML;
    i++;
  }
  flush();
  return { headings, segments };
}


function extractFaqItems(nodes: HTMLElement[]): { q: string; a: string }[] {
  const items: { q: string; a: string }[] = [];
  // Pattern A: H3 questions with following siblings as answer.
  const hasH3 = nodes.some((n) => n.tagName === "H3");
  if (hasH3) {
    let current: { q: string; parts: string[] } | null = null;
    const push = () => {
      if (current && current.q) items.push({ q: current.q, a: current.parts.join("") });
      current = null;
    };
    for (const n of nodes) {
      if (n.tagName === "H3") {
        push();
        current = { q: (n.textContent ?? "").trim(), parts: [] };
      } else if (current) {
        current.parts.push(n.outerHTML);
      }
    }
    push();
    return items;
  }
  // Pattern B: single UL/OL where each li has "Question — Answer" or first sentence = q
  const list = nodes.find((n) => n.tagName === "UL" || n.tagName === "OL");
  if (list) {
    Array.from(list.querySelectorAll(":scope > li")).forEach((li) => {
      const strong = li.querySelector("strong, b");
      if (strong) {
        const q = (strong.textContent ?? "").trim();
        const clone = li.cloneNode(true) as HTMLElement;
        clone.querySelector("strong, b")?.remove();
        const a = clone.innerHTML.replace(/^[\s:—-]+/, "").trim();
        if (q) items.push({ q, a });
      } else {
        const raw = (li.textContent ?? "").trim();
        const split = raw.split(/[?？](.+)/);
        if (split.length >= 2 && split[0]) {
          items.push({ q: split[0] + "?", a: split[1].trim() });
        } else if (raw) {
          items.push({ q: raw, a: "" });
        }
      }
    });
  }
  return items;
}

const PROSE_CLASSES = [
  "prose prose-invert max-w-none blog-prose",
  // Headings
  "prose-headings:font-bold prose-headings:text-white prose-headings:scroll-mt-28",
  "prose-h2:mt-14 prose-h2:mb-4 prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:leading-tight",
  "prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:text-white/90",
  // Paragraphs
  "prose-p:mt-6 prose-p:text-[17px] prose-p:leading-[1.8] prose-p:text-muted-foreground",
  // Links
  "prose-a:text-[#3B82F6] prose-a:no-underline hover:prose-a:underline",
  // Strong / em
  "prose-strong:text-white prose-em:text-white/90",
  // Lists
  "prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:text-muted-foreground",
  "marker:text-[#3B82F6]",
  // Code
  "prose-code:rounded prose-code:bg-[#0B1220] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[#93C5FD] prose-code:font-mono prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:bg-[#0B0F1A] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl",
  // Images
  "prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full",
  // HR
  "prose-hr:border-white/10",
].join(" ");

/** Scoped styles for tables + blockquotes rendered inside `.blog-prose`.
 *  Tailwind arbitrary `content` values with escaped quotes are painful,
 *  so we emit a small style block once. */
const PROSE_STYLE = `
.blog-prose table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.08);
  margin: 2.25rem 0;
  font-size: 0.95rem;
}
.blog-prose thead tr {
  background: linear-gradient(180deg, rgba(59,130,246,0.18), rgba(59,130,246,0.08));
}
.blog-prose thead th {
  color: #fff;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.72rem;
  text-align: left;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(59,130,246,0.35);
}
.blog-prose tbody td {
  padding: 0.85rem 1rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.75);
  vertical-align: top;
}
.blog-prose tbody tr:nth-child(even) td { background: rgba(255,255,255,0.03); }
.blog-prose tbody tr:hover td { background: rgba(59,130,246,0.05); }

.blog-prose blockquote {
  position: relative;
  margin: 2.25rem 0;
  padding: 1.75rem 1.5rem 1.25rem 2.25rem;
  background: #0F172A;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  color: rgba(255,255,255,0.9);
  font-style: normal;
  quotes: none;
}
.blog-prose blockquote::before {
  content: "\\201C";
  position: absolute;
  top: -0.35rem;
  left: 1.1rem;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 4.5rem;
  line-height: 1;
  background: linear-gradient(180deg, #3B82F6, #F97316);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  pointer-events: none;
}
.blog-prose blockquote::after {
  content: "";
  position: absolute;
  top: 0.75rem;
  bottom: 0.75rem;
  left: 0;
  width: 3px;
  border-radius: 3px;
  background: linear-gradient(180deg, #3B82F6, #F97316);
}
.blog-prose blockquote > :first-child { margin-top: 0; }
.blog-prose blockquote > :last-child { margin-bottom: 0; }
.blog-prose blockquote p {
  color: rgba(255,255,255,0.92);
  font-size: 1.05rem;
  line-height: 1.7;
}
`;

function HtmlChunk({ html }: { html: string }) {
  return (
    <div
      className={PROSE_CLASSES}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ChecklistSection({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: string[];
}) {
  const label = title.trim().toUpperCase();
  return (
    <section
      id={id}
      className="my-10 scroll-mt-28 rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 sm:p-7"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary)]">
        // {label}
      </p>
      <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
        {title}
      </h3>
      <ol className="mt-6 space-y-4">
        {items.map((raw, i) => {
          // Split on em-dash, en-dash, hyphen with spaces, or colon → main + sub
          const m = raw.match(/^(.+?)\s*(?:[—–]|\s-\s|:)\s+(.+)$/);
          const main = m ? m[1].trim() : raw.trim();
          const sub = m ? m[2].trim() : "";
          return (
            <li key={i} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#F97316] font-mono text-sm font-bold text-white shadow-[0_6px_18px_-8px_rgba(59,130,246,0.6)]">
                {i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[15px] font-semibold leading-snug text-white sm:text-base">
                  {main}
                </p>
                {sub && (
                  <p className="mt-1 text-sm leading-relaxed text-white/60 sm:text-[15px]">
                    {sub}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function AutoFaqSection({
  id,
  items,
}: {
  id: string;
  items: { q: string; a: string }[];
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-28">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
        // Frequently Asked Questions
      </p>
      <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
        Common <span className="text-gradient-vo">Questions</span>
      </h2>
      <Accordion type="single" collapsible className="mt-8 space-y-3">
        {items.map((f, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="card-elevated border-b-0 px-5"
          >
            <AccordionTrigger className="py-5 text-left text-base font-semibold text-white hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent>
              <div
                className="text-sm leading-relaxed text-muted-foreground sm:text-base [&_p]:mt-2 [&_a]:text-[#3B82F6] [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: f.a || "" }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function RuleCallout({ html }: { html: string }) {
  return (
    <aside className="my-8 rounded-xl border border-white/8 border-l-[3px] border-l-[#F97316] bg-[#F97316]/[0.06] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#F97316]" aria-hidden />
        <div
          className="text-[15px] leading-relaxed text-white/90 [&_strong]:text-white [&_strong]:font-semibold [&_p]:m-0 [&_p+p]:mt-2"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </aside>
  );
}

function ArticleSegments({ segments }: { segments: HtmlSegment[] }) {
  return (
    <>
      {segments.map((seg, idx) => {
        if (seg.kind === "html") return <HtmlChunk key={idx} html={seg.html} />;
        if (seg.kind === "checklist")
          return (
            <ChecklistSection
              key={idx}
              id={seg.id}
              title={seg.title}
              items={seg.items}
            />
          );
        if (seg.kind === "faq")
          return <AutoFaqSection key={idx} id={seg.id} items={seg.items} />;
        if (seg.kind === "quickanswer")
          return <QuickAnswer key={idx} text={seg.text} />;
        return <RuleCallout key={idx} html={seg.html} />;
      })}
    </>
  );
}



export const Route = createFileRoute("/blog/$slug")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Blog Post — AnamDev" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-3xl font-bold text-white">Something went wrong</h1>
        <p className="mt-4 text-muted-foreground">{String(error)}</p>
        <Link
          to="/blog"
          className="mt-8 inline-flex items-center gap-2 text-[color:var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  component: BlogPostRoute,
});


/** Inline parser: **bold**, *italic*, [label](url). */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2] !== undefined && m[3] !== undefined) {
      const href = m[3];
      const isExternal = /^https?:\/\//.test(href);
      out.push(
        isExternal ? (
          <a
            key={`${keyPrefix}-a-${i}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[color:var(--primary)] underline decoration-[color:var(--primary)]/40 underline-offset-4 transition-colors hover:decoration-[color:var(--primary)]"
          >
            {m[2]}
          </a>
        ) : (
          <Link
            key={`${keyPrefix}-a-${i}`}
            to={href}
            className="font-medium text-[color:var(--primary)] underline decoration-[color:var(--primary)]/40 underline-offset-4 transition-colors hover:decoration-[color:var(--primary)]"
          >
            {m[2]}
          </Link>
        ),
      );
    } else if (m[4] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-white">
          {m[4]}
        </strong>,
      );
    } else if (m[5] !== undefined) {
      out.push(
        <em key={`${keyPrefix}-i-${i}`} className="italic text-white/90">
          {m[5]}
        </em>,
      );
    }
    last = regex.lastIndex;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function QuickAnswer({ text }: { text: string }) {
  return (
    <aside
      aria-label="Quick answer"
      className="my-8 rounded-xl border border-white/8 border-l-[3px] border-l-[color:var(--primary)] bg-[color:var(--primary)]/[0.06] p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <Sparkles
          className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--primary)]"
          aria-hidden
        />
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--primary)]">
            Quick Answer
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-white/90 sm:text-base">
            {text}
          </p>
        </div>
      </div>
    </aside>
  );
}

function DataTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <figure className="my-10">
      <figcaption className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--orange)]">
        // {title}
      </figcaption>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead className="bg-white/[0.04]">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="border-b border-white/10 px-4 py-3 text-left font-semibold text-white"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-white/[0.06] last:border-0 odd:bg-white/[0.015]"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-3 align-top text-muted-foreground"
                  >
                    {renderInline(cell, `td-${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function Infographic({
  title,
  items,
}: {
  title: string;
  items: { title?: string; text: string }[];
}) {
  return (
    <aside className="my-10 rounded-2xl border border-white/8 bg-[#16181D] p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--primary)]">
          // {title}
        </span>
      </div>
      <ol className="space-y-4">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-start gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-mono text-xs font-bold text-white">
              {idx + 1}
            </span>
            <div className="pt-0.5">
              {it.title && (
                <p className="text-[15px] font-semibold text-white">
                  {renderInline(it.title, `ig-t-${idx}`)}
                </p>
              )}
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {renderInline(it.text, `ig-x-${idx}`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function PullQuote({ text }: { text: string }) {
  return (
    <blockquote className="my-12 relative pl-6 sm:pl-8">
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-[3px] rounded-full bg-gradient-to-b from-[color:var(--primary)] to-[color:var(--orange)]"
      />
      <p className="font-display text-xl italic leading-snug text-white sm:text-2xl">
        "{text}"
      </p>
    </blockquote>
  );
}

function RenderBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((b, idx) => {
        switch (b.type) {
          case "h2":
            return (
              <h2
                key={idx}
                id={b.id}
                className="mt-14 scroll-mt-28 text-2xl font-bold leading-tight text-white sm:text-3xl"
              >
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={idx}
                className="mt-10 text-xl font-bold leading-tight text-white sm:text-2xl"
              >
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p
                key={idx}
                className="mt-6 text-base leading-[1.8] text-muted-foreground sm:text-[17px]"
              >
                {renderInline(b.text, `p-${idx}`)}
              </p>
            );
          case "ul":
            return (
              <ul key={idx} className="mt-6 space-y-3">
                {b.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--primary)]"
                    />
                    <span className="text-base leading-relaxed text-muted-foreground sm:text-[17px]">
                      {renderInline(it, `li-${idx}-${i}`)}
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "pullquote":
            return <PullQuote key={idx} text={b.text} />;
          case "table":
            return (
              <DataTable
                key={idx}
                title={b.title}
                headers={b.headers}
                rows={b.rows}
              />
            );
          case "infographic":
            return (
              <Infographic key={idx} title={b.title} items={b.items} />
            );
        }
      })}
    </>
  );
}

function FaqSection({ items }: { items: BlogPost["faq"] }) {
  return (
    <section className="mt-16">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
        // Frequently Asked Questions
      </p>
      <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
        Common <span className="text-gradient-vo">Questions</span>
      </h2>
      <Accordion type="single" collapsible className="mt-8 space-y-3">
        {items.map((f, i) => (
          <AccordionItem
            key={f.q}
            value={`item-${i}`}
            className="card-elevated border-b-0 px-5"
          >
            <AccordionTrigger className="py-5 text-left text-base font-semibold text-white hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function AuthorShareRow({ post }: { post: BlogPost }) {
  return (
    <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-white/8 bg-[#16181D] p-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <img
          src={anamAvatar.url}
          alt="Mohammad Anamul Hoque"
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/10"
        />
        <div>
          <p className="text-sm font-semibold text-white">
            Mohammad Anamul Hoque
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Web developer & AI integrator helping service-based brands build
            stronger digital presence.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Connect
        </span>
        <a
          href="https://x.com/ahoqdev"
          target="_blank"
          rel="noreferrer"
          aria-label="X profile"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-colors hover:bg-white/[0.06]"
        >
          <SiX className="h-4 w-4 text-white" />
        </a>
        <a
          href="https://www.linkedin.com/in/helloenamul/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn profile"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-colors hover:bg-white/[0.06]"
        >
          <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />
        </a>
        <a
          href="https://www.facebook.com/helloenamul"
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook profile"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-colors hover:bg-white/[0.06]"
        >
          <SiFacebook className="h-4 w-4 text-[#1877F2]" />
        </a>
      </div>
    </div>
  );
}

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (typeof window === "undefined" || ids.length === 0) return;
    const OFFSET = 120; // px from top of viewport
    function compute() {
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - OFFSET <= 0) current = id;
        else break;
      }
      if (!current) current = ids[0] ?? null;
      setActive((prev) => (prev === current ? prev : current));
    }
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [ids.join("|")]);
  return active;
}

type SidebarCardRow = {
  id: string;
  eyebrow_text: string;
  heading: string;
  body_text: string;
  cta_label: string;
  cta_url: string;
  cta_style: string;
  input_type: string;
  input_placeholder: string;
  display_order: number;
  show_on_categories: string[] | null;
};

const CATEGORY_TO_SLUG: Record<string, string> = {
  "Web Development": "web_development",
  "AI Integrator": "ai_integrator",
  "AI Podcast": "ai_podcast",
};

function useSidebarCards(categoryLabel: string): SidebarCardRow[] {
  const [cards, setCards] = useState<SidebarCardRow[]>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("blog_sidebar_cards")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (!active || !data) return;
      const slug = CATEGORY_TO_SLUG[categoryLabel] ?? "";
      const filtered = (data as any[]).filter((c) => {
        const arr = Array.isArray(c.show_on_categories) ? c.show_on_categories : [];
        return arr.length === 0 || arr.includes(slug);
      });
      setCards(filtered as SidebarCardRow[]);
    })();
    return () => {
      active = false;
    };
  }, [categoryLabel]);
  return cards;
}

function SidebarCard({ card }: { card: SidebarCardRow }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onEmailSubmit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: value, status: "active", unsubscribed_at: null });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.success("You're already subscribed — thanks!");
        setEmail("");
        return;
      }
      toast.error(error.message || "Could not subscribe. Please try again.");
      return;
    }
    toast.success("Thanks for subscribing!");
    setEmail("");
  }

  const btnCls =
    card.cta_style === "secondary"
      ? "inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] min-h-9 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-white/[0.08] disabled:opacity-60"
      : "inline-flex items-center justify-center gap-1.5 rounded-full btn-gradient min-h-9 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-60";

  return (
    <div className="rounded-2xl border border-white/8 bg-[#121A2E] p-5">
      {card.eyebrow_text && (
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--orange)]">
          {card.eyebrow_text}
        </p>
      )}
      {card.heading && (
        <h3 className="mt-3 text-base font-bold leading-snug text-white">
          {card.heading}
        </h3>
      )}
      {card.body_text && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {card.body_text}
        </p>
      )}
      {card.input_type === "email" ? (
        <form onSubmit={onEmailSubmit} className="mt-4 flex flex-col gap-2">
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={card.input_placeholder || "you@email.com"}
              className="w-full rounded-md border border-white/10 bg-[#0B0F1A] py-2 pl-8 pr-3 text-xs text-white placeholder:text-muted-foreground focus:border-[color:var(--primary)] focus:outline-none"
            />
          </div>
          <button type="submit" disabled={submitting} className={btnCls}>
            {submitting ? "Subscribing…" : card.cta_label || "Subscribe"}
          </button>
        </form>
      ) : card.cta_label && card.cta_url ? (
        <a href={card.cta_url} className={`mt-4 ${btnCls}`}>
          {card.cta_label}
        </a>
      ) : null}
    </div>
  );
}

function StickySidebar({
  headings,
  category,
}: {
  headings: TocHeading[];
  category: string;
}) {
  const active = useScrollSpy(headings.map((h) => h.id));
  const cards = useSidebarCards(category);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="space-y-6 pr-1">
        {headings.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-[#121A2E] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--primary)]">
              // In This Article
            </p>
            <nav className="mt-4">
              <ul className="space-y-1">
                {headings.map((h) => {
                  const isActive = active === h.id;
                  return (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        onClick={(e) => handleClick(e, h.id)}
                        className={[
                          "block border-l-2 py-1.5 text-sm leading-snug transition-colors",
                          h.level === 3 ? "pl-6 pr-3 text-[13px]" : "px-3",
                          isActive
                            ? "border-[#3B82F6] bg-[#3B82F6]/[0.10] text-[#3B82F6] font-medium"
                            : "border-transparent text-muted-foreground hover:border-white/15 hover:text-white",
                        ].join(" ")}
                      >
                        {h.text}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        )}

        {cards.map((c) => (
          <SidebarCard key={c.id} card={c} />
        ))}
      </div>
    </aside>
  );
}



function BlogPostRoute() {
  const { slug } = Route.useParams();
  const { post, loading } = useBlogPostBySlug(slug);

  useEffect(() => {
    if (post && typeof document !== "undefined") {
      document.title = `${post.title} — AnamDev Blog`;
    }
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto flex max-w-3xl items-center justify-center px-6 py-32">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </main>
        <SiteFooter />
      </div>
    );
  }
  if (!post) return <NotFoundPost />;
  return <BlogPostPage post={post} />;
}

function NotFoundPost() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--orange)]">
          // 404
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white">Post not found</h1>
        <p className="mt-4 text-muted-foreground">
          That article doesn't exist or has been moved.
        </p>
        <Link
          to="/blog"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/[0.04]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function BlogPostPage({ post }: { post: BlogPost }) {
  const { posts: allPosts } = useAllBlogPosts();
  const sameCat = allPosts.filter((p) => p.slug !== post.slug && p.category === post.category);
  const otherCat = allPosts.filter((p) => p.slug !== post.slug && p.category !== post.category);
  const related = [...sameCat, ...otherCat].slice(0, 3);

  const { segments, headings: htmlHeadings } = useMemo(
    () => processHtmlWithHeadings(toHtml(post.bodyHtml ?? "")),
    [post.bodyHtml],
  );
  const blockHeadings = useMemo<TocHeading[]>(
    () =>
      post.body
        .filter((b): b is Extract<ContentBlock, { type: "h2" }> => b.type === "h2")
        .map((h) => ({ id: h.id, text: h.text, level: 2 })),
    [post],
  );
  const headings = post.bodyHtml ? htmlHeadings : blockHeadings;



  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <FloatingShareBar title={post.title} image={post.coverImage} />
      <main>
        {/* Hero */}
        <section className="pt-12 sm:pt-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[color:var(--primary)]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Blog
              </Link>
              <CategoryBadge category={post.category} />
            </div>
            <div className="mt-8 text-center">
              <h1 className="mt-4 mx-auto max-w-4xl text-3xl font-bold leading-[1.15] text-white sm:text-4xl md:text-5xl">
                {post.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-mono text-[10px] font-bold text-white">
                  MA
                </span>
                <span className="text-white/85">Mohammad Anamul Hoque</span>
              </span>
              <span aria-hidden>·</span>
              <span>{formatPublishedDate(post.publishedDate)}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {post.readTime}
              </span>
            </div>
          </div>
          </div>
        </section>

        {/* Two-column body */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
            {/* LEFT: article content */}
            <article className="min-w-0">
              <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/5">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>

              {post.quickAnswer && <QuickAnswer text={post.quickAnswer} />}

              {post.bodyHtml ? (
                <div className="mt-8">
                  <ArticleSegments segments={segments} />
                </div>
              ) : (
                <RenderBlocks blocks={post.body} />
              )}

              {post.faq.length > 0 && <FaqSection items={post.faq} />}

              <InlineShareBar title={post.title} image={post.coverImage} />

              <AuthorShareRow post={post} />
            </article>

            {/* RIGHT: sticky sidebar */}
            <StickySidebar headings={headings} category={post.category} />
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="pb-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Related Posts
                </h2>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1 text-sm text-[color:var(--primary)]"
                >
                  All posts <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
              <div className="grid gap-6 max-md:place-items-center sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <div key={p.slug} className="w-full max-w-sm sm:max-w-none">
                    <BlogCard post={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Closing CTA */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <CtaRevealCard>
              <div className="flex flex-col items-center text-center">
                <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                  Have a <span className="text-gradient-vo">Project</span> in Mind?
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Let's talk about what you're building — web, AI, or podcast
                  production.
                </p>
                <div className="mt-8">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full btn-gradient min-h-9 text-center px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
                  >
                    Discuss Your Project <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </CtaRevealCard>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
