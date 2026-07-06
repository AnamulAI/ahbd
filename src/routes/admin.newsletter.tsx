import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Download, Users, UserCheck, UserMinus, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { fmtDate } from "@/lib/admin-content-helpers";

export const Route = createFileRoute("/admin/newsletter")({
  ssr: false,
  head: () => ({ meta: [{ title: "Newsletter — AnamDev Admin" }] }),
  component: NewsletterPage,
});

type Subscriber = {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
};

function NewsletterPage() {
  const gate = useAdminGate();
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });
    if (error) toast.error(error.message);
    setSubs((data ?? []) as Subscriber[]);
    setLoading(false);
  }

  useEffect(() => {
    if (gate.status === "ok") load();
  }, [gate.status]);

  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return {
      total: subs.length,
      newWeek: subs.filter((s) => new Date(s.subscribed_at).getTime() >= weekAgo).length,
      active: subs.filter((s) => s.status === "active").length,
      unsubscribed: subs.filter((s) => s.status === "unsubscribed").length,
    };
  }, [subs]);

  const filtered = useMemo(
    () =>
      search
        ? subs.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()))
        : subs,
    [subs, search],
  );

  function exportCsv() {
    const rows = [
      ["Email", "Status", "Subscribed at", "Unsubscribed at"],
      ...subs.map((s) => [s.email, s.status, s.subscribed_at, s.unsubscribed_at ?? ""]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
            // newsletter
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold">Newsletter</h1>
          <p className="mt-1 text-sm text-white/60">View-only — subscribers come from the website signup form.</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={subs.length === 0}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.04] px-4 text-sm font-medium text-white hover:bg-white/[0.08] disabled:opacity-60"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Subscribers" value={stats.total} />
        <StatCard icon={<UserPlus className="h-5 w-5" />} label="New This Week" value={stats.newWeek} accent="#3B82F6" />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Active" value={stats.active} accent="#22C55E" />
        <StatCard icon={<UserMinus className="h-5 w-5" />} label="Unsubscribed" value={stats.unsubscribed} accent="#94A3B8" />
      </div>

      <div className="mt-6 max-w-sm relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search email…"
          className="w-full rounded-md border border-white/[0.1] bg-[#16181D] pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors duration-[250ms] ease hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
        />
      </div>

      <div className="mt-4 card-elevated card-elevated-hover overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-white/50">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm text-white/60">
              {subs.length === 0 ? "No subscribers yet." : "No matches for that search."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-4 py-3 w-44">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white/90">{s.email}</td>
                  <td className="px-2 py-3">
                    {s.status === "active" ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">Active</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white/55">Unsubscribed</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">{fmtDate(s.subscribed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = "#3B82F6",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="card-elevated card-elevated-hover relative overflow-hidden p-5 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            {label}
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
        </div>
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
          style={{
            color: accent,
            background: `${accent}26`,
            boxShadow: `inset 0 0 0 1px ${accent}4d`,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
