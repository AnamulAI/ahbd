import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, ArrowLeft, Save, Pencil, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { slugify } from "@/lib/admin-content-helpers";
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

type Cat = {
  key: string;
  label: string;
  color: string;
  sort_order: number;
};

const inputCls =
  "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20";

export function BlogCategoriesPage() {
  const gate = useAdminGate();
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<Cat[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Cat | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Cat | null>(null);

  // new form
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newKeyDirty, setNewKeyDirty] = useState(false);
  const [newColor, setNewColor] = useState("#3B82F6");
  const [newSort, setNewSort] = useState<number>(100);
  const [creating, setCreating] = useState(false);

  async function load() {
    const [{ data, error }, postsRes] = await Promise.all([
      supabase.from("blog_categories").select("*").order("sort_order").order("label"),
      supabase.from("blog_posts").select("category"),
    ]);
    if (error) toast.error(error.message);
    setCats((data ?? []) as Cat[]);
    const c: Record<string, number> = {};
    for (const row of postsRes.data ?? []) {
      const k = (row as { category: string }).category;
      c[k] = (c[k] ?? 0) + 1;
    }
    setCounts(c);
    setLoading(false);
  }

  useEffect(() => {
    if (gate.status === "ok") load();
  }, [gate.status]);

  useEffect(() => {
    if (!newKeyDirty) setNewKey(slugify(newLabel));
  }, [newLabel, newKeyDirty]);

  async function createCategory() {
    const key = slugify(newKey || newLabel);
    if (!newLabel.trim() || !key) return toast.error("Label and key are required");
    setCreating(true);
    const { error } = await supabase.from("blog_categories").insert({
      key,
      label: newLabel.trim(),
      color: newColor,
      sort_order: newSort,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Category created");
    setNewLabel("");
    setNewKey("");
    setNewKeyDirty(false);
    setNewColor("#3B82F6");
    setNewSort(100);
    load();
  }

  async function saveEdit() {
    if (!editing) return;
    const { error } = await supabase
      .from("blog_categories")
      .update({
        label: editing.label,
        color: editing.color,
        sort_order: editing.sort_order,
      })
      .eq("key", editing.key);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    load();
  }

  async function doDelete() {
    if (!confirmDelete) return;
    const key = confirmDelete.key;
    setConfirmDelete(null);
    const { error } = await supabase.from("blog_categories").delete().eq("key", key);
    if (error) return toast.error(error.message);
    toast.success("Category deleted");
    load();
  }

  const sorted = useMemo(
    () => [...cats].sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)),
    [cats],
  );

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <AdminShell email={gate.email}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/admin/blog"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Blog Posts
          </Link>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
            // blog categories
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold">Blog Categories</h1>
          <p className="mt-1 text-sm text-white/60">
            Manage the categories available in the blog post editor.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,340px]">
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-white/60" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-12 text-center text-sm text-white/60">No categories yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-4 py-3 w-12"></th>
                  <th className="px-2 py-3">Label</th>
                  <th className="px-2 py-3">Key</th>
                  <th className="px-2 py-3 w-20">Sort</th>
                  <th className="px-2 py-3 w-20 text-center">Posts</th>
                  <th className="px-4 py-3 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {sorted.map((c) => {
                  const isEditing = editing?.key === c.key;
                  const count = counts[c.key] ?? 0;
                  return (
                    <tr key={c.key} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="color"
                            value={editing.color}
                            onChange={(e) =>
                              setEditing({ ...editing, color: e.target.value })
                            }
                            className="h-8 w-8 cursor-pointer rounded border border-white/10 bg-transparent"
                          />
                        ) : (
                          <span
                            className="inline-block h-6 w-6 rounded-full border border-white/10"
                            style={{ background: c.color }}
                          />
                        )}
                      </td>
                      <td className="px-2 py-3">
                        {isEditing ? (
                          <input
                            value={editing.label}
                            onChange={(e) =>
                              setEditing({ ...editing, label: e.target.value })
                            }
                            className={inputCls}
                          />
                        ) : (
                          <span
                            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider"
                            style={{
                              color: c.color,
                              borderColor: `${c.color}66`,
                              background: `${c.color}1a`,
                            }}
                          >
                            {c.label}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3 font-mono text-xs text-white/50">{c.key}</td>
                      <td className="px-2 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editing.sort_order}
                            onChange={(e) =>
                              setEditing({ ...editing, sort_order: Number(e.target.value) })
                            }
                            className={`${inputCls} w-20`}
                          />
                        ) : (
                          <span className="text-white/60">{c.sort_order}</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-center text-white/60">{count}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={saveEdit}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-300 hover:bg-emerald-500/10"
                                aria-label="Save"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06]"
                                aria-label="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditing({ ...c })}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white"
                                aria-label="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDelete(c)}
                                disabled={count > 0}
                                title={count > 0 ? `In use by ${count} post(s)` : "Delete"}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30 disabled:hover:bg-transparent"
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <aside className="card-elevated p-5 h-fit space-y-4">
          <div className="font-display text-base font-semibold">New category</div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
              Label
            </label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Case Studies"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
              Key (slug)
            </label>
            <input
              value={newKey}
              onChange={(e) => {
                setNewKeyDirty(true);
                setNewKey(slugify(e.target.value));
              }}
              placeholder="case-studies"
              className={inputCls}
            />
            <p className="mt-1 text-[11px] text-white/40">
              Stored on posts. Cannot be changed after creation.
            </p>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
              Sort order
            </label>
            <input
              type="number"
              value={newSort}
              onChange={(e) => setNewSort(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <button
            type="button"
            onClick={createCategory}
            disabled={creating || !newLabel.trim()}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95 disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add category
          </button>
        </aside>
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.label}” will be permanently removed.
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
