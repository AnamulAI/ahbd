import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  Store,
  User,
  ShoppingCart,
  GraduationCap,
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  Zap,
  CircleCheck,
  Rocket,
  Users,
  Briefcase,
  Calendar,
  Trophy,
  Compass,
  Map,
  PenTool,
  Wand2,
  PartyPopper,
  Building2,
  Globe2,
  Sparkles,
  Star,
} from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BrandIcon, brandColor } from "@/components/site/BrandIcon";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// TODO: meta title "Web Development Services | AnamDev"
export const Route = createFileRoute("/services/web-development")({
  head: () => ({
    meta: [
      { title: "Web Development Services — AnamDev" },
      {
        name: "description",
        content:
          "Fast, modern websites and web apps built for growth. Custom development for service-based brands, agencies, and growing businesses.",
      },
      { property: "og:title", content: "Web Development Services — AnamDev" },
      {
        property: "og:description",
        content:
          "Custom websites and web apps focused on speed, clarity, performance, and conversion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WebDevPage,
});

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)] text-center">
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  white,
  gradient,
  trailing,
  subtext,
}: {
  eyebrow: string;
  white: string;
  gradient: string;
  trailing?: string;
  subtext?: string;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
        {white} <span className="text-gradient-vo">{gradient}</span>
        {trailing ? ` ${trailing}` : ""}
      </h2>
      {subtext && (
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">{subtext}</p>
      )}
    </div>
  );
}

function PrimaryCTA({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group inline-flex h-12 items-center gap-2 rounded-full btn-gradient px-6 text-sm font-semibold text-black shadow-[0_12px_40px_-12px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_20px_55px_-12px_var(--vo-glow)] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--orange)] motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
    </Link>
  );
}

function SecondaryButton({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex h-12 items-center gap-2 rounded-full border border-[color:var(--primary)]/50 px-6 text-sm font-semibold text-white transition-all duration-200 hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] motion-reduce:transition-none cursor-pointer";
  if (href) return <Link to={href} className={className}>{children}</Link>;
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

const TECH_STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "Supabase",
  "WordPress",
  "Webflow",
  "Figma",
  "Framer",
];

