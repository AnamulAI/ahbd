import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_OPTIONS } from "@/lib/admin-content-helpers";
import { fetchSubCategoriesFor } from "@/components/admin/ProjectsListPage";
import { NestedSidebarNav, type NestedNavNode } from "@/components/admin/NestedSidebarNav";

const UNCATEGORIZED = "__uncategorized__";

type ProjectRow = {
  main_category: string;
  sub_category_label: string | null;
};

export function ProjectsSidebarSection({ onNavigate }: { onNavigate?: () => void }) {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [subsByMain, setSubsByMain] = useState<Record<string, string[]>>({});
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as Record<string, string> });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("main_category,sub_category_label");
      if (!cancelled) setProjects((data ?? []) as ProjectRow[]);

      const entries = await Promise.all(
        CATEGORY_OPTIONS.map(async (c) => [c.key, await fetchSubCategoriesFor(c.key)] as const),
      );
      if (!cancelled) setSubsByMain(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onProjectsRoute = pathname.startsWith("/admin/projects");
  const activeMain = onProjectsRoute ? (search.main as string | undefined) : undefined;
  const activeSub = onProjectsRoute ? (search.sub as string | undefined) : undefined;

  const children: NestedNavNode[] = CATEGORY_OPTIONS.map((c) => {
    const subs = subsByMain[c.key] ?? [];
    const inMain = projects.filter((p) => p.main_category === c.key);
    const subCounts: Record<string, number> = { [UNCATEGORIZED]: 0 };
    for (const s of subs) subCounts[s] = 0;
    for (const p of inMain) {
      const l = p.sub_category_label;
      if (l && subs.includes(l)) subCounts[l] = (subCounts[l] ?? 0) + 1;
      else subCounts[UNCATEGORIZED] = (subCounts[UNCATEGORIZED] ?? 0) + 1;
    }

    const isActiveMain = activeMain === c.key;

    const subNodes: NestedNavNode[] = subs.map((label) => ({
      id: `${c.key}:${label}`,
      label,
      count: subCounts[label] ?? 0,
      to: "/admin/projects",
      search: { main: c.key, sub: label },
      active: isActiveMain && activeSub === label,
    }));
    // "All" pseudo-leaf so the main category is reachable as a filtered view too.
    subNodes.unshift({
      id: `${c.key}:all`,
      label: "All",
      count: inMain.length,
      to: "/admin/projects",
      search: { main: c.key, sub: undefined },
      active: isActiveMain && !activeSub,
    });
    if ((subCounts[UNCATEGORIZED] ?? 0) > 0) {
      subNodes.push({
        id: `${c.key}:uncat`,
        label: "Uncategorized",
        count: subCounts[UNCATEGORIZED],
        to: "/admin/projects",
        search: { main: c.key, sub: UNCATEGORIZED },
        active: isActiveMain && activeSub === UNCATEGORIZED,
      });
    }

    return {
      id: c.key,
      label: c.label,
      count: inMain.length,
      children: subNodes,
      defaultOpen: isActiveMain,
    };
  });

  const tree: NestedNavNode[] = [
    {
      id: "projects",
      label: "Projects",
      icon: FolderKanban,
      children,
      defaultOpen: onProjectsRoute,
    },
  ];

  return <NestedSidebarNav nodes={tree} onNavigate={onNavigate} />;
}
