import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Save, Send, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { estimateReadMinutes, slugify } from "@/lib/admin-content-helpers";
import { useBlogCategories } from "@/hooks/use-blog-categories";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Post = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  cover_image_url: string | null;
  excerpt: string | null;
  body_html: string;
  read_time_minutes: number | null;
  status: string;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
};

const EMPTY: Post = {
  title: "",
  slug: "",
  category: "web_development",
  cover_image_url: null,
  excerpt: "",
  body_html: "",
  read_time_minutes: null,
  status: "draft",
  is_featured: false,
  seo_title: "",
  seo_description: "",
  published_at: null,
};

export function BlogEditorPage({ id }: { id?: string }) {
  const gate = useAdminGate();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post>(EMPTY);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);
  const { categories, reload: reloadCategories } = useBlogCategories();
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState("#3B82F6");
  const [creatingCat, setCreatingCat] = useState(false);

  async function createInlineCategory() {
    const label = newCatLabel.trim();
    if (!label) return toast.error("Label required");
    const key = slugify(label);
    if (!key) return toast.error("Invalid label");
    setCreatingCat(true);
    const { error } = await supabase.from("blog_categories").insert({
      key,
      label,
      color: newCatColor,
      sort_order: 100,
    });
    setCreatingCat(false);
    if (error) return toast.error(error.message);
    toast.success("Category added");
    setNewCatOpen(false);
    setNewCatLabel("");
    setNewCatColor("#3B82F6");
    await reloadCategories();
    setPost((p) => ({ ...p, category: key }));
  }

  useEffect(() => {
    if (gate.status !== "ok" || !id) return;
    (async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        setPost(data as Post);
        setSlugDirty(true);
      }
      setLoading(false);
    })();
  }, [gate.status, id]);

  function update<K extends keyof Post>(k: K, v: Post[K]) {
    setPost((p) => ({ ...p, [k]: v }));
  }

  useEffect(() => {
    if (!slugDirty && post.title) {
      setPost((p) => ({ ...p, slug: slugify(p.title) }));
    }
  }, [post.title, slugDirty]);

  async function save(publish: boolean) {
    if (!post.title.trim()) return toast.error("Title is required");
    if (!post.slug.trim()) return toast.error("Slug is required");
    setSaving(true);
    const status = publish ? "published" : "draft";
    const payload = {
      title: post.title.trim(),
      slug: post.slug.trim(),
      category: post.category,
      cover_image_url: post.cover_image_url,
      excerpt: post.excerpt || null,
      body_html: post.body_html,
      read_time_minutes:
        post.read_time_minutes ?? estimateReadMinutes(post.body_html || ""),
      status,
      is_featured: post.is_featured,
      seo_title: post.seo_title || null,
      seo_description: post.seo_description || null,
      published_at:
        publish && !post.published_at ? new Date().toISOString() : post.published_at,
    };
    let error;
    if (id) {
      ({ error } = await supabase.from("blog_posts").update(payload).eq("id", id));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(payload));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(publish ? "Published" : "Saved");
    navigate({ to: "/admin/blog" });
  }

  if (gate.status !== "ok" || loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  const inputCls =
    "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors duration-[250ms] ease hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20";
  const labelCls = "block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5";

  return (
    <AdminShell email={gate.email}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/blog" })}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog Posts
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.04] px-4 text-sm font-medium text-white hover:bg-white/[0.08] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save draft
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publish
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,340px]">
        <div className="space-y-5 card-elevated p-6">
          <div>
            <label className={labelCls}>Title</label>
            <input
              value={post.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="An attention-grabbing headline"
              className={`${inputCls} text-base`}
            />
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input
              value={post.slug}
              onChange={(e) => {
                setSlugDirty(true);
                update("slug", slugify(e.target.value));
              }}
              placeholder="my-post-slug"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Body</label>
            <MarkdownEditor
              value={post.body_html}
              onChange={(md) => update("body_html", md)}
            />
            <p className="mt-2 text-[11px] text-white/40">
              Write in Markdown. Open the formatting guide above for supported patterns (headings, Quick Answer, FAQ, tables, callouts).
            </p>

          </div>
        </div>

        <aside className="space-y-5 card-elevated p-5 h-fit">
          <ImageUploader
            value={post.cover_image_url}
            onChange={(url) => update("cover_image_url", url)}
            label="Cover image"
          />
          <div>
            <label className={labelCls}>Category</label>
            <select
              value={post.category}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setNewCatOpen(true);
                  return;
                }
                update("category", e.target.value);
              }}
              className={inputCls}
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
              {!categories.some((c) => c.key === post.category) && post.category && (
                <option value={post.category}>{post.category}</option>
              )}
              <option value="__new__">+ New category…</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Excerpt</label>
            <textarea
              value={post.excerpt ?? ""}
              onChange={(e) => update("excerpt", e.target.value)}
              rows={3}
              placeholder="Short summary shown in card previews"
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Read time (minutes)</label>
            <input
              type="number"
              min={1}
              value={post.read_time_minutes ?? ""}
              onChange={(e) =>
                update("read_time_minutes", e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder={`auto: ~${estimateReadMinutes(post.body_html || "") || 1} min`}
              className={inputCls}
            />
          </div>
          <label className="flex items-center justify-between rounded-md border border-white/[0.08] bg-[#0B0F1A] px-3 py-2.5">
            <span className="text-sm text-white/85">Featured</span>
            <input
              type="checkbox"
              checked={post.is_featured}
              onChange={(e) => update("is_featured", e.target.checked)}
              className="h-4 w-4 accent-[#3B82F6]"
            />
          </label>
          <div className="rounded-md border border-[#3B82F6]/20 bg-[#3B82F6]/[0.06] p-3 text-[11px] text-white/65 flex gap-2">
            <Info className="h-3.5 w-3.5 mt-0.5 text-[#3B82F6] shrink-0" />
            Basic SEO only — full SEO/AIO controls land in the next module.
          </div>
          <div>
            <label className={labelCls}>SEO title</label>
            <input
              value={post.seo_title ?? ""}
              onChange={(e) => update("seo_title", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>SEO description</label>
            <textarea
              value={post.seo_description ?? ""}
              onChange={(e) => update("seo_description", e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={post.status}
              onChange={(e) => update("status", e.target.value)}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </aside>
      </div>

      <Dialog open={newCatOpen} onOpenChange={setNewCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Label</label>
              <input
                autoFocus
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder="e.g. Case Studies"
                className={inputCls}
              />
              {newCatLabel && (
                <p className="mt-1 text-[11px] text-white/40">
                  Key: <span className="font-mono">{slugify(newCatLabel)}</span>
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
                />
                <input
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setNewCatOpen(false)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.04] px-4 text-sm font-medium text-white hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createInlineCategory}
              disabled={creatingCat || !newCatLabel.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95 disabled:opacity-60"
            >
              {creatingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add category
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