function HeroSection({ onSamplesClick }: { onSamplesClick: () => void }) {
  const features = [
    "Fast turnaround",
    "Responsive on all devices",
    "Clean, modern UI",
    "Built for performance & growth",
  ];
  const stats = [
    { icon: Briefcase, num: "30+", label: "Web Projects" },
    { icon: Users, num: "500+", label: "Happy Clients" },
    { icon: Calendar, num: "5+", label: "Years Experience" },
  ];
  return (
    <section className="section-glow-hero">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-24">
        <Eyebrow>// WEB DEVELOPMENT SERVICE</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Fast, Modern Websites &amp; Web Apps
          <br />
          Built for <span className="text-gradient-vo">Growth</span>
        </h1>
        <p className="mt-6 max-w-[700px] text-base text-muted-foreground sm:text-lg">
          I build custom websites and web applications for service-based brands,
          agencies, and growing businesses — with a streamlined workflow focused
          on speed, clarity, performance, and conversion.
        </p>

        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {features.map((f) => (
            <li key={f} className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[color:var(--primary)]" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA to="/contact">Discuss Your Project</PrimaryCTA>
          <SecondaryButton onClick={onSamplesClick}>
            View Project Samples
          </SecondaryButton>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="card-elevated inline-flex items-center gap-3 rounded-full px-4 py-2"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--primary)]/15">
                  <Icon className="h-4 w-4 text-[color:var(--primary)]" />
                </span>
                <span className="text-sm font-semibold text-white">
                  {s.num}{" "}
                  <span className="font-medium text-muted-foreground">
                    {s.label}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 w-full max-w-5xl">
          <div className="tech-marquee overflow-hidden">
            <div className="tech-marquee-track">
              {[...TECH_STACK, ...TECH_STACK].map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/85"
                >
                  <BrandIcon name={t} size={14} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PAIN_POINTS = [
  { icon: Calendar, text: "Slow project timelines that keep dragging on" },
  { icon: Users, text: "Unclear communication and messy processes" },
  { icon: PenTool, text: "Outdated design that hurts credibility" },
  { icon: LayoutDashboard, text: "Weak mobile experience losing visitors" },
  { icon: Zap, text: "Poor performance and slow page speeds" },
  { icon: TrendingUp, text: "Websites that do not support business growth" },
];

function ProblemSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// THE REAL PROBLEM"
          white="Most Websites Look Fine — But Still Feel"
          gradient="Slow, Outdated, or Hard to Scale"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAIN_POINTS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.text}
                className="card-elevated card-elevated-hover p-6 max-md:flex max-md:flex-col max-md:items-center max-md:text-center"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[color:var(--orange)]/15">
                  <Icon className="h-5 w-5 text-[color:var(--orange)]" />
                </span>
                <p className="mt-4 text-sm leading-relaxed text-white sm:text-base">
                  {p.text}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          You need a site that looks professional, works smoothly, and helps
          your business move faster.
        </p>
      </div>
    </section>
  );
}

const BUILDS = [
  {
    icon: Globe,
    title: "Landing Pages",
    desc: "Conversion-optimized single pages built for immediate visitor and signal conversion.",
    tags: ["Authority", "Sales", "Lead Gen"],
  },
  {
    icon: Store,
    title: "Business Websites",
    desc: "Full multi-page sites that brand your story, services, and trust elements your team can manage.",
    tags: ["Multi-page", "SEO-ready", "Professional"],
  },
  {
    icon: User,
    title: "Personal Brand Sites",
    desc: "Coaches, creators, and experts get a portfolio + authority + booking combo.",
    tags: ["Portfolio", "Booking", "Authority"],
  },
  {
    icon: ShoppingCart,
    title: "eCommerce Stores",
    desc: "Product catalog with smooth checkout — local payment gateway ready.",
    tags: ["Products", "Orders", "Payments"],
  },
  {
    icon: GraduationCap,
    title: "LMS & Course Platforms",
    desc: "Online course hosting, student management, and everything you need.",
    tags: ["Courses", "Students", "Payments"],
  },
  {
    icon: LayoutDashboard,
    title: "Web Apps & Dashboards",
    desc: "Custom dashboards, internal tools, and AI-powered automation workflows.",
    tags: ["SaaS", "Tools", "Automation"],
  },
];

function WhatIBuildSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// WHAT I BUILD"
          white="What I Can"
          gradient="Build For You"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BUILDS.map((b) => {
            const Icon = b.icon;
            return (
              <article
                key={b.title}
                className="card-elevated card-elevated-hover flex flex-col p-6 max-md:items-center max-md:text-center"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--primary)]/15">
                  <Icon className="h-5 w-5 text-[color:var(--primary)]" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {b.desc}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 max-md:justify-center">
                  {b.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const VALUES = [
  {
    icon: TrendingUp,
    title: "Big Outcome",
    desc: "Launch a website or web app that looks modern, feels premium, and supports real business goals.",
  },
  {
    icon: ShieldCheck,
    title: "Strong Confidence",
    desc: "Built with a modern workflow focused on clarity, responsiveness, and practical execution.",
  },
  {
    icon: Zap,
    title: "Faster Launch",
    desc: "Move from idea to working product faster than traditional slow-moving development cycles.",
  },
  {
    icon: CircleCheck,
    title: "Less Friction",
    desc: "No confusing process, no unnecessary complexity, and no messy handoff.",
  },
];

function ValueSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// VALUE EQUATION"
          white="Why This Service Creates"
          gradient="More Value"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="card-elevated card-elevated-hover flex gap-5 p-6 max-md:flex-col max-md:items-center max-md:text-center"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[color:var(--primary)]/20 to-[color:var(--orange)]/20">
                  <Icon className="h-5 w-5 text-white" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {v.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground sm:text-base">
          Better outcome · Faster path · Less friction · Stronger digital presence
        </p>
      </div>
    </section>
  );
}

const ICP = [
  { icon: Rocket, label: "Startups" },
  { icon: Briefcase, label: "Agencies" },
  { icon: Users, label: "Coaches & Consultants" },
  { icon: LayoutDashboard, label: "SaaS Businesses" },
  { icon: ShoppingCart, label: "Ecommerce Brands" },
  { icon: User, label: "Personal Brands" },
  { icon: Building2, label: "Local Service Businesses" },
  { icon: Globe2, label: "Founders Needing Better Digital Presence" },
];

function IdealClientsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// IDEAL CLIENTS"
          white="Who This Is"
          gradient="Best For"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ICP.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="card-elevated card-elevated-hover flex items-center gap-3 p-4 max-md:flex-col max-md:items-center max-md:text-center"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[color:var(--primary)]/15">
                  <Icon className="h-4 w-4 text-[color:var(--primary)]" />
                </span>
                <span className="text-sm font-medium text-white">
                  {c.label}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          If you need a clean, modern, business-ready website or web app
          without slow timelines or a messy process, this service is built
          for you.
        </p>
      </div>
    </section>
  );
}

