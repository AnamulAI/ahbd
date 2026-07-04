import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Users,
  UserPlus,
  Timer,
  MousePointer,
  Globe,
  Activity,
  Sparkles,
  Link2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { useMyProfile } from "@/hooks/use-my-permissions";
import {
  getAnalyticsOverview,
  getConversionsSummary,
  getLiveVisitors,
} from "@/lib/analytics.functions";

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "All time", value: null as number | null },
];

const CATEGORY_LABEL: Record<string, string> = {
  direct: "Direct",
  organic_search: "Organic Search",
  social: "Social",
  ai_engine: "AI Engine",
  referral: "Referral",
  unknown: "Unknown",
};

const DEVICE_COLORS = ["#3B82F6", "#F97316", "#8B5CF6"];
const BROWSER_COLORS = ["#3B82F6", "#F97316", "#22C55E", "#8B5CF6", "#64748B"];

function fmtDuration(sec: number) {
  if (!sec) return "0s";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function fmtAgo(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  accent?: "blue" | "orange";
}) {
  const ring = accent === "orange" ? "text-[#F97316]" : "text-[#3B82F6]";
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          {label}
        </div>
        <Icon className={`h-4 w-4 ${ring}`} />
      </div>
      <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
    </div>
  );
}

function SectionCard({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="card-elevated p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-white">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

export function AnalyticsPage() {
  const gate = useAdminGate();
  const { data: profile } = useMyProfile();
  const [days, setDays] = useState<number | null>(30);
  const [includeAdmin, setIncludeAdmin] = useState(false);

  const overviewFn = useServerFn(getAnalyticsOverview);
  const conversionsFn = useServerFn(getConversionsSummary);
  const liveFn = useServerFn(getLiveVisitors);

  const canAccess =
    !profile || profile.is_primary_owner || Boolean((profile.sections as any).analytics);

  const overview = useQuery({
    queryKey: ["analytics-overview", days, includeAdmin],
    queryFn: () => overviewFn({ data: { days, includeAdmin } }),
    enabled: gate.status === "ok" && canAccess,
  });
  const conversions = useQuery({
    queryKey: ["analytics-conversions", days, includeAdmin],
    queryFn: () => conversionsFn({ data: { days, includeAdmin } }),
    enabled: gate.status === "ok" && canAccess,
  });
  const live = useQuery({
    queryKey: ["analytics-live", includeAdmin],
    queryFn: () => liveFn({ data: { includeAdmin } }),
    enabled: gate.status === "ok" && canAccess,
    refetchInterval: 20_000,
  });

  const sources = useMemo(() => {
    return (overview.data?.sources ?? []).map((s) => ({
      ...s,
      label: CATEGORY_LABEL[s.name] ?? s.name,
    }));
  }, [overview.data]);

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white/60">
        Loading…
      </div>
    );
  }

  return (
    <AdminShell email={profile?.email ?? undefined}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            // site
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-white/55">
            Real visitors only. Bots are auto-excluded.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-white/10 bg-[#0F1424] p-1">
            {RANGE_OPTIONS.map((r) => (
              <button
                key={String(r.value)}
                onClick={() => setDays(r.value)}
                className={`rounded px-3 py-1.5 text-xs transition ${
                  days === r.value
                    ? "bg-[#3B82F6] text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#0F1424] px-3 py-1.5 text-xs text-white/70">
            <input
              type="checkbox"
              checked={includeAdmin}
              onChange={(e) => setIncludeAdmin(e.target.checked)}
              className="accent-[#3B82F6]"
            />
            Include admin visits
          </label>
        </div>
      </div>

      {!canAccess ? (
        <div className="card-elevated p-8 text-center text-white/60">
          You do not have access to Analytics.
        </div>
      ) : overview.isError ? (
        <div className="card-elevated p-6 text-sm text-red-300">
          Failed to load analytics: {(overview.error as Error).message}
        </div>
      ) : (
        <>
          {/* stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Unique Visitors"
              value={overview.data ? String(overview.data.totals.uniqueVisitors) : "—"}
              sub={overview.data ? `${overview.data.totals.pageviews} pageviews` : undefined}
            />
            <StatCard
              icon={UserPlus}
              label="New vs Returning"
              value={
                overview.data
                  ? `${overview.data.totals.newVisitors} / ${overview.data.totals.returningVisitors}`
                  : "—"
              }
              sub="new / returning"
            />
            <StatCard
              icon={Timer}
              label="Avg Session Duration"
              value={overview.data ? fmtDuration(overview.data.totals.avgSessionSeconds) : "—"}
            />
            <StatCard
              icon={MousePointer}
              label="Bounce Rate"
              value={
                overview.data
                  ? `${Math.round(overview.data.totals.bounceRate * 100)}%`
                  : "—"
              }
              sub="single-page sessions"
            />
          </div>

          {/* live + traffic over time */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard
              title="Live Visitors"
              right={
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  {live.data?.count ?? 0} online
                </span>
              }
            >
              <div className="max-h-72 space-y-2 overflow-y-auto no-scrollbar">
                {live.data && live.data.sessions.length > 0 ? (
                  live.data.sessions.map((s: any) => (
                    <div
                      key={s.session_id}
                      className="flex items-center justify-between rounded-md border border-white/[0.06] bg-[#0F1424] px-3 py-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-white/85">{s.path}</div>
                        <div className="mt-0.5 text-white/45">
                          {[s.country, s.city].filter(Boolean).join(", ") || "Unknown"} ·{" "}
                          {s.device_type} · {s.browser}
                        </div>
                      </div>
                      <span className="ml-3 shrink-0 text-white/40">{fmtAgo(s.visited_at)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-white/40">No active visitors right now.</div>
                )}
              </div>
            </SectionCard>

            <div className="lg:col-span-2">
              <SectionCard title="Traffic Over Time">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overview.data?.overTime ?? []}>
                      <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "#121A2E",
                          border: "1px solid #1E293B",
                          borderRadius: 8,
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>
          </div>

          {/* Countries + device/browser */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard title="Visitors by Country">
              <div className="space-y-2">
                {(overview.data?.countries ?? []).length === 0 && (
                  <div className="text-sm text-white/40">No data yet.</div>
                )}
                {(() => {
                  const list = overview.data?.countries ?? [];
                  const max = list[0]?.count ?? 1;
                  return list.map((c) => (
                    <div key={c.name} className="text-xs">
                      <div className="mb-1 flex items-center justify-between text-white/70">
                        <span className="inline-flex items-center gap-2">
                          <Globe className="h-3 w-3 text-white/40" />
                          {c.name}
                        </span>
                        <span className="font-mono text-white/50">{c.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-[#3B82F6]"
                          style={{ width: `${(c.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </SectionCard>

            <SectionCard title="Device">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.data?.devices ?? []}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {(overview.data?.devices ?? []).map((_, i) => (
                        <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#121A2E",
                        border: "1px solid #1E293B",
                        borderRadius: 8,
                        color: "#fff",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Browser">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.data?.browsers ?? []}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {(overview.data?.browsers ?? []).map((_, i) => (
                        <Cell key={i} fill={BROWSER_COLORS[i % BROWSER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#121A2E",
                        border: "1px solid #1E293B",
                        borderRadius: 8,
                        color: "#fff",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          {/* Traffic sources */}
          <div className="mt-4">
            <SectionCard
              title="Traffic Sources"
              right={
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F97316]/40 bg-[#F97316]/10 px-2 py-0.5 text-[10px] font-medium text-[#F97316]">
                  <Sparkles className="h-3 w-3" />
                  AIO Impact
                </span>
              }
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sources}>
                    <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                    <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#121A2E",
                        border: "1px solid #1E293B",
                        borderRadius: 8,
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {sources.map((s, i) => (
                        <Cell key={i} fill={s.name === "ai_engine" ? "#F97316" : "#3B82F6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          {/* Top pages */}
          <div className="mt-4">
            <SectionCard title="Top Pages">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-white/40">
                      <th className="py-2 pr-4">Path</th>
                      <th className="py-2 pr-4 text-right">Visits</th>
                      <th className="py-2 text-right">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overview.data?.topPages ?? []).map((p) => (
                      <tr key={p.path} className="border-b border-white/[0.04]">
                        <td className="py-2 pr-4 font-mono text-xs text-white/80">{p.path}</td>
                        <td className="py-2 pr-4 text-right font-mono text-white/70">{p.visits}</td>
                        <td className="py-2 text-right text-white/60">{fmtDuration(p.avgTime)}</td>
                      </tr>
                    ))}
                    {(overview.data?.topPages ?? []).length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-white/40">
                          No data yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>

          {/* Conversions */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Visits That Became Leads">
              <div className="flex items-baseline gap-3">
                <div className="font-display text-4xl font-bold text-white">
                  {conversions.data?.leadCount ?? 0}
                </div>
                <div className="text-xs text-white/50">total leads</div>
              </div>
              <div className="mt-4">
                <div className="mb-1 text-[10px] uppercase tracking-wider text-white/40">
                  Top sources
                </div>
                {(conversions.data?.leadAttribution.sources ?? []).slice(0, 5).map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between border-b border-white/[0.04] py-1.5 text-xs"
                  >
                    <span className="text-white/70">{CATEGORY_LABEL[s.name] ?? s.name}</span>
                    <span className="font-mono text-white/50">{s.count}</span>
                  </div>
                ))}
                <div className="mt-3 mb-1 text-[10px] uppercase tracking-wider text-white/40">
                  Top pages
                </div>
                {(conversions.data?.leadAttribution.pages ?? []).slice(0, 5).map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between border-b border-white/[0.04] py-1.5 text-xs"
                  >
                    <span className="font-mono text-white/70">{p.name}</span>
                    <span className="font-mono text-white/50">{p.count}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Visits That Became Subscribers">
              <div className="flex items-baseline gap-3">
                <div className="font-display text-4xl font-bold text-white">
                  {conversions.data?.subscriberCount ?? 0}
                </div>
                <div className="text-xs text-white/50">total subscribers</div>
              </div>
              <div className="mt-4">
                <div className="mb-1 text-[10px] uppercase tracking-wider text-white/40">
                  Top sources
                </div>
                {(conversions.data?.subscriberAttribution.sources ?? []).slice(0, 5).map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between border-b border-white/[0.04] py-1.5 text-xs"
                  >
                    <span className="text-white/70">{CATEGORY_LABEL[s.name] ?? s.name}</span>
                    <span className="font-mono text-white/50">{s.count}</span>
                  </div>
                ))}
                <div className="mt-3 mb-1 text-[10px] uppercase tracking-wider text-white/40">
                  Top pages
                </div>
                {(conversions.data?.subscriberAttribution.pages ?? []).slice(0, 5).map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between border-b border-white/[0.04] py-1.5 text-xs"
                  >
                    <span className="font-mono text-white/70">{p.name}</span>
                    <span className="font-mono text-white/50">{p.count}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Campaigns */}
          <div className="mt-4">
            <SectionCard
              title="Campaign & Link Tracking"
              right={
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F97316]/40 bg-[#F97316]/10 px-2 py-0.5 text-[10px] font-medium text-[#F97316]">
                  <Link2 className="h-3 w-3" />
                  Sample link opens: {overview.data?.sampleLinkVisits ?? 0}
                </span>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-white/40">
                      <th className="py-2 pr-4">UTM Source / Campaign</th>
                      <th className="py-2 text-right">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overview.data?.campaigns ?? []).map((c) => (
                      <tr key={c.label} className="border-b border-white/[0.04]">
                        <td className="py-2 pr-4 text-white/80">{c.label}</td>
                        <td className="py-2 text-right font-mono text-white/70">{c.count}</td>
                      </tr>
                    ))}
                    {(overview.data?.campaigns ?? []).length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-4 text-center text-white/40">
                          No campaign traffic yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </AdminShell>
  );
}
