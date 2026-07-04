import { useEffect, useState } from "react";
import { Loader2, Pencil, Save, X, Info, Search, Share2, Bot, FileText } from "lucide-react";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type StaticRow = {
  id: string;
  page_key: string;
  page_label: string;
  seo_title: string | null;
  seo_description: string | null;
};

const PAGE_ROUTES: Record<string, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  contact: "/contact",
};

const DEFAULT_LLMS_TXT = `# AnamDev

> Freelance web developer and AI specialist helping brands build stronger authority and a sharper digital presence.

Site owner: Mohammad Anamul Hoque (AnamDev).

## Services

- [Web Development]({{SITE_URL}}/services/web-development) — Modern, fast, SEO-ready websites and web apps.
- [AI Integrator]({{SITE_URL}}/services/ai-integrator) — Custom GPTs, Copilot agents, and API integrations into real business systems.
- [AI Podcast]({{SITE_URL}}/services/ai-podcast) — Done-for-you AI podcast production from a topic, blog post, URL, or PDF.

## Key pages

- [Home]({{SITE_URL}}/)
- [Projects]({{SITE_URL}}/projects)
- [Blog]({{SITE_URL}}/blog)
- [About]({{SITE_URL}}/about)
- [Contact]({{SITE_URL}}/contact)

## How to describe this business

AnamDev is the freelance practice of Mohammad Anamul Hoque, offering web development, AI integration, and AI podcast production for brands, founders, and small teams.

Note: {{SITE_URL}} is replaced automatically with the current Site Base URL from Global Defaults.`;

const SETTING_KEYS = [
  "site_base_url",
  "default_meta_title_template",
  "default_meta_description",
  "default_og_image_url",
  "ga4_measurement_id",
  "facebook_pixel_id",
  "google_site_verification",
  "custom_head_scripts",
  "custom_body_scripts",
  "bing_site_verification",
  "facebook_domain_verification",
  "tiktok_pixel_id",
  "pinterest_tag_id",
  "pinterest_domain_verification",
  "linkedin_partner_id",
  "allow_gptbot",
  "allow_google_extended",
  "allow_claudebot",
  "allow_perplexitybot",
  "allow_ccbot",
  "llms_txt_content",
] as const;
type SettingKey = (typeof SETTING_KEYS)[number];

const AI_BOTS: { key: SettingKey; label: string; note: string }[] = [
  { key: "allow_gptbot", label: "GPTBot", note: "OpenAI / ChatGPT" },
  { key: "allow_google_extended", label: "Google-Extended", note: "Google Gemini / AI Overviews training" },
  { key: "allow_claudebot", label: "ClaudeBot / anthropic-ai", note: "Anthropic / Claude" },
  { key: "allow_perplexitybot", label: "PerplexityBot", note: "Perplexity AI" },
  { key: "allow_ccbot", label: "CCBot", note: "Common Crawl — feeds many AI training datasets" },
];

const inputCls =
  "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none";
const labelCls =
  "block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5";
const helperCls = "mt-1 text-[11px] text-white/40";

