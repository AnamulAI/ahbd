import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import {
  BUILDER_PANELS,
  DEFAULT_BUILDER_PANEL,
  isBuilderPanel,
  type BuilderPanelKey,
} from "@/components/admin/BuilderSettingsSidebarSection";
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

export const Route = createFileRoute("/admin/builder-settings")({
  ssr: false,
  head: () => ({ meta: [{ title: "Builder Settings — AnamDev Admin" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    panel: isBuilderPanel(s.panel) ? s.panel : undefined,
  }),
  component: BuilderSettingsPage,
});

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
type BOption = {
  id: string;
  category_key: string;
  option_group: string;
  label: string;
  price_delta: number;
  input_type: string;
  is_default: boolean;
  display_order: number;
  is_active: boolean;
};
type AiType = {
  id: string;
  label: string;
  base_price: number;
  display_order: number;
  is_active: boolean;
};
type PodcastType = AiType;
type FeaturePill = { label: string; icon_name: string };
type PromoCard = {
  id: string;
  brand_name: string;
  brand_color: string;
  eyebrow_text: string;
  heading_prefix: string;
  description: string | null;
  cta_label: string;
  cta_url: string;
  feature_pills: FeaturePill[];
  visibility_condition: string;
  display_order: number;
  is_active: boolean;
};
type SignaturePackage = {
  id: string;
  web_dev_label: string;
  web_dev_price: number;
  ai_integrator_label: string;
  ai_integrator_price: number;
  podcast_label: string;
  podcast_price: number;
  bundle_price: number;
  disclosure_text: string;
  whats_included: string[];
  cta_label: string;
};
type PaymentPlanSettings = {
  id: string;
  installment_count: number;
  pay_in_full_discount_percent: number;
  advance_percent: number;
  installments_label: string;
  pay_in_full_label: string;
  milestone_label: string;
};
type BuilderCopyRow = {
  id: string;
  key: string;
  value: string;
  label: string;
  group_key: string;
  display_order: number;
};


const OPTION_GROUP_LABELS: Record<string, string> = {
  design: "Design",
  cms: "CMS",
  language: "Language",
  hosting: "Hosting",
  ai_where: "AI Where (multi-select)",
  ai_language: "AI Language",
  ai_volume: "AI Volume",
  ai_knowledge: "AI Knowledge",
  podcast_frequency: "Frequency",
  podcast_length: "Episode Length",
  podcast_platform: "Platform",
  podcast_format: "Format",
  podcast_addon: "Add-ons",
};

const WEBSITE_GROUPS = ["design", "cms", "language", "hosting"];
const AI_GROUPS = ["ai_where", "ai_language", "ai_volume", "ai_knowledge"];
const PODCAST_GROUPS = [
  "podcast_frequency",
  "podcast_length",
  "podcast_platform",
  "podcast_format",
  "podcast_addon",
];

const VISIBILITY_OPTIONS = [
  { value: "always", label: "Always" },
  { value: "hosting_self_managed", label: "Hosting: Self-Managed" },
  { value: "tech_approach_custom", label: "Tech Approach: Custom" },
];

// ---------- Page ----------
function BuilderSettingsPage() {
  const gate = useAdminGate();
  const [loading, setLoading] = useState(true);

  const [techApproaches, setTechApproaches] = useState<TechApproach[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [pricing, setPricing] = useState<UseCasePricing[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [options, setOptions] = useState<BOption[]>([]);
  const [aiTypes, setAiTypes] = useState<AiType[]>([]);
  const [podcastTypes, setPodcastTypes] = useState<PodcastType[]>([]);
  const [promoCards, setPromoCards] = useState<PromoCard[]>([]);
  const [signature, setSignature] = useState<SignaturePackage | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlanSettings | null>(null);
  const [copy, setCopy] = useState<BuilderCopyRow[]>([]);


  async function loadAll() {
    const [ta, uc, pr, ti, op, ai, pd, pc, sg, pp, cp] = await Promise.all([
      supabase.from("builder_tech_approaches").select("*").order("display_order"),
      supabase.from("builder_use_cases").select("*").order("display_order"),
      supabase.from("builder_use_case_pricing").select("*"),
      supabase.from("builder_tiers").select("*").order("display_order"),
      supabase.from("builder_options").select("*").order("display_order"),
      supabase.from("builder_ai_types").select("*").order("display_order"),
      supabase.from("builder_podcast_types").select("*").order("display_order"),
      supabase.from("builder_promo_cards").select("*").order("display_order"),
      supabase.from("signature_package_settings" as never).select("*").limit(1).maybeSingle(),
      supabase.from("payment_plan_settings" as never).select("*").limit(1).maybeSingle(),
      supabase.from("builder_copy" as never).select("*").order("display_order"),
    ]);
    for (const r of [ta, uc, pr, ti, op, ai, pd, pc, sg, pp, cp]) {
      if (r.error) {
        toast.error(r.error.message);
        return;
      }
    }
    setTechApproaches((ta.data ?? []) as TechApproach[]);
    setUseCases((uc.data ?? []) as UseCase[]);
    setPricing((pr.data ?? []) as UseCasePricing[]);
    setTiers((ti.data ?? []) as Tier[]);
    setOptions((op.data ?? []) as BOption[]);
    setAiTypes((ai.data ?? []) as AiType[]);
    setPodcastTypes((pd.data ?? []) as PodcastType[]);
    setPromoCards(
      ((pc.data ?? []) as unknown[]).map((row) => {
        const r = row as Record<string, unknown>;
        return {
          ...(r as object),
          feature_pills: Array.isArray(r.feature_pills)
            ? (r.feature_pills as FeaturePill[])
            : [],
        } as PromoCard;
      }),
    );
    if (sg.data) {
      const r = sg.data as Record<string, unknown>;
      setSignature({
        ...(r as object),
        whats_included: Array.isArray(r.whats_included)
          ? (r.whats_included as string[])
          : [],
      } as SignaturePackage);
    }
    if (pp.data) setPaymentPlan(pp.data as PaymentPlanSettings);
    setCopy(((cp.data ?? []) as unknown[]) as BuilderCopyRow[]);
    setLoading(false);
  }



  useEffect(() => {
    if (gate.status === "ok") loadAll();
  }, [gate.status]);

  if (gate.status !== "ok" || loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const searchPanel = Route.useSearch().panel;
  const panel: BuilderPanelKey = searchPanel ?? DEFAULT_BUILDER_PANEL;
  const crumbs = BUILDER_PANELS[panel].crumbs;

  return (
    <AdminShell email={gate.email}>
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-white/45"
      >
        <Link to="/admin/builder-settings" className="hover:text-white/80">
          Builder Settings
        </Link>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-white/25" />
            <span className={i === crumbs.length - 1 ? "text-white/85" : "hover:text-white/80"}>
              {c}
            </span>
          </span>
        ))}
      </nav>

      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          {crumbs[crumbs.length - 1]}
        </h1>
      </header>

      <div className="space-y-8">
        {(panel === "website:tech" ||
          panel === "website:usecases" ||
          panel === "website:tiers" ||
          panel === "website:suboptions") && (
          <WebsiteTab
            panel={panel}
            techApproaches={techApproaches}
            setTechApproaches={setTechApproaches}
            useCases={useCases}
            setUseCases={setUseCases}
            pricing={pricing}
            setPricing={setPricing}
            tiers={tiers}
            setTiers={setTiers}
            options={options}
            setOptions={setOptions}
          />
        )}

        {(panel === "ai:types" || panel === "ai:suboptions") && (
          <AiTab
            panel={panel}
            aiTypes={aiTypes}
            setAiTypes={setAiTypes}
            options={options}
            setOptions={setOptions}
          />
        )}

        {(panel === "podcast:types" || panel === "podcast:suboptions") && (
          <PodcastTab
            panel={panel}
            podcastTypes={podcastTypes}
            setPodcastTypes={setPodcastTypes}
            options={options}
            setOptions={setOptions}
          />
        )}

        {panel === "promo" && (
          <PromoTab promoCards={promoCards} setPromoCards={setPromoCards} />
        )}

        {(panel === "package:signature" ||
          panel === "package:payment" ||
          panel === "package:copy") && (
          <PackagePaymentTab
            panel={panel}
            signature={signature}
            setSignature={setSignature}
            paymentPlan={paymentPlan}
            setPaymentPlan={setPaymentPlan}
            copy={copy}
            setCopy={setCopy}
          />
        )}
      </div>
    </AdminShell>
  );
}

// ---------- Shared building blocks ----------

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#11162A] shadow-[inset_3px_0_0_0_#3B82F6]">
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] bg-gradient-to-r from-[#3B82F6]/12 via-[#3B82F6]/[0.03] to-transparent px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-white tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-white/55">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/85 hover:bg-white/[0.08] hover:text-white"
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function TextField({
  value,
  onSave,
  placeholder,
  className,
  type = "text",
}: {
  value: string | number | null;
  onSave: (v: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
  type?: "text" | "number";
}) {
  const [v, setV] = useState(value == null ? "" : String(value));
  useEffect(() => {
    setV(value == null ? "" : String(value));
  }, [value]);
  return (
    <input
      type={type}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        if (v !== (value == null ? "" : String(value))) onSave(v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      placeholder={placeholder}
      className={`rounded-md border border-white/[0.1] bg-[#16181D] px-2 py-1 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none ${
        className ?? ""
      }`}
    />
  );
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          value ? "bg-[#3B82F6]" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            value ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
      {label && <span className="text-xs text-white/65">{label}</span>}
    </label>
  );
}

function DeleteBtn({ onConfirm, label = "Delete?" }: { onConfirm: () => void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:bg-red-500/10 hover:text-red-400"
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-[#0F1320] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{label}</AlertDialogTitle>
            <AlertDialogDescription className="text-white/55">
              This will permanently remove this item. The live builder will reflect this immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ---------- DB helpers ----------
async function patch<T>(
  table: string,
  id: string,
  patch: Partial<T>,
  onError?: () => void,
) {
  const { error } = await supabase.from(table as never).update(patch as never).eq("id", id);
  if (error) {
    toast.error(error.message);
    onError?.();
    return false;
  }
  toast.success("Saved", { duration: 1200 });
  return true;
}

async function insertRow<T>(table: string, row: Partial<T>): Promise<T | null> {
  const { data, error } = await supabase.from(table as never).insert(row as never).select().single();
  if (error) {
    toast.error(error.message);
    return null;
  }
  toast.success("Added", { duration: 1200 });
  return data as T;
}

async function deleteRow(table: string, id: string) {
  const { error } = await supabase.from(table as never).delete().eq("id", id);
  if (error) {
    toast.error(error.message);
    return false;
  }
  toast.success("Deleted", { duration: 1200 });
  return true;
}

// ---------- WEBSITE TAB ----------
function WebsiteTab({
  panel,
  techApproaches,
  setTechApproaches,
  useCases,
  setUseCases,
  pricing,
  setPricing,
  tiers,
  setTiers,
  options,
  setOptions,
}: {
  panel: BuilderPanelKey;
  techApproaches: TechApproach[];
  setTechApproaches: React.Dispatch<React.SetStateAction<TechApproach[]>>;
  useCases: UseCase[];
  setUseCases: React.Dispatch<React.SetStateAction<UseCase[]>>;
  pricing: UseCasePricing[];
  setPricing: React.Dispatch<React.SetStateAction<UseCasePricing[]>>;
  tiers: Tier[];
  setTiers: React.Dispatch<React.SetStateAction<Tier[]>>;
  options: BOption[];
  setOptions: React.Dispatch<React.SetStateAction<BOption[]>>;
}) {
  // --- Tech Approaches ---
  async function addTech() {
    const row = await insertRow<TechApproach>("builder_tech_approaches", {
      key: `new_${Date.now()}`,
      label: "New Tech Approach",
      description: "",
      display_order: techApproaches.length + 1,
      is_active: true,
    });
    if (row) setTechApproaches((prev) => [...prev, row]);
  }
  async function updateTech(id: string, p: Partial<TechApproach>) {
    setTechApproaches((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));
    await patch<TechApproach>("builder_tech_approaches", id, p);
  }
  async function delTech(id: string) {
    if (await deleteRow("builder_tech_approaches", id)) {
      setTechApproaches((prev) => prev.filter((t) => t.id !== id));
    }
  }

  // --- Use cases ---
  async function addUseCase() {
    const row = await insertRow<UseCase>("builder_use_cases", {
      key: `new_${Date.now()}`,
      label: "New Use Case",
      display_order: useCases.length + 1,
      is_active: true,
    });
    if (row) setUseCases((prev) => [...prev, row]);
  }
  async function updateUseCase(id: string, p: Partial<UseCase>) {
    setUseCases((prev) => prev.map((u) => (u.id === id ? { ...u, ...p } : u)));
    await patch<UseCase>("builder_use_cases", id, p);
  }
  async function delUseCase(id: string) {
    if (await deleteRow("builder_use_cases", id)) {
      setUseCases((prev) => prev.filter((u) => u.id !== id));
      setPricing((prev) => prev.filter((p) => p.use_case_id !== id));
      setTiers((prev) => prev.filter((t) => t.use_case_id !== id));
    }
  }

  // --- Pricing ---
  async function upsertPricing(useCaseId: string, techId: string, p: Partial<UseCasePricing>) {
    const existing = pricing.find(
      (x) => x.use_case_id === useCaseId && x.tech_approach_id === techId,
    );
    if (existing) {
      setPricing((prev) =>
        prev.map((x) => (x.id === existing.id ? { ...x, ...p } : x)),
      );
      await patch<UseCasePricing>("builder_use_case_pricing", existing.id, p);
    } else {
      const row = await insertRow<UseCasePricing>("builder_use_case_pricing", {
        use_case_id: useCaseId,
        tech_approach_id: techId,
        base_price: 0,
        is_available: true,
        ...p,
      });
      if (row) setPricing((prev) => [...prev, row]);
    }
  }

  // --- Tiers ---
  async function addTier(useCaseId: string) {
    const existing = tiers.filter((t) => t.use_case_id === useCaseId);
    const row = await insertRow<Tier>("builder_tiers", {
      use_case_id: useCaseId,
      label: "New Tier",
      price_delta: 0,
      display_order: existing.length + 1,
      is_active: true,
    });
    if (row) setTiers((prev) => [...prev, row]);
  }
  async function updateTier(id: string, p: Partial<Tier>) {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));
    await patch<Tier>("builder_tiers", id, p);
  }
  async function delTier(id: string) {
    if (await deleteRow("builder_tiers", id)) {
      setTiers((prev) => prev.filter((t) => t.id !== id));
    }
  }
  async function moveTier(id: string, dir: -1 | 1) {
    const tier = tiers.find((t) => t.id === id);
    if (!tier) return;
    const siblings = tiers
      .filter((t) => t.use_case_id === tier.use_case_id)
      .sort((a, b) => a.display_order - b.display_order);
    const idx = siblings.findIndex((s) => s.id === id);
    const swap = siblings[idx + dir];
    if (!swap) return;
    await Promise.all([
      updateTier(id, { display_order: swap.display_order }),
      updateTier(swap.id, { display_order: tier.display_order }),
    ]);
  }

  return (
    <>
      {panel === "website:tech" && (
      /* Tech Approaches */
      <Section
        title="Tech Approaches"
        description="The two tracks customers can choose to build on."
        action={<AddButton onClick={addTech} label="Add Tech Approach" />}
      >
        <div className="space-y-2">
          {techApproaches.map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-white/[0.06] border-l-2 border-l-[#F97316]/50 bg-[#0B0F1A] p-3"
            >
              <TextField
                value={t.label}
                onSave={(v) => updateTech(t.id, { label: v })}
                className="w-44"
              />
              <TextField
                value={t.description}
                onSave={(v) => updateTech(t.id, { description: v })}
                placeholder="Description"
                className="flex-1 min-w-[200px]"
              />
              <Toggle
                value={t.is_active}
                onChange={(v) => updateTech(t.id, { is_active: v })}
                label="Active"
              />
              <DeleteBtn onConfirm={() => delTech(t.id)} label="Delete tech approach?" />
            </div>
          ))}
        </div>
      </Section>
      )}

      {panel === "website:usecases" && (
      /* Use Cases & Pricing */
      <Section
        title="Use Cases & Pricing"
        description="Per use case, edit base price for each tech approach."
        action={<AddButton onClick={addUseCase} label="Add Use Case" />}
      >
        <div className="space-y-3">
          {useCases.map((uc) => (
            <UseCaseCard
              key={uc.id}
              useCase={uc}
              techApproaches={techApproaches}
              pricing={pricing}
              onUpdateUseCase={(p) => updateUseCase(uc.id, p)}
              onUpsertPricing={(techId, p) => upsertPricing(uc.id, techId, p)}
              onDelete={() => delUseCase(uc.id)}
            />
          ))}
        </div>
      </Section>
      )}

      {panel === "website:tiers" && (
      /* Scope Tiers */
      <Section
        title="Scope Tiers"
        description="Per use case, granular scope-based pricing add-ons."
      >
        <div className="space-y-4">
          {useCases.map((uc) => {
            const myTiers = tiers
              .filter((t) => t.use_case_id === uc.id)
              .sort((a, b) => a.display_order - b.display_order);
            return (
              <div key={uc.id} className="rounded-md border border-white/[0.06] border-l-2 border-l-[#F97316]/50 bg-[#0B0F1A] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]">
                    {uc.label}
                  </div>
                  <AddButton onClick={() => addTier(uc.id)} label="Add Tier" />
                </div>
                <div className="space-y-1.5">
                  {myTiers.length === 0 && (
                    <div className="text-xs text-white/35">No tiers yet.</div>
                  )}
                  {myTiers.map((t, i) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => moveTier(t.id, -1)}
                          className="text-white/40 hover:text-white disabled:opacity-20"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={i === myTiers.length - 1}
                          onClick={() => moveTier(t.id, 1)}
                          className="text-white/40 hover:text-white disabled:opacity-20"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <TextField
                        value={t.label}
                        onSave={(v) => updateTier(t.id, { label: v })}
                        className="flex-1 min-w-[180px]"
                      />
                      <div className="flex items-center gap-1 text-white/55 text-xs">
                        +$
                        <TextField
                          type="number"
                          value={t.price_delta}
                          onSave={(v) => updateTier(t.id, { price_delta: Number(v) || 0 })}
                          className="w-24"
                        />
                      </div>
                      <Toggle
                        value={t.is_active}
                        onChange={(v) => updateTier(t.id, { is_active: v })}
                      />
                      <DeleteBtn onConfirm={() => delTier(t.id)} label="Delete tier?" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
      )}

      {panel === "website:suboptions" && (
      /* Sub-Options */
      <Section
        title="Sub-Options"
        description="Add-on selections for website builds."
      >
        <OptionGroupsEditor
          categoryKey="website"
          groups={WEBSITE_GROUPS}
          options={options}
          setOptions={setOptions}
        />
      </Section>
      )}
    </>
  );
}

function UseCaseCard({
  useCase,
  techApproaches,
  pricing,
  onUpdateUseCase,
  onUpsertPricing,
  onDelete,
}: {
  useCase: UseCase;
  techApproaches: TechApproach[];
  pricing: UseCasePricing[];
  onUpdateUseCase: (p: Partial<UseCase>) => void;
  onUpsertPricing: (techId: string, p: Partial<UseCasePricing>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-white/[0.06] bg-[#16181D]">
      <div className="flex flex-wrap items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-white/40 hover:text-white"
          aria-label="Toggle"
        >
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <TextField
          value={useCase.label}
          onSave={(v) => onUpdateUseCase({ label: v })}
          className="flex-1 min-w-[200px]"
        />
        <Toggle
          value={useCase.is_active}
          onChange={(v) => onUpdateUseCase({ is_active: v })}
          label="Active"
        />
        <DeleteBtn onConfirm={onDelete} label="Delete use case?" />
      </div>
      {open && (
        <div className="border-t border-white/[0.06] p-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]/80">
            Base Price per Tech Approach
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {techApproaches.map((t) => {
              const row = pricing.find(
                (p) => p.use_case_id === useCase.id && p.tech_approach_id === t.id,
              );
              return (
                <div
                  key={t.id}
                  className="rounded-md border border-white/[0.08] bg-[#0F1320] p-2.5"
                >
                  <div className="mb-1.5 text-xs font-medium text-white">{t.label}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/55">$</span>
                    <TextField
                      type="number"
                      value={row?.base_price ?? 0}
                      onSave={(v) => onUpsertPricing(t.id, { base_price: Number(v) || 0 })}
                      className="flex-1"
                    />
                    <Toggle
                      value={row?.is_available ?? true}
                      onChange={(v) => onUpsertPricing(t.id, { is_available: v })}
                      label="Avail."
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Options Editor (shared) ----------
function OptionGroupsEditor({
  categoryKey,
  groups,
  options,
  setOptions,
}: {
  categoryKey: string;
  groups: string[];
  options: BOption[];
  setOptions: React.Dispatch<React.SetStateAction<BOption[]>>;
}) {
  async function addOption(group: string) {
    const existing = options.filter(
      (o) => o.category_key === categoryKey && o.option_group === group,
    );
    const row = await insertRow<BOption>("builder_options", {
      category_key: categoryKey,
      option_group: group,
      label: "New Option",
      price_delta: 0,
      input_type: "select",
      is_default: existing.length === 0,
      display_order: existing.length + 1,
      is_active: true,
    });
    if (row) setOptions((prev) => [...prev, row]);
  }

  async function updateOption(id: string, p: Partial<BOption>) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...p } : o)));
    await patch<BOption>("builder_options", id, p);
  }

  async function setDefault(id: string, group: string) {
    // Unset other defaults in this group, then set this one.
    const peers = options.filter(
      (o) =>
        o.category_key === categoryKey &&
        o.option_group === group &&
        o.id !== id &&
        o.is_default,
    );
    setOptions((prev) =>
      prev.map((o) => {
        if (o.category_key !== categoryKey || o.option_group !== group) return o;
        return { ...o, is_default: o.id === id };
      }),
    );
    await Promise.all([
      ...peers.map((p) => patch<BOption>("builder_options", p.id, { is_default: false })),
      patch<BOption>("builder_options", id, { is_default: true }),
    ]);
  }

  async function delOption(id: string) {
    if (await deleteRow("builder_options", id)) {
      setOptions((prev) => prev.filter((o) => o.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const groupOpts = options
          .filter((o) => o.category_key === categoryKey && o.option_group === g)
          .sort((a, b) => a.display_order - b.display_order);
        return (
          <div key={g} className="rounded-md border border-white/[0.06] border-l-2 border-l-[#F97316]/50 bg-[#0B0F1A] p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]">
                {OPTION_GROUP_LABELS[g] ?? g}
              </div>
              <AddButton onClick={() => addOption(g)} label="Add Option" />
            </div>
            <div className="space-y-1.5">
              {groupOpts.length === 0 && (
                <div className="text-xs text-white/35">No options.</div>
              )}
              {groupOpts.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center gap-2">
                  <TextField
                    value={o.label}
                    onSave={(v) => updateOption(o.id, { label: v })}
                    className="flex-1 min-w-[160px]"
                  />
                  <div className="flex items-center gap-1 text-white/55 text-xs">
                    +$
                    <TextField
                      type="number"
                      value={o.price_delta}
                      onSave={(v) => updateOption(o.id, { price_delta: Number(v) || 0 })}
                      className="w-24"
                    />
                  </div>
                  <label className="inline-flex items-center gap-1.5 text-xs text-white/65 cursor-pointer">
                    <input
                      type="radio"
                      checked={o.is_default}
                      onChange={() => setDefault(o.id, g)}
                      className="accent-[#3B82F6]"
                    />
                    Default
                  </label>
                  <Toggle
                    value={o.is_active}
                    onChange={(v) => updateOption(o.id, { is_active: v })}
                  />
                  <DeleteBtn onConfirm={() => delOption(o.id)} label="Delete option?" />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- AI TAB ----------
function AiTab({
  panel,
  aiTypes,
  setAiTypes,
  options,
  setOptions,
}: {
  panel: BuilderPanelKey;
  aiTypes: AiType[];
  setAiTypes: React.Dispatch<React.SetStateAction<AiType[]>>;
  options: BOption[];
  setOptions: React.Dispatch<React.SetStateAction<BOption[]>>;
}) {
  async function add() {
    const row = await insertRow<AiType>("builder_ai_types", {
      label: "New AI Type",
      base_price: 0,
      display_order: aiTypes.length + 1,
      is_active: true,
    });
    if (row) setAiTypes((prev) => [...prev, row]);
  }
  async function update(id: string, p: Partial<AiType>) {
    setAiTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));
    await patch<AiType>("builder_ai_types", id, p);
  }
  async function del(id: string) {
    if (await deleteRow("builder_ai_types", id)) {
      setAiTypes((prev) => prev.filter((t) => t.id !== id));
    }
  }
  return (
    <>
      {panel === "ai:types" && (
      <Section
        title="AI Types"
        description="The core AI offerings customers can pick."
        action={<AddButton onClick={add} label="Add AI Type" />}
      >
        <TypeList items={aiTypes} onUpdate={update} onDelete={del} />
      </Section>
      )}
      {panel === "ai:suboptions" && (
      <Section
        title="Sub-Options"
        description="AI add-ons grouped by configuration area."
      >
        <OptionGroupsEditor
          categoryKey="ai_agent"
          groups={AI_GROUPS}
          options={options}
          setOptions={setOptions}
        />
      </Section>
      )}
    </>
  );
}

// ---------- PODCAST TAB ----------
function PodcastTab({
  panel,
  podcastTypes,
  setPodcastTypes,
  options,
  setOptions,
}: {
  panel: BuilderPanelKey;
  podcastTypes: PodcastType[];
  setPodcastTypes: React.Dispatch<React.SetStateAction<PodcastType[]>>;
  options: BOption[];
  setOptions: React.Dispatch<React.SetStateAction<BOption[]>>;
}) {
  async function add() {
    const row = await insertRow<PodcastType>("builder_podcast_types", {
      label: "New Podcast Type",
      base_price: 0,
      display_order: podcastTypes.length + 1,
      is_active: true,
    });
    if (row) setPodcastTypes((prev) => [...prev, row]);
  }
  async function update(id: string, p: Partial<PodcastType>) {
    setPodcastTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));
    await patch<PodcastType>("builder_podcast_types", id, p);
  }
  async function del(id: string) {
    if (await deleteRow("builder_podcast_types", id)) {
      setPodcastTypes((prev) => prev.filter((t) => t.id !== id));
    }
  }
  return (
    <>
      {panel === "podcast:types" && (
      <Section
        title="Podcast Types"
        description="The headline podcast offerings."
        action={<AddButton onClick={add} label="Add Podcast Type" />}
      >
        <TypeList items={podcastTypes} onUpdate={update} onDelete={del} />
      </Section>
      )}
      {panel === "podcast:suboptions" && (
      <Section
        title="Sub-Options"
        description="Podcast configuration choices."
      >
        <OptionGroupsEditor
          categoryKey="podcast"
          groups={PODCAST_GROUPS}
          options={options}
          setOptions={setOptions}
        />
      </Section>
      )}
    </>
  );
}

function TypeList({
  items,
  onUpdate,
  onDelete,
}: {
  items: AiType[];
  onUpdate: (id: string, p: Partial<AiType>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((t) => (
        <div
          key={t.id}
          className="flex flex-wrap items-center gap-2 rounded-md border border-white/[0.06] border-l-2 border-l-[#F97316]/50 bg-[#0B0F1A] p-3"
        >
          <TextField
            value={t.label}
            onSave={(v) => onUpdate(t.id, { label: v })}
            className="flex-1 min-w-[200px]"
          />
          <div className="flex items-center gap-1 text-white/55 text-xs">
            Base $
            <TextField
              type="number"
              value={t.base_price}
              onSave={(v) => onUpdate(t.id, { base_price: Number(v) || 0 })}
              className="w-28"
            />
          </div>
          <Toggle
            value={t.is_active}
            onChange={(v) => onUpdate(t.id, { is_active: v })}
            label="Active"
          />
          <DeleteBtn onConfirm={() => onDelete(t.id)} label="Delete type?" />
        </div>
      ))}
    </div>
  );
}

// ---------- PROMO TAB ----------
function PromoTab({
  promoCards,
  setPromoCards,
}: {
  promoCards: PromoCard[];
  setPromoCards: React.Dispatch<React.SetStateAction<PromoCard[]>>;
}) {
  async function add() {
    const row = await insertRow<PromoCard>("builder_promo_cards", {
      brand_name: "New Partner",
      brand_color: "#3B82F6",
      eyebrow_text: "// RECOMMENDED",
      heading_prefix: "We Recommend",
      description: "",
      cta_label: "Learn more",
      cta_url: "https://",
      feature_pills: [],
      visibility_condition: "always",
      display_order: promoCards.length + 1,
      is_active: true,
    });
    if (row) setPromoCards((prev) => [...prev, { ...row, feature_pills: row.feature_pills ?? [] }]);
  }

  async function update(id: string, p: Partial<PromoCard>) {
    setPromoCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...p } : c)));
    await patch<PromoCard>("builder_promo_cards", id, p);
  }

  async function del(id: string) {
    if (await deleteRow("builder_promo_cards", id)) {
      setPromoCards((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <Section
      title="Promo Cards"
      description="Partner cards shown contextually inside the builder."
      action={<AddButton onClick={add} label="Add Promo Card" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {promoCards.map((c) => (
          <PromoCardEditor
            key={c.id}
            card={c}
            onUpdate={(p) => update(c.id, p)}
            onDelete={() => del(c.id)}
          />
        ))}
      </div>
    </Section>
  );
}

function PromoCardEditor({
  card,
  onUpdate,
  onDelete,
}: {
  card: PromoCard;
  onUpdate: (p: Partial<PromoCard>) => void;
  onDelete: () => void;
}) {
  const pills = card.feature_pills ?? [];

  function updatePills(next: FeaturePill[]) {
    onUpdate({ feature_pills: next });
  }

  return (
    <div className="rounded-md border border-white/[0.08] border-l-2 border-l-[#F97316]/50 bg-[#0B0F1A] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-5 w-5 rounded-full border border-white/15"
            style={{ background: card.brand_color }}
          />
          <TextField
            value={card.brand_name}
            onSave={(v) => onUpdate({ brand_name: v })}
            className="font-semibold"
          />
        </div>
        <div className="flex items-center gap-2">
          <Toggle
            value={card.is_active}
            onChange={(v) => onUpdate({ is_active: v })}
            label="Active"
          />
          <DeleteBtn onConfirm={onDelete} label="Delete promo card?" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Labeled label="Brand color">
          <input
            type="color"
            value={card.brand_color}
            onChange={(e) => onUpdate({ brand_color: e.target.value })}
            className="h-8 w-full rounded-md bg-transparent border border-white/10"
          />
        </Labeled>
        <Labeled label="Visibility">
          <select
            value={card.visibility_condition}
            onChange={(e) => onUpdate({ visibility_condition: e.target.value })}
            className="w-full rounded-md border border-white/[0.1] bg-[#0F1320] px-2 py-1.5 text-sm text-white"
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </Labeled>
        <Labeled label="Eyebrow">
          <TextField
            value={card.eyebrow_text}
            onSave={(v) => onUpdate({ eyebrow_text: v })}
            className="w-full"
          />
        </Labeled>
        <Labeled label="Heading prefix">
          <TextField
            value={card.heading_prefix}
            onSave={(v) => onUpdate({ heading_prefix: v })}
            className="w-full"
          />
        </Labeled>
        <Labeled label="CTA label">
          <TextField
            value={card.cta_label}
            onSave={(v) => onUpdate({ cta_label: v })}
            className="w-full"
          />
        </Labeled>
        <Labeled label="CTA URL">
          <TextField
            value={card.cta_url}
            onSave={(v) => onUpdate({ cta_url: v })}
            className="w-full"
          />
        </Labeled>
      </div>

      <Labeled label="Description">
        <textarea
          defaultValue={card.description ?? ""}
          onBlur={(e) => {
            if (e.target.value !== (card.description ?? "")) {
              onUpdate({ description: e.target.value });
            }
          }}
          rows={2}
          className="w-full rounded-md border border-white/[0.1] bg-[#0F1320] px-2 py-1.5 text-sm text-white"
        />
      </Labeled>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]">
            Feature Pills
          </span>
          <button
            type="button"
            onClick={() => updatePills([...pills, { label: "New", icon_name: "Sparkles" }])}
            className="inline-flex items-center gap-1 text-[11px] text-white/65 hover:text-white"
          >
            <Plus className="h-3 w-3" /> Add pill
          </button>
        </div>
        <div className="space-y-1.5">
          {pills.length === 0 && (
            <div className="text-xs text-white/35">No pills.</div>
          )}
          {pills.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <TextField
                value={p.label}
                onSave={(v) => {
                  const next = [...pills];
                  next[i] = { ...next[i], label: v };
                  updatePills(next);
                }}
                placeholder="Label"
                className="flex-1"
              />
              <TextField
                value={p.icon_name}
                onSave={(v) => {
                  const next = [...pills];
                  next[i] = { ...next[i], icon_name: v };
                  updatePills(next);
                }}
                placeholder="Icon (lucide)"
                className="w-36"
              />
              <button
                type="button"
                onClick={() => updatePills(pills.filter((_, j) => j !== i))}
                className="text-white/40 hover:text-red-400"
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]/80">
        {label}
      </label>
      {children}
    </div>
  );
}

// ---------- PACKAGE & PAYMENT TAB ----------
function PackagePaymentTab({
  panel,
  signature,
  setSignature,
  paymentPlan,
  setPaymentPlan,
  copy,
  setCopy,
}: {
  panel: BuilderPanelKey;
  signature: SignaturePackage | null;
  setSignature: React.Dispatch<React.SetStateAction<SignaturePackage | null>>;
  paymentPlan: PaymentPlanSettings | null;
  setPaymentPlan: React.Dispatch<React.SetStateAction<PaymentPlanSettings | null>>;
  copy: BuilderCopyRow[];
  setCopy: React.Dispatch<React.SetStateAction<BuilderCopyRow[]>>;
}) {

  if (!signature || !paymentPlan) {
    return (
      <div className="text-sm text-white/55">
        Settings rows not found. Please run the latest migration.
      </div>
    );
  }

  // ---- Signature package helpers ----
  const totalValue =
    Number(signature.web_dev_price ?? 0) +
    Number(signature.ai_integrator_price ?? 0) +
    Number(signature.podcast_price ?? 0);
  const savings = totalValue - Number(signature.bundle_price ?? 0);

  async function updateSig(patchObj: Partial<SignaturePackage>) {
    const next = { ...(signature as SignaturePackage), ...patchObj };
    setSignature(next);
    await patch<SignaturePackage>(
      "signature_package_settings",
      signature!.id,
      patchObj,
      () => setSignature(signature),
    );
  }

  async function updatePlan(patchObj: Partial<PaymentPlanSettings>) {
    const next = { ...(paymentPlan as PaymentPlanSettings), ...patchObj };
    setPaymentPlan(next);
    await patch<PaymentPlanSettings>(
      "payment_plan_settings",
      paymentPlan!.id,
      patchObj,
      () => setPaymentPlan(paymentPlan),
    );
  }

  const items = signature.whats_included ?? [];

  function setItems(next: string[]) {
    updateSig({ whats_included: next });
  }

  return (
    <>
      {panel === "package:signature" && (
      <Section
        title="Signature Package ($4,990 offer)"
        description="Controls the Home page's Pricing Reveal Card. Total value is derived from the three line items; savings is derived from total minus bundle price."
      >
        <div className="space-y-6">
          {/* Value Stack */}
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]/80">
              Value Stack
            </div>
            <div className="space-y-2">
              {(
                [
                  { lk: "web_dev_label", pk: "web_dev_price" },
                  { lk: "ai_integrator_label", pk: "ai_integrator_price" },
                  { lk: "podcast_label", pk: "podcast_price" },
                ] as const
              ).map((row) => (
                <div
                  key={row.lk}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px]"
                >
                  <TextField
                    value={signature[row.lk] as string}
                    onSave={(v) => updateSig({ [row.lk]: v } as Partial<SignaturePackage>)}
                  />
                  <TextField
                    type="number"
                    value={signature[row.pk] as number}
                    onSave={(v) =>
                      updateSig({ [row.pk]: Number(v) || 0 } as Partial<SignaturePackage>)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-lg border border-white/[0.08] border-l-2 border-l-[#F97316]/50 bg-[#0B0F1A] p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]/80">
                Total Value (auto)
              </span>
              <span className="font-mono text-white">${totalValue.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px] items-center">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]/80">
                Bundle Price
              </span>
              <TextField
                type="number"
                value={signature.bundle_price}
                onSave={(v) => updateSig({ bundle_price: Number(v) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]/80">
                Savings (auto)
              </span>
              <span
                className={`font-mono ${
                  savings >= 0 ? "text-[#F97316]" : "text-red-400"
                }`}
              >
                ${savings.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Disclosure */}
          <Labeled label="Disclosure Text">
            <textarea
              defaultValue={signature.disclosure_text}
              onBlur={(e) => {
                if (e.target.value !== signature.disclosure_text)
                  updateSig({ disclosure_text: e.target.value });
              }}
              rows={3}
              className="w-full rounded-md border border-white/[0.1] bg-[#16181D] px-2 py-1.5 text-sm text-white focus:border-[#3B82F6]/60 focus:outline-none"
            />
          </Labeled>

          {/* What's Included */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]/80">
                What's Included (checklist)
              </div>
              <AddButton
                label="Add item"
                onClick={() => setItems([...items, "New item"])}
              />
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-white/35 w-5">
                    {idx + 1}.
                  </span>
                  <TextField
                    value={item}
                    onSave={(v) => {
                      const next = [...items];
                      next[idx] = v;
                      setItems(next);
                    }}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => {
                      const next = [...items];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      setItems(next);
                    }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/45 hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => {
                      const next = [...items];
                      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                      setItems(next);
                    }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/45 hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <DeleteBtn
                    label="Remove checklist item?"
                    onConfirm={() => setItems(items.filter((_, i) => i !== idx))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Labeled label="CTA Button Label">
            <TextField
              value={signature.cta_label}
              onSave={(v) => updateSig({ cta_label: v })}
              className="w-full max-w-sm"
            />
          </Labeled>
        </div>
      </Section>
      )}

      {panel === "package:payment" && (
      <Section
        title="Payment Plan Settings"
        description="Controls the 3 payment plan cards shown in the builder after a visitor completes their build."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Labeled label="Installment Count">
            <TextField
              type="number"
              value={paymentPlan.installment_count}
              onSave={(v) =>
                updatePlan({ installment_count: Math.max(1, parseInt(v, 10) || 1) })
              }
              className="w-full"
            />
          </Labeled>
          <Labeled label="Pay-in-Full Discount %">
            <TextField
              type="number"
              value={paymentPlan.pay_in_full_discount_percent}
              onSave={(v) =>
                updatePlan({ pay_in_full_discount_percent: Number(v) || 0 })
              }
              className="w-full"
            />
          </Labeled>
          <Labeled label="Advance % (all plans)">
            <TextField
              type="number"
              value={paymentPlan.advance_percent}
              onSave={(v) => updatePlan({ advance_percent: Number(v) || 0 })}
              className="w-full"
            />
          </Labeled>
          <Labeled label="Installments Label">
            <TextField
              value={paymentPlan.installments_label}
              onSave={(v) => updatePlan({ installments_label: v })}
              className="w-full"
            />
          </Labeled>
          <Labeled label="Pay in Full Label">
            <TextField
              value={paymentPlan.pay_in_full_label}
              onSave={(v) => updatePlan({ pay_in_full_label: v })}
              className="w-full"
            />
          </Labeled>
          <Labeled label="Milestone Label">
            <TextField
              value={paymentPlan.milestone_label}
              onSave={(v) => updatePlan({ milestone_label: v })}
              className="w-full"
            />
          </Labeled>
        </div>
      </Section>

      <BuilderCopySection copy={copy} setCopy={setCopy} />
    </>

  );
}

// ---------- Builder Copy & Labels ----------
const COPY_GROUP_ORDER: { key: string; label: string }[] = [
  { key: "general", label: "General" },
  { key: "step1", label: "Step 1 — Starting Point" },
  { key: "step2", label: "Step 2 — Website" },
  { key: "step3", label: "Step 3 — AI Agent" },
  { key: "step4", label: "Step 4 — Podcast" },
  { key: "live_quote", label: "Live Quote" },
  { key: "payment_cards", label: "Payment Cards" },
  { key: "contact_form", label: "Contact Form" },
  { key: "faq", label: "FAQ" },
];

function BuilderCopySection({
  copy,
  setCopy,
}: {
  copy: BuilderCopyRow[];
  setCopy: React.Dispatch<React.SetStateAction<BuilderCopyRow[]>>;
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["general"]));

  const grouped = useMemo(() => {
    const m: Record<string, BuilderCopyRow[]> = {};
    for (const row of copy) {
      (m[row.group_key] ??= []).push(row);
    }
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => a.display_order - b.display_order);
    }
    return m;
  }, [copy]);

  async function updateRow(id: string, value: string) {
    const prev = copy.find((r) => r.id === id)?.value;
    setCopy((curr) => curr.map((r) => (r.id === id ? { ...r, value } : r)));
    const { error } = await supabase
      .from("builder_copy" as never)
      .update({ value } as never)
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      setCopy((curr) =>
        curr.map((r) => (r.id === id ? { ...r, value: prev ?? r.value } : r)),
      );
    } else {
      toast.success("Saved");
    }
  }

  function toggle(g: string) {
    setOpenGroups((curr) => {
      const next = new Set(curr);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  }

  return (
    <Section
      title="Builder Copy & Labels"
      description="Edit every static text string shown in the custom builder. Changes appear on the live site after the next page load."
    >
      <div className="space-y-3">
        {COPY_GROUP_ORDER.map((grp) => {
          const rows = grouped[grp.key] ?? [];
          if (rows.length === 0) return null;
          const open = openGroups.has(grp.key);
          return (
            <div
              key={grp.key}
              className="rounded-lg border border-white/[0.08] border-l-2 border-l-[#F97316]/50 bg-[#0B0F1A]"
            >
              <button
                type="button"
                onClick={() => toggle(grp.key)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="font-display text-sm font-semibold text-white">
                  {grp.label}
                </span>
                <span className="flex items-center gap-2 text-xs text-white/45">
                  <span className="font-mono">{rows.length}</span>
                  {open ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              </button>
              {open && (
                <div className="space-y-4 border-t border-white/[0.06] px-4 py-4">
                  {rows.map((row) => {
                    const isLong =
                      row.key.endsWith("_answer") ||
                      row.key === "confirmation_message" ||
                      row.key === "whatsapp_prefilled_message" ||
                      row.key === "live_quote_payment_note" ||
                      row.key === "step1_textarea_placeholder";
                    return (
                      <div key={row.id} className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <label className="text-xs font-medium text-white/75">
                            {row.label || row.key}
                          </label>
                          <span className="font-mono text-[10px] text-white/35">
                            {row.key}
                          </span>
                        </div>
                        {isLong ? (
                          <textarea
                            defaultValue={row.value}
                            onBlur={(e) => {
                              if (e.target.value !== row.value) updateRow(row.id, e.target.value);
                            }}
                            rows={3}
                            className="w-full rounded-md border border-white/[0.1] bg-[#0F1320] px-2 py-1.5 text-sm text-white focus:border-[#3B82F6]/60 focus:outline-none"
                          />
                        ) : (
                          <TextField
                            value={row.value}
                            onSave={(v) => updateRow(row.id, v)}
                            className="w-full"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

