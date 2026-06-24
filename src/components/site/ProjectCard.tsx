import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CATEGORY_STYLES } from "@/lib/blog-data";
import type { Project, ProjectCategory } from "@/lib/projects-data";

export function ProjectCategoryBadge({
  category,
}: {
  category: ProjectCategory;
}) {
  const s = CATEGORY_STYLES[category];
  return (
    <span
      className={[
        "inline-flex items-center self-start rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        s.badgeClass,
      ].join(" ")}
    >
      {s.label}
    </span>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#16181D] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--primary)]/40 hover:bg-[#1C1F26] hover:shadow-[0_18px_50px_-24px_var(--vo-glow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
        <img
          src={project.coverImage}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <ProjectCategoryBadge category={project.category} />
        <h3 className="font-display text-lg font-bold leading-snug text-white">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {project.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
          <span className="truncate">{project.clientName}</span>
          <span className="inline-flex items-center gap-1 text-[color:var(--primary)] transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
            View Project <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
