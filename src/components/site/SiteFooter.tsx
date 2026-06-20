import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

type FooterLink = { label: string; href: string };

const explore: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
];

const services: FooterLink[] = [
  { label: "Web Development", href: "/services#web-development" },
  { label: "AI Integrator", href: "/services#ai-integrator" },
  { label: "AI Podcast", href: "/services#ai-podcast" },
];

const legal: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

function LinkCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="max-md:text-center">
      <h3 className="text-sm font-semibold text-gradient-vo">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.href}
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

export function SiteFooter() {
  return (
    <footer className="bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 max-md:text-center sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground max-md:mx-auto sm:mx-0">
              Building authority brands through AI-powered podcasts and modern
              websites.
            </p>
          </div>
          <LinkCol title="Explore" links={explore} />
          <LinkCol title="Services" links={services} />
          <LinkCol title="Legal" links={legal} />
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
