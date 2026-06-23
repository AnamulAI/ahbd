import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Eye,
  Quote,
  Star,
  Target,
  TrendingUp,
  User,
  Zap,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BrandIcon, brandColor } from "@/components/site/BrandIcon";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type ServiceCategory = "web-development" | "ai-integrator" | "ai-podcast";
type SubType =
  | "landing-page"
  | "business-site"
  | "web-app"
  | "ecommerce"
  | "dashboard";

interface ProjectDetail {
  slug: string;
  title: string;
  oneLiner: string;
  serviceCategory: ServiceCategory;
  subType?: SubType;
  coverImage?: string;
  techStack: string[];
  isRealClient: boolean;
  statusBadge?: "Example Concept" | "Self-Initiated";
  liveUrl?: string;
  timeline?: string;
  role?: string;
  rating?: number;
  views?: number;
  challenge: string;
  solution: string;
  results: string[];
  processSteps?: { title: string; description: string }[];
  testimonial?: { quote: string; name: string; role: string };
  aboutNarrative: string;
}

const SUBTYPE_LABEL: Record<SubType, string> = {
  "landing-page": "Landing Page",
  "business-site": "Business Site",
  "web-app": "Web App",
  ecommerce: "eCommerce",
  dashboard: "Dashboard",
};

const DEFAULT_ROLE =
  "Full-Stack Developer & Designer (Solo) — Design through Development to Deployment";

