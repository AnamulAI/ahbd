import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, Linkedin } from "lucide-react";
import { SiFacebook, SiX } from "react-icons/si";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BlogCard, CategoryBadge } from "@/components/site/BlogCard";
import {
  formatPublishedDate,
  getPostBySlug,
  getSortedPosts,
  type BlogPost,
} from "@/lib/blog-data";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return { meta: [{ title: "Post Not Found — AnamDev Blog" }] };
    }
    return {
      meta: [
        { title: `${post.title} — AnamDev Blog` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:image", content: post.coverImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: post.coverImage },
      ],
    };
  },
  notFoundComponent: NotFoundPost,
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
  component: BlogPostPage,
});

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

/** Lightweight renderer for our markdown-ish body. Supports h2/h3, paragraphs,
 * bulleted lists, and `**bold**` + `*italic*` inline. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // Match **bold** first, then *italic*
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-white">
          {m[2]}
        </strong>,
      );
    } else if (m[3] !== undefined) {
      out.push(
        <em key={`${keyPrefix}-i-${i}`} className="italic text-white/90">
          {m[3]}
        </em>,
      );
    }
    last = regex.lastIndex;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function PostBody({ body }: { body: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = body.split("\n");
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      blocks.push(
        <h2
          key={key++}
          className="mt-12 text-2xl font-bold leading-tight text-white sm:text-3xl"
        >
          {line.slice(3)}
        </h2>,
      );
      i++;
    } else if (line.startsWith("### ")) {
      blocks.push(
        <h3
          key={key++}
          className="mt-10 text-xl font-bold leading-tight text-white sm:text-2xl"
        >
          {line.slice(4)}
        </h3>,
      );
      i++;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="mt-6 space-y-3">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2
                className="mt-1 h-4 w-4 shrink-0 text-[color:var(--primary)]"
                aria-hidden
              />
              <span className="text-base leading-relaxed text-muted-foreground">
                {renderInline(it, `li-${key}-${idx}`)}
              </span>
            </li>
          ))}
        </ul>,
      );
    } else if (line.trim() === "") {
      i++;
    } else {
      blocks.push(
        <p
          key={key++}
          className="mt-6 text-base leading-[1.8] text-muted-foreground sm:text-[17px]"
        >
          {renderInline(line, `p-${key}`)}
        </p>,
      );
      i++;
    }
  }
  return <div>{blocks}</div>;
}

function AuthorShareRow({ post }: { post: BlogPost }) {
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : `https://anamdev.com/blog/${post.slug}`;
  const text = encodeURIComponent(post.title);
  const url = encodeURIComponent(shareUrl);
  return (
    <div className="mt-16 flex flex-col gap-6 rounded-2xl border border-white/8 bg-[#16181D] p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-mono text-sm font-bold text-white">
          MA
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Mohammad Anamul Hoque</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Web developer & AI integrator helping service-based brands build
            stronger digital presence.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Share
        </span>
        <a
          href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on X"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <SiX className="h-4 w-4" />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on LinkedIn"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Linkedin className="h-4 w-4" />
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on Facebook"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <SiFacebook className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const related = getSortedPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="pt-12 sm:pt-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[color:var(--primary)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Blog
            </Link>
            <div className="mt-6">
              <CategoryBadge category={post.category} />
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-[1.15] text-white sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="text-white/80">Mohammad Anamul Hoque</span>
              <span aria-hidden>·</span>
              <span>{formatPublishedDate(post.publishedDate)}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {post.readTime}
              </span>
            </div>
          </div>
        </section>

        {/* Cover */}
        <section className="mt-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/5">
              <img
                src={post.coverImage}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Body */}
        <article className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <PostBody body={post.body} />
            <AuthorShareRow post={post} />
          </div>
        </article>

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
        <section className="relative section-glow-cta">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
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
                className="inline-flex h-12 items-center gap-2 rounded-full btn-gradient px-7 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                Discuss Your Project <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
