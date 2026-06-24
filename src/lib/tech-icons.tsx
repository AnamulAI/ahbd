import { CreditCard } from "lucide-react";
import type { IconType } from "react-icons";
import {
  SiNextdotjs,
  SiTailwindcss,
  SiSupabase,
  SiVercel,
  SiReact,
  SiTypescript,
  SiOpenai,
  SiStripe,
  SiNodedotjs,
  SiPython,
  SiPostgresql,
  SiFigma,
  SiWordpress,
  SiShopify,
  SiNotion,
  SiZapier,
  SiAirtable,
  SiGoogleanalytics,
} from "react-icons/si";

export const TECH_ICONS: Record<string, { Icon: IconType; color: string }> = {
  "next.js": { Icon: SiNextdotjs, color: "#FFFFFF" },
  nextjs: { Icon: SiNextdotjs, color: "#FFFFFF" },
  "tailwind css": { Icon: SiTailwindcss, color: "#38BDF8" },
  tailwind: { Icon: SiTailwindcss, color: "#38BDF8" },
  supabase: { Icon: SiSupabase, color: "#3ECF8E" },
  vercel: { Icon: SiVercel, color: "#FFFFFF" },
  react: { Icon: SiReact, color: "#61DAFB" },
  typescript: { Icon: SiTypescript, color: "#3178C6" },
  openai: { Icon: SiOpenai, color: "#FFFFFF" },
  "openai api": { Icon: SiOpenai, color: "#FFFFFF" },
  "openai custom gpt": { Icon: SiOpenai, color: "#FFFFFF" },
  "gpt-4": { Icon: SiOpenai, color: "#FFFFFF" },
  stripe: { Icon: SiStripe, color: "#635BFF" },
  "node.js": { Icon: SiNodedotjs, color: "#5FA04E" },
  nodejs: { Icon: SiNodedotjs, color: "#5FA04E" },
  python: { Icon: SiPython, color: "#3776AB" },
  postgresql: { Icon: SiPostgresql, color: "#4169E1" },
  postgres: { Icon: SiPostgresql, color: "#4169E1" },
  figma: { Icon: SiFigma, color: "#F24E1E" },
  wordpress: { Icon: SiWordpress, color: "#21759B" },
  shopify: { Icon: SiShopify, color: "#7AB55C" },
  notion: { Icon: SiNotion, color: "#FFFFFF" },
  zapier: { Icon: SiZapier, color: "#FF4F00" },
  airtable: { Icon: SiAirtable, color: "#FCB400" },
  "google analytics": { Icon: SiGoogleanalytics, color: "#E37400" },
};

export function TechTag({ name, compact = false }: { name: string; compact?: boolean }) {
  const match = TECH_ICONS[name.toLowerCase().trim()];
  const size = compact ? 11 : 14;
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] font-medium text-white/85",
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      ].join(" ")}
    >
      {match ? (
        <match.Icon size={size} color={match.color} aria-hidden className="shrink-0" />
      ) : (
        <CreditCard
          className={[compact ? "h-3 w-3" : "h-3.5 w-3.5", "shrink-0 text-[color:var(--primary)]"].join(" ")}
          aria-hidden
        />
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}