const CORE_DELIVERABLES = [
  "Project discovery and direction",
  "Website structure planning",
  "Responsive UI development",
  "Modern front-end build",
  "Performance-focused setup",
  "SEO-friendly page structure",
  "Clean reusable components",
  "Launch-ready handoff",
];

const ADD_ONS = [
  {
    icon: LayoutDashboard,
    title: "CMS or admin integration",
    desc: "WordPress, Sanity, custom",
  },
  {
    icon: Calendar,
    title: "Booking / contact system",
    desc: "Calendly forms, scheduling",
  },
  {
    icon: Wand2,
    title: "Dashboard or custom feature setup",
    desc: "Admin panel, data views",
  },
  {
    icon: ShieldCheck,
    title: "Ongoing updates and support",
    desc: "Monthly retainer available",
  },
];

function IncludedSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// THE PACKAGE"
          white="What's"
          gradient="Included"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="card-elevated p-7 max-md:text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary)]">
              // CORE DELIVERABLES
            </div>
            <ul className="mt-5 space-y-3">
              {CORE_DELIVERABLES.map((item) => (
                <li key={item} className="flex items-start gap-3 max-md:flex-col max-md:items-center max-md:text-center">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)]" />
                  <span className="text-sm text-white sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-elevated p-7 max-md:text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--orange)]">
              // OPTIONAL ADD-ONS
            </div>
            <div className="mt-5 space-y-3">
              {ADD_ONS.map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.title}
                    className="flex gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-4 max-md:flex-col max-md:items-center max-md:text-center"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[color:var(--orange)]/15">
                      <Icon className="h-4 w-4 text-[color:var(--orange)]" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {a.title}
                      </div>
                      <div className="mt-0.5 text-sm text-muted-foreground">
                        {a.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Compass,
    title: "Project Direction",
    desc: "We define what you need, what the website should achieve, and how the structure should work.",
  },
  {
    icon: Map,
    title: "Planning",
    desc: "We map the core pages, sections, features, and user flow.",
  },
  {
    icon: PenTool,
    title: "Design & Build",
    desc: "Your website or web app is built with a modern, responsive workflow focused on clarity and performance.",
  },
  {
    icon: Wand2,
    title: "Review & Refine",
    desc: "We improve the important parts, fine-tune the structure, and prepare it for launch.",
  },
  {
    icon: PartyPopper,
    title: "Launch Ready",
    desc: "You receive a professional, usable, growth-ready digital product.",
  },
];

function ProcessSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// PROCESS"
          white="How It"
          gradient="Works"
        />
        <ol className="mt-12 space-y-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li
                key={s.title}
                className="card-elevated card-elevated-hover flex gap-5 p-6"
              >
                <div className="flex flex-col items-center">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--primary)]/15">
                    <Icon className="h-5 w-5 text-[color:var(--primary)]" />
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="mt-2 h-full w-px flex-1 bg-gradient-to-b from-[color:var(--primary)]/40 to-transparent"
                    />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Step {i + 1}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-10 text-center text-sm text-muted-foreground sm:text-base">
          Simple process · Cleaner execution · Better result
        </p>
      </div>
    </section>
  );
}

const SAMPLE_PROJECTS = [
  { slug: "saas-landing", category: "Landing Page", title: "SaaS Landing Page", desc: "Conversion-focused landing built for product launch and signup growth.", tech: ["React", "Next.js", "Tailwind CSS"] },
  { slug: "agency-website", category: "Business Site", title: "Agency Website", desc: "Full multi-page site with services, case studies, and team pages.", tech: ["WordPress", "Figma"] },
  { slug: "ecommerce-interface", category: "Ecommerce", title: "Ecommerce Interface", desc: "Modern product catalog with smooth checkout flow.", tech: ["Next.js", "TypeScript", "Stripe"] },
  { slug: "service-business-website", category: "Business Site", title: "Service Business Website", desc: "Local service brand with booking and contact integration.", tech: ["Webflow", "Figma"] },
  { slug: "dashboard-ui", category: "Web App", title: "Dashboard UI", desc: "Internal tool dashboard with charts and clean data views.", tech: ["React", "TypeScript", "Supabase"] },
  { slug: "portfolio-website", category: "Portfolio", title: "Portfolio Website", desc: "Personal brand portfolio with project showcase layout.", tech: ["Framer", "Figma"] },
];

function ProjectsSection({
  samplesRef,
}: {
  samplesRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section ref={samplesRef} id="project-samples" className="py-20 sm:py-28 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// PORTFOLIO"
          white="Selected Projects &"
          gradient="Web Samples"
          subtext="Explore selected examples of websites and web interfaces built for performance, clarity, better user experience, and stronger digital presence."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_PROJECTS.map((p) => (
            <article
              key={p.slug}
              className="card-glow card-elevated card-elevated-hover overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[color:var(--primary)]/15 via-white/[0.03] to-[color:var(--orange)]/15">
                <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-black shadow-[0_6px_20px_-8px_rgba(251,191,36,0.7)]">
                  {p.category}
                </span>
                <div className="absolute inset-0 grid place-items-center">
                  <Sparkles className="h-10 w-10 text-white/30" />
                </div>
              </div>
              <div className="p-5 max-md:text-center">
                <h3 className="text-base font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5 max-md:justify-center">
                  {p.tech.map((t) => {
                    const color = brandColor(t);
                    return (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          color,
                          borderColor: `${color}40`,
                          backgroundColor: `${color}14`,
                        }}
                      >
                        <BrandIcon name={t} size={11} />
                        {t}
                      </span>
                    );
                  })}
                </div>
                <Link
                  to="/projects"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--primary)] hover:text-[color:var(--orange)] transition-colors"
                >
                  Preview Sample
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Want to see more project examples?
          </p>
          <SecondaryButton href="/projects">
            View More Projects
            <ArrowRight className="h-4 w-4" />
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}

const TIERS = [
  {
    name: "Starter",
    tagline: "Best for landing pages & simple sites",
    price: "Starting from $300",
    features: [
      "Single-page or few-page site",
      "Responsive design",
      "Basic SEO setup",
      "1-2 weeks delivery",
    ],
    cta: "Get a Quote",
    featured: false,
  },
  {
    name: "Growth",
    tagline: "Best for full business websites",
    price: "Starting from $700",
    features: [
      "Multi-page custom website",
      "CMS or admin integration option",
      "SEO-friendly structure",
      "Priority support",
    ],
    cta: "Get a Quote",
    featured: true,
  },
  {
    name: "Custom / Web App",
    tagline: "Best for dashboards, SaaS, or complex builds",
    price: "Custom Quote",
    features: [
      "Full web app or dashboard",
      "Database & backend setup",
      "Ongoing support available",
      "Tailored scope & timeline",
    ],
    cta: "Discuss Your Project",
    featured: false,
  },
];

function PricingSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// PRICING"
          white="Custom Pricing"
          gradient="Based on Scope"
          subtext="Pricing depends on the type of project, page count, feature complexity, and overall build scope. Simple landing pages, business websites, and more advanced setups all require different levels of work — so pricing is tailored to fit your need."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={[
                "card-elevated card-elevated-hover relative flex flex-col p-7 max-md:items-center max-md:text-center",
                t.featured
                  ? "border-[color:var(--primary)]/50 shadow-[0_30px_90px_-40px_var(--primary)]"
                  : "",
              ].join(" ")}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--orange)] px-3 py-1 text-[11px] font-semibold text-black">
                  <Star className="h-3 w-3" />
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
              <div className="mt-5 text-2xl font-bold text-white">
                {t.price}
              </div>
              <ul className="mt-5 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={[
                  "mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200",
                  t.featured
                    ? "btn-gradient text-black shadow-[0_10px_30px_-12px_var(--vo-glow)] hover:scale-[1.02] hover:brightness-110"
                    : "border border-[color:var(--primary)]/50 text-white hover:bg-[color:var(--primary)]/10",
                ].join(" ")}
              >
                {t.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
          Need something more specific? I'll prepare a tailored quote based on
          your exact requirements.
        </p>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "What kind of websites do you build?",
    a: "I build landing pages, full business websites, ecommerce stores, course platforms, and custom web applications — tailored to what your business actually needs.",
  },
  {
    q: "How long does a project usually take?",
    a: "Simple sites typically take 1-2 weeks, while full business websites or custom web apps can take 3-6 weeks depending on scope and complexity.",
  },
  {
    q: "Do you provide ongoing support after launch?",
    a: "Yes, I offer optional monthly support and maintenance retainers for clients who want ongoing updates, fixes, or feature additions.",
  },
  {
    q: "What platforms or technologies do you use?",
    a: "Depending on the project, I work with modern stacks like React, Next.js, and Tailwind CSS, as well as WordPress and Webflow for content-managed sites.",
  },
  {
    q: "How do we get started?",
    a: "Reach out through the contact form or WhatsApp with a short description of your project — we'll have a quick chat to align on scope, timeline, and budget before starting.",
  },
];

function FaqSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// QUESTIONS"
          white="Common"
          gradient="Questions"
        />
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="card-elevated border-b-0 px-5"
            >
              <AccordionTrigger className="py-5 text-base font-semibold text-white hover:no-underline">
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
  );
}

function ClosingCtaSection() {
  return (
    <section className="section-glow-cta">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <Eyebrow>// LET'S BUILD TOGETHER</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          Ready to Build a Faster,{" "}
          <span className="text-gradient-vo">Better Website?</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Tell me what you need, what type of website or web app you want to
          build, and what stage you are in — we'll find the right setup.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA to="/contact">Discuss Your Project</PrimaryCTA>
          <SecondaryButton href="/services">View All Services</SecondaryButton>
        </div>
      </div>
    </section>
  );
}

function WebDevPage() {
  const samplesRef = useRef<HTMLElement | null>(null);

  const scrollToSamples = () => {
    samplesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <HeroSection onSamplesClick={scrollToSamples} />
        <ProblemSection />
        <WhatIBuildSection />
        <ValueSection />
        <IdealClientsSection />
        <IncludedSection />
        <ProcessSection />
        <ProjectsSection samplesRef={samplesRef} />
        <PricingSection />
        <FaqSection />
        <ClosingCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
