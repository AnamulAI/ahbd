import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { DeviceVisibilityToggle } from "@/components/admin/DeviceVisibilityToggle";
import type { DeviceVisibility } from "@/lib/site-section-visibility.functions";
import { useBlogCategories } from "@/hooks/use-blog-categories";

type Card = {
  id?: string;
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
  device_visibility: DeviceVisibility;
};


const EMPTY: Card = {
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
  device_visibility: "both",
};

const inputCls =
  "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors duration-[250ms] ease hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20";
const labelCls = "block text-[10px] font-mono uppercase tracking-wider text-[#3B82F6] mb-1.5";

export function SidebarCardEditorPage({ id }: { id?: string }) {
  const { categories } = useBlogCategories();

  const gate = useAdminGate();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [card, setCard] = useState<Card>(EMPTY);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (gate.status !== "ok" || !id) return;
    (async () => {
      const { data, error } = await supabase
        .from("blog_sidebar_cards")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        const d = data as Record<string, unknown>;
        setCard({
          ...EMPTY,
          ...d,
          show_on_categories: Array.isArray(d.show_on_categories)
            ? (d.show_on_categories as string[])
            : [],
        } as Card);
      }
      setLoading(false);
    })();
  }, [gate.status, id]);

  function update<K extends keyof Card>(k: K, v: Card[K]) {
    setCard((c) => ({ ...c, [k]: v }));
  }

  async function save() {
    setSaving(true);
    const payload = {
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
      device_visibility: card.device_visibility,
    };
    let error;
    if (id) {
      ({ error } = await supabase
        .from("blog_sidebar_cards")
        .update(payload as never)
        .eq("id", id));
    } else {
      ({ error } = await supabase.from("blog_sidebar_cards").insert(payload as never));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isEditing ? "Saved" : "Card created");
    navigate({ to: "/admin/blog-sidebar-cards" });
  }

  if (gate.status !== "ok" || loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <AdminShell email={gate.email}>
      <button
        type="button"
        onClick={() => navigate({ to: "/admin/blog-sidebar-cards" })}
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Sidebar Cards
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
            // sidebar cards
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold">
            {isEditing ? "Edit Card" : "New Card"}
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Cards shown in the sticky sidebar on blog post detail pages.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEditing ? "Save Changes" : "Create Card"}
        </button>
      </div>

      <div className="mt-6 card-elevated p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className={labelCls}>Eyebrow</label>
            <input
              value={card.eyebrow_text}
              onChange={(e) => update("eyebrow_text", e.target.value)}
              className={inputCls}
              placeholder="// NEWSLETTER"
            />
          </div>
          <div>
            <label className={labelCls}>Heading</label>
            <input
              value={card.heading}
              onChange={(e) => update("heading", e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="lg:col-span-2">
            <label className={labelCls}>Body text</label>
            <textarea
              value={card.body_text}
              onChange={(e) => update("body_text", e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>CTA label</label>
            <input
              value={card.cta_label}
              onChange={(e) => update("cta_label", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>CTA URL</label>
            <input
              value={card.cta_url}
              onChange={(e) => update("cta_url", e.target.value)}
              className={inputCls}
              placeholder="/contact"
            />
          </div>
          <div>
            <label className={labelCls}>CTA style</label>
            <select
              value={card.cta_style}
              onChange={(e) => update("cta_style", e.target.value)}
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
              onChange={(e) => update("input_type", e.target.value)}
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
                onChange={(e) => update("input_placeholder", e.target.value)}
                className={inputCls}
              />
            </div>
          )}
          <div className="lg:col-span-2 flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 text-xs text-white/75">
              <input
                type="checkbox"
                checked={card.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
                className="h-4 w-4 accent-[#3B82F6]"
              />
              Active
            </label>
            <div>
              <label className={labelCls}>Device Visibility</label>
              <DeviceVisibilityToggle
                value={card.device_visibility}
                onChange={(v) => update("device_visibility", v)}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <label className={labelCls}>Show on categories (empty = all)</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const c = cat.key;
                const on = card.show_on_categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      update(
                        "show_on_categories",
                        on
                          ? card.show_on_categories.filter((x) => x !== c)
                          : [...card.show_on_categories, c],
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      on
                        ? "border-[#3B82F6] bg-[#3B82F6]/15 text-white"
                        : "border-white/15 text-white/60 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}

            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
