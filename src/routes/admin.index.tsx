import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  ArrowRight,
  ExternalLink,
  Loader2,
  FileText,
  Layers,
  Mail,
  Users,
  Link2,
  UserCog,
  BarChart3,
  PenSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, StatusBadge, useAdminGate } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard — AnamDev Admin" }] }),
  component: AdminDashboard,
});

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  status: string;
  total_price: number | null;
  created_at: string;
  selected_config: Record<string, unknown> | null;
};

type Accent = "blue" | "orange" | "violet" | "emerald" | "rose" | "amber";

const ACCENT_CLASS: Record<Accent, string> = {
  blue: "bg-[#3B82F6]/15 text-[#3B82F6] ring-[#3B82F6]/30",
  orange: "bg-[#F97316]/15 text-[#F97316] ring-[#F97316]/30",
  violet: "bg-[#8B5CF6]/15 text-[#8B5CF6] ring-[#8B5CF6]/30",
  emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  rose: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  amber: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
};

function formatCurrency(n: number | null | undefined) {
  if (!n) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

type Trend = { pct: number; direction: "up" | "down" | "flat" } | null;

function computeTrend(current: number, prev: number | null): Trend {
  if (prev === null) return null;
  if (prev === 0 && current === 0) return null;
  if (prev === 0) return { pct: 100, direction: "up" };
  const pct = Math.round(((current - prev) / prev) * 100);
  if (pct === 0) return { pct: 0, direction: "flat" };
  return { pct: Math.abs(pct), direction: pct > 0 ? "up" : "down" };
}

function TrendPill({ trend }: { trend: Trend }) {
  if (!trend) return null;
  const cls =
    trend.direction === "up"
      ? "text-emerald-300 border-emerald-500/25 bg-emerald-500/10"
      : trend.direction === "down"
        ? "text-red-300 border-red-500/25 bg-red-500/10"
        : "text-white/50 border-white/10 bg-white/[0.03]";
  const Icon = trend.direction === "down" ? TrendingDown : TrendingUp;
  return (
    <div className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {trend.direction !== "flat" && <Icon className="h-3 w-3" />}
      <span>
        {trend.direction === "flat" ? "No change" : `${trend.pct}% vs previous 7d`}
      </span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "blue",
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent?: Accent;
  trend?: Trend;
}) {
  return (
    <div className="group card-elevated card-elevated-hover relative overflow-hidden p-5 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            {label}
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
          {sub && <div className="mt-1 truncate text-xs text-white/50">{sub}</div>}
          <TrendPill trend={trend ?? null} />
        </div>
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ${ACCENT_CLASS[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

type DashStats = {
  total: number;
  newThisWeek: number;
  totalValue: number;
  popularBuild: string;
  blogTotal: number;
  blogPublished: number;
  blogDraft: number;
  projectsTotal: number;
  projectsWeb: number;
  projectsAI: number;
  projectsPodcast: number;
  subscribers: number;
  visitorsWeek: number | null;
  visitorsPrevWeek: number | null;
  samplesTotal: number;
  samplesOpened: number | null;
  teamTotal: number;
  teamOwners: number;
};

function AdminDashboard() {
  const gate = useAdminGate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashStats>({
    total: 0,
    newThisWeek: 0,
    totalValue: 0,
    popularBuild: "—",
    blogTotal: 0,
    blogPublished: 0,
    blogDraft: 0,
    projectsTotal: 0,
    projectsWeb: 0,
    projectsAI: 0,
    projectsPodcast: 0,
    subscribers: 0,
    visitorsWeek: null,
    visitorsPrevWeek: null,
    samplesTotal: 0,
    samplesOpened: null,
    teamTotal: 0,
    teamOwners: 0,
  });
  const [recent, setRecent] = useState<Lead[]>([]);
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  useEffect(() => {
    if (gate.status !== "ok") return;
    (async () => {
      const weekAgoDate = new Date(Date.now() - 7 * 86400_000);
      const prevWeekStart = new Date(Date.now() - 14 * 86400_000);

      const [
        leadsRes,
        blogRes,
        projectsRes,
        subsRes,
        samplesRes,
        teamRes,
        visitsRes,
        prevVisitsRes,
        sampleVisitsRes,
      ] = await Promise.all([
        supabase
          .from("builder_leads")
          .select("id, name, email, status, total_price, created_at, selected_config, starting_point")
          .order("created_at", { ascending: false }),
        supabase.from("blog_posts").select("id,status"),
        supabase.from("projects").select("id,main_category"),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
        supabase.from("sample_previews").select("id,slug"),
        supabase.from("user_profiles").select("id,is_primary_owner"),
        supabase
          .from("page_visits")
          .select("visitor_id")
          .eq("is_bot", false)
          .eq("is_admin", false)
          .gte("visited_at", weekAgoDate.toISOString()),
        supabase
          .from("page_visits")
          .select("visitor_id")
          .eq("is_bot", false)
          .eq("is_admin", false)
          .gte("visited_at", prevWeekStart.toISOString())
          .lt("visited_at", weekAgoDate.toISOString()),
        supabase
          .from("page_visits")
          .select("path")
          .eq("is_bot", false)
          .eq("is_admin", false)
          .like("path", "/sample/%"),
      ]);

      const leads = leadsRes.data ?? [];
      const weekAgo = weekAgoDate.getTime();
      const newThisWeek = leads.filter(
        (l) => l.status === "new" && new Date(l.created_at).getTime() >= weekAgo,
      ).length;
      const totalValue = leads.reduce((s, l) => s + (l.total_price ?? 0), 0);
      const counts: Record<string, number> = {};
      for (const l of leads) {
        const key = (l.starting_point as string | null) ?? "unknown";
        counts[key] = (counts[key] ?? 0) + 1;
      }
      const popular = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

      const blogRows = blogRes.data ?? [];
      const blogPublished = blogRows.filter((b: any) => b.status === "published").length;
      const blogDraft = blogRows.length - blogPublished;

      const projRows = projectsRes.data ?? [];
      const projectsWeb = projRows.filter((p: any) => p.main_category === "web_development").length;
      const projectsAI = projRows.filter((p: any) => p.main_category === "ai_integrator").length;
      const projectsPodcast = projRows.filter((p: any) => p.main_category === "ai_podcast").length;

      const samples = samplesRes.data ?? [];
      const sampleSlugs = new Set(samples.map((s: any) => s.slug));

      let samplesOpened: number | null = null;
      if (!sampleVisitsRes.error && sampleVisitsRes.data) {
        const opened = new Set<string>();
        for (const v of sampleVisitsRes.data as any[]) {
          const slug = (v.path as string).replace(/^\/sample\//, "").split(/[/?#]/)[0];
          if (slug && sampleSlugs.has(slug)) opened.add(slug);
        }
        samplesOpened = opened.size;
      }

      const visitorsWeek =
        !visitsRes.error && visitsRes.data
          ? new Set((visitsRes.data as any[]).map((v) => v.visitor_id)).size
          : null;
      const visitorsPrevWeek =
        !prevVisitsRes.error && prevVisitsRes.data
          ? new Set((prevVisitsRes.data as any[]).map((v) => v.visitor_id)).size
          : null;

      const team = teamRes.data ?? [];
      const teamOwners = team.filter((t: any) => t.is_primary_owner).length;

      setStats({
        total: leads.length,
        newThisWeek,
        totalValue,
        popularBuild: popular === "unknown" ? "—" : popular.replace(/_/g, " "),
        blogTotal: blogRows.length,
        blogPublished,
        blogDraft,
        projectsTotal: projRows.length,
        projectsWeb,
        projectsAI,
        projectsPodcast,
        subscribers: subsRes.count ?? 0,
        visitorsWeek,
        visitorsPrevWeek,
        samplesTotal: samples.length,
        samplesOpened,
        teamTotal: team.length,
        teamOwners,
      });
      setRecent(leads.slice(0, 5) as Lead[]);
      setNewLeadsCount(leads.filter((l) => l.status === "new").length);
      setLoading(false);
    })();
  }, [gate.status]);

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const visitorsTrend =
    stats.visitorsWeek !== null && stats.visitorsPrevWeek !== null
      ? computeTrend(stats.visitorsWeek, stats.visitorsPrevWeek)
      : null;

  return (
    <AdminShell email={gate.email} newLeadsCount={newLeadsCount}>
      <header className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
          // dashboard
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          Welcome{" "}
          <span className="bg-gradient-to-r from-[#3B82F6] to-[#F97316] bg-clip-text text-transparent">
            Back
          </span>
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Here's what's happening with your site.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard
          icon={Target}
          accent="blue"
          label="Total Leads"
          value={loading ? "…" : String(stats.total)}
        />
        <StatCard
          icon={TrendingUp}
          accent="emerald"
          label="New This Week"
          value={loading ? "…" : String(stats.newThisWeek)}
          sub="Status: new · last 7 days"
        />
        <StatCard
          icon={DollarSign}
          accent="orange"
          label="Total Quote Value"
          value={loading ? "…" : formatCurrency(stats.totalValue)}
        />
        <StatCard
          icon={Award}
          accent="violet"
          label="Most Popular Start"
          value={loading ? "…" : stats.popularBuild}
          sub="Top starting point"
        />
        <StatCard
          icon={FileText}
          accent="blue"
          label="Total Blog Posts"
          value={loading ? "…" : String(stats.blogTotal)}
          sub={loading ? undefined : `${stats.blogPublished} published, ${stats.blogDraft} draft`}
        />
        <StatCard
          icon={Layers}
          accent="orange"
          label="Total Projects"
          value={loading ? "…" : String(stats.projectsTotal)}
          sub={
            loading
              ? undefined
              : `${stats.projectsWeb} Web Dev · ${stats.projectsAI} AI Integrator · ${stats.projectsPodcast} AI Podcast`
          }
        />
        <StatCard
          icon={Mail}
          accent="rose"
          label="Newsletter Subscribers"
          value={loading ? "…" : String(stats.subscribers)}
          sub="Active list"
        />
        <StatCard
          icon={Users}
          accent="emerald"
          label="This Week's Visitors"
          value={
            loading
              ? "…"
              : stats.visitorsWeek !== null
                ? String(stats.visitorsWeek)
                : "—"
          }
          sub={
            stats.visitorsWeek === null && !loading
              ? "Analytics access required"
              : "Unique visitors · last 7 days"
          }
          trend={visitorsTrend}
        />
        <StatCard
          icon={Link2}
          accent="amber"
          label="Sample Links"
          value={
            loading
              ? "…"
              : `${stats.samplesTotal} / ${stats.samplesOpened ?? "—"}`
          }
          sub={
            loading
              ? undefined
              : stats.samplesOpened !== null
                ? `${stats.samplesTotal} sent, ${stats.samplesOpened} opened`
                : `${stats.samplesTotal} sent · opens require analytics`
          }
        />
        <StatCard
          icon={UserCog}
          accent="violet"
          label="Team Members"
          value={loading ? "…" : String(stats.teamTotal)}
          sub={
            loading
              ? undefined
              : `${stats.teamOwners} Owner${stats.teamOwners === 1 ? "" : "s"}, ${Math.max(0, stats.teamTotal - stats.teamOwners)} invited`
          }
        />
      </section>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent leads */}
        <div className="lg:col-span-3">
          <div className="mb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
              // pipeline
            </div>
            <div className="mt-1 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Recent Leads</h2>
              <Link
                to="/admin/leads"
                className="text-xs text-[#3B82F6] hover:underline inline-flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="card-elevated card-elevated-hover overflow-hidden p-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-white/50">Loading…</div>
            ) : recent.length === 0 ? (
              <div className="p-8 text-center text-sm text-white/50">
                No leads yet — they'll appear here when someone uses the builder.
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {recent.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      to="/admin/leads"
                      className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-white/[0.04]"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-white">
                          {lead.name || lead.email || "Anonymous"}
                        </div>
                        <div className="truncate text-xs text-white/45">
                          {lead.email || "—"} · {timeAgo(lead.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs text-white/80">
                          {formatCurrency(lead.total_price)}
                        </span>
                        <StatusBadge status={lead.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2">
          <div className="mb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
              // shortcuts
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="card-elevated space-y-2 p-4">
            <Link
              to="/admin/leads"
              className="flex items-center justify-between rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(59,130,246,0.5)] transition hover:brightness-110"
            >
              <span className="inline-flex items-center gap-2">
                <Target className="h-4 w-4" /> View All Leads
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/sample-builder/new"
              className="flex items-center justify-between rounded-md border border-white/10 bg-[#16181D] px-4 py-2.5 text-sm text-white/85 transition hover:border-[#3B82F6]/40 hover:bg-white/[0.05]"
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#F97316]" /> Create New Sample
              </span>
              <ArrowRight className="h-4 w-4 text-white/50" />
            </Link>
            <Link
              to="/admin/blog/new"
              className="flex items-center justify-between rounded-md border border-white/10 bg-[#16181D] px-4 py-2.5 text-sm text-white/85 transition hover:border-[#3B82F6]/40 hover:bg-white/[0.05]"
            >
              <span className="inline-flex items-center gap-2">
                <PenSquare className="h-4 w-4 text-[#3B82F6]" /> New Blog Post
              </span>
              <ArrowRight className="h-4 w-4 text-white/50" />
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center justify-between rounded-md border border-white/10 bg-[#16181D] px-4 py-2.5 text-sm text-white/85 transition hover:border-[#3B82F6]/40 hover:bg-white/[0.05]"
            >
              <span className="inline-flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-300" /> View Analytics
              </span>
              <ArrowRight className="h-4 w-4 text-white/50" />
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-md border border-white/10 bg-[#16181D] px-4 py-2.5 text-sm text-white/85 transition hover:border-[#3B82F6]/40 hover:bg-white/[0.05]"
            >
              <span className="inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-white/60" /> Back to Website
              </span>
              <ArrowRight className="h-4 w-4 text-white/50" />
            </a>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
