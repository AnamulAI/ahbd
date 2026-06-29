import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  TrendingUp,
  Clock,
  User,
  Quote,
  CreditCard,
  Sparkles,
  BarChart3,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { IconType } from "react-icons";
import {
  SiNextdotjs,
  SiTailwindcss,
  SiSupabase,
  SiVercel,
  SiReact,
  SiTypescript,
  SiOpenai,
  SiStripe,
  SiNodedotjs,
  SiPython,
  SiPostgresql,
  SiFigma,
  SiWordpress,
  SiShopify,
  SiNotion,
  SiZapier,
  SiAirtable,
  SiGoogleanalytics,
} from "react-icons/si";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CtaRevealCard } from "@/components/site/CtaRevealCard";
import {
  ProjectCard,
  ProjectCategoryBadge,
} from "@/components/site/ProjectCard";
import {
  CATEGORY_CTA,
  getAdjacentProjects,
  getProjectBySlug,
  getRelatedProjects,
  type Project,
} from "@/lib/projects-data";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = getProjectBySlug(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    if (!p) return { meta: [{ title: "Project Not Found — AnamDev" }] };
    return {
      meta: [
        { title: `${p.title} — AnamDev Projects` },
        { name: "description", content: p.shortDescription },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.shortDescription },
        { property: "og:type", content: "article" },
        { property: "og:image", content: p.coverImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: p.coverImage },
      ],
    };
  },
  notFoundComponent: NotFoundProject,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-3xl font-bold text-white">Something went wrong</h1>
        <p className="mt-4 text-muted-foreground">{String(error)}</p>
        <Link
          to="/projects"
          className="mt-8 inline-flex items-center gap-2 text-[color:var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  component: ProjectDetailPage,
});

function NotFoundProject() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--orange)]">
          // 404
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white">Project not found</h1>
        <p className="mt-4 text-muted-foreground">
          That project doesn't exist or has been moved.
        </p>
        <Link
          to="/projects"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/[0.04]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
      {children}
    </p>
  );
}

function gradientLastWord(text: string) {
  const trimmed = text.trim();
  const idx = trimmed.lastIndexOf(" ");
  if (idx === -1)
    return <span className="text-gradient-vo">{trimmed}</span>;
  return (
    <>
      {trimmed.slice(0, idx + 1)}
      <span className="text-gradient-vo">{trimmed.slice(idx + 1)}</span>
    </>
  );
}

function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: string;
}) {
  return (
    <>
      <Eyebrow>// {eyebrow}</Eyebrow>
      <h2 className="mt-3 text-balance text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
        {gradientLastWord(children)}
      </h2>
    </>
  );
}

function ChallengeSolution({
  eyebrow,
  heading,
  paragraphs,
}: {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
}) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow={eyebrow}>{heading}</SectionHeading>
        <div className="mt-6 space-y-5">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-base leading-[1.8] text-muted-foreground sm:text-[17px]"
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

const TECH_ICONS: Record<string, { Icon: IconType; color: string }> = {
  "next.js": { Icon: SiNextdotjs, color: "#FFFFFF" },
  nextjs: { Icon: SiNextdotjs, color: "#FFFFFF" },
  "tailwind css": { Icon: SiTailwindcss, color: "#38BDF8" },
  tailwind: { Icon: SiTailwindcss, color: "#38BDF8" },
  supabase: { Icon: SiSupabase, color: "#3ECF8E" },
  vercel: { Icon: SiVercel, color: "#FFFFFF" },
  react: { Icon: SiReact, color: "#61DAFB" },
  typescript: { Icon: SiTypescript, color: "#3178C6" },
  openai: { Icon: SiOpenai, color: "#FFFFFF" },
  "gpt-4": { Icon: SiOpenai, color: "#FFFFFF" },
  stripe: { Icon: SiStripe, color: "#635BFF" },
  "node.js": { Icon: SiNodedotjs, color: "#5FA04E" },
  nodejs: { Icon: SiNodedotjs, color: "#5FA04E" },
  python: { Icon: SiPython, color: "#3776AB" },
  postgresql: { Icon: SiPostgresql, color: "#4169E1" },
  postgres: { Icon: SiPostgresql, color: "#4169E1" },
  figma: { Icon: SiFigma, color: "#F24E1E" },
  wordpress: { Icon: SiWordpress, color: "#21759B" },
  shopify: { Icon: SiShopify, color: "#7AB55C" },
  notion: { Icon: SiNotion, color: "#FFFFFF" },
  zapier: { Icon: SiZapier, color: "#FF4F00" },
  airtable: { Icon: SiAirtable, color: "#FCB400" },
  "google analytics": { Icon: SiGoogleanalytics, color: "#E37400" },
};

