import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X, MessageCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AdminShell,
  StatusBadge,
  STATUS_OPTIONS,
  STATUS_STYLES,
  useAdminGate,
} from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/leads")({
  ssr: false,
  head: () => ({ meta: [{ title: "Leads — AnamDev Admin" }] }),
  component: LeadsPage,
});

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  status: string;
  total_price: number | null;
  chosen_payment_plan: string | null;
  starting_point: string | null;
  idea_description: string | null;
  selected_config: Record<string, unknown> | null;
  created_at: string;
};

function formatCurrency(n: number | null | undefined) {
  if (!n) return "—";
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

function LeadsPage() {
  const gate = useAdminGate();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "value">("newest");
  const [selected, setSelected] = useState<Lead | null>(null);

  async function loadLeads() {
    const { data, error } = await supabase
      .from("builder_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setLeads((data ?? []) as Lead[]);
    setLoading(false);
  }

  useEffect(() => {
    if (gate.status === "ok") loadLeads();
  }, [gate.status]);

  async function updateStatus(id: string, status: string) {
    const prev = leads;
    setLeads((curr) => curr.map((l) => (l.id === id ? { ...l, status } : l)));
    if (selected?.id === id) setSelected({ ...selected, status });
    const { error } = await supabase
      .from("builder_leads")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      setLeads(prev);
    } else {
      toast.success(`Status → ${status}`);
    }
  }

  const filtered = useMemo(() => {
    let out = leads;
    if (statusFilter !== "all") out = out.filter((l) => l.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.whatsapp?.toLowerCase().includes(q),
      );
    }
    out = [...out];
    if (sort === "value") {
      out.sort((a, b) => (b.total_price ?? 0) - (a.total_price ?? 0));
    } else {
      out.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return out;
  }, [leads, search, statusFilter, sort]);

  const newCount = leads.filter((l) => l.status === "new").length;

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <AdminShell email={gate.email} newLeadsCount={newCount}>
      <header className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
          // leads
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-white/55">
          Everyone who's built a custom quote.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, email, whatsapp…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-white/[0.1] bg-[#16181D] py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white focus:border-[#3B82F6]/60 focus:outline-none"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "value")}
          className="rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white focus:border-[#3B82F6]/60 focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="value">Highest value first</option>
        </select>
      </div>

      {/* Table */}
      <div className="card-elevated card-elevated-hover overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-white/50">Loading leads…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-white/50">
              <Search className="h-5 w-5" />
            </div>
            <div className="mt-3 text-sm font-medium text-white/70">
              No leads match your filters.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-left">
                <tr className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                  <th className="px-4 py-3 font-normal">Name</th>
                  <th className="px-4 py-3 font-normal">Contact</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal">Value</th>
                  <th className="px-4 py-3 font-normal">Plan</th>
                  <th className="px-4 py-3 font-normal">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className="cursor-pointer transition-colors hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3 text-white">
                      {lead.name || <span className="text-white/40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-white/75">
                      <div className="text-xs">{lead.email || "—"}</div>
                      <div className="text-xs text-white/45">{lead.whatsapp || "—"}</div>
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          STATUS_STYLES[lead.status] ?? "border-white/10 bg-transparent text-white"
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-[#0F1320] text-white">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono text-white/85">
                      {formatCurrency(lead.total_price)}
                    </td>
                    <td className="px-4 py-3 text-white/65 text-xs">
                      {lead.chosen_payment_plan || "—"}
                    </td>
                    <td className="px-4 py-3 text-white/55 text-xs">
                      {timeAgo(lead.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <LeadDetailModal
          lead={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(s) => updateStatus(selected.id, s)}
        />
      )}
    </AdminShell>
  );
}

function LeadDetailModal({
  lead,
  onClose,
  onStatusChange,
}: {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (s: string) => void;
}) {
  const waNumber = lead.whatsapp?.replace(/[^\d+]/g, "");
  const waUrl = waNumber
    ? `https://wa.me/${waNumber.replace(/^\+/, "")}?text=${encodeURIComponent(
        `Hi ${lead.name || "there"}, this is AnamDev about your custom build inquiry.`,
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0F1320] p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-white/50 hover:bg-white/[0.06] hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <h3 className="font-display text-xl font-bold text-white">
            {lead.name || "Anonymous Lead"}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
            <StatusBadge status={lead.status} />
            <span>·</span>
            <span>{new Date(lead.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <Field label="Email" value={lead.email} />
          <Field label="WhatsApp" value={lead.whatsapp} />
          <Field label="Starting Point" value={lead.starting_point} />
          <Field label="Payment Plan" value={lead.chosen_payment_plan} />
          <Field
            label="Total Quote"
            value={formatCurrency(lead.total_price)}
            mono
          />
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-white/45 mb-1">
              Status
            </label>
            <select
              value={lead.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className={`w-full rounded-md border px-2 py-1.5 text-sm ${
                STATUS_STYLES[lead.status] ?? "border-white/10 bg-[#16181D] text-white"
              }`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-[#0F1320] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {lead.idea_description && (
          <div className="mb-5">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-white/45 mb-1">
              Tell Me a Bit More
            </label>
            <div className="rounded-md border border-white/[0.08] bg-[#16181D] px-3 py-2 text-sm text-white/85 whitespace-pre-wrap">
              {lead.idea_description}
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="block font-mono text-[10px] uppercase tracking-wider text-white/45 mb-1">
            Selected Configuration
          </label>
          <ConfigDisplay config={lead.selected_config} />
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/[0.06]">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[#25D366]/60 bg-[#16181D] px-4 py-2 text-sm font-semibold text-[#25D366] hover:bg-[#25D366]/10"
            >
              <MessageCircle className="h-4 w-4" /> Message on WhatsApp
            </a>
          )}
          {lead.status !== "contacted" && (
            <button
              type="button"
              onClick={() => onStatusChange("contacted")}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 py-2 text-sm font-semibold text-white"
            >
              <CheckCircle2 className="h-4 w-4" /> Mark as Contacted
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-wider text-white/45 mb-1">
        {label}
      </label>
      <div
        className={`rounded-md border border-white/[0.08] bg-[#16181D] px-3 py-1.5 text-sm text-white/85 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || <span className="text-white/40">—</span>}
      </div>
    </div>
  );
}

function ConfigDisplay({ config }: { config: Record<string, unknown> | null }) {
  if (!config || Object.keys(config).length === 0) {
    return (
      <div className="rounded-md border border-white/[0.08] bg-[#16181D] px-3 py-2 text-sm text-white/40">
        No configuration selected.
      </div>
    );
  }

  // Try grouping by known top-level keys (website / ai_agent / podcast)
  const groups: { label: string; color: string; data: unknown }[] = [];
  const knownKeys: Record<string, { label: string; color: string }> = {
    website: { label: "WEBSITE", color: "#3B82F6" },
    ai_agent: { label: "AI AGENT", color: "#A855F7" },
    podcast: { label: "PODCAST", color: "#F97316" },
  };

  for (const [k, v] of Object.entries(config)) {
    if (knownKeys[k] && v && typeof v === "object") {
      groups.push({ ...knownKeys[k], data: v });
    }
  }

  if (groups.length === 0) {
    return (
      <pre className="rounded-md border border-white/[0.08] bg-[#16181D] p-3 text-xs text-white/75 overflow-x-auto">
        {JSON.stringify(config, null, 2)}
      </pre>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div
          key={g.label}
          className="rounded-md border border-white/[0.08] bg-[#16181D] p-3"
          style={{ borderLeft: `3px solid ${g.color}` }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-wider mb-2"
            style={{ color: g.color }}
          >
            {g.label}
          </div>
          <ul className="space-y-1 text-sm text-white/85">
            {Object.entries(g.data as Record<string, unknown>).map(([k, v]) => (
              <li key={k} className="flex justify-between gap-3">
                <span className="text-white/55">{k.replace(/_/g, " ")}</span>
                <span className="text-right">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
