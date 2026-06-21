import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Bot,
  Briefcase,
  PlugZap,
  MessageCircleOff,
  Repeat,
  Unplug,
  FileQuestion,
  Clock,
  TrendingDown,
  Zap,
  ShieldCheck,
  TrendingUp,
  Plane,
  Building2,
  Stethoscope,
  GraduationCap,
  ShoppingBag,
  Users,
  Globe,
  Sparkles,
  Tag,
  Compass,
  Wand2,
  Rocket,
  PartyPopper,
  Map,
  Languages,
  BarChart3,
  Layers,
  Gauge,
  LifeBuoy,
  CalendarClock,
  ShieldHalf,
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

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import {
  SiOpenai,
  SiGithubcopilot,
  SiPython,
  SiLangchain,
  SiWhatsapp,
  SiPostman,
  SiZapier,
  SiMake,
  SiN8N,
} from "react-icons/si";
import type { IconType } from "react-icons";

export const Route = createFileRoute("/services/ai-integrator")({
  head: () => ({
    meta: [
      { title: "AI Integrator Service — AnamDev" },
      {
        name: "description",
        content:
          "Connect AI to your business without building from scratch. Custom GPT assistants, Microsoft Copilot agents, and API integrations into your real systems.",
      },
      { property: "og:title", content: "AI Integrator Service — AnamDev" },
      {
        property: "og:description",
        content:
          "Practical AI integration: Custom GPTs, Copilot agents, and API connections to your website, WhatsApp, and internal tools.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiIntegratorPage,
});

// ---------- shared bits ----------

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
      <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
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

// ---------- tech stack badges ----------

type TechBadge = { name: string; Icon: IconType; color: string };

const TECH_BADGES: TechBadge[] = [
  { name: "OpenAI", Icon: SiOpenai, color: "#10A37F" },
  { name: "ChatGPT", Icon: SiOpenai, color: "#10A37F" },
  { name: "Microsoft Copilot", Icon: SiGithubcopilot, color: "#0078D4" },
  { name: "Python", Icon: SiPython, color: "#3776AB" },
  { name: "LangChain", Icon: SiLangchain, color: "#1C3C3C" },
  { name: "WhatsApp", Icon: SiWhatsapp, color: "#25D366" },
  { name: "Postman", Icon: SiPostman, color: "#FF6C37" },
  { name: "Zapier", Icon: SiZapier, color: "#FF4A00" },
  { name: "Make.com", Icon: SiMake, color: "#6D00CC" },
  { name: "n8n", Icon: SiN8N, color: "#EA4B71" },
];

function TechIcon({ badge, size = 14 }: { badge: TechBadge; size?: number }) {
  const I = badge.Icon;
  return <I size={size} color={badge.color} aria-hidden />;
}

// ---------- 1. HERO ----------

function HeroSection({ onSamplesClick }: { onSamplesClick: () => void }) {
  const features = [
    "Zero new AI models needed",
    "Works with your existing tools",
    "Deployed on your website, WhatsApp, or office systems",
  ];
  const stats = [
    "3 Core AI Integration Services",
    "Python + API + Prompt Engineering",
    "Real Business Workflows Automated",
  ];
  return (
    <section className="section-glow-hero">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-24">
        <Eyebrow>// AI INTEGRATOR SERVICE</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
          Connect AI to Your Business
          <br />
          <span className="text-gradient-vo">Without Building From Scratch</span>
        </h1>
        <p className="mt-6 max-w-[700px] text-base text-muted-foreground sm:text-lg">
          Most businesses don't need a custom AI model — they need someone who
          understands both the business problem and how to connect existing AI
          (ChatGPT, Copilot, and more) into their current systems. That's the
          gap I fill.
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
          <SecondaryButton onClick={onSamplesClick}>View Project Samples</SecondaryButton>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {stats.map((s) => (
            <div
              key={s}
              className="card-elevated inline-flex items-center gap-2 rounded-full px-4 py-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--primary)]" />
              <span className="text-sm font-medium text-white/90">{s}</span>
            </div>
          ))}
        </div>

        <div className="tech-marquee mt-8 w-full max-w-5xl overflow-hidden motion-reduce:overflow-visible motion-reduce:[mask-image:none] motion-reduce:[-webkit-mask-image:none]">
          <div className="tech-marquee-track motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:animate-none">
            {[...TECH_BADGES, ...TECH_BADGES].map((b, i) => (
              <span
                key={`${b.name}-${i}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/85"
                style={b.color ? { color: b.color } : undefined}
              >
                <TechIcon badge={b} />
                <span className="text-white/85">{b.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 2. THE REAL PROBLEM ----------

const PAIN_POINTS = [
  { icon: MessageCircleOff, title: "Generic Chatbots", text: "Basic chatbots that can't actually answer real business questions" },
  { icon: Repeat, title: "Repetitive Manual Work", text: "Staff answering the same questions about policies, pricing, and procedures every day" },
  { icon: Unplug, title: "Disconnected Tools", text: "ChatGPT or Copilot sitting separately from the website, WhatsApp, or internal systems" },
  { icon: FileQuestion, title: "Scattered Knowledge", text: "Important documents and policies spread across folders no one can search easily" },
  { icon: Clock, title: "Slow Response Times", text: "Customers and employees waiting hours for answers that could be instant" },
  { icon: TrendingDown, title: "Missed Automation Opportunity", text: "Real business processes that could be automated but never get connected to AI" },
];

function ProblemSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// THE REAL PROBLEM"
          white={"Most Businesses Have AI Access \u2014"}
          gradient="But No Real Integration"
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
                <h3 className="mt-5 text-sm font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          You don't need to build new AI — you need someone to connect what already
          exists to where your business actually works.
        </p>
      </div>
    </section>
  );
}

// ---------- 3. WHAT I BUILD ----------

type Build = {
  id: "gpt" | "copilot" | "api";
  icon: React.ComponentType<{ className?: string }>;
  brandColor?: string;
  title: string;
  desc: string;
  tags: string[];
  features: string[];
  process: string[];
};

const BUILDS: Build[] = [
  {
    id: "gpt",
    icon: SiOpenai,
    brandColor: "#10A37F",
    title: "Custom GPT Assistant",
    desc: "A focused AI assistant trained on your business documents — pricing, services, policies, FAQs — deployable instantly via a shareable link or the GPT Store.",
    tags: ["Zero-Code", "Fast Setup", "Knowledge-Based"],
    features: [
      "Trained on your uploaded documents (PDFs, policies, price lists)",
      "Professional, on-brand conversation tone",
      "Handles pricing, booking, and FAQ-style questions",
      "Shareable link or GPT Store deployment",
      "Suggested starter prompts for users",
      "Basic usage instructions handoff",
    ],
    process: [
      "Discovery of your business knowledge & goals",
      "Document/content preparation & cleanup",
      "Custom instructions & conversation design",
      "Testing with real sample questions",
      "Handoff with usage guide",
    ],
  },
  {
    id: "copilot",
    icon: SiGithubcopilot,
    brandColor: "#0078D4",
    title: "Microsoft Copilot Agent",
    desc: "A corporate office AI assistant that reads your company's documents and policies, answers employee questions, and can draft Word, Excel, and PowerPoint files.",
    tags: ["Office 365", "SharePoint", "Enterprise-Ready"],
    features: [
      "Reads company documents (policies, guides, SharePoint)",
      "Answers employee questions instantly",
      "Drafts Word documents on request",
      "Organizes data into Excel",
      "Generates PowerPoint summaries",
      "Custom branding (name, logo, tone)",
    ],
    process: [
      "Business document review & organization",
      "Knowledge source setup (SharePoint/files/links)",
      "Logical instruction & rules writing",
      "Testing with real employee scenarios",
      "Handoff & usage training",
    ],
  },
  {
    id: "api",
    icon: PlugZap,
    title: "API Integration",
    desc: "Connecting AI directly into your website, WhatsApp, Messenger, or internal systems — so AI works where your customers and team already are, not in a separate chat window.",
    tags: ["Website", "WhatsApp", "Custom Systems"],
    features: [
      "Connects AI to your live website chat",
      "WhatsApp Business integration",
      "Messenger/Slack integration where applicable",
      "Structured request/response setup (JSON)",
      "Secure handling of API keys & tokens",
      "Basic error handling & fallback responses",
    ],
    process: [
      "Mapping where AI should respond (channel & source)",
      "API/endpoint setup & testing (Postman-verified)",
      "Connecting AI model to the target platform",
      "Live testing with real scenarios",
      "Handoff with documentation",
    ],
  },
];

function BuildDialog({ build, children }: { build: Build; children: React.ReactNode }) {
  const Icon = build.icon;
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col overflow-hidden max-h-[90vh] p-0 sm:max-w-2xl">
        <span aria-hidden className="modal-scan-line" />
        <div className="flex flex-col gap-4 overflow-y-auto p-6 max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--primary)]/15">
                <Icon className="h-5 w-5 text-[color:var(--primary)]" />
              </span>
              <DialogTitle className="font-display text-xl font-bold">{build.title}</DialogTitle>
            </div>
            <DialogDescription className="font-sans pt-2 text-sm leading-relaxed">
              {build.desc}
            </DialogDescription>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {build.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </DialogHeader>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
                Standard Features
              </h4>
              <ul className="mt-3 space-y-1">
                {build.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)]" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--orange)]">
                Delivery Process
              </h4>
              <ul className="mt-3 space-y-1">
                {build.process.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--orange)]" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-2 flex flex-col items-center gap-3 border-t border-white/10 pt-5 text-center">
            <p className="text-sm text-muted-foreground">Ready to put AI to real work?</p>
            <Link
              to="/contact"
              className="btn-gradient inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
            >
              Discuss Your Project <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WhatIBuildSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// WHAT I BUILD"
          white="Three Ways I"
          gradient="Connect AI to Your Business"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BUILDS.map((b) => {
            const Icon = b.icon;
            return (
              <BuildDialog key={b.id} build={b}>
                <button
                  type="button"
                  className="card-elevated card-elevated-hover flex h-full flex-col items-center p-6 text-center cursor-pointer"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--primary)]/15">
                    <Icon className="h-5 w-5 text-[color:var(--primary)]" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
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
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--primary)]">
                    View Details <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              </BuildDialog>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------- 4. VALUE EQUATION ----------

const VALUES = [
  { icon: Zap, title: "Immediate Impact", desc: "Your existing AI tools finally connect to where your business actually operates — no need to build anything from scratch." },
  { icon: ShieldCheck, title: "No Technical Overwhelm", desc: "You don't need to understand AI models or coding — I handle the technical bridge, you get the working result." },
  { icon: Gauge, title: "Faster Than Custom Development", desc: "Connecting existing AI models is faster and more affordable than building custom software from the ground up." },
  { icon: TrendingUp, title: "Scales With Your Business", desc: "Start with one assistant or integration, then expand to more channels and workflows as you grow." },
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
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground sm:text-base">
          Faster setup · Lower cost · Real business outcomes · Built on proven AI models
        </p>
      </div>
    </section>
  );
}

// ---------- 5. ICP ----------

const ICP = [
  { icon: Plane, label: "Travel Agencies", desc: "Instant answers on packages, pricing, and booking" },
  { icon: Building2, label: "Consulting Firms", desc: "Office assistants that handle policy & HR questions" },
  { icon: Stethoscope, label: "Clinics & Healthcare", desc: "After-hours booking and FAQ automation" },
  { icon: GraduationCap, label: "Schools & Training Centers", desc: "Admissions and course info, answered instantly" },
  { icon: ShoppingBag, label: "Local Service Businesses", desc: "WhatsApp-based customer support that never sleeps" },
  { icon: Users, label: "Recruitment Agencies", desc: "Automated candidate and client FAQ handling" },
  { icon: Briefcase, label: "Small & Growing Offices", desc: "Internal knowledge assistants for HR & IT questions" },
  { icon: Globe, label: "Website Owners Needing Smarter Support", desc: "Turn a static FAQ page into a real AI assistant" },
];

function IdealClientsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="// IDEAL CLIENTS" white="Who This Is" gradient="Best For" />
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
                <h3 className="mt-5 text-sm font-semibold text-white">{c.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          If your business already has documents, policies, or repetitive questions —
          but no AI connected to handle them — this service is built for you.
        </p>
      </div>
    </section>
  );
}

// ---------- 6. INCLUDED ----------

const CORE_DELIVERABLES = [
  "Discovery call to understand your business & goals",
  "Document/knowledge preparation",
  "Custom AI assistant or integration build",
  "Testing with real-world scenarios",
  "Usage guide & handoff",
  "30 days of free support",
];

const ADD_ONS = [
  { icon: Languages, title: "Multi-Language Support", desc: "Bengali, English, or both" },
  { icon: MessageCircleOff, title: "WhatsApp Business API Setup", desc: "Full WhatsApp integration & automation" },
  { icon: Layers, title: "Multiple Channel Deployment", desc: "Website + WhatsApp + Messenger together" },
  { icon: ShieldCheck, title: "Ongoing Monitoring & Updates", desc: "Monthly maintenance retainer available" },
];

function IncludedSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="// THE PACKAGE" white="What's" gradient="Included" />
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
                      <div className="text-sm font-semibold text-white">{a.title}</div>
                      <div className="mt-0.5 text-sm text-muted-foreground">{a.desc}</div>
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

// ---------- 7. PROCESS ----------

const STEPS = [
  { icon: Compass, title: "Understand Your Business", desc: "We identify where AI can realistically help — your documents, repetitive questions, and existing tools." },
  { icon: Map, title: "Choose the Right Approach", desc: "Custom GPT, Copilot Agent, or API integration — whichever fits your platform and goals best." },
  { icon: Wand2, title: "Build & Configure", desc: "Your AI assistant is trained, configured, and connected using your real business information." },
  { icon: ShieldCheck, title: "Test With Real Scenarios", desc: "We test using actual customer or employee questions to confirm accuracy and tone." },
  { icon: PartyPopper, title: "Launch & Handoff", desc: "You receive a working AI assistant or integration, with a simple usage guide." },
];

function ProcessSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="// PROCESS" white="How It" gradient="Works" />
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
                  <h3 className="mt-1 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-10 text-center text-sm text-muted-foreground sm:text-base">
          Practical process · Real business focus · No unnecessary complexity
        </p>
      </div>
    </section>
  );
}

// ---------- 8. PROJECTS (placeholder) ----------

function ProjectsSection({ id }: { id: string }) {
  return (
    <section id={id} className="py-20 sm:py-28 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// PORTFOLIO"
          white="Selected"
          gradient="AI Integration Projects"
          subtext="Real project examples are being added as new AI integration work is completed."
        />
        <div className="mx-auto mt-12 max-w-xl">
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04]">
              <Clock className="h-6 w-6 text-white/40" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">Coming Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              New AI integration case studies will be added here soon.
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Want to be one of the first case studies?{" "}
          <Link
            to="/contact"
            className="font-semibold text-[color:var(--primary)] hover:text-[color:var(--orange)] transition-colors"
          >
            Discuss Your Project <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        </p>
      </div>
    </section>
  );
}

// ---------- 9. PRICING CALCULATOR ----------

type ServiceType = {
  id: "gpt" | "copilot" | "api";
  name: string;
  base: number;
  icon: React.ComponentType<{ className?: string }>;
};

const SERVICE_TYPES: ServiceType[] = [
  { id: "gpt", name: "Custom GPT Assistant", base: 300, icon: Bot },
  { id: "copilot", name: "Microsoft Copilot Agent", base: 700, icon: Briefcase },
  { id: "api", name: "API Integration", base: 500, icon: PlugZap },
];

type ScopeOption = { id: string; label: string; price: number; tag?: string };
type ScopeConfig = { label: string; options: ScopeOption[] };

const SCOPE_BY_SERVICE: Record<ServiceType["id"], ScopeConfig> = {
  gpt: {
    label: "Knowledge Scope",
    options: [
      { id: "s1", label: "1–3 Documents (Simple Q&A)", price: 0, tag: "Most Popular" },
      { id: "s2", label: "4–10 Documents", price: 100 },
      { id: "s3", label: "11–25 Documents", price: 250 },
      { id: "s4", label: "Full Knowledge Base (Unlimited)", price: 450 },
    ],
  },
  copilot: {
    label: "Package Tier",
    options: [
      { id: "s1", label: "Small (3–5 Documents, Simple Q&A)", price: 0 },
      { id: "s2", label: "Medium (SharePoint/Knowledge Folder Integration)", price: 400 },
      { id: "s3", label: "Premium (M365 Environment-Wide + Automation Roadmap)", price: 1200 },
    ],
  },
  api: {
    label: "Integration Scope",
    options: [
      { id: "s1", label: "Single Channel (Website OR WhatsApp)", price: 0 },
      { id: "s2", label: "Two Channels (Website + WhatsApp)", price: 200 },
      { id: "s3", label: "Three+ Channels (Website + WhatsApp + Messenger/Slack)", price: 400 },
      { id: "s4", label: "Custom System Integration (CRM/Internal Tools)", price: 700 },
    ],
  },
};

const ADDONS = [
  { id: "lang", label: "Multi-Language Support (Bengali + English)", price: 100, recurring: false },
  { id: "wa", label: "WhatsApp Business API Full Setup", price: 200, recurring: false },
  { id: "brand", label: "Custom Branding (Logo, Name, Tone)", price: 80, recurring: false },
  { id: "analytics", label: "Analytics & Usage Reporting", price: 150, recurring: false },
  { id: "retainer", label: "Monthly Monitoring & Updates Retainer", price: 120, recurring: true },
] as const;

const SUPPORT_TIERS = [
  { id: "30d", name: "30 Days Free Support", price: 0, included: true, tag: null as string | null, icon: LifeBuoy },
  { id: "3m", name: "3 Months Support", price: 150, included: false, tag: null as string | null, icon: CalendarClock },
  { id: "6m", name: "6 Months Support", price: 280, included: false, tag: "Recommended" as string | null, icon: ShieldHalf },
] as const;

const fmt = (n: number) => `$${n.toLocaleString()}`;

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

function PricingCalculatorSection() {
  const [serviceId, setServiceId] = useState<ServiceType["id"]>("gpt");
  const [scopeId, setScopeId] = useState<string>("s1");
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [supportId, setSupportId] = useState<string>("30d");

  const service = SERVICE_TYPES.find((s) => s.id === serviceId)!;
  const scopeConfig = SCOPE_BY_SERVICE[serviceId];
  const scope = scopeConfig.options.find((o) => o.id === scopeId) ?? scopeConfig.options[0];
  const support = SUPPORT_TIERS.find((s) => s.id === supportId)!;
  const selectedAddons = ADDONS.filter((a) => addonIds.includes(a.id));

  // Reset scope when service changes
  function handleService(id: ServiceType["id"]) {
    setServiceId(id);
    setScopeId(SCOPE_BY_SERVICE[id].options[0].id);
  }

  const toggleAddon = (id: string) =>
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const oneTimeAddons = selectedAddons.filter((a) => !a.recurring);
  const recurringAddons = selectedAddons.filter((a) => a.recurring);
  const oneTimeTotal =
    service.base +
    scope.price +
    oneTimeAddons.reduce((acc, a) => acc + a.price, 0) +
    (support.included ? 0 : support.price);
  const recurringTotal = recurringAddons.reduce((acc, a) => acc + a.price, 0);

  const currentBuild = useMemo(() => BUILDS.find((b) => b.id === serviceId)!, [serviceId]);

  const waMessage = useMemo(() => {
    const lines = [
      "Hi Anam, I built a custom AI Integrator quote:",
      "",
      `• Service: ${service.name} (${fmt(service.base)})`,
      `• ${scopeConfig.label}: ${scope.label}${scope.price === 0 ? " (Included)" : ` (+${fmt(scope.price)})`}`,
    ];
    if (selectedAddons.length) {
      lines.push("• Add-ons:");
      selectedAddons.forEach((a) =>
        lines.push(`   - ${a.label} (+${fmt(a.price)}${a.recurring ? "/month" : ""})`),
      );
    }
    lines.push(
      `• Support: ${support.name}${support.included ? " (Included)" : ` (+${fmt(support.price)})`}`,
    );
    lines.push("", `ONE-TIME TOTAL: ${fmt(oneTimeTotal)}`);
    if (recurringTotal > 0) lines.push(`RECURRING: ${fmt(recurringTotal)}/month`);
    return lines.join("\n");
  }, [service, scope, scopeConfig.label, selectedAddons, support, oneTimeTotal, recurringTotal]);

  const waLink = `https://wa.me/8801777768353?text=${encodeURIComponent(waMessage)}`;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// PRICING CALCULATOR"
          white="Build Your"
          gradient="Custom Quote"
          subtext="Pick your integration type and add-ons. The estimate updates instantly."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <div className="space-y-10">
            {/* STEP 1 */}
            <div>
              <StepHeader n={1} title="What do you need?" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SERVICE_TYPES.map((s) => {
                  const Icon = s.icon;
                  const active = serviceId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleService(s.id)}
                      className={[
                      "card-elevated card-elevated-hover relative flex h-full min-h-[116px] flex-col p-4 text-left transition-all cursor-pointer",
                      active ? "!border-[color:var(--primary)] !bg-[#1C1F26]" : "",
                    ].join(" ")}
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary)]/10">
                        <Icon className="h-4 w-4 text-[color:var(--primary)]" />
                      </div>
                      <div className="pt-1 text-sm font-semibold leading-snug text-white">{s.name}</div>
                    </div>
                    <div className="mt-3 pl-12 text-sm font-bold text-[color:var(--primary)]">
                      Base {fmt(s.base)}
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
                key={serviceId}
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
            </div>

            {/* STEP 3 — Add-ons */}
            <div>
              <StepHeader n={3} title="Add Optional Features" />
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {ADDONS.map((a) => {
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
                      <span className="min-w-0 flex-1 text-sm text-white">{a.label}</span>
                      <span className="shrink-0 text-sm font-semibold text-[color:var(--primary)]">
                        +{fmt(a.price)}
                        {a.recurring ? (
                          <span className="ml-1 text-[10px] font-medium text-[color:var(--orange)]">
                            /mo
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* STEP 4 — Support */}
            <div>
              <StepHeader n={4} title="Support & Maintenance" />
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
                      <span className="text-muted-foreground">{service.name}</span>
                      <span className="shrink-0 font-semibold text-white">{fmt(service.base)}</span>
                    </div>
                    <BuildDialog build={currentBuild}>
                      <button
                        type="button"
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[color:var(--primary)] hover:text-[color:var(--orange)] transition-colors cursor-pointer"
                      >
                        See what's included <ArrowRight className="h-3 w-3" />
                      </button>
                    </BuildDialog>
                  </li>
                  <li className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">
                      {scopeConfig.label}: <span className="text-white/80">{scope.label}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-white">
                      {scope.price === 0 ? "Included" : `+${fmt(scope.price)}`}
                    </span>
                  </li>
                  {selectedAddons.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">{a.label}</span>
                      <span className="shrink-0 font-semibold text-white">
                        +{fmt(a.price)}
                        {a.recurring ? (
                          <span className="ml-1 text-[10px] font-medium text-[color:var(--orange)]">
                            /mo
                          </span>
                        ) : null}
                      </span>
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
                    One-time
                  </span>
                  <span className="text-3xl font-bold text-white">{fmt(oneTimeTotal)}</span>
                </div>
                {recurringTotal > 0 && (
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--orange)]">
                      + Recurring
                    </span>
                    <span className="text-sm font-bold text-[color:var(--orange)]">
                      {fmt(recurringTotal)}/month
                    </span>
                  </div>
                )}

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
                <span className="text-white">
                  {" "}
                  early-stage startups, nonprofits, and long-term partnerships.
                </span>
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

// ---------- 10. FAQ ----------

const FAQS = [
  {
    q: "Do I need to build a new AI model for this?",
    a: "No. This service connects existing AI models like ChatGPT and Microsoft Copilot into your business — no custom AI model is ever needed.",
  },
  {
    q: "What's the difference between a Custom GPT and a Copilot Agent?",
    a: "A Custom GPT is best for a focused assistant (like answering customer questions from a knowledge base). A Copilot Agent is better suited for internal office use — reading company documents and helping employees with Word, Excel, and PowerPoint tasks.",
  },
  {
    q: "Can this work with my existing website or WhatsApp?",
    a: "Yes — API integration connects AI directly to your website chat, WhatsApp Business account, or other platforms your business already uses.",
  },
  {
    q: "How long does a typical project take?",
    a: "A Custom GPT assistant can be ready in about a week. Copilot Agents and API integrations typically take 1–3 weeks depending on scope and how many systems are involved.",
  },
  {
    q: "Do you provide support after launch?",
    a: "Yes, every project includes 30 days of free support, with optional extended support plans available.",
  },
];

function FaqSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="// QUESTIONS" white="Common" gradient="Questions" />
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

// ---------- 11. CLOSING CTA ----------

function ClosingCtaSection() {
  return (
    <section className="section-glow-cta">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <Eyebrow>// LET'S CONNECT AI TO YOUR BUSINESS</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          Ready to Put AI to{" "}
          <span className="text-gradient-vo">Real Work?</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Tell me about your business, your documents, and where you'd like AI to
          help — we'll find the right integration for you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA to="/contact">Discuss Your Project</PrimaryCTA>
          {/* TODO: revert to "/services" once a proper services overview/index page is built (after AI Integrator and AI Podcast service pages are complete) */}
          <SecondaryButton href="/services/web-development">View All Services</SecondaryButton>
        </div>
      </div>
    </section>
  );
}

// ---------- PAGE ----------

function AiIntegratorPage() {
  const scrollToSamples = () => {
    document.getElementById("ai-project-samples")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
        <ProjectsSection id="ai-project-samples" />
        <PricingCalculatorSection />
        <FaqSection />
        <ClosingCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
