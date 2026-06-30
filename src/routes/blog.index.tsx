import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent, useMemo, type ComponentType } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Bot, Clock, Code2, Mail, Mic2, Search, X } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CtaRevealCard } from "@/components/site/CtaRevealCard";
import { RevealBorder } from "@/components/site/RevealBorder";
import { BlogCard, CategoryBadge } from "@/components/site/BlogCard";
import {
  formatPublishedDate,
  getSortedPosts,
  type BlogCategory,
  type BlogPost,
} from "@/lib/blog-data";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — AnamDev | Web Development, AI & Podcasting" },
      {
        name: "description",
        content:
          "Practical guides on web development, AI integration, and AI-powered podcasting from Mohammad Anamul Hoque (AnamDev).",
      },
      { property: "og:title", content: "Blog — AnamDev" },
      {
        property: "og:description",
        content:
          "Real insights from building websites, AI systems, and podcast production — no fluff, just what actually works.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogIndexPage,
});

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
      {children}
    </div>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
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

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <CtaRevealCard>
          <div className="flex flex-col items-center text-center">
            <Eyebrow>// STAY UPDATED</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Get <span className="text-gradient-vo">New Posts</span> in Your Inbox
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Practical web dev, AI, and podcasting insights — no spam, unsubscribe
              anytime.
            </p>
            <form
              onSubmit={onSubmit}
              className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="relative flex-1">
                <Mail
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-full border border-white/10 bg-[#16181D] pl-11 pr-4 text-sm text-white placeholder:text-muted-foreground focus:border-[color:var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/30"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full btn-gradient min-h-9 text-center px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                {submitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </CtaRevealCard>
      </div>
    </section>
  );
}

type CategorySectionConfig = {
  category: BlogCategory;
  slug: string;
  eyebrow: string;
  headlineBefore: string;
  headlineGradient: string;
  headlineAfter: string;
  intro: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  iconTint: string;
  iconBorder: string;
  iconColor: string;
  glowColor: string;
};

const CATEGORY_SECTIONS: CategorySectionConfig[] = [
  {
    category: "Web Development",
    slug: "web-development",
    eyebrow: "// WEB DEVELOPMENT",
    headlineBefore: "Build a Site That ",
    headlineGradient: "Sells",
    headlineAfter: ", Not Just Looks Good",
    intro:
      "Notes on what actually makes a website convert — design choices, tech decisions, and the difference between a brochure site and one that brings in business.",
    Icon: Code2,
    iconTint: "bg-[color:var(--primary)]/12",
    iconBorder: "border-[color:var(--primary)]/30",
    iconColor: "text-[color:var(--primary)]",
    glowColor: "bg-[#3B82F6]/25",
  },
  {
    category: "AI Integrator",
    slug: "ai-integrator",
    eyebrow: "// AI INTEGRATOR",
    headlineBefore: "Make AI Work Where Your Business ",
    headlineGradient: "Already",
    headlineAfter: " Lives",
    intro:
      "How custom AI agents save time, cut busywork, and connect directly into the tools your team and customers already use — without a separate chat window.",
    Icon: Bot,
    iconTint: "bg-[#8B5CF6]/12",
    iconBorder: "border-[#8B5CF6]/30",
    iconColor: "text-[#A78BFA]",
    glowColor: "bg-[#8B5CF6]/25",
  },
  {
    category: "AI Podcast",
    slug: "ai-podcast",
    eyebrow: "// AI PODCAST",
    headlineBefore: "Build Authority While Your Competitors Stay ",
    headlineGradient: "Quiet",
    headlineAfter: "",
    intro:
      "What it actually takes to launch and grow a podcast — and why it's still one of the lowest-competition ways to build trust in a niche.",
    Icon: Mic2,
    iconTint: "bg-[color:var(--orange)]/12",
    iconBorder: "border-[color:var(--orange)]/30",
    iconColor: "text-[color:var(--orange)]",
    glowColor: "bg-[#F97316]/25",
  },
];

