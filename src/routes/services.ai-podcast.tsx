import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  X as XIcon,
  Mic,
  Mic2,
  MicOff,
  Clock,
  Share2,
  Rocket,
  Video,
  PenTool,
  Briefcase,
  Megaphone,
  GraduationCap,
  Newspaper,
  TrendingUp,
  Send,
  Wand2,
  Eye,
  Upload,
  Sparkles,
  Tag,
  AudioLines,
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
  SiSpotify,
  SiApplepodcasts,
  SiYoutube,
  SiTiktok,
  SiInstagram,
  SiFacebook,
  SiX,
  SiWhatsapp,
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import type { IconType } from "react-icons";

export const Route = createFileRoute("/services/ai-podcast")({
  head: () => ({
    meta: [
      { title: "AI Podcast Production Service — AnamDev" },
      {
        name: "description",
        content:
          "Done-for-you AI podcast production. Turn a topic, blog post, URL, or PDF into a publish-ready audio + video podcast — no recording required.",
      },
      { property: "og:title", content: "AI Podcast Production Service — AnamDev" },
      {
        property: "og:description",
        content:
          "Send a topic, blog, URL, or PDF. I produce a complete podcast — script, AI voice, branded intro/outro, audio + video, ready to publish.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiPodcastPage,
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

// ---------- brand badges ----------

type Brand = { name: string; Icon: IconType; color: string };

const PUBLISH_BRANDS: Brand[] = [
  { name: "Spotify", Icon: SiSpotify, color: "#1DB954" },
  { name: "Apple Podcasts", Icon: SiApplepodcasts, color: "#9933CC" },
  { name: "YouTube", Icon: SiYoutube, color: "#FF0000" },
  { name: "TikTok", Icon: SiTiktok, color: "#FFFFFF" },
  { name: "Instagram", Icon: SiInstagram, color: "#E4405F" },
  { name: "Facebook", Icon: SiFacebook, color: "#1877F2" },
  { name: "X", Icon: SiX, color: "#FFFFFF" },
  { name: "LinkedIn", Icon: FaLinkedin, color: "#0A66C2" },
];

// ---------- 1. HERO ----------

function HeroSection({ onHowItWorksClick }: { onHowItWorksClick: () => void }) {
  const features = [
    "No recording equipment needed",
    "300+ AI voices, 50+ languages",
    "Published to every major platform",
  ];

  return (
    <section className="section-glow-hero">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-24">
        <Eyebrow>// AI PODCAST PRODUCTION</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
          Turn a Topic, Blog, or PDF Into a{" "}
          <span className="text-gradient-vo">Professional Podcast</span>
          {" "}— Without Recording a Word.
        </h1>
        <p className="mt-6 max-w-[700px] text-base text-muted-foreground sm:text-lg">
          I turn your existing content — a topic, a blog post, a URL, or a PDF
          — into a fully produced, publish-ready podcast. No microphone, no
          studio, no editing skills required on your end.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA to="/contact">Start Your Podcast</PrimaryCTA>
          <SecondaryButton onClick={onHowItWorksClick}>See How It Works</SecondaryButton>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {features.map((f) => (
            <li key={f} className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[color:var(--primary)]" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Mock editor card */}
        <div className="mt-12 w-full max-w-2xl">
          <div className="card-elevated rounded-2xl p-5 text-left shadow-[0_30px_80px_-30px_rgba(59,130,246,0.4)]">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                // create new episode
              </span>
            </div>
            <div className="mt-4">
              <label className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--primary)]">
                Source
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <Upload className="h-4 w-4 shrink-0 text-[color:var(--primary)]" />
                <span className="truncate font-mono text-xs text-muted-foreground">
                  https://yourblog.com/the-future-of-ai-podcasts
                </span>
              </div>
            </div>
            <div className="mt-4">
              <label className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--primary)]">
                Voice
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {["A", "B", "C", "D", "E", "F"].map((v, i) => (
                  <span
                    key={v}
                    className={[
                      "grid h-9 w-9 place-items-center rounded-full text-xs font-bold",
                      i === 0
                        ? "bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] text-black"
                        : "bg-white/[0.05] text-white/70 border border-white/10",
                    ].join(" ")}
                  >
                    {v}
                  </span>
                ))}
                <span className="grid h-9 px-3 place-items-center rounded-full bg-white/[0.05] text-xs text-white/60 border border-white/10">
                  +294 more
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-gradient mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-black"
              disabled
            >
              Generate Episode <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 2. THE REAL PROBLEM ----------

const PAIN_POINTS = [
  {
    icon: MicOff,
    title: "No Equipment, No Studio",
    text: "A proper podcast setup means microphones, acoustic treatment, and editing software most people never get around to buying or learning.",
  },
  {
    icon: Clock,
    title: "Recording Takes Hours You Don't Have",
    text: "Between scripting, recording multiple takes, and editing out mistakes, a single episode can eat an entire afternoon — or more.",
  },
  {
    icon: Share2,
    title: "Great Content, Wrong Format",
    text: "Your blog posts, case studies, and ideas are already valuable — they're just sitting in a format your audience doesn't consume on the go.",
  },
];

function ProblemSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// THE REAL PROBLEM"
          white="You Have the Content. You Don't Have the"
          gradient="Time"
          trailing="to Turn It Into Audio."
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
                <h3 className="mt-5 text-base font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          Your content deserves to be heard, not just read. That's the gap this
          service closes.
        </p>
      </div>
    </section>
  );
}

// ---------- 3. WHAT I BUILD (hero deliverable) ----------

const CORE_FEATURES = [
  "Script generation from your source material",
  "Choice of 12+ podcast styles (Solo Commentary, Conversational, Interview, Deep Dive, Daily Brief, Panel, Storytelling, and more)",
  "AI voice selection from 300+ premium voices across 50+ languages",
  "Custom branded Intro, Outro, and Ad-break segments with background music",
  "Auto-captioned video version exported in 9:16, 16:9, and 1:1 formats",
  "MP3 audio download + full transcript",
];

const CORE_PROCESS = [
  "Project discovery and direction",
  "Content review and script planning",
  "AI voice and style selection",
  "Quality review and revision",
  "Multi-platform publishing setup",
  "Launch-ready handoff",
];

function CoreServiceDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col overflow-hidden max-h-[90vh] p-0 sm:max-w-2xl">
        <span aria-hidden className="modal-scan-line" />
        <div className="flex flex-col gap-4 overflow-y-auto p-6 max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--primary)]/15">
                <Mic className="h-5 w-5 text-[color:var(--primary)]" />
              </span>
              <DialogTitle className="font-display text-xl font-bold">
                Done-For-You AI Podcast Production
              </DialogTitle>
            </div>
            <DialogDescription className="font-sans pt-2 text-sm leading-relaxed">
              Send a topic, keyword, blog post, URL, or PDF. I handle everything
              from there — script structuring, AI voice narration in your chosen
              style, branded intro/outro with background music, and a
              publish-ready audio episode. Video version included, formatted for
              every platform.
            </DialogDescription>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Audio + Video", "300+ AI Voices", "50+ Languages", "12+ Show Styles"].map((t) => (
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
                {CORE_FEATURES.map((f) => (
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
                {CORE_PROCESS.map((f) => (
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
            <p className="text-sm text-muted-foreground">Ready to launch your show?</p>
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
          white="One Service. A Complete"
          gradient="Podcast"
          trailing=", Delivered."
        />
        <div className="mt-16 flex justify-center">
          <div className="relative w-full max-w-xl">
            {/* Featured badge */}
            <span className="absolute left-1/2 -top-3 -translate-x-1/2 rounded-full bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--orange)] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-[0_6px_20px_-6px_var(--vo-glow)]">
              Core Service
            </span>
            {/* Permanent glow ring */}
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-[color:var(--primary)]/20 via-transparent to-[color:var(--orange)]/20 blur-2xl" />
            <div className="rounded-2xl border-2 border-[color:var(--primary)]/50 bg-[#16181D] p-8 text-center shadow-[0_30px_90px_-30px_rgba(59,130,246,0.45),0_30px_90px_-40px_rgba(249,115,22,0.35)]">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[color:var(--primary)]/20 to-[color:var(--orange)]/20">
                <Mic className="h-6 w-6 text-[color:var(--primary)]" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-white sm:text-2xl">
                Done-For-You AI Podcast Production
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Send me a topic, keyword, blog post, URL, or PDF. I handle
                everything from there — script structuring, AI voice narration
                in your chosen style, branded intro/outro with background music,
                and a publish-ready audio episode. Video version included,
                formatted for every platform.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {["Audio + Video", "300+ AI Voices", "50+ Languages", "12+ Show Styles"].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <CoreServiceDialog>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--primary)] hover:text-[color:var(--orange)] transition-colors cursor-pointer"
                >
                  See Full Details <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </CoreServiceDialog>
              <div className="mt-6">
                <PrimaryCTA to="/contact">Get Started</PrimaryCTA>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 4. ADD-ONS ----------

const ADDON_CARDS = [
  {
    icon: Rocket,
    title: "Platform Setup & Publishing",
    desc: "I'll set up your show on Spotify, Apple Podcasts, and YouTube Podcasts from scratch and publish your episodes directly — no accounts to figure out, no RSS feed headaches.",
  },
  {
    icon: Share2,
    title: "Social Media Repurposing",
    desc: "Your episode, cut down into ready-to-post clips for Facebook, Instagram, X, TikTok, and LinkedIn — formatted and captioned for each platform's audience.",
  },
  {
    icon: AudioLines,
    title: "Voice Cloning Setup",
    desc: "Want every episode in your own voice without ever recording? I'll set up a custom AI voice clone from a short sample, so your show always sounds like you.",
  },
  {
    icon: Video,
    title: "AI Avatar Video Podcast",
    desc: "A lip-synced AI avatar delivers your script on camera — full video podcast production without you ever sitting in front of a camera.",
  },
];

function AddOnsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// ADVANCED ADD-ONS"
          white="Extend Your Podcast With"
          gradient="Add-On Services"
          subtext="Once your core episode is ready, choose any of the following to maximize its reach and production value."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {ADDON_CARDS.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.title}
                className="card-elevated card-elevated-hover flex flex-col p-6"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--primary)]/15">
                  <Icon className="h-5 w-5 text-[color:var(--primary)]" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {a.desc}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--primary)]">
                  <span className="text-base leading-none">+</span> Add to Plan
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------- 5. VALUE EQUATION ----------

const TRADITIONAL = [
  "Buy and learn microphone + audio equipment",
  "Hours of recording and re-takes per episode",
  "Hire or learn audio/video editing",
  "Separately figure out distribution to each platform",
  "Manually create social clips",
  "Weeks before your first episode is live",
];

const DFY = [
  "Just send a topic, blog, URL, or PDF",
  "Professional audio + video delivered, no recording",
  "AI voice narration with your chosen style and branding",
  "One service handles production, you choose your add-ons",
  "Episodes ready in days, not weeks",
];

function ValueSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// VALUE EQUATION"
          white="Traditional Podcast Production"
          gradient="vs."
          trailing="This Service"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="card-elevated p-7 opacity-80">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              // TRADITIONAL STUDIO PRODUCTION
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white/70">The Old Way</h3>
            <ul className="mt-5 space-y-3">
              {TRADITIONAL.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-500/15">
                    <XIcon className="h-3 w-3 text-red-400/80" />
                  </span>
                  <span className="text-sm text-muted-foreground sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-2xl border border-[color:var(--primary)]/50 bg-[#16181D] p-7 shadow-[0_30px_80px_-30px_rgba(59,130,246,0.4)]">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary)]">
              // DONE-FOR-YOU AI PODCAST
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">The New Way</h3>
            <ul className="mt-5 space-y-3">
              {DFY.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--primary)]" />
                  <span className="text-sm text-white sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 6. WHO'S IT FOR ----------

const ICP = [
  { icon: PenTool, label: "Bloggers & Writers", desc: "Turn your existing articles into a podcast without writing a single extra word." },
  { icon: Briefcase, label: "Small Business Owners", desc: "Build a branded show around your expertise without hiring a production team." },
  { icon: Megaphone, label: "Marketers & Agencies", desc: "Repurpose content library assets into audio at scale, for clients or your own brand." },
  { icon: GraduationCap, label: "Coaches & Consultants", desc: "Establish authority with a consistent weekly show, without the production overhead." },
  { icon: Newspaper, label: "Newsletter Writers", desc: "Reach Spotify and Apple Podcasts listeners who will never open your email." },
  { icon: TrendingUp, label: "Content Creators", desc: "Add a podcast to your content stack without adding hours to your week." },
];

function WhoSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// WHO'S IT FOR"
          white="Built For Anyone With"
          gradient="Content"
          trailing=", Not a Studio"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  );
}

// ---------- 7. INCLUDED ----------

const INCLUDED = [
  "Script generation from your source material (topic, blog, URL, or PDF)",
  "Choice of podcast style matched to your content (interview, solo commentary, deep dive, and more)",
  "Premium AI voice narration in your preferred language and tone",
  "Branded intro and outro with background music",
  "Full audio episode (MP3) + auto-captioned video version",
  "Episode transcript for accessibility and SEO",
  "One round of revisions before final delivery",
];

function IncludedSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// WHAT'S INCLUDED"
          white="Every Episode Includes"
          gradient="This"
          trailing=", By Default"
        />
        <div className="card-elevated mt-12 p-7 sm:p-8">
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--primary)]" />
                <span className="text-sm text-white sm:text-base">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---------- 8. HOW IT WORKS ----------

