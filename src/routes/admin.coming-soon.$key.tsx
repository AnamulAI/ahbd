import { createFileRoute, Link } from "@tanstack/react-router";
import { Construction, ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/coming-soon/$key")({
  ssr: false,
  head: () => ({ meta: [{ title: "Coming Soon — AnamDev Admin" }] }),
  component: ComingSoonPage,
});

const LABELS: Record<string, string> = {
  "builder-settings": "Builder Settings",
  blog: "Blog Posts",
  projects: "Projects",
  newsletter: "Newsletter",
  pages: "Pages",
  visibility: "Visibility Control",
  seo: "SEO & Tracking",
  branding: "Branding",
};

function ComingSoonPage() {
  const gate = useAdminGate();
  const { key } = Route.useParams();
  const label = LABELS[key] ?? "This Section";

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <AdminShell email={gate.email}>
      <div className="max-w-xl mx-auto text-center py-12">
        <div
          aria-hidden
          className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#3B82F6]/10"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#3B82F6]/40 to-[#F97316]/40 blur-xl opacity-50" />
          <Construction className="relative h-9 w-9 text-[#3B82F6]" />
        </div>
        <h1 className="font-display text-2xl font-bold">{label}</h1>
        <p className="mt-2 text-sm text-white/55">
          This section isn't built yet. It's on the roadmap and will appear here
          once it's ready.
        </p>
        <Link
          to="/admin"
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#16181D] px-4 py-2 text-sm text-white/85 hover:bg-white/[0.05]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    </AdminShell>
  );
}
