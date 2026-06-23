import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PROJECTS } from "@/lib/projects-data";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = PROJECTS.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.project.title} — Project | AnamDev`
          : "Project — AnamDev",
      },
      {
        name: "description",
        content: loaderData?.project.oneLiner ?? "Project detail.",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background p-10 text-white">
      <p>Something went wrong: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-white">Project not found</h1>
        <Link
          to="/projects"
          className="mt-6 inline-flex items-center gap-2 text-[color:var(--primary)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all projects
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { project } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> All Projects
        </Link>
        <div className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
          // {project.serviceCategory.replace("-", " ")}
        </div>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {project.oneLiner}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.techStack.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs text-white/80"
            >
              {t}
            </span>
          ))}
        </div>

        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-full btn-gradient px-5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            Visit Live Site <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        )}

        <p className="mt-12 rounded-2xl border border-white/8 bg-[#16181D] p-6 text-sm text-muted-foreground">
          Full case study coming soon.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
