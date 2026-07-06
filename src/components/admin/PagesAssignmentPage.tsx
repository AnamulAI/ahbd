import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save, Home, Compass } from "lucide-react";
import { toast } from "sonner";

import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getPageAssignments, updatePageAssignments } from "@/lib/pages-settings.functions";
import { useMyProfile } from "@/hooks/use-my-permissions";
import { Link } from "@tanstack/react-router";
import { NavFooterSection } from "@/components/admin/NavFooterSection";

const PAGE_OPTIONS: { label: string; value: string }[] = [
  { label: "Home", value: "/" },
  { label: "Web Development", value: "/services/web-development" },
  { label: "AI Integrator", value: "/services/ai-integrator" },
  { label: "AI Podcast", value: "/services/ai-podcast" },
  { label: "Blog", value: "/blog" },
  { label: "Projects", value: "/projects" },
  { label: "About", value: "/about" },
  { label: "Contact", value: "/contact" },
];

export function PagesAssignmentPage() {
  const gate = useAdminGate();
  const { data: profile } = useMyProfile();
  const qc = useQueryClient();
  const fetchAssignments = useServerFn(getPageAssignments);
  const saveAssignments = useServerFn(updatePageAssignments);

  const { data, isLoading } = useQuery({
    queryKey: ["page-assignments"],
    queryFn: () => fetchAssignments(),
    enabled: gate.status === "ok",
  });

  const [home, setHome] = useState("/");
  const [services, setServices] = useState("/services/web-development");

  useEffect(() => {
    if (data) {
      setHome(data.home_page_route);
      setServices(data.services_page_route);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => saveAssignments({ data: { home_page_route: home, services_page_route: services } }),
    onSuccess: () => {
      toast.success("Page assignments saved");
      qc.invalidateQueries({ queryKey: ["page-assignments"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Save failed");
    },
  });

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (profile && !profile.sections.pages && !profile.is_primary_owner) {
    return (
      <AdminShell email={gate.email}>
        <div className="rounded-xl border border-white/[0.08] bg-[#121A2E] p-8 text-center">
          <h1 className="font-display text-xl font-bold text-white">Access denied</h1>
          <p className="mt-2 text-sm text-white/60">
            You do not have permission to manage Pages.
          </p>
          <Link to="/admin" className="mt-4 inline-block text-sm text-[#3B82F6] hover:underline">
            Back to dashboard
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell email={gate.email}>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          Pages
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Choose which existing page each core route points to.
        </p>
      </header>

      <div className="max-w-2xl space-y-6">
        <PageDropdown
          icon={<Home className="h-4 w-4 text-[#3B82F6]" />}
          title="Home Page"
          description='Assigned to the root "/" route.'
          value={home}
          onChange={setHome}
          disabled={isLoading}
        />

        <PageDropdown
          icon={<Compass className="h-4 w-4 text-[#F97316]" />}
          title="Services Page"
          description='The "Services" link in the main site navigation points here.'
          value={services}
          onChange={setServices}
          disabled={isLoading}
        />

        <div className="flex justify-end">
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || isLoading}
            className="bg-gradient-to-r from-[#3B82F6] to-[#F97316] text-white hover:opacity-90"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      <NavFooterSection />
    </AdminShell>
  );
}

function PageDropdown({
  icon,
  title,
  description,
  value,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#121A2E] p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <Label className="text-sm font-semibold text-white">{title}</Label>
      </div>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-[#0A0E1A] border-white/10 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#121A2E] border-white/10 text-white">
          {PAGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label} <span className="ml-2 text-xs text-white/40">{opt.value}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="mt-2 text-xs text-white/55">
        {description} This changes what visitors see immediately — choose carefully.
      </p>
    </div>
  );
}
