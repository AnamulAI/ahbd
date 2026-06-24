import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Globe, Bot, TrendingUp } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AnamDev — Mohammad Anamul Hoque" },
      {
        name: "description",
        content:
          "Freelance developer & AI specialist building modern websites, AI automations, and AI-powered podcasts.",
      },
      { property: "og:title", content: "AnamDev — Mohammad Anamul Hoque" },
      {
        property: "og:description",
        content:
          "Freelance developer & AI specialist building modern websites, AI automations, and AI-powered podcasts.",
      },
    ],
  }),
  component: Index,
});

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
      {children}
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 sm:px-7">
      <div className="font-display text-2xl font-bold text-white sm:text-3xl">
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative section-glow-hero">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
            <Eyebrow>// DONE-FOR-YOU BRAND AUTHORITY</Eyebrow>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
              From Zero to a Brand People{" "}
              <span className="text-gradient-vo">Trust</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              I take your idea or local business from invisible to authoritative
              — building your website, integrating a custom AI agent, and
              launching a podcast that builds trust in your niche. One person,
              one process, one outcome.
            </p>

            {/* Stats strip */}
            <div className="mx-auto mt-9 flex max-w-3xl flex-wrap items-center justify-center divide-x divide-white/10">
              <StatItem value="12" label="PROJECTS DELIVERED" />
              <StatItem value="3" label="SERVICE LINES" />
              <StatItem value="100%" label="CLIENT SATISFACTION" />
            </div>

            {/* Dual CTAs */}
            <div className="mx-auto mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center">
              <a
                href="#dfy-bundle"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full btn-gradient px-7 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_18px_50px_-12px_var(--vo-glow)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                See the Full DFY Package
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  aria-hidden
                />
              </a>
              <a
                href="https://wa.me/8801777768353"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-input bg-background px-7 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp Me
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
