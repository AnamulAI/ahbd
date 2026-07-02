import { useRouterState } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";
import { NestedSidebarNav, type NestedNavNode } from "@/components/admin/NestedSidebarNav";

export const BUILDER_PANELS = {
  "website:tech": { crumbs: ["Website", "Tech Approaches"] },
  "website:usecases": { crumbs: ["Website", "Use Cases & Pricing"] },
  "website:tiers": { crumbs: ["Website", "Scope Tiers"] },
  "website:suboptions": { crumbs: ["Website", "Sub-Options"] },
  "ai:types": { crumbs: ["AI Agent", "AI Types"] },
  "ai:suboptions": { crumbs: ["AI Agent", "Sub-Options"] },
  "podcast:types": { crumbs: ["Podcast", "Podcast Types"] },
  "podcast:suboptions": { crumbs: ["Podcast", "Sub-Options"] },
  "promo": { crumbs: ["Promo Cards"] },
  "package:signature": { crumbs: ["Package & Payment", "Signature Price"] },
  "package:payment": { crumbs: ["Package & Payment", "Payment Plans"] },
  "package:copy": { crumbs: ["Package & Payment", "Builder Copy & Labels"] },
} as const;

export type BuilderPanelKey = keyof typeof BUILDER_PANELS;

export const DEFAULT_BUILDER_PANEL: BuilderPanelKey = "website:tech";

export function isBuilderPanel(v: unknown): v is BuilderPanelKey {
  return typeof v === "string" && v in BUILDER_PANELS;
}

const BASE = "/admin/builder-settings";

export function BuilderSettingsSidebarSection({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as Record<string, string> });

  const onRoute = pathname.startsWith(BASE);
  const activePanel: BuilderPanelKey = onRoute && isBuilderPanel(search.panel)
    ? search.panel
    : DEFAULT_BUILDER_PANEL;

  const leaf = (id: BuilderPanelKey, label: string): NestedNavNode => ({
    id,
    label,
    to: BASE,
    search: { panel: id },
    active: onRoute && activePanel === id,
  });

  const tree: NestedNavNode[] = [
    {
      id: "builder-settings",
      label: "Builder Settings",
      icon: Settings2,
      defaultOpen: onRoute,
      children: [
        {
          id: "website",
          label: "Website",
          defaultOpen: onRoute && activePanel.startsWith("website:"),
          children: [
            leaf("website:tech", "Tech Approaches"),
            leaf("website:usecases", "Use Cases & Pricing"),
            leaf("website:tiers", "Scope Tiers"),
            leaf("website:suboptions", "Sub-Options"),
          ],
        },
        {
          id: "ai",
          label: "AI Agent",
          defaultOpen: onRoute && activePanel.startsWith("ai:"),
          children: [
            leaf("ai:types", "AI Types"),
            leaf("ai:suboptions", "Sub-Options"),
          ],
        },
        {
          id: "podcast",
          label: "Podcast",
          defaultOpen: onRoute && activePanel.startsWith("podcast:"),
          children: [
            leaf("podcast:types", "Podcast Types"),
            leaf("podcast:suboptions", "Sub-Options"),
          ],
        },
        // Level-2 leaf: no children → renders as directly-clickable link (no chevron).
        leaf("promo", "Promo Cards"),
        {
          id: "package",
          label: "Package & Payment",
          defaultOpen: onRoute && activePanel.startsWith("package:"),
          children: [
            leaf("package:signature", "Signature Price"),
            leaf("package:payment", "Payment Plans"),
            leaf("package:copy", "Builder Copy & Labels"),
          ],
        },
      ],
    },
  ];

  return <NestedSidebarNav nodes={tree} onNavigate={onNavigate} />;
}