function TechStack({ stack }: { stack: string[] }) {
  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--orange)]">
        // Tech Stack
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {stack.map((t) => {
          const match = TECH_ICONS[t.toLowerCase().trim()];
          return (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/85"
            >
              {match ? (
                <match.Icon
                  size={14}
                  color={match.color}
                  aria-hidden
                  className="shrink-0"
                />
              ) : (
                <CreditCard
                  className="h-3.5 w-3.5 shrink-0 text-[color:var(--primary)]"
                  aria-hidden
                />
              )}
              {t}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function pickResultIcon(value: string, label: string): LucideIcon {
  const v = value.toLowerCase();
  const l = label.toLowerCase();
  if (/^0\b/.test(v.trim()) || /\bzero\b|manual|eliminat|no more|reduc/.test(l))
    return Ban;
  if (v.includes("%") || /growth|sales|increase|conversion|revenue|roi|lift|uplift|engagement/.test(l))
    return TrendingUp;
  if (v.includes("/") || /hour|24\/7|time|always|round[- ]?the[- ]?clock|availab/.test(l))
    return Clock;
  if (/users|customers|subscribers|followers|leads|clients|audience|listeners/.test(l))
    return Users;
  if (/faster|speed|response|quick|instant/.test(l)) return Zap;
  if (/rank|metric|data|score/.test(l)) return BarChart3;
  return Sparkles;
}

function ResultsGrid({ results }: { results: Project["results"] }) {
  return (
    <section className="py-20 sm:py-28 bg-white/[0.02]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="THE RESULTS">The Results</SectionHeading>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {results.map((r, i) => {
            const Icon = pickResultIcon(r.value, r.label);
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/8 bg-[#16181D] p-7 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--primary)]/40 hover:bg-[#1C1F26] hover:shadow-[0_10px_30px_-12px_var(--vo-glow)] motion-reduce:hover:translate-y-0 sm:p-8"
              >
                <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/10">
                  <Icon
                    className="h-5 w-5 text-[color:var(--primary)]"
                    aria-hidden
                  />
                </div>
                <div className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                  <span className="text-gradient-vo">{r.value}</span>
                </div>
                <span
                  aria-hidden
                  className="mx-auto mt-3 block h-[2px] w-10 rounded-full bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--orange)]"
                />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {r.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [lead, ...rest] = images;
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="PROJECT GALLERY">A Closer Look</SectionHeading>
        </div>
        {lead && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/8 bg-white/5">
            <img
              src={lead}
              alt={`${alt} — image 1`}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover transition-transform duration-300 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
            />
          </div>
        )}
        {rest.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((src, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-white/8 bg-white/5"
              >
                <img
                  src={src}
                  alt={`${alt} — image ${i + 2}`}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-300 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function TestimonialCard({ t }: { t: Project["testimonial"] }) {
  return (
    <section className="py-20 sm:py-28 bg-white/[0.02]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <blockquote className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#16181D] p-8 pl-10 sm:p-10 sm:pl-14">
          <span
            aria-hidden
            className="absolute left-0 top-0 h-full w-[4px] bg-gradient-to-b from-[color:var(--primary)] to-[color:var(--orange)]"
          />
          <Quote
            aria-hidden
            className="pointer-events-none absolute right-6 top-6 h-20 w-20 text-[color:var(--primary)]/10 sm:h-24 sm:w-24"
          />
          <p className="relative font-display text-xl italic leading-snug text-white sm:text-2xl">
            "{t.quote}"
          </p>
          <footer className="relative mt-6 flex items-center gap-3 text-sm">
            <span
              aria-hidden
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-display text-[13px] font-bold text-white shadow-[0_4px_14px_-4px_var(--vo-glow)]"
            >
              {initialsOf(t.name)}
            </span>
            <span>
              <span className="font-semibold text-white">{t.name}</span>
              <span className="text-muted-foreground"> — {t.title}</span>
            </span>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

function ProcessTimeline({ steps }: { steps: Project["processSteps"] }) {
  if (!steps || steps.length === 0) return null;
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="HOW I BUILT IT">Process — Step by Step</SectionHeading>
        <ol className="relative mt-10 space-y-8 sm:space-y-10">
          {/* connecting vertical line */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-5 top-3 bottom-3 w-px bg-gradient-to-b from-[color:var(--primary)]/30 via-white/10 to-[color:var(--orange)]/30"
          />
          {steps.map((s, i) => (
            <li key={i} className="relative flex gap-5 sm:gap-6">
              <span
                aria-hidden
                className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-display text-sm font-bold text-white shadow-[0_4px_14px_-4px_var(--vo-glow)] ring-4 ring-background"
              >
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="font-display text-base font-bold text-white sm:text-lg">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {s.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PrevNextNav({
  prev,
  next,
}: {
  prev: Project;
  next: Project;
}) {
  return (
    <section className="pb-12 pt-4">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/projects/$slug"
            params={{ slug: prev.slug }}
            className="group rounded-2xl border border-white/8 bg-[#16181D] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--primary)]/40 hover:bg-[#1C1F26] hover:shadow-[0_10px_30px_-12px_var(--vo-glow)] motion-reduce:hover:translate-y-0 sm:p-6"
          >
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary)]">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Previous Project
            </span>
            <p className="mt-2 text-base font-semibold text-white transition-colors group-hover:text-[color:var(--primary)] sm:text-[17px]">
              {prev.title}
            </p>
          </Link>
          <Link
            to="/projects/$slug"
            params={{ slug: next.slug }}
            className="group rounded-2xl border border-white/8 bg-[#16181D] p-5 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--primary)]/40 hover:bg-[#1C1F26] hover:shadow-[0_10px_30px_-12px_var(--vo-glow)] motion-reduce:hover:translate-y-0 sm:p-6"
          >
            <span className="flex items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary)]">
              Next Project <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
            <p className="mt-2 text-base font-semibold text-white transition-colors group-hover:text-[color:var(--primary)] sm:text-[17px]">
              {next.title}
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectDetailPage() {
  const { project } = Route.useLoaderData() as { project: Project };
  const related = getRelatedProjects(project.slug);
  const adjacent = getAdjacentProjects(project.slug);
  const cta = CATEGORY_CTA[project.category];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative section-glow-hero pt-12 sm:pt-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[color:var(--primary)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Projects
            </Link>
            <div className="text-center">
              <div className="mt-6">
                <ProjectCategoryBadge category={project.category} />
              </div>
              <h1 className="mt-4 mx-auto max-w-4xl text-balance text-3xl font-bold leading-[1.15] text-white sm:text-4xl md:text-5xl">
                {gradientLastWord(project.title)}
              </h1>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-white/85">
                  {project.clientName}
                </span>
                <span aria-hidden>·</span>
                <span>{project.industry}</span>
              </div>
              {(project.duration || project.role) && (
                <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {project.duration && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[color:var(--primary)]/80" aria-hidden />
                      {project.duration}
                    </span>
                  )}
                  {project.duration && project.role && (
                    <span aria-hidden className="h-3 w-px bg-white/10" />
                  )}
                  {project.role && (
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[color:var(--primary)]/80" aria-hidden />
                      {project.role}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-white/8 bg-white/5">
              <img
                src={project.coverImage}
                alt={project.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>
        </section>

        <ChallengeSolution
          eyebrow="THE CHALLENGE"
          heading="The Challenge"
          paragraphs={project.challenge}
        />

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionHeading eyebrow="THE SOLUTION">The Solution</SectionHeading>
            <div className="mt-6 space-y-5">
              {project.solution.map((p, i) => (
                <p
                  key={i}
                  className="text-base leading-[1.8] text-muted-foreground sm:text-[17px]"
                >
                  {p}
                </p>
              ))}
            </div>
            <TechStack stack={project.techStack} />
          </div>
        </section>

        <ProcessTimeline steps={project.processSteps} />

        <ResultsGrid results={project.results} />

        <Gallery images={project.galleryImages} alt={project.title} />

        <TestimonialCard t={project.testimonial} />

        {adjacent && <PrevNextNav prev={adjacent.prev} next={adjacent.next} />}

        {/* Related projects */}
        {related.length > 0 && (
          <section className="pb-20 pt-4">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Related Projects
                </h2>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1 text-sm text-[color:var(--primary)]"
                >
                  All projects <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
              <div className="grid gap-6 max-md:place-items-center sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <div key={p.slug} className="w-full max-w-sm sm:max-w-none">
                    <ProjectCard project={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Closing CTA */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <CtaRevealCard>
              <div className="flex flex-col items-center text-center">
                <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                  Ready to Build{" "}
                  <span className="text-gradient-vo">Something Like This?</span>
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {cta.subheadline}
                </p>
                <div className="mt-8">
                  <Link
                    to={cta.href}
                    className="btn-primary-dark group"
                  >
                    {cta.ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden />
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
