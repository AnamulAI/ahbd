import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Target,
  Settings2,
  FileText,
  FolderKanban,
  Mail,
  PanelRight,
  Layout,
  Eye,
  Search,
  Plug,
  Palette,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Wand2,
  BarChart3,
  type LucideIcon,
  UserCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ProjectsSidebarSection } from "@/components/admin/ProjectsSidebarSection";
import { useMyProfile } from "@/hooks/use-my-permissions";

import type { SectionKey } from "@/lib/profile.functions";


type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  badgeKey?: "leads";
  sectionKey?: SectionKey;
};

type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard, sectionKey: "dashboard" },
      { label: "Leads", to: "/admin/leads", icon: Target, badgeKey: "leads", sectionKey: "leads" },
      { label: "Sample Builder", to: "/admin/sample-builder", icon: Wand2, sectionKey: "sample_builder" },
    ],
  },
  {
    label: "Builder",
    items: [
      { label: "Builder Settings", to: "/admin/builder-settings", icon: Settings2, sectionKey: "builder_settings" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog Posts", to: "/admin/blog", icon: FileText, sectionKey: "blog_posts" },
      { label: "Sidebar Cards", to: "/admin/blog-sidebar-cards", icon: PanelRight, sectionKey: "sidebar_cards" },
      { label: "__projects_tree__", to: "/admin/projects", icon: FolderKanban, sectionKey: "projects" },
      { label: "Newsletter", to: "/admin/newsletter", icon: Mail, sectionKey: "newsletter" },
    ],
  },
  {
    label: "Site",
    items: [
      { label: "Pages", to: "/admin/pages", icon: Layout, sectionKey: "pages" },
      {
        label: "Visibility Control",
        to: "/admin/coming-soon/visibility",
        icon: Eye,
        comingSoon: true,
      },
      { label: "SEO & Tracking", to: "/admin/seo", icon: Search, sectionKey: "seo_tracking" },
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3, sectionKey: "analytics" },
      { label: "Integrations", to: "/admin/integrations", icon: Plug, sectionKey: "integrations" },
      { label: "Branding", to: "/admin/coming-soon/branding", icon: Palette, comingSoon: true },
    ],
  },
];

export const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/40",
  contacted: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  won: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  lost: "bg-red-500/15 text-red-300 border-red-500/40",
};

export const STATUS_OPTIONS = ["new", "contacted", "won", "lost"] as const;
export type LeadStatus = (typeof STATUS_OPTIONS)[number];

export function StatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status] ?? "bg-white/10 text-white/80 border-white/20";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        style,
      )}
    >
      {status}
    </span>
  );
}
function pathToSection(pathname: string): SectionKey | null {
  if (pathname === "/admin" || pathname === "/admin/") return "dashboard";
  if (pathname.startsWith("/admin/leads")) return "leads";
  if (pathname.startsWith("/admin/sample-builder")) return "sample_builder";
  if (pathname.startsWith("/admin/builder-settings")) return "builder_settings";
  if (pathname.startsWith("/admin/blog-sidebar-cards")) return "sidebar_cards";
  if (pathname.startsWith("/admin/blog")) return "blog_posts";
  if (pathname.startsWith("/admin/projects")) return "projects";
  if (pathname.startsWith("/admin/newsletter")) return "newsletter";
  if (pathname.startsWith("/admin/pages")) return "pages";
  if (pathname.startsWith("/admin/seo")) return "seo_tracking";
  if (pathname.startsWith("/admin/analytics")) return "analytics";
  if (pathname.startsWith("/admin/integrations")) return "integrations";
  if (pathname.startsWith("/admin/profile")) return "profile";
  return null;
}

// Dashboard and Profile are always accessible to any signed-in admin as safe landing pages.
const ALWAYS_ALLOWED: ReadonlySet<SectionKey> = new Set(["dashboard", "profile"]);

