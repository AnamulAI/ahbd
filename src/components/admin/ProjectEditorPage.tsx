import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  ArrowLeft,
  Save,
  Plus,
  X,
  Upload,
  GripVertical,
  Trash2,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { TagInput } from "@/components/admin/TagInput";
import {
  CATEGORY_OPTIONS,
  slugify,
  uploadContentImage,
} from "@/lib/admin-content-helpers";
import { fetchSubCategoriesFor } from "@/components/admin/ProjectsListPage";


type ProcessStep = { title: string; description: string };
type ResultStat = { value: string; label: string };

type Project = {
  id?: string;
  title: string;
  slug: string;
  main_category: string;
  sub_category_label: string | null;
  cover_image_url: string | null;
  client_logo_url: string | null;
  gallery_image_urls: string[];
  description: string;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
  is_featured: boolean;
  sort_order: number;
  challenge: string;
  solution: string;
  process_steps: ProcessStep[];
  result_stats: ResultStat[];
  testimonial_quote: string;
  testimonial_name: string;
  testimonial_title: string;
  // Podcast-specific
  spotify_url: string;
  apple_podcasts_url: string;
  youtube_url: string;
  episode_title: string;
  episode_audio_url: string | null;
  episode_video_url: string | null;
  ig_reel_url: string | null;
  ig_reel_caption: string;
  tiktok_clip_url: string | null;
  tiktok_clip_caption: string;
  linkedin_clip_url: string | null;
  linkedin_clip_caption: string;
  // AI Integrator-specific
  problem: string;
  integration_map: string[];
  trigger_text: string;
  action_text: string;
  output_text: string;
};

const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  { title: "Discovery", description: "Understood the target audience, required features, and gathered the necessary content and requirements." },
  { title: "Design Direction", description: "Defined the visual direction and UX approach to match the brand and project goals." },
  { title: "Development", description: "Built the solution using the chosen tech stack." },
  { title: "Content & Integration", description: "Organized and integrated all content, data, and third-party connections." },
  { title: "Deployment & Delivery", description: "Tested, deployed, and delivered the finished project to the client." },
];

const EMPTY: Project = {
  title: "",
  slug: "",
  main_category: "web_development",
  sub_category_label: null,
  cover_image_url: null,
  client_logo_url: null,
  gallery_image_urls: [],
  description: "",
  tech_stack: [],
  live_url: "",
  github_url: "",
  is_featured: false,
  sort_order: 0,
  challenge: "",
  solution: "",
  process_steps: DEFAULT_PROCESS_STEPS,
  result_stats: [],
  testimonial_quote: "",
  testimonial_name: "",
  testimonial_title: "",
  spotify_url: "",
  apple_podcasts_url: "",
  youtube_url: "",
  episode_title: "",
  episode_audio_url: null,
  episode_video_url: null,
  ig_reel_url: null,
  ig_reel_caption: "",
  tiktok_clip_url: null,
  tiktok_clip_caption: "",
  linkedin_clip_url: null,
  linkedin_clip_caption: "",
  problem: "",
  integration_map: [],
  trigger_text: "",
  action_text: "",
  output_text: "",
};


function coerceProcessSteps(v: unknown): ProcessStep[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      title: typeof s.title === "string" ? s.title : "",
      description: typeof s.description === "string" ? s.description : "",
    }));
}
function coerceResultStats(v: unknown): ResultStat[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      value: typeof s.value === "string" ? s.value : "",
      label: typeof s.label === "string" ? s.label : "",
    }));
}

