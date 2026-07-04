import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  FileAudio,
  FileVideo,
  GripVertical,
  ImagePlus,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  createMediaUploadUrl,
  createSample,
  getSampleForEdit,
  updateSample,
  AUDIENCE_CATEGORIES,
  type AudienceCategory,
} from "@/lib/sample-builder.functions";

const AUDIENCE_SUGGESTIONS: { value: string; label: string }[] = [
  { value: "marketers", label: "Marketers" },
  { value: "creators", label: "Content Creators" },
  { value: "businesses", label: "Businesses" },
  { value: "educators", label: "Educators" },
];

const ALL_PLATFORMS = [
  { id: "spotify", label: "Spotify" },
  { id: "apple", label: "Apple Podcasts" },
  { id: "youtube", label: "YouTube Podcasts" },
];

const MODULE_LABELS: Record<string, string> = {
  platforms: "Platform Mockups",
  video: "Video Podcast Preview",
  smm: "SMM Marketing Kit",
};

type MediaKind = "audio" | "video" | "clip";

const inputCls =
  "w-full rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none";
const labelCls =
  "block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5";
const cardCls =
  "space-y-5 rounded-xl border border-white/[0.08] bg-[#11162A] p-6";
const sectionTitleCls =
  "text-[11px] font-mono uppercase tracking-[0.2em] text-white/45";

export function SampleEditorPage({ id: editId }: { id?: string }) {
  const gate = useAdminGate();

  if (gate.status === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <AdminShell email={gate.email}>
      <Editor editId={editId} />
    </AdminShell>
  );
}

