import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

type FooterLink = { label: string; href: string };

const explore: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
];

const services: FooterLink[] = [
  { label: "Web Development", href: "/services/web-development" },
  { label: "AI Integrator", href: "/services/ai-integrator" },
  { label: "AI Podcast", href: "/services/ai-podcast" },
];

const legal: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  { title: "Explore", links: explore },
  { title: "Services", links: services },
  { title: "Legal", links: legal },
];

function LinkCol({
  title,
  links,
  className = "",
  onLinkInteract,
}: {
  title: string;
  links: FooterLink[];
  className?: string;
  onLinkInteract?: () => void;
}) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-gradient-vo">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.href}
              onPointerDown={onLinkInteract}
              onFocus={onLinkInteract}
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/50 rounded motion-reduce:transition-none"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileColumnsCarousel() {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % COLUMNS.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const pauseBriefly = () => {
    pausedRef.current = true;
    window.setTimeout(() => {
      pausedRef.current = false;
    }, 5000);
  };

  return (
    <div className="md:hidden">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {COLUMNS.map((c) => (
            <div key={c.title} className="w-full shrink-0 px-2 text-center">
              <LinkCol title={c.title} links={c.links} onLinkInteract={pauseBriefly} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Footer sections">
        {COLUMNS.map((c, i) => (
          <button
            key={c.title}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${c.title}`}
            onClick={() => {
              pauseBriefly();
              setIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index
                ? "w-6 bg-[color:var(--primary)]"
                : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 max-md:text-center md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              aria-label="AnamDev home"
              className="inline-block font-mono text-base font-bold tracking-tight transition-colors"
            >
              <span className="text-muted-foreground">{"{"}</span>
              <span className="text-white">Anam</span>
              <span className="text-[color:var(--primary)]">Dev</span>
              <span className="text-muted-foreground">{"}"}</span>
            </Link>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground max-md:mx-auto md:mx-0">
              Building authority brands through AI-powered podcasts and modern
              websites.
            </p>
          </div>

          {/* Desktop/tablet: three columns side by side */}
          <LinkCol title="Explore" links={explore} className="hidden md:block" />
          <LinkCol title="Services" links={services} className="hidden md:block" />
          <LinkCol title="Legal" links={legal} className="hidden md:block" />

          {/* Mobile: auto-sliding carousel */}
          <MobileColumnsCarousel />
        </div>

        <div className="my-10 h-px bg-white/5" />

        <div className="flex flex-col items-center justify-center gap-3 text-center text-xs text-muted-foreground md:flex-row md:justify-between md:text-left">
          <p>© 2026 Mohammad Anamul Hoque. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Built with
            <Heart className="h-3.5 w-3.5 text-[color:var(--orange)]" aria-hidden="true" strokeWidth={2} />
            &amp; AI
          </p>
        </div>
      </div>
    </footer>
  );
}
