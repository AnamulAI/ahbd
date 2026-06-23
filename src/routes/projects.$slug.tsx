import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Project · AnamDev` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProjectDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-white">Project not found</h1>
        <Link to="/projects" className="mt-6 inline-flex text-[color:var(--primary)] hover:underline">
          Back to Projects
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
});

function ProjectDetailPage() {
  const { slug } = Route.useParams();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-white sm:text-5xl">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Full case study coming soon.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