export function ProjectEditorPage({
  id,
  presetMain,
  presetSub,
}: {
  id?: string;
  presetMain?: string;
  presetSub?: string;
}) {
  const gate = useAdminGate();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project>({
    ...EMPTY,
    main_category: presetMain ?? EMPTY.main_category,
    sub_category_label: presetSub || null,
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);
  const [subOptions, setSubOptions] = useState<string[]>([]);

  useEffect(() => {
    if (gate.status !== "ok" || !id) return;
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        const d = data as Record<string, unknown>;
        const s = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");
        const n = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : null);
        setProject({
          ...EMPTY,
          ...d,
          challenge: s("challenge"),
          solution: s("solution"),
          process_steps: coerceProcessSteps(d.process_steps),
          result_stats: coerceResultStats(d.result_stats),
          testimonial_quote: s("testimonial_quote"),
          testimonial_name: s("testimonial_name"),
          testimonial_title: s("testimonial_title"),
          spotify_url: s("spotify_url"),
          apple_podcasts_url: s("apple_podcasts_url"),
          youtube_url: s("youtube_url"),
          episode_title: s("episode_title"),
          episode_audio_url: n("episode_audio_url"),
          episode_video_url: n("episode_video_url"),
          ig_reel_url: n("ig_reel_url"),
          ig_reel_caption: s("ig_reel_caption"),
          tiktok_clip_url: n("tiktok_clip_url"),
          tiktok_clip_caption: s("tiktok_clip_caption"),
          linkedin_clip_url: n("linkedin_clip_url"),
          linkedin_clip_caption: s("linkedin_clip_caption"),
          client_logo_url: n("client_logo_url"),
          problem: s("problem"),
          integration_map: Array.isArray(d.integration_map)
            ? (d.integration_map as unknown[]).filter((x): x is string => typeof x === "string")
            : [],
          trigger_text: s("trigger_text"),
          action_text: s("action_text"),
          output_text: s("output_text"),
        } as Project);
        setSlugDirty(true);
      }

      setLoading(false);
    })();
  }, [gate.status, id]);

  useEffect(() => {
    fetchSubCategoriesFor(project.main_category).then(setSubOptions);
  }, [project.main_category]);

  useEffect(() => {
    if (!slugDirty && project.title) {
      setProject((p) => ({ ...p, slug: slugify(p.title) }));
    }
  }, [project.title, slugDirty]);

  function update<K extends keyof Project>(k: K, v: Project[K]) {
    setProject((p) => ({ ...p, [k]: v }));
  }

  async function save(andAddAnother = false) {
    if (!project.title.trim()) return toast.error("Title is required");
    if (!project.slug.trim()) return toast.error("Slug is required");
    setSaving(true);
    const isPodcast = project.main_category === "ai_podcast";
    const isIntegrator = project.main_category === "ai_integrator";
    const payload = {
      title: project.title.trim(),
      slug: project.slug.trim(),
      main_category: project.main_category,
      sub_category_label: project.sub_category_label || null,
      cover_image_url: project.cover_image_url,
      client_logo_url: project.client_logo_url,
      gallery_image_urls: project.gallery_image_urls,
      description: project.description || null,
      tech_stack: project.tech_stack,
      live_url: isPodcast ? null : (project.live_url || null),
      github_url: isPodcast ? null : (project.github_url || null),
      is_featured: project.is_featured,
      sort_order: project.sort_order,
      // Case-study fields are now shared across categories.
      challenge: project.challenge || null,
      solution: project.solution || null,
      process_steps: project.process_steps,
      result_stats: project.result_stats,
      testimonial_quote: project.testimonial_quote || null,
      testimonial_name: project.testimonial_name || null,
      testimonial_title: project.testimonial_title || null,
      // Podcast fields (only saved when podcast category; cleared otherwise).
      spotify_url: isPodcast ? (project.spotify_url || null) : null,
      apple_podcasts_url: isPodcast ? (project.apple_podcasts_url || null) : null,
      youtube_url: isPodcast ? (project.youtube_url || null) : null,
      episode_title: isPodcast ? (project.episode_title || null) : null,
      episode_audio_url: isPodcast ? project.episode_audio_url : null,
      episode_video_url: isPodcast ? project.episode_video_url : null,
      ig_reel_url: isPodcast ? project.ig_reel_url : null,
      ig_reel_caption: isPodcast ? (project.ig_reel_caption || null) : null,
      tiktok_clip_url: isPodcast ? project.tiktok_clip_url : null,
      tiktok_clip_caption: isPodcast ? (project.tiktok_clip_caption || null) : null,
      linkedin_clip_url: isPodcast ? project.linkedin_clip_url : null,
      linkedin_clip_caption: isPodcast ? (project.linkedin_clip_caption || null) : null,
      // AI Integrator fields (only saved when integrator category; cleared otherwise).
      problem: isIntegrator ? (project.problem || null) : null,
      integration_map: isIntegrator ? project.integration_map : [],
      trigger_text: isIntegrator ? (project.trigger_text || null) : null,
      action_text: isIntegrator ? (project.action_text || null) : null,
      output_text: isIntegrator ? (project.output_text || null) : null,
    };
    let error;
    if (id) {
      ({ error } = await supabase.from("projects").update(payload).eq("id", id));
    } else {
      ({ error } = await supabase.from("projects").insert(payload));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    if (andAddAnother && !id) {
      setProject({
        ...EMPTY,
        main_category: project.main_category,
        sub_category_label: project.sub_category_label,
      });
      setSlugDirty(false);
    } else {
      navigate({ to: "/admin/projects", search: { main: project.main_category, sub: project.sub_category_label ?? undefined } });
    }
  }


  if (gate.status !== "ok" || loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  const inputCls =
    "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none";
  const labelCls = "block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5";
  const isPodcast = project.main_category === "ai_podcast";
  const isIntegrator = project.main_category === "ai_integrator";
  const techLabel = isPodcast ? "Tools used" : isIntegrator ? "Tools & Tech" : "Tech stack";
  const techPh = isPodcast
    ? "Add a tool (e.g. ElevenLabs)…"
    : isIntegrator
      ? "Add a tool (e.g. Make.com)…"
      : "Add a tech tag (e.g. React)…";

  return (
    <AdminShell email={gate.email}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/projects", search: { main: project.main_category, sub: project.sub_category_label ?? undefined } })}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </button>
        <div className="flex items-center gap-2">
          {!id && (
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.04] px-4 text-sm font-medium text-white hover:bg-white/[0.08] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> Save & Add Another
            </button>
          )}
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,340px]">
        <div className="space-y-5">
          <div className="space-y-5 rounded-xl border border-white/[0.08] bg-[#11162A] p-6">
            <div>
              <label className={labelCls}>Title</label>
              <input
                value={project.title}
                onChange={(e) => update("title", e.target.value)}
                className={`${inputCls} text-base`}
              />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input
                value={project.slug}
                onChange={(e) => {
                  setSlugDirty(true);
                  update("slug", slugify(e.target.value));
                }}
                className={inputCls}
              />
            </div>
            <div>
              <ImageUploader
                label="Client Logo / Photo (optional)"
                value={project.client_logo_url}
                onChange={(url) => update("client_logo_url", url)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Main category</label>
                <select
                  value={project.main_category}
                  onChange={(e) => {
                    update("main_category", e.target.value);
                    update("sub_category_label", null);
                  }}
                  className={inputCls}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Sub-category</label>
                <select
                  value={project.sub_category_label ?? ""}
                  onChange={(e) => update("sub_category_label", e.target.value || null)}
                  className={inputCls}
                >
                  <option value="">— Uncategorized —</option>
                  {subOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  {project.sub_category_label &&
                    !subOptions.includes(project.sub_category_label) && (
                      <option value={project.sub_category_label}>
                        {project.sub_category_label} (removed)
                      </option>
                    )}
                </select>
                <p className="mt-1 text-[11px] text-white/40">
                  Synced from Builder Settings. Removed sub-categories show as Uncategorized.
                </p>
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={project.description}
                onChange={(e) => update("description", e.target.value)}
                rows={5}
                className={`${inputCls} resize-y`}
              />
            </div>
            <div>
              <label className={labelCls}>{techLabel}</label>
              <TagInput
                value={project.tech_stack}
                onChange={(v) => update("tech_stack", v)}
                placeholder={techPh}
              />
            </div>
            {!isPodcast && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>{isIntegrator ? "Live Demo URL" : "Live URL"}</label>
                  <input
                    value={project.live_url ?? ""}
                    onChange={(e) => update("live_url", e.target.value)}
                    placeholder="https://"
                    className={inputCls}
                  />
                </div>
                {!isIntegrator && (
                  <div>
                    <label className={labelCls}>GitHub URL</label>
                    <input
                      value={project.github_url ?? ""}
                      onChange={(e) => update("github_url", e.target.value)}
                      placeholder="https://github.com/…"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>
            )}
            <GalleryEditor
              value={project.gallery_image_urls}
              onChange={(v) => update("gallery_image_urls", v)}
            />
          </div>

          {isPodcast && (
            <>
              <CaseStudyCard title="Platform Links">
                <div>
                  <label className={labelCls}>Spotify URL</label>
                  <input
                    value={project.spotify_url}
                    onChange={(e) => update("spotify_url", e.target.value)}
                    placeholder="https://open.spotify.com/episode/…"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Apple Podcasts URL</label>
                  <input
                    value={project.apple_podcasts_url}
                    onChange={(e) => update("apple_podcasts_url", e.target.value)}
                    placeholder="https://podcasts.apple.com/…"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>YouTube URL</label>
                  <input
                    value={project.youtube_url}
                    onChange={(e) => update("youtube_url", e.target.value)}
                    placeholder="https://youtube.com/watch?v=…"
                    className={inputCls}
                  />
                </div>
              </CaseStudyCard>

              <CaseStudyCard title="Episode Media">
                <div>
                  <label className={labelCls}>Episode Title</label>
                  <input
                    value={project.episode_title}
                    onChange={(e) => update("episode_title", e.target.value)}
                    placeholder="Defaults to project title if left empty"
                    className={inputCls}
                  />
                </div>
                <MediaUploader
                  value={project.episode_audio_url}
                  onChange={(url) => update("episode_audio_url", url)}
                  kind="audio"
                  label="Episode audio file (mp3/wav/m4a)"
                />
                <MediaUploader
                  value={project.episode_video_url}
                  onChange={(url) => update("episode_video_url", url)}
                  kind="video"
                  label="Episode video file (mp4)"
                />
              </CaseStudyCard>

              <CaseStudyCard title="SMM Clips (Optional)">
                <ClipCard
                  platform="Instagram Reel"
                  captionLabel="Instagram Caption"
                  captionPlaceholder="Write a caption with emojis and hashtags… 🎙️✨ #podcast"
                  url={project.ig_reel_url}
                  caption={project.ig_reel_caption}
                  onUrl={(u) => update("ig_reel_url", u)}
                  onCaption={(c) => update("ig_reel_caption", c)}
                />
                <ClipCard
                  platform="TikTok"
                  captionLabel="TikTok Caption"
                  captionPlaceholder="Short, punchy hook with trending hashtags… #fyp #podcast"
                  url={project.tiktok_clip_url}
                  caption={project.tiktok_clip_caption}
                  onUrl={(u) => update("tiktok_clip_url", u)}
                  onCaption={(c) => update("tiktok_clip_caption", c)}
                />
                <ClipCard
                  platform="LinkedIn Clip"
                  captionLabel="LinkedIn Caption"
                  captionPlaceholder="Write a professional caption that opens a conversation…"
                  url={project.linkedin_clip_url}
                  caption={project.linkedin_clip_caption}
                  onUrl={(u) => update("linkedin_clip_url", u)}
                  onCaption={(c) => update("linkedin_clip_caption", c)}
                />
              </CaseStudyCard>
            </>
          )}

          <>

              {isIntegrator ? (
                <>
                  <CaseStudyCard title="The Problem">
                    <div>
                      <label className={labelCls}>The Problem</label>
                      <textarea
                        value={project.problem}
                        onChange={(e) => update("problem", e.target.value)}
                        rows={5}
                        placeholder="Describe the client's manual or broken process before this automation..."
                        className={`${inputCls} resize-y`}
                      />
                    </div>
                  </CaseStudyCard>

                  <CaseStudyCard title="Integration Map">
                    <IntegrationMapEditor
                      value={project.integration_map}
                      onChange={(v) => update("integration_map", v)}
                    />
                  </CaseStudyCard>

                  <CaseStudyCard title="Trigger, Action, Output">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className={labelCls}>Trigger</label>
                        <textarea
                          value={project.trigger_text}
                          onChange={(e) => update("trigger_text", e.target.value)}
                          rows={3}
                          placeholder="What starts this automation? e.g. New form submission"
                          className={`${inputCls} resize-y`}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Action</label>
                        <textarea
                          value={project.action_text}
                          onChange={(e) => update("action_text", e.target.value)}
                          rows={3}
                          placeholder="What does the automation do? e.g. Parses the message and creates a task"
                          className={`${inputCls} resize-y`}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Output</label>
                        <textarea
                          value={project.output_text}
                          onChange={(e) => update("output_text", e.target.value)}
                          rows={3}
                          placeholder="What does the client get? e.g. A ready-to-send WhatsApp reply"
                          className={`${inputCls} resize-y`}
                        />
                      </div>
                    </div>
                  </CaseStudyCard>
                </>
              ) : (
                <>
                  <CaseStudyCard title="Case Study — Narrative">
                    <div>
                      <label className={labelCls}>The Challenge</label>
                      <textarea
                        value={project.challenge}
                        onChange={(e) => update("challenge", e.target.value)}
                        rows={5}
                        placeholder="Describe the core problem the client was facing before this project..."
                        className={`${inputCls} resize-y`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>The Solution</label>
                      <textarea
                        value={project.solution}
                        onChange={(e) => update("solution", e.target.value)}
                        rows={5}
                        placeholder="Describe what was built and how it solved the problem..."
                        className={`${inputCls} resize-y`}
                      />
                    </div>
                  </CaseStudyCard>

                  <CaseStudyCard title="Process Steps">
                    <ProcessStepsEditor
                      value={project.process_steps}
                      onChange={(v) => update("process_steps", v)}
                    />
                  </CaseStudyCard>
                </>
              )}

              <CaseStudyCard title={isIntegrator ? "ROI Snapshot" : "Result Stats"}>
                <ResultStatsEditor
                  value={project.result_stats}
                  onChange={(v) => update("result_stats", v)}
                />
              </CaseStudyCard>


              <CaseStudyCard title="Client Testimonial">
                <div>
                  <label className={labelCls}>Testimonial Quote</label>
                  <textarea
                    value={project.testimonial_quote}
                    onChange={(e) => update("testimonial_quote", e.target.value)}
                    rows={4}
                    placeholder="What the client said..."
                    className={`${inputCls} resize-y`}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Client Name</label>
                    <input
                      value={project.testimonial_name}
                      onChange={(e) => update("testimonial_name", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Client Title / Role</label>
                    <input
                      value={project.testimonial_title}
                      onChange={(e) => update("testimonial_title", e.target.value)}
                      placeholder="Founder, Local Storefront Co."
                      className={inputCls}
                    />
                  </div>
                </div>
              </CaseStudyCard>
          </>

        </div>

        <aside className="space-y-5 rounded-xl border border-white/[0.08] bg-[#11162A] p-5 h-fit">
          <ImageUploader
            value={project.cover_image_url}
            onChange={(url) => update("cover_image_url", url)}
            label="Cover image"
          />
          <label className="flex items-center justify-between rounded-md border border-white/[0.08] bg-[#0B0F1A] px-3 py-2.5">
            <div>
              <div className="text-sm text-white/85">Featured</div>
              <div className="text-[11px] text-white/40">Used in Home/Projects spotlight</div>
            </div>
            <input
              type="checkbox"
              checked={project.is_featured}
              onChange={(e) => update("is_featured", e.target.checked)}
              className="h-4 w-4 accent-[#3B82F6]"
            />
          </label>
        </aside>
      </div>
    </AdminShell>
  );
}

function CaseStudyCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-white/[0.08] bg-[#11162A] p-6">
      <div className="flex items-center gap-2 border-l-2 border-[#3B82F6] pl-3">
        <h2 className="text-sm font-mono uppercase tracking-wider text-[#3B82F6]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function ClipCard({
  platform,
  captionLabel,
  captionPlaceholder,
  url,
  caption,
  onUrl,
  onCaption,
}: {
  platform: string;
  captionLabel: string;
  captionPlaceholder: string;
  url: string | null;
  caption: string;
  onUrl: (u: string | null) => void;
  onCaption: (c: string) => void;
}) {
  const inputCls =
    "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none";
  return (
    <div className="space-y-3 rounded-lg border border-white/[0.06] bg-[#0B0F1A] p-4">
      <div className="flex items-center gap-2 border-l-2 border-[#F97316] pl-2">
        <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#F97316]">
          {platform}
        </h3>
      </div>
      <MediaUploader
        value={url}
        onChange={onUrl}
        kind="video"
        label="Vertical clip video (mp4)"
      />
      <div>
        <label className="mb-1.5 block text-xs font-mono uppercase tracking-wider text-white/60">
          {captionLabel}
        </label>
        <textarea
          value={caption}
          onChange={(e) => onCaption(e.target.value)}
          rows={4}
          placeholder={captionPlaceholder}
          className={`${inputCls} resize-y`}
        />
      </div>
    </div>
  );
}


function IntegrationMapEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const t = draft.trim();
    if (!t) return;
    onChange([...value, t]);
    setDraft("");
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {value.map((node, i) => (
          <div
            key={`${node}-${i}`}
            className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#16181D] px-3 py-2"
          >
            <span className="font-mono text-xs text-white/40 w-6">{i + 1}.</span>
            <span className="flex-1 text-sm text-white">{node}</span>
            <button
              type="button"
              onClick={() => move(i, -1)}
              className="text-white/50 hover:text-white text-xs px-2"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              className="text-white/50 hover:text-white text-xs px-2"
              aria-label="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-400/70 hover:text-red-400 text-xs px-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a tool node (e.g. Gmail)…"
          className="flex-1 rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs font-mono uppercase tracking-wider text-white/80 hover:bg-white/[0.08]"
        >
          + Add Node
        </button>
      </div>
    </div>
  );
}

function ProcessStepsEditor({
  value,
  onChange,
}: {
  value: ProcessStep[];
  onChange: (v: ProcessStep[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const ids = value.map((_, i) => `step-${i}`);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    onChange(arrayMove(value, oldIdx, newIdx));
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {value.map((step, i) => (
              <SortableStepRow
                key={ids[i]}
                id={ids[i]}
                index={i}
                step={step}
                onChange={(next) => {
                  const copy = value.slice();
                  copy[i] = next;
                  onChange(copy);
                }}
                onRemove={() => onChange(value.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={() =>
          onChange([...value, { title: "", description: "" }])
        }
        className="inline-flex items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.08]"
      >
        <Plus className="h-4 w-4" /> Add Step
      </button>
    </div>
  );
}

function SortableStepRow({
  id,
  index,
  step,
  onChange,
  onRemove,
}: {
  id: string;
  index: number;
  step: ProcessStep;
  onChange: (s: ProcessStep) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const inputCls =
    "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none";
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 rounded-md border border-white/[0.08] bg-[#0B0F1A] p-3"
    >
      <div className="flex flex-col items-center gap-2 pt-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-white/30 hover:text-white/60 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="font-mono text-[10px] text-white/40">{index + 1}</span>
      </div>
      <div className="flex-1 space-y-2">
        <input
          value={step.title}
          onChange={(e) => onChange({ ...step, title: e.target.value })}
          placeholder="Step title (e.g. Discovery)"
          className={inputCls}
        />
        <textarea
          value={step.description}
          onChange={(e) => onChange({ ...step, description: e.target.value })}
          rows={2}
          placeholder="Step description..."
          className={`${inputCls} resize-y`}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove step"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ResultStatsEditor({
  value,
  onChange,
}: {
  value: ResultStat[];
  onChange: (v: ResultStat[]) => void;
}) {
  const inputCls =
    "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none";
  return (
    <div className="space-y-3">
      {value.map((stat, i) => (
        <div
          key={i}
          className="flex gap-2 rounded-md border border-white/[0.08] bg-[#0B0F1A] p-3"
        >
          <div className="grid flex-1 gap-2 sm:grid-cols-[160px,1fr]">
            <input
              value={stat.value}
              onChange={(e) => {
                const copy = value.slice();
                copy[i] = { ...stat, value: e.target.value };
                onChange(copy);
              }}
              placeholder="Value (e.g. 58%)"
              className={inputCls}
            />
            <input
              value={stat.label}
              onChange={(e) => {
                const copy = value.slice();
                copy[i] = { ...stat, label: e.target.value };
                onChange(copy);
              }}
              placeholder="Label (e.g. of total sales now online...)"
              className={inputCls}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            aria-label="Remove stat"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { value: "", label: "" }])}
        className="inline-flex items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.08]"
      >
        <Plus className="h-4 w-4" /> Add Stat
      </button>
    </div>
  );
}

function GalleryEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  async function handleFiles(files: FileList) {
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        urls.push(await uploadContentImage(f));
      }
      onChange([...value, ...urls]);
      toast.success(`Uploaded ${urls.length} image${urls.length === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = value.indexOf(String(active.id));
    const newIdx = value.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    onChange(arrayMove(value, oldIdx, newIdx));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-mono uppercase tracking-wider text-white/60">
          Gallery ({value.length})
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.08] disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Upload images
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {value.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/[0.1] bg-[#0B0F1A] px-3 py-6 text-center text-xs text-white/40">
          No gallery images yet — drag & drop after uploading to reorder.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {value.map((url) => (
                <GalleryTile
                  key={url}
                  url={url}
                  onRemove={() => onChange(value.filter((u) => u !== url))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function GalleryTile({ url, onRemove }: { url: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: url,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square overflow-hidden rounded-md border border-white/[0.08] bg-[#0B0F1A]"
    >
      <img src={url} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded bg-black/70 text-white/80 opacity-0 group-hover:opacity-100"
        aria-label="Drag"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded bg-black/70 text-white/80 hover:bg-black/90 hover:text-white"
        aria-label="Remove"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
