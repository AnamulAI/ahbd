import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  MessageCircle,
  Calendar,
  Github,
  Linkedin,
  Facebook,
  MapPin,
  CheckCircle2,
  Rocket,
  ArrowRight,
  ChevronUp,
  Send,
  CalendarDays,
  Code2,
  Cpu,
  Mic,
  Sparkles,
  Clock,
  Zap,
  Terminal,
  Globe,
  Users,
  Layers,
  PenTool,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — AnamDev | Mohammad Anamul Hoque" },
      {
        name: "description",
        content:
          "Get in touch with Mohammad Anamul Hoque (AnamDev). Freelance developer and AI specialist building modern websites, AI integrations, and AI-powered podcasts.",
      },
      { property: "og:title", content: "Contact — AnamDev" },
      {
        property: "og:description",
        content:
          "Let's build something worth talking about — websites, AI automation, and AI podcasts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

type ServiceValue = "web_development" | "ai_integrator" | "ai_podcast";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Floating Pill Nav (uupm.cc style) ---------- */
function FloatingNav({ onTalk }: { onTalk: () => void }) {
  const links = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/#services" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/contact" },
  ];
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-full border border-white/10 bg-[color:var(--surface)]/70 px-3 py-2 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:px-4">
        <Link to="/" className="flex items-center gap-2 px-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] text-[10px] font-bold text-black">
            AD
          </span>
          <span className="font-mono text-sm font-bold tracking-tight">
            <span className="text-muted-foreground">{"{"}</span>
            <span className="text-white">Anam</span>
            <span className="text-[color:var(--primary)]">Dev</span>
            <span className="text-muted-foreground">{"}"}</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>
        <button
          onClick={onTalk}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[color:var(--primary)] px-4 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_oklch(0.62_0.19_255/55%)] transition hover:brightness-110"
        >
          <Sparkles className="h-4 w-4" />
          <span>Let's Talk</span>
        </button>
      </nav>
    </div>
  );
}

/* ---------- Pill Badge Row (chips like Claude Code / Cursor etc) ---------- */
function ChannelPills() {
  const pills = [
    { icon: Mail, label: "Email", color: "text-[color:var(--primary)]" },
    { icon: MessageCircle, label: "WhatsApp", color: "text-emerald-400" },
    { icon: CalendarDays, label: "Calendly", color: "text-[color:var(--primary)]" },
    { icon: Github, label: "GitHub", color: "text-white" },
    { icon: Linkedin, label: "LinkedIn", color: "text-[color:var(--primary)]" },
    { icon: Facebook, label: "Facebook", color: "text-[color:var(--primary)]" },
    { icon: Globe, label: "Remote", color: "text-[color:var(--orange)]" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {pills.map((p) => {
        const Icon = p.icon;
        return (
          <span
            key={p.label}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)]/70 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur"
          >
            <Icon className={`h-3.5 w-3.5 ${p.color}`} />
            {p.label}
          </span>
        );
      })}
    </div>
  );
}

/* ---------- Stat-style Quick Contact cards ---------- */
function QuickStatCards() {
  const items = [
    { icon: Mail, value: "24h", label: "Email Reply", href: "mailto:hello@anamulhoque.com" },
    { icon: MessageCircle, value: "1:1", label: "WhatsApp Chat", href: "https://wa.me/8801777768353" },
    { icon: CalendarDays, value: "30m", label: "Intro Call", href: "https://cal.com/anamulhoque.com" },
    { icon: MapPin, value: "BD", label: "Chattogram", href: "#" },
    { icon: Clock, value: "GMT+6", label: "Timezone", href: "#" },
    { icon: Zap, value: "Open", label: "For Projects", href: "#contact-form" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <a
            key={it.label}
            href={it.href}
            target={it.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[color:var(--surface)]/60 px-4 py-6 text-center transition hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--surface-2)]/70"
          >
            <Icon className="h-5 w-5 text-[color:var(--primary)] transition group-hover:scale-110" />
            <div className="text-2xl font-bold text-white">{it.value}</div>
            <div className="text-xs text-muted-foreground">{it.label}</div>
          </a>
        );
      })}
    </div>
  );
}

