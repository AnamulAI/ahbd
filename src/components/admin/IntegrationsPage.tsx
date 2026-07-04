import { useEffect, useState, type ReactNode } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  KeyRound,
  MessageCircle,
  Send,
  Bot,
} from "lucide-react";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type AiKeyRow = {
  id: string;
  provider: string;
  custom_provider_name: string | null;
  api_key: string;
  label: string | null;
};
type WhatsappRow = {
  id: string;
  label: string;
  access_token: string;
  phone_number_id: string | null;
};
type TelegramRow = {
  id: string;
  label: string;
  bot_token: string;
};
type WebhookRow = {
  id: string;
  label: string;
  url: string;
};

const PROVIDERS: Array<{ value: string; label: string; badge: string }> = [
  { value: "claude", label: "Claude (Anthropic)", badge: "bg-[#D97706]/20 text-[#F59E0B] border-[#F59E0B]/40" },
  { value: "chatgpt", label: "ChatGPT (OpenAI)", badge: "bg-[#10A37F]/20 text-[#10A37F] border-[#10A37F]/40" },
  { value: "gemini", label: "Gemini (Google)", badge: "bg-[#4285F4]/20 text-[#4285F4] border-[#4285F4]/40" },
  { value: "other", label: "Other", badge: "bg-white/10 text-white/70 border-white/20" },
];

function providerMeta(value: string) {
  return PROVIDERS.find((p) => p.value === value) ?? PROVIDERS[3];
}

const inputCls =
  "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none";
const labelCls =
  "block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5";

function maskSecret(v: string): string {
  const s = (v ?? "").trim();
  if (!s) return "";
  const last = s.slice(-4);
  return `${"•".repeat(Math.min(12, Math.max(4, s.length - 4)))}${last}`;
}

/* -------------------------------------------------------------------------- */
/* SecretCell — masked / reveal toggle                                         */
/* -------------------------------------------------------------------------- */