const STEPS = [
  { icon: Send, title: "Send Your Content", desc: "Share a topic, blog post link, URL, or PDF. That's all the raw material I need to get started." },
  { icon: Wand2, title: "I Build Your Episode", desc: "I structure the script, select the right voice and podcast style for your content, and produce the full audio and video episode." },
  { icon: Eye, title: "You Review & Approve", desc: "I send you the finished episode for review. One round of revisions is included to get it exactly right." },
  { icon: Rocket, title: "Publish & Repurpose", desc: "Your episode goes live — and if you've added Platform Setup or Social Repurposing, it's distributed and clipped automatically." },
];

function HowItWorksSection({ id }: { id: string }) {
  return (
    <section id={id} className="py-20 sm:py-28 scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// HOW IT WORKS"
          white="From Content to"
          gradient="Published Episode"
          trailing="in 4 Steps"
        />
        <ol className="mt-12 space-y-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="card-elevated card-elevated-hover flex gap-5 p-6">
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
                    Step {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// ---------- 9. SELECTED PROJECTS (illustrative concepts) ----------

type ConceptCardData = {
  category: string;
  thumbnailIcon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  thumbnailColor: string;
  title: string;
  description: string;
  tags: Brand[];
};

const CONCEPTS: ConceptCardData[] = [
  {
    category: "Solo Commentary",
    thumbnailIcon: Mic,
    thumbnailColor: "#3B82F6",
    title: "Weekly Business Insights Show",
    description:
      "A concept example: a consulting brand turning its blog into a weekly 15-minute solo commentary podcast — same expertise, audio-first format.",
    tags: [
      { name: "Spotify", Icon: SiSpotify, color: "#1DB954" },
      { name: "Apple Podcasts", Icon: SiApplepodcasts, color: "#9933CC" },
      { name: "YouTube", Icon: SiYoutube, color: "#FF0000" },
    ],
  },
  {
    category: "Newsletter-to-Audio",
    thumbnailIcon: Newspaper,
    thumbnailColor: "#F97316",
    title: "Client Newsletter-to-Podcast",
    description:
      "A concept example: a newsletter writer repurposing each issue into an audio episode, reaching Spotify and Apple Podcasts listeners who never open email.",
    tags: [
      { name: "Spotify", Icon: SiSpotify, color: "#1DB954" },
      { name: "Apple Podcasts", Icon: SiApplepodcasts, color: "#9933CC" },
    ],
  },
  {
    category: "Conversational",
    thumbnailIcon: Mic2,
    thumbnailColor: "#10A37F",
    title: "Brand Authority Interview Series",
    description:
      "A concept example: an agency using the conversational style to simulate an interview-format thought-leadership show, distributed across audio and short-form video.",
    tags: [
      { name: "YouTube", Icon: SiYoutube, color: "#FF0000" },
      { name: "Spotify", Icon: SiSpotify, color: "#1DB954" },
      { name: "LinkedIn", Icon: FaLinkedin, color: "#0A66C2" },
    ],
  },
];

function ConceptCard({ card }: { card: ConceptCardData }) {
  const Thumb = card.thumbnailIcon;
  return (
    <div className="card-elevated card-elevated-hover flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
          {card.category}
        </span>
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-white/40">
          Example Concept
        </span>
      </div>

      <div className="mt-4 flex aspect-video items-center justify-center rounded-xl bg-white/[0.03]">
        <Thumb className="h-10 w-10" style={{ color: card.thumbnailColor }} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{card.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {card.tags.map((t) => {
          const I = t.Icon;
          return (
            <span
              key={t.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-white/80"
            >
              <I size={14} style={{ color: t.color }} />
              {t.name}
            </span>
          );
        })}
      </div>

      <div className="mt-3">
        <Link
          to="/contact"
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[color:var(--primary)]/40 px-3 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--primary)]/10"
        >
          Discuss a Similar Project <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function ProjectsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// SELECTED PROJECTS"
          white="What This Could Look Like For"
          gradient="You"
          subtext="These are illustrative example concepts, not completed client projects — a preview of what's possible."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((c) => (
            <ConceptCard key={c.title} card={c} />
          ))}
        </div>

        {/* Publish-everywhere brand row */}
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            // Published where your audience already listens
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PUBLISH_BRANDS.map((b) => {
              const I = b.Icon;
              return (
                <span
                  key={b.name}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/85"
                >
                  <I size={14} style={{ color: b.color }} />
                  <span>{b.name}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 10. PRICING CALCULATOR ----------

type DurationOption = { id: string; label: string; price: number };
type VolumeOption = { id: string; label: string; price: number };

const DURATION_OPTIONS: DurationOption[] = [
  { id: "d1", label: "5–10 min", price: 0 },
  { id: "d2", label: "15 min", price: 100 },
  { id: "d3", label: "20 min", price: 200 },
  { id: "d4", label: "30 min", price: 400 },
  { id: "d5", label: "45 min", price: 600 },
];

const VOLUME_OPTIONS: VolumeOption[] = [
  { id: "v1", label: "4 episodes", price: 0 },
  { id: "v2", label: "8 episodes", price: 400 },
  { id: "v3", label: "12 episodes", price: 800 },
  { id: "v4", label: "16 episodes", price: 1200 },
];

const PRICING_ADDONS = [
  { id: "platform", label: "Platform Setup & Publishing", price: 200, recurring: false },
  { id: "social", label: "Social Media Repurposing", price: 200, recurring: true },
  { id: "voice", label: "Voice Cloning Setup", price: 100, recurring: false },
  { id: "avatar", label: "AI Avatar Video Podcast", price: 400, recurring: true },
] as const;

const BASE_PRICE = 990;
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

function IncludedDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col overflow-hidden max-h-[90vh] p-0 sm:max-w-2xl">
        <span aria-hidden className="modal-scan-line" />
        <div className="flex flex-col gap-4 overflow-y-auto p-6 max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--primary)]/15">
                <Mic className="h-5 w-5 text-[color:var(--primary)]" />
              </span>
              <DialogTitle className="font-display text-xl font-bold">
                What's Included In Your Plan
              </DialogTitle>
            </div>
            <DialogDescription className="font-sans pt-2 text-sm leading-relaxed">
              Every plan starts with the full Done-For-You production service.
              Add-ons extend reach and production value on top of the core
              deliverables below.
            </DialogDescription>
          </DialogHeader>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
              Core Service
            </h4>
            <ul className="mt-3 space-y-1">
              {CORE_FEATURES.map((f) => (
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
              Available Add-Ons
            </h4>
            <ul className="mt-3 space-y-1">
              {ADDON_CARDS.map((a) => (
                <li
                  key={a.title}
                  className="flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--orange)]" aria-hidden />
                  <span>
                    <span className="font-semibold text-white">{a.title}</span> — {a.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 flex flex-col items-center gap-3 border-t border-white/10 pt-5 text-center">
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

function PricingCalculatorSection() {
  const [durationId, setDurationId] = useState<string>("d1");
  const [volumeId, setVolumeId] = useState<string>("v1");
  const [addonIds, setAddonIds] = useState<string[]>([]);

  const duration = DURATION_OPTIONS.find((d) => d.id === durationId)!;
  const volume = VOLUME_OPTIONS.find((v) => v.id === volumeId)!;
  const selectedAddons = PRICING_ADDONS.filter((a) => addonIds.includes(a.id));

  const toggleAddon = (id: string) =>
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const recurringAddons = selectedAddons.filter((a) => a.recurring);
  const oneTimeAddons = selectedAddons.filter((a) => !a.recurring);

  const monthlyTotal =
    BASE_PRICE +
    duration.price +
    volume.price +
    recurringAddons.reduce((acc, a) => acc + a.price, 0);
  const oneTimeTotal = oneTimeAddons.reduce((acc, a) => acc + a.price, 0);

  const waMessage = useMemo(() => {
    const lines = [
      "Hi Anam, I built a custom AI Podcast quote:",
      "",
      `• Base plan: ${fmt(BASE_PRICE)}/month`,
      `• Episode duration: ${duration.label}${duration.price === 0 ? " (Included)" : ` (+${fmt(duration.price)}/mo)`}`,
      `• Monthly volume: ${volume.label}${volume.price === 0 ? " (Included)" : ` (+${fmt(volume.price)}/mo)`}`,
    ];
    if (selectedAddons.length) {
      lines.push("• Add-ons:");
      selectedAddons.forEach((a) =>
        lines.push(`   - ${a.label} (+${fmt(a.price)}${a.recurring ? "/mo" : " one-time"})`),
      );
    }
    lines.push("", `MONTHLY TOTAL: ${fmt(monthlyTotal)}/month`);
    if (oneTimeTotal > 0) lines.push(`ONE-TIME SETUP: ${fmt(oneTimeTotal)}`);
    return lines.join("\n");
  }, [duration, volume, selectedAddons, monthlyTotal, oneTimeTotal]);

  const waLink = `https://wa.me/8801777768353?text=${encodeURIComponent(waMessage)}`;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="// PRICING"
          white="Build Your"
          gradient="Perfect Plan"
          subtext="Start at $990/month — customize duration, volume, and add-ons to match your needs."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <div className="space-y-10">
            {/* STEP 1 — Duration */}
            <div>
              <StepHeader n={1} title="Episode Duration" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {DURATION_OPTIONS.map((d) => {
                  const active = durationId === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDurationId(d.id)}
                      className={[
                        "card-elevated card-elevated-hover relative flex h-full min-h-[110px] flex-col p-3.5 text-left transition-all cursor-pointer",
                        active ? "!border-[color:var(--primary)] !bg-[#1C1F26]" : "",
                      ].join(" ")}
                    >
                      <div className="flex flex-1 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary)]/10">
                          <Clock className="h-4 w-4 text-[color:var(--primary)]" />
                        </div>
                        <div className="pt-0.5 text-sm font-semibold leading-snug text-white">
                          {d.label}
                        </div>
                      </div>
                      <div className="mt-2 pl-12 text-sm font-bold text-[color:var(--primary)]">
                        {d.price === 0 ? "Included" : `+${fmt(d.price)}/mo`}
                      </div>
                      {active && (
                        <Check className="absolute right-3 top-3 h-4 w-4 text-[color:var(--primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2 — Volume */}
            <div>
              <StepHeader n={2} title="Monthly Volume" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {VOLUME_OPTIONS.map((v) => {
                  const active = volumeId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVolumeId(v.id)}
                      className={[
                        "card-elevated card-elevated-hover relative flex h-full min-h-[110px] flex-col p-3.5 text-left transition-all cursor-pointer",
                        active ? "!border-[color:var(--primary)] !bg-[#1C1F26]" : "",
                      ].join(" ")}
                    >
                      <div className="flex flex-1 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary)]/10">
                          <Mic className="h-4 w-4 text-[color:var(--primary)]" />
                        </div>
                        <div className="pt-0.5 text-sm font-semibold leading-snug text-white">
                          {v.label}
                        </div>
                      </div>
                      <div className="mt-2 pl-12 text-sm font-bold text-[color:var(--primary)]">
                        {v.price === 0 ? "Included" : `+${fmt(v.price)}/mo`}
                      </div>
                      {active && (
                        <Check className="absolute right-3 top-3 h-4 w-4 text-[color:var(--primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3 — Add-ons */}
            <div>
              <StepHeader n={3} title="Optional Add-Ons" />
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {PRICING_ADDONS.map((a) => {
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
                        <span className="ml-1 text-[10px] font-medium text-[color:var(--orange)]">
                          {a.recurring ? "/mo" : "one-time"}
                        </span>
                      </span>
                    </label>
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
                <h3 className="mt-2 text-xl font-semibold text-white">Your Plan</h3>

                <ul className="mt-5 space-y-2.5 text-sm">
                  <li>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Base plan</span>
                      <span className="shrink-0 font-semibold text-white">
                        {fmt(BASE_PRICE)}
                        <span className="ml-1 text-[10px] font-medium text-[color:var(--orange)]">/mo</span>
                      </span>
                    </div>
                    <IncludedDialog>
                      <button
                        type="button"
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[color:var(--primary)] hover:text-[color:var(--orange)] transition-colors cursor-pointer"
                      >
                        See what's included <ArrowRight className="h-3 w-3" />
                      </button>
                    </IncludedDialog>
                  </li>
                  <li className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">
                      Duration: <span className="text-white/80">{duration.label}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-white">
                      {duration.price === 0 ? "Included" : `+${fmt(duration.price)}/mo`}
                    </span>
                  </li>
                  <li className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">
                      Volume: <span className="text-white/80">{volume.label}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-white">
                      {volume.price === 0 ? "Included" : `+${fmt(volume.price)}/mo`}
                    </span>
                  </li>
                  {selectedAddons.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">{a.label}</span>
                      <span className="shrink-0 font-semibold text-white">
                        +{fmt(a.price)}
                        <span className="ml-1 text-[10px] font-medium text-[color:var(--orange)]">
                          {a.recurring ? "/mo" : "one-time"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="my-5 h-px w-full bg-white/10" />

                <div className="flex items-end justify-between gap-3">
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Monthly Total
                  </span>
                  <span className="text-3xl font-bold text-white">
                    {fmt(monthlyTotal)}
                    <span className="ml-1 text-sm font-medium text-[color:var(--orange)]">/mo</span>
                  </span>
                </div>
                {oneTimeTotal > 0 && (
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--orange)]">
                      + One-time setup
                    </span>
                    <span className="text-sm font-bold text-[color:var(--orange)]">
                      {fmt(oneTimeTotal)}
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
                Have a custom need or a tighter budget?{" "}
                <span className="text-white">
                  Every show is different — let's talk about what fits.
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

// ---------- 11. FAQ ----------

const FAQS = [
  {
    q: "Do I need any recording equipment?",
    a: "No. You don't need a microphone, recording software, or any audio equipment. Just send me your content — a topic, blog post, URL, or PDF — and I handle the rest.",
  },
  {
    q: "What if I want the podcast in my own voice?",
    a: "Add Voice Cloning Setup, and I'll create a custom AI voice clone from a short sample of yours. Every future episode will sound like you, without you recording anything.",
  },
  {
    q: "Which platforms will my podcast be published to?",
    a: "With the Platform Setup add-on, I'll get your show live on Spotify, Apple Podcasts, and YouTube Podcasts. Social Media Repurposing extends that reach to Facebook, Instagram, X, TikTok, and LinkedIn.",
  },
  {
    q: "How long does it take to get my first episode?",
    a: "Once I have your content, your first episode is typically ready within a few days, including your one round of revisions.",
  },
  {
    q: "Can I convert a private or paywalled article?",
    a: "If your content is behind a login or paywall, just paste the text directly when you send it over — I can work from text the same way I work from a public link.",
  },
  {
    q: "What languages are supported?",
    a: "Voice narration is available in 50+ languages, so your podcast can reach an audience well beyond English speakers.",
  },
  {
    q: "Is this a one-time project or an ongoing service?",
    a: "It's an ongoing monthly service — episodes keep getting produced every month at the volume you choose, so your show stays consistent.",
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
              <AccordionTrigger className="py-5 text-base font-semibold text-white hover:no-underline text-left">
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

// ---------- 12. CLOSING CTA ----------

function ClosingCtaSection() {
  return (
    <section className="section-glow-cta">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <Eyebrow>// LET'S GET YOUR SHOW LIVE</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          Your Content Is Already a{" "}
          <span className="text-gradient-vo">Podcast.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Stop letting valuable content sit unused. Send me your first piece,
          and let's get your show live.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA to="/contact">Start Your Podcast</PrimaryCTA>
        </div>
        <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[color:var(--primary)]" />
            No recording equipment needed
          </span>
          <span className="text-white/20">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[color:var(--primary)]" />
            Published everywhere your audience listens
          </span>
        </p>
      </div>
    </section>
  );
}

// ---------- PAGE ----------

const HOW_IT_WORKS_ID = "ai-podcast-how-it-works";

function AiPodcastPage() {
  const scrollToHowItWorks = () => {
    document.getElementById(HOW_IT_WORKS_ID)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Reference to keep Languages icon import used somewhere (multi-language tag use)
  void Languages;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <HeroSection onHowItWorksClick={scrollToHowItWorks} />
        <ProblemSection />
        <WhatIBuildSection />
        <AddOnsSection />
        <ValueSection />
        <WhoSection />
        <IncludedSection />
        <HowItWorksSection id={HOW_IT_WORKS_ID} />
        <ProjectsSection />
        <PricingCalculatorSection />
        <FaqSection />
        <ClosingCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
