// Manual icon_name -> brand glyph resolution for footer social links, matching
// the same pattern already used for feature_pills.icon_name in PromoCard.tsx
// (admin picks/types a name, app resolves it via a small registry with a
// generic fallback) rather than trying to auto-detect a platform from the
// href's domain, which would be far more fragile (m.facebook.com, shortened
// URLs, custom domains, etc. all defeat simple domain matching).
//
// Icon source matches the existing precedent in FloatingShareBar.tsx:
// react-icons/si for most brands, react-icons/fa's FaLinkedin specifically
// because react-icons/si (like the standalone simple-icons package) doesn't
// ship a LinkedIn glyph.
import {
  SiFacebook,
  SiInstagram,
  SiYoutube,
  SiTiktok,
  SiX,
  SiWhatsapp,
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { Link2 } from "lucide-react";
import type { IconType } from "react-icons";

export const SOCIAL_ICON_OPTIONS: { name: string; icon: IconType }[] = [
  { name: "Facebook", icon: SiFacebook },
  { name: "Instagram", icon: SiInstagram },
  { name: "YouTube", icon: SiYoutube },
  { name: "TikTok", icon: SiTiktok },
  { name: "X", icon: SiX },
  { name: "LinkedIn", icon: FaLinkedin },
  { name: "WhatsApp", icon: SiWhatsapp },
];

const REGISTRY: Record<string, IconType> = Object.fromEntries(
  SOCIAL_ICON_OPTIONS.map((o) => [o.name, o.icon]),
);

export function SocialIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon: IconType | null = name ? (REGISTRY[name] ?? null) : null;
  const Resolved = Icon ?? Link2;
  return <Resolved className={className} aria-hidden />;
}
