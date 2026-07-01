import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Loader2,
  Mail,
  Sparkles,
} from "lucide-react";
import { SiFacebook, SiX } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
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

/** Parse rendered HTML, add IDs to h2/h3, return processed html + heading list. */
function processHtmlWithHeadings(html: string): {
  html: string;
  headings: TocHeading[];
} {
  if (typeof window === "undefined" || !html) return { html, headings: [] };
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
    headings.push({ id, text, level: el.tagName === "H3" ? 3 : 2 });
  });
  return { html: doc.body.innerHTML, headings };
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
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            visible.set(e.target.id, e.intersectionRatio);
          } else {
            visible.delete(e.target.id);
          }
        }
        if (visible.size > 0) {
          // Pick the first heading currently visible in DOM order
          for (const id of ids) {
            if (visible.has(id)) {
              setActive(id);
              break;
            }
          }
        }
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: [0, 0.5, 1] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids.join("|")]);
  return active;
}

function StickySidebar({ post }: { post: BlogPost }) {
  const headings = useMemo(
    () =>
      post.body
        .filter((b): b is Extract<ContentBlock, { type: "h2" }> => b.type === "h2")
        .map((h) => ({ id: h.id, text: h.text })),
    [post],
  );
  const active = useScrollSpy(headings.map((h) => h.id));

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="space-y-6">
        {headings.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-[#16181D] p-5">
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
                          "block rounded-md border-l-2 px-3 py-1.5 text-sm leading-snug transition-colors",
                          isActive
                            ? "border-[color:var(--primary)] bg-[color:var(--primary)]/[0.08] text-white"
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

        <div className="rounded-2xl border border-[color:var(--primary)]/30 bg-[#16181D] p-5 shadow-[0_18px_60px_-30px_var(--vo-glow)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--orange)]">
            // Ready to Start?
          </p>
          <h3 className="mt-3 text-lg font-bold leading-snug text-white">
            {post.sidebarCta.headline}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {post.sidebarCta.subtext}
          </p>
          <Link
            to={post.sidebarCta.href}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full btn-gradient min-h-9 text-center px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            {post.sidebarCta.ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
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
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

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
                <div
                  className="prose prose-invert mt-8 max-w-none prose-headings:font-bold prose-headings:text-white prose-h2:mt-14 prose-h2:text-2xl sm:prose-h2:text-3xl prose-h3:mt-10 prose-h3:text-xl sm:prose-h3:text-2xl prose-p:mt-6 prose-p:text-[17px] prose-p:leading-[1.8] prose-p:text-muted-foreground prose-a:text-[color:var(--primary)] prose-strong:text-white prose-li:text-muted-foreground prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
                />
              ) : (
                <RenderBlocks blocks={post.body} />
              )}

              {post.faq.length > 0 && <FaqSection items={post.faq} />}

              <InlineShareBar title={post.title} image={post.coverImage} />

              <AuthorShareRow post={post} />
            </article>

            {/* RIGHT: sticky sidebar */}
            <StickySidebar post={post} />
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
