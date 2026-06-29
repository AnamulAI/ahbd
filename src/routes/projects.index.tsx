import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Bot, Code2, LayoutGrid, Mic2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CtaRevealCard } from "@/components/site/CtaRevealCard";
import { RevealBorder } from "@/components/site/RevealBorder";
import { ProjectCard, ProjectCategoryBadge } from "@/components/site/ProjectCard";
import {
  FEATURED_PROJECT_SLUG,
  getAllProjects,
  getProjectBySlug,
  PROJECT_FILTERS,
  type ProjectCategory,
} from "@/lib/projects-data";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — AnamDev | Selected Work" },
      {
        name: "description",
        content:
          "Selected web development, AI integration, and AI podcast projects by Mohammad Anamul Hoque (AnamDev) — real builds, real results.",
      },
      { property: "og:title", content: "Projects — AnamDev" },
      {
        property: "og:description",
        content:
          "A look at what I've built across web development, AI integration, and podcast production.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsIndexPage,
});

type Filter = "All" | ProjectCategory;

const FILTER_ICONS: Record<Filter, React.ComponentType<{ className?: string }>> = {
  All: LayoutGrid,
  "Web Development": Code2,
  "AI Integrator": Bot,
  "AI Podcast": Mic2,
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
      {children}
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 sm:px-7">
      <div className="font-display text-xl font-bold text-white sm:text-3xl">
        {value}
      </div>
      <div className="text-center font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px] sm:tracking-[0.18em]">
        {label}
      </div>
    </div>

  );
}

function FeaturedSpotlight() {
  const project = getProjectBySlug(FEATURED_PROJECT_SLUG);
  if (!project) return null;
  return (
    <section className="pt-4 sm:pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="group/reveal relative">
          <RevealBorder rounded="rounded-3xl" radius={24} />
          <Link
            to="/projects/$slug"
            params={{ slug: project.slug }}
            aria-label={`Featured project: ${project.title}`}
            className="group relative grid overflow-hidden rounded-3xl bg-[#16181D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] md:grid-cols-2"
          >
            {/* Image */}
          <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:h-full">
            <img
              src={project.coverImage}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#16181D]/40" />
          </div>

          {/* Content */}
          <div className="relative flex flex-col gap-5 p-6 sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, var(--primary) 0%, var(--orange) 100%)",
                }}
              >
                Featured Project
              </span>
              <ProjectCategoryBadge category={project.category} />
            </div>

            <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-[2rem]">
              {project.title}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              {project.shortDescription}
            </p>

            <div className="mt-2 flex items-center justify-center gap-3 ">
              <div className="text-gradient-vo font-display text-5xl font-bold leading-none sm:text-6xl">
                58%
              </div>
              <div className="max-w-[14rem] text-xs leading-snug text-muted-foreground">
                of total sales now online within 90 days
              </div>
            </div>

            <div className="mt-2 flex justify-center ">
              <span className="inline-flex items-center gap-2 rounded-full btn-gradient min-h-9 text-center px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_var(--vo-glow)] transition-all duration-200 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                View Case Study{" "}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  aria-hidden
                />
              </span>
            </div>
          </div>
        </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectsIndexPage() {
  const projects = getAllProjects();
  const [filter, setFilter] = useState<Filter>("All");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      All: projects.length,
      "Web Development": 0,
      "AI Integrator": 0,
      "AI Podcast": 0,
    };
    for (const p of projects) c[p.category]++;
    return c;
  }, [projects]);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((p) => p.category === filter),
    [projects, filter],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative section-glow-hero">
          <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <Eyebrow>// SELECTED WORK</Eyebrow>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
              Real Projects,{" "}
              <span className="text-gradient-vo">Real Results</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A look at what I've built across web development, AI integration,
              and podcast production.
            </p>

            {/* Stats strip */}
            <div className="mx-auto mt-9 flex max-w-3xl items-center justify-center divide-x divide-white/10">
              <StatItem value="12" label="Projects Delivered" />
              <StatItem value="3" label="Service Lines" />
              <StatItem value="100%" label="Client Satisfaction" />
            </div>
          </div>
        </section>

        {/* Featured spotlight */}
        <FeaturedSpotlight />

        {/* Filter tabs */}
        <section className="pt-10 sm:pt-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto -mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-auto sm:overflow-visible sm:px-0 sm:w-fit">
            <div
              role="tablist"
              aria-label="Filter projects by category"
              className="mx-auto inline-flex w-max items-center gap-1.5 rounded-full border border-white/8 bg-[#16181D] p-1.5 sm:flex sm:w-fit sm:flex-wrap sm:justify-center"
            >
              {PROJECT_FILTERS.map((f) => {
                const active = filter === f;
                const Icon = FILTER_ICONS[f];
                return (
                  <button
                    key={f}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(f)}
                    className={[
                      "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm transition-all duration-200 motion-reduce:transition-none whitespace-nowrap",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]",
                      active
                        ? "border border-[color:var(--primary)]/60 bg-[color:var(--primary)]/15 font-semibold text-white shadow-[0_0_20px_-6px_var(--primary)]"
                        : "border border-transparent font-medium text-muted-foreground hover:bg-white/[0.04] hover:text-white",
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "h-4 w-4 shrink-0",
                        active ? "text-white" : "text-[color:var(--primary)]",
                      ].join(" ")}
                    />
                    <span>{f}</span>
                    <span
                      className={[
                        "font-mono text-[11px]",
                        active ? "text-white/80" : "text-muted-foreground/70",
                      ].join(" ")}
                    >
                      ({counts[f]})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  No projects in this category yet — more coming soon.
                </p>
              </div>
            ) : (
              <div
                key={filter}
                className="grid animate-in fade-in zoom-in-95 gap-6 duration-300 max-md:place-items-center sm:gap-7 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
              >
                {filtered.map((p) => (
                  <div key={p.slug} className="w-full max-w-sm md:max-w-none">
                    <ProjectCard project={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <CtaRevealCard>
              <div className="flex flex-col items-center text-center">
                <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                  Have a Similar{" "}
                  <span className="text-gradient-vo">Project</span>?
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Let's talk about what you're building.
                </p>
                <div className="mt-8">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-2 rounded-full btn-gradient min-h-9 text-center px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_18px_50px_-12px_var(--vo-glow)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
                  >
                    Discuss Your Project{" "}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      aria-hidden
                    />
                  </Link>
                </div>
              </div>
            </CtaRevealCard>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
