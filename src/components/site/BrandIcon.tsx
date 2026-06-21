import {
  siReact,
  siNextdotjs,
  siTypescript,
  siTailwindcss,
  siNodedotjs,
  siSupabase,
  siWordpress,
  siWebflow,
  siFigma,
  siFramer,
  siJavascript,
  siVite,
  siPostgresql,
  siStripe,
  siVercel,
  siHostinger,
} from "simple-icons";

type Brand = {
  title: string;
  path: string;
  hex: string;
};

// Override hex for brands whose official monochrome looks invisible on dark.
const OVERRIDES: Record<string, string> = {
  "Next.js": "FFFFFF",
  Framer: "FFFFFF",
  Vercel: "FFFFFF",
};

export const BRANDS: Record<string, Brand> = {
  React: siReact,
  "Next.js": siNextdotjs,
  TypeScript: siTypescript,
  "Tailwind CSS": siTailwindcss,
  "Node.js": siNodedotjs,
  Supabase: siSupabase,
  WordPress: siWordpress,
  Webflow: siWebflow,
  Figma: siFigma,
  Framer: siFramer,
  JavaScript: siJavascript,
  Vite: siVite,
  PostgreSQL: siPostgresql,
  Stripe: siStripe,
  Vercel: siVercel,
  Hostinger: siHostinger,
};

export function brandColor(name: string): string {
  const b = BRANDS[name];
  if (!b) return "#9CA3AF";
  return "#" + (OVERRIDES[name] ?? b.hex);
}

export function BrandIcon({
  name,
  size = 14,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const brand = BRANDS[name];
  if (!brand) return null;
  const color = brandColor(name);
  return (
    <svg
      role="img"
      aria-label={brand.title}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
    >
      <path d={brand.path} />
    </svg>
  );
}
