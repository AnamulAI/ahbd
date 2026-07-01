import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, GripVertical, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/blog-sidebar-cards")({
  ssr: false,
  head: () => ({ meta: [{ title: "Blog Sidebar Cards — AnamDev Admin" }] }),
  component: BlogSidebarCardsPage,
});

type Card = {
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
  is_active: boolean;
  show_on_categories: string[];
};

const CATEGORIES = ["web_development", "ai_integrator", "ai_podcast"] as const;

const EMPTY: Omit<Card, "id"> = {
  eyebrow_text: "// NEW CARD",
  heading: "New sidebar card",
  body_text: "Supporting copy for the card.",
  cta_label: "Learn more",
  cta_url: "/",
  cta_style: "primary",
  input_type: "none",
  input_placeholder: "",
  display_order: 0,
  is_active: true,
  show_on_categories: [],
};

function BlogSidebarCardsPage() {
  const gate = useAdminGate();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (gate.status !== "ok") return;
    load();
  }, [gate.status]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_sidebar_cards")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    setCards(
      (data ?? []).map((c: any) => ({
        ...c,
        show_on_categories: Array.isArray(c.show_on_categories)
          ? c.show_on_categories
          : [],
      })) as Card[],
    );
    setLoading(false);
  }

  function update(id: string, patch: Partial<Card>) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function save(card: Card) {
    setSavingId(card.id);
    const { error } = await supabase
      .from("blog_sidebar_cards")
      .update({
        eyebrow_text: card.eyebrow_text,
        heading: card.heading,
        body_text: card.body_text,
        cta_label: card.cta_label,
        cta_url: card.cta_url,
        cta_style: card.cta_style,
        input_type: card.input_type,
        input_placeholder: card.input_placeholder,
        display_order: card.display_order,
        is_active: card.is_active,
        show_on_categories: card.show_on_categories,
      })
      .eq("id", card.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  }

  async function add() {
    const next = Math.max(0, ...cards.map((c) => c.display_order)) + 1;
    const { data, error } = await supabase
      .from("blog_sidebar_cards")
      .insert({ ...EMPTY, display_order: next })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setCards((prev) => [...prev, { ...(data as any), show_on_categories: [] }]);
  }

  async function remove(id: string) {
    if (!confirm("Delete this sidebar card?")) return;
    const { error } = await supabase.from("blog_sidebar_cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setCards((prev) => prev.filter((c) => c.id !== id));
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

  async function toggleActive(card: Card) {
    update(card.id, { is_active: !card.is_active });
    const { error } = await supabase
      .from("blog_sidebar_cards")
      .update({ is_active: !card.is_active })
      .eq("id", card.id);
    if (error) {
      toast.error(error.message);
      update(card.id, { is_active: card.is_active });
    }
  }

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  const inputCls =
    "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none";
  const labelCls =
    "block text-[10px] font-mono uppercase tracking-wider text-[#3B82F6] mb-1.5";

  return (
    <AdminShell email={gate.email}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Blog Sidebar Cards</h1>
          <p className="mt-1 text-sm text-white/55">
            Cards shown in the sticky sidebar on blog post detail pages.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Add card
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#11162A] p-8 text-center text-sm text-white/55">
          No cards yet. Add one to show it in the blog sidebar.
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              className="rounded-xl border border-white/[0.08] bg-[#11162A] p-5 border-l-2 border-l-[#3B82F6]"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <GripVertical className="h-4 w-4" />
                  <button
                    type="button"
                    onClick={() => reorder(card.id, -1)}
                    disabled={idx === 0}
                    className="rounded border border-white/10 px-2 py-0.5 hover:bg-white/[0.06] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => reorder(card.id, 1)}
                    disabled={idx === cards.length - 1}
                    className="rounded border border-white/10 px-2 py-0.5 hover:bg-white/[0.06] disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <span className="font-mono">#{card.display_order}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-xs text-white/75">
                    <input
                      type="checkbox"
                      checked={card.is_active}
                      onChange={() => toggleActive(card)}
                      className="h-4 w-4 accent-[#3B82F6]"
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => save(card)}
                    disabled={savingId === card.id}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white hover:bg-white/[0.08]"
                  >
                    {savingId === card.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(card.id)}
                    aria-label="Delete"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-500/20 text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className={labelCls}>Eyebrow</label>
                  <input
                    value={card.eyebrow_text}
                    onChange={(e) => update(card.id, { eyebrow_text: e.target.value })}
                    className={inputCls}
                    placeholder="// NEWSLETTER"
                  />
                </div>
                <div>
                  <label className={labelCls}>Heading</label>
                  <input
                    value={card.heading}
                    onChange={(e) => update(card.id, { heading: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className={labelCls}>Body text</label>
                  <textarea
                    value={card.body_text}
                    onChange={(e) => update(card.id, { body_text: e.target.value })}
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div>
                  <label className={labelCls}>CTA label</label>
                  <input
                    value={card.cta_label}
                    onChange={(e) => update(card.id, { cta_label: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>CTA URL</label>
                  <input
                    value={card.cta_url}
                    onChange={(e) => update(card.id, { cta_url: e.target.value })}
                    className={inputCls}
                    placeholder="/contact"
                  />
                </div>
                <div>
                  <label className={labelCls}>CTA style</label>
                  <select
                    value={card.cta_style}
                    onChange={(e) => update(card.id, { cta_style: e.target.value })}
                    className={inputCls}
                  >
                    <option value="primary">Primary (gradient)</option>
                    <option value="secondary">Secondary (outline)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Input type</label>
                  <select
                    value={card.input_type}
                    onChange={(e) => update(card.id, { input_type: e.target.value })}
                    className={inputCls}
                  >
                    <option value="none">None (link only)</option>
                    <option value="email">Email capture</option>
                  </select>
                </div>
                {card.input_type === "email" && (
                  <div className="lg:col-span-2">
                    <label className={labelCls}>Input placeholder</label>
                    <input
                      value={card.input_placeholder}
                      onChange={(e) =>
                        update(card.id, { input_placeholder: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                )}
                <div className="lg:col-span-2">
                  <label className={labelCls}>Show on categories (empty = all)</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => {
                      const on = card.show_on_categories.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            update(card.id, {
                              show_on_categories: on
                                ? card.show_on_categories.filter((x) => x !== c)
                                : [...card.show_on_categories, c],
                            })
                          }
                          className={`rounded-full border px-3 py-1 text-xs ${
                            on
                              ? "border-[#3B82F6] bg-[#3B82F6]/15 text-white"
                              : "border-white/15 text-white/60 hover:text-white"
                          }`}
                        >
                          {c.replace(/_/g, " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
