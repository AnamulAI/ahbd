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
  ArrowLeft,
  ChevronUp,
  Send,
  CalendarDays,
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
      {children}
    </div>
  );
}

function Logo() {
  return (
    <Link
      to="/"
      aria-label="AnamDev home"
      className="font-mono text-base font-bold tracking-tight"
    >
      <span className="text-muted-foreground">{"{"}</span>
      <span className="text-white">Anam</span>
      <span className="text-[color:var(--primary)]">Dev</span>
      <span className="text-muted-foreground">{"}"}</span>
    </Link>
  );
}

function TopNav({ onTalk }: { onTalk: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="group inline-flex h-11 items-center gap-2 rounded-full px-2 text-sm text-muted-foreground transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
        <Logo />
        <button
          onClick={onTalk}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[color:var(--orange)] px-4 text-sm font-semibold text-black shadow-[0_8px_30px_-8px_var(--orange-glow)] transition hover:brightness-110"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Let's Talk</span>
        </button>
      </div>
    </header>
  );
}

function ContactForm({ formRef }: { formRef: React.RefObject<HTMLDivElement | null> }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState<ServiceValue | "">("");
  const [brief, setBrief] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    service?: string;
  }>({});

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
      ref={formRef}
      className="rounded-2xl border border-white/10 bg-[color:var(--surface)]/80 p-6 shadow-[0_20px_60px_-30px_rgba(59,130,246,0.45)] backdrop-blur sm:p-8"
    >
      <Eyebrow>// send a message</Eyebrow>
      <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
        Tell me about your project
      </h2>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm text-white/90">
            Full Name
          </Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            className="h-12 border-white/10 bg-background/60 text-white placeholder:text-white/30 focus-visible:ring-[color:var(--primary)]"
          />
          {errors.fullName && (
            <p className="text-xs text-red-400">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-white/90">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="h-12 border-white/10 bg-background/60 text-white placeholder:text-white/30 focus-visible:ring-[color:var(--primary)]"
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="service" className="text-sm text-white/90">
            Service Interest
          </Label>
          <Select value={service} onValueChange={(v) => setService(v as ServiceValue)}>
            <SelectTrigger
              id="service"
              aria-invalid={!!errors.service}
              className="h-12 border-white/10 bg-background/60 text-left text-white data-[placeholder]:text-white/30 focus-visible:ring-[color:var(--primary)]"
            >
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web_development">
                Web Development — Websites & Web Apps
              </SelectItem>
              <SelectItem value="ai_integrator">
                AI Integrator — Business Automation & AI Solutions
              </SelectItem>
              <SelectItem value="ai_podcast">
                AI Podcast — AI-Powered Podcast Production
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.service && (
            <p className="text-xs text-red-400">{errors.service}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brief" className="text-sm text-white/90">
            Project Brief
          </Label>
          <Textarea
            id="brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Tell me a bit about your project or goals..."
            rows={5}
            className="resize-y border-white/10 bg-background/60 text-white placeholder:text-white/30 focus-visible:ring-[color:var(--primary)]"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="group h-12 w-full rounded-full bg-[color:var(--orange)] px-6 text-sm font-semibold text-black shadow-[0_10px_40px_-10px_var(--orange-glow)] hover:brightness-110 sm:w-auto"
          >
            {submitting ? "Sending..." : "Send Message"}
            <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Typical response within 24 hours.
          </p>
        </div>
      </form>
    </div>
  );
}

type QuickItem = {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  href: string;
  external?: boolean;
};

function QuickContact() {
  const items: QuickItem[] = [
    {
      icon: Mail,
      iconBg: "bg-[color:var(--primary)]/15",
      iconColor: "text-[color:var(--primary)]",
      label: "Drop me an email",
      value: "hello@anamulhoque.com",
      href: "mailto:hello@anamulhoque.com",
    },
    {
      icon: MessageCircle,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      label: "Chat on WhatsApp",
      value: "+880 1777-768353",
      href: "https://wa.me/8801777768353",
      external: true,
    },
    {
      icon: CalendarDays,
      iconBg: "bg-[color:var(--primary)]/15",
      iconColor: "text-[color:var(--primary)]",
      label: "Book a free intro call",
      value: "Schedule on Calendly",
      href: "https://cal.com/anamulhoque.com",
      external: true,
    },
  ];

  return (
    <div>
      <Eyebrow>// quick contact</Eyebrow>
      <div className="mt-4 space-y-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <a
              key={it.value}
              href={it.href}
              target={it.external ? "_blank" : undefined}
              rel={it.external ? "noopener noreferrer" : undefined}
              className="group flex min-h-[64px] items-center gap-4 rounded-xl border border-white/10 bg-[color:var(--surface)]/70 p-4 transition hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--surface-2)]/80"
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-lg ${it.iconBg}`}
              >
                <Icon className={`h-5 w-5 ${it.iconColor}`} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">{it.label}</div>
                <div className="truncate text-sm font-semibold text-white">
                  {it.value}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-white" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function SocialsCard() {
  const socials = [
    { icon: Github, name: "GitHub", handle: "@AnamulAI", href: "https://github.com/AnamulAI" },
    { icon: Linkedin, name: "LinkedIn", handle: "in/helloenamul", href: "https://linkedin.com/in/helloenamul" },
    { icon: Facebook, name: "Facebook", handle: "@helloenamul", href: "https://facebook.com/helloenamul" },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--surface)]/80">
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/30 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </span>
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          social-links.jsx
        </span>
      </div>
      <div className="p-5">
        <Eyebrow>// connect with me</Eyebrow>
        <div className="mt-4 space-y-3">
          {socials.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[56px] items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-white/10 hover:bg-white/[0.03]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-md bg-white/5 text-white/90 group-hover:text-[color:var(--primary)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{s.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {s.handle}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LocationCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-[color:var(--surface)]/70 p-5">
      <Eyebrow>// location</Eyebrow>
      <div className="mt-4 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[color:var(--primary)]/15">
          <MapPin className="h-5 w-5 text-[color:var(--primary)]" />
        </span>
        <div>
          <div className="text-sm font-semibold text-white">
            Chattogram, Bangladesh
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Available for remote work worldwide
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCallout() {
  return (
    <div className="rounded-xl border border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10 p-5 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_20px_60px_-30px_rgba(59,130,246,0.4)]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500/15">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        </span>
        <div>
          <div className="text-sm font-semibold text-white">
            Currently Accepting Projects
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Open for new website and podcast projects. Let's discuss your goals.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProcessSection() {
  const steps = [
    {
      n: "01",
      icon: MessageCircle,
      title: "You Reach Out",
      body: "Share your project idea or goals — no lengthy brief needed to start.",
    },
    {
      n: "02",
      icon: Calendar,
      title: "We Have a Quick Chat",
      body: "A short call or message exchange to understand your needs and see if we're a good fit.",
    },
    {
      n: "03",
      icon: Rocket,
      title: "We Start Building",
      body: "Once aligned, we move into a clear, focused execution plan.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="text-center">
        <Eyebrow>// how it works</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Simple <span className="text-[color:var(--orange)]">3-Step</span> Process
        </h2>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.n}
              className="group rounded-2xl border border-white/10 bg-[color:var(--surface)]/70 p-6 transition hover:border-[color:var(--primary)]/40 hover:shadow-[0_20px_60px_-30px_rgba(59,130,246,0.45)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10">
                <Icon className="h-5 w-5 text-[color:var(--primary)]" />
              </span>
              <div className="mt-5 font-mono text-xs text-[color:var(--primary)]">
                {s.n}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ClosingCTA({ onSend }: { onSend: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(40% 60% at 30% 50%, rgba(59,130,246,0.25), transparent 70%), radial-gradient(40% 60% at 70% 50%, rgba(249,115,22,0.18), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-28 text-center sm:px-6 sm:py-36">
        <Eyebrow>// ready when you are</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          No Long Forms. No Complicated Process.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          Just send a message and let's figure out the best next step together.
        </p>
        <div className="mt-8">
          <Button
            onClick={onSend}
            className="group h-14 rounded-full bg-[color:var(--orange)] px-8 text-base font-semibold text-black shadow-[0_20px_60px_-15px_var(--orange-glow)] hover:brightness-110"
          >
            Send a Message
            <ArrowRight className="ml-1 h-5 w-5 transition group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "AI Podcast", href: "/services#ai-podcast" },
    { label: "Web Development", href: "/services#web-development" },
    { label: "AI Automation", href: "/services#ai-automation" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];
  return (
    <footer className="border-t border-white/5 bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-muted-foreground transition hover:text-[color:var(--primary)]"
            >
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
      className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--orange)] text-black shadow-[0_15px_40px_-10px_var(--orange-glow)] transition hover:brightness-110"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}

function ContactPage() {
  const formRef = useRef<HTMLDivElement | null>(null);
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <TopNav onTalk={scrollToForm} />

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-4xl px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-28 sm:pb-16">
          <Eyebrow>// let's connect</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Let's Build Something
            <br />
            <span className="text-gradient-vo">Worth Talking About</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Have a project in mind? Want to discuss AI podcast content, a modern
            website, or both? I'd love to hear what you're working on.
          </p>
        </section>

        {/* MAIN GRID */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <ContactForm formRef={formRef} />
            <div className="space-y-6">
              <QuickContact />
              <SocialsCard />
              <LocationCard />
              <StatusCallout />
            </div>
          </div>
        </section>

        <div className="h-px bg-white/5" />

        <ProcessSection />

        <div className="h-px bg-white/5" />

        <ClosingCTA onSend={scrollToForm} />
      </main>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
