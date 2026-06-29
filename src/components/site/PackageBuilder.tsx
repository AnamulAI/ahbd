import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
import { ArrowRight, CheckCircle2, Loader2, MessageCircle, Star } from "lucide-react";
import { RevealBorder } from "@/components/site/RevealBorder";
import { ShareQuoteButton } from "@/components/site/ShareQuoteButton";
import { PromoCard, type PromoCardData } from "./PromoCard";
import { OptionIconBadge } from "./OptionIconBadge";

type PaymentPlan = "installments" | "pay_in_full" | "milestone";

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
                "flex items-center gap-3 rounded-lg border border-white/[0.08] bg-background/60 p-3 text-sm",
                locked ? "opacity-80" : "cursor-pointer hover:border-white/20",
              ].join(" ")}
            >
              <Checkbox
                checked={isChecked}
                disabled={locked}
                onCheckedChange={() => !locked && onToggle(o.id)}
              />
              <OptionIconBadge label={o.label} group={group} />
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

  // Part 4: payment + contact
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | "">("");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadWhatsapp, setLeadWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const paymentRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);

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

  // Promo card visibility: "I have my own hosting" = is_default option in hosting group
  const hostingOptId = subOptions["hosting"];
  const hostingOpt = data?.websiteOptions.find((o) => o.id === hostingOptId);
  const hostingSelfManaged = !!hostingOpt && hostingOpt.is_default;
  const techIsCustom = techApproach?.key === "custom";

  const visiblePromoCards = useMemo(() => {
    if (!data) return [];
    return data.promoCards.filter((c) => {
      switch (c.visibility_condition) {
        case "hosting_self_managed": return hostingSelfManaged;
        case "tech_approach_custom": return techIsCustom;
        case "always": return true;
        default: return false;
      }
    });
  }, [data, hostingSelfManaged, techIsCustom]);

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

    // AI Agent — itemized
    if (aiEnabled && data) {
      const aiType = data.aiTypes.find((t) => t.id === aiTypeId);
      if (aiType) {
        if (Number(aiType.base_price) > 0) {
          lines.push({
            id: "ai-type",
            label: `AI Agent: ${aiType.label}`,
            amount: Number(aiType.base_price),
          });
        }
        for (const id of aiWhereChecked) {
          const o = data.aiOptions.find((x) => x.id === id);
          if (o && Number(o.price_delta) > 0) {
            lines.push({
              id: `ai-where-${o.id}`,
              label: `${OPTION_GROUP_LABELS[o.option_group] ?? o.option_group}: ${o.label}`,
              amount: Number(o.price_delta),
            });
          }
        }
        for (const [group, id] of Object.entries(aiSelects)) {
          const o = data.aiOptions.find((x) => x.id === id);
          if (o && Number(o.price_delta) > 0) {
            lines.push({
              id: `ai-${group}`,
              label: `${OPTION_GROUP_LABELS[group] ?? group}: ${o.label}`,
              amount: Number(o.price_delta),
            });
          }
        }
      }
    }

    // Podcast — itemized
    if (podEnabled && data) {
      const podType = data.podcastTypes.find((t) => t.id === podTypeId);
      if (podType) {
        if (Number(podType.base_price) > 0) {
          lines.push({
            id: "pod-type",
            label: `Podcast: ${podType.label}`,
            amount: Number(podType.base_price),
          });
        }
        for (const [group, id] of Object.entries(podSelects)) {
          const o = data.podcastOptions.find((x) => x.id === id);
          if (o && Number(o.price_delta) > 0) {
            lines.push({
              id: `pod-${group}`,
              label: `${OPTION_GROUP_LABELS[group] ?? group}: ${o.label}`,
              amount: Number(o.price_delta),
            });
          }
        }
        for (const id of podAddons) {
          const o = data.podcastOptions.find((x) => x.id === id);
          if (o && Number(o.price_delta) > 0) {
            lines.push({
              id: `pod-addon-${o.id}`,
              label: `Add-on: ${o.label}`,
              amount: Number(o.price_delta),
            });
          }
        }
      }
    }

    return lines;
  }, [techApproach, useCase, currentPricing, tiersForUseCase, tierId, subOptions, data, aiEnabled, aiTypeId, aiSelects, aiWhereChecked, podEnabled, podTypeId, podSelects, podAddons]);

  const total = priceLines.reduce((s, l) => s + l.amount, 0);
  const advance = Math.round(total * 0.1);

  // Ref to the Live Quote card DOM for share-as-image capture.
  const quoteCardRef = useRef<HTMLDivElement>(null);

  // Short WhatsApp prompt that accompanies the shared image.
  const quoteWaMessage = useMemo(() => {
    if (priceLines.length === 0) {
      return "Hi! Here's my custom build from the DFY Package Builder — see attached image.";
    }
    return `Hi! Here's my custom build from the DFY Package Builder — total ${fmt(total)}. See attached image for the full breakdown.`;
  }, [priceLines.length, total]);

  // Bump the entire Live Quote card whenever ANY selection changes.
  const selectionSig = useMemo(() => {
    return JSON.stringify({
      techId, useCaseId, tierId, subOptions,
      aiEnabled, aiTypeId, aiSelects, aiWhere: [...aiWhereChecked].sort(),
      podEnabled, podTypeId, podSelects, podAddons: [...podAddons].sort(),
    });
  }, [techId, useCaseId, tierId, subOptions, aiEnabled, aiTypeId, aiSelects, aiWhereChecked, podEnabled, podTypeId, podSelects, podAddons]);
  const firstSigRef = useRef(true);
  const [cardBump, setCardBump] = useState(0);
  useEffect(() => {
    if (firstSigRef.current) { firstSigRef.current = false; return; }
    setCardBump((n) => n + 1);
    const t = window.setTimeout(() => {}, 420);
    return () => window.clearTimeout(t);
  }, [selectionSig]);

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
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start">
      {/* A: Steps 1-4 + Continue button */}
      <div className="order-1 flex flex-col gap-6 lg:col-start-1 lg:row-start-1">

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

        {/* Continue → reveal payment cards */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setPaymentOpen(true);
              setTimeout(() => paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
            }}
            className="group relative inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-transform hover:scale-[1.02]"
          >
            See Payment Options
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* B: Payment cards + Lead form (mobile order-4 puts these AFTER FAQ;
          desktop keeps them above FAQ in the left column) */}
      <div className="order-4 flex flex-col gap-6 lg:order-none lg:col-start-1 lg:row-start-2">
        {/* Payment Plan Cards */}
        {paymentOpen && (() => {

          const installments = Math.round(total / 3);
          const payInFull = Math.round(total * 0.75);
          const phases = ["Website", aiEnabled && "AI Agent", podEnabled && "Podcast"].filter(Boolean) as string[];
          const plans: { id: PaymentPlan; label: string; desc: string; highlight?: boolean; render: React.ReactNode }[] = [
            {
              id: "installments",
              label: "Installments",
              desc: "Split into 3 payments",
              render: (
                <div>
                  <div className="font-display text-3xl font-bold text-white">{fmt(installments)}</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">× 3 payments</div>
                </div>
              ),
            },
            {
              id: "pay_in_full",
              label: "Pay in Full",
              desc: "One upfront payment — biggest savings",
              highlight: true,
              render: (
                <div>
                  <div className="font-mono text-sm text-muted-foreground line-through">{fmt(total)}</div>
                  <div className="font-display text-4xl font-bold text-gradient-vo">{fmt(payInFull)}</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">save 25%</div>
                </div>
              ),
            },
            {
              id: "milestone",
              label: "Milestone-Based",
              desc: `Pay per phase as it completes — ${phases.join(" → ")}`,
              render: (
                <div>
                  <div className="font-display text-3xl font-bold text-white">{fmt(total)}</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">across {phases.length} milestone{phases.length === 1 ? "" : "s"}</div>
                </div>
              ),
            },
          ];

          return (
            <div ref={paymentRef} className="animate-fade-in">
              <div className="mb-5 text-center">
                <Eyebrow>// CHOOSE A PAYMENT PLAN</Eyebrow>
                <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">How would you like to pay?</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 sm:items-stretch">
                {plans.map((p) => {
                  const selected = paymentPlan === p.id;
                  const isFeatured = !!p.highlight;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPaymentPlan(p.id);
                        setTimeout(() => contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                      }}
                      className={[
                        "relative text-left transition-transform",
                        isFeatured ? "group/reveal sm:scale-[1.04]" : "",
                      ].join(" ")}
                    >
                      {isFeatured && <RevealBorder rounded="rounded-[1.25rem]" radius={20} />}
                      <div
                        className={[
                          "relative h-full rounded-[1.25rem] bg-[oklch(0.15_0.02_260)] p-6",
                          !isFeatured && "border",
                          !isFeatured && (selected
                            ? "border-[color:var(--primary)]"
                            : "border-white/[0.08]"),
                          isFeatured && selected ? "ring-2 ring-[color:var(--primary)] ring-offset-2 ring-offset-[oklch(0.15_0.02_260)]" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {isFeatured && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white flex items-center gap-1">
                            <Star className="h-3 w-3 fill-white" />
                            Most Popular
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-semibold text-white">{p.label}</div>
                            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</div>
                          </div>
                          <div
                            className={[
                              "mt-1 h-4 w-4 shrink-0 rounded-full border",
                              selected ? "border-[color:var(--primary)] bg-[color:var(--primary)]" : "border-white/30",
                            ].join(" ")}
                          />
                        </div>
                        <div className="mt-5">{p.render}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-center text-xs text-muted-foreground">
                All plans require a 10% advance (<span className="font-mono text-white">{fmt(advance)}</span>) to secure your spot.
              </p>
            </div>
          );
        })()}

        {/* Contact form */}
        {paymentOpen && paymentPlan && (
          <div ref={contactRef} className="animate-fade-in rounded-xl border border-white/[0.08] bg-[oklch(0.15_0.02_260)] p-5 sm:p-7">
            <Eyebrow>// FINAL STEP</Eyebrow>
            <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">Your contact details</h3>

            {submitted ? (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-[color:var(--primary)]/30 bg-[color:var(--primary)]/5 p-5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[color:var(--primary)]" />
                <p className="text-sm leading-relaxed text-white">
                  Thanks! I've received your build details and will reach out on WhatsApp within 24 hours to confirm everything.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 rounded-lg border border-white/[0.08] bg-background/60 p-4 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <span>Total: <span className="font-mono text-white">{fmt(total)}</span></span>
                    <span>Plan: <span className="text-white">{paymentPlan === "installments" ? "Installments (× 3)" : paymentPlan === "pay_in_full" ? "Pay in Full (25% off)" : "Milestone-Based"}</span></span>
                    <span>10% advance: <span className="font-mono text-white">{fmt(advance)}</span></span>
                  </div>
                </div>

                <form
                  className="mt-5 space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmitError(null);
                    const name = leadName.trim();
                    const email = leadEmail.trim();
                    const whatsapp = leadWhatsapp.trim();
                    if (!name || !email || !whatsapp) {
                      setSubmitError("Please fill in name, email, and WhatsApp number.");
                      return;
                    }
                    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                      setSubmitError("Please enter a valid email address.");
                      return;
                    }
                    setSubmitting(true);

                    // Build snapshot of every selection
                    const labelOf = (id: string, pool: BuilderOption[]) => pool.find((o) => o.id === id)?.label ?? null;
                    const snapshot = {
                      starting_point: startingPoint || null,
                      idea_description: ideaDescription || null,
                      website: techApproach && useCase ? {
                        tech_approach: techApproach.label,
                        use_case: useCase.label,
                        tier: tiersForUseCase.find((t) => t.id === tierId)?.label ?? null,
                        sub_options: Object.fromEntries(
                          Object.entries(subOptions).map(([g, id]) => [
                            OPTION_GROUP_LABELS[g] ?? g,
                            labelOf(id, data.websiteOptions),
                          ]),
                        ),
                      } : null,
                      ai_agent: aiEnabled ? {
                        type: data.aiTypes.find((t) => t.id === aiTypeId)?.label ?? null,
                        where: [...aiWhereChecked].map((id) => labelOf(id, data.aiOptions)).filter(Boolean),
                        selections: Object.fromEntries(
                          Object.entries(aiSelects).map(([g, id]) => [
                            OPTION_GROUP_LABELS[g] ?? g,
                            labelOf(id, data.aiOptions),
                          ]),
                        ),
                      } : null,
                      podcast: podEnabled ? {
                        type: data.podcastTypes.find((t) => t.id === podTypeId)?.label ?? null,
                        selections: Object.fromEntries(
                          Object.entries(podSelects).map(([g, id]) => [
                            OPTION_GROUP_LABELS[g] ?? g,
                            labelOf(id, data.podcastOptions),
                          ]),
                        ),
                        addons: [...podAddons].map((id) => labelOf(id, data.podcastOptions)).filter(Boolean),
                      } : null,
                      price_lines: priceLines,
                      advance,
                    };

                    const { error: insertErr } = await supabase.from("builder_leads").insert({
                      starting_point: startingPoint || null,
                      idea_description: ideaDescription || null,
                      name,
                      email,
                      whatsapp,
                      selected_config: snapshot as any,
                      total_price: total,
                      chosen_payment_plan: paymentPlan,
                      status: "new",
                    });

                    setSubmitting(false);
                    if (insertErr) {
                      setSubmitError(insertErr.message || "Something went wrong. Please try again.");
                      return;
                    }
                    setSubmitted(true);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <FieldLabel>Name</FieldLabel>
                      <Input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Your name" className="bg-background" required />
                    </div>
                    <div>
                      <FieldLabel>Email</FieldLabel>
                      <Input type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="you@example.com" className="bg-background" required />
                    </div>
                    <div>
                      <FieldLabel>WhatsApp</FieldLabel>
                      <Input value={leadWhatsapp} onChange={(e) => setLeadWhatsapp(e.target.value)} placeholder="+1 555 123 4567" className="bg-background" required />
                    </div>
                  </div>

                  {submitError && (
                    <p className="text-sm text-red-400">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative inline-flex w-full min-h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-transform hover:scale-[1.01] disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {submitting ? "Submitting…" : "Confirm My Build"}
                    {!submitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* C: Builder FAQ (mobile order-3 → after Live Quote; desktop keeps it
          below the payment block in the left column) */}
      <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-3">
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

      {/* Right column on desktop — mobile order-2 puts Live Quote right after Step 4 */}
      <aside className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:sticky lg:top-24 lg:self-start">

        <div className="flex flex-col gap-6">
          {/* Live Quote — Pricing Reveal Card pattern (permanent featured glow) */}
          <div key={`quote-${cardBump}`} className="group/reveal relative quote-card-bump">
            <RevealBorder rounded="rounded-[1.25rem]" radius={20} />
            <div ref={quoteCardRef} className="relative rounded-[1.25rem] bg-[oklch(0.15_0.02_260)] p-6">
              <Eyebrow>// LIVE QUOTE</Eyebrow>
              <h3 className="text-gradient-vo mt-2 mb-2 text-center text-xl font-semibold sm:text-2xl">Your custom build</h3>

              {ideaDescription.trim() && (
                <p className="mb-4 border-l-2 border-white/15 pl-3 text-center text-xs italic leading-relaxed text-muted-foreground">
                  &ldquo;{ideaDescription.trim()}&rdquo;
                </p>
              )}

              {priceLines.length === 0 ? (
                <div className="mt-5 text-sm text-muted-foreground">
                  Make selections to see your price build up live.
                </div>
              ) : (
                <div className="mt-5 space-y-4 text-sm">
                  {(() => {
                    const ORDER = ["website", "ai_agent", "podcast"] as const;
                    const CFG: Record<string, { label: string; color: string }> = {
                      website: { label: "WEBSITE", color: "#3B82F6" },
                      ai_agent: { label: "AI AGENT", color: "#8B5CF6" },
                      podcast: { label: "PODCAST", color: "#F97316" },
                    };
                    function catOf(id: string) {
                      if (id.startsWith("website-") || id.startsWith("opt-")) return "website";
                      if (id === "ai-type" || id.startsWith("ai-")) return "ai_agent";
                      if (id === "pod-type" || id.startsWith("pod-")) return "podcast";
                      return "website";
                    }
                    return ORDER.map((cat) => {
                      const catLines = priceLines.filter((l) => catOf(l.id) === cat);
                      if (catLines.length === 0) return null;
                      const cfg = CFG[cat];
                      const [first, ...rest] = catLines;
                      return (
                        <div key={cat}>
                          <div
                            className="font-mono text-[10px] uppercase tracking-[0.18em]"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </div>
                          <div className="mt-1.5 space-y-2">
                            <div className="flex items-start justify-between gap-4 animate-fade-in">
                              <span className="text-muted-foreground">{first.label}</span>
                              <span className="shrink-0 font-mono text-white">{fmt(first.amount)}</span>
                            </div>
                            {rest.length > 0 && (
                              <div
                                className="space-y-2 border-l-2 pl-3"
                                style={{ borderColor: `${cfg.color}40` }}
                              >
                                {rest.map((l) => (
                                  <div
                                    key={l.id}
                                    className="flex items-start justify-between gap-4 animate-fade-in"
                                  >
                                    <span className="text-muted-foreground">{l.label}</span>
                                    <span className="shrink-0 font-mono text-white">{fmt(l.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              <div className="my-5 h-px w-full bg-white/10" />

              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Total</span>
                <span className="font-display text-3xl font-bold text-gradient-vo">{fmt(total)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>10% advance to secure the order</span>
                <span className="font-mono">{fmt(advance)}</span>
              </div>

              <div className="mt-5 rounded-md border-l-2 border-l-[#3B82F6] bg-[#3B82F6]/[0.06] px-3 py-2.5">
                <p className="text-xs font-medium text-[#3B82F6]">
                  Payment options shown after your build is complete.
                </p>
              </div>

              {/* Friendly CTA line — appears inside the captured share image
                  where the action buttons would normally sit. */}
              <p className="mt-5 text-center text-sm italic text-white/80">
                Hi AnamDev — I want to discuss this custom build!
              </p>

              <div data-share-exclude className="mt-5">
                <ShareQuoteButton
                  targetRef={quoteCardRef}
                  filename="anamdev-custom-build-quote"
                  waMessage={quoteWaMessage}
                  label="Share Quote as Image"
                />
              </div>

              <div data-share-exclude className="mt-3 flex justify-center">
                <a
                  href="https://wa.me/8801777768353?text=Hi!%20I%20have%20a%20quick%20question%20about%20my%20custom%20build%20on%20the%20DFY%20Package%20Builder."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/60 bg-[#16181D] px-4 py-2 text-sm font-semibold text-[#25D366] transition-all hover:border-[#34E57A] hover:text-[#34E57A] hover:shadow-[0_0_14px_rgba(37,211,102,0.35)] hover:[text-shadow:0_0_12px_rgba(37,211,102,0.45)]"
                >
                  Get Instant Reply on WhatsApp
                  <MessageCircle className="h-4 w-4 transition-colors group-hover:text-[#34E57A]" aria-hidden />
                </a>
              </div>
            </div>
          </div>

          {visiblePromoCards.length > 0 &&
            visiblePromoCards.map((c) => <PromoCard key={c.id} card={c} />)}
        </div>
      </aside>
    </div>
  );
}
