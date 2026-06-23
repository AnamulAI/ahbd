import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  FolderOpen,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  PROJECTS,
  WA_LINK,
  type Project,
  type ServiceCategory,
  type WebSubType,
} from "@/lib/projects-data";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — AnamDev | Selected Web, AI & Podcast Work" },
      {
        name: "description",
        content:
          "Browse selected projects by Mohammad Anamul Hoque (AnamDev) — web development, AI integration, and AI podcast production work.",
      },
      { property: "og:title", content: "Projects — AnamDev" },
      {
        property: "og:description",
        content:
          "Selected web development, AI integration, and AI podcast projects — built for businesses that want to look professional and trustworthy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
      {children}
    </div>
  );
}

type CategoryFilter = "all" | ServiceCategory;
type SubTypeFilter = "all" | WebSubType;

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "web-development", label: "Web Development" },
  { value: "ai-integrator", label: "AI Integrator" },
  { value: "ai-podcast", label: "AI Podcast" },
];

const SUBTYPE_OPTIONS: { value: SubTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "landing-page", label: "Landing Page" },
  { value: "business-site", label: "Business Site" },
  { value: "web-app", label: "Web App" },
  { value: "ecommerce", label: "eCommerce" },
  { value: "dashboard", label: "Dashboard" },
];

const SUBTYPE_LABELS: Record<WebSubType, string> = {
  "landing-page": "Landing Page",
  "business-site": "Business Site",
  "web-app": "Web App",
  ecommerce: "eCommerce",
  dashboard: "Dashboard",
};

function CoverPlaceholder({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a2238] via-[#0F172A] to-[#0A0E1A] p-6 text-center">
      <span className="font-mono text-sm font-medium tracking-tight text-white/85 line-clamp-3">
        {title}
      </span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const visibleTech = project.techStack.slice(0, 3);
  const extraTech = project.techStack.length - visibleTech.length;
  const categoryLabel =
    project.subType != null
      ? SUBTYPE_LABELS[project.subType]
      : project.serviceCategory === "ai-integrator"
        ? "AI Integrator"
        : "AI Podcast";

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#16181D] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--primary)]/40 hover:bg-[#1C1F26] hover:shadow-[0_24px_60px_-30px_var(--vo-glow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <CoverPlaceholder title={project.title} />
        )}

        <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/90 backdrop-blur">
          {categoryLabel}
        </span>

        {project.statusBadge && (
          <span className="absolute right-3 top-3 inline-flex items-center rounded-full border border-[color:var(--orange)]/40 bg-[color:var(--orange)]/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--orange)] backdrop-blur">
            {project.statusBadge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-bold leading-snug text-white">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {project.oneLiner}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {visibleTech.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/75"
            >
              {tech}
            </span>
          ))}
          {extraTech > 0 && (
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/60">
              +{extraTech}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Pill({
  active,
  onClick,
  children,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "md" | "sm";
}) {
  const sizing =
    size === "md" ? "h-10 px-4 text-sm" : "h-8 px-3 text-xs";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex items-center justify-center rounded-full border transition-all duration-200 whitespace-nowrap motion-reduce:transition-none",
        sizing,
        active
          ? "border-[color:var(--primary)] bg-[color:var(--primary)] font-semibold text-white shadow-[0_8px_24px_-12px_var(--vo-glow)]"
          : "border-white/10 bg-transparent font-medium text-muted-foreground hover:border-white/20 hover:bg-white/[0.04] hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ProjectsPage() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [subType, setSubType] = useState<SubTypeFilter>("all");

  const showSubType = category === "all" || category === "web-development";

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (category !== "all" && p.serviceCategory !== category) return false;
      if (showSubType && subType !== "all") {
        if (p.serviceCategory !== "web-development") return false;
        if (p.subType !== subType) return false;
      }
      return true;
    });
  }, [category, subType, showSubType]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative section-glow-hero">
          <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <Eyebrow>// SELECTED WORK</Eyebrow>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl">
              প্রজেক্ট যা <span className="text-gradient-vo">বিশ্বাস</span>{" "}
              তৈরি করে
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Web Development, AI Integrator এবং AI Podcast — প্রতিটা প্রজেক্ট
              এমনভাবে বানানো যেটা business কে আরো professional এবং trustworthy
              দেখায়।
            </p>
          </div>
        </section>

        {/* Filter bar */}
        <div className="sticky top-16 z-30 border-y border-white/5 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <Pill
                  key={opt.value}
                  active={category === opt.value}
                  onClick={() => {
                    setCategory(opt.value);
                    if (opt.value !== "all" && opt.value !== "web-development") {
                      setSubType("all");
                    }
                  }}
                >
                  {opt.label}
                </Pill>
              ))}
            </div>

            {showSubType && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  // Type
                </span>
                {SUBTYPE_OPTIONS.map((opt) => (
                  <Pill
                    key={opt.value}
                    active={subType === opt.value}
                    onClick={() => setSubType(opt.value)}
                    size="sm"
                  >
                    {opt.label}
                  </Pill>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {filtered.length > 0 ? (
              <div className="grid gap-6 max-md:place-items-center sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <div key={p.slug} className="w-full max-w-sm sm:max-w-none">
                    <ProjectCard project={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-white/8 bg-[#16181D] px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[color:var(--primary)]">
                  <FolderOpen className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-base text-white/90">
                  এই category-তে এখনো কোনো project নেই
                </p>
                <p className="text-sm text-muted-foreground">
                  শীঘ্রই নতুন কাজ যোগ হবে — অন্য category দেখুন।
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative section-glow-cta py-20 sm:py-24">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <Eyebrow>// LET'S BUILD</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              এই রকম একটা <span className="text-gradient-vo">project</span>{" "}
              বানাতে চান?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              আপনার idea টা বলুন — বাকিটা আমি handle করি।
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full btn-gradient px-6 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp এ যোগাযোগ করুন
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                to="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-[#16181D] px-6 text-sm font-medium text-white/90 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.04] motion-reduce:transition-none"
              >
                <Sparkles className="h-4 w-4 text-[color:var(--primary)]" aria-hidden />
                Contact Form
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
