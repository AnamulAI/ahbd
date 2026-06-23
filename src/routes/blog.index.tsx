import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent, useMemo } from "react";
import { toast } from "sonner";
import { ArrowRight, Clock, Mail, Search, X } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BlogCard, CategoryBadge } from "@/components/site/BlogCard";
import { formatPublishedDate, getSortedPosts } from "@/lib/blog-data";

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

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Thanks for subscribing!");
      setEmail("");
      setSubmitting(false);
    }, 250);
  }

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
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
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full btn-gradient px-6 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
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
        <section className="pb-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {featured && (
              <Link
                to="/blog/$slug"
                params={{ slug: featured.slug }}
                className="group grid overflow-hidden rounded-3xl border border-white/8 bg-[#16181D] transition-all duration-200 hover:border-[color:var(--primary)]/40 hover:bg-[#1C1F26] hover:shadow-[0_24px_70px_-30px_var(--vo-glow)] md:grid-cols-2 motion-reduce:transition-none"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-white/5 md:aspect-auto">
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="flex flex-col gap-4 p-6 sm:p-10">
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
            )}

            {rest.length > 0 && (
              <div className="mt-10 grid gap-6 max-md:place-items-center sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <div key={post.slug} className="w-full max-w-sm sm:max-w-none">
                    <BlogCard post={post} />
                  </div>
                ))}
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
