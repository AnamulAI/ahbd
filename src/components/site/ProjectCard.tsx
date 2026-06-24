import { Link } from "@tanstack/react-router";
import { ArrowRight, Eye, ExternalLink, Star } from "lucide-react";
import { CATEGORY_STYLES } from "@/lib/blog-data";
import type { Project, ProjectCategory } from "@/lib/projects-data";
import { TechTag } from "@/lib/tech-icons";

export function ProjectCategoryBadge({
  category,
  className,
}: {
  category: ProjectCategory;
  className?: string;
}) {
  const s = CATEGORY_STYLES[category];
  return (
    <span
      className={[
        "inline-flex items-center self-start rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur-sm",
        s.badgeClass,
        className ?? "",
      ].join(" ")}
    >
      {s.label}
    </span>
  );
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// TODO: placeholder rating/view data — replace with real analytics before public launch per Honesty Rule
function StatOverlay({ rating, viewCount }: { rating?: number; viewCount?: number }) {
  if (rating == null && viewCount == null) return null;
  return (
    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-sm">
      {rating != null && (
        <span className="inline-flex items-center gap-1">
          <Star
            className="h-3 w-3 shrink-0 text-[color:var(--orange)]"
            fill="currentColor"
            aria-hidden
          />
          <span className="tabular-nums">{rating.toFixed(1)}</span>
        </span>
      )}
      {rating != null && viewCount != null && (
        <span aria-hidden className="text-white/25">
          •
        </span>
      )}
      {viewCount != null && (
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3 shrink-0 text-[color:var(--primary)]" aria-hidden />
          <span className="tabular-nums">{formatViews(viewCount)}</span>
        </span>
      )}
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const tags = project.techStack.slice(0, 3);
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      aria-label={`View case study: ${project.title}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#16181D] transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--primary)]/50 hover:bg-[#1C1F26] hover:shadow-[0_22px_60px_-22px_var(--vo-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-white/5">
        <img
          src={project.coverImage}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {/* scrim for badge legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/65 via-black/30 to-transparent" />
        <div className="absolute left-3 top-3">
          <ProjectCategoryBadge category={project.category} />
        </div>
        <StatOverlay rating={project.rating} viewCount={project.viewCount} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold leading-snug text-white">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {project.shortDescription}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <TechTag key={t} name={t} compact />
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs">
          <a
            href={project.liveDemoUrl}
            onClick={(e) => {
              e.stopPropagation();
              if (!project.liveDemoUrl || project.liveDemoUrl === "#") {
                e.preventDefault();
              }
            }}
            className={[
              "inline-flex items-center gap-1",
              project.liveDemoUrl && project.liveDemoUrl !== "#"
                ? "font-medium text-[color:var(--orange)] hover:underline"
                : "cursor-default text-muted-foreground opacity-60",
            ].join(" ")}
          >
            <ExternalLink className="h-3 w-3" aria-hidden />
            Live Demo
          </a>
          <span className="inline-flex items-center gap-1 font-medium text-[color:var(--primary)]">
            View Project{" "}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