const PROJECTS: ProjectDetail[] = [
  {
    slug: "flawless-awards",
    title: "Flawless Awards",
    oneLiner:
      "AI-powered custom corporate awards platform — crystal, glass, metal & acrylic.",
    serviceCategory: "web-development",
    subType: "ecommerce",
    techStack: ["Lovable", "Supabase", "shadcn/ui"],
    isRealClient: true,
    liveUrl: "https://flawlessawards.lovable.app",
    timeline: "Migration project",
    role: DEFAULT_ROLE,
    rating: 5,
    views: 1240,
    challenge:
      "The client was previously on Shopify, where the monthly subscription cost was high. They needed to migrate to a more cost-effective platform — but also wanted a new AI-powered design feature added at the same time.",
    solution:
      "The entire site was migrated from Shopify to Lovable + Supabase — along with a new AI Designer feature (generate a custom award design from a text prompt), a 4-category stock catalog (Crystal/Glass/Metal/Acrylic), pricing display, and an admin panel.",
    results: [
      "Monthly cost reduced compared to Shopify",
      "Client received every custom feature they asked for — confirmed directly by the client",
      "The AI Designer flow shortened the design-to-quote time",
    ],
    aboutNarrative:
      "Flawless Awards is a B2B corporate awards business — making custom awards in crystal, glass, metal, and acrylic. This migration project started because the client wanted to reduce the monthly cost of their old Shopify-based site. The new site adds an AI Designer tool where the client types a text prompt to generate an award design — then refines and customizes it before ordering. It also includes a material-wise stock catalog, pricing display, and an admin management panel.\n\n**Tech & Design**\n- Platform: Lovable (AI-built) + Supabase\n- Key Feature: AI-powered design generation flow, multi-category catalog\n\n**Business Impact**\nThe client's hosting cost dropped, and every custom feature they wanted was successfully implemented on the new platform.",
  },
  {
    slug: "manarul-huda-madrasa",
    title: "Manarul Huda Madrasa Chattogram",
    oneLiner:
      "Full institutional website for a local Islamic education institution.",
    serviceCategory: "web-development",
    subType: "business-site",
    techStack: ["React", "Tailwind CSS", "Framer Motion", "Lovable", "Supabase"],
    isRealClient: true,
    timeline: "7 days",
    role: DEFAULT_ROLE,
    rating: 5,
    views: 980,
    challenge:
      "Manarul Huda Madrasa had no website — their entire digital presence was a single Facebook page. New students couldn't find admission information, parents had no way to learn about the institution's departments and facilities, and the proud history of 350+ students and 500+ alumni existed nowhere online.",
    solution:
      "A complete institutional website was built — covering admissions, departments, a notice board, a photo gallery, and direct contact. The design kept an Islamic aesthetic (teal + gold palette) to feel modern, trustworthy, and mobile-friendly.",
    results: [
      "Transformed from Facebook-only presence to a full professional website",
      "Admissions, departments, and notices are now accessible 24/7 online",
      "Able to showcase the history of 350+ students and 500+ alumni",
      "Parents can now contact the institution directly through the website",
      "Delivered in full within 7 days",
    ],
    processSteps: [
      {
        title: "Discovery",
        description:
          "Talked with madrasa leadership to understand the target audience (parents and students), required sections, and collected content",
      },
      {
        title: "Design Direction",
        description:
          "Kept the Islamic aesthetic while using a teal + gold color palette for a modern, trustworthy UI",
      },
      {
        title: "Development",
        description:
          "Built the responsive frontend with React, Tailwind CSS, Framer Motion, Radix UI, and shadcn/ui",
      },
      {
        title: "Content Integration",
        description:
          "Organized department descriptions, student counts, alumni information, notice board, and contact section",
      },
      {
        title: "Deployment & Delivery",
        description:
          "Fast, secure deployment via Cloudflare, with full delivery to the client within 7 days",
      },
    ],
    testimonial: {
      quote:
        "জাযাকাল্লাহ, অনেক গুরুত্বপূর্ণ সহযোগিতা — দিল থেকে দুয়া আসতেছে আপনার জন্য।",
      name: "Manarul Huda Madrasa Chattogram",
      role: "Institution Representative",
    },
    aboutNarrative:
      "Manarul Huda Madrasa Chattogram is a trusted Islamic education institution with 350+ students and 500+ alumni — but their digital presence was limited to Facebook alone.\n\nIn this project, we built them a complete professional website where admission information, department details, the notice board, and contact options are all available in one place.",
  },
  {
    slug: "trackmate",
    title: "TrackMate",
    oneLiner:
      "Subscription, domain & AI tool credit tracker — built for Bangladeshi founders.",
    serviceCategory: "web-development",
    subType: "web-app",
    techStack: ["React", "Next.js", "TypeScript", "Supabase"],
    isRealClient: false,
    statusBadge: "Self-Initiated",
    liveUrl: "https://bdtrack.lovable.app",
    timeline: "Self-initiated build",
    role: DEFAULT_ROLE,
    rating: 4,
    views: 720,
    challenge:
      "A Namecheap domain expires. A ChatGPT Plus charge goes through. A Canva Pro subscription has been running for 3 months — unused. Bangladeshi founders waste an average of ৳7,500+ every month simply because nothing is being tracked.",
    solution:
      "A dashboard tool that tracks every subscription, domain, and AI tool credit in one place — sending WhatsApp, Telegram, and Email reminders 3 days and 1 day before a charge, with a monthly/yearly cost breakdown in BDT.",
    results: [
      "Multi-channel alert system (WhatsApp, Telegram, Email) before any charge hits",
      "A single dashboard for every domain, subscription, and AI tool credit",
      "A complete setup flow in 3 minutes",
      "Free plan to get started",
    ],
    aboutNarrative:
      "TrackMate is a SaaS product I built from my own idea — still early-stage, with no public traction yet. The problem is real: Bangladeshi founders, freelancers, and creators often forget when a domain or subscription is about to renew, leading to unexpected charges.\n\n**Tech & Design**\n- Platform: Lovable (AI-built) + Supabase\n- Color Scheme: Dark navy + electric purple — a modern SaaS feel\n- Language: Bengali-first UI — built for a Bangladeshi audience\n- Key Feature: Real-time dashboard, expiry countdown, WhatsApp integration\n\n**Business Impact**\nThis isn't just a tracker — it's a money-saving tool that proves its own value from the very first alert.",
  },
  {
    slug: "organic-maca-powder",
    title: "Organic Maca Powder",
    oneLiner:
      "Conversion-optimized single-product landing page for a health supplement brand.",
    serviceCategory: "web-development",
    subType: "landing-page",
    techStack: ["Lovable", "Supabase"],
    isRealClient: true,
    liveUrl: "https://macapowder.lovable.app",
    timeline: "Single-product landing build",
    role: DEFAULT_ROLE,
    rating: 5,
    views: 1530,
    challenge:
      "The client had an organic supplement product (Peru-sourced Maca powder) but lacked an effective, conversion-focused sales page to build customer trust — health and wellness niches typically face high skepticism and need strong proof points.",
    solution:
      "A complete conversion-optimized single-product landing page — including a problem-agitation section, trust badges, origin storytelling, a comparison table, social proof, urgency elements, 3-tier pricing, and an FAQ.",
    results: [
      "3,000+ satisfied customers",
      "97% repeat purchase rate",
      "4.8★ average rating",
      "Real customer testimonials supporting the trust-building content",
    ],
    aboutNarrative:
      "Organic Maca Powder is a D2C health supplement business selling Peru-sourced organic maca powder in the Bangladesh market. Health and wellness niches face higher customer skepticism, so this landing page prioritizes trust-building above everything else — a Lab Tested badge, a money-back guarantee, an origin story, and real customer reviews.\n\n**Business Impact**\nAs a live business, it has earned 3,000+ customers and a 97% repeat purchase rate — proof that conversion-focused design has a direct impact on business results.",
  },
  {
    slug: "shikho-lms",
    title: "Shikho LMS",
    oneLiner:
      "Tech skills training platform concept — live classes, dashboard, course marketplace.",
    serviceCategory: "web-development",
    subType: "dashboard",
    techStack: ["Lovable", "Supabase", "shadcn/ui"],
    isRealClient: false,
    statusBadge: "Example Concept",
    liveUrl: "https://shikholms.lovable.app",
    timeline: "Concept/demo build",
    role: DEFAULT_ROLE,
    rating: 4,
    views: 540,
    challenge:
      "(Example Concept — illustrative problem statement) A common challenge for EdTech businesses: scattered recorded videos, no structured progress tracking, and no clear way for students to prove job-readiness.",
    solution:
      "A full LMS platform concept — live class booking, a student dashboard (progress, certificates, project reviews, job support), a multi-category course catalog, and a batch-based enrollment system.",
    results: [
      "Live class + recorded session booking flow",
      "Student dashboard with progress tracking",
      "Multi-category course catalog with filtering",
      "Batch-based enrollment with seat countdown",
    ],
    aboutNarrative:
      "Shikho LMS is a self-initiated demo/concept project — there is no real client or real student data behind it. It was built to demonstrate the capability of a complete EdTech platform: live classes, a dashboard, a multi-category course system, and batch enrollment.\n\n**Please note:** every statistic on this project (student count, rating, company logos) is placeholder/sample content — not real business data. It exists purely to demonstrate platform-building capability.",
  },
  {
    slug: "viral-effects",
    title: "Viral Effects",
    oneLiner:
      "Single-course sales page for a content creator — video editing & growth education.",
    serviceCategory: "web-development",
    subType: "landing-page",
    techStack: ["Lovable", "Supabase"],
    isRealClient: true,
    liveUrl: "https://viral-effects.lovable.app",
    timeline: "Course sales page build",
    role: DEFAULT_ROLE,
    rating: 5,
    views: 1120,
    challenge:
      "The creator had real audience metrics (7.8 million+ views, 33,000+ followers) but no effective sales page to turn that organic success into a sellable course or product.",
    solution:
      "A complete persuasion-optimized course sales page — problem-agitation, positioning around the creator's own 'Scroll-Stopper Effect' framework, a real social-proof stat banner, a 6-point benefit grid, single-tier pricing, a 7-day curriculum breakdown, and a money-back guarantee.",
    results: [
      "7.8 million+ views",
      "33,000+ followers",
      "24.5 million reach",
      "109+ videos produced",
    ],
    aboutNarrative:
      "Viral Effects is a single-course sales landing page built for a real content creator — selling a course on video editing and social media growth. Using the creator's own real audience metrics (7.8 million+ views, 33,000+ followers), this page builds a strong social-proof-driven sales narrative centered on the creator's signature 'Scroll-Stopper Effect' framework.\n\n**Business Impact**\nReal audience data was used to build trust, while a 14-day money-back guarantee lowered the perceived risk of purchase.",
  },
  {
    slug: "reachly",
    title: "Reachly",
    oneLiner:
      "AI-powered cold email automation SaaS — built for Bangladesh-focused outreach.",
    serviceCategory: "web-development",
    subType: "web-app",
    techStack: ["Lovable", "Supabase"],
    isRealClient: false,
    statusBadge: "Self-Initiated",
    liveUrl: "https://reachlyai.vercel.app",
    timeline: "Self-initiated, pre-launch",
    role: DEFAULT_ROLE,
    rating: 4,
    views: 610,
    challenge:
      "Founders, agencies, and sales teams send cold emails manually, miss follow-ups, and often can't reach the inbox due to poor spam scores — costing significant time and effort in booking meetings.",
    solution:
      "An AI-powered cold email automation platform — AI Email Writer, multi-step sequences, smart scheduling, auto email warmup & rotation, a spam score checker, A/B testing, Bengali/Unicode support, and bKash payment integration.",
    results: [
      "Improved reply rate based on early/beta (Friends & Family) user feedback",
      "Time saved compared to manual outreach",
      "Bengali/Unicode email support — a Bangladesh-market-specific feature",
      "Note: these metrics come from limited Friends & Family usage — the product has not been publicly launched yet",
    ],
    aboutNarrative:
      "Reachly is an AI-powered cold email automation SaaS I built myself — currently used by a small group of Friends & Family, not yet publicly launched. It targets the Bangladesh market with bKash payment and Bengali/Unicode email support.\n\n**Tech & Design**\n- Platform: Lovable (AI-built) + Supabase, deployed on Vercel\n- Key Feature: AI email writer, multi-step sequence automation, spam score checker\n\n**Current Status:** Pre-launch, gathering feedback from Friends & Family users.",
  },
  {
    slug: "karigor",
    title: "Karigor",
    oneLiner:
      "On-demand skilled worker marketplace — electrical, plumbing & AC service booking.",
    serviceCategory: "web-development",
    subType: "web-app",
    techStack: ["Lovable", "Supabase"],
    isRealClient: true,
    liveUrl: "https://karigor.uttarontechnologies.com",
    timeline: "Marketplace build",
    role: DEFAULT_ROLE,
    rating: 5,
    views: 890,
    challenge:
      "Uttaron Technologies Ltd (established 1985) wanted to turn their service business into a digital marketplace — where customers could easily find verified, rated skilled workers and book them securely with an advance payment.",
    solution:
      "A complete service marketplace platform — category-wise service browsing, a 4-step booking flow, verified worker (\"Karigor\") profiles with ratings, experience, and booking fees, a real-time rating and review system, and secure payment integration.",
    results: [
      "Multiple verified worker profiles live on the platform",
      "Each worker shows a real rating (4.5–4.9★) and years of experience",
      "A simple 4-step booking flow for an easy user experience",
      "Real founder and customer testimonials supporting trust-building",
    ],
    aboutNarrative:
      "Karigor is an on-demand skilled-worker marketplace — a real client project for Uttaron Technologies Ltd (established 1985). Through this platform, customers find verified workers in categories like electrical, plumbing, and AC service, review their ratings and experience, and book securely with a 25% advance payment.\n\n**Tech & Design**\n- Platform: Lovable + Supabase\n- Key Feature: 4-step booking flow, verified worker rating system\n\n**Business Impact**\nAn established company (since 1985) was transformed into a fully digital marketplace, where real workers are active on the platform with their actual ratings and experience.",
  },
  {
    slug: "ruposhee",
    title: "Ruposhee",
    oneLiner: "Bengali women's fashion & skincare full ecommerce platform.",
    serviceCategory: "web-development",
    subType: "ecommerce",
    techStack: ["React", "Next.js", "TypeScript", "Supabase", "Lovable"],
    isRealClient: true,
    timeline: "3 weeks",
    role: DEFAULT_ROLE,
    liveUrl: "https://ruposhee.com",
    rating: 5,
    views: 1320,
    challenge:
      "The client's previous site was slow, broke on mobile, and lost customers at checkout.",
    solution:
      "A full custom ecommerce build with Lovable — fast loading, mobile-first design, and a seamless bKash checkout. Key sections: Hero (seasonal campaign banner), Product Catalog (category filter, search, quick view), Cart & Checkout (bKash/card payment), Order Tracking (real-time status), Admin Panel (product/order/customer management).",
    results: [
      "50+ orders within 3 weeks of launch",
      "80% lower bounce rate",
      "Increase in customer repeat purchases",
    ],
    aboutNarrative:
      "Ruposhee is a full ecommerce platform built for a Bengali women's fashion and skincare brand. The previous site was slow and broke on mobile, losing customers at checkout — so an entirely new, fast-loading, mobile-first ecommerce site was built from scratch.\n\n**Tech & Design**\n- Platform: Lovable (AI-built) + Supabase\n- Color Scheme: Deep rose + cream — a feminine, premium feel\n- Typography: Mixed Bangla + English headings\n\n**Business Impact**\nWithin 3 weeks of launch, the site generated 50+ orders and cut the bounce rate by 80% — proof that mobile-first, fast-loading design has a direct impact on conversion.",
  },
  {
    slug: "mango-bazar",
    title: "Mango Bazar",
    oneLiner:
      "Full-featured mango ecommerce platform — multi-variant products, fraud checker, analytics.",
    serviceCategory: "web-development",
    subType: "ecommerce",
    techStack: ["Lovable", "Supabase"],
    isRealClient: true,
    timeline: "Seasonal ecommerce build",
    role: DEFAULT_ROLE,
    rating: 5,
    views: 760,
    challenge:
      "A mango-selling ecommerce business needed a complete, production-grade online store — covering everything from category-wise browsing to order tracking, admin management, and fraud prevention.",
    solution:
      "A full ecommerce platform with category-wise carousels (Himsagar, Haribhanga, Langra, Amrapali, Gopalbhog, Fazli), multi-variant product management, a complete checkout flow (including incomplete-order tracking), a customer dashboard, order tracking with a status stepper, and a full admin panel (products, categories, orders, fraud checker, block list, analytics, SEO settings).",
    results: [
      "Complete end-to-end customer journey (Homepage → Category → Product → Cart → Checkout → Order Success)",
      "Fraud risk scoring system (Low/Medium/High) in the admin panel",
      "Incomplete/abandoned checkout tracking with automated WhatsApp follow-up",
      "Automatic WebP image compression for fast mobile loading",
      "Full analytics dashboard with date-range filtering",
    ],
    aboutNarrative:
      "Mango Bazar is a complete mango ecommerce platform — built to sell six different mango varieties (Himsagar, Haribhanga, Langra, Amrapali, Gopalbhog, Fazli). The platform includes a full customer-facing shopping experience and a deep admin panel — handling fraud checking, a block list, analytics, and SEO management end to end.\n\n**Key Features**\n- Multi-variant product management with automatic image compression\n- Incomplete order tracking with automated WhatsApp follow-up\n- Order tracking stepper for customers\n- Fraud risk scoring system for admins\n- Full sales analytics dashboard\n\n**Tech & Design**\n- Platform: Lovable + Supabase\n- Language: Mixed Hind Siliguri (Bengali) + Inter (English/numbers) typography",
  },
];

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => {
    const p = PROJECTS.find((x) => x.slug === params.slug);
    const title = p ? `${p.title} — Project · AnamDev` : "Project · AnamDev";
    const description = p?.oneLiner ?? "Project case study.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(p?.coverImage ? [{ property: "og:image", content: p.coverImage }] : []),
      ],
    };
  },
  loader: ({ params }): { project: ProjectDetail } => {
    const project = PROJECTS.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  component: ProjectDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-white">Project not found</h1>
        <Link
          to="/projects"
          className="mt-6 inline-flex text-[color:var(--primary)] hover:underline"
        >
          Back to Projects
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
});

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
      {children}
    </div>
  );
}