function Editor({ editId }: { editId?: string }) {
  const navigate = useNavigate();

  const createFn = useServerFn(createSample);
  const updateFn = useServerFn(updateSample);
  const getFn = useServerFn(getSampleForEdit);
  const uploadUrlFn = useServerFn(createMediaUploadUrl);

  const isEditing = !!editId;

  const [businessName, setBusinessName] = useState("");
  const [audienceCategory, setAudienceCategory] = useState<string>("Businesses");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["spotify", "apple", "youtube"]);
  const [showVideo, setShowVideo] = useState(true);
  const [showSmm, setShowSmm] = useState(true);
  const [ctaText, setCtaText] = useState("Get This Service →");
  const [ctaLink, setCtaLink] = useState("/services/ai-podcast");

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoFilename, setLogoFilename] = useState<string | null>(null);
  const [logoExistingUrl, setLogoExistingUrl] = useState<string | null>(null);
  const [logoLinkUrl, setLogoLinkUrl] = useState<string>("");
  const [logoCleared, setLogoCleared] = useState(false);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [clipIg, setClipIg] = useState<string | null>(null);
  const [clipTt, setClipTt] = useState<string | null>(null);
  const [clipLi, setClipLi] = useState<string | null>(null);

  const [clientIndustry, setClientIndustry] = useState("");
  const [scarcityEnabled, setScarcityEnabled] = useState(false);
  const [scarcityMessage, setScarcityMessage] = useState("");
  const [scarcityDurationDays, setScarcityDurationDays] = useState<string>("7");
  const [scarcityLabel, setScarcityLabel] = useState("Limited-time preview");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [bookingLink, setBookingLink] = useState("");
  const [estListeners, setEstListeners] = useState("");
  const [estReachGrowth, setEstReachGrowth] = useState("");
  const [estTimeSaved, setEstTimeSaved] = useState("");
  const [beforeState, setBeforeState] = useState("");
  const [afterState, setAfterState] = useState("");
  const [igCaption, setIgCaption] = useState("");
  const [ttCaption, setTtCaption] = useState("");
  const [liCaption, setLiCaption] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  const activeModules = useMemo(() => {
    const base: string[] = [];
    if (platforms.length > 0) base.push("platforms");
    if (showVideo) base.push("video");
    if (showSmm) base.push("smm");
    return base;
  }, [platforms.length, showVideo, showSmm]);

  const [moduleOrder, setModuleOrder] = useState<string[]>(["platforms", "video", "smm"]);

  useEffect(() => {
    setModuleOrder((prev) => {
      const filtered = prev.filter((m) => activeModules.includes(m));
      for (const m of activeModules) if (!filtered.includes(m)) filtered.push(m);
      return filtered;
    });
  }, [activeModules]);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    setLoadingEdit(true);
    getFn({ data: { id: editId } })
      .then((res) => {
        if (cancelled) return;
        if (!res.sample) {
          toast.error(res.error || "Sample not found");
          return;
        }
        const s = res.sample as any;
        setBusinessName(s.business_name || "");
        setAudienceCategory(
          typeof s.audience_category === "string" && s.audience_category.trim()
            ? s.audience_category
            : "Businesses",
        );
        setEpisodeTitle(s.episode_title || "");
        setTopic(s.topic || "");
        setPlatforms((s.platforms as string[]) || []);
        setShowVideo(!!s.show_video);
        setShowSmm(!!s.show_smm);
        setCtaText(s.cta_text || "Get This Service →");
        setCtaLink(s.cta_link || "/services/ai-podcast");
        const order = (s.module_order as string[]) || [];
        if (order.length) setModuleOrder(order);
        setLogoExistingUrl(s.logo_url);
        setLogoDataUrl(null);
        setLogoFilename(null);
        setLogoLinkUrl("");
        setLogoCleared(false);
        setAudioUrl(s.audio_url);
        setVideoUrl(s.video_url);
        setClipIg(s.clip_instagram_url);
        setClipTt(s.clip_tiktok_url);
        setClipLi(s.clip_linkedin_url);
        setClientIndustry(s.client_industry ?? "");
        setScarcityEnabled(!!s.scarcity_enabled);
        setScarcityMessage(s.scarcity_message ?? "");
        setScarcityDurationDays(
          s.scarcity_duration_days != null ? String(s.scarcity_duration_days) : "7",
        );
        setScarcityLabel(s.scarcity_label ?? "Limited-time preview");
        setWhatsappNumber(s.whatsapp_number ?? "");
        setBookingLink(s.booking_link ?? "");
        setEstListeners(s.estimated_listeners ?? "");
        setEstReachGrowth(s.estimated_reach_growth ?? "");
        setEstTimeSaved(s.estimated_time_saved ?? "");
        setBeforeState(s.before_state ?? "");
        setAfterState(s.after_state ?? "");
        setIgCaption(s.ig_reel_caption ?? "");
        setTtCaption(s.tiktok_clip_caption ?? "");
        setLiCaption(s.linkedin_clip_caption ?? "");
      })
      .finally(() => !cancelled && setLoadingEdit(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const togglePlatform = (id: string) => {
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const uploadMedia = async (kind: MediaKind, file: File): Promise<string | null> => {
    const res = await uploadUrlFn({
      data: { kind, filename: file.name, slugHint: businessName || undefined },
    });
    if (!res.ok) {
      toast.error(res.error || "Upload failed");
      return null;
    }
    const { error } = await supabase.storage
      .from(res.bucket)
      .uploadToSignedUrl(res.path, res.token, file, { contentType: file.type || undefined });
    if (error) {
      toast.error(error.message);
      return null;
    }
    return res.previewUrl;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return toast.error("Business name required");
    if (platforms.length === 0) return toast.error("Select at least one platform");
    setSubmitting(true);
    try {
      const trimmedLink = logoLinkUrl.trim();
      let logoFields: {
        logo_base64?: string | null;
        logo_filename?: string | null;
        logo_direct_url?: string | null;
      } = {};
      if (logoDataUrl) {
        logoFields = { logo_base64: logoDataUrl, logo_filename: logoFilename };
      } else if (trimmedLink) {
        logoFields = { logo_direct_url: trimmedLink };
      } else if (logoCleared) {
        logoFields = { logo_direct_url: null };
      }

      const basePayload = {
        business_name: businessName,
        audience_category: audienceCategory,
        episode_title: episodeTitle,
        topic,
        platforms,
        show_video: showVideo,
        show_smm: showSmm,
        module_order: moduleOrder,
        cta_text: ctaText,
        cta_link: ctaLink,
        ...logoFields,
        audio_url: audioUrl,
        video_url: videoUrl,
        clip_instagram_url: clipIg,
        clip_tiktok_url: clipTt,
        clip_linkedin_url: clipLi,
        client_industry: clientIndustry.trim() || null,
        scarcity_enabled: scarcityEnabled,
        scarcity_message: scarcityMessage.trim() || null,
        scarcity_duration_days: (() => {
          const n = parseInt(scarcityDurationDays, 10);
          return Number.isFinite(n) && n > 0 ? n : null;
        })(),
        scarcity_label: scarcityLabel.trim() || null,
        whatsapp_number: whatsappNumber.trim() || null,
        booking_link: bookingLink.trim() || null,
        estimated_listeners: estListeners.trim() || null,
        estimated_reach_growth: estReachGrowth.trim() || null,
        estimated_time_saved: estTimeSaved.trim() || null,
        before_state: beforeState.trim() || null,
        after_state: afterState.trim() || null,
        ig_reel_caption: igCaption.trim() || null,
        tiktok_clip_caption: ttCaption.trim() || null,
        linkedin_clip_caption: liCaption.trim() || null,
      };

      const res = isEditing && editId
        ? await updateFn({ data: { ...basePayload, id: editId } as any })
        : await createFn({ data: basePayload as any });

      if (!res.ok || !res.slug) {
        toast.error(res.error || "Failed to save");
        return;
      }
      toast.success(isEditing ? "Sample updated" : "Sample created");
      navigate({ to: "/admin/sample-builder" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Link
        to="/admin/sample-builder"
        className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Samples
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {isEditing ? "Edit Sample" : "New Sample"}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Create a personalized podcast preview to send to a prospect.
          </p>
        </div>
        <button
          type="submit"
          form="sample-builder-form"
          disabled={submitting}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEditing ? "Save Changes" : "Create Sample"}
        </button>
      </div>

      {loadingEdit ? (
        <div className="mt-6 flex justify-center rounded-xl border border-white/[0.08] bg-[#11162A] p-10">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </div>
      ) : (
        <form id="sample-builder-form" onSubmit={onSubmit} className="mt-6 space-y-6">
          {/* Basics */}
          <div className={cardCls}>
            <div className={sectionTitleCls}>// Basics</div>
            <div>
              <label className={labelCls}>Business / Brand Name *</label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Target Audience *</label>
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCE_CATEGORIES.map((cat) => {
                  const active = audienceCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAudienceCategory(cat)}
                      className={cn(
                        "rounded-md border px-4 py-3 text-sm text-left transition-colors",
                        active
                          ? "border-[#3B82F6]/50 bg-[#3B82F6]/[0.12] text-white"
                          : "border-white/[0.1] bg-[#16181D] text-white/70 hover:border-white/[0.2] hover:text-white",
                      )}
                    >
                      {AUDIENCE_LABELS[cat]}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-white/40">
                Drives the hero description and closing CTA copy on the public preview.
              </p>
            </div>

            <div>
              <label className={labelCls}>Client Industry</label>
              <input
                value={clientIndustry}
                onChange={(e) => setClientIndustry(e.target.value)}
                placeholder="E-commerce, Business Coaching, Local Services, SaaS…"
                className={inputCls}
              />
              <p className="mt-1.5 text-[11px] text-white/40">
                Personalizes hero + closing CTA copy. Leave empty for generic copy.
              </p>
            </div>

            <ImageDropzone
              label="Logo"
              existingUrl={logoExistingUrl}
              dataUrl={logoDataUrl}
              cleared={logoCleared}
              linkUrl={logoLinkUrl}
              onFile={(f) => {
                if (f.size > 5 * 1024 * 1024) return toast.error("Logo must be under 5MB");
                const reader = new FileReader();
                reader.onload = () => {
                  setLogoDataUrl(reader.result as string);
                  setLogoFilename(f.name);
                  setLogoCleared(false);
                  setLogoLinkUrl("");
                };
                reader.readAsDataURL(f);
              }}
              onLinkChange={(v) => {
                setLogoLinkUrl(v);
                setLogoCleared(false);
                setLogoDataUrl(null);
                setLogoFilename(null);
              }}
              onClear={() => {
                setLogoDataUrl(null);
                setLogoFilename(null);
                setLogoLinkUrl("");
                setLogoCleared(true);
              }}
            />
          </div>

          {/* Scarcity */}
          <div className={cardCls}>
            <div className={sectionTitleCls}>// Scarcity Badge (optional)</div>
            <ToggleRow
              label="Show Scarcity Badge"
              checked={scarcityEnabled}
              onChange={setScarcityEnabled}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Expires After (Days)</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={scarcityDurationDays}
                  onChange={(e) => setScarcityDurationDays(e.target.value)}
                  placeholder="7"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Label Text (optional)</label>
                <input
                  value={scarcityLabel}
                  onChange={(e) => setScarcityLabel(e.target.value)}
                  placeholder="Limited-time preview"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Episode */}
          <div className={cardCls}>
            <div className={sectionTitleCls}>// Episode</div>
            <div>
              <label className={labelCls}>Episode Title</label>
              <input
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                placeholder="Episode 1: From One Oven to Three Locations"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Topic / Content</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="5 Lessons From Scaling a Local Bakery to 3 Locations"
                rows={3}
                className={`${inputCls} resize-y`}
              />
            </div>

            <MediaDropzone
              label="Episode Audio File"
              kind="audio"
              accept=".mp3,.wav,.m4a,audio/*"
              value={audioUrl}
              onUpload={uploadMedia}
              onChange={setAudioUrl}
              hint="Optional — upload the real podcast audio (.mp3, .wav, .m4a) to make Spotify and Apple play buttons functional."
            />
            <MediaDropzone
              label="Episode Video File"
              kind="video"
              accept=".mp4,.mov,.webm,video/*"
              value={videoUrl}
              onUpload={uploadMedia}
              onChange={setVideoUrl}
              hint="Optional — upload the full video episode to power the YouTube card and Video Podcast module."
            />

            <div>
              <label className={labelCls}>Podcast Platforms to Preview *</label>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map((p) => {
                  const active = platforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors",
                        active
                          ? "border-[#F97316]/50 bg-[#F97316]/[0.15] text-white"
                          : "border-white/[0.1] bg-[#16181D] text-white/70 hover:text-white",
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className={cardCls}>
            <div className={sectionTitleCls}>// Modules</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToggleRow label="Video Podcast Preview" checked={showVideo} onChange={setShowVideo} />
              <ToggleRow label="SMM Marketing Kit Preview" checked={showSmm} onChange={setShowSmm} />
            </div>

            <div>
              <label className={labelCls}>Module Order (drag to reorder)</label>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e: DragEndEvent) => {
                  const { active, over } = e;
                  if (!over || active.id === over.id) return;
                  setModuleOrder((items) => {
                    const oldIndex = items.indexOf(String(active.id));
                    const newIndex = items.indexOf(String(over.id));
                    return arrayMove(items, oldIndex, newIndex);
                  });
                }}
              >
                <SortableContext items={moduleOrder} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2">
                    {moduleOrder.map((id) => (
                      <SortableItem key={id} id={id} label={MODULE_LABELS[id]} />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* SMM clips */}
          {showSmm && (
            <div className={cardCls}>
              <div className={sectionTitleCls}>// SMM Clips (optional)</div>

              <MediaDropzone
                label="Instagram Reel Clip"
                kind="clip"
                accept=".mp4,.mov,video/*"
                value={clipIg}
                onUpload={uploadMedia}
                onChange={setClipIg}
              />
              <div>
                <label className={labelCls}>Instagram Caption</label>
                <textarea
                  rows={3}
                  value={igCaption}
                  onChange={(e) => setIgCaption(e.target.value)}
                  placeholder="Write a caption with emojis and hashtags..."
                  className={`${inputCls} resize-y`}
                />
              </div>

              <MediaDropzone
                label="TikTok Clip"
                kind="clip"
                accept=".mp4,.mov,video/*"
                value={clipTt}
                onUpload={uploadMedia}
                onChange={setClipTt}
              />
              <div>
                <label className={labelCls}>TikTok Caption</label>
                <textarea
                  rows={3}
                  value={ttCaption}
                  onChange={(e) => setTtCaption(e.target.value)}
                  placeholder="Short, punchy hook with trending hashtags..."
                  className={`${inputCls} resize-y`}
                />
              </div>

              <MediaDropzone
                label="LinkedIn Clip"
                kind="clip"
                accept=".mp4,.mov,video/*"
                value={clipLi}
                onUpload={uploadMedia}
                onChange={setClipLi}
              />
              <div>
                <label className={labelCls}>LinkedIn Caption</label>
                <textarea
                  rows={3}
                  value={liCaption}
                  onChange={(e) => setLiCaption(e.target.value)}
                  placeholder="Write a professional caption..."
                  className={`${inputCls} resize-y`}
                />
              </div>
            </div>
          )}

          {/* Call to action */}
          <div className={cardCls}>
            <div className={sectionTitleCls}>// Call to Action</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>CTA Button Text</label>
                <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>CTA Link</label>
                <input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className={cardCls}>
            <div className={sectionTitleCls}>// ROI / Impact Estimator (optional)</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Estimated Monthly Listeners</label>
                <input value={estListeners} onChange={(e) => setEstListeners(e.target.value)} placeholder="500-800" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Estimated Reach Growth</label>
                <input value={estReachGrowth} onChange={(e) => setEstReachGrowth(e.target.value)} placeholder="3x in 90 days" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Estimated Time Saved</label>
                <input value={estTimeSaved} onChange={(e) => setEstTimeSaved(e.target.value)} placeholder="6 hrs/week" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Before / After */}
          <div className={cardCls}>
            <div className={sectionTitleCls}>// Before vs After (optional)</div>
            <div>
              <label className={labelCls}>Current State (Before)</label>
              <textarea rows={3} value={beforeState} onChange={(e) => setBeforeState(e.target.value)} placeholder="e.g. Blog posts with no audio presence, no podcast platform reach" className={`${inputCls} resize-y`} />
            </div>
            <div>
              <label className={labelCls}>With AnamDev (After)</label>
              <textarea rows={3} value={afterState} onChange={(e) => setAfterState(e.target.value)} placeholder="e.g. Weekly podcast live on Spotify, Apple Podcasts, and YouTube, plus ready-to-post social clips" className={`${inputCls} resize-y`} />
            </div>
          </div>

          {/* Contact */}
          <div className={cardCls}>
            <div className={sectionTitleCls}>// Claim This Setup (optional)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>WhatsApp Number</label>
                <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+8801XXXXXXXXX" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Booking Link (optional)</label>
                <input value={bookingLink} onChange={(e) => setBookingLink(e.target.value)} placeholder="https://calendly.com/…" className={inputCls} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEditing ? "Save Changes" : "Create Sample"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

// ---------------- Dropzone / helpers ----------------

function ImageDropzone({
  label,
  existingUrl,
  dataUrl,
  cleared,
  linkUrl,
  onFile,
  onLinkChange,
  onClear,
}: {
  label: string;
  existingUrl: string | null;
  dataUrl: string | null;
  cleared: boolean;
  linkUrl: string;
  onFile: (f: File) => void;
  onLinkChange: (v: string) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const shown = dataUrl || linkUrl.trim() || (cleared ? null : existingUrl);
  return (
    <div className="space-y-2">
      <label className={labelCls}>{label}</label>
      {shown ? (
        <div className="relative overflow-hidden rounded-md border border-white/[0.08] bg-[#0B0F1A]">
          <img src={shown} alt="" className="mx-auto max-h-40 object-contain p-4" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/70 text-white/80 hover:bg-black/90 hover:text-white"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[3/1] w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/[0.12] bg-[#0B0F1A] text-white/50 hover:border-[#3B82F6]/40 hover:text-white/80"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs">Click to upload</span>
        </button>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="…or paste a public image URL"
          value={linkUrl}
          onChange={(e) => onLinkChange(e.target.value)}
          className="flex-1 rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.08]"
        >
          <Upload className="h-3.5 w-3.5" /> Upload
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function MediaDropzone({
  label,
  kind,
  accept,
  value,
  onUpload,
  onChange,
  hint,
}: {
  label: string;
  kind: MediaKind;
  accept: string;
  value: string | null;
  onUpload: (kind: MediaKind, file: File) => Promise<string | null>;
  onChange: (url: string | null) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const Icon = kind === "audio" ? FileAudio : FileVideo;
  const isAudio = kind === "audio";

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const url = await onUpload(kind, file);
      if (url) onChange(url);
    } finally {
      setBusy(false);
    }
  };

  const isYoutube = value
    ? (() => {
        try {
          const h = new URL(value).hostname.replace(/^www\./, "");
          return h === "youtu.be" || h.endsWith("youtube.com");
        } catch {
          return false;
        }
      })()
    : false;

  return (
    <div className="space-y-2">
      <label className={labelCls}>{label}</label>
      {value ? (
        <div className="space-y-2 rounded-md border border-white/[0.08] bg-[#0B0F1A] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 text-xs text-white/70">
              <Icon className="h-4 w-4 shrink-0 text-[#3B82F6]" />
              <span className="truncate">{value.split("/").pop()?.split("?")[0] || value}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {isYoutube ? (
            <p className="text-[11px] text-white/45 font-mono break-all">
              YouTube link saved — will embed on preview
            </p>
          ) : isAudio ? (
            <audio src={value} controls className="w-full" preload="metadata" />
          ) : (
            <video src={value} controls preload="metadata" className="w-full rounded-md bg-black" style={{ maxHeight: 220 }} />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/[0.12] bg-[#0B0F1A] px-3 py-6 text-white/50 hover:border-[#3B82F6]/40 hover:text-white/80 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
          <span className="text-xs">Click to upload {isAudio ? "audio" : "video"}</span>
        </button>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="…or paste a public URL (YouTube, .mp4, .mp3)"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex-1 rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.08]"
        >
          <Upload className="h-3.5 w-3.5" /> Upload
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {hint && <p className="text-[11px] text-white/40">{hint}</p>}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/[0.08] bg-[#16181D] px-4 py-3">
      <span className="text-sm text-white/85">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SortableItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-md border border-white/[0.08] bg-[#16181D] px-4 py-3",
        isDragging && "opacity-60",
      )}
    >
      <button type="button" className="cursor-grab touch-none text-white/40" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <Check className="h-4 w-4 text-[#3B82F6]" />
      <span className="text-sm text-white/85">{label}</span>
    </li>
  );
}

// Copy icon export marker (avoids unused import in some tree-shakes)
export const _iconRefs = { Copy, ExternalLink };
