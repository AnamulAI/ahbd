import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useMemo, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
  MessageCircle,
  PackageCheck,
  Images,
  UserCircle,
  Share2,
  BarChart3,
  ShieldAlert,
  ShoppingBag,
  AlertTriangle,
  Image as ImageIcon,
  Boxes,
  FolderTree,
  Code2,
  Tag,
  Film,
  Megaphone,
  BadgeCheck,
  LogIn,
  CreditCard,
  Truck,
  Send,
  Target,
  Pencil,
  Search,
  LineChart,
  LifeBuoy,
  CalendarClock,
  ShieldHalf,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


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
  { icon: Calendar, title: "Slow Timelines", text: "Slow project timelines that keep dragging on" },
  { icon: Users, title: "Messy Process", text: "Unclear communication and messy processes" },
  { icon: PenTool, title: "Outdated Design", text: "Outdated design that hurts credibility" },
  { icon: LayoutDashboard, title: "Weak Mobile UX", text: "Weak mobile experience losing visitors" },
  { icon: Zap, title: "Poor Performance", text: "Poor performance and slow page speeds" },
  { icon: TrendingUp, title: "No Growth Path", text: "Websites that do not support business growth" },
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
                key={p.title}
                className="card-elevated card-elevated-hover flex flex-col items-center text-center p-6"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--primary)]/15">
                  <Icon className="h-5 w-5 text-[color:var(--primary)]" />
                </span>
                <h3 className="mt-5 text-sm font-semibold text-white">
                  {p.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
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
            const isEcom = b.title === "eCommerce Stores";
            const cardInner = (
              <>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--primary)]/15">
                  <Icon className="h-5 w-5 text-[color:var(--primary)]" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {b.desc}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {b.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {isEcom && (
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--primary)]">
                    View Case Study <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </>
            );

            if (isEcom) {
              return (
                <EcommerceCaseStudyDialog key={b.title}>
                  <button
                    type="button"
                    className="card-elevated card-elevated-hover flex h-full flex-col items-center p-6 text-center cursor-pointer"
                  >
                    {cardInner}
                  </button>
                </EcommerceCaseStudyDialog>
              );
            }

            return (
              <article
                key={b.title}
                className="card-elevated card-elevated-hover flex h-full flex-col items-center p-6 text-center"
              >
                {cardInner}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EcommerceCaseStudyDialog({ children }: { children: React.ReactNode }) {
  const customer = [
    { icon: MessageCircle, label: "WhatsApp Quick Order" },
    { icon: ShoppingCart, label: "Slide-over Cart Drawer" },
    { icon: PackageCheck, label: "Guest Checkout & Order Tracking" },
    { icon: Images, label: "Product Variants & Image Gallery" },
    { icon: UserCircle, label: "Customer Accounts & Order History" },
    { icon: Share2, label: "Social Share Buttons" },
  ];
  const admin = [
    { icon: BarChart3, label: "Real-Time Sales Dashboard" },
    { icon: ShieldAlert, label: "Fraud Risk Scoring & Block List" },
    { icon: ShoppingBag, label: "Abandoned Checkout Recovery" },
    { icon: AlertTriangle, label: "Low-Stock Alerts" },
    { icon: ImageIcon, label: "Auto Image Compression (WebP)" },
    { icon: Boxes, label: "Multi-Variant Product Management" },
    { icon: FolderTree, label: "Category Management" },
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col overflow-hidden max-h-[90vh] p-0 sm:max-w-2xl">
        <span aria-hidden className="modal-scan-line" />
        <div className="flex flex-col gap-4 overflow-y-auto p-6 max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Custom eCommerce Platform — What's Possible
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed">
              A full-featured custom ecommerce platform built end-to-end — from
              customer storefront to admin operations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
                Customer Experience
              </h4>
              <ul className="mt-3 space-y-2.5">
                {customer.map((i) => {
                  const I = i.icon;
                  return (
                    <li key={i.label} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <I className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)]" />
                      <span>{i.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
                Admin & Operations
              </h4>
              <ul className="mt-3 space-y-2.5">
                {admin.map((i) => {
                  const I = i.icon;
                  return (
                    <li key={i.label} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <I className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)]" />
                      <span>{i.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="mt-2 flex flex-col items-center gap-3 border-t border-white/10 pt-5 text-center">
            <p className="text-sm text-muted-foreground">
              Want something like this for your business?
            </p>
            <Link
              to="/contact"
              className="btn-gradient inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white"
            >
              Discuss Your Project <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  { icon: Rocket, label: "Startups", desc: "Launch fast with a credible first impression" },
  { icon: Briefcase, label: "Agencies", desc: "White-label web builds for your clients" },
  { icon: Users, label: "Coaches & Consultants", desc: "Authority sites that convert bookings" },
  { icon: LayoutDashboard, label: "SaaS Businesses", desc: "Marketing sites and product dashboards" },
  { icon: ShoppingCart, label: "Ecommerce Brands", desc: "Stores built to convert and scale" },
  { icon: User, label: "Personal Brands", desc: "Portfolio sites that build trust fast" },
  { icon: Building2, label: "Local Service Businesses", desc: "Simple sites that bring in local leads" },
  { icon: Globe2, label: "Founders Needing Better Digital Presence", desc: "A sharper site without the agency wait" },
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
                className="card-elevated card-elevated-hover flex flex-col items-center text-center p-6"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--primary)]/15">
                  <Icon className="h-5 w-5 text-[color:var(--primary)]" />
                </span>
                <h3 className="mt-5 text-sm font-semibold text-white">
                  {c.label}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {c.desc}
                </p>
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
            <div className="card-elevated p-7">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary)]">
              // CORE DELIVERABLES
            </div>
            <ul className="mt-5 space-y-3">
              {CORE_DELIVERABLES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)]" />
                  <span className="text-sm text-white sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-elevated p-7">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--orange)]">
              // OPTIONAL ADD-ONS
            </div>
            <div className="mt-5 space-y-3">
              {ADD_ONS.map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.title}
                    className="flex gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-4"
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

const PROJECT_TYPES = [
  { id: "landing", name: "Landing Page", base: 450, icon: Globe, note: "" },
  { id: "business", name: "Business Website", base: 900, icon: Building2, note: "" },
  { id: "brand", name: "Personal Brand Site", base: 600, icon: User, note: "" },
  { id: "ecommerce", name: "eCommerce Store", base: 1800, icon: ShoppingCart, note: "" },
  { id: "lms", name: "LMS / Course Platform", base: 1500, icon: GraduationCap, note: "" },
  { id: "webapp", name: "Web App / Dashboard", base: 2500, icon: LayoutDashboard, note: "Starting from $2,500 — final quote varies" },
] as const;

const PLATFORMS = [
  {
    id: "custom",
    name: "Custom Code",
    desc: "React, Next.js & modern stack — fully custom, most flexible, built to scale",
    discount: 0,
  },
  {
    id: "wordpress",
    name: "WordPress",
    desc: "Faster build, budget-friendly, easy for you to manage content yourself",
    discount: 0.15,
  },
] as const;

const ADDONS = [
  { id: "video-hero", label: "Cinematic Video Hero + Fallback", price: 150, icon: Film, color: "#F97316" },
  { id: "promo-banner", label: "Promo Banner + Countdown Timer", price: 100, icon: Megaphone, color: "#F59E0B" },
  { id: "trust-strip", label: "Trust Strip Icons", price: 50, icon: BadgeCheck, color: "#22C55E" },
  { id: "auth", label: "Email + Phone/OTP Login System", price: 300, icon: LogIn, color: "#3B82F6" },
  { id: "payments", label: "Payment Gateway Integration (Stripe/PayPal)", price: 250, icon: CreditCard, color: "#635BFF" },
  { id: "shipping", label: "Courier/Shipping API Integration", price: 300, icon: Truck, color: "#EAB308" },
  { id: "telegram", label: "Telegram Order Notifications", price: 150, icon: Send, color: "#229ED9" },
  { id: "pixel", label: "Facebook Pixel + Conversion API", price: 150, icon: Target, color: "#1877F2" },
  { id: "cms", label: "No-Code Content Editor (CMS)", price: 400, icon: Pencil, color: "#A855F7" },
  { id: "seo", label: "Full SEO Suite (Meta, OG, Sitemap, JSON-LD)", price: 200, icon: Search, color: "#10B981" },
  { id: "analytics", label: "Custom Analytics Dashboard", price: 350, icon: LineChart, color: "#06B6D4" },
] as const;

const SUPPORT_TIERS = [
  { id: "30d", name: "30 Days Free Support", price: 0, included: true, tag: null as string | null, icon: LifeBuoy },
  { id: "3m", name: "3 Months Support", price: 200, included: false, tag: null as string | null, icon: CalendarClock },
  { id: "6m", name: "6 Months Support", price: 400, included: false, tag: "Recommended" as string | null, icon: ShieldHalf },
] as const;

type ScopeOption = { id: string; label: string; price: number; tag?: string | null };
type ScopeConfig = { label: string; helper?: string; options: ScopeOption[] };

const SCOPE_BY_PROJECT: Record<string, ScopeConfig> = {
  landing: {
    label: "Sections & Scope",
    options: [
      { id: "s1", label: "5-7 Sections", price: 0, tag: "Most Popular" },
      { id: "s2", label: "8-12 Sections", price: 150 },
      { id: "s3", label: "13-20 Sections", price: 300 },
      { id: "s4", label: "Full Custom (Unlimited)", price: 500 },
    ],
  },
  business: {
    label: "Pages & Scope",
    options: [
      { id: "s1", label: "3-5 Pages", price: 0, tag: "Most Popular" },
      { id: "s2", label: "6-10 Pages", price: 200 },
      { id: "s3", label: "11-20 Pages", price: 450 },
      { id: "s4", label: "Custom / Unlimited", price: 800 },
    ],
  },
  ecommerce: {
    label: "Products & Scope",
    options: [
      { id: "s1", label: "Under 50 Products", price: 0 },
      { id: "s2", label: "50-200 Products", price: 150 },
      { id: "s3", label: "200-500 Products", price: 300 },
      { id: "s4", label: "500+ Products", price: 500 },
    ],
  },
  brand: {
    label: "Pages & Sections",
    options: [
      { id: "s1", label: "Core Pages (Home, About, Contact)", price: 0 },
      { id: "s2", label: "+ Services / Work Page", price: 150 },
      { id: "s3", label: "+ Blog Setup", price: 180 },
      { id: "s4", label: "Full Brand Site (All Pages)", price: 400, tag: "Recommended" },
    ],
  },
  lms: {
    label: "Courses & Scope",
    options: [
      { id: "s1", label: "Up to 5 Courses", price: 0 },
      { id: "s2", label: "6-15 Courses", price: 200 },
      { id: "s3", label: "16-30 Courses", price: 400 },
      { id: "s4", label: "30+ Courses (Unlimited)", price: 650 },
    ],
  },
  webapp: {
    label: "Features & Complexity",
    helper:
      "Feature examples: user login/auth, dashboard, data tables, filters, charts, file upload, notifications, payment, API integration, admin panel, etc.",
    options: [
      { id: "s1", label: "MVP (3-5 Core Features)", price: 0, tag: "Start Here" },
      { id: "s2", label: "Standard (6-10 Features)", price: 1000 },
      { id: "s3", label: "Advanced (11-20 Features)", price: 2300 },
      { id: "s4", label: "Enterprise (20+ / Custom)", price: 4000 },
    ],
  },
};

const HOSTING_OPTIONS = [
  {
    id: "vercel",
    name: "Vercel Deployment",
    desc: "Best for custom code projects — I'll deploy and configure it for you",
    brand: "Vercel" as const,
  },
  {
    id: "hostinger",
    name: "Hostinger Hosting",
    desc: "Get 20% off hosting through my partner link",
    brand: "Hostinger" as const,
  },
];

// TODO: replace with actual Hostinger affiliate link
const HOSTINGER_AFFILIATE_URL = "https://www.hostinger.com/?ref=AFFILIATE_PLACEHOLDER";

// Map calculator project id → "What I Build" reference card
const PROJECT_TO_BUILD_TITLE: Record<string, string> = {
  landing: "Landing Pages",
  business: "Business Websites",
  brand: "Personal Brand Sites",
  ecommerce: "eCommerce Stores",
  lms: "LMS & Course Platforms",
  webapp: "Web Apps & Dashboards",
};

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US");
}

function PricingCalculatorSection() {
  const [projectId, setProjectId] = useState<string>("business");
  const [scopeId, setScopeId] = useState<string>("s1");
  const [platformId, setPlatformId] = useState<string>("custom");
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [supportId, setSupportId] = useState<string>("30d");
  const [hostingId, setHostingId] = useState<string>("vercel");
  const [includedOpen, setIncludedOpen] = useState<boolean>(false);

  const project = PROJECT_TYPES.find((p) => p.id === projectId)!;
  const platform = PLATFORMS.find((p) => p.id === platformId)!;
  const support = SUPPORT_TIERS.find((s) => s.id === supportId)!;
  const selectedAddons = ADDONS.filter((a) => addonIds.includes(a.id));
  const scopeConfig = SCOPE_BY_PROJECT[projectId];
  const scope =
    scopeConfig.options.find((o) => o.id === scopeId) ?? scopeConfig.options[0];

  // Reset scope to that project type's first option whenever Step 1 changes
  useEffect(() => {
    setScopeId("s1");
  }, [projectId]);

  const buildRef = BUILDS.find(
    (b) => b.title === PROJECT_TO_BUILD_TITLE[projectId]
  );

  const projectPrice = useMemo(
    () => Math.round(project.base * (1 - platform.discount)),
    [project, platform]
  );
  const addonsTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const total = projectPrice + scope.price + addonsTotal + support.price;

  const toggleAddon = (id: string) => {
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const waMessage = useMemo(() => {
    const lines = [
      "Hi! I'd like a quote based on this estimate:",
      "",
      `• Project: ${project.name} (${platform.name}) — ${fmt(projectPrice)}`,
      `• Scope: ${scope.label}${scope.price ? ` (+${fmt(scope.price)})` : " (Included)"}`,
    ];
    if (selectedAddons.length) {
      lines.push("• Add-ons:");
      selectedAddons.forEach((a) => lines.push(`   - ${a.label} (+${fmt(a.price)})`));
    }
    lines.push(`• Support: ${support.name}${support.included ? " (Included)" : ` (+${fmt(support.price)})`}`);
    const hosting = HOSTING_OPTIONS.find((h) => h.id === hostingId)!;
    lines.push(`• Hosting: ${hosting.name}`);
    lines.push("", `TOTAL: ${fmt(total)}`);
    return lines.join("\n");
  }, [project, platform, projectPrice, scope, selectedAddons, support, total, hostingId]);

  const waLink = `https://wa.me/8801777768353?text=${encodeURIComponent(waMessage)}`;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// PRICING CALCULATOR"
          white="Build Your"
          gradient="Custom Quote"
          subtext="Pick your project type, platform, and add-ons. The estimate updates instantly — message me when you're ready."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT — CONFIGURATOR */}
          <div className="space-y-10">
            {/* STEP 1 */}
            <div>
              <StepHeader n={1} title="What are you building?" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PROJECT_TYPES.map((p) => {
                  const Icon = p.icon;
                  const active = projectId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProjectId(p.id)}
                      className={[
                        "card-elevated card-elevated-hover relative flex flex-col items-start gap-2 p-4 text-left transition-all",
                        active ? "!border-[color:var(--primary)] !bg-[#1C1F26]" : "",
                      ].join(" ")}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--primary)]/10">
                        <Icon className="h-4 w-4 text-[color:var(--primary)]" />
                      </div>
                      <div className="text-sm font-semibold text-white">{p.name}</div>
                      <div className="text-sm font-bold text-[color:var(--primary)]">
                        {p.note ? p.note : `Base ${fmt(p.base)}`}
                      </div>
                      {active && (
                        <Check className="absolute right-3 top-3 h-4 w-4 text-[color:var(--primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2 — Dynamic Scope */}
            <div>
              <StepHeader n={2} title={scopeConfig.label} />
              <div
                key={projectId}
                className="mt-5 grid gap-3 sm:grid-cols-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
              >
                {scopeConfig.options.map((o) => {
                  const active = scope.id === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setScopeId(o.id)}
                      className={[
                        "card-elevated card-elevated-hover relative flex flex-col items-start gap-2 p-4 text-left transition-all",
                        active ? "!border-[color:var(--primary)] !bg-[#1C1F26]" : "",
                      ].join(" ")}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-white">{o.label}</span>
                        {o.tag && (
                          <span className="shrink-0 rounded-full bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--orange)] px-2 py-0.5 text-[10px] font-semibold text-black">
                            {o.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[color:var(--primary)]">
                        {o.price === 0 ? "Included" : `+${fmt(o.price)}`}
                      </div>
                      {active && (
                        <Check className="absolute right-3 bottom-3 h-4 w-4 text-[color:var(--primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
              {scopeConfig.helper && (
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {scopeConfig.helper}
                </p>
              )}
            </div>

            {/* STEP 3 — Platform */}
            <div>
              <StepHeader n={3} title="Choose Your Platform" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {PLATFORMS.map((p) => {
                  const active = platformId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatformId(p.id)}
                      className={[
                        "card-elevated card-elevated-hover relative flex items-start gap-3 p-4 text-left transition-all",
                        active ? "!border-[color:var(--primary)] !bg-[#1C1F26]" : "",
                      ].join(" ")}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        {p.id === "wordpress" ? (
                          <BrandIcon name="WordPress" size={20} />
                        ) : (
                          <Code2 className="h-5 w-5 text-[color:var(--primary)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-white">{p.name}</span>
                          {p.discount > 0 && (
                            <span className="rounded-full bg-[color:var(--orange)]/15 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--orange)]">
                              -15%
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
                      </div>
                      {active && (
                        <Check className="absolute right-3 top-3 h-4 w-4 text-[color:var(--primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 4 — Add-ons + Hosting */}
            <div>
              <StepHeader n={4} title="Add optional features" />
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {ADDONS.map((a) => {
                  const Icon = a.icon;
                  const active = addonIds.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      className={[
                        "card-elevated card-elevated-hover flex cursor-pointer items-center gap-3 p-3.5 transition-all",
                        active ? "!border-[color:var(--primary)] !bg-[#1C1F26]" : "",
                      ].join(" ")}
                    >
                      <Checkbox
                        checked={active}
                        onCheckedChange={() => toggleAddon(a.id)}
                        className="border-white/30 data-[state=checked]:border-[color:var(--primary)] data-[state=checked]:bg-[color:var(--primary)]"
                      />
                      <Icon className="h-4 w-4 shrink-0" style={{ color: a.color }} />
                      <span className="min-w-0 flex-1 text-sm text-white">{a.label}</span>
                      <span className="shrink-0 text-sm font-semibold text-[color:var(--primary)]">
                        +{fmt(a.price)}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Hosting & Deployment subsection */}
              <div className="mt-6">
                <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Hosting &amp; Deployment
                </h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {HOSTING_OPTIONS.map((h) => {
                    const active = hostingId === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setHostingId(h.id)}
                        className={[
                          "card-elevated card-elevated-hover relative flex items-start gap-3 p-4 text-left transition-all",
                          active ? "!border-[color:var(--primary)] !bg-[#1C1F26]" : "",
                        ].join(" ")}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                          <BrandIcon name={h.brand} size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-white">{h.name}</span>
                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              No price impact
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {h.desc}
                          </p>
                          {h.id === "hostinger" && active && (
                            <a
                              href={HOSTINGER_AFFILIATE_URL}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              onClick={(e) => e.stopPropagation()}
                              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--orange)] px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
                            >
                              Claim 20% Off Hostinger
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {active && (
                          <Check className="absolute right-3 top-3 h-4 w-4 text-[color:var(--primary)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STEP 5 — Support */}
            <div>
              <StepHeader n={5} title="Support & Maintenance" />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {SUPPORT_TIERS.map((s) => {
                  const Icon = s.icon;
                  const active = supportId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSupportId(s.id)}
                      className={[
                        "card-elevated card-elevated-hover relative flex flex-col items-start gap-2 p-4 text-left transition-all",
                        active ? "!border-[color:var(--primary)] !bg-[#1C1F26]" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className="h-4 w-4 text-[color:var(--primary)]" />
                        {s.tag && (
                          <span className="rounded-full bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--orange)] px-2 py-0.5 text-[10px] font-semibold text-black">
                            {s.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-white">{s.name}</div>
                      <div className="text-sm font-bold text-[color:var(--primary)]">
                        {s.included ? "Included" : `+${fmt(s.price)}`}
                      </div>
                      {active && (
                        <Check className="absolute right-3 top-3 h-4 w-4 text-[color:var(--primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>


          {/* RIGHT — STICKY ESTIMATE */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative rounded-2xl border border-[color:var(--primary)]/60 bg-[#16181D] p-6 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_30px_90px_-30px_rgba(249,115,22,0.35),0_30px_90px_-40px_rgba(59,130,246,0.45)]">
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[color:var(--primary)]/10 via-transparent to-[color:var(--orange)]/10" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[color:var(--orange)]" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--orange)]">
                    Live estimate
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">Your Estimate</h3>

                <ul className="mt-5 space-y-2.5 text-sm">
                  <li>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">
                        {project.name} <span className="text-white/60">({platform.name})</span>
                      </span>
                      <span className="shrink-0 font-semibold text-white">{fmt(projectPrice)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludedOpen((v) => !v)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[color:var(--primary)] hover:text-[color:var(--orange)] transition-colors"
                      aria-expanded={includedOpen}
                    >
                      {includedOpen ? "Hide what's included" : "See what's included"}
                      <ChevronDown
                        className={[
                          "h-3 w-3 transition-transform",
                          includedOpen ? "rotate-180" : "",
                        ].join(" ")}
                      />
                    </button>
                    {includedOpen && buildRef && (
                      <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {buildRef.desc}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {buildRef.tags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                  <li className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">
                      Scope: <span className="text-white/80">{scope.label}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-white">
                      {scope.price === 0 ? "Included" : `+${fmt(scope.price)}`}
                    </span>
                  </li>
                  {selectedAddons.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">{a.label}</span>
                      <span className="shrink-0 font-semibold text-white">+{fmt(a.price)}</span>
                    </li>
                  ))}
                  <li className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">{support.name}</span>
                    <span className="shrink-0 font-semibold text-white">
                      {support.included ? "Included" : `+${fmt(support.price)}`}
                    </span>
                  </li>
                </ul>


                <div className="my-5 h-px w-full bg-white/10" />

                <div className="flex items-end justify-between gap-3">
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-white">{fmt(total)}</span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  This is an estimate. Final pricing is confirmed after a quick scope discussion.
                </p>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gradient mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-black shadow-[0_10px_30px_-12px_var(--vo-glow)] transition-all hover:scale-[1.02] hover:brightness-110"
                >
                  Get This Quote on WhatsApp
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to="/contact"
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--primary)]/50 px-5 text-sm font-semibold text-white transition-all hover:bg-[color:var(--primary)]/10"
                >
                  Send via Contact Form
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* DISCOUNT BANNER */}
        <div className="relative mt-10 overflow-hidden rounded-2xl p-[1px]">
          <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--primary)]/60 via-white/10 to-[color:var(--orange)]/60" />
          <div className="relative flex flex-col items-start gap-4 rounded-2xl bg-[#16181D] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[color:var(--primary)]/20 to-[color:var(--orange)]/20">
                <Tag className="h-5 w-5 text-[color:var(--orange)]" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Have a custom need or tight budget? I offer flexible discounts for
                <span className="text-white"> early-stage startups, nonprofits, and long-term partnerships.</span>
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[color:var(--primary)]/50 px-5 text-sm font-semibold text-white transition-all hover:bg-[color:var(--primary)]/10"
            >
              Ask About a Custom Offer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--primary)]/50 text-xs font-bold text-[color:var(--primary)]">
        {n}
      </span>
      <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>
    </div>
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
        <PricingCalculatorSection />
        <FaqSection />
        <ClosingCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
