import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Code2, Menu, MessageCircle, Mic, Sparkles, X } from "lucide-react";
import { getPageAssignments } from "@/lib/pages-settings.functions";

type NavLink = {
  label: string;
  to: string;
  dynamicKey?: "services";
  children?: ReadonlyArray<{
    label: string;
    to: string;
    subtitle: string;
    icon: typeof Code2;
  }>;
};

const SERVICE_ITEMS = [
  {
    label: "Web Development",
    to: "/services/web-development",
    subtitle: "Websites & Web Apps",
    icon: Code2,
  },
  {
    label: "AI Integrator",
    to: "/services/ai-integrator",
    subtitle: "Business Automation & AI Solutions",
    icon: Sparkles,
  },
  {
    label: "AI Podcast",
    to: "/services/ai-podcast",
    subtitle: "AI-Powered Podcast Production",
    icon: Mic,
  },
] as const;

const DEFAULT_SERVICES_ROUTE = "/services/web-development";

function useServicesRoute(): string {
  const fetchAssignments = useServerFn(getPageAssignments);
  const { data } = useQuery({
    queryKey: ["site-settings", "services_page_route"],
    queryFn: async () => {
      const assignments = await fetchAssignments();
      return assignments.services_page_route || DEFAULT_SERVICES_ROUTE;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  return data ?? DEFAULT_SERVICES_ROUTE;
}

const NAV_LINKS: ReadonlyArray<NavLink> = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services/web-development", dynamicKey: "services", children: SERVICE_ITEMS },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

function Logo() {
  return (
    <Link
      to="/"
      aria-label="AnamDev home"
      className="font-mono text-base font-bold tracking-tight transition-colors"
    >
      <span className="text-muted-foreground">{"{"}</span>
      <span className="text-white">Anam</span>
      <span className="text-[color:var(--primary)]">Dev</span>
      <span className="text-muted-foreground">{"}"}</span>
    </Link>
  );
}

function isLinkActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
}

function ServicesDropdown({
  pathname,
  isActive,
  servicesRoute,
}: {
  pathname: string;
  isActive: boolean;
  servicesRoute: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLLIElement | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <li
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <Link
        to={servicesRoute}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-current={isActive ? "page" : undefined}
        onFocus={() => {
          cancelClose();
          setOpen(true);
        }}
        className={[
          "relative inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm transition-colors duration-200 motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]",
          isActive
            ? "font-semibold text-white"
            : "font-medium text-muted-foreground hover:text-[color:var(--primary)]",
        ].join(" ")}
      >
        Services
        <ChevronDown
          className={[
            "h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
          aria-hidden
        />
        {isActive && (
          <span
            aria-hidden
            className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[color:var(--primary)] shadow-[0_0_12px_var(--primary)]"
          />
        )}
      </Link>

      <div
        role="menu"
        aria-label="Services"
        className={[
          "absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 origin-top",
          "rounded-2xl border border-white/10 bg-[#16181D] p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]",
          "transition-all duration-200 motion-reduce:transition-none",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        ].join(" ")}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <ul className="flex flex-col">
          {SERVICE_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(pathname, item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={[
                    "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 motion-reduce:transition-none",
                    "hover:bg-white/[0.04] focus-visible:outline-none focus-visible:bg-white/[0.04]",
                    active ? "bg-white/[0.03]" : "",
                  ].join(" ")}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[color:var(--primary)]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span
                      className={[
                        "flex items-center gap-2 text-sm",
                        active ? "font-semibold text-white" : "font-medium text-white/90",
                      ].join(" ")}
                    >
                      {item.label}
                      {active && (
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 rounded-full bg-[color:var(--primary)] shadow-[0_0_8px_var(--primary)]"
                        />
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}

export type SiteHeaderProps = {
  /** Optional CTA override. If provided, scrolls to a section/element on the current page. */
  onCtaClick?: () => void;
  ctaLabel?: string;
};

export function SiteHeader({ onCtaClick, ctaLabel = "Let's Talk" }: SiteHeaderProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const servicesRoute = useServicesRoute();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(() =>
    pathname.startsWith("/services"),
  );

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = link.dynamicKey === "services"
                ? pathname.startsWith("/services") || isLinkActive(pathname, servicesRoute)
                : isLinkActive(pathname, link.to);
              if (link.children) {
                return (
                  <ServicesDropdown
                    key={link.to}
                    pathname={pathname}
                    isActive={isActive}
                    servicesRoute={servicesRoute}
                  />
                );
              }
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "relative inline-flex h-9 items-center rounded-full px-3 text-sm transition-colors duration-200 motion-reduce:transition-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]",
                      isActive
                        ? "font-semibold text-white"
                        : "font-medium text-muted-foreground hover:text-[color:var(--primary)]",
                    ].join(" ")}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[color:var(--primary)] shadow-[0_0_12px_var(--primary)]"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {onCtaClick ? (
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex items-center gap-2 rounded-full btn-gradient min-h-9 text-center px-4 py-2 text-sm font-semibold text-black shadow-[0_8px_30px_-8px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_14px_40px_-8px_var(--vo-glow)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--orange)] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{ctaLabel}</span>
            </button>
          ) : (
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full btn-gradient min-h-9 text-center px-4 py-2 text-sm font-semibold text-black shadow-[0_8px_30px_-8px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_14px_40px_-8px_var(--vo-glow)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--orange)] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{ctaLabel}</span>
            </Link>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition-colors duration-200 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] md:hidden motion-reduce:transition-none"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={[
          "md:hidden overflow-hidden border-t border-white/5 transition-[max-height,opacity] duration-300 motion-reduce:transition-none",
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = link.dynamicKey === "services"
                ? pathname.startsWith("/services") || isLinkActive(pathname, servicesRoute)
                : isLinkActive(pathname, link.to);
              if (link.children) {
                return (
                  <li key={link.to} className="flex flex-col">
                    <div
                      className={[
                        "flex h-11 items-center rounded-xl text-sm transition-colors duration-200 motion-reduce:transition-none",
                        isActive
                          ? "font-semibold text-white"
                          : "font-medium text-muted-foreground hover:text-white",
                      ].join(" ")}
                    >
                      <Link
                        to={servicesRoute}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setMobileOpen(false)}
                        className="flex h-full min-w-0 flex-1 items-center px-3"
                      >
                        Services
                      </Link>
                      <button
                        type="button"
                        aria-label="Toggle services menu"
                        aria-expanded={mobileServicesOpen}
                        onClick={() => setMobileServicesOpen((v) => !v)}
                        className="flex h-full w-11 shrink-0 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                      >
                        <ChevronDown
                          className={[
                            "h-4 w-4 transition-transform duration-200 motion-reduce:transition-none",
                            mobileServicesOpen ? "rotate-180" : "rotate-0",
                          ].join(" ")}
                          aria-hidden
                        />
                      </button>
                    </div>
                    <div
                      className={[
                        "overflow-hidden transition-[max-height,opacity] duration-300 motion-reduce:transition-none",
                        mobileServicesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                      ].join(" ")}
                    >
                      <ul className="ml-3 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
                        {SERVICE_ITEMS.map((item) => {
                          const Icon = item.icon;
                          const subActive = isLinkActive(pathname, item.to);
                          return (
                            <li key={item.to}>
                              <Link
                                to={item.to}
                                onClick={() => setMobileOpen(false)}
                                className={[
                                  "flex items-start gap-3 rounded-lg px-2 py-2 transition-colors duration-200 motion-reduce:transition-none",
                                  "hover:bg-white/[0.04]",
                                  subActive ? "bg-white/[0.03]" : "",
                                ].join(" ")}
                              >
                                <Icon className="mt-0.5 h-4 w-4 text-[color:var(--primary)]" aria-hidden />
                                <span className="flex flex-col">
                                  <span
                                    className={[
                                      "text-sm",
                                      subActive
                                        ? "font-semibold text-white"
                                        : "font-medium text-white/90",
                                    ].join(" ")}
                                  >
                                    {item.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {item.subtitle}
                                  </span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              }
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "flex h-11 items-center rounded-xl px-3 text-sm transition-colors duration-200 motion-reduce:transition-none",
                      isActive
                        ? "font-semibold text-white"
                        : "font-medium text-muted-foreground hover:text-white",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
