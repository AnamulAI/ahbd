import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Home, PanelBottom, Newspaper, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { useMyProfile } from "@/hooks/use-my-permissions";
import { DeviceVisibilityToggle } from "@/components/admin/DeviceVisibilityToggle";
import {
  getSectionVisibility,
  updateSectionVisibility,
  type SectionVisibilityRow,
  type DeviceVisibility,
  type SectionPage,
} from "@/lib/site-section-visibility.functions";

const PAGE_GROUPS: { key: SectionPage; title: string; icon: LucideIcon }[] = [
  { key: "home", title: "Homepage", icon: Home },
  { key: "footer", title: "Footer", icon: PanelBottom },
  { key: "blog_detail", title: "Blog Post Detail", icon: Newspaper },
];

function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#3B82F6]/15 text-[#3B82F6] ring-1 ring-[#3B82F6]/30">
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

export function VisibilityControlPage() {
  const gate = useAdminGate();
  const { data: profile } = useMyProfile();
  const qc = useQueryClient();

  const listFn = useServerFn(getSectionVisibility);
  const updateFn = useServerFn(updateSectionVisibility);

  const canAccess =
    !profile || profile.is_primary_owner || Boolean(profile.sections.visibility_control);

  const query = useQuery({
    queryKey: ["section-visibility"],
    queryFn: () => listFn(),
    enabled: gate.status === "ok" && canAccess,
  });

  const grouped = useMemo(() => {
    const map = new Map<SectionPage, SectionVisibilityRow[]>();
    for (const row of query.data ?? []) {
      const arr = map.get(row.page) ?? [];
      arr.push(row);
      map.set(row.page, arr);
    }
    return map;
  }, [query.data]);

  async function handleChange(sectionKey: string, next: DeviceVisibility) {
    qc.setQueryData<SectionVisibilityRow[]>(["section-visibility"], (prev) =>
      (prev ?? []).map((r) =>
        r.section_key === sectionKey ? { ...r, device_visibility: next } : r,
      ),
    );
    try {
      await updateFn({ data: { section_key: sectionKey, device_visibility: next } });
      toast.success("Saved", { duration: 1200 });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
      qc.invalidateQueries({ queryKey: ["section-visibility"] });
    }
  }

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <AdminShell email={gate.email}>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
          // visibility control
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
          Visibility Control
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Show or hide specific page sections per device. Defaults to "Both" — nothing changes on
          the live site until you flip a toggle.
        </p>
      </div>

      {query.isLoading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {PAGE_GROUPS.map((group) => {
            const rows = grouped.get(group.key) ?? [];
            if (rows.length === 0) return null;
            return (
              <div key={group.key} className="card-elevated p-5">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#3B82F6]">
                  <IconBadge icon={group.icon} />
                  {group.title}
                </div>
                <div className="mt-4 space-y-2">
                  {rows.map((row) => (
                    <div
                      key={row.section_key}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/[0.06] bg-[#0B0F1A] p-3"
                    >
                      <span className="text-sm text-white/85">{row.label}</span>
                      <DeviceVisibilityToggle
                        value={row.device_visibility}
                        onChange={(v) => handleChange(row.section_key, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
