import {
  Globe,
  MessageCircle,
  Database,
  Layers,
  Film,
  Clapperboard,
  FileText,
  Share2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type IconSpec = { Icon: LucideIcon; color?: string };

const BLUE = "#3B82F6";
const WHATSAPP_GREEN = "#25D366";

// Keyword-driven matcher so this stays admin-friendly: any option whose label
// or option_group matches a known phrase gets the matching badge.
const RULES: Array<{ test: RegExp; spec: IconSpec }> = [
  { test: /whatsapp/i, spec: { Icon: MessageCircle, color: WHATSAPP_GREEN } },
  { test: /website|web\b|site/i, spec: { Icon: Globe } },
  { test: /crm|internal tool|internal-tool|database|backend|airtable|notion/i, spec: { Icon: Database } },
  { test: /integration|layers|stack/i, spec: { Icon: Layers } },
  { test: /short.?form|clip|reel|video/i, spec: { Icon: Film } },
  { test: /clapper|editing|production/i, spec: { Icon: Clapperboard } },
  { test: /show notes|transcript|notes|document/i, spec: { Icon: FileText } },
  { test: /social|distribution|share/i, spec: { Icon: Share2 } },
];

export function getOptionIcon(label: string, group: string): IconSpec {
  for (const r of RULES) {
    if (r.test.test(label) || r.test.test(group)) return r.spec;
  }
  return { Icon: Sparkles };
}

export function OptionIconBadge({ label, group }: { label: string; group: string }) {
  const { Icon, color = BLUE } = getOptionIcon(label, group);
  return (
    <span
      className="inline-grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10"
      style={{
        backgroundColor: `${color}1F`, // ~12% alpha
        boxShadow: `inset 0 0 0 1px ${color}33`,
      }}
      aria-hidden
    >
      <Icon className="h-3.5 w-3.5" style={{ color }} />
    </span>
  );
}
