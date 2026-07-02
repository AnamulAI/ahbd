import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
  Loader2,
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Shuffle,
  Repeat,
  Star,
  ExternalLink,
  Mic,
  ArrowDown,
  Cog,
  PackageCheck,
  XCircle,
  CheckCircle,
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
  SiSpotify,
  SiApplepodcasts,
  SiYoutube,
  SiInstagram,
  SiTiktok,
} from "react-icons/si";
import { FaLinkedin as SiLinkedin } from "react-icons/fa6";


import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CtaRevealCard } from "@/components/site/CtaRevealCard";
import { ProjectVideo } from "@/components/site/ProjectVideo";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { ClientLogoBadge } from "@/components/site/ClientLogoBadge";
import { getBrandChip } from "@/lib/tech-brand-colors";
import {
  ProjectCard,
  ProjectCategoryBadge,
} from "@/components/site/ProjectCard";
import {
  
  getAdjacentProjects,
  getProjectBySlug,
  getRelatedProjects,
  type Project,
  type ProjectCategory,
  type ProjectProcessStep,
  type ProjectResult,
} from "@/lib/projects-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projects/$slug")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — AnamDev Projects` },
      { property: "og:type", content: "article" },
    ],
  }),
  component: ProjectDetailRoute,
});

// ---------- DB types ----------
type DbProcessStep = { title?: string; description?: string };
type DbResultStat = { value?: string; label?: string };

type DbProject = {
  id: string;
  slug: string;
  title: string;
  main_category: string;
  sub_category_label: string | null;
  cover_image_url: string | null;
  gallery_image_urls: string[];
  description: string | null;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  challenge: string | null;
  solution: string | null;
  process_steps: unknown;
  result_stats: unknown;
  testimonial_quote: string | null;
  testimonial_name: string | null;
  testimonial_title: string | null;
  client_logo_url: string | null;
  // Podcast
  spotify_url: string | null;
  apple_podcasts_url: string | null;
  youtube_url: string | null;
  episode_title: string | null;
  episode_audio_url: string | null;
  episode_video_url: string | null;
  ig_reel_url: string | null;
  ig_reel_caption: string | null;
  tiktok_clip_url: string | null;
  tiktok_clip_caption: string | null;
  linkedin_clip_url: string | null;
  linkedin_clip_caption: string | null;
  // AI Integrator
  problem: string | null;
  integration_map: unknown;
  trigger_text: string | null;
  action_text: string | null;
  output_text: string | null;
};


const DB_TO_CATEGORY: Record<string, ProjectCategory> = {
  web_development: "Web Development",
  ai_integrator: "AI Integrator",
  ai_podcast: "AI Podcast",
};

function toParagraphs(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function coerceSteps(v: unknown): ProjectProcessStep[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => {
      const step = s as DbProcessStep;
      return {
        title: step?.title ?? "",
        description: step?.description ?? "",
      };
    })
    .filter((s) => s.title || s.description);
}
function coerceStats(v: unknown): ProjectResult[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => {
      const stat = s as DbResultStat;
      return {
        value: stat?.value ?? "",
        label: stat?.label ?? "",
      };
    })
    .filter((s) => s.value || s.label);
}

// ---------- Loader / router shell ----------
function ProjectDetailRoute() {
  const { slug } = Route.useParams();
  const [loading, setLoading] = React.useState(true);
  const [dbProject, setDbProject] = React.useState<DbProject | null>(null);
  const [relatedDb, setRelatedDb] = React.useState<DbProject[]>([]);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (!active) return;
      const proj = (data ?? null) as DbProject | null;
      setDbProject(proj);
      if (proj) {
        const { data: rel } = await supabase
          .from("projects")
          .select("*")
          .eq("main_category", proj.main_category)
          .neq("id", proj.id)
          .order("sort_order", { ascending: true })
          .limit(3);
        if (!active) return;
        setRelatedDb((rel ?? []) as DbProject[]);
      } else {
        setRelatedDb([]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  // 1) DB project takes precedence.
  if (dbProject) {
    if (dbProject.main_category === "web_development") {
      return (
        <WebDevDetail
          db={dbProject}
          related={relatedDb.filter((p) => p.main_category === "web_development")}
        />
      );
    }
    if (dbProject.main_category === "ai_podcast") {
      return (
        <PodcastDetail
          db={dbProject}
          related={relatedDb.filter((p) => p.main_category === "ai_podcast")}
        />
      );
    }
    // ai_integrator + anything else: Coming Soon
    return <ComingSoonDetail title={dbProject.title} />;
  }

  // 2) Fall back to static seeded projects.
  const staticProject = getProjectBySlug(slug);
  if (staticProject) {
    if (staticProject.category === "Web Development") {
      return <StaticProjectDetail project={staticProject} />;
    }
    return <ComingSoonDetail title={staticProject.title} />;
  }




  return <NotFoundProject />;
}

// ---------- Shared UI helpers ----------
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

function ComingSoonDetail({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--primary)]">
          // COMING SOON
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 text-muted-foreground">
          A full case study for this project is on the way. In the meantime,
          let's talk about what you're building.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/[0.04]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full btn-gradient min-h-9 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_var(--vo-glow)]"
          >
            Start a Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
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

function gradientWord(text: string, color: "blue" | "orange") {
  const cls =
    color === "blue"
      ? "text-[color:var(--primary)]"
      : "text-[color:var(--orange)]";
  return <span className={cls}>{text}</span>;
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

function TechChips({ stack }: { stack: string[] }) {
  if (!stack || stack.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {stack.map((t) => {
        const key = t.toLowerCase().trim();
        const match = TECH_ICONS[key];
        const brand = getBrandChip(t);
        const borderColor = brand?.color ?? "rgba(255,255,255,0.10)";
        const textColor = brand?.text ?? brand?.color ?? "rgba(255,255,255,0.85)";
        const bgColor = brand ? `${brand.color}14` : "rgba(255,255,255,0.04)";
        const style: React.CSSProperties = brand?.gradient
          ? {
              backgroundColor: bgColor,
              color: textColor,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "transparent",
              backgroundImage: `linear-gradient(${bgColor},${bgColor}), ${brand.gradient}`,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
            }
          : {
              backgroundColor: bgColor,
              color: textColor,
              borderColor,
            };
        return (
          <span
            key={t}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
            style={style}
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
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: brand?.color ?? "var(--primary)" }}
                aria-hidden
              />
            )}
            {t}
          </span>
        );
      })}
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

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function estimateReadMinutes(...parts: (string | null | undefined)[]): number {
  const text = parts.filter(Boolean).join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 220));
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------- Lightbox ----------
function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
  alt,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  alt: string;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <CloseIcon className="h-5 w-5" />
      </button>
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      <img
        src={images[index]}
        alt={`${alt} — image ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
      />
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 font-mono text-xs text-white/80">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}