/* ---------- Contact Form ---------- */
function ContactForm({ formRef }: { formRef: React.RefObject<HTMLDivElement | null> }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState<ServiceValue | "">("");
  const [brief, setBrief] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; service?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email.";
    if (!service) next.service = "Please pick a service.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const { error } = await supabase.from("contact_leads").insert({
      full_name: fullName.trim(),
      email: email.trim(),
      service_interest: service,
      project_brief: brief.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Message sent! I'll reply within 24 hours.");
    setFullName("");
    setEmail("");
    setService("");
    setBrief("");
    setErrors({});
  }

  return (
    <div
      id="contact-form"
      ref={formRef}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--surface)]/70 p-6 backdrop-blur-xl sm:p-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(40% 40% at 0% 0%, oklch(0.62 0.19 255 / 18%), transparent 60%), radial-gradient(40% 40% at 100% 100%, oklch(0.74 0.18 50 / 14%), transparent 60%)",
        }}
      />
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
        <Terminal className="h-3.5 w-3.5" />
        send a message
      </div>
      <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
        Tell me about your project
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        No long forms. Just the essentials so we can start the conversation.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2" noValidate>
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm text-white/90">Full Name</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            className="h-12 rounded-xl border-white/10 bg-background/60 text-white placeholder:text-white/30 focus-visible:ring-[color:var(--primary)]"
          />
          {errors.fullName && <p className="text-xs text-red-400">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-white/90">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="h-12 rounded-xl border-white/10 bg-background/60 text-white placeholder:text-white/30 focus-visible:ring-[color:var(--primary)]"
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="service" className="text-sm text-white/90">Service Interest</Label>
          <Select value={service} onValueChange={(v) => setService(v as ServiceValue)}>
            <SelectTrigger
              id="service"
              aria-invalid={!!errors.service}
              className="h-12 rounded-xl border-white/10 bg-background/60 text-left text-white data-[placeholder]:text-white/30 focus-visible:ring-[color:var(--primary)]"
            >
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web_development">Web Development — Websites & Web Apps</SelectItem>
              <SelectItem value="ai_integrator">AI Integrator — Business Automation & AI Solutions</SelectItem>
              <SelectItem value="ai_podcast">AI Podcast — AI-Powered Podcast Production</SelectItem>
            </SelectContent>
          </Select>
          {errors.service && <p className="text-xs text-red-400">{errors.service}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="brief" className="text-sm text-white/90">Project Brief</Label>
          <Textarea
            id="brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Tell me a bit about your project or goals..."
            rows={5}
            className="resize-y rounded-xl border-white/10 bg-background/60 text-white placeholder:text-white/30 focus-visible:ring-[color:var(--primary)]"
          />
        </div>

        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            <Clock className="mr-1 inline h-3.5 w-3.5" />
            Typical response within 24 hours.
          </p>
          <Button
            type="submit"
            disabled={submitting}
            className="group h-12 rounded-full bg-[color:var(--primary)] px-6 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_oklch(0.62_0.19_255/55%)] hover:brightness-110"
          >
            <Send className="mr-1 h-4 w-4" />
            {submitting ? "Sending..." : "Send Message"}
            <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ---------- How It Works — vertical timeline cards ---------- */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: MessageCircle,
      title: "You Reach Out",
      body: "Share your project idea or goals — no lengthy brief needed to start.",
      chips: ["Email", "WhatsApp", "Form"],
    },
    {
      n: "02",
      icon: Calendar,
      title: "We Have a Quick Chat",
      body: "A short call or message exchange to understand your needs and confirm fit.",
      chips: ["30-min call", "Async OK", "Free"],
    },
    {
      n: "03",
      icon: PenTool,
      title: "Scope & Proposal",
      body: "I share a clear plan: deliverables, timeline, and transparent pricing.",
      chips: ["Fixed scope", "Milestones", "Clear pricing"],
    },
    {
      n: "04",
      icon: Rocket,
      title: "We Start Building",
      body: "Focused execution with regular updates and clean handover.",
      chips: ["Weekly updates", "Live preview", "Handover"],
    },
  ];
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)]/70 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.18em] text-[color:var(--primary)]">
          <Layers className="h-3.5 w-3.5" /> how it works
        </div>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          From <span className="text-gradient-vo">Hello</span> to{" "}
          <span className="text-[color:var(--orange)]">Launch</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          A calm, predictable process designed for serious projects.
        </p>
      </div>

      <div className="relative mt-14 space-y-4">
        <div
          aria-hidden
          className="absolute left-6 top-4 bottom-4 hidden w-px bg-gradient-to-b from-[color:var(--primary)]/60 via-white/10 to-[color:var(--orange)]/40 sm:block"
        />
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.n}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--surface)]/70 p-5 transition hover:border-[color:var(--primary)]/40 sm:pl-20"
            >
              <span className="absolute left-4 top-5 hidden h-8 w-8 place-items-center rounded-lg border border-[color:var(--primary)]/40 bg-background/60 sm:grid">
                <Icon className="h-4 w-4 text-[color:var(--primary)]" />
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-xs text-[color:var(--primary)]">// step {s.n}</div>
                <Icon className="h-4 w-4 text-[color:var(--primary)] sm:hidden" />
              </div>
              <h3 className="mt-1 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-white/10 bg-background/40 px-2 py-1 font-mono text-[11px] text-white/70"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Socials strip ---------- */