function StarRating({ value = 5 }: { value?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < value
              ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
              : "h-3.5 w-3.5 text-white/20"
          }
        />
      ))}
    </span>
  );
}

function CaseCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Clock;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--primary)]/12 text-[color:var(--primary)]">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <div className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

function renderNarrative(text: string) {
  // Renders simple markdown: bold (**text**), bullets, paragraphs.
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, pi) => {
    const lines = para.split("\n");
    const isList = lines.every((l) => l.trim().startsWith("- "));
    if (isList) {
      return (
        <ul key={pi} className="my-3 space-y-1.5 pl-5 text-muted-foreground">
          {lines.map((l, li) => (
            <li key={li} className="list-disc">
              {renderInline(l.replace(/^-\s*/, ""))}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={pi} className="mb-3 last:mb-0 leading-relaxed text-muted-foreground">
        {lines.map((l, li) => (
          <span key={li}>
            {renderInline(l)}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

function renderInline(s: string): React.ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function ProjectDetailPage() {
  const { project } = Route.useLoaderData();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const idx = PROJECTS.findIndex((p) => p.slug === project.slug);
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  const titleWords = project.title.split(" ");
  const firstWord = titleWords[0];
  const restWords = titleWords.slice(1).join(" ");

  const waLink = `https://wa.me/8801777768353?text=${encodeURIComponent(
    `Hi Anam, I'd love to discuss a project like "${project.title}".`,
  )}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative section-glow-hero">
          <div className="mx-auto max-w-4xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Projects
            </Link>

            {/* Tag row */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {project.subType && (
                <span className="inline-flex items-center rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-black">
                  {SUBTYPE_LABEL[project.subType]}
                </span>
              )}
              {project.statusBadge && (
                <span className="inline-flex items-center rounded-full border border-[color:var(--orange)]/40 bg-[color:var(--orange)]/15 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--orange)]">
                  {project.statusBadge}
                </span>
              )}
              {project.rating !== undefined && <StarRating value={project.rating} />}
              {project.views !== undefined && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  {project.views.toLocaleString()}
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              {project.timeline && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[color:var(--primary)]" />
                  {project.timeline}
                </span>
              )}
              {project.role && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[color:var(--primary)]" />
                  {project.role}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
              <span className="text-gradient-vo">{firstWord}</span>
              {restWords && <span> {restWords}</span>}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {project.oneLiner}
            </p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {project.techStack.map((t) => {
                const color = brandColor(t);
                return (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      color,
                      borderColor: `${color}55`,
                      backgroundColor: `${color}14`,
                    }}
                  >
                    <BrandIcon name={t} size={12} />
                    {t}
                  </span>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-all duration-200 hover:border-white/30 hover:bg-white/[0.06]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              )}
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full btn-gradient px-5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Me
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Cover */}
        <section className="py-6 sm:py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <button
              type="button"
              onClick={() => project.coverImage && setLightboxOpen(true)}
              className="group relative block w-full overflow-hidden rounded-xl border border-white/10 bg-[#0F1115] shadow-[0_24px_80px_-30px_rgba(59,130,246,0.35)] transition-all duration-200 hover:border-[color:var(--primary)]/40"
              aria-label="Open full size image"
            >
              <div className="relative aspect-[16/9] w-full">
                {project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[color:var(--primary)]/15 via-white/[0.03] to-[color:var(--orange)]/15">
                    <span className="px-6 text-center font-mono text-xs uppercase tracking-[0.22em] text-white/55">
                      {project.title}
                    </span>
                  </div>
                )}
              </div>
            </button>
            <p className="mt-3 text-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Click to view full size
            </p>
          </div>
        </section>

        {/* Case Study */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <Eyebrow>// CASE STUDY</Eyebrow>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              The <span className="text-gradient-vo">Full Picture</span>
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <CaseCard icon={Clock} title="Timeline">
                {project.timeline ?? "—"}
              </CaseCard>
              <CaseCard icon={Target} title="Challenge">
                {project.challenge}
              </CaseCard>
              <CaseCard icon={Zap} title="Solution">
                {project.solution}
              </CaseCard>
              <CaseCard icon={TrendingUp} title="Results">
                <ul className="space-y-1.5">
                  {project.results.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[color:var(--orange)]" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CaseCard>
            </div>
          </div>
        </section>

        {/* Process */}
        {project.processSteps && project.processSteps.length > 0 && (
          <section className="py-12 sm:py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <Eyebrow>// HOW I BUILT IT</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                Process — <span className="text-gradient-vo">Step by Step</span>
              </h2>
              <ol className="mt-8 space-y-5">
                {project.processSteps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-black">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* Client Says */}
        {project.isRealClient && project.testimonial && (
          <section className="py-12 sm:py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <Eyebrow>// CLIENT SAYS</Eyebrow>
              <figure className="card-elevated relative mt-6 p-8 sm:p-10">
                <Quote className="absolute -top-3 left-6 h-8 w-8 text-[color:var(--primary)]" />
                <blockquote className="text-lg leading-relaxed text-white sm:text-xl">
                  “{project.testimonial.quote}”
                </blockquote>
                <figcaption className="mt-5 text-sm text-muted-foreground">
                  <div className="font-semibold text-white">
                    {project.testimonial.name}
                  </div>
                  <div>{project.testimonial.role}</div>
                </figcaption>
              </figure>
            </div>
          </section>
        )}

        {/* About this project */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Eyebrow>// ABOUT THIS PROJECT</Eyebrow>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              About This <span className="text-gradient-vo">Project</span>
            </h2>
            <div className="mt-6 rounded-xl border border-white/8 bg-[#16181D] p-6 sm:p-8 border-l-4 border-l-[color:var(--orange)]">
              {renderNarrative(project.aboutNarrative)}
            </div>
          </div>
        </section>

        {/* Prev / Next */}
        <section className="py-10">
          <div className="mx-auto grid max-w-4xl gap-4 px-4 sm:grid-cols-2 sm:px-6">
            <Link
              to="/projects/$slug"
              params={{ slug: prev.slug }}
              className="card-elevated card-elevated-hover group flex flex-col p-5"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous Project
              </span>
              <span className="mt-2 text-base font-semibold text-white group-hover:text-[color:var(--primary)]">
                {prev.title}
              </span>
            </Link>
            <Link
              to="/projects/$slug"
              params={{ slug: next.slug }}
              className="card-elevated card-elevated-hover group flex flex-col p-5 sm:items-end sm:text-right"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
                Next Project
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="mt-2 text-base font-semibold text-white group-hover:text-[color:var(--primary)]">
                {next.title}
              </span>
            </Link>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative section-glow-cta py-20 sm:py-24">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <Eyebrow>// LET'S BUILD</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Want a Project <span className="text-gradient-vo">Like This</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Tell me your idea — I'll handle the rest.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full btn-gradient px-6 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Me
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-transparent px-6 text-sm font-semibold text-white transition-all duration-200 hover:border-white/30 hover:bg-white/[0.06]"
              >
                Contact Form
              </Link>
              <Link
                to="/projects"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-6 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-white/20 hover:text-white"
              >
                <ArrowUpRight className="h-4 w-4" />
                More Projects
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      {/* Lightbox */}
      {project.coverImage && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-6xl border-white/10 bg-[#0A0E1A] p-2 sm:p-4">
            <img
              src={project.coverImage}
              alt={project.title}
              className="h-auto w-full rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
