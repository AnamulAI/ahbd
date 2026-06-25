import {
  Globe,
  Globe2,
  Shield,
  Zap,
  Server,
  Rocket,
  Lock,
  Wand2,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const ICON_REGISTRY: Record<string, LucideIcon> = {
  Globe,
  Globe2,
  Shield,
  Zap,
  Server,
  Rocket,
  Lock,
  Wand2,
};

function pickIcon(name: string): LucideIcon {
  return ICON_REGISTRY[name] ?? Sparkles;
}

export type PromoCardData = {
  id: string;
  brand_name: string;
  brand_color: string;
  eyebrow_text: string;
  heading_prefix: string;
  description: string;
  cta_label: string;
  cta_url: string;
  feature_pills: { label: string; icon_name: string }[];
  visibility_condition: string;
};

// Choose readable text color for a given brand background (WCAG-ish luma).
function readableOn(hex: string): "#000" | "#fff" {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#000" : "#fff";
}

export function PromoCard({ card }: { card: PromoCardData }) {
  const brand = card.brand_color;
  const ctaText = readableOn(brand);
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[oklch(0.15_0.02_260)] p-6"
      style={{
        boxShadow: `0 0 0 1px ${brand}22 inset, 0 14px 40px -20px ${brand}55`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl opacity-30"
        style={{ background: brand }}
      />
      <div className="relative">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary)]">
          {card.eyebrow_text}
        </div>
        <h4 className="mt-2 font-display text-xl font-bold text-white">
          {card.heading_prefix}{" "}
          <span style={{ color: brand }}>{card.brand_name}</span>
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {card.description}
        </p>

        <a
          href={card.cta_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: brand, color: ctaText }}
        >
          {card.cta_label}
          <ArrowRight className="h-4 w-4" />
        </a>

        {card.feature_pills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {card.feature_pills.map((p, i) => {
              const Icon = pickIcon(p.icon_name);
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/85"
                >
                  <Icon className="h-3 w-3" style={{ color: brand }} aria-hidden />
                  {p.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
