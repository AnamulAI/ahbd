import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Copy,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createSocialProofLogo,
  deleteSample,
  deleteSocialProofLogo,
  listSamples,
  listSocialProofLogos,
  reorderSocialProofLogos,
} from "@/lib/sample-builder.functions";

type Sample = {
  id: string;
  slug: string;
  business_name: string;
  created_at: string;
  logo_url: string | null;
};

export function SampleBuilderListPage() {
  const gate = useAdminGate();

  if (gate.status === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <AdminShell email={gate.email}>
      <ListInner />
    </AdminShell>
  );
}

function ListInner() {
  const navigate = useNavigate();
  const listFn = useServerFn(listSamples);
  const deleteFn = useServerFn(deleteSample);

  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Sample | null>(null);

  const refresh = async () => {
    const res = await listFn();
    setSamples((res.samples as Sample[]) ?? []);
    if (res.error) toast.error(res.error);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return samples;
    return samples.filter(
      (s) =>
        s.business_name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q),
    );
  }, [samples, search]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function doDelete() {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setConfirmDelete(null);
    const res = await deleteFn({ data: { id } });
    if (!res.ok) return toast.error(res.error || "Failed to delete");
    toast.success("Sample deleted");
    setSamples((cur) => cur.filter((s) => s.id !== id));
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
            // samples
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
            Sample Builder
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Create a personalized podcast preview to send to a prospect.
          </p>
        </div>
        <Link
          to="/admin/sample-builder/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> New Sample
        </Link>
      </div>

      <div className="mt-6 max-w-sm relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search samples…"
          className="w-full rounded-md border border-white/[0.1] bg-[#16181D] pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none"
        />
      </div>

      <div className="mt-5 card-elevated card-elevated-hover overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-white/50">
              <Wand2 className="h-5 w-5" />
            </div>
            <p className="text-sm text-white/60">
              {samples.length === 0 ? "No samples yet." : "No samples match your search."}
            </p>
            {samples.length === 0 && (
              <Link
                to="/admin/sample-builder/new"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" /> New Sample
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {filtered.map((s) => (
              <SampleRow
                key={s.id}
                sample={s}
                onEdit={() =>
                  navigate({ to: "/admin/sample-builder/$id", params: { id: s.id } })
                }
                onDuplicate={() => {
                  navigator.clipboard.writeText(`${origin}/sample/${s.slug}`);
                  toast.success("Link copied");
                }}
                onDelete={() => setConfirmDelete(s)}
              />
            ))}
          </ul>
        )}
      </div>

      <SocialProofLogosPanel />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this sample?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.business_name}” will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SampleRow({
  sample,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  sample: Sample;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04]">
      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-white/[0.06] bg-[#0B0F1A] flex items-center justify-center">
        {sample.logo_url ? (
          <img src={sample.logo_url} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <Wand2 className="h-5 w-5 text-white/30" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={onEdit}
          className="block truncate text-left text-sm font-medium text-white hover:text-[#3B82F6]"
        >
          {sample.business_name}
        </button>
        <div className="truncate text-[11px] text-white/45 font-mono">
          /sample/{sample.slug}
        </div>
      </div>
      <a
        href={`/sample/${sample.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-white/50 transition-colors hover:text-[#3B82F6]"
        aria-label={`View ${sample.business_name} live in a new tab`}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        <span>View Live</span>
      </a>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white"
        aria-label="Copy link"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

// ---------------- Social Proof Logos ----------------

type LogoRow = { id: string; logo_url: string; sort_order: number };

function SocialProofLogosPanel() {
  const listFn = useServerFn(listSocialProofLogos);
  const createFn = useServerFn(createSocialProofLogo);
  const deleteFn = useServerFn(deleteSocialProofLogo);
  const reorderFn = useServerFn(reorderSocialProofLogos);
  const [logos, setLogos] = useState<LogoRow[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    listFn().then((r) => setLogos((r.logos as LogoRow[]) || []));
  };
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) return toast.error("Logo must be under 2MB");
    const reader = new FileReader();
    reader.onload = async () => {
      setBusy(true);
      try {
        const res = await createFn({
          data: { logo_base64: reader.result as string, logo_filename: file.name },
        });
        if (!res.ok) return toast.error(res.error || "Failed");
        toast.success("Logo added");
        refresh();
      } finally {
        setBusy(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...logos];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setLogos(next);
    await reorderFn({ data: { ids: next.map((l) => l.id) } });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this logo?")) return;
    const res = await deleteFn({ data: { id } });
    if (!res.ok) return toast.error(res.error || "Failed");
    refresh();
  };

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
            // social proof
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold">Social Proof Logos</h2>
          <p className="text-xs text-white/50">
            Shown on all sample pages. Global list, not per-sample.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.04] px-3 text-xs font-medium text-white hover:bg-white/[0.08] disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Upload Logo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
      <div className="card-elevated card-elevated-hover p-4">
        {logos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-white/50">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-sm text-white/50">No logos yet.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {logos.map((l, i) => (
              <li
                key={l.id}
                className="flex items-center gap-3 rounded-md border border-white/[0.08] bg-[#16181D] p-3 transition-colors hover:bg-white/[0.04]"
              >
                <img src={l.logo_url} alt="" className="h-10 w-24 rounded bg-white object-contain p-1" />
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === logos.length - 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
