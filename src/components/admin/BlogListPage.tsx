import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  FileText,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AdminShell,
  useAdminGate,
} from "@/components/admin/AdminShell";
import { fmtDate } from "@/lib/admin-content-helpers";
import { useBlogCategories } from "@/hooks/use-blog-categories";
import { Tags } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  cover_image_url: string | null;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
};

export function BlogListPage() {
  const { categories, labelOf, colorOf } = useBlogCategories();
  const gate = useAdminGate();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id,title,slug,category,cover_image_url,status,is_featured,published_at,created_at",
      )
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setPosts((data ?? []) as BlogPost[]);
    setLoading(false);
  }

  useEffect(() => {
    if (gate.status === "ok") load();
  }, [gate.status]);

  async function toggleFeatured(p: BlogPost) {
    const next = !p.is_featured;
    setPosts((cur) => cur.map((x) => (x.id === p.id ? { ...x, is_featured: next } : x)));
    const { error } = await supabase
      .from("blog_posts")
      .update({ is_featured: next })
      .eq("id", p.id);
    if (error) {
      toast.error(error.message);
      load();
    }
  }

  async function doDelete() {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setConfirmDelete(null);
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Post deleted");
    setPosts((cur) => cur.filter((p) => p.id !== id));
  }

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [posts, catFilter, statusFilter, search]);

  const counts = useMemo(() => {
    const total = posts.length;
    const pub = posts.filter((p) => p.status === "published").length;
    const draft = posts.filter((p) => p.status === "draft").length;
    return { total, pub, draft };
  }, [posts]);

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <AdminShell email={gate.email}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
            // blog posts
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold">Blog Posts</h1>
          <p className="mt-1 text-sm text-white/60">
            {counts.total} posts — {counts.pub} published, {counts.draft} draft
          </p>
        </div>
        <Link
          to="/admin/blog/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> New Post
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title…"
            className="w-full rounded-md border border-white/[0.1] bg-[#16181D] pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors duration-[250ms] ease hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white transition-colors duration-[250ms] ease hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white transition-colors duration-[250ms] ease hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="mt-6 card-elevated card-elevated-hover overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-white/50">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-sm text-white/60">No posts yet — create your first one.</p>
            <Link
              to="/admin/blog/new"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> New Post
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3 w-20"></th>
                <th className="px-2 py-3">Title</th>
                <th className="px-2 py-3">Category</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Date</th>
                <th className="px-2 py-3"></th>
                <th className="px-2 py-3 text-center">Featured</th>
                <th className="px-4 py-3 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="h-12 w-16 overflow-hidden rounded-md bg-[#0B0F1A] border border-white/[0.06]">
                      {p.cover_image_url && (
                        <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <Link to="/admin/blog/$id" params={{ id: p.id }} className="font-medium text-white hover:text-[#3B82F6]">
                      {p.title}
                    </Link>
                    <div className="text-xs text-white/40">/{p.slug}</div>
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider"
                      style={{
                        color: colorOf(p.category),
                        borderColor: `${colorOf(p.category)}66`,
                        background: `${colorOf(p.category)}1a`,
                      }}
                    >
                      {labelOf(p.category)}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    {p.status === "published" ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">Published</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white/60">Draft</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-xs text-white/60">{fmtDate(p.published_at ?? p.created_at)}</td>
                  <td className="px-2 py-3">
                    <a
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-white/50 transition-colors hover:text-[#3B82F6]"
                      aria-label={`View ${p.title} live in a new tab`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View Live</span>
                    </a>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(p)}
                      aria-label="Toggle featured"
                      className={p.is_featured ? "text-[#F97316]" : "text-white/30 hover:text-white/60"}
                    >
                      <Star className="h-4 w-4" fill={p.is_featured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to="/admin/blog/$id"
                        params={{ id: p.id }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(p)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.title}” will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
