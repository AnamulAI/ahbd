import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Globe, Bot, TrendingUp, Mic, Check, Target, ShieldCheck, Zap, Users } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CtaRevealCard } from "@/components/site/CtaRevealCard";
import { RevealBorder, RevealBorderCircle } from "@/components/site/RevealBorder";
import { PackageBuilder } from "@/components/site/PackageBuilder";
import { ProjectCard } from "@/components/site/ProjectCard";
import { BlogCard } from "@/components/site/BlogCard";
import { getLatestProjects } from "@/lib/projects-data";
import { getPostBySlug } from "@/lib/blog-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import anamAvatar from "@/assets/anam-avatar.png.asset.json";


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
    <div className="flex flex-col items-center gap-1 px-2 sm:px-7">
      <div className="font-display text-xl font-bold text-white sm:text-3xl">
        {value}
      </div>
      <div className="text-center font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px] sm:tracking-[0.18em]">
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
    <div className="card-elevated card-elevated-hover flex flex-col items-center text-center p-6">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--primary)]/15">
        <Icon className="h-6 w-6 text-[color:var(--primary)]" />
      </span>
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
  isVisible = true,
  showTopConnector = false,
  connectorVisible = false,
}: {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  isVisible?: boolean;
  showTopConnector?: boolean;
  connectorVisible?: boolean;
}) {
  return (
    <div className={`relative flex flex-col items-center text-center gap-5 transition-all duration-[750ms] ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} motion-reduce:opacity-100 motion-reduce:scale-100`}>
      {/* Mobile-only vertical connector — sits in the gap BETWEEN this card
          and the previous card so it never overlaps the icon container. */}
      {showTopConnector && (
        <span
          aria-hidden
          className={`md:hidden absolute -top-10 left-1/2 h-10 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-[#3B82F6] to-[#F97316] transition-transform duration-[950ms] ${connectorVisible ? 'scale-y-100' : 'scale-y-0'} motion-reduce:scale-y-100`}
        />
      )}
      {/* Numbered badge */}
      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full btn-gradient font-display text-lg font-bold text-white shadow-[0_8px_24px_-8px_var(--vo-glow)] ring-4 ring-background">
        {number}
      </div>

      {/* Premium icon container — gradient border + inner glow */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#3B82F6] via-[#3B82F6]/40 to-[#F97316] opacity-90"
        />
        <div
          aria-hidden
          className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#3B82F6]/30 to-[#F97316]/30 blur-xl opacity-60"
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[oklch(0.15_0.02_260)]">
          <Icon className="h-7 w-7 text-[color:var(--primary)]" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center text-center">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <Link
          to={href}
          className="group mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[color:var(--primary)] transition-colors hover:text-[#F97316]"
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
  const [journeyBadge1, setJourneyBadge1] = useState(false);
  const [journeyLine1, setJourneyLine1] = useState(false);
  const [journeyBadge2, setJourneyBadge2] = useState(false);
  const [journeyLine2, setJourneyLine2] = useState(false);
  const [journeyBadge3, setJourneyBadge3] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setJourneyBadge1(true), 0));
    timers.push(setTimeout(() => setJourneyLine1(true), 1000));
    timers.push(setTimeout(() => setJourneyBadge2(true), 2200));
    timers.push(setTimeout(() => setJourneyLine2(true), 3200));
    timers.push(setTimeout(() => setJourneyBadge3(true), 4400));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative section-glow-hero">
          <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
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
            <div className="mx-auto mt-9 flex max-w-3xl items-center justify-center divide-x divide-white/10">
              <StatItem value="12" label="PROJECTS DELIVERED" />
              <StatItem value="3" label="SERVICE LINES" />
              <StatItem value="100%" label="CLIENT SATISFACTION" />
            </div>


            {/* Dual CTAs */}
            <div className="mx-auto mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center">
              <a
                href="#dfy-bundle"
                className="group inline-flex items-center justify-center gap-2 rounded-full btn-gradient min-h-9 text-center px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_18px_50px_-12px_var(--vo-glow)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-input bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
              {/* Desktop line segment 1→2 */}
              <div
                aria-hidden
                className={`hidden md:block absolute top-6 h-px bg-gradient-to-r from-[#3B82F6] via-[#3B82F6]/50 to-[#F97316] origin-left transition-transform duration-[950ms] ${journeyLine1 ? 'scale-x-100' : 'scale-x-0'} motion-reduce:scale-x-100`}
                style={{ left: 'calc((100% - 4rem) / 6)', right: '50%' }}
              />
              {/* Desktop line segment 2→3 */}
              <div
                aria-hidden
                className={`hidden md:block absolute top-6 h-px bg-gradient-to-r from-[#3B82F6] via-[#3B82F6]/50 to-[#F97316] origin-left transition-transform duration-[950ms] ${journeyLine2 ? 'scale-x-100' : 'scale-x-0'} motion-reduce:scale-x-100`}
                style={{ left: '50%', right: 'calc((100% - 4rem) / 6)' }}
              />
              {/* Mobile vertical connectors are rendered INSIDE each PhaseCard
                  (in the grid gap above the badge) so they never overlap the
                  icon container. See PhaseCard's `showTopConnector` prop. */}

              <div className="grid gap-10 md:grid-cols-3 md:gap-8">
                <PhaseCard
                  number={1}
                  icon={Globe}
                  title="Brand Build"
                  description="A complete website or web app that finally looks and feels as credible as the business actually is."
                  href="/services/web-development"
                  isVisible={journeyBadge1}
                />
                <PhaseCard
                  number={2}
                  icon={Bot}
                  title="AI Agent Integration"
                  description="A custom AI assistant connected directly into the website, WhatsApp, or internal systems — automating what used to take a full team."
                  href="/services/ai-integrator"
                  isVisible={journeyBadge2}
                  showTopConnector
                  connectorVisible={journeyLine1}
                />
                <PhaseCard
                  number={3}
                  icon={Mic}
                  title="Podcast for Authority"
                  description="A consistent show that builds trust and visibility in the niche — while most competitors are still silent."
                  href="/services/ai-podcast"
                  isVisible={journeyBadge3}
                  showTopConnector
                  connectorVisible={journeyLine2}
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

            {/* Featured offer card — Pricing Reveal Card pattern */}
            <div className="group/reveal relative mt-12">
              <RevealBorder rounded="rounded-[1.25rem]" radius={20} />
              <div className="relative rounded-[1.25rem] bg-[oklch(0.15_0.02_260)] p-6 sm:p-10 lg:p-12">
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
                        className="group inline-flex w-full items-center justify-center gap-2 rounded-full btn-gradient min-h-9 text-center px-4 py-2 text-base font-semibold text-white shadow-[0_18px_50px_-12px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_22px_60px_-12px_var(--vo-glow)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:w-auto sm:min-w-[320px]"
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

        {/* Why This Works */}
        <section className="relative bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <Eyebrow>// WHY THIS WORKS</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-[1.1] text-white sm:text-4xl md:text-5xl">
                Built to Make This an{" "}
                <span className="text-gradient-vo">Easy</span> Decision
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Four reasons working with one person, on one connected process, beats hiring separately.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <ProblemCard
                icon={Target}
                title="The Big Outcome"
                description="Not just a website, or just an AI agent — an actual brand people recognize and trust."
              />
              <ProblemCard
                icon={ShieldCheck}
                title="Real Confidence"
                description="12 completed projects across web, AI, and podcast — see the proof in the Projects gallery."
              />
              <ProblemCard
                icon={Zap}
                title="Faster Delivery"
                description="One person who already knows your full build moves faster than three vendors trying to coordinate."
              />
              <ProblemCard
                icon={Users}
                title="Less Friction"
                description="One point of contact for everything — no re-explaining your business to a new vendor at every phase."
              />
            </div>
          </div>
        </section>


        {/* Section 7 — About (condensed) */}
        <section className="relative bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-14">
              <div className="order-1 mx-auto w-full max-w-sm md:order-none">
                <div className="group/reveal relative mx-auto aspect-square w-full max-w-[320px] rounded-full">
                  {/* Soft ambient blue + orange glow — two solid blurred circles (default state) */}
                  <div
                    aria-hidden
                    className="absolute -inset-6 rounded-full bg-[#3B82F6] blur-[56px] opacity-50"
                    style={{ transform: "translate(-12%, -12%)" }}
                  />
                  <div
                    aria-hidden
                    className="absolute -inset-6 rounded-full bg-[#F97316] blur-[56px] opacity-45"
                    style={{ transform: "translate(12%, 12%)" }}
                  />
                  {/* Hover-draw-in circular gradient border — 5th instance of Pricing Reveal Card pattern */}
                  <RevealBorderCircle />
                  <img
                    src={anamAvatar.url}
                    alt="Mohammad Anamul Hoque"
                    className="relative aspect-square w-full rounded-full object-cover"
                    loading="lazy"
                  />
                </div>

              </div>
              <div className="order-2 md:order-none">
                <Eyebrow>// THE PERSON BEHIND THIS</Eyebrow>
                <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] text-white sm:text-4xl">
                  Built by One{" "}
                  <span className="text-gradient-vo">Person</span>, Not an Agency
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                  I'm Mohammad Anamul Hoque — a web developer and AI integrator based in Chattogram, Bangladesh, working with clients internationally. I handle every phase of this process myself, from first conversation to final delivery, so nothing gets lost in translation between vendors.
                </p>
                <Link
                  to="/about"
                  className="group mt-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)] hover:opacity-80"
                >
                  Read My Full Story
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8 — Selected Work */}
        <section className="relative bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <Eyebrow>// SELECTED WORK</Eyebrow>
              <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] text-white sm:text-4xl">
                See the Work Behind the{" "}
                <span className="text-gradient-vo">Process</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                A look at real projects across web development, AI integration, and podcast production.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {getLatestProjects(3).map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>


            <div className="mt-12 text-center">
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)] hover:opacity-80"
              >
                View All Projects <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 9 — From the Blog */}
        <section className="relative bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <Eyebrow>// FROM THE BLOG</Eyebrow>
              <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] text-white sm:text-4xl">
                Thinking <span className="text-gradient-vo">Behind</span> the Work
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Notes on web development, AI integration, and building a podcast-driven brand.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "custom-code-vs-wordpress-2026",
                "custom-gpt-vs-chatgpt-plus-business",
                "ai-voice-cloning-guide-for-podcasters",
              ]
                .map((slug) => getPostBySlug(slug))
                .filter((p): p is NonNullable<typeof p> => Boolean(p))
                .map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)] hover:opacity-80"
              >
                Read the Blog <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 10 — FAQ */}
        <section className="relative bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <Eyebrow>// FAQ</Eyebrow>
              <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] text-white sm:text-4xl">
                Common <span className="text-gradient-vo">Questions</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                If you don't see your question here, the full breakdown is in the custom builder above, or just ask directly.
              </p>
            </div>

            <Accordion type="single" collapsible className="mt-10 space-y-3">
              {HOME_FAQS.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`home-faq-${i}`}
                  className="card-elevated border-b-0 px-5"
                >
                  <AccordionTrigger className="py-5 text-left text-base font-semibold text-white hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Section 11 — Closing CTA */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <CtaRevealCard>
              <div className="flex flex-col items-center text-center">
                <Eyebrow>// LET'S BUILD</Eyebrow>
                <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] text-white sm:text-4xl md:text-5xl">
                  Ready to Build a Brand People{" "}
                  <span className="text-gradient-vo">Trust</span>?
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Start with the full DFY package, or just one phase — either way,
                  let's talk about what you're building.
                </p>
                <div className="mx-auto mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center">
                  <a
                    href="#dfy-bundle"
                    className="group inline-flex items-center justify-center gap-2 rounded-full btn-gradient min-h-9 text-center px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_18px_50px_-12px_var(--vo-glow)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
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
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-input bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    WhatsApp Me
                  </a>
                </div>
              </div>
            </CtaRevealCard>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

const HOME_FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "Do I have to take the full $4,990 package?",
    a: "No — every phase (website, AI agent, podcast) is also available on its own. The full package is for people who want the complete journey done together.",
  },
  {
    q: "How is this different from hiring three separate freelancers?",
    a: "One person handles the entire build, so nothing gets lost between vendors, timelines stay tighter, and the final result is designed to work together from day one — not stitched together after the fact.",
  },
  {
    q: "I already have a website — can I still use the AI Agent or Podcast services?",
    a: "Yes — each phase works independently. We can integrate an AI agent into your existing site, or launch a podcast for your existing brand, without rebuilding anything.",
  },
  {
    q: "What if I'm not based in Bangladesh?",
    a: "Most of my clients are international. Everything is handled remotely — calls, WhatsApp, and async updates — regardless of timezone.",
  },
  {
    q: "How long does the full DFY process take?",
    a: "It depends on the scope you choose in the builder — a simple site moves faster than a full eCommerce build with AI and podcast included. We'll confirm a realistic timeline together once your build is finalized.",
  },
  {
    q: "What happens after I submit my build in the custom builder?",
    a: "I'll review everything and reach out on WhatsApp within 24 hours to confirm the details before any work begins.",
  },
];