function SocialStrip() {
  const socials = [
    { icon: Github, name: "GitHub", href: "https://github.com/AnamulAI" },
    { icon: Linkedin, name: "LinkedIn", href: "https://linkedin.com/in/helloenamul" },
    { icon: Facebook, name: "Facebook", href: "https://facebook.com/helloenamul" },
    { icon: Mail, name: "Email", href: "mailto:hello@anamulhoque.com" },
    { icon: MessageCircle, name: "WhatsApp", href: "https://wa.me/8801777768353" },
  ];
  return (
    <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2">
      {socials.map((s) => {
        const Icon = s.icon;
        return (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)]/60 px-4 py-2 text-sm text-white/80 transition hover:border-[color:var(--primary)]/40 hover:text-white"
          >
            <Icon className="h-4 w-4" />
            {s.name}
          </a>
        );
      })}
    </div>
  );
}

/* ---------- Closing CTA ---------- */
function ClosingCTA({ onSend }: { onSend: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(40% 60% at 30% 50%, oklch(0.62 0.19 255 / 25%), transparent 70%), radial-gradient(40% 60% at 70% 50%, oklch(0.74 0.18 50 / 18%), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-28 text-center sm:px-6 sm:py-36">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)]/70 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.18em] text-[color:var(--primary)]">
          <Sparkles className="h-3.5 w-3.5" /> ready when you are
        </div>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
          No long forms. <br />
          <span className="text-gradient-vo">No complicated process.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          Just send a message and let's figure out the best next step together.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={onSend}
            className="group h-12 rounded-full bg-[color:var(--primary)] px-6 text-sm font-semibold text-white shadow-[0_15px_50px_-15px_oklch(0.62_0.19_255/55%)] hover:brightness-110"
          >
            <Send className="mr-1 h-4 w-4" />
            Send a Message
            <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Button>
          <a
            href="https://cal.com/anamulhoque.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)]/70 px-6 text-sm font-semibold text-white transition hover:border-[color:var(--primary)]/40"
          >
            <CalendarDays className="h-4 w-4" />
            Book a Call
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function SiteFooter() {
  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "AI Podcast", href: "/#ai-podcast" },
    { label: "Web Development", href: "/#web-development" },
    { label: "AI Automation", href: "/#ai-automation" },
    { label: "Contact", href: "/contact" },
  ];
  return (
    <footer className="border-t border-white/5 bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-muted-foreground transition hover:text-[color:var(--primary)]">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="my-8 h-px bg-white/5" />
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Mohammad Anamul Hoque. All rights reserved.</p>
          <p>Built with ❤️ &amp; AI</p>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--primary)] text-white shadow-[0_15px_40px_-10px_oklch(0.62_0.19_255/55%)] transition hover:brightness-110"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}

/* ---------- Page ---------- */
function ContactPage() {
  const formRef = useRef<HTMLDivElement | null>(null);
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      {/* ambient radial glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]"
        style={{
          background:
            "radial-gradient(45% 50% at 20% 30%, oklch(0.62 0.19 255 / 28%), transparent 65%), radial-gradient(45% 50% at 85% 25%, oklch(0.74 0.18 50 / 22%), transparent 65%)",
        }}
      />

      <FloatingNav onTalk={scrollToForm} />

      <main className="pt-28">
        {/* HERO */}
        <section className="mx-auto max-w-5xl px-4 pt-12 pb-10 text-center sm:px-6 sm:pt-20">
          <ChannelPills />
          <h1 className="mt-10 text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-7xl">
            <span className="text-gradient-vo">Let's Build Something</span>
            <br />
            Worth <span className="text-[color:var(--orange)]">Talking</span> About
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Have a project in mind? Want to discuss an AI podcast, a modern website,
            or business automation? I'd love to hear what you're working on.
          </p>

          {/* terminal cue */}
          <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-5 py-3 font-mono text-sm shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] backdrop-blur">
            <span className="text-[color:var(--orange)]">$</span>
            <span className="text-white/90">anam --connect</span>
            <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-[color:var(--primary)]" />
          </div>

          {/* primary actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={scrollToForm}
              className="group h-12 rounded-full bg-[color:var(--primary)] px-6 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_oklch(0.62_0.19_255/55%)] hover:brightness-110"
            >
              Send a Message
              <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
            </Button>
            <a
              href="https://cal.com/anamulhoque.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)]/70 px-6 text-sm font-semibold text-white transition hover:border-[color:var(--primary)]/40"
            >
              <CalendarDays className="h-4 w-4" />
              Book Intro Call
            </a>
          </div>

          {/* status pill */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Currently accepting projects
          </div>
        </section>

        {/* QUICK STAT CARDS */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24">
          <QuickStatCards />
        </section>

        <div className="h-px bg-white/5" />

        {/* CONTACT FORM */}
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)]/70 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.18em] text-[color:var(--primary)]">
              <Mail className="h-3.5 w-3.5" /> get in touch
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Start the <span className="text-gradient-vo">Conversation</span>
            </h2>
          </div>
          <ContactForm formRef={formRef} />
          <div className="mt-10">
            <SocialStrip />
          </div>
        </section>

        <div className="h-px bg-white/5" />

        <HowItWorks />

        <div className="h-px bg-white/5" />

        <ClosingCTA onSend={scrollToForm} />
      </main>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
