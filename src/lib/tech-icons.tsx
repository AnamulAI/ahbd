import {
  BookOpen,
  Calendar,
  Captions,
  CreditCard,
  Link2,
  Mail,
  Mic2,
  Rss,
  Server,
  Sparkles,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import type { IconType } from "react-icons";
import { FaRobot } from "react-icons/fa";
import {
  SiNextdotjs,
  SiTailwindcss,
  SiSupabase,
  SiVercel,
  SiReact,
  SiTypescript,
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
  SiSanity,
  SiWhatsapp,
  SiSpotify,
  SiApplepodcasts,
  SiMapbox,
  SiYoutube,
} from "react-icons/si";

const BLUE = "#3B82F6";

// Brand icons (react-icons/si) keyed by exact lowercase tag string.
const BRAND_ICONS: Record<string, { Icon: IconType; color: string }> = {
  "next.js": { Icon: SiNextdotjs, color: "#FFFFFF" },
  nextjs: { Icon: SiNextdotjs, color: "#FFFFFF" },
  "tailwind css": { Icon: SiTailwindcss, color: "#38BDF8" },
  tailwind: { Icon: SiTailwindcss, color: "#38BDF8" },
  supabase: { Icon: SiSupabase, color: "#3ECF8E" },
  vercel: { Icon: SiVercel, color: "#FFFFFF" },
  react: { Icon: SiReact, color: "#61DAFB" },
  typescript: { Icon: SiTypescript, color: "#3178C6" },
  openai: { Icon: FaRobot, color: "#FFFFFF" },
  "openai api": { Icon: FaRobot, color: "#FFFFFF" },
  "openai custom gpt": { Icon: FaRobot, color: "#FFFFFF" },
  "gpt-4": { Icon: FaRobot, color: "#FFFFFF" },
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
  "sanity cms": { Icon: SiSanity, color: "#F03E2F" },
  sanity: { Icon: SiSanity, color: "#F03E2F" },
  "whatsapp business api": { Icon: SiWhatsapp, color: "#25D366" },
  whatsapp: { Icon: SiWhatsapp, color: "#25D366" },
  "spotify for podcasters": { Icon: SiSpotify, color: "#1DB954" },
  spotify: { Icon: SiSpotify, color: "#1DB954" },
  "apple podcasts connect": { Icon: SiApplepodcasts, color: "#9933CC" },
  "apple podcasts": { Icon: SiApplepodcasts, color: "#9933CC" },
  "mapbox gl": { Icon: SiMapbox, color: "#FFFFFF" },
  mapbox: { Icon: SiMapbox, color: "#FFFFFF" },
  "youtube optimization": { Icon: SiYoutube, color: "#FF0000" },
  youtube: { Icon: SiYoutube, color: "#FF0000" },
};

// Keyword → lucide icon fallbacks for descriptive (non-brand) tags.
// Order matters: first matching keyword wins.
const KEYWORD_FALLBACKS: Array<{ match: RegExp; Icon: LucideIcon }> = [
  { match: /caption/i, Icon: Captions },
  { match: /voice|audio|podcast production|intro\/outro/i, Icon: Mic2 },
  { match: /rss/i, Icon: Rss },
  { match: /newsletter|email/i, Icon: Mail },
  { match: /knowledge base|knowledgebase|docs|documentation/i, Icon: BookOpen },
  { match: /calendar|cal\.com|calendly|scheduling/i, Icon: Calendar },
  { match: /payment|gateway|checkout|billing/i, Icon: CreditCard },
  { match: /backend|server|sharepoint|office 365|copilot/i, Icon: Server },
  { match: /embed|integration|api|pipeline|webhook/i, Icon: Link2 },
];

function resolveIcon(name: string) {
  const key = name.toLowerCase().trim();
  const brand = BRAND_ICONS[key];
  if (brand) return { kind: "brand" as const, ...brand };

  for (const { match, Icon } of KEYWORD_FALLBACKS) {
    if (match.test(name)) return { kind: "lucide" as const, Icon, color: BLUE };
  }
  return { kind: "lucide" as const, Icon: Sparkles, color: BLUE };
}

export const TECH_ICONS = BRAND_ICONS;

export function TechTag({ name, compact = false }: { name: string; compact?: boolean }) {
  const resolved = resolveIcon(name);
  const size = compact ? 11 : 14;
  const lucideSize = compact ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] font-medium text-white/85",
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      ].join(" ")}
    >
      {resolved.kind === "brand" ? (
        <resolved.Icon size={size} color={resolved.color} aria-hidden className="shrink-0" />
      ) : (
        <resolved.Icon
          className={[lucideSize, "shrink-0"].join(" ")}
          style={{ color: resolved.color }}
          aria-hidden
        />
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}
