import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BLOG_POSTS,
  type BlogCategory,
  type BlogPost,
  type ServicePath,
} from "@/lib/blog-data";

type DbBlogRow = {
  slug: string;
  title: string;
  category: string;
  cover_image_url: string | null;
  excerpt: string | null;
  body_html: string | null;
  read_time_minutes: number | null;
  published_at: string | null;
  created_at: string;
  status: string;
  seo_title?: string | null;
  seo_description?: string | null;
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80";

const DB_CATEGORY_MAP: Record<string, BlogCategory> = {
  web_development: "Web Development",
  ai_integrator: "AI Integrator",
  ai_podcast: "AI Podcast",
};

const CATEGORY_SERVICE: Record<BlogCategory, ServicePath> = {
  "Web Development": "/services/web-development",
  "AI Integrator": "/services/ai-integrator",
  "AI Podcast": "/services/ai-podcast",
};

function dbRowToPost(row: DbBlogRow): BlogPost {
  const category = DB_CATEGORY_MAP[row.category] ?? "Web Development";
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    category,
    readTime: `${row.read_time_minutes ?? 3} min read`,
    publishedDate: row.published_at ?? row.created_at,
    coverImage: row.cover_image_url || DEFAULT_COVER,
    quickAnswer: row.excerpt ?? "",
    body: [],
    bodyHtml: row.body_html ?? "",
    faq: [],
    sidebarCta: {
      headline: "Have a Project in Mind?",
      subtext: "Let's talk about what you're building.",
      ctaLabel: "Start a Conversation",
      href: CATEGORY_SERVICE[category],
    },
    seoTitle: row.seo_title ?? null,
    seoDescription: row.seo_description ?? null,
  };
}

export async function fetchDbPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug,title,category,cover_image_url,excerpt,body_html,read_time_minutes,published_at,created_at,status,seo_title,seo_description",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return (data as DbBlogRow[]).map(dbRowToPost);
}

function mergeSorted(dbPosts: BlogPost[]): BlogPost[] {
  const seen = new Set(dbPosts.map((p) => p.slug));
  const combined = [...dbPosts, ...BLOG_POSTS.filter((p) => !seen.has(p.slug))];
  return combined.sort(
    (a, b) =>
      new Date(b.publishedDate).getTime() -
      new Date(a.publishedDate).getTime(),
  );
}

export function useAllBlogPosts(): { posts: BlogPost[]; loading: boolean } {
  const [posts, setPosts] = useState<BlogPost[]>(() => mergeSorted([]));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetchDbPublishedPosts().then((db) => {
      if (!active) return;
      setPosts(mergeSorted(db));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  return { posts, loading };
}

export function useBlogPostBySlug(slug: string): {
  post: BlogPost | null;
  loading: boolean;
} {
  const [state, setState] = useState<{ post: BlogPost | null; loading: boolean }>(
    () => {
      const fromStatic = BLOG_POSTS.find((p) => p.slug === slug) ?? null;
      return { post: fromStatic, loading: !fromStatic };
    },
  );
  useEffect(() => {
    let active = true;
    (async () => {
      const fromStatic = BLOG_POSTS.find((p) => p.slug === slug);
      if (fromStatic) {
        if (active) setState({ post: fromStatic, loading: false });
        return;
      }
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          "slug,title,category,cover_image_url,excerpt,body_html,read_time_minutes,published_at,created_at,status,seo_title,seo_description",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        setState({ post: null, loading: false });
        return;
      }
      setState({ post: dbRowToPost(data as DbBlogRow), loading: false });
    })();
    return () => {
      active = false;
    };
  }, [slug]);
  return state;
}