export function SeoTrackingPage() {
  const gate = useAdminGate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pages, setPages] = useState<StaticRow[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [settings, setSettings] = useState<Record<SettingKey, string>>({
    site_base_url: "",
    default_meta_title_template: "{page} | AnamDev",
    default_meta_description: "",
    default_og_image_url: "",
    ga4_measurement_id: "",
    facebook_pixel_id: "",
    google_site_verification: "",
    custom_head_scripts: "",
    custom_body_scripts: "",
    bing_site_verification: "",
    facebook_domain_verification: "",
    tiktok_pixel_id: "",
    pinterest_tag_id: "",
    pinterest_domain_verification: "",
    linkedin_partner_id: "",
    allow_gptbot: "true",
    allow_google_extended: "true",
    allow_claudebot: "true",
    allow_perplexitybot: "true",
    allow_ccbot: "true",
    llms_txt_content: DEFAULT_LLMS_TXT,
  });

  useEffect(() => {
    if (gate.status !== "ok") return;
    (async () => {
      const [pagesRes, settingsRes] = await Promise.all([
        supabase
          .from("static_page_seo")
          .select("id,page_key,page_label,seo_title,seo_description")
          .order("page_label"),
        supabase.from("site_settings").select("setting_key,setting_value"),
      ]);
      if (pagesRes.error) toast.error(pagesRes.error.message);
      setPages((pagesRes.data ?? []) as StaticRow[]);
      const next = { ...settings };
      for (const row of settingsRes.data ?? []) {
        const k = (row as { setting_key: SettingKey }).setting_key;
        const v = (row as { setting_value: string | null }).setting_value ?? "";
        if ((SETTING_KEYS as readonly string[]).includes(k)) next[k] = v;
      }
      setSettings(next);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gate.status]);

  function openEdit(row: StaticRow) {
    setEditingKey(row.page_key);
    setEditTitle(row.seo_title ?? "");
    setEditDesc(row.seo_description ?? "");
  }

  async function savePage() {
    if (!editingKey) return;
    setSaving(true);
    const { error } = await supabase
      .from("static_page_seo")
      .update({
        seo_title: editTitle.trim() || null,
        seo_description: editDesc.trim() || null,
      })
      .eq("page_key", editingKey);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setPages((cur) =>
      cur.map((p) =>
        p.page_key === editingKey
          ? {
              ...p,
              seo_title: editTitle.trim() || null,
              seo_description: editDesc.trim() || null,
            }
          : p,
      ),
    );
    setEditingKey(null);
  }

  async function saveKeys(keys: readonly SettingKey[], successMsg = "Saved") {
    setSaving(true);
    const rows = keys.map((k) => ({
      setting_key: k,
      setting_value: settings[k] ?? "",
    }));
    const { error } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "setting_key" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(successMsg);
  }

  function updateSetting(k: SettingKey, v: string) {
    setSettings((s) => ({ ...s, [k]: v }));
  }

  const isOn = (k: SettingKey) => (settings[k] ?? "true").toLowerCase() !== "false";

  if (gate.status !== "ok" || loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  const SaveBtn = ({ onClick, label = "Save Settings" }: { onClick: () => void; label?: string }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 disabled:opacity-60"
    >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {label}
    </button>
  );

  return (
    <AdminShell email={gate.email}>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          SEO & Tracking
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Per-page SEO, global defaults, tracking scripts, verification codes, AI crawler control.
        </p>
      </div>

      {/* ------ Static Pages ------ */}
      <section className="mt-8 rounded-xl border border-white/[0.08] bg-[#11162A]">
        <header className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
          <Search className="h-4 w-4 text-[#3B82F6]" />
          <h2 className="text-sm font-mono uppercase tracking-wider text-white/70">
            Static Pages
          </h2>
        </header>
        <ul className="divide-y divide-white/[0.05]">
          {pages.map((p) => {
            const isOpen = editingKey === p.page_key;
            return (
              <li key={p.page_key}>
                <div className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{p.page_label}</div>
                    <div className="truncate text-[11px] text-white/45">
                      {PAGE_ROUTES[p.page_key] ?? `/${p.page_key}`}
                      {p.seo_title ? (
                        <span className="ml-2 text-emerald-400/70">• custom title set</span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => (isOpen ? setEditingKey(null) : openEdit(p))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white"
                    aria-label={isOpen ? "Close" : "Edit"}
                  >
                    {isOpen ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </button>
                </div>
                {isOpen && (
                  <div className="space-y-3 border-t border-white/[0.06] bg-[#0B0F1A] px-5 py-4">
                    <div>
                      <label className={labelCls}>SEO Title</label>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={inputCls}
                        placeholder={`${p.page_label} — AnamDev`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>SEO Description</label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={3}
                        className={`${inputCls} resize-y`}
                        placeholder="Short summary shown in search results and social previews."
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={savePage}
                        disabled={saving}
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ------ Global Defaults ------ */}
      <section className="mt-8 space-y-5 rounded-xl border border-white/[0.08] bg-[#11162A] p-6">
        <header className="border-l-2 border-[#3B82F6] pl-3">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#3B82F6]">
            Global Defaults
          </h2>
          <p className="mt-1 text-[11px] text-white/50">
            Used as fallback whenever a page or post has no custom SEO fields set.
          </p>
        </header>

        <div>
          <label className={labelCls}>Site Base URL</label>
          <input
            value={settings.site_base_url}
            onChange={(e) => updateSetting("site_base_url", e.target.value)}
            className={inputCls}
            placeholder="https://yourdomain.com"
          />
          <p className={helperCls}>
            Used to generate all absolute URLs across the site (llms.txt, structured data,
            sitemap, canonical tags, Open Graph tags). Update this the moment you connect your
            custom domain.
          </p>
        </div>

        <div>
          <label className={labelCls}>Default Meta Title Template</label>
          <input
            value={settings.default_meta_title_template}
            onChange={(e) => updateSetting("default_meta_title_template", e.target.value)}
            className={inputCls}
            placeholder="{page} | AnamDev"
          />
          <p className={helperCls}>{"{page}"} is replaced by the specific page/post/project title.</p>
        </div>

        <div>
          <label className={labelCls}>Default Meta Description</label>
          <textarea
            value={settings.default_meta_description}
            onChange={(e) => updateSetting("default_meta_description", e.target.value)}
            rows={3}
            className={`${inputCls} resize-y`}
            placeholder="Freelance developer & AI specialist building modern websites…"
          />
        </div>

        <div>
          <ImageUploader
            label="Default Social Share Image (Open Graph fallback)"
            value={settings.default_og_image_url || null}
            onChange={(url) => updateSetting("default_og_image_url", url ?? "")}
          />
        </div>

        <div className="flex justify-end">
          <SaveBtn
            onClick={() =>
              saveKeys([
                "site_base_url",
                "default_meta_title_template",
                "default_meta_description",
                "default_og_image_url",
              ])
            }
          />
        </div>
      </section>

      {/* ------ Tracking & Verification ------ */}
      <section className="mt-8 space-y-5 rounded-xl border border-white/[0.08] bg-[#11162A] p-6">
        <header className="border-l-2 border-[#F97316] pl-3">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#F97316]">
            Tracking & Verification
          </h2>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Google Analytics Measurement ID</label>
            <input
              value={settings.ga4_measurement_id}
              onChange={(e) => updateSetting("ga4_measurement_id", e.target.value)}
              className={inputCls}
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <div>
            <label className={labelCls}>Facebook Pixel ID</label>
            <input
              value={settings.facebook_pixel_id}
              onChange={(e) => updateSetting("facebook_pixel_id", e.target.value)}
              className={inputCls}
              placeholder="e.g. 123456789012345"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Google Search Console Verification</label>
          <input
            value={settings.google_site_verification}
            onChange={(e) => updateSetting("google_site_verification", e.target.value)}
            className={inputCls}
            placeholder="Just the content value — the meta tag is added automatically"
          />
          <p className={helperCls}>
            Paste only the code; we wrap it in the correct meta tag automatically.
          </p>
        </div>

        <div>
          <label className={labelCls}>Bing Webmaster Verification</label>
          <input
            value={settings.bing_site_verification}
            onChange={(e) => updateSetting("bing_site_verification", e.target.value)}
            className={inputCls}
            placeholder="Just the content value — the meta tag is added automatically"
          />
          <p className={helperCls}>
            Paste only the code; we wrap it in the correct meta tag automatically.
          </p>
        </div>

        <div>
          <label className={labelCls}>Custom Head Scripts (Advanced)</label>
          <textarea
            value={settings.custom_head_scripts}
            onChange={(e) => updateSetting("custom_head_scripts", e.target.value)}
            rows={6}
            className={`${inputCls} resize-y font-mono text-[12px]`}
            placeholder='<script>/* your snippet */</script>'
          />
          <div className="mt-2 flex gap-2 rounded-md border border-amber-500/30 bg-amber-500/[0.06] p-2.5 text-[11px] text-amber-200/80">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Paste any third-party verification, tracking, or affiliate script here. It will be
              inserted into the &lt;head&gt; of every page. Only paste scripts from sources you
              trust.
            </span>
          </div>
        </div>

        <div>
          <label className={labelCls}>Custom Body Scripts (Advanced)</label>
          <textarea
            value={settings.custom_body_scripts}
            onChange={(e) => updateSetting("custom_body_scripts", e.target.value)}
            rows={4}
            className={`${inputCls} resize-y font-mono text-[12px]`}
            placeholder="<script>/* chat widget, noscript pixels, etc. */</script>"
          />
          <p className={helperCls}>Injected at the end of &lt;body&gt; on every page.</p>
        </div>

        <div className="flex justify-end">
          <SaveBtn
            onClick={() =>
              saveKeys([
                "ga4_measurement_id",
                "facebook_pixel_id",
                "google_site_verification",
                "bing_site_verification",
                "custom_head_scripts",
                "custom_body_scripts",
              ])
            }
          />
        </div>
      </section>

      {/* ------ Social Platform Tracking ------ */}
      <section className="mt-8 space-y-5 rounded-xl border border-white/[0.08] bg-[#11162A] p-6">
        <header className="flex items-center gap-2 border-l-2 border-[#3B82F6] pl-3">
          <Share2 className="h-4 w-4 text-[#3B82F6]" />
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#3B82F6]">
            Social Platform Tracking
          </h2>
        </header>

        <div>
          <label className={labelCls}>Meta / Facebook Domain Verification</label>
          <input
            value={settings.facebook_domain_verification}
            onChange={(e) => updateSetting("facebook_domain_verification", e.target.value)}
            className={inputCls}
            placeholder="Just the content value (Meta Business Suite domain claim)"
          />
          <p className={helperCls}>
            Separate from the Facebook Pixel above — this claims your domain in Meta Business Suite.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>TikTok Pixel ID</label>
            <input
              value={settings.tiktok_pixel_id}
              onChange={(e) => updateSetting("tiktok_pixel_id", e.target.value)}
              className={inputCls}
              placeholder="e.g. C4A1B2C3D4E5F6"
            />
          </div>
          <div>
            <label className={labelCls}>LinkedIn Insight Partner ID</label>
            <input
              value={settings.linkedin_partner_id}
              onChange={(e) => updateSetting("linkedin_partner_id", e.target.value)}
              className={inputCls}
              placeholder="e.g. 1234567"
            />
          </div>
          <div>
            <label className={labelCls}>Pinterest Tag ID</label>
            <input
              value={settings.pinterest_tag_id}
              onChange={(e) => updateSetting("pinterest_tag_id", e.target.value)}
              className={inputCls}
              placeholder="e.g. 2612345678901"
            />
          </div>
          <div>
            <label className={labelCls}>Pinterest Domain Verification</label>
            <input
              value={settings.pinterest_domain_verification}
              onChange={(e) => updateSetting("pinterest_domain_verification", e.target.value)}
              className={inputCls}
              placeholder="Just the content value"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <SaveBtn
            onClick={() =>
              saveKeys([
                "facebook_domain_verification",
                "tiktok_pixel_id",
                "linkedin_partner_id",
                "pinterest_tag_id",
                "pinterest_domain_verification",
              ])
            }
          />
        </div>
      </section>


      {/* ------ AI Crawler Access ------ */}
      <section className="mt-8 space-y-5 rounded-xl border border-white/[0.08] bg-[#11162A] p-6">
        <header className="flex items-center gap-2 border-l-2 border-[#3B82F6] pl-3">
          <Bot className="h-4 w-4 text-[#3B82F6]" />
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#3B82F6]">
            AI Crawler Access
          </h2>
        </header>

        <p className="text-[12px] leading-relaxed text-white/55">
          Control which AI companies are allowed to crawl and train on your site's content.
          Disallowing does not guarantee compliance, as it relies on the AI company respecting
          robots.txt, but it sets your public preference clearly.
        </p>

        <ul className="divide-y divide-white/[0.05] rounded-md border border-white/[0.06] bg-[#0B0F1A]">
          {AI_BOTS.map((bot) => (
            <li key={bot.key} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{bot.label}</div>
                <div className="text-[11px] text-white/50">{bot.note}</div>
              </div>
              <span
                className={`text-[11px] font-mono uppercase tracking-wider ${
                  isOn(bot.key) ? "text-emerald-400/80" : "text-red-400/80"
                }`}
              >
                {isOn(bot.key) ? "Allowed" : "Blocked"}
              </span>
              <Switch
                checked={isOn(bot.key)}
                onCheckedChange={(v) => updateSetting(bot.key, v ? "true" : "false")}
              />
            </li>
          ))}
        </ul>

        <div className="flex justify-end">
          <SaveBtn onClick={() => saveKeys(AI_BOTS.map((b) => b.key))} />
        </div>
      </section>

      {/* ------ llms.txt ------ */}
      <section className="mt-8 space-y-5 rounded-xl border border-white/[0.08] bg-[#11162A] p-6">
        <header className="flex items-center gap-2 border-l-2 border-[#F97316] pl-3">
          <FileText className="h-4 w-4 text-[#F97316]" />
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#F97316]">
            llms.txt (AI Discovery File)
          </h2>
        </header>

        <div>
          <label className={labelCls}>Custom llms.txt Content</label>
          <textarea
            value={settings.llms_txt_content || DEFAULT_LLMS_TXT}
            onChange={(e) => updateSetting("llms_txt_content", e.target.value)}
            rows={18}
            className={`${inputCls} resize-y font-mono text-[12px] leading-relaxed`}
          />
          <p className={helperCls}>
            llms.txt is an emerging standard that helps AI models understand your site's structure
            and content. Write a brief plain-text or markdown summary of what AnamDev offers, key
            pages, and how AI assistants should describe your business. Served at{" "}
            <span className="font-mono text-white/60">/llms.txt</span>.
          </p>
        </div>

        <div className="flex justify-end">
          <SaveBtn onClick={() => saveKeys(["llms_txt_content"])} />
        </div>
      </section>
    </AdminShell>
  );
}