function SecretCell({ value }: { value: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="flex items-center gap-2 min-w-0">
      <code className="truncate font-mono text-[12px] text-white/80">
        {shown ? value : maskSecret(value)}
      </code>
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        className="shrink-0 rounded-md p-1 text-white/50 hover:text-white hover:bg-white/[0.06]"
        aria-label={shown ? "Hide value" : "Reveal value"}
      >
        {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section shell                                                               */
/* -------------------------------------------------------------------------- */

function SectionCard({
  icon,
  color,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  color: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 rounded-xl border border-white/[0.08] bg-[#11162A] p-6 space-y-5">
      <header className="flex items-center gap-2 border-l-2 pl-3" style={{ borderColor: color }}>
        <span style={{ color }}>{icon}</span>
        <div>
          <h2 className="text-sm font-mono uppercase tracking-wider" style={{ color }}>
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-[11px] text-white/50">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-white/[0.1] bg-[#16181D] px-3 text-sm text-white/85 hover:border-[#3B82F6]/60 hover:text-white"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

function SaveBar({ onCancel, onSave, saving }: { onCancel: () => void; onSave: () => void; saving: boolean }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/[0.1] px-3 text-sm text-white/70 hover:text-white hover:bg-white/[0.05]"
      >
        <X className="h-4 w-4" />
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export function IntegrationsPage() {
  const gate = useAdminGate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [aiKeys, setAiKeys] = useState<AiKeyRow[]>([]);
  const [waAccounts, setWaAccounts] = useState<WhatsappRow[]>([]);
  const [tgBots, setTgBots] = useState<TelegramRow[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);

  // Edit drafts (keyed by row id, or "new" for a fresh entry)
  const [aiDraft, setAiDraft] = useState<(Partial<AiKeyRow> & { key?: string }) | null>(null);
  const [waDraft, setWaDraft] = useState<(Partial<WhatsappRow> & { key?: string }) | null>(null);
  const [tgDraft, setTgDraft] = useState<(Partial<TelegramRow> & { key?: string }) | null>(null);
  const [whDraft, setWhDraft] = useState<(Partial<WebhookRow> & { key?: string }) | null>(null);

  useEffect(() => {
    if (gate.status !== "ok") return;
    (async () => {
      const [a, w, t, h] = await Promise.all([
        supabase.from("ai_provider_keys" as never).select("id,provider,custom_provider_name,api_key,label").order("created_at", { ascending: true }),
        supabase.from("whatsapp_accounts" as never).select("id,label,access_token,phone_number_id").order("created_at", { ascending: true }),
        supabase.from("telegram_bots" as never).select("id,label,bot_token").order("created_at", { ascending: true }),
        supabase.from("newsletter_webhooks" as never).select("id,label,url").order("created_at", { ascending: true }),
      ]);
      if (a.error) toast.error(a.error.message);
      setAiKeys(((a.data ?? []) as unknown as AiKeyRow[]));
      setWaAccounts(((w.data ?? []) as unknown as WhatsappRow[]));
      setTgBots(((t.data ?? []) as unknown as TelegramRow[]));
      setWebhooks(((h.data ?? []) as unknown as WebhookRow[]));
      setLoading(false);
    })();
  }, [gate.status]);

  if (gate.status !== "ok" || loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  /* --------------------------- AI Provider Keys --------------------------- */

  async function saveAi() {
    if (!aiDraft) return;
    const provider = (aiDraft.provider ?? "").trim();
    const api_key = (aiDraft.api_key ?? "").trim();
    if (!provider || !api_key) return toast.error("Provider and API Key are required");
    setSaving(true);
    const payload = {
      provider,
      custom_provider_name: provider === "other" ? (aiDraft.custom_provider_name ?? "").trim() || null : null,
      api_key,
      label: (aiDraft.label ?? "").trim() || null,
    };
    if (aiDraft.id) {
      const { error } = await supabase.from("ai_provider_keys" as never).update(payload).eq("id", aiDraft.id);
      if (error) { setSaving(false); return toast.error(error.message); }
      setAiKeys((c) => c.map((r) => (r.id === aiDraft.id ? { ...r, ...payload } : r)));
    } else {
      const { data, error } = await supabase.from("ai_provider_keys" as never).insert(payload).select("id,provider,custom_provider_name,api_key,label").single();
      if (error) { setSaving(false); return toast.error(error.message); }
      setAiKeys((c) => [...c, data as unknown as AiKeyRow]);
    }
    setSaving(false);
    setAiDraft(null);
    toast.success("Saved");
  }
  async function deleteAi(id: string) {
    if (!confirm("Delete this API key?")) return;
    const { error } = await supabase.from("ai_provider_keys" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setAiKeys((c) => c.filter((r) => r.id !== id));
  }

  /* ------------------------------ WhatsApp -------------------------------- */

  async function saveWa() {
    if (!waDraft) return;
    const label = (waDraft.label ?? "").trim();
    const token = (waDraft.access_token ?? "").trim();
    if (!label || !token) return toast.error("Label and Access Token are required");
    setSaving(true);
    const payload = {
      label,
      access_token: token,
      phone_number_id: (waDraft.phone_number_id ?? "").trim() || null,
    };
    if (waDraft.id) {
      const { error } = await supabase.from("whatsapp_accounts" as never).update(payload).eq("id", waDraft.id);
      if (error) { setSaving(false); return toast.error(error.message); }
      setWaAccounts((c) => c.map((r) => (r.id === waDraft.id ? { ...r, ...payload } : r)));
    } else {
      const { data, error } = await supabase.from("whatsapp_accounts" as never).insert(payload).select("id,label,access_token,phone_number_id").single();
      if (error) { setSaving(false); return toast.error(error.message); }
      setWaAccounts((c) => [...c, data as unknown as WhatsappRow]);
    }
    setSaving(false);
    setWaDraft(null);
    toast.success("Saved");
  }
  async function deleteWa(id: string) {
    if (!confirm("Delete this WhatsApp account?")) return;
    const { error } = await supabase.from("whatsapp_accounts" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setWaAccounts((c) => c.filter((r) => r.id !== id));
  }

  /* ------------------------------ Telegram -------------------------------- */

  async function saveTg() {
    if (!tgDraft) return;
    const label = (tgDraft.label ?? "").trim();
    const token = (tgDraft.bot_token ?? "").trim();
    if (!label || !token) return toast.error("Label and Bot Token are required");
    setSaving(true);
    const payload = { label, bot_token: token };
    if (tgDraft.id) {
      const { error } = await supabase.from("telegram_bots" as never).update(payload).eq("id", tgDraft.id);
      if (error) { setSaving(false); return toast.error(error.message); }
      setTgBots((c) => c.map((r) => (r.id === tgDraft.id ? { ...r, ...payload } : r)));
    } else {
      const { data, error } = await supabase.from("telegram_bots" as never).insert(payload).select("id,label,bot_token").single();
      if (error) { setSaving(false); return toast.error(error.message); }
      setTgBots((c) => [...c, data as unknown as TelegramRow]);
    }
    setSaving(false);
    setTgDraft(null);
    toast.success("Saved");
  }
  async function deleteTg(id: string) {
    if (!confirm("Delete this Telegram bot?")) return;
    const { error } = await supabase.from("telegram_bots" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setTgBots((c) => c.filter((r) => r.id !== id));
  }

  /* ----------------------- Newsletter Webhooks --------------------------- */

  async function saveWh() {
    if (!whDraft) return;
    const url = (whDraft.url ?? "").trim();
    if (!url) return toast.error("Webhook URL is required");
    try { new URL(url); } catch { return toast.error("Invalid URL"); }
    setSaving(true);
    const payload = { label: (whDraft.label ?? "").trim() || "", url };
    if (whDraft.id) {
      const { error } = await supabase.from("newsletter_webhooks" as never).update(payload).eq("id", whDraft.id);
      if (error) { setSaving(false); return toast.error(error.message); }
      setWebhooks((c) => c.map((r) => (r.id === whDraft.id ? { ...r, ...payload } : r)));
    } else {
      const { data, error } = await supabase.from("newsletter_webhooks" as never).insert(payload).select("id,label,url").single();
      if (error) { setSaving(false); return toast.error(error.message); }
      setWebhooks((c) => [...c, data as unknown as WebhookRow]);
    }
    setSaving(false);
    setWhDraft(null);
    toast.success("Saved");
  }
  async function deleteWh(id: string) {
    if (!confirm("Delete this webhook?")) return;
    const { error } = await supabase.from("newsletter_webhooks" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setWebhooks((c) => c.filter((r) => r.id !== id));
  }

  /* --------------------------------- UI ---------------------------------- */

  return (
    <AdminShell email={gate.email}>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Integrations</h1>
        <p className="mt-1 text-sm text-white/55">
          Store AI provider API keys, messaging bot credentials, and email marketing webhooks.
          These credentials are admin-only — never exposed to public visitors.
        </p>
      </div>

      {/* SECTION A — AI Provider API Keys */}
      <SectionCard
        icon={<KeyRound className="h-4 w-4" />}
        color="#3B82F6"
        title="AI Provider API Keys"
        subtitle="Reference-only. Not called by any public page."
      >
        <ul className="divide-y divide-white/[0.05] rounded-md border border-white/[0.06] bg-[#0B0F1A]">
          {aiKeys.length === 0 && (
            <li className="px-4 py-6 text-center text-[12px] text-white/40">No keys added yet.</li>
          )}
          {aiKeys.map((r) => {
            const meta = providerMeta(r.provider);
            const isEditing = aiDraft?.id === r.id;
            const name = r.provider === "other" ? (r.custom_provider_name || "Custom") : meta.label;
            return (
              <li key={r.id} className="px-4 py-3">
                {!isEditing ? (
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider ${meta.badge}`}>
                      {name}
                    </span>
                    <div className="min-w-0 flex-1">
                      <SecretCell value={r.api_key} />
                      {r.label && <div className="mt-0.5 truncate text-[11px] text-white/50">{r.label}</div>}
                    </div>
                    <button onClick={() => setAiDraft({ ...r })} className="rounded-md p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white" aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteAi(r.id)} className="rounded-md p-1.5 text-red-300 hover:bg-red-500/10" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <AiEditor draft={aiDraft!} setDraft={setAiDraft} onSave={saveAi} onCancel={() => setAiDraft(null)} saving={saving} />
                )}
              </li>
            );
          })}
          {aiDraft && !aiDraft.id && (
            <li className="px-4 py-3">
              <AiEditor draft={aiDraft} setDraft={setAiDraft} onSave={saveAi} onCancel={() => setAiDraft(null)} saving={saving} />
            </li>
          )}
        </ul>
        <div>
          <AddBtn onClick={() => setAiDraft({ provider: "claude", api_key: "" })} label="Add API Key" />
        </div>
      </SectionCard>

      {/* SECTION B — Messaging Bots */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard icon={<MessageCircle className="h-4 w-4" />} color="#25D366" title="WhatsApp Business Accounts">
          <ul className="divide-y divide-white/[0.05] rounded-md border border-white/[0.06] bg-[#0B0F1A]">
            {waAccounts.length === 0 && (
              <li className="px-4 py-6 text-center text-[12px] text-white/40">No accounts added yet.</li>
            )}
            {waAccounts.map((r) => {
              const isEditing = waDraft?.id === r.id;
              return (
                <li key={r.id} className="px-4 py-3">
                  {!isEditing ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0 text-sm font-medium text-white truncate">{r.label}</div>
                        <button onClick={() => setWaDraft({ ...r })} className="rounded-md p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white" aria-label="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteWa(r.id)} className="rounded-md p-1.5 text-red-300 hover:bg-red-500/10" aria-label="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <SecretCell value={r.access_token} />
                      {r.phone_number_id && (
                        <div className="text-[11px] text-white/45">
                          Phone Number ID: <span className="font-mono text-white/70">{r.phone_number_id}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <WaEditor draft={waDraft!} setDraft={setWaDraft} onSave={saveWa} onCancel={() => setWaDraft(null)} saving={saving} />
                  )}
                </li>
              );
            })}
            {waDraft && !waDraft.id && (
              <li className="px-4 py-3">
                <WaEditor draft={waDraft} setDraft={setWaDraft} onSave={saveWa} onCancel={() => setWaDraft(null)} saving={saving} />
              </li>
            )}
          </ul>
          <div>
            <AddBtn onClick={() => setWaDraft({ label: "", access_token: "", phone_number_id: "" })} label="Add WhatsApp Account" />
          </div>
        </SectionCard>

        <SectionCard icon={<Bot className="h-4 w-4" />} color="#26A5E4" title="Telegram Bots">
          <ul className="divide-y divide-white/[0.05] rounded-md border border-white/[0.06] bg-[#0B0F1A]">
            {tgBots.length === 0 && (
              <li className="px-4 py-6 text-center text-[12px] text-white/40">No bots added yet.</li>
            )}
            {tgBots.map((r) => {
              const isEditing = tgDraft?.id === r.id;
              return (
                <li key={r.id} className="px-4 py-3">
                  {!isEditing ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0 text-sm font-medium text-white truncate">{r.label}</div>
                        <button onClick={() => setTgDraft({ ...r })} className="rounded-md p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white" aria-label="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteTg(r.id)} className="rounded-md p-1.5 text-red-300 hover:bg-red-500/10" aria-label="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <SecretCell value={r.bot_token} />
                    </div>
                  ) : (
                    <TgEditor draft={tgDraft!} setDraft={setTgDraft} onSave={saveTg} onCancel={() => setTgDraft(null)} saving={saving} />
                  )}
                </li>
              );
            })}
            {tgDraft && !tgDraft.id && (
              <li className="px-4 py-3">
                <TgEditor draft={tgDraft} setDraft={setTgDraft} onSave={saveTg} onCancel={() => setTgDraft(null)} saving={saving} />
              </li>
            )}
          </ul>
          <div>
            <AddBtn onClick={() => setTgDraft({ label: "", bot_token: "" })} label="Add Telegram Bot" />
          </div>
        </SectionCard>
      </div>

      {/* SECTION C — Email Marketing Webhooks */}
      <SectionCard
        icon={<Send className="h-4 w-4" />}
        color="#F97316"
        title="Email Marketing Webhooks"
        subtitle="Every entry receives a POST { email, subscribed_at } whenever a visitor subscribes."
      >
        <ul className="divide-y divide-white/[0.05] rounded-md border border-white/[0.06] bg-[#0B0F1A]">
          {webhooks.length === 0 && (
            <li className="px-4 py-6 text-center text-[12px] text-white/40">No webhooks added yet.</li>
          )}
          {webhooks.map((r) => {
            const isEditing = whDraft?.id === r.id;
            return (
              <li key={r.id} className="px-4 py-3">
                {!isEditing ? (
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white truncate">{r.label || "(no label)"}</div>
                      <div className="truncate font-mono text-[11px] text-white/55">{r.url}</div>
                    </div>
                    <button onClick={() => setWhDraft({ ...r })} className="rounded-md p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white" aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteWh(r.id)} className="rounded-md p-1.5 text-red-300 hover:bg-red-500/10" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <WhEditor draft={whDraft!} setDraft={setWhDraft} onSave={saveWh} onCancel={() => setWhDraft(null)} saving={saving} />
                )}
              </li>
            );
          })}
          {whDraft && !whDraft.id && (
            <li className="px-4 py-3">
              <WhEditor draft={whDraft} setDraft={setWhDraft} onSave={saveWh} onCancel={() => setWhDraft(null)} saving={saving} />
            </li>
          )}
        </ul>
        <div>
          <AddBtn onClick={() => setWhDraft({ label: "", url: "" })} label="Add Webhook" />
        </div>
      </SectionCard>
    </AdminShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Inline editors                                                              */
/* -------------------------------------------------------------------------- */

function AiEditor({
  draft, setDraft, onSave, onCancel, saving,
}: {
  draft: Partial<AiKeyRow> & { key?: string };
  setDraft: (d: (Partial<AiKeyRow> & { key?: string }) | null) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const provider = draft.provider ?? "claude";
  return (
    <div className="space-y-3 rounded-md border border-white/[0.06] bg-[#0F1425] p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Provider</label>
          <select
            value={provider}
            onChange={(e) => setDraft({ ...draft, provider: e.target.value })}
            className={inputCls}
          >
            {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        {provider === "other" && (
          <div>
            <label className={labelCls}>Custom Provider Name</label>
            <input
              value={draft.custom_provider_name ?? ""}
              onChange={(e) => setDraft({ ...draft, custom_provider_name: e.target.value })}
              className={inputCls}
              placeholder="e.g. Mistral"
            />
          </div>
        )}
      </div>
      <div>
        <label className={labelCls}>API Key</label>
        <input
          type="password"
          autoComplete="new-password"
          value={draft.api_key ?? ""}
          onChange={(e) => setDraft({ ...draft, api_key: e.target.value })}
          className={inputCls}
          placeholder="sk-..."
        />
      </div>
      <div>
        <label className={labelCls}>Label / Note (optional)</label>
        <input
          value={draft.label ?? ""}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          className={inputCls}
          placeholder="Used for blog content generation experiments"
        />
      </div>
      <SaveBar onCancel={onCancel} onSave={onSave} saving={saving} />
    </div>
  );
}

function WaEditor({
  draft, setDraft, onSave, onCancel, saving,
}: {
  draft: Partial<WhatsappRow> & { key?: string };
  setDraft: (d: (Partial<WhatsappRow> & { key?: string }) | null) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  return (
    <div className="space-y-3 rounded-md border border-white/[0.06] bg-[#0F1425] p-3">
      <div>
        <label className={labelCls}>Label</label>
        <input value={draft.label ?? ""} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          className={inputCls} placeholder="Main Business Number" />
      </div>
      <div>
        <label className={labelCls}>Access Token</label>
        <input type="password" autoComplete="new-password" value={draft.access_token ?? ""}
          onChange={(e) => setDraft({ ...draft, access_token: e.target.value })}
          className={inputCls} placeholder="EAAG..." />
      </div>
      <div>
        <label className={labelCls}>Phone Number ID</label>
        <input value={draft.phone_number_id ?? ""} onChange={(e) => setDraft({ ...draft, phone_number_id: e.target.value })}
          className={inputCls} placeholder="e.g. 123456789012345" />
      </div>
      <SaveBar onCancel={onCancel} onSave={onSave} saving={saving} />
    </div>
  );
}

function TgEditor({
  draft, setDraft, onSave, onCancel, saving,
}: {
  draft: Partial<TelegramRow> & { key?: string };
  setDraft: (d: (Partial<TelegramRow> & { key?: string }) | null) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  return (
    <div className="space-y-3 rounded-md border border-white/[0.06] bg-[#0F1425] p-3">
      <div>
        <label className={labelCls}>Label</label>
        <input value={draft.label ?? ""} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          className={inputCls} placeholder="Lead Notification Bot" />
      </div>
      <div>
        <label className={labelCls}>Bot Token</label>
        <input type="password" autoComplete="new-password" value={draft.bot_token ?? ""}
          onChange={(e) => setDraft({ ...draft, bot_token: e.target.value })}
          className={inputCls} placeholder="123456:ABC-DEF..." />
      </div>
      <SaveBar onCancel={onCancel} onSave={onSave} saving={saving} />
    </div>
  );
}

function WhEditor({
  draft, setDraft, onSave, onCancel, saving,
}: {
  draft: Partial<WebhookRow> & { key?: string };
  setDraft: (d: (Partial<WebhookRow> & { key?: string }) | null) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  return (
    <div className="space-y-3 rounded-md border border-white/[0.06] bg-[#0F1425] p-3">
      <div>
        <label className={labelCls}>Label</label>
        <input value={draft.label ?? ""} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          className={inputCls} placeholder="Mailchimp via Zapier" />
      </div>
      <div>
        <label className={labelCls}>Webhook URL</label>
        <input value={draft.url ?? ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          className={inputCls} placeholder="https://hooks.zapier.com/..." />
      </div>
      <SaveBar onCancel={onCancel} onSave={onSave} saving={saving} />
    </div>
  );
}