// ---------- Web Development detail (DB-driven) ----------
function WebDevDetail({
  db,
  related,
}: {
  db: DbProject;
  related: DbProject[];
}) {
  const steps = coerceSteps(db.process_steps);
  const stats = coerceStats(db.result_stats);
  const gallery = db.gallery_image_urls ?? [];
  const [lead, ...rest] = gallery;
  const [lightbox, setLightbox] = React.useState<number | null>(null);
  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prevImg = () =>
    setLightbox((i) => (i == null ? i : (i - 1 + gallery.length) % gallery.length));
  const nextImg = () =>
    setLightbox((i) => (i == null ? i : (i + 1) % gallery.length));

  const readMin = estimateReadMinutes(
    db.challenge,
    db.solution,
    ...steps.map((s) => s.description),
    db.testimonial_quote,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Back nav + Hero */}
        <section className="relative section-glow-hero pt-8 sm:pt-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[color:var(--primary)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Projects
            </Link>

            <div className="mt-8 text-center">
              <ClientLogoBadge
                logoUrl={db.client_logo_url}
                clientName={db.testimonial_name}
              />
              {db.sub_category_label && (
                <Eyebrow>// {db.sub_category_label}</Eyebrow>
              )}
              <h1 className="mt-4 mx-auto max-w-4xl text-balance text-3xl font-bold leading-[1.15] text-white sm:text-4xl md:text-5xl">
                {db.title}
              </h1>

              {/* Author row */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-display text-xs font-bold text-white"
                >
                  MH
                </span>
                <span className="font-medium text-white/90">
                  Mohammad Anamul Hoque
                </span>
                <span aria-hidden className="text-white/25">·</span>
                <span className="text-muted-foreground">{fmtDate(db.created_at)}</span>
                <span aria-hidden className="text-white/25">·</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden /> {readMin} min read
                </span>
              </div>

              {db.tech_stack.length > 0 && (
                <div className="mt-5 flex justify-center">
                  <TechChips stack={db.tech_stack.slice(0, 6)} />
                </div>
              )}
            </div>

            {db.cover_image_url && (
              <div className="mt-10 overflow-hidden rounded-2xl border border-white/8 bg-white/5">
                <img
                  src={db.cover_image_url}
                  alt={db.title}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {/* The Challenge */}
        {db.challenge && (
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <Eyebrow>// THE CHALLENGE</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                The {gradientWord("Challenge", "blue")}
              </h2>
              <div className="mt-6 relative overflow-hidden rounded-2xl border border-white/8 bg-[#121A2E] p-6 sm:p-8">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-[3px] bg-[color:var(--primary)]"
                />
                <div className="space-y-5">
                  {toParagraphs(db.challenge).map((p, i) => (
                    <p
                      key={i}
                      className="text-base leading-[1.8] text-muted-foreground sm:text-[17px]"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* The Solution */}
        {db.solution && (
          <section className="py-16 sm:py-20 bg-white/[0.02]">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <Eyebrow>// THE SOLUTION</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                The {gradientWord("Solution", "orange")}
              </h2>
              <div className="mt-6 space-y-5">
                {toParagraphs(db.solution).map((p, i) => (
                  <p
                    key={i}
                    className="text-base leading-[1.8] text-muted-foreground sm:text-[17px]"
                  >
                    {p}
                  </p>
                ))}
              </div>
              {db.tech_stack.length > 0 && (
                <div className="mt-6">
                  <TechChips stack={db.tech_stack} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Process — Step by Step */}
        {steps.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <Eyebrow>// HOW WE DID IT</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                Process — Step by Step
              </h2>
              <ProcessTimeline steps={steps} />
            </div>
          </section>
        )}

        {/* Results */}
        {stats.length > 0 && (
          <section className="py-16 sm:py-20 bg-white/[0.02]">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                  The {gradientWord("Results", "orange")}
                </h2>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {stats.map((r, i) => {
                  const Icon = pickResultIcon(r.value, r.label);
                  const isBlue = i % 2 === 0;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#1E293B] bg-[#121A2E] p-7 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--primary)]/40 hover:shadow-[0_10px_30px_-12px_var(--vo-glow)] sm:p-8"
                    >
                      <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/10">
                        <Icon
                          className="h-5 w-5 text-[color:var(--primary)]"
                          aria-hidden
                        />
                      </div>
                      <div
                        className={[
                          "mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl",
                          isBlue ? "text-[color:var(--primary)]" : "text-white",
                        ].join(" ")}
                      >
                        {r.value}
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
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <Eyebrow>// PROJECT GALLERY</Eyebrow>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                  A Closer Look
                </h2>
              </div>
              {lead && (
                <button
                  type="button"
                  onClick={() => openLightbox(0)}
                  className="mt-8 block w-full overflow-hidden rounded-2xl border border-white/8 bg-white/5"
                >
                  <img
                    src={lead}
                    alt={`${db.title} — image 1`}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                </button>
              )}
              {rest.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {rest.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => openLightbox(i + 1)}
                      className="overflow-hidden rounded-2xl border border-white/8 bg-white/5"
                    >
                      <img
                        src={src}
                        alt={`${db.title} — image ${i + 2}`}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {lightbox != null && (
              <Lightbox
                images={gallery}
                index={lightbox}
                onClose={closeLightbox}
                onPrev={prevImg}
                onNext={nextImg}
                alt={db.title}
              />
            )}
          </section>
        )}

        {/* Testimonial */}
        {db.testimonial_quote && (
          <section className="py-16 sm:py-20 bg-white/[0.02]">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <blockquote className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#121A2E] p-8 pl-10 sm:p-10 sm:pl-14">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-[4px] bg-[color:var(--primary)]"
                />
                <Quote
                  aria-hidden
                  className="pointer-events-none absolute right-6 top-6 h-20 w-20 text-[color:var(--primary)]/10 sm:h-24 sm:w-24"
                />
                <p className="relative font-display text-xl italic leading-snug text-white sm:text-2xl">
                  "{db.testimonial_quote}"
                </p>
                {(db.testimonial_name || db.testimonial_title) && (
                  <footer className="relative mt-6 flex items-center gap-3 text-sm">
                    {db.testimonial_name && (
                      <span
                        aria-hidden
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-display text-[13px] font-bold text-white"
                      >
                        {initialsOf(db.testimonial_name)}
                      </span>
                    )}
                    <span>
                      {db.testimonial_name && (
                        <span className="font-semibold text-white">
                          {db.testimonial_name}
                        </span>
                      )}
                      {db.testimonial_title && (
                        <span className="text-muted-foreground">
                          {db.testimonial_name ? " — " : ""}
                          {db.testimonial_title}
                        </span>
                      )}
                    </span>
                  </footer>
                )}
              </blockquote>
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="pb-16 pt-4 sm:pb-20">
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
                  <div key={p.id} className="w-full max-w-sm sm:max-w-none">
                    <ProjectCard project={dbToProjectCard(p)} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <ClosingCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function dbToProjectCard(p: DbProject): Project {
  const category = DB_TO_CATEGORY[p.main_category] ?? "Web Development";
  return {
    slug: p.slug,
    title: p.title,
    category,
    clientName: "",
    industry: p.sub_category_label ?? "",
    coverImage:
      p.cover_image_url ||
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80",
    shortDescription: p.description ?? "",
    challenge: toParagraphs(p.challenge),
    solution: toParagraphs(p.solution),
    techStack: p.tech_stack ?? [],
    results: coerceStats(p.result_stats),
    galleryImages: p.gallery_image_urls ?? [],
    testimonial: {
      quote: p.testimonial_quote ?? "",
      name: p.testimonial_name ?? "",
      title: p.testimonial_title ?? "",
    },
    processSteps: coerceSteps(p.process_steps),
    liveDemoUrl: p.live_url ?? "#",
  };
}

function ClosingCTA() {
  return (
    <PremiumCta
      badgeIcon={Star}
      badgeText="LET'S BUILD IT"
      headingLine1="Have a Project"
      headingLine2="Worth Talking About?"
      subtext="Let's talk about what you're building — from idea to a site that actually converts."
      buttonLabel="Discuss Your Project"
      buttonHref="/contact"
    />
  );
}



// ---------- AI Podcast detail (DB-driven) ----------
function PodcastDetail({
  db,
  related,
}: {
  db: DbProject;
  related: DbProject[];
}) {
  const steps = coerceSteps(db.process_steps);
  const stats = coerceStats(db.result_stats);
  const gallery = db.gallery_image_urls ?? [];
  const [lead, ...rest] = gallery;
  const [lightbox, setLightbox] = React.useState<number | null>(null);
  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prevImg = () =>
    setLightbox((i) => (i == null ? i : (i - 1 + gallery.length) % gallery.length));
  const nextImg = () =>
    setLightbox((i) => (i == null ? i : (i + 1) % gallery.length));

  const readMin = estimateReadMinutes(
    db.challenge,
    db.solution,
    ...steps.map((s) => s.description),
    db.testimonial_quote,
  );

  const episodeTitle = (db.episode_title?.trim() || db.title).trim();
  const cover = db.cover_image_url ?? "";

  const clips = [
    {
      key: "instagram" as const,
      label: "Instagram Reel",
      url: db.ig_reel_url,
      caption: db.ig_reel_caption,
    },
    {
      key: "tiktok" as const,
      label: "TikTok",
      url: db.tiktok_clip_url,
      caption: db.tiktok_clip_caption,
    },
    {
      key: "linkedin" as const,
      label: "LinkedIn Clip",
      url: db.linkedin_clip_url,
      caption: db.linkedin_clip_caption,
    },
  ].filter((c) => !!c.url) as {
    key: "instagram" | "tiktok" | "linkedin";
    label: string;
    url: string;
    caption: string | null;
  }[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Back nav + Hero */}
        <section className="relative section-glow-hero pt-8 sm:pt-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[color:var(--primary)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Projects
            </Link>

            <div className="mt-8 text-center">
              <ClientLogoBadge
                logoUrl={db.client_logo_url}
                clientName={db.testimonial_name}
              />
              {db.sub_category_label && (
                <Eyebrow>// {db.sub_category_label}</Eyebrow>
              )}
              <h1 className="mt-4 mx-auto max-w-4xl text-balance text-3xl font-bold leading-[1.15] text-white sm:text-4xl md:text-5xl">
                {db.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-display text-xs font-bold text-white"
                >
                  MH
                </span>
                <span className="font-medium text-white/90">Mohammad Anamul Hoque</span>
                <span aria-hidden className="text-white/25">·</span>
                <span className="text-muted-foreground">{fmtDate(db.created_at)}</span>
                <span aria-hidden className="text-white/25">·</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden /> {readMin} min read
                </span>
              </div>
              {db.tech_stack.length > 0 && (
                <div className="mt-5 flex justify-center">
                  <TechChips stack={db.tech_stack.slice(0, 6)} />
                </div>
              )}
            </div>

            {cover && (
              <div className="mt-10 overflow-hidden rounded-2xl border border-white/8 bg-white/5">
                <img
                  src={cover}
                  alt={db.title}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {/* Challenge */}
        {db.challenge && (
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <Eyebrow>// THE CHALLENGE</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                The {gradientWord("Challenge", "blue")}
              </h2>
              <div className="mt-6 relative overflow-hidden rounded-2xl border border-white/8 bg-[#121A2E] p-6 sm:p-8">
                <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-[color:var(--primary)]" />
                <div className="space-y-5">
                  {toParagraphs(db.challenge).map((p, i) => (
                    <p key={i} className="text-base leading-[1.8] text-muted-foreground sm:text-[17px]">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Solution */}
        {db.solution && (
          <section className="py-16 sm:py-20 bg-white/[0.02]">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <Eyebrow>// THE SOLUTION</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                The {gradientWord("Solution", "orange")}
              </h2>
              <div className="mt-6 space-y-5">
                {toParagraphs(db.solution).map((p, i) => (
                  <p key={i} className="text-base leading-[1.8] text-muted-foreground sm:text-[17px]">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Process */}
        {steps.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <Eyebrow>// HOW WE DID IT</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                Process — Step by Step
              </h2>
              <ProcessTimeline steps={steps} />
            </div>
          </section>
        )}

        {/* Platform Mockups */}
        <PlatformMockups
          cover={cover}
          episodeTitle={episodeTitle}
          description={db.description}
          showName={db.testimonial_name || "The Founder's Mic"}
          channelAvatar={db.client_logo_url}
          audioUrl={db.episode_audio_url}
          videoUrl={db.episode_video_url}
          spotifyUrl={db.spotify_url}
          applePodcastsUrl={db.apple_podcasts_url}
          youtubeUrl={db.youtube_url}
        />


        {/* Video podcast */}
        {db.episode_video_url && (
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <Eyebrow>// VIDEO PODCAST</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                Your Episode, Also As a{" "}
                <span className="text-[color:var(--orange)]">Video</span>
              </h2>
              <div className="mt-8 overflow-hidden rounded-2xl border border-white/8 bg-black">
                <ProjectVideo url={db.episode_video_url} poster={cover} aspect="16/9" />
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Every episode can also be delivered as a publish-ready video.
              </p>
            </div>
          </section>
        )}

        {/* SMM Clips */}
        {clips.length > 0 && (
          <section className="py-16 sm:py-20 bg-white/[0.02]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <Eyebrow>// SOCIAL REPURPOSING</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                Clips Ready for{" "}
                <span className="text-gradient-vo">Every Platform</span>
              </h2>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clips.map((c) => (
                  <ClipPreview key={c.key} platform={c.key} label={c.label} url={c.url} caption={c.caption} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        {stats.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                  The {gradientWord("Results", "orange")}
                </h2>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {stats.map((r, i) => {
                  const Icon = pickResultIcon(r.value, r.label);
                  const isBlue = i % 2 === 0;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#1E293B] bg-[#121A2E] p-7 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--primary)]/40 hover:shadow-[0_10px_30px_-12px_var(--vo-glow)] sm:p-8"
                    >
                      <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/10">
                        <Icon className="h-5 w-5 text-[color:var(--primary)]" aria-hidden />
                      </div>
                      <div
                        className={[
                          "mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl",
                          isBlue ? "text-[color:var(--primary)]" : "text-white",
                        ].join(" ")}
                      >
                        {r.value}
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
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="py-16 sm:py-20 bg-white/[0.02]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <Eyebrow>// PROJECT GALLERY</Eyebrow>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                  A Closer Look
                </h2>
              </div>
              {lead && (
                <button
                  type="button"
                  onClick={() => openLightbox(0)}
                  className="mt-8 block w-full overflow-hidden rounded-2xl border border-white/8 bg-white/5"
                >
                  <img
                    src={lead}
                    alt={`${db.title} — image 1`}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                </button>
              )}
              {rest.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {rest.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => openLightbox(i + 1)}
                      className="overflow-hidden rounded-2xl border border-white/8 bg-white/5"
                    >
                      <img
                        src={src}
                        alt={`${db.title} — image ${i + 2}`}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {lightbox != null && (
              <Lightbox
                images={gallery}
                index={lightbox}
                onClose={closeLightbox}
                onPrev={prevImg}
                onNext={nextImg}
                alt={db.title}
              />
            )}
          </section>
        )}

        {/* Testimonial */}
        {db.testimonial_quote && (
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <blockquote className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#121A2E] p-8 pl-10 sm:p-10 sm:pl-14">
                <span aria-hidden className="absolute left-0 top-0 h-full w-[4px] bg-[color:var(--primary)]" />
                <Quote
                  aria-hidden
                  className="pointer-events-none absolute right-6 top-6 h-20 w-20 text-[color:var(--primary)]/10 sm:h-24 sm:w-24"
                />
                <p className="relative font-display text-xl italic leading-snug text-white sm:text-2xl">
                  "{db.testimonial_quote}"
                </p>
                {(db.testimonial_name || db.testimonial_title) && (
                  <footer className="relative mt-6 flex items-center gap-3 text-sm">
                    {db.testimonial_name && (
                      <span
                        aria-hidden
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-display text-[13px] font-bold text-white"
                      >
                        {initialsOf(db.testimonial_name)}
                      </span>
                    )}
                    <span>
                      {db.testimonial_name && (
                        <span className="font-semibold text-white">
                          {db.testimonial_name}
                        </span>
                      )}
                      {db.testimonial_title && (
                        <span className="text-muted-foreground">
                          {db.testimonial_name ? " — " : ""}
                          {db.testimonial_title}
                        </span>
                      )}
                    </span>
                  </footer>
                )}
              </blockquote>
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="pb-16 pt-4 sm:pb-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white sm:text-2xl">Related Projects</h2>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1 text-sm text-[color:var(--primary)]"
                >
                  All projects <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
              <div className="grid gap-6 max-md:place-items-center sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <div key={p.id} className="w-full max-w-sm sm:max-w-none">
                    <ProjectCard project={dbToProjectCard(p)} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <PodcastClosingCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function PodcastClosingCTA() {
  return (
    <PremiumCta
      badgeIcon={Star}
      badgeText="READY WHEN YOU ARE"
      headingLine1="Your Content Already Exists."
      headingLine2="Let's Turn It Into a Show."
      subtext="No microphone, no editing suite, no extra hours — just your existing content and AnamDev."
      buttonLabel="Discuss Your Podcast"
      buttonHref="/contact"
    />
  );
}

/**
 * Shared premium closing-CTA layout: pill badge, two-line heading (second
 * line uses the site's blue→orange gradient accent), muted subtext, and a
 * single gradient button. Wrapped in the same CtaRevealCard glow used
 * elsewhere on the site.
 */
function PremiumCta({
  badgeIcon: BadgeIcon,
  badgeText,
  headingLine1,
  headingLine2,
  subtext,
  buttonLabel,
  buttonHref,
}: {
  badgeIcon: LucideIcon;
  badgeText: string;
  headingLine1: string;
  headingLine2: string;
  subtext: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <CtaRevealCard>
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
              <BadgeIcon className="h-3.5 w-3.5 text-[color:var(--orange)]" aria-hidden />
              {badgeText}
            </span>
            <h2 className="mt-5 text-3xl font-bold leading-[1.12] text-white sm:text-4xl md:text-5xl">
              <span className="block">{headingLine1}</span>
              <span className="mt-1 block text-gradient-vo">{headingLine2}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {subtext}
            </p>
            <div className="mt-8">
              <Link
                to={buttonHref}
                className="inline-flex items-center gap-2 rounded-full btn-gradient h-11 px-5 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_var(--vo-glow)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                {buttonLabel} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </CtaRevealCard>
      </div>
    </section>
  );
}


function PlatformMockups({
  cover,
  episodeTitle,
  description,
  showName,
  channelAvatar,
  audioUrl,
  videoUrl,
  spotifyUrl,
  applePodcastsUrl,
  youtubeUrl,
}: {
  cover: string;
  episodeTitle: string;
  description: string | null;
  showName: string;
  channelAvatar: string | null;
  audioUrl: string | null;
  videoUrl: string | null;
  spotifyUrl: string | null;
  applePodcastsUrl: string | null;
  youtubeUrl: string | null;
}) {
  const showSpotify = !!(audioUrl || spotifyUrl);
  const showApple = !!(audioUrl || applePodcastsUrl);
  const showYouTube = !!(videoUrl || youtubeUrl);
  if (!showSpotify && !showApple && !showYouTube) return null;

  return (
    <section className="py-16 sm:py-20 bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>// PLATFORM PREVIEW</Eyebrow>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
            See Your Show, Live On The{" "}
            <span className="text-gradient-vo">Platforms You Choose</span>
          </h2>
        </div>
        <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showSpotify && (
            <SpotifyMockup
              cover={cover}
              title={episodeTitle}
              showName={showName}
              audioUrl={audioUrl}
              externalUrl={spotifyUrl}
            />
          )}
          {showApple && (
            <AppleMockup
              cover={cover}
              title={episodeTitle}
              description={description}
              showName={showName}
              audioUrl={audioUrl}
              externalUrl={applePodcastsUrl}
            />
          )}
          {showYouTube && (
            <YouTubeMockup
              cover={cover}
              title={episodeTitle}
              showName={showName}
              channelAvatar={channelAvatar}
              videoUrl={videoUrl}
              externalUrl={youtubeUrl}
            />
          )}
        </div>
      </div>
    </section>
  );
}


function ExternalIconLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
      aria-label="Open in new tab"
    >
      <ExternalLink className="h-4 w-4" aria-hidden />
    </a>
  );
}

function AudioPlayerButton({ audioUrl, colorClass }: { audioUrl: string | null; colorClass: string }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  if (!audioUrl) {
    return (
      <button
        type="button"
        disabled
        aria-label="No audio available"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/30"
      >
        <Play className="h-5 w-5" aria-hidden />
      </button>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={() => {
          const el = audioRef.current;
          if (!el) return;
          if (playing) el.pause();
          else el.play().catch(() => {});
        }}
        aria-label={playing ? "Pause episode" : "Play episode"}
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-105 ${colorClass}`}
      >
        {playing ? <Pause className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5 translate-x-[1px]" aria-hidden />}
      </button>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </>
  );
}

function SpotifyMockup({
  cover,
  title,
  showName,
  audioUrl,
  externalUrl,
}: {
  cover: string;
  title: string;
  showName: string;
  audioUrl: string | null;
  externalUrl: string | null;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#121212] p-5 text-white shadow-[0_10px_30px_-12px_rgba(30,215,96,0.25)]">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold">
          <SiSpotify size={20} color="#1ED760" aria-hidden />
          <span>Spotify</span>
        </div>
        {externalUrl && <ExternalIconLink href={externalUrl} />}
      </div>
      <div className="mt-4 overflow-hidden rounded-md bg-black">
        {cover ? (
          <img src={cover} alt="" className="aspect-square w-full object-cover" />
        ) : (
          <div className="aspect-square w-full bg-white/5" />
        )}
      </div>
      <div className="mt-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#1ED760]">Episode</div>
        <div className="mt-0.5 text-xs text-white/50">AnamDev · {showName}</div>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold text-white">{title}</h3>
      </div>
      {/* Scrubber */}
      <div className="mt-4">
        <div className="relative h-1 rounded-full bg-white/10" aria-hidden>
          <div className="absolute inset-y-0 left-0 w-[30%] rounded-full bg-[#1ED760]" />
          <div className="absolute -top-[3px] left-[30%] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-white" />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium tabular-nums text-white/60">
          <span>1:24</span>
          <span>4:12</span>
        </div>
      </div>
      <div className="mt-auto pt-4 flex items-center justify-center gap-4">
        <Shuffle className="h-4 w-4 text-white/50" aria-hidden />
        <AudioPlayerButton audioUrl={audioUrl} colorClass="bg-[#1ED760] text-black hover:bg-[#1ED760]" />
        <Repeat className="h-4 w-4 text-white/50" aria-hidden />
      </div>
    </div>
  );
}

function AppleMockup({
  cover,
  title,
  description,
  showName,
  audioUrl,
  externalUrl,
}: {
  cover: string;
  title: string;
  description: string | null;
  showName: string;
  audioUrl: string | null;
  externalUrl: string | null;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white p-5 text-neutral-900 shadow-[0_10px_30px_-12px_rgba(252,52,151,0.25)]">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold">
          <SiApplepodcasts size={20} color="#A855F7" aria-hidden />
          <span>Apple Podcasts</span>
        </div>
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
          Episode 12
        </span>
        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-3 w-3 fill-[#F97316] text-[#F97316]" aria-hidden />
          ))}
          <span className="ml-1 tabular-nums">4.8</span>
        </div>
      </div>
      <div className="mt-4 flex gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#FC3497]">Latest Episode</div>
            <button
              type="button"
              className="rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] font-semibold text-neutral-700"
              tabIndex={-1}
              aria-hidden
            >
              Subscribe
            </button>
          </div>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-neutral-900">{title}</h3>
        </div>
      </div>
      {description && description.trim() && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-neutral-500">
          {description}
        </p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <AudioPlayerButton
          audioUrl={audioUrl}
          colorClass="bg-gradient-to-br from-[#FC3497] to-[#A855F7]"
        />
        <div className="text-xs font-medium text-neutral-600">Tap to play</div>
      </div>
      {/* Show info row */}
      <div className="mt-auto pt-4 flex items-center gap-2 border-t border-neutral-100">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#FC3497]/15 to-[#A855F7]/15 text-[#A855F7]">
          <Mic className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Show</div>
          <div className="truncate text-xs font-semibold text-neutral-800">{showName}</div>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-400" aria-hidden />
      </div>
    </div>
  );
}

function YouTubeMockup({
  cover,
  title,
  showName,
  channelAvatar,
  videoUrl,
  externalUrl,
}: {
  cover: string;
  title: string;
  showName: string;
  channelAvatar: string | null;
  videoUrl: string | null;
  externalUrl: string | null;
}) {
  const [playing, setPlaying] = React.useState(false);
  const avatar = channelAvatar || cover;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0F0F0F] p-5 text-white shadow-[0_10px_30px_-12px_rgba(255,0,0,0.25)]">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold">
          <SiYoutube size={22} color="#FF0033" aria-hidden />
          <span>YouTube</span>
        </div>
        {externalUrl && <ExternalIconLink href={externalUrl} />}
      </div>
      <div className="relative mt-4 aspect-video overflow-hidden rounded-lg bg-black">
        {playing && videoUrl ? (
          <ProjectVideo url={videoUrl} aspect="16/9" autoPlay />
        ) : (
          <button
            type="button"
            onClick={() => videoUrl && setPlaying(true)}
            disabled={!videoUrl}
            className="group relative h-full w-full"
            aria-label="Play video"
          >
            {cover ? (
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-white/5" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/50">
              <span
                className={[
                  "inline-flex h-14 w-14 items-center justify-center rounded-full",
                  videoUrl ? "bg-[#FF0033]" : "bg-white/20",
                ].join(" ")}
              >
                <Play className="h-6 w-6 translate-x-[1px] text-white" aria-hidden />
              </span>
            </span>
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
              12:34
            </span>
          </button>
        )}
      </div>
      <h3 className="mt-4 line-clamp-2 text-sm font-semibold text-white">{title}</h3>
      <div className="mt-1 text-[11px] text-white/40">
        1.2K views · 2 days ago
      </div>
      {/* Channel info row */}
      <div className="mt-auto pt-4 flex items-center gap-3 border-t border-white/[0.06]">
        <span className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.06]">
          {avatar ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <Mic className="m-auto h-4 w-4 text-white/60" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-white/90">{showName}</div>
          <div className="text-[10px] text-white/45">2.1K subscribers</div>
        </div>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-black"
        >
          Subscribe
        </button>
      </div>
    </div>
  );
}


function ClipPreview({
  platform,
  label,
  url,
  caption,
}: {
  platform: "instagram" | "tiktok" | "linkedin";
  label: string;
  url: string;
  caption: string | null;
}) {
  const meta = {
    instagram: { Icon: SiInstagram, color: "#E4405F" },
    tiktok: { Icon: SiTiktok, color: "#69C9D0" },
    linkedin: { Icon: SiLinkedin, color: "#0A66C2" },
  }[platform];
  const Icon = meta.Icon;
  return (
    <div className="flex flex-col rounded-2xl border border-white/8 bg-[#121A2E] p-5">
      <div className="flex items-center gap-2">
        <Icon size={18} color={meta.color} aria-hidden />
        <span
          className="font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{ color: meta.color }}
        >
          {label}
        </span>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/8 bg-black">
        <ProjectVideo url={url} aspect="9/16" />
      </div>
      {caption && caption.trim() && (
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon size={14} color={meta.color} aria-hidden />
            <span className="text-[11px] font-medium text-white/60">Post preview</span>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white/85">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------- Legacy static Web Development detail (unchanged look) ----------

function StaticProjectDetail({ project }: { project: Project }) {
  const related = getRelatedProjects(project.slug);
  const adjacent = getAdjacentProjects(project.slug);
  

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
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
                {project.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-white/85">{project.clientName}</span>
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

        {/* Challenge */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Eyebrow>// THE CHALLENGE</Eyebrow>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
              The {gradientWord("Challenge", "blue")}
            </h2>
            <div className="mt-6 space-y-5">
              {project.challenge.map((p, i) => (
                <p key={i} className="text-base leading-[1.8] text-muted-foreground sm:text-[17px]">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="py-16 sm:py-20 bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Eyebrow>// THE SOLUTION</Eyebrow>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
              The {gradientWord("Solution", "orange")}
            </h2>
            <div className="mt-6 space-y-5">
              {project.solution.map((p, i) => (
                <p key={i} className="text-base leading-[1.8] text-muted-foreground sm:text-[17px]">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-6">
              <TechChips stack={project.techStack} />
            </div>
          </div>
        </section>

        {/* Process */}
        {project.processSteps && project.processSteps.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <Eyebrow>// HOW WE DID IT</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                Process — Step by Step
              </h2>
              <ProcessTimeline steps={project.processSteps} />
            </div>
          </section>
        )}

        {/* Results */}
        <section className="py-16 sm:py-20 bg-white/[0.02]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
              The {gradientWord("Results", "orange")}
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {project.results.map((r, i) => {
                const Icon = pickResultIcon(r.value, r.label);
                const isBlue = i % 2 === 0;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-[#1E293B] bg-[#121A2E] p-7 text-center sm:p-8"
                  >
                    <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/10">
                      <Icon className="h-5 w-5 text-[color:var(--primary)]" aria-hidden />
                    </div>
                    <div
                      className={[
                        "mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl",
                        isBlue ? "text-[color:var(--primary)]" : "text-white",
                      ].join(" ")}
                    >
                      {r.value}
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

        {/* Gallery */}
        <StaticGallery images={project.galleryImages} alt={project.title} />

        {/* Testimonial */}
        {project.testimonial.quote && (
          <section className="py-16 sm:py-20 bg-white/[0.02]">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <blockquote className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#121A2E] p-8 pl-10 sm:p-10 sm:pl-14">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-[4px] bg-[color:var(--primary)]"
                />
                <Quote
                  aria-hidden
                  className="pointer-events-none absolute right-6 top-6 h-20 w-20 text-[color:var(--primary)]/10 sm:h-24 sm:w-24"
                />
                <p className="relative font-display text-xl italic leading-snug text-white sm:text-2xl">
                  "{project.testimonial.quote}"
                </p>
                <footer className="relative mt-6 flex items-center gap-3 text-sm">
                  <span
                    aria-hidden
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-display text-[13px] font-bold text-white"
                  >
                    {initialsOf(project.testimonial.name)}
                  </span>
                  <span>
                    <span className="font-semibold text-white">
                      {project.testimonial.name}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}— {project.testimonial.title}
                    </span>
                  </span>
                </footer>
              </blockquote>
            </div>
          </section>
        )}

        {adjacent && (
          <section className="pb-12 pt-4">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  to="/projects/$slug"
                  params={{ slug: adjacent.prev.slug }}
                  className="group rounded-2xl border border-white/8 bg-[#16181D] p-5 hover:border-[color:var(--primary)]/40 sm:p-6"
                >
                  <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary)]">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Previous Project
                  </span>
                  <p className="mt-2 text-base font-semibold text-white sm:text-[17px]">
                    {adjacent.prev.title}
                  </p>
                </Link>
                <Link
                  to="/projects/$slug"
                  params={{ slug: adjacent.next.slug }}
                  className="group rounded-2xl border border-white/8 bg-[#16181D] p-5 text-right hover:border-[color:var(--primary)]/40 sm:p-6"
                >
                  <span className="flex items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary)]">
                    Next Project <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <p className="mt-2 text-base font-semibold text-white sm:text-[17px]">
                    {adjacent.next.title}
                  </p>
                </Link>
              </div>
            </div>
          </section>
        )}

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

        <PremiumCta
          badgeIcon={Star}
          badgeText="LET'S BUILD IT"
          headingLine1="Have a Project"
          headingLine2="Worth Talking About?"
          subtext="Let's talk about what you're building — from idea to a site that actually converts."
          buttonLabel="Discuss Your Project"
          buttonHref="/contact"
        />

      </main>
      <SiteFooter />
    </div>
  );
}

function StaticGallery({ images, alt }: { images: string[]; alt: string }) {
  const [lightbox, setLightbox] = React.useState<number | null>(null);
  if (!images || images.length === 0) return null;
  const [lead, ...rest] = images;
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>// PROJECT GALLERY</Eyebrow>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
            A Closer Look
          </h2>
        </div>
        {lead && (
          <button
            type="button"
            onClick={() => setLightbox(0)}
            className="mt-8 block w-full overflow-hidden rounded-2xl border border-white/8 bg-white/5"
          >
            <img
              src={lead}
              alt={`${alt} — image 1`}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
            />
          </button>
        )}
        {rest.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {rest.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(i + 1)}
                className="overflow-hidden rounded-2xl border border-white/8 bg-white/5"
              >
                <img
                  src={src}
                  alt={`${alt} — image ${i + 2}`}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      {lightbox != null && (
        <Lightbox
          images={images}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox((i) =>
              i == null ? i : (i - 1 + images.length) % images.length,
            )
          }
          onNext={() =>
            setLightbox((i) => (i == null ? i : (i + 1) % images.length))
          }
          alt={alt}
        />
      )}
    </section>
  );
}
