import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Crosshair,
  Gem,
  Handshake,
  Layers,
  Rocket,
  Sparkles,
  Trophy,
} from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import anamAvatar from "@/assets/anam-avatar.png.asset.json";


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AnamDev | Mohammad Anamul Hoque" },
      {
        name: "description",
        content:
          "About Mohammad Anamul Hoque (AnamDev) — helping service brands build authority through AI-powered podcast content and modern websites.",
      },
      { property: "og:title", content: "About — AnamDev" },
      {
        property: "og:description",
        content:
          "Authority-building digital assets — AI podcasts and modern websites for service brands.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      className={`font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)] ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="section-glow-hero">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-24">
        <Eyebrow>// ABOUT ANAM DEV</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          I Help Brands Build Stronger Authority
          <br />
          and a <span className="text-gradient-vo">Sharper Digital Presence</span>
        </h1>
        <p className="mt-6 max-w-[650px] text-base text-muted-foreground sm:text-lg">
          Through AI-powered podcast content and modern websites, I help
          service-based brands become more credible, more visible, and more
          trusted — without adding unnecessary complexity.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/contact"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--orange)] px-6 text-sm font-semibold text-black shadow-[0_12px_40px_-12px_var(--orange-glow)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_20px_55px_-12px_var(--orange-glow)] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--orange)] motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            Discuss Your Project
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
          </Link>
          <Link
            to="/services"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-[color:var(--primary)]/50 px-6 text-sm font-semibold text-white transition-all duration-200 hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] motion-reduce:transition-none"
          >
            View Services
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Calendar, num: "5+", label: "Years Experience" },
            { icon: Trophy, num: "100+", label: "Projects Delivered" },
            { icon: Briefcase, num: "3", label: "Active Services" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="card-elevated inline-flex items-center gap-3 rounded-full px-4 py-2"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--primary)]/15">
                  <Icon className="h-4 w-4 text-[color:var(--primary)]" />
                </span>
                <div className="text-sm">
                  <span className="font-semibold text-white">{s.num}</span>{" "}
                  <span className="text-muted-foreground">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AvatarCodeCard() {
  return (
    <div className="card-elevated relative overflow-hidden rounded-2xl p-5 sm:p-6">
      {/* Terminal header */}
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">~/anam-dev</span>
      </div>

      {/* Avatar with pulsing ring */}
      <div className="mt-6 flex justify-center">
        <div className="relative h-32 w-32 sm:h-36 sm:w-36">
          <span
            aria-hidden
            className="avatar-ring-pulse absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 180deg, var(--primary), var(--orange), var(--primary))",
              filter: "blur(10px)",
              opacity: 0.7,
            }}
          />
          <span
            aria-hidden
            className="absolute inset-[3px] rounded-full"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--orange))",
            }}
          />
          <img
            src={avatarPlaceholder}
            alt="Anam Dev avatar placeholder"
            width={256}
            height={256}
            loading="lazy"
            className="absolute inset-[5px] h-[calc(100%-10px)] w-[calc(100%-10px)] rounded-full object-cover ring-1 ring-white/10"
          />
        </div>
      </div>

      {/* Code block */}
      <pre className="mt-6 overflow-x-auto rounded-xl bg-[#0b0d12] p-4 font-mono text-[13px] leading-relaxed ring-1 ring-white/5">
        <code>
          <span className="text-[#c084fc]">const</span>{" "}
          <span className="text-white">brand</span>{" "}
          <span className="text-muted-foreground">=</span>{" "}
          <span className="text-white">{"{"}</span>
          {"\n  "}
          <span className="text-[#60a5fa]">by</span>
          <span className="text-muted-foreground">:</span>{" "}
          <span className="text-[#86efac]">"Anam Dev"</span>
          <span className="text-muted-foreground">,</span>
          {"\n  "}
          <span className="text-[#60a5fa]">focus</span>
          <span className="text-muted-foreground">:</span>{" "}
          <span className="text-[#86efac]">"Authority · Websites · AI"</span>
          <span className="text-muted-foreground">,</span>
          {"\n  "}
          <span className="text-[#60a5fa]">clients</span>
          <span className="text-muted-foreground">:</span>{" "}
          <span className="text-[#86efac]">"Bangladesh · Remote"</span>
          <span className="text-muted-foreground">,</span>
          {"\n  "}
          <span className="text-[#60a5fa]">available</span>
          <span className="text-muted-foreground">:</span>{" "}
          <span className="text-[#fbbf24]">true</span>
          <span className="text-muted-foreground">,</span>
          {"\n"}
          <span className="text-white">{"}"}</span>
        </code>
      </pre>

      {/* Divider + footer row */}
      <div className="mt-5 border-t border-white/5 pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2">
              <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            available for projects
          </span>
          <span className="font-mono">v5.2026</span>
        </div>
      </div>
    </div>
  );
}

