import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Globe, Bot, TrendingUp, Mic } from "lucide-react";
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

function ProblemCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[oklch(0.15_0.02_260)] p-5 sm:p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.62_0.19_255/12%)]">
        <Icon className="h-4 w-4 text-[color:var(--primary)]" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PhaseCard({
  number,
  icon: Icon,
  title,
  description,
  href,
}: {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="relative flex flex-row gap-5 md:flex-col md:items-start md:gap-4">
      {/* Numbered badge */}
      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full btn-gradient font-display text-lg font-bold text-white shadow-[0_8px_24px_-8px_var(--vo-glow)] ring-4 ring-background">
        {number}
      </div>
      <div className="flex-1 pt-1 md:pt-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[color:var(--primary)]" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <Link
          to={href}
          className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--primary)] transition-colors hover:text-[#F97316]"
        >
          Explore
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            aria-hidden
          />
        </Link>
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

        {/* The Problem */}
        <section className="relative bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <Eyebrow>// THE PROBLEM</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-[1.1] text-white sm:text-4xl md:text-5xl">
                Most Businesses Stay{" "}
                <span className="text-gradient-vo">Invisible</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Not because the idea is bad — because nothing online proves it's
                worth trusting yet.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <ProblemCard
                icon={Globe}
                title="No Real Website"
                description="A Facebook page or nothing at all — customers can't find or trust what they can't see."
              />
              <ProblemCard
                icon={Bot}
                title="No Automation"
                description="Every question, every booking, every message handled manually — there's no system working while you sleep."
              />
              <ProblemCard
                icon={TrendingUp}
                title="No Consistent Presence"
                description="No content, no voice, no reason for anyone to remember the brand a week later."
              />
            </div>
          </div>
        </section>

        {/* The Journey — 3 Phases */}
        <section className="relative bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <Eyebrow>// THE JOURNEY</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-[1.1] text-white sm:text-4xl md:text-5xl">
                From Idea to Brand{" "}
                <span className="text-gradient-vo">Authority</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Three connected phases. One process. Each one builds on the last.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative mt-16">
              {/* Connecting line: horizontal on desktop, vertical on mobile */}
              <div
                aria-hidden
                className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-[#3B82F6] via-[#3B82F6]/50 to-[#F97316] md:left-0 md:right-0 md:top-6 md:h-px md:w-auto md:bg-gradient-to-r md:from-[#3B82F6] md:via-[#3B82F6]/50 md:to-[#F97316]"
              />

              <div className="grid gap-10 md:grid-cols-3 md:gap-8">
                <PhaseCard
                  number={1}
                  icon={Globe}
                  title="Brand Build"
                  description="A complete website or web app that finally looks and feels as credible as the business actually is."
                  href="/services/web-development"
                />
                <PhaseCard
                  number={2}
                  icon={Bot}
                  title="AI Agent Integration"
                  description="A custom AI assistant connected directly into the website, WhatsApp, or internal systems — automating what used to take a full team."
                  href="/services/ai-integrator"
                />
                <PhaseCard
                  number={3}
                  icon={Mic}
                  title="Podcast for Authority"
                  description="A consistent show that builds trust and visibility in the niche — while most competitors are still silent."
                  href="/services/ai-podcast"
                />
              </div>
            </div>

            <p className="mx-auto mt-14 max-w-2xl text-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              // Each phase works on its own — together, they compound.
            </p>
          </div>
        </section>
      </main>

    </div>
  );
}
