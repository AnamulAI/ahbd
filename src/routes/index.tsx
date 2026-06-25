import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Globe, Bot, TrendingUp, Mic, Check } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PackageBuilder } from "@/components/site/PackageBuilder";


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
                className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-[#3B82F6] via-[#3B82F6]/50 to-[#F97316] md:left-0 md:right-0 md:top-6 md:h-px md:w-auto md:bg-gradient-to-r md:from-[#3B82F6] md:via-[#3B82F6] md:to-[#F97316]"
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

        {/**
         * PRICING REVEAL CARD — Named reusable pattern
         *
         * Two-column layout (value stack + price reveal on one side,
         * checklist + CTA on the other), stacking vertically on mobile.
         *
         * Left/top side:
         *   - Itemized value stack with strikethrough muted prices
         *   - Divider + "Total Value" strikethrough
         *   - "// YOUR PRICE" label
         *   - Large bold gradient price
         *   - "Save $X" pill badge in accent color
         *
         * Right/bottom side:
         *   - "// WHAT'S INCLUDED" checklist (checkmark icons + items)
         *   - Large primary gradient CTA button
         *
         * Outer card uses the site's permanent-glow Featured Card treatment
         * (not hover-only).
         *
         * Whenever a future prompt says "use the Pricing Reveal Card pattern,"
         * apply this exact structure with new content substituted in.
         */}
        <section
          id="dfy-bundle"
          className="relative section-glow-cta py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <Eyebrow>// THE COMPLETE PACKAGE</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-[1.1] text-white sm:text-4xl md:text-5xl">
                The Complete Brand{" "}
                <span className="text-gradient-vo">Authority</span> Build
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Everything it takes to go from idea to a brand people trust —
                built and launched as one connected package.
              </p>
            </div>

            {/* Featured offer card */}
            <div className="relative mt-12">
              {/* Permanent accent glow behind card */}
              <div
                aria-hidden
                className="absolute -inset-px rounded-[1.25rem] bg-gradient-to-r from-[#3B82F6] via-[#3B82F6]/40 to-[#F97316] opacity-60 blur-2xl"
              />
              <div
                aria-hidden
                className="absolute -inset-px rounded-[1.25rem] bg-gradient-to-r from-[#3B82F6] to-[#F97316] opacity-80"
              />
              <div className="relative rounded-[1.15rem] bg-[oklch(0.15_0.02_260)] p-6 sm:p-10 lg:p-12">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
                  {/* Left: value stack + price reveal */}
                  <div>
                    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
                      // VALUE STACK
                    </div>
                    <ul className="mt-5 space-y-4">
                      {[
                        { label: "Web Development — Business Website", price: "$2,500" },
                        { label: "AI Integrator — API Integration", price: "$1,500" },
                        { label: "AI Podcast — Business Authority (Setup + Month 1)", price: "$2,499" },
                      ].map((item) => (
                        <li
                          key={item.label}
                          className="flex items-start justify-between gap-4 text-sm sm:text-base"
                        >
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-mono text-muted-foreground line-through shrink-0">
                            {item.price}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="my-6 h-px w-full bg-white/10" />

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono uppercase tracking-[0.14em] text-muted-foreground">
                        Total Value
                      </span>
                      <span className="font-mono text-base text-muted-foreground line-through">
                        $6,499
                      </span>
                    </div>

                    <div className="mt-8 rounded-xl border border-white/[0.08] bg-[oklch(0.12_0.02_260)] p-6">
                      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        // YOUR PRICE
                      </div>
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                        <span className="font-display text-5xl font-bold sm:text-6xl text-gradient-vo">
                          $4,990
                        </span>
                        <span className="inline-flex items-center rounded-full bg-[#F97316] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                          Save $1,509
                        </span>
                      </div>
                      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                        After month 1, Podcast Management continues at $1,500/mo
                        to keep your show running — cancel anytime.
                      </p>
                    </div>
                  </div>

                  {/* Right: included checklist + CTA */}
                  <div className="flex flex-col">
                    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
                      // WHAT'S INCLUDED
                    </div>
                    <ul className="mt-5 space-y-4">
                      {[
                        "A complete website or web app built for the business",
                        "A custom AI agent integrated into the website, WhatsApp, or internal systems",
                        "A fully launched podcast with Business Authority setup",
                        "First month of podcast management included",
                        "One point of contact for the entire build — no coordinating between vendors",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[oklch(0.62_0.19_255/15%)]">
                            <Check className="h-3 w-3 text-[color:var(--primary)]" aria-hidden />
                          </span>
                          <span className="text-sm leading-relaxed text-white/90 sm:text-base">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 lg:mt-auto lg:pt-8">
                      <Link
                        to="/contact"
                        className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full btn-gradient px-8 text-base font-semibold text-white shadow-[0_18px_50px_-12px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_22px_60px_-12px_var(--vo-glow)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:w-auto sm:min-w-[320px]"
                      >
                        Start Your Brand Build
                        <ArrowRight
                          className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                          aria-hidden
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider — or build your own */}
            <div className="mt-16 flex items-center gap-4" aria-hidden>
              <div className="h-px flex-1 bg-white/10" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                — or build your own —
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Package Builder */}
            <div className="mt-10">
              <PackageBuilder />
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
