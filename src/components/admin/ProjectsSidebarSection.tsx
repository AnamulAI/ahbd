import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_OPTIONS } from "@/lib/admin-content-helpers";
import { cn } from "@/lib/utils";

type ProjectRow = { main_category: string };

export function ProjectsSidebarSection({ onNavigate }: { onNavigate?: () => void }) {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as Record<string, string> });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("projects").select("main_category");
      if (!cancelled) setProjects((data ?? []) as ProjectRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onProjectsRoute = pathname.startsWith("/admin/projects");
  const activeMain = onProjectsRoute
    ? ((search.main as string | undefined) ?? "web_development")
    : undefined;

  const counts: Record<string, number> = {};
  for (const c of CATEGORY_OPTIONS) counts[c.key] = 0;
  for (const p of projects) counts[p.main_category] = (counts[p.main_category] ?? 0) + 1;

  return (
    <div>
      <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/85">
        <FolderKanban className="h-4 w-4 shrink-0 text-white/50" />
        <span className="flex-1 truncate font-medium">Projects</span>
      </div>
      <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-white/[0.06] pl-2">
        {CATEGORY_OPTIONS.map((c) => {
          const active = activeMain === c.key;
          return (
            <li key={c.key}>
              <Link
                to="/admin/projects"
                search={{ main: c.key }}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors border",
                  active
                    ? "bg-[#3B82F6]/15 text-white border-[#3B82F6]/30"
                    : "text-white/70 hover:text-white hover:bg-white/[0.05] border-transparent",
                )}
              >
                <span className="flex-1 truncate">{c.label}</span>
                <span
                  className={cn(
                    "inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-mono",
                    active
                      ? "bg-[#3B82F6]/25 text-[#93C5FD]"
                      : "bg-white/[0.06] text-white/55",
                  )}
                >
                  {counts[c.key] ?? 0}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