function CategorySection({
  section,
  posts,
  totalCount,
}: {
  section: CategorySectionConfig;
  posts: BlogPost[];
  totalCount: number;
}) {
  const { Icon } = section;
  return (
    <div>
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="relative inline-flex">
          <div
            className={[
              "absolute -inset-4 rounded-full blur-2xl",
              section.glowColor,
            ].join(" ")}
            aria-hidden
          />
          <span
            className={[
              "relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border",
              section.iconTint,
              section.iconBorder,
            ].join(" ")}
            aria-hidden
          >
            <Icon className={`h-7 w-7 ${section.iconColor}`} aria-hidden />
          </span>
        </div>
        <div className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
          {section.eyebrow}
        </div>
        <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
          {section.headlineBefore}
          <span className="text-gradient-vo">{section.headlineGradient}</span>
          {section.headlineAfter}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {section.intro}
        </p>
      </div>

      <div className="mt-10 grid gap-6 max-md:place-items-center sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post.slug} className="w-full max-w-sm sm:max-w-none">
            <BlogCard post={post} />
          </div>
        ))}
      </div>

      {totalCount > 3 && (
        <div className="mt-8 text-center">
          <a
            href={`/blog?category=${section.slug}`}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--primary)] hover:underline"
          >
            See all {section.category} posts
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              aria-hidden
            />
          </a>
        </div>
      )}
    </div>
  );
}

function BlogIndexPage() {
  const posts = getSortedPosts();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [posts, query]);

  const hasQuery = query.trim().length > 0;
  const featured = !hasQuery ? filtered[0] : undefined;
  const rest = hasQuery ? filtered : filtered.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative section-glow-hero">
          <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <Eyebrow>// THE ANAMDEV BLOG</Eyebrow>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
              Practical Guides on{" "}
              <span className="text-gradient-vo">Web Development</span>, AI &
              Podcasting
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Real insights from building websites, AI systems, and podcast
              production — no fluff, just what actually works.
            </p>

            {/* Search */}
            <div className="mx-auto mt-10 flex w-full max-w-md items-center rounded-full border border-white/10 bg-[#16181D] px-1 focus-within:border-[color:var(--primary)]/60 focus-within:ring-2 focus-within:ring-[color:var(--primary)]/30">
              <div className="flex flex-1 items-center px-4">
                <Search
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <label htmlFor="blog-search" className="sr-only">
                  Search posts
                </label>
                <input
                  id="blog-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title or category..."
                  className="h-11 w-full bg-transparent pl-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>

            {hasQuery && (
              <p className="mt-4 text-sm text-muted-foreground">
                {filtered.length === 0
                  ? "No posts found."
                  : `${filtered.length} result${filtered.length === 1 ? "" : "s"} found`}
              </p>
            )}
          </div>
        </section>

        {/* Featured + grid */}
        <section className="pb-20 sm:pb-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {featured && (
              <div className="group/reveal relative">
                <RevealBorder rounded="rounded-3xl" radius={24} />
                <Link
                  to="/blog/$slug"
                  params={{ slug: featured.slug }}
                  className="group relative grid overflow-hidden rounded-3xl bg-[#16181D] md:grid-cols-2"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-white/5 md:aspect-auto md:h-full">
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={featured.category} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--orange)]">
                      // Featured
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {featured.excerpt}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" aria-hidden />
                      {featured.readTime} ·{" "}
                      {formatPublishedDate(featured.publishedDate)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[color:var(--primary)] transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                      Read Article <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
              </div>
            )}

            {hasQuery ? (
              rest.length > 0 && (
                <div className="mt-10 grid gap-6 max-md:place-items-center sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <div key={post.slug} className="w-full max-w-sm sm:max-w-none">
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="mt-20 space-y-24 sm:mt-24 sm:space-y-28">
                {CATEGORY_SECTIONS.map((section) => {
                  const categoryPosts = posts.filter(
                    (p) => p.category === section.category && p.slug !== featured?.slug,
                  );
                  if (categoryPosts.length === 0) return null;
                  return (
                    <CategorySection
                      key={section.category}
                      section={section}
                      posts={categoryPosts.slice(0, 3)}
                      totalCount={categoryPosts.length}
                    />
                  );
                })}
              </div>
            )}

            {hasQuery && filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  No posts match "{query.trim()}".
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--primary)] hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </section>

        <NewsletterSection />
      </main>
      <SiteFooter />
    </div>
  );
}
