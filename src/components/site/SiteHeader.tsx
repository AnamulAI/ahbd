import { Link, useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
] as const;

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

export type SiteHeaderProps = {
  /** Optional CTA override. If provided, scrolls to a section/element on the current page. */
  onCtaClick?: () => void;
  ctaLabel?: string;
};

export function SiteHeader({ onCtaClick, ctaLabel = "Let's Talk" }: SiteHeaderProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:gap-4 sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.to === "/"
                  ? pathname === "/"
                  : pathname === link.to || pathname.startsWith(link.to + "/");
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

        {onCtaClick ? (
          <button
            type="button"
            onClick={onCtaClick}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[color:var(--orange)] px-3.5 text-xs font-semibold text-black shadow-[0_8px_30px_-8px_var(--orange-glow)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_14px_40px_-8px_var(--orange-glow)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--orange)] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:h-11 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{ctaLabel}</span>
          </button>
        ) : (
          <Link
            to="/contact"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[color:var(--orange)] px-3.5 text-xs font-semibold text-black shadow-[0_8px_30px_-8px_var(--orange-glow)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_14px_40px_-8px_var(--orange-glow)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--orange)] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:h-11 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{ctaLabel}</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export default SiteHeader;
