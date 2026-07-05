import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Users,
  UserPlus,
  Timer,
  MousePointer,
  Globe,
  Sparkles,
  Link2,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Inbox,
  MapPin,
  Megaphone,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { useMyProfile } from "@/hooks/use-my-permissions";
import {
  getAnalyticsOverview,
  getConversionsSummary,
  getLiveVisitors,
} from "@/lib/analytics.functions";

const RANGE_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
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

const TOOLTIP_STYLE = {
  background: "#0F1424",
  border: "1px solid #1E293B",
  borderRadius: 10,
  color: "#fff",
  fontSize: 12,
  padding: "8px 12px",
  boxShadow: "0 10px 30px -12px rgba(0,0,0,0.6)",
} as const;

function fmtDuration(sec: number) {
  if (!sec) return "0s";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m > 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function fmtAgo(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function DeviceIcon({ type, className }: { type: string; className?: string }) {
  const t = (type || "").toLowerCase();
  if (t === "mobile") return <Smartphone className={className} />;
  if (t === "tablet") return <Tablet className={className} />;
  return <Monitor className={className} />;
}

type Trend = { pct: number; direction: "up" | "down" | "flat" } | null;

function computeTrend(current: number, prev: number | null | undefined): Trend {
  if (prev === null || prev === undefined) return null;
  if (prev === 0 && current === 0) return null;
  if (prev === 0) return { pct: 100, direction: "up" };
  const pct = Math.round(((current - prev) / prev) * 100);
  if (pct === 0) return { pct: 0, direction: "flat" };
  return { pct: Math.abs(pct), direction: pct > 0 ? "up" : "down" };
}

function TrendPill({ trend, invert = false }: { trend: Trend; invert?: boolean }) {
  if (!trend) return null;
  const positive = invert ? trend.direction === "down" : trend.direction === "up";
  const negative = invert ? trend.direction === "up" : trend.direction === "down";
  const cls = positive
    ? "text-emerald-300 border-emerald-500/25 bg-emerald-500/10"
    : negative
      ? "text-red-300 border-red-500/25 bg-red-500/10"
      : "text-white/50 border-white/10 bg-white/[0.03]";
  const Icon = trend.direction === "down" ? TrendingDown : TrendingUp;
  return (
    <div className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {trend.direction !== "flat" && <Icon className="h-3 w-3" />}
      <span>
        {trend.direction === "flat" ? "No change" : `${trend.pct}% vs previous period`}
      </span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  trend,
  invertTrend,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  accent: "blue" | "orange" | "violet" | "emerald";
  trend?: Trend;
  invertTrend?: boolean;
}) {
  const badge =
    accent === "orange"
      ? "bg-[#F97316]/15 text-[#F97316] ring-[#F97316]/30"
      : accent === "violet"
        ? "bg-[#8B5CF6]/15 text-[#8B5CF6] ring-[#8B5CF6]/30"
        : accent === "emerald"
          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
          : "bg-[#3B82F6]/15 text-[#3B82F6] ring-[#3B82F6]/30";
  return (
    <div className="group card-elevated card-elevated-hover relative overflow-hidden p-5 transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            {label}
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
          {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
          <TrendPill trend={trend ?? null} invert={invertTrend} />
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-full ring-1 ${badge}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  eyebrow,
  children,
  right,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card-elevated card-elevated-hover p-5 transition ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
              {eyebrow}
            </div>
          )}

          <h3 className="mt-1 font-display text-base font-semibold text-white">{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: any;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-white/50">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-sm font-medium text-white/70">{title}</div>
      {hint && <div className="mt-1 max-w-xs text-xs text-white/45">{hint}</div>}
    </div>
  );
}

function LegendRow({
  color,
  name,
  value,
  total,
}: {
  color: string;
  name: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] py-1.5 text-xs last:border-b-0">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
          style={{ background: color }}
        />
        <span className="truncate text-white/75">{name}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3 font-mono text-[11px]">
        <span className="text-white/50">{value}</span>
        <span className="w-9 text-right text-white/40">{pct}%</span>
      </div>
    </div>
  );
}

function DonutWithLegend({
  title,
  eyebrow,
  data,
  colors,
}: {
  title: string;
  eyebrow: string;
  data: { name: string; value: number }[];
  colors: string[];
}) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const top = data[0];
  return (
    <SectionCard title={title} eyebrow={eyebrow}>
      {total === 0 ? (
        <EmptyState icon={Inbox} title="No data yet" hint="Waiting for real visitors." />
      ) : (
        <>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-2xl font-bold text-white">{total}</div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/45">
                {top ? `${Math.round((top.value / total) * 100)}% ${top.name}` : "total"}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {data.map((d, i) => (
              <LegendRow
                key={d.name}
                color={colors[i % colors.length]}
                name={d.name}
                value={d.value}
                total={total}
              />
            ))}
          </div>
        </>
      )}
    </SectionCard>
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

  const trends = useMemo(() => {
    const t = overview.data?.totals;
    const p = overview.data?.previousTotals ?? null;
    if (!t) return null;
    return {
      uniqueVisitors: computeTrend(t.uniqueVisitors, p?.uniqueVisitors),
      newVisitors: computeTrend(t.newVisitors, p?.newVisitors),
      avgSessionSeconds: computeTrend(t.avgSessionSeconds, p?.avgSessionSeconds),
      bounceRate: computeTrend(
        Math.round((t.bounceRate || 0) * 100),
        p ? Math.round((p.bounceRate || 0) * 100) : null,
      ),
    };
  }, [overview.data]);

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white/60">
        Loading…
      </div>
    );
  }

  const overTimeData = overview.data?.overTime ?? [];
  const countries = overview.data?.countries ?? [];
  const countryTotal = countries.reduce((a, c) => a + c.count, 0);
  const campaigns = overview.data?.campaigns ?? [];
  const topPages = overview.data?.topPages ?? [];

  return (
    <AdminShell email={profile?.email ?? undefined}>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
            // site
          </div>

          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">
            Analytics
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/55">
            Real visitors only — bot traffic and admin sessions are excluded by default.
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
                    ? "bg-[#3B82F6] text-white shadow-[0_4px_18px_-6px_rgba(59,130,246,0.6)]"
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
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              accent="blue"
              label="Unique Visitors"
              value={overview.data ? String(overview.data.totals.uniqueVisitors) : "—"}
              sub={overview.data ? `${overview.data.totals.pageviews} pageviews` : undefined}
              trend={trends?.uniqueVisitors ?? null}
            />
            <StatCard
              icon={UserPlus}
              accent="violet"
              label="New vs Returning"
              value={
                overview.data
                  ? `${overview.data.totals.newVisitors} / ${overview.data.totals.returningVisitors}`
                  : "—"
              }
              sub="new / returning"
              trend={trends?.newVisitors ?? null}
            />
            <StatCard
              icon={Timer}
              accent="emerald"
              label="Avg Session Duration"
              value={overview.data ? fmtDuration(overview.data.totals.avgSessionSeconds) : "—"}
              trend={trends?.avgSessionSeconds ?? null}
            />
            <StatCard
              icon={MousePointer}
              accent="orange"
              label="Bounce Rate"
              value={
                overview.data
                  ? `${Math.round(overview.data.totals.bounceRate * 100)}%`
                  : "—"
              }
              sub="single-page sessions"
              trend={trends?.bounceRate ?? null}
              invertTrend
            />
          </div>

          {/* Live + traffic over time */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard
              title="Live Visitors"
              eyebrow="// realtime"
              right={
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  </span>
                  {live.data?.count ?? 0} online
                </span>
              }
            >
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {live.data && live.data.sessions.length > 0 ? (
                  live.data.sessions.map((s: any) => (
                    <div
                      key={s.session_id}
                      className="group flex items-center gap-3 rounded-md border border-white/[0.06] bg-[#0F1424] px-3 py-2 text-xs transition hover:border-[#3B82F6]/30"
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.04] text-white/70">
                        <DeviceIcon type={s.device_type} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-mono text-[11px] text-white/85">{s.path}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-white/45">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {[s.country, s.city].filter(Boolean).join(", ") || "Unknown"} · {s.browser}
                          </span>
                        </div>
                      </div>
                      <span className="ml-1 shrink-0 font-mono text-[10px] text-white/40">
                        {fmtAgo(s.visited_at)}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No active visitors"
                    hint="Live sessions from the last 5 minutes will appear here."
                  />
                )}
              </div>
            </SectionCard>

            <div className="lg:col-span-2">
              <SectionCard title="Traffic Over Time" eyebrow="// daily visits">
                {overTimeData.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No traffic recorded"
                    hint="Once visitors browse the site, daily counts will render here."
                  />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overTimeData} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="areaTraffic" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1E293B" strokeOpacity={0.4} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748B"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#64748B"
                          fontSize={11}
                          allowDecimals={false}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "#3B82F6", strokeOpacity: 0.3 }} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          fill="url(#areaTraffic)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </SectionCard>
            </div>
          </div>

          {/* Countries + Device + Browser */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard title="Visitors by Country" eyebrow="// geography">
              {countries.length === 0 ? (
                <EmptyState
                  icon={Globe}
                  title="No country data yet"
                  hint="Country info resolves once real visitors reach the live site."
                />
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const max = countries[0]?.count ?? 1;
                    return countries.map((c, i) => {
                      const isLocal = c.name === "Local";
                      const isUnknown = c.name === "Unknown";
                      const isMuted = isLocal || isUnknown;
                      const pct = countryTotal > 0 ? Math.round((c.count / countryTotal) * 100) : 0;
                      const widthPct = Math.max(4, (c.count / max) * 100);
                      const gradient =
                        i === 0
                          ? "linear-gradient(90deg, #3B82F6 0%, #F97316 100%)"
                          : "linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)";
                      return (
                        <div key={c.name} className="text-xs">
                          <div className="mb-1 flex items-center justify-between">
                            <span
                              className={`inline-flex items-center gap-2 ${isMuted ? "text-white/40" : "text-white/80"}`}
                            >
                              <Globe className="h-3 w-3 text-white/40" />
                              <span className="truncate">{c.name}</span>
                              {isLocal && (
                                <span className="rounded-sm bg-white/[0.05] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/40">
                                  local/preview
                                </span>
                              )}
                              {isUnknown && (
                                <span className="rounded-sm bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-300/70">
                                  geo unresolved
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-white/50">{c.count}</span>
                          </div>
                          <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.05]">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${widthPct}%`,
                                background: isMuted
                                  ? "linear-gradient(90deg, #475569 0%, #64748B 100%)"
                                  : gradient,
                                boxShadow: isMuted ? "none" : "0 0 12px -3px rgba(59,130,246,0.5)",
                              }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] font-medium text-white/85 mix-blend-plus-lighter">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </SectionCard>

            <DonutWithLegend
              title="Device"
              eyebrow="// hardware"
              data={overview.data?.devices ?? []}
              colors={DEVICE_COLORS}
            />

            <DonutWithLegend
              title="Browser"
              eyebrow="// software"
              data={overview.data?.browsers ?? []}
              colors={BROWSER_COLORS}
            />
          </div>

          {/* Traffic Sources */}
          <div className="mt-4">
            <SectionCard
              title="Traffic Sources"
              eyebrow="// acquisition"
              right={
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F97316]/40 bg-[#F97316]/10 px-2 py-0.5 text-[10px] font-medium text-[#F97316]">
                  <Sparkles className="h-3 w-3" />
                  AIO Impact tracked
                </span>
              }
            >
              {sources.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No source data yet"
                  hint="Referrer categorization needs at least one real visit."
                />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sources} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60A5FA" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                        <linearGradient id="barOrange" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FB923C" />
                          <stop offset="100%" stopColor="#F97316" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1E293B" strokeOpacity={0.4} strokeDasharray="3 3" />
                      <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {sources.map((s, i) => (
                          <Cell
                            key={i}
                            fill={s.name === "ai_engine" ? "url(#barOrange)" : "url(#barBlue)"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Top pages */}
          <div className="mt-4">
            <SectionCard title="Top Pages" eyebrow="// content">
              {topPages.length === 0 ? (
                <EmptyState icon={Inbox} title="No page data yet" />
              ) : (
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
                      {topPages.map((p) => (
                        <tr
                          key={p.path}
                          className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                        >
                          <td className="py-2 pr-4 font-mono text-xs text-white/80">{p.path}</td>
                          <td className="py-2 pr-4 text-right font-mono text-white/70">{p.visits}</td>
                          <td className="py-2 text-right text-white/60">{fmtDuration(p.avgTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Conversions */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Visits That Became Leads" eyebrow="// conversions">
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
                {(conversions.data?.leadAttribution.sources ?? []).length === 0 ? (
                  <div className="rounded-md border border-dashed border-white/[0.08] px-3 py-4 text-center text-xs text-white/40">
                    No lead conversions yet.
                  </div>
                ) : (
                  (conversions.data?.leadAttribution.sources ?? []).slice(0, 5).map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between border-b border-white/[0.04] py-1.5 text-xs"
                    >
                      <span className="text-white/70">{CATEGORY_LABEL[s.name] ?? s.name}</span>
                      <span className="font-mono text-white/50">{s.count}</span>
                    </div>
                  ))
                )}
                {(conversions.data?.leadAttribution.pages ?? []).length > 0 && (
                  <>
                    <div className="mt-4 mb-1 text-[10px] uppercase tracking-wider text-white/40">
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
                  </>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Visits That Became Subscribers" eyebrow="// conversions">
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
                {(conversions.data?.subscriberAttribution.sources ?? []).length === 0 ? (
                  <div className="rounded-md border border-dashed border-white/[0.08] px-3 py-4 text-center text-xs text-white/40">
                    No newsletter conversions yet.
                  </div>
                ) : (
                  (conversions.data?.subscriberAttribution.sources ?? []).slice(0, 5).map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between border-b border-white/[0.04] py-1.5 text-xs"
                    >
                      <span className="text-white/70">{CATEGORY_LABEL[s.name] ?? s.name}</span>
                      <span className="font-mono text-white/50">{s.count}</span>
                    </div>
                  ))
                )}
                {(conversions.data?.subscriberAttribution.pages ?? []).length > 0 && (
                  <>
                    <div className="mt-4 mb-1 text-[10px] uppercase tracking-wider text-white/40">
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
                  </>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Campaigns */}
          <div className="mt-4">
            <SectionCard
              title="Campaign & Link Tracking"
              eyebrow="// utm & sample links"
              right={
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F97316]/40 bg-[#F97316]/10 px-2 py-0.5 text-[10px] font-medium text-[#F97316]">
                  <Link2 className="h-3 w-3" />
                  Sample link opens: {overview.data?.sampleLinkVisits ?? 0}
                </span>
              }
            >
              {campaigns.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No campaign traffic yet"
                  hint="Append ?utm_source=… &utm_campaign=… to outreach links to track them here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-white/40">
                        <th className="py-2 pr-4">UTM Source / Campaign</th>
                        <th className="py-2 text-right">Visits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c) => (
                        <tr
                          key={c.label}
                          className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                        >
                          <td className="py-2 pr-4 text-white/80">{c.label}</td>
                          <td className="py-2 text-right font-mono text-white/70">{c.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </AdminShell>
  );
}
