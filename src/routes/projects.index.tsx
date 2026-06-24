import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProjectCard } from "@/components/site/ProjectCard";
import {
  getAllProjects,
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
      {children}
    </div>
  );
}

function ProjectsIndexPage() {
  const projects = getAllProjects();
  const [filter, setFilter] = useState<Filter>("All");

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
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
              Real Projects,{" "}
              <span className="text-gradient-vo">Real Results</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A look at what I've built across web development, AI integration,
              and podcast production.
            </p>
          </div>
        </section>

        {/* Filter tabs */}
        <section className="pt-2">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div
              role="tablist"
              aria-label="Filter projects by category"
              className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/8 bg-[#16181D] p-1.5 sm:inline-flex sm:w-auto"
            >
              {PROJECT_FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(f)}
                    className={[
                      "inline-flex h-9 items-center rounded-full px-4 text-sm transition-all duration-200 motion-reduce:transition-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]",
                      active
                        ? "border border-[color:var(--primary)]/60 bg-[color:var(--primary)]/15 font-semibold text-white shadow-[0_0_20px_-6px_var(--primary)]"
                        : "border border-transparent font-medium text-muted-foreground hover:bg-white/[0.04] hover:text-white",
                    ].join(" ")}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-12 sm:py-16">
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
                className="grid animate-in fade-in zoom-in-95 gap-6 duration-300 max-md:place-items-center sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((p) => (
                  <div key={p.slug} className="w-full max-w-sm sm:max-w-none">
                    <ProjectCard project={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative section-glow-cta">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
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
                className="inline-flex h-12 items-center gap-2 rounded-full btn-gradient px-7 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                Discuss Your Project <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
