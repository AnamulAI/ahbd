import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Target,
  TrendingUp,
  DollarSign,
  Award,
  ArrowRight,
  ExternalLink,
  Settings2,
  Loader2,
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

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r from-[#3B82F6] via-[#3B82F6]/30 to-[#F97316] opacity-30 blur-xl"
      />
      <div className="relative rounded-xl border border-white/[0.08] bg-[#0F1320] p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3B82F6]/15">
            <Icon className="h-4 w-4 text-[#3B82F6]" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
            {label}
          </div>
        </div>
        <div className="font-display text-3xl font-bold text-white">{value}</div>
        {sub && <div className="mt-1 text-xs text-white/45">{sub}</div>}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const gate = useAdminGate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    newThisWeek: 0,
    totalValue: 0,
    popularBuild: "—",
  });
  const [recent, setRecent] = useState<Lead[]>([]);
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  useEffect(() => {
    if (gate.status !== "ok") return;
    (async () => {
      const { data: leads } = await supabase
        .from("builder_leads")
        .select("id, name, email, status, total_price, created_at, selected_config, starting_point")
        .order("created_at", { ascending: false });

      if (!leads) return;

      const weekAgo = Date.now() - 7 * 86400_000;
      const newThisWeek = leads.filter(
        (l) => l.status === "new" && new Date(l.created_at).getTime() >= weekAgo,
      ).length;
      const totalValue = leads.reduce((s, l) => s + (l.total_price ?? 0), 0);

      // Most popular starting_point (simplest meaningful aggregate)
      const counts: Record<string, number> = {};
      for (const l of leads) {
        const key = (l.starting_point as string | null) ?? "unknown";
        counts[key] = (counts[key] ?? 0) + 1;
      }
      const popular =
        Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

      setStats({
        total: leads.length,
        newThisWeek,
        totalValue,
        popularBuild: popular === "unknown" ? "—" : popular.replace(/_/g, " "),
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

  return (
    <AdminShell email={gate.email} newLeadsCount={newLeadsCount}>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome{" "}
          <span className="bg-gradient-to-r from-[#3B82F6] to-[#F97316] bg-clip-text text-transparent">
            Back
          </span>
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Here's what's happening with your site.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Total Leads"
          value={loading ? "…" : String(stats.total)}
        />
        <StatCard
          icon={TrendingUp}
          label="New This Week"
          value={loading ? "…" : String(stats.newThisWeek)}
          sub="Status: new · last 7 days"
        />
        <StatCard
          icon={DollarSign}
          label="Total Quote Value"
          value={loading ? "…" : formatCurrency(stats.totalValue)}
        />
        <StatCard
          icon={Award}
          label="Most Popular Start"
          value={loading ? "…" : stats.popularBuild}
          sub="Top starting point"
        />
      </section>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent leads */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Recent Leads</h2>
            <Link
              to="/admin/leads"
              className="text-xs text-[#3B82F6] hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[#0F1320] overflow-hidden">
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
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.03]"
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
          <h2 className="font-display text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2 rounded-xl border border-white/[0.08] bg-[#0F1320] p-4">
            <Link
              to="/admin/leads"
              className="flex items-center justify-between rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Target className="h-4 w-4" /> View All Leads
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/coming-soon/$key"
              params={{ key: "builder-settings" }}
              className="flex items-center justify-between rounded-md border border-white/10 bg-[#16181D] px-4 py-2.5 text-sm text-white/85 hover:bg-white/[0.05]"
            >
              <span className="inline-flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-white/60" /> Builder Settings
              </span>
              <ArrowRight className="h-4 w-4 text-white/50" />
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-md border border-white/10 bg-[#16181D] px-4 py-2.5 text-sm text-white/85 hover:bg-white/[0.05]"
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