export function AdminShell({
  children,
  newLeadsCount = 0,
  email,
}: {
  children: ReactNode;
  newLeadsCount?: number;
  email?: string | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile } = useMyProfile();
  const avatarUrl = profile?.avatar_url ?? null;

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  const initial = (email || "A").trim().charAt(0).toUpperCase();

  function itemAllowed(item: NavItem): boolean {
    if (item.comingSoon) return true;
    if (!item.sectionKey) return true;
    if (ALWAYS_ALLOWED.has(item.sectionKey)) return true;
    if (!profile) return true; // don't hide while loading
    return profile.is_primary_owner || Boolean(profile.sections[item.sectionKey]);
  }

  const currentSection = pathToSection(pathname);
  const currentAllowed =
    !currentSection ||
    ALWAYS_ALLOWED.has(currentSection) ||
    !profile ||
    profile.is_primary_owner ||
    Boolean(profile.sections[currentSection]);

  const SidebarInner = (
    <div className="flex h-full flex-col bg-[#0A0E1A] text-white">
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
        <Link to="/admin" className="font-display text-xl font-bold tracking-tight">
          {"{"}
          <span className="text-white">Anam</span>
          <span className="text-[#3B82F6]">Dev</span>
          {"}"}
        </Link>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          Admin Panel
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-5">
        {NAV.map((group) => {
          const visibleItems = group.items.filter(
            (i) => i.label === "__projects_tree__" ? itemAllowed(i) : itemAllowed(i),
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} className="mb-5">
              <div className="px-3 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  if (item.label === "__projects_tree__") {
                    return (
                      <li key="__projects_tree__">
                        <ProjectsSidebarSection onNavigate={() => setMobileOpen(false)} />
                      </li>
                    );
                  }
                  const Icon = item.icon;
                  const active =
                    pathname === item.to ||
                    (item.to !== "/admin" && pathname.startsWith(item.to + "/"));
                  const badge =
                    item.badgeKey === "leads" && newLeadsCount > 0
                      ? newLeadsCount
                      : null;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30"
                            : "text-white/70 hover:text-white hover:bg-white/[0.05] border border-transparent",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-[#3B82F6]" : "text-white/50",
                          )}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge !== null && (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3B82F6] px-1.5 text-[10px] font-semibold text-white">
                            {badge}
                          </span>
                        )}
                        {item.comingSoon && (
                          <span className="rounded-sm bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/45">
                            Soon
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] px-3 py-4 space-y-2">
        <Link
          to="/admin/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-white/[0.05] transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#F97316] text-sm font-bold text-white overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-white/85">
              {profile?.full_name || email || "Admin"}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
              {profile?.role_label ?? "Signed in"} · View profile
            </div>
          </div>
          <UserCircle className="h-4 w-4 text-white/40" />
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Back to Website
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 lg:hidden">
        <Link to="/admin" className="font-display text-lg font-bold">
          {"{"}<span className="text-white">Anam</span><span className="text-[#3B82F6]">Dev</span>{"}"}
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-md p-2 text-white/70 hover:bg-white/[0.06] hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="lg:flex">
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-white/[0.06]">
          {SidebarInner}
        </aside>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 w-72 border-r border-white/[0.06]">
              {SidebarInner}
            </aside>
          </div>
        )}

        <main className="flex-1 lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            {currentAllowed ? (
              children
            ) : (
              <AccessDenied section={currentSection} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function AccessDenied({ section }: { section: SectionKey | null }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#121A2E] p-10 text-center">
      <h1 className="font-display text-2xl font-bold text-white">Access denied</h1>
      <p className="mt-2 text-sm text-white/60">
        You do not have permission to view
        {section ? ` the "${section.replace(/_/g, " ")}" section` : " this section"}.
        Contact the primary owner if you need access.
      </p>
      <Link
        to="/admin"
        className="mt-6 inline-block rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 py-2 text-sm font-semibold text-white"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export function useAdminGate() {
  const navigate = useNavigate();
  const [state, setState] = useState<{
    status: "loading" | "ok";
    email: string | null;
  }>({ status: "loading", email: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        navigate({ to: "/admin/login" });
        return;
      }
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (!roleRow) {
        await supabase.auth.signOut();
        navigate({ to: "/admin/login" });
        return;
      }
      setState({ status: "ok", email: session.user.email ?? null });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return state;
}
