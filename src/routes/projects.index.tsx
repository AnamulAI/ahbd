import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, FolderSearch, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BrandIcon, brandColor } from "@/components/site/BrandIcon";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — AnamDev | Web, AI & Podcast Work" },
      {
        name: "description",
        content:
          "Selected projects across Web Development, AI Integrator, and AI Podcast — built to make businesses look more professional and more trustworthy.",
      },
      { property: "og:title", content: "Projects — AnamDev" },
      {
        property: "og:description",
        content:
          "Browse selected client work and self-initiated builds across web development, AI integration, and AI podcasting.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsIndexPage,
});

type ServiceCategory = "web-development" | "ai-integrator" | "ai-podcast";
type SubType =
  | "landing-page"
  | "business-site"
  | "web-app"
  | "ecommerce"
  | "dashboard";

interface Project {
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
}

// TODO: migrate to Supabase CMS — static seed data for now.
const PROJECTS: Project[] = [
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
    liveUrl: "https://ruposhee.com",
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
  },
];

const SERVICE_FILTERS: { id: "all" | ServiceCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web-development", label: "Web Development" },
  { id: "ai-integrator", label: "AI Integrator" },
  { id: "ai-podcast", label: "AI Podcast" },
];

const SUBTYPE_FILTERS: { id: "all" | SubType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "landing-page", label: "Landing Page" },
  { id: "business-site", label: "Business Site" },
  { id: "web-app", label: "Web App" },
  { id: "ecommerce", label: "eCommerce" },
  { id: "dashboard", label: "Dashboard" },
];

const SUBTYPE_LABEL: Record<SubType, string> = {
  "landing-page": "Landing Page",
  "business-site": "Business Site",
  "web-app": "Web App",
  ecommerce: "eCommerce",
  dashboard: "Dashboard",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
      {children}
    </div>
  );
}

function ServicePill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex h-10 items-center rounded-full bg-[color:var(--primary)] px-5 text-sm font-semibold text-white transition-all duration-200"
          : "inline-flex h-10 items-center rounded-full border border-white/10 bg-[#16181D] px-5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
      }
    >
      {children}
    </button>
  );
}

function SubPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex h-8 items-center rounded-full bg-[color:var(--primary)] px-3.5 text-xs font-semibold text-white transition-all duration-200"
          : "inline-flex h-8 items-center rounded-full border border-white/10 bg-[#0F1115] px-3.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-white/20 hover:text-white"
      }
    >
      {children}
    </button>
  );
}

function PlaceholderCover({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[color:var(--primary)]/20 via-white/[0.03] to-[color:var(--orange)]/20">
      <span className="px-6 text-center font-mono text-xs uppercase tracking-[0.22em] text-white/55">
        {title}
      </span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const visibleTech = project.techStack.slice(0, 3);
  const extra = project.techStack.length - visibleTech.length;

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group card-elevated card-elevated-hover relative flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <PlaceholderCover title={project.title} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

        {project.subType && (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full border border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--primary)] backdrop-blur-sm">
            {SUBTYPE_LABEL[project.subType]}
          </span>
        )}

        {project.statusBadge ? (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center rounded-full border border-[color:var(--orange)]/40 bg-[color:var(--orange)]/15 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--orange)] backdrop-blur-sm">
            {project.statusBadge}
          </span>
        ) : (
          <span className="absolute right-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors group-hover:border-[color:var(--primary)]/60 group-hover:text-[color:var(--primary)]">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-white">{project.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {project.oneLiner}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visibleTech.map((t) => {
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
          {extra > 0 && (
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              +{extra}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProjectsIndexPage() {
  const [service, setService] = useState<"all" | ServiceCategory>("all");
  const [subType, setSubType] = useState<"all" | SubType>("all");

  const showSubFilter = service === "all" || service === "web-development";

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (service !== "all" && p.serviceCategory !== service) return false;
      if (showSubFilter && subType !== "all") {
        if (p.serviceCategory !== "web-development") return false;
        if (p.subType !== subType) return false;
      }
      return true;
    });
  }, [service, subType, showSubFilter]);

  const waLink = `https://wa.me/8801777768353?text=${encodeURIComponent(
    "Hi Anam, I'd love to discuss a project idea with you.",
  )}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative section-glow-hero">
          <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <Eyebrow>// SELECTED WORK</Eyebrow>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
              Projects That <span className="text-gradient-vo">Build Trust</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Web Development, AI Integrator, and AI Podcast — every project
              built to make a business look more professional and more
              trustworthy.
            </p>
          </div>
        </section>

        {/* Sticky filter bar */}
        <div className="sticky top-16 z-30 border-y border-white/8 bg-background/85 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              {SERVICE_FILTERS.map((f) => (
                <ServicePill
                  key={f.id}
                  active={service === f.id}
                  onClick={() => {
                    setService(f.id);
                    setSubType("all");
                  }}
                >
                  {f.label}
                </ServicePill>
              ))}
            </div>
            {showSubFilter && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {SUBTYPE_FILTERS.map((f) => (
                  <SubPill
                    key={f.id}
                    active={subType === f.id}
                    onClick={() => setSubType(f.id)}
                  >
                    {f.label}
                  </SubPill>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {filtered.length === 0 ? (
              <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-white/8 bg-[#16181D] p-10 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--primary)]/12 text-[color:var(--primary)]">
                  <FolderSearch className="h-6 w-6" />
                </span>
                <p className="text-base text-muted-foreground">
                  No projects in this category yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <ProjectCard key={p.slug} project={p} />
                ))}
              </div>
            )}
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
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
