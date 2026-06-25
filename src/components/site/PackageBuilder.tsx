import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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

type BuilderData = {
  techApproaches: TechApproach[];
  useCases: UseCase[];
  pricing: UseCasePricing[];
  tiers: Tier[];
  websiteOptions: BuilderOption[];
};

// ---------- Hook: load all data generically ----------
function useBuilderData() {
  const [data, setData] = useState<BuilderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tech, uc, price, tiers, opts] = await Promise.all([
          supabase
            .from("builder_tech_approaches")
            .select("*")
            .eq("is_active", true)
            .order("display_order"),
          supabase
            .from("builder_use_cases")
            .select("*")
            .eq("is_active", true)
            .order("display_order"),
          supabase.from("builder_use_case_pricing").select("*"),
          supabase
            .from("builder_tiers")
            .select("*")
            .eq("is_active", true)
            .order("display_order"),
          supabase
            .from("builder_options")
            .select("*")
            .eq("is_active", true)
            .eq("category_key", "website")
            .order("display_order"),
        ]);
        const firstErr = [tech, uc, price, tiers, opts].find((r) => r.error);
        if (firstErr?.error) throw firstErr.error;
        if (cancelled) return;
        setData({
          techApproaches: (tech.data ?? []) as TechApproach[],
          useCases: (uc.data ?? []) as UseCase[],
          pricing: (price.data ?? []) as UseCasePricing[],
          tiers: (tiers.data ?? []) as Tier[],
          websiteOptions: (opts.data ?? []) as BuilderOption[],
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
    case "business_website":
      return "Pages";
    case "landing_page":
      return "Sections";
    case "ecommerce":
      return "Products";
    case "lms":
      return "Courses";
    case "web_app":
      return "Modules";
    default:
      return "Scope";
  }
}
const OPTION_GROUP_LABELS: Record<string, string> = {
  design: "Design",
  cms: "CMS / Editing",
  language: "Language",
  hosting: "Hosting",
};

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
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[oklch(0.15_0.02_260)] p-5 sm:p-7">
      <Eyebrow>// {step}</Eyebrow>
      <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">
        {title}
      </h3>
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

// ---------- Main component ----------
export type PriceLine = { id: string; label: string; amount: number };

export function PackageBuilder() {
  const { data, error } = useBuilderData();

  // Step 1 state (no pricing impact)
  const [startingPoint, setStartingPoint] = useState<string>("");
  const [ideaDescription, setIdeaDescription] = useState<string>("");

  // Step 2 state
  const [techId, setTechId] = useState<string>("");
  const [useCaseId, setUseCaseId] = useState<string>("");
  const [tierId, setTierId] = useState<string>("");
  // sub-options: { [group]: optionId }
  const [subOptions, setSubOptions] = useState<Record<string, string>>({});

  // Derived: when tech changes, reset downstream if combo unavailable
  const techApproach = data?.techApproaches.find((t) => t.id === techId);
  const useCase = data?.useCases.find((u) => u.id === useCaseId);

  // pricing lookup for current tech + uc
  const currentPricing = useMemo(() => {
    if (!data || !techId || !useCaseId) return null;
    return (
      data.pricing.find(
        (p) => p.tech_approach_id === techId && p.use_case_id === useCaseId,
      ) ?? null
    );
  }, [data, techId, useCaseId]);

  // Reset use case if its combo with new tech is unavailable
  useEffect(() => {
    if (!data || !techId || !useCaseId) return;
    const combo = data.pricing.find(
      (p) => p.tech_approach_id === techId && p.use_case_id === useCaseId,
    );
    if (!combo || !combo.is_available) {
      setUseCaseId("");
      setTierId("");
    }
  }, [techId, data, useCaseId]);

  // Reset tier when use case changes
  useEffect(() => {
    setTierId("");
  }, [useCaseId]);

  // Pre-select default sub-options once data loads
  useEffect(() => {
    if (!data) return;
    const defaults: Record<string, string> = {};
    for (const o of data.websiteOptions) {
      if (o.is_default) {
        defaults[o.option_group] = o.id;
      }
    }
    setSubOptions((prev) => {
      const next = { ...defaults };
      for (const [k, v] of Object.entries(prev)) {
        if (v) next[k] = v;
      }
      return next;
    });
  }, [data]);

  const tiersForUseCase = useMemo(() => {
    if (!data || !useCaseId) return [];
    return data.tiers
      .filter((t) => t.use_case_id === useCaseId)
      .sort((a, b) => a.display_order - b.display_order);
  }, [data, useCaseId]);

  const optionsByGroup = useMemo(() => {
    if (!data) return {} as Record<string, BuilderOption[]>;
    const m: Record<string, BuilderOption[]> = {};
    for (const o of data.websiteOptions) {
      (m[o.option_group] ??= []).push(o);
    }
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => a.display_order - b.display_order);
    }
    return m;
  }, [data]);

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
    // sub-options
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
    return lines;
  }, [techApproach, useCase, currentPricing, tiersForUseCase, tierId, subOptions, data]);

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
              <SelectItem value="local_business">
                Existing local business
              </SelectItem>
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
          {/* Layer A — Tech approach */}
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
                  <div className="text-sm font-semibold text-white">
                    {t.label}
                  </div>
                  {t.description && (
                    <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {t.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Layer B — Use case */}
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
                      const p = data.pricing.find(
                        (x) =>
                          x.use_case_id === u.id &&
                          x.tech_approach_id === techId,
                      );
                      const available = !!p && p.is_available;
                      if (!available) return null;
                      return (
                        <SelectItem key={u.id} value={u.id}>
                          <span className="flex w-full items-center justify-between gap-4">
                            <span>{u.label}</span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {fmt(p!.base_price)}
                            </span>
                          </span>
                        </SelectItem>
                      );
                    })
                    .filter(Boolean)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Layer C — Tier */}
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

          {/* Layer D — Sub-options */}
          {tierId && Object.keys(optionsByGroup).length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Object.entries(optionsByGroup).map(([group, opts]) => (
                <div key={group}>
                  <FieldLabel>
                    {OPTION_GROUP_LABELS[group] ?? group}
                  </FieldLabel>
                  <Select
                    value={subOptions[group] ?? ""}
                    onValueChange={(v) =>
                      setSubOptions((prev) => ({ ...prev, [group]: v }))
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose…" />
                    </SelectTrigger>
                    <SelectContent>
                      {opts.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          <span className="flex w-full items-center justify-between gap-4">
                            <span>{o.label}</span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {o.price_delta > 0
                                ? `+${fmt(o.price_delta)}`
                                : "included"}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </StepCard>
      </div>

      {/* Live price sidebar */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-white/[0.08] bg-[oklch(0.15_0.02_260)] p-6">
          <Eyebrow>// LIVE QUOTE</Eyebrow>
          <h3 className="mt-2 text-lg font-semibold text-white">
            Your custom build
          </h3>

          <ul className="mt-5 space-y-3 text-sm">
            {priceLines.length === 0 ? (
              <li className="text-muted-foreground">
                Make selections to see your price build up live.
              </li>
            ) : (
              priceLines.map((l) => (
                <li
                  key={l.id}
                  className="flex items-start justify-between gap-4"
                >
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
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Total
            </span>
            <span className="font-display text-3xl font-bold text-gradient-vo">
              {fmt(total)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>10% advance to secure the order</span>
            <span className="font-mono">{fmt(advance)}</span>
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
            More steps (AI Agent, Podcast) and payment options are coming next —
            this quote will continue building as you add them.
          </p>
        </div>
      </aside>
    </div>
  );
}
