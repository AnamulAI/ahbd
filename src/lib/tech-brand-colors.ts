// Approximate brand colors for tech / tool chips.
// Returns null for unknown names — caller falls back to the default muted style.

export type BrandChip = {
  // Hex color used for border + text; bg is derived at low opacity in the chip.
  color: string;
  // Optional override text color (for very light brand colors on dark bg,
  // e.g. Next.js on dark theme reads best with near-white text).
  text?: string;
  // Optional multi-color gradient border override (e.g. Figma).
  gradient?: string;
};

const MAP: Record<string, BrandChip> = {
  // Podcast / AI production tools
  elevenlabs: { color: "#8B5CF6", text: "#C4B5FD" },
  descript: { color: "#0FBE7C" },
  buzzsprout: { color: "#EE5A24" },
  openai: { color: "#10A37F" },
  "openai api": { color: "#10A37F" },
  "openai custom gpt": { color: "#10A37F" },
  "gpt-4": { color: "#10A37F" },
  "make.com": { color: "#6D28D9", text: "#C4B5FD" },
  make: { color: "#6D28D9", text: "#C4B5FD" },
  zapier: { color: "#FF4F00" },
  n8n: { color: "#EA4B71" },
  anthropic: { color: "#D97757" },
  claude: { color: "#D97757" },

  // Web dev / infra
  react: { color: "#61DAFB" },
  "next.js": { color: "#E5E7EB", text: "#F9FAFB" },
  nextjs: { color: "#E5E7EB", text: "#F9FAFB" },
  supabase: { color: "#3ECF8E" },
  "tailwind css": { color: "#38BDF8" },
  tailwind: { color: "#38BDF8" },
  wordpress: { color: "#1E40AF", text: "#93C5FD" },
  figma: {
    color: "#F97316",
    gradient:
      "linear-gradient(120deg, #F24E1E, #FF7262 25%, #A259FF 60%, #1ABCFE 100%)",
  },
  notion: { color: "#E5E7EB", text: "#F9FAFB" },
  typescript: { color: "#3178C6" },
  "node.js": { color: "#5FA04E" },
  nodejs: { color: "#5FA04E" },
  vercel: { color: "#E5E7EB", text: "#F9FAFB" },
  stripe: { color: "#635BFF" },
  postgresql: { color: "#4169E1" },
  postgres: { color: "#4169E1" },
  python: { color: "#3776AB" },
  shopify: { color: "#7AB55C" },
  airtable: { color: "#FCB400" },
  "google analytics": { color: "#E37400" },
  sanity: { color: "#F03E2F" },
  "sanity cms": { color: "#F03E2F" },
  whatsapp: { color: "#25D366" },
  spotify: { color: "#1DB954" },
  "apple podcasts": { color: "#A855F7" },
  youtube: { color: "#FF0033" },
  mapbox: { color: "#4264FB" },
};

export function getBrandChip(name: string): BrandChip | null {
  const k = name.toLowerCase().trim();
  return MAP[k] ?? null;
}
