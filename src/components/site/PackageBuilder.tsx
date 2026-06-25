import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { PromoCard, type PromoCardData } from "./PromoCard";
import { OptionIconBadge } from "./OptionIconBadge";

// ---------- Types ----------
type TechApproach = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
};
type UseCase = {
  id: string;
  key: string;
  label: string;
  display_order: number;
  is_active: boolean;
};
type UseCasePricing = {
  id: string;
  use_case_id: string;
  tech_approach_id: string;
  base_price: number;
  is_available: boolean;
};
type Tier = {
  id: string;
  use_case_id: string;
  label: string;
  price_delta: number;
  display_order: number;
  is_active: boolean;
};
type BuilderOption = {
  id: string;
  category_key: string;
  option_group: string;
  label: string;
  price_delta: number;
  input_type: string;
  is_default: boolean;
  is_active: boolean;
  display_order: number;
};
type TypeRow = {
  id: string;
  label: string;
  base_price: number;
  display_order: number;
  is_active: boolean;
};

type BuilderData = {
  techApproaches: TechApproach[];
  useCases: UseCase[];
  pricing: UseCasePricing[];
  tiers: Tier[];
  websiteOptions: BuilderOption[];
  aiTypes: TypeRow[];
  podcastTypes: TypeRow[];
  aiOptions: BuilderOption[];
  podcastOptions: BuilderOption[];
  promoCards: PromoCardData[];
};

// ---------- Hook ----------
function useBuilderData() {
  const [data, setData] = useState<BuilderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tech, uc, price, tiers, opts, aiT, podT, promo] = await Promise.all([
          supabase.from("builder_tech_approaches").select("*").eq("is_active", true).order("display_order"),
          supabase.from("builder_use_cases").select("*").eq("is_active", true).order("display_order"),
          supabase.from("builder_use_case_pricing").select("*"),
          supabase.from("builder_tiers").select("*").eq("is_active", true).order("display_order"),
          supabase.from("builder_options").select("*").eq("is_active", true).in("category_key", ["website", "ai_agent", "podcast"]).order("display_order"),
          supabase.from("builder_ai_types").select("*").eq("is_active", true).order("display_order"),
          supabase.from("builder_podcast_types").select("*").eq("is_active", true).order("display_order"),
          supabase.from("builder_promo_cards").select("*").eq("is_active", true).order("display_order"),
        ]);
        const firstErr = [tech, uc, price, tiers, opts, aiT, podT, promo].find((r) => r.error);
        if (firstErr?.error) throw firstErr.error;
        if (cancelled) return;
        const allOpts = (opts.data ?? []) as BuilderOption[];
        setData({
          techApproaches: (tech.data ?? []) as TechApproach[],
          useCases: (uc.data ?? []) as UseCase[],
          pricing: (price.data ?? []) as UseCasePricing[],
          tiers: (tiers.data ?? []) as Tier[],
          websiteOptions: allOpts.filter((o) => o.category_key === "website"),
          aiOptions: allOpts.filter((o) => o.category_key === "ai_agent"),
          podcastOptions: allOpts.filter((o) => o.category_key === "podcast"),
          aiTypes: (aiT.data ?? []) as TypeRow[],
          podcastTypes: (podT.data ?? []) as TypeRow[],
          promoCards: ((promo.data ?? []) as any[]).map((p) => ({
            id: p.id,
            brand_name: p.brand_name,
            brand_color: p.brand_color,
            eyebrow_text: p.eyebrow_text,
            heading_prefix: p.heading_prefix,
            description: p.description,
            cta_label: p.cta_label,
            cta_url: p.cta_url,
            feature_pills: Array.isArray(p.feature_pills) ? p.feature_pills : [],
            visibility_condition: p.visibility_condition,
          })) as any,
        });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load builder data");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error };
}