function BackstorySection() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-left">
            <Eyebrow>// the backstory</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              I Didn't Start Here.{" "}
              <span className="text-gradient-vo">I Built My Way Here.</span>
            </h2>

            <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Before I started building AI podcast assets and modern websites for
                brands, I spent years working across different parts of the digital
                space — from content workflows to virtual assistance to marketing
                support and website-related work.
              </p>
              <p>
                That foundation may not have looked glamorous from the outside, but
                it gave me something valuable: a practical understanding of how
                brands actually grow online, where things break, what creates
                confusion, and what helps businesses build trust more effectively.
              </p>
              <p>
                Over time, that experience shaped how I work today. I don't just
                build digital assets that look good — I build them to support a
                bigger business goal.
              </p>
            </div>

            <div className="mt-8 card-elevated border-l-4 [border-left-color:var(--primary)] p-6 sm:p-7">
              <p className="text-base font-medium leading-relaxed text-white sm:text-lg">
                The result? I focus on creating digital assets that help brands look
                sharper, communicate better, and grow with more clarity.
              </p>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <AvatarCodeCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  const milestones = [
    {
      icon: Sparkles,
      label: "EARLY CAREER",
      title: "Digital Foundations",
      body:
        "Started with content management, virtual assistance, and marketing-related work — building a real understanding of how brands operate and how digital work looks on the ground.",
    },
    {
      icon: Layers,
      label: "GROWTH PHASE",
      title: "Expanding Into Web & Systems",
      body:
        "As my skills grew, I moved deeper into website work and modern development — building both attractive and functional digital experiences.",
    },
    {
      icon: Rocket,
      label: "CURRENT FOCUS",
      title: "AI Podcast Assets & Modern Website Development",
      body:
        "Today, I combine content thinking, digital strategy, and modern website execution to help brands build authority and a stronger online presence — with more intentional, well-built assets that move real business goals forward.",
    },
  ];

  return (
    <section>
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="text-center">
          <Eyebrow center>// the journey</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            How I Got <span className="text-gradient-vo">Here</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            The skills I use today didn't appear overnight. They were built
            through years of real digital work, experimentation, and continuous
            learning.
          </p>
        </div>

        <ol className="relative mx-auto mt-14 max-w-2xl space-y-8 border-l border-white/10 pl-8 sm:pl-10">
          {milestones.map((m) => {
            const Icon = m.icon;
            return (
              <li key={m.label} className="relative">
                <span className="absolute -left-[42px] grid h-10 w-10 place-items-center rounded-full border border-[color:var(--primary)]/40 bg-background ring-4 ring-background sm:-left-[52px]">
                  <Icon className="h-4 w-4 text-[color:var(--primary)]" />
                </span>
                <div className="card-elevated card-elevated-hover p-5 sm:p-6">
                  <div className="font-mono text-xs tracking-[0.18em] text-[color:var(--primary)]">
                    {m.label}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {m.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function ApproachSection() {
  const principles = [
    {
      icon: Crosshair,
      title: "Clarity Over Clutter",
      body:
        "Every element must serve a purpose. No filler. No decorative design that doesn't communicate.",
    },
    {
      icon: Layers,
      title: "Strategy With Execution",
      body:
        "I consider the 'why' first, then build the version that best supports your goals — not just what looks good on the surface.",
    },
    {
      icon: Gem,
      title: "Premium But Practical",
      body:
        "High-quality digital work doesn't need to feel bloated. I aim for a polished outcome with a clean, efficient process.",
    },
    {
      icon: Handshake,
      title: "Smoother Client Experience",
      body:
        "Less back-and-forth, less confusion, more clarity. I value your time and keep communication direct and simple.",
    },
  ];

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="text-center">
          <Eyebrow center>// my approach</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            How I <span className="text-gradient-vo">Work</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Every project follows the same principle: build digital assets that
            are clear, useful, premium, and aligned with real business goals.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="card-elevated card-elevated-hover p-6 max-md:text-center sm:p-7"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10 max-md:mx-auto">
                  <Icon className="h-5 w-5 text-[color:var(--primary)]" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white sm:text-xl">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {p.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="section-glow-cta">
      <div className="mx-auto max-w-3xl px-4 py-28 text-center sm:px-6 sm:py-36">
        <Eyebrow center>// let's build together</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Ready to Build a{" "}
          <span className="text-gradient-vo">More Credible Digital Presence?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Whether you need authority-building podcast content, a modern website,
          or both — I help brands create digital assets that look sharper,
          communicate better, and support long-term growth.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/contact"
            className="group inline-flex h-14 items-center gap-2 rounded-full bg-[color:var(--orange)] px-8 text-base font-semibold text-black shadow-[0_20px_60px_-15px_var(--orange-glow)] transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_28px_70px_-15px_var(--orange-glow)] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--orange)] motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            Discuss Your Project
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
          </Link>
          <Link
            to="/projects"
            className="group inline-flex h-14 items-center gap-2 rounded-full border border-[color:var(--primary)]/50 px-8 text-base font-semibold text-white transition-all duration-200 hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] motion-reduce:transition-none"
          >
            See My Work
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <HeroSection />
        <BackstorySection />
        <JourneySection />
        <ApproachSection />
        <ClosingCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
