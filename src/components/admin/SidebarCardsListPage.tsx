import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { CATEGORY_LABEL } from "@/lib/admin-content-helpers";
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

type Card = {
  id: string;
  eyebrow_text: string;
  heading: string;
  cta_label: string;
  is_active: boolean;
  show_on_categories: string[];
  display_order: number;
};

function shownOnLabel(categories: string[]): string {
  if (!categories || categories.length === 0) return "All";
  return categories.map((c) => CATEGORY_LABEL[c] ?? c.replace(/_/g, " ")).join(", ");
}

export function SidebarCardsListPage() {
  const gate = useAdminGate();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<Card | null>(null);

  useEffect(() => {
    if (gate.status !== "ok") return;
    load();
  }, [gate.status]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_sidebar_cards")
      .select("id,eyebrow_text,heading,cta_label,is_active,show_on_categories,display_order")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    setCards(
      (data ?? []).map((c: any) => ({
        ...c,
        show_on_categories: Array.isArray(c.show_on_categories) ? c.show_on_categories : [],
      })) as Card[],
    );
    setLoading(false);
  }

  async function toggleActive(card: Card) {
    const next = !card.is_active;
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, is_active: next } : c)));
    const { error } = await supabase
      .from("blog_sidebar_cards")
      .update({ is_active: next })
      .eq("id", card.id);
    if (error) {
      toast.error(error.message);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, is_active: card.is_active } : c)),
      );
    }
  }

  async function reorder(id: string, dir: -1 | 1) {
    const idx = cards.findIndex((c) => c.id === id);
    const next = idx + dir;
    if (next < 0 || next >= cards.length) return;
    const copy = [...cards];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    const reindexed = copy.map((c, i) => ({ ...c, display_order: i }));
    setCards(reindexed);
    await Promise.all(
      reindexed.map((c) =>
        supabase
          .from("blog_sidebar_cards")
          .update({ display_order: c.display_order })
          .eq("id", c.id),
      ),
    );
  }

  async function doDelete() {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setConfirmDelete(null);
    const { error } = await supabase.from("blog_sidebar_cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Card deleted");
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <AdminShell email={gate.email}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
            // sidebar cards
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold">Blog Sidebar Cards</h1>
          <p className="mt-1 text-sm text-white/55">
            Cards shown in the sticky sidebar on blog post detail pages.
          </p>
        </div>
        <Link
          to="/admin/blog-sidebar-cards/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Add card
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      ) : cards.length === 0 ? (
        <div className="card-elevated flex flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-white/50">
            <Plus className="h-5 w-5" />
          </div>
          <p className="text-sm text-white/55">
            No cards yet. Add one to show it in the blog sidebar.
          </p>
          <Link
            to="/admin/blog-sidebar-cards/new"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Add card
          </Link>
        </div>
      ) : (
        <div className="card-elevated card-elevated-hover overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3 w-14"></th>
                <th className="px-2 py-3">Preview</th>
                <th className="px-2 py-3">CTA</th>
                <th className="px-2 py-3">Shown On</th>
                <th className="px-2 py-3 text-center">Active</th>
                <th className="px-4 py-3 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {cards.map((card, idx) => (
                <tr key={card.id} className="hover:bg-white/[0.04]">
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-0.5 text-white/50">
                      <button
                        type="button"
                        onClick={() => reorder(card.id, -1)}
                        disabled={idx === 0}
                        className="rounded border border-white/10 px-1.5 py-0.5 hover:bg-white/[0.06] disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorder(card.id, 1)}
                        disabled={idx === cards.length - 1}
                        className="rounded border border-white/10 px-1.5 py-0.5 hover:bg-white/[0.06] disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <Link
                      to="/admin/blog-sidebar-cards/$id"
                      params={{ id: card.id }}
                      className="font-medium text-white hover:text-[#3B82F6]"
                    >
                      {card.heading}
                    </Link>
                    <div className="text-xs text-white/40 font-mono">{card.eyebrow_text}</div>
                  </td>
                  <td className="px-2 py-3 text-white/75">{card.cta_label}</td>
                  <td className="px-2 py-3 text-xs text-white/60">
                    {shownOnLabel(card.show_on_categories)}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={card.is_active}
                      onChange={() => toggleActive(card)}
                      className="h-4 w-4 accent-[#3B82F6]"
                      aria-label="Toggle active"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to="/admin/blog-sidebar-cards/$id"
                        params={{ id: card.id }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(card)}
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
        </div>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this sidebar card?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.heading}" will be permanently removed. This cannot be undone.
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