// ---------- Helpers ----------
function fmt(n: number) {
  return `$${n.toLocaleString()}`;
}
function tierLabelForUseCase(key: string): string {
  switch (key) {
    case "business_website": return "Pages";
    case "landing_page": return "Sections";
    case "ecommerce": return "Products";
    case "lms": return "Courses";
    case "web_app": return "Modules";
    default: return "Scope";
  }
}
const OPTION_GROUP_LABELS: Record<string, string> = {
  design: "Design",
  cms: "CMS / Editing",
  language: "Language",
  hosting: "Hosting",
  ai_where: "Where it connects",
  ai_language: "Language",
  ai_volume: "Usage volume",
  ai_knowledge: "Knowledge source",
  podcast_frequency: "Frequency",
  podcast_length: "Length",
  podcast_platform: "Platform",
  podcast_format: "Format",
  podcast_addon: "Add-ons",
};

function groupBy(opts: BuilderOption[]): Record<string, BuilderOption[]> {
  const m: Record<string, BuilderOption[]> = {};
  for (const o of opts) (m[o.option_group] ??= []).push(o);
  for (const k of Object.keys(m)) m[k].sort((a, b) => a.display_order - b.display_order);
  return m;
}

// ---------- UI bits ----------
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary)]">
      {children}
    </div>
  );
}
function StepCard({
  step,
  title,
  rightSlot,
  children,
}: {
  step: string;
  title: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[oklch(0.15_0.02_260)] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow>// {step}</Eyebrow>
          <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">{title}</h3>
        </div>
        {rightSlot}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}

function SelectOptionsBlock({
  groups,
  selections,
  onChange,
  twoCol = true,
}: {
  groups: Record<string, BuilderOption[]>;
  selections: Record<string, string>;
  onChange: (group: string, id: string) => void;
  twoCol?: boolean;
}) {
  const entries = Object.entries(groups).filter(([, opts]) =>
    opts.some((o) => o.input_type === "select"),
  );
  if (entries.length === 0) return null;
  return (
    <div className={twoCol ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
      {entries.map(([group, opts]) => {
        const selOpts = opts.filter((o) => o.input_type === "select");
        return (
          <div key={group}>
            <FieldLabel>{OPTION_GROUP_LABELS[group] ?? group}</FieldLabel>
            <Select value={selections[group] ?? ""} onValueChange={(v) => onChange(group, v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent>
                {selOpts.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    <span className="flex w-full items-center justify-between gap-4">
                      <span>{o.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {o.price_delta > 0 ? `+${fmt(o.price_delta)}` : "included"}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}

function CheckboxGroup({
  group,
  opts,
  checked,
  onToggle,
}: {
  group: string;
  opts: BuilderOption[];
  checked: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{OPTION_GROUP_LABELS[group] ?? group}</FieldLabel>
      <div className="grid gap-2 sm:grid-cols-2">
        {opts.map((o) => {
          const locked = o.is_default && group === "ai_where";
          const isChecked = locked ? true : checked.has(o.id);
          return (
            <label
              key={o.id}
              className={[
                "flex items-start gap-3 rounded-lg border border-white/[0.08] bg-background/60 p-3 text-sm",
                locked ? "opacity-80" : "cursor-pointer hover:border-white/20",
              ].join(" ")}
            >
              <Checkbox
                checked={isChecked}
                disabled={locked}
                onCheckedChange={() => !locked && onToggle(o.id)}
                className="mt-0.5"
              />
              <span className="flex-1 text-white">{o.label}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {o.price_delta > 0 ? `+${fmt(o.price_delta)}` : locked ? "included" : "included"}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Main component ----------
export type PriceLine = { id: string; label: string; amount: number };

const BUILDER_FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What if I already have a domain or hosting?",
    a: "Just select 'I have my own hosting' in Step 2 — no extra charge. If you don't have one yet, I can set it up for a small fee, or you can grab a discount through my Hostinger link.",
  },
  {
    q: "Do I have to add AI Agent or Podcast?",
    a: "No — only the website is required. AI Agent and Podcast are optional add-ons you can include now or discuss separately later.",
  },
  {
    q: "How does the 10% advance work?",
    a: "A 10% advance secures your spot in the project queue once you confirm your build. The remaining balance follows whichever payment plan you choose.",
  },
  {
    q: "Can I change my selections after submitting?",
    a: "Yes — this is just a starting quote. We'll review everything together over a quick call or WhatsApp before anything is finalized.",
  },
  {
    q: "Where can I read the full terms?",
    a: (
      <span>
        See our{" "}
        <a href="/terms" className="text-[color:var(--primary)] underline-offset-4 hover:underline">
          full Terms of Service →
        </a>
      </span>
    ),
  },
];

export function PackageBuilder() {
  const { data, error } = useBuilderData();

  // Step 1
  const [startingPoint, setStartingPoint] = useState<string>("");
  const [ideaDescription, setIdeaDescription] = useState<string>("");

  // Step 2
  const [techId, setTechId] = useState<string>("");
  const [useCaseId, setUseCaseId] = useState<string>("");
  const [tierId, setTierId] = useState<string>("");
  const [subOptions, setSubOptions] = useState<Record<string, string>>({});

  // Step 3
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiTypeId, setAiTypeId] = useState<string>("");
  const [aiSelects, setAiSelects] = useState<Record<string, string>>({});
  const [aiWhereChecked, setAiWhereChecked] = useState<Set<string>>(new Set());

  // Step 4
  const [podEnabled, setPodEnabled] = useState(false);
  const [podTypeId, setPodTypeId] = useState<string>("");
  const [podSelects, setPodSelects] = useState<Record<string, string>>({});
  const [podAddons, setPodAddons] = useState<Set<string>>(new Set());

  const techApproach = data?.techApproaches.find((t) => t.id === techId);
  const useCase = data?.useCases.find((u) => u.id === useCaseId);

  const currentPricing = useMemo(() => {
    if (!data || !techId || !useCaseId) return null;
    return data.pricing.find((p) => p.tech_approach_id === techId && p.use_case_id === useCaseId) ?? null;
  }, [data, techId, useCaseId]);

  useEffect(() => {
    if (!data || !techId || !useCaseId) return;
    const combo = data.pricing.find((p) => p.tech_approach_id === techId && p.use_case_id === useCaseId);
    if (!combo || !combo.is_available) {
      setUseCaseId("");
      setTierId("");
    }
  }, [techId, data, useCaseId]);

  useEffect(() => {
    setTierId("");
  }, [useCaseId]);

  // Defaults: website sub-options
  useEffect(() => {
    if (!data) return;
    const defaults: Record<string, string> = {};
    for (const o of data.websiteOptions) if (o.is_default && o.input_type === "select") defaults[o.option_group] = o.id;
    setSubOptions((prev) => {
      const next = { ...defaults };
      for (const [k, v] of Object.entries(prev)) if (v) next[k] = v;
      return next;
    });
  }, [data?.websiteOptions]);

  // Defaults: AI selects + locked website checkbox
  useEffect(() => {
    if (!data) return;
    const defs: Record<string, string> = {};
    for (const o of data.aiOptions) if (o.is_default && o.input_type === "select") defs[o.option_group] = o.id;
    setAiSelects((prev) => ({ ...defs, ...prev }));
    const lockedWhere = data.aiOptions.find((o) => o.option_group === "ai_where" && o.is_default);
    if (lockedWhere) {
      setAiWhereChecked((prev) => {
        const next = new Set(prev);
        next.add(lockedWhere.id);
        return next;
      });
    }
  }, [data?.aiOptions]);

  // Defaults: Podcast selects
  useEffect(() => {
    if (!data) return;
    const defs: Record<string, string> = {};
    for (const o of data.podcastOptions) if (o.is_default && o.input_type === "select") defs[o.option_group] = o.id;
    setPodSelects((prev) => ({ ...defs, ...prev }));
  }, [data?.podcastOptions]);

  const tiersForUseCase = useMemo(() => {
    if (!data || !useCaseId) return [];
    return data.tiers.filter((t) => t.use_case_id === useCaseId).sort((a, b) => a.display_order - b.display_order);
  }, [data, useCaseId]);

  const websiteGroups = useMemo(() => (data ? groupBy(data.websiteOptions) : {}), [data]);
  const aiGroups = useMemo(() => (data ? groupBy(data.aiOptions) : {}), [data]);
  const podGroups = useMemo(() => (data ? groupBy(data.podcastOptions) : {}), [data]);

  // Hosting banner trigger: "own hosting" = is_default option in hosting group
  const hostingOptId = subOptions["hosting"];
  const hostingOpt = data?.websiteOptions.find((o) => o.id === hostingOptId);
  const showHostingBanner =
    !!hostingOpt && hostingOpt.is_default && !hostingBannerDismissed;

  // ---------- Price lines ----------
  const priceLines: PriceLine[] = useMemo(() => {
    const lines: PriceLine[] = [];
    if (techApproach && useCase && currentPricing && currentPricing.is_available) {
      const tier = tiersForUseCase.find((t) => t.id === tierId);
      const base = currentPricing.base_price + (tier?.price_delta ?? 0);
      const tierSuffix = tier ? ` — ${tier.label}` : "";
      lines.push({
        id: "website-base",
        label: `Website: ${techApproach.label.split("—")[0].trim()} · ${useCase.label}${tierSuffix}`,
        amount: base,
      });
    }
    for (const [group, optId] of Object.entries(subOptions)) {
      if (!optId) continue;
      const opt = data?.websiteOptions.find((o) => o.id === optId);
      if (!opt || opt.price_delta === 0) continue;
      lines.push({
        id: `opt-${group}`,
        label: `${OPTION_GROUP_LABELS[group] ?? group}: ${opt.label}`,
        amount: opt.price_delta,
      });
    }

    // AI Agent combined line
    if (aiEnabled && data) {
      const aiType = data.aiTypes.find((t) => t.id === aiTypeId);
      if (aiType) {
        let total = Number(aiType.base_price);
        for (const id of aiWhereChecked) {
          const o = data.aiOptions.find((x) => x.id === id);
          if (o) total += Number(o.price_delta);
        }
        for (const id of Object.values(aiSelects)) {
          const o = data.aiOptions.find((x) => x.id === id);
          if (o) total += Number(o.price_delta);
        }
        lines.push({ id: "ai-agent", label: `AI Agent: ${aiType.label}`, amount: total });
      }
    }

    // Podcast combined line
    if (podEnabled && data) {
      const podType = data.podcastTypes.find((t) => t.id === podTypeId);
      if (podType) {
        let total = Number(podType.base_price);
        for (const id of Object.values(podSelects)) {
          const o = data.podcastOptions.find((x) => x.id === id);
          if (o) total += Number(o.price_delta);
        }
        for (const id of podAddons) {
          const o = data.podcastOptions.find((x) => x.id === id);
          if (o) total += Number(o.price_delta);
        }
        lines.push({ id: "podcast", label: `Podcast: ${podType.label}`, amount: total });
      }
    }

    return lines;
  }, [techApproach, useCase, currentPricing, tiersForUseCase, tierId, subOptions, data, aiEnabled, aiTypeId, aiSelects, aiWhereChecked, podEnabled, podTypeId, podSelects, podAddons]);

  const total = priceLines.reduce((s, l) => s + l.amount, 0);
  const advance = Math.round(total * 0.1);

  if (error) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[oklch(0.15_0.02_260)] p-6 text-sm text-muted-foreground">
        Couldn't load builder options: {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-white/[0.08] bg-[oklch(0.15_0.02_260)] p-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="ml-2 text-sm">Loading builder…</span>
      </div>
    );
  }

  const aiWhereOpts = (aiGroups["ai_where"] ?? []).filter((o) => o.input_type === "checkbox");
  const podAddonOpts = (podGroups["podcast_addon"] ?? []).filter((o) => o.input_type === "checkbox");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
      {/* Steps column */}
      <div className="flex flex-col gap-6">
        {/* Step 1 */}
        <StepCard step="STEP 1" title="Your starting point">
          <FieldLabel>Where are you starting from?</FieldLabel>
          <Select value={startingPoint} onValueChange={setStartingPoint}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Choose one…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idea">I have an idea</SelectItem>
              <SelectItem value="local_business">Existing local business</SelectItem>
              <SelectItem value="rebrand">Existing brand / rebrand</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-4">
            <FieldLabel>Tell me a bit more</FieldLabel>
            <Textarea
              value={ideaDescription}
              onChange={(e) => setIdeaDescription(e.target.value)}
              placeholder="Tell me briefly about your idea or business..."
              className="min-h-[96px] bg-background"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Saved with your lead — doesn't affect price.
          </p>
        </StepCard>

        {/* Step 2 */}
        <StepCard step="STEP 2" title="Website (required)">
          <FieldLabel>Tech approach</FieldLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.techApproaches.map((t) => {
              const active = techId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTechId(t.id)}
                  className={[
                    "rounded-lg border p-4 text-left transition-colors",
                    active
                      ? "border-[color:var(--primary)] bg-[oklch(0.62_0.19_255/10%)]"
                      : "border-white/[0.08] bg-background hover:border-white/20",
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold text-white">{t.label}</div>
                  {t.description && (
                    <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {t.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {techId && (
            <div className="mt-6">
              <FieldLabel>Use case</FieldLabel>
              <Select value={useCaseId} onValueChange={setUseCaseId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose use case…" />
                </SelectTrigger>
                <SelectContent>
                  {data.useCases
                    .map((u) => {
                      const p = data.pricing.find((x) => x.use_case_id === u.id && x.tech_approach_id === techId);
                      const available = !!p && p.is_available;
                      if (!available) return null;
                      return (
                        <SelectItem key={u.id} value={u.id}>
                          <span className="flex w-full items-center justify-between gap-4">
                            <span>{u.label}</span>
                            <span className="font-mono text-xs text-muted-foreground">{fmt(p!.base_price)}</span>
                          </span>
                        </SelectItem>
                      );
                    })
                    .filter(Boolean)}
                </SelectContent>
              </Select>
            </div>
          )}

          {useCaseId && tiersForUseCase.length > 0 && (
            <div className="mt-5">
              <FieldLabel>{tierLabelForUseCase(useCase?.key ?? "")}</FieldLabel>
              <Select value={tierId} onValueChange={setTierId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose scope…" />
                </SelectTrigger>
                <SelectContent>
                  {tiersForUseCase.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex w-full items-center justify-between gap-4">
                        <span>{t.label}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {t.price_delta > 0 ? `+${fmt(t.price_delta)}` : "included"}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tierId && Object.keys(websiteGroups).length > 0 && (
            <div className="mt-6 space-y-4">
              <SelectOptionsBlock
                groups={websiteGroups}
                selections={subOptions}
                onChange={(g, v) => setSubOptions((prev) => ({ ...prev, [g]: v }))}
              />

              {showHostingBanner && (
                <div className="flex items-start gap-3 rounded-lg border border-[color:var(--orange)]/30 bg-[color:var(--orange)]/[0.06] px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                  <div className="flex-1">
                    Don't have hosting yet? Get a discount on Hostinger via this link{" "}
                    <span className="text-muted-foreground/80">(affiliate link)</span> — then let me know and I'll handle the setup.{" "}
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="ml-1 inline-flex items-center gap-1 font-medium text-[color:var(--orange)] hover:underline"
                    >
                      Get Hostinger Discount <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => setHostingBannerDismissed(true)}
                    className="text-muted-foreground hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </StepCard>

        {/* Step 3 — AI Agent */}
        <StepCard
          step="STEP 3"
          title="AI Agent (optional)"
          rightSlot={
            <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
              <span>Add AI Agent</span>
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </label>
          }
        >
          {!aiEnabled ? (
            <p className="text-sm text-muted-foreground">
              Toggle on to add an AI Agent integration to this build.
            </p>
          ) : (
            <div className="space-y-5">
              <div>
                <FieldLabel>AI Agent type</FieldLabel>
                <Select value={aiTypeId} onValueChange={setAiTypeId}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose AI type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.aiTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex w-full items-center justify-between gap-4">
                          <span>{t.label}</span>
                          <span className="font-mono text-xs text-muted-foreground">{fmt(Number(t.base_price))}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {aiTypeId && (
                <>
                  {aiWhereOpts.length > 0 && (
                    <CheckboxGroup
                      group="ai_where"
                      opts={aiWhereOpts}
                      checked={aiWhereChecked}
                      onToggle={(id) =>
                        setAiWhereChecked((prev) => {
                          const next = new Set(prev);
                          next.has(id) ? next.delete(id) : next.add(id);
                          return next;
                        })
                      }
                    />
                  )}

                  <SelectOptionsBlock
                    groups={Object.fromEntries(
                      Object.entries(aiGroups).filter(([g]) => g !== "ai_where"),
                    )}
                    selections={aiSelects}
                    onChange={(g, v) => setAiSelects((prev) => ({ ...prev, [g]: v }))}
                  />
                </>
              )}
            </div>
          )}
        </StepCard>

        {/* Step 4 — Podcast */}
        <StepCard
          step="STEP 4"
          title="Podcast (optional)"
          rightSlot={
            <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
              <span>Add a podcast</span>
              <Switch checked={podEnabled} onCheckedChange={setPodEnabled} />
            </label>
          }
        >
          {!podEnabled ? (
            <p className="text-sm text-muted-foreground">
              Toggle on to add a podcast production track to this build.
            </p>
          ) : (
            <div className="space-y-5">
              <div>
                <FieldLabel>Podcast type</FieldLabel>
                <Select value={podTypeId} onValueChange={setPodTypeId}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose podcast type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.podcastTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex w-full items-center justify-between gap-4">
                          <span>{t.label}</span>
                          <span className="font-mono text-xs text-muted-foreground">{fmt(Number(t.base_price))}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {podTypeId && (
                <>
                  <SelectOptionsBlock
                    groups={Object.fromEntries(
                      Object.entries(podGroups).filter(([g]) => g !== "podcast_addon"),
                    )}
                    selections={podSelects}
                    onChange={(g, v) => setPodSelects((prev) => ({ ...prev, [g]: v }))}
                  />

                  {podAddonOpts.length > 0 && (
                    <CheckboxGroup
                      group="podcast_addon"
                      opts={podAddonOpts}
                      checked={podAddons}
                      onToggle={(id) =>
                        setPodAddons((prev) => {
                          const next = new Set(prev);
                          next.has(id) ? next.delete(id) : next.add(id);
                          return next;
                        })
                      }
                    />
                  )}
                </>
              )}
            </div>
          )}
        </StepCard>

        {/* Builder FAQ */}
        <div className="rounded-xl border border-white/[0.08] bg-[oklch(0.15_0.02_260)] p-5 sm:p-7">
          <Eyebrow>// BUILDER FAQ</Eyebrow>
          <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">
            Quick questions about this builder
          </h3>
          <Accordion type="single" collapsible className="mt-5 space-y-3">
            {BUILDER_FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="card-elevated border-b-0 px-5"
              >
                <AccordionTrigger className="py-4 text-sm font-semibold text-white hover:no-underline sm:text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Live price sidebar */}
      <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <div className="rounded-xl border border-white/[0.08] bg-[oklch(0.15_0.02_260)] p-6">
          <Eyebrow>// LIVE QUOTE</Eyebrow>
          <h3 className="mt-2 text-lg font-semibold text-white">Your custom build</h3>

          <ul className="mt-5 space-y-3 text-sm">
            {priceLines.length === 0 ? (
              <li className="text-muted-foreground">
                Make selections to see your price build up live.
              </li>
            ) : (
              priceLines.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">{l.label}</span>
                  <span className="shrink-0 font-mono text-white">
                    {l.amount > 0 ? fmt(l.amount) : "included"}
                  </span>
                </li>
              ))
            )}
          </ul>

          <div className="my-5 h-px w-full bg-white/10" />

          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Total</span>
            <span className="font-display text-3xl font-bold text-gradient-vo">{fmt(total)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>10% advance to secure the order</span>
            <span className="font-mono">{fmt(advance)}</span>
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
            Payment options shown after your build is complete.
          </p>
        </div>
      </aside>
    </div>
  );
}
