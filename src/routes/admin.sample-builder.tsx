import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
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
import { Check, Copy, ExternalLink, GripVertical, Loader2, Lock, Pencil, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  createMediaUploadUrl,
  createSample,
  getSampleForEdit,
  listSamples,
  updateSample,
  verifyPin,
} from "@/lib/sample-builder.functions";

type SearchParams = { id?: string };

export const Route = createFileRoute("/admin/sample-builder")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sample Preview Builder — AnamDev" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SampleBuilderPage,
});

const PIN_KEY = "anamdev.sample_pin";

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

function SampleBuilderPage() {
  const [pin, setPin] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPin(sessionStorage.getItem(PIN_KEY));
  }, []);

  if (!pin) return <PinGate onUnlock={(p) => setPin(p)} />;
  return <Builder pin={pin} onLock={() => { sessionStorage.removeItem(PIN_KEY); setPin(""); }} />;
}

function PinGate({ onUnlock }: { onUnlock: (pin: string) => void }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const verify = useServerFn(verifyPin);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            await verify({ data: { pin: value } });
            sessionStorage.setItem(PIN_KEY, value);
            onUnlock(value);
          } catch (err) {
            toast.error("Invalid PIN");
          } finally {
            setLoading(false);
          }
        }}
        className="card-elevated w-full max-w-sm p-8 space-y-5"
      >
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase tracking-wider">
          <Lock className="size-3.5" /> Admin Only
        </div>
        <h1 className="text-2xl">Sample Builder</h1>
        <div className="space-y-2">
          <Label htmlFor="pin">Enter PIN</Label>
          <Input
            id="pin"
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </div>
        <Button type="submit" disabled={loading || !value} className="btn-gradient w-full">
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Unlock"}
        </Button>
      </form>
    </main>
  );
}

type Sample = { id: string; slug: string; business_name: string; created_at: string };

function Builder({ pin, onLock }: { pin: string; onLock: () => void }) {
  const navigate = useNavigate({ from: "/admin/sample-builder" });
  const { id: editId } = useSearch({ from: "/admin/sample-builder" });

  const createFn = useServerFn(createSample);
  const updateFn = useServerFn(updateSample);
  const listFn = useServerFn(listSamples);
  const getFn = useServerFn(getSampleForEdit);
  const uploadUrlFn = useServerFn(createMediaUploadUrl);

  const isEditing = !!editId;

  const [businessName, setBusinessName] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["spotify", "apple", "youtube"]);
  const [showVideo, setShowVideo] = useState(true);
  const [showSmm, setShowSmm] = useState(true);
  const [ctaText, setCtaText] = useState("Get This Service →");
  const [ctaLink, setCtaLink] = useState("/services/ai-podcast");
  const [logoMode, setLogoMode] = useState<"upload" | "link">("upload");
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

  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [lastSlug, setLastSlug] = useState<string | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const refreshList = async () => {
    const res = await listFn({ data: { pin } });
    setSamples(res.samples as Sample[]);
    if (res.error) toast.error(res.error);
  };

  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load editing data
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    setLoadingEdit(true);
    getFn({ data: { pin, id: editId } })
      .then((res) => {
        if (cancelled) return;
        if (!res.sample) {
          toast.error(res.error || "Sample not found");
          return;
        }
        const s = res.sample;
        setBusinessName(s.business_name || "");
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
        setLogoMode("upload");
        setLogoCleared(false);
        setAudioUrl(s.audio_url);
        setVideoUrl(s.video_url);
        setClipIg(s.clip_instagram_url);
        setClipTt(s.clip_tiktok_url);
        setClipLi(s.clip_linkedin_url);
      })
      .finally(() => !cancelled && setLoadingEdit(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleLogoFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result as string);
      setLogoFilename(file.name);
      setLogoCleared(false);
    };
    reader.readAsDataURL(file);
  };

  const togglePlatform = (id: string) => {
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const uploadMedia = async (kind: MediaKind, file: File): Promise<string | null> => {
    const res = await uploadUrlFn({
      data: { pin, kind, filename: file.name, slugHint: businessName || undefined },
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
    // previewUrl is a freshly-signed URL that works immediately in the
    // admin form; it's stored verbatim and the public preview re-signs
    // the bucket+path on every render so links never go stale.
    return res.previewUrl;
  };

  const resetForm = () => {
    setBusinessName("");
    setEpisodeTitle("");
    setTopic("");
    setPlatforms(["spotify", "apple", "youtube"]);
    setShowVideo(true);
    setShowSmm(true);
    setCtaText("Get This Service →");
    setCtaLink("/services/ai-podcast");
    setLogoMode("upload");
    setLogoDataUrl(null);
    setLogoFilename(null);
    setLogoExistingUrl(null);
    setLogoLinkUrl("");
    setLogoCleared(false);
    setAudioUrl(null);
    setVideoUrl(null);
    setClipIg(null);
    setClipTt(null);
    setClipLi(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return toast.error("Business name required");
    if (platforms.length === 0) return toast.error("Select at least one platform");
    setSubmitting(true);
    try {
      // Resolve logo payload based on chosen mode.
      // - upload + new file: send base64+filename, server uploads and stores canonical URL.
      // - link mode with a URL: send logo_direct_url as the string to store.
      // - any mode with explicit clear: send logo_direct_url: null.
      // - else: leave all three undefined to keep the existing logo on update.
      const trimmedLink = logoLinkUrl.trim();
      let logoFields: {
        logo_base64?: string | null;
        logo_filename?: string | null;
        logo_direct_url?: string | null;
      } = {};
      if (logoMode === "upload" && logoDataUrl) {
        logoFields = { logo_base64: logoDataUrl, logo_filename: logoFilename };
      } else if (logoMode === "link" && trimmedLink) {
        logoFields = { logo_direct_url: trimmedLink };
      } else if (logoCleared) {
        logoFields = { logo_direct_url: null };
      }

      const basePayload = {
        pin,
        business_name: businessName,
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
      };

      const res = isEditing && editId
        ? await updateFn({ data: { ...basePayload, id: editId } as any })
        : await createFn({ data: basePayload as any });

      if (!res.ok || !res.slug) {
        toast.error(res.error || "Failed to save");
        return;
      }
      setLastSlug(res.slug);
      toast.success(isEditing ? "Sample updated" : "Sample created");
      refreshList();
      if (!isEditing) resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const lastUrl = lastSlug ? `${origin}/sample/${lastSlug}` : "";

  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              // ADMIN
            </p>
            <h1 className="text-3xl mt-1">
              {isEditing ? "Edit Sample" : "Sample Preview Builder"}
            </h1>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetForm();
                  navigate({ search: {} });
                }}
              >
                New Sample
              </Button>
            )}
            <Button variant="outline" onClick={onLock} size="sm">Lock</Button>
          </div>
        </header>

        {lastSlug && (
          <div className="card-elevated p-5 space-y-3">
            <p className="text-sm text-muted-foreground">Shareable link ready:</p>
            <div className="flex items-center gap-2 bg-secondary/40 rounded-md px-3 py-2 font-mono text-sm break-all">
              {lastUrl}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(lastUrl);
                  toast.success("Copied");
                }}
              >
                <Copy className="size-4" /> Copy Link
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`/sample/${lastSlug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" /> Open Preview
                </a>
              </Button>
            </div>
          </div>
        )}

        {loadingEdit ? (
          <div className="card-elevated p-10 flex justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card-elevated p-6 space-y-6">
            <Field label="Business / Brand Name *">
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
            </Field>

            <Field label="Logo">
              <ModeToggle mode={logoMode} onChange={(m) => { setLogoMode(m); setLogoCleared(false); }} />
              {logoMode === "upload" ? (
                <div className="flex items-center gap-4 mt-3">
                  {logoDataUrl ? (
                    <img src={logoDataUrl} alt="" className="size-16 rounded bg-white object-contain p-1" />
                  ) : logoExistingUrl && !logoCleared ? (
                    <img src={logoExistingUrl} alt="" className="size-16 rounded bg-white object-contain p-1" />
                  ) : (
                    <div className="size-16 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground">
                      <Upload className="size-5" />
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleLogoFile(f);
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    {logoDataUrl || (logoExistingUrl && !logoCleared) ? "Replace" : "Upload"}
                  </Button>
                  {(logoDataUrl || (logoExistingUrl && !logoCleared)) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLogoDataUrl(null);
                        setLogoFilename(null);
                        setLogoCleared(true);
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 mt-3">
                  <Input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={logoLinkUrl}
                    onChange={(e) => { setLogoLinkUrl(e.target.value); setLogoCleared(false); }}
                  />
                  {(logoLinkUrl.trim() || (logoExistingUrl && !logoCleared)) && (
                    <div className="flex items-center gap-3">
                      <img
                        src={logoLinkUrl.trim() || logoExistingUrl || ""}
                        alt=""
                        className="size-16 rounded bg-white object-contain p-1"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
                      />
                      {logoExistingUrl && !logoLinkUrl.trim() && !logoCleared && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setLogoCleared(true)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Field>


            <Field label="Episode Title">
              <Input
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                placeholder="Episode 1: From One Oven to Three Locations"
              />
            </Field>

            <Field label="Topic / Content">
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="5 Lessons From Scaling a Local Bakery to 3 Locations"
                rows={3}
              />
            </Field>

            <MediaUploadField
              label="Episode Audio File"
              accept=".mp3,.wav,.m4a,audio/*"
              kind="audio"
              previewType="audio"
              value={audioUrl}
              onUpload={uploadMedia}
              onChange={setAudioUrl}
              hint="Optional — upload the real podcast audio (.mp3, .wav, .m4a) to make Spotify and Apple play buttons functional."
            />

            <MediaUploadField
              label="Episode Video File"
              accept=".mp4,.mov,.webm,video/*"
              kind="video"
              previewType="video"
              value={videoUrl}
              onUpload={uploadMedia}
              onChange={setVideoUrl}
              hint="Optional — upload the full video episode to power the YouTube card and Video Podcast module."
            />

            <Field label="Podcast Platforms to Preview *">
              <div className="flex flex-wrap gap-4">
                {ALL_PLATFORMS.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={platforms.includes(p.id)}
                      onCheckedChange={() => togglePlatform(p.id)}
                    />
                    <span className="text-sm">{p.label}</span>
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ToggleRow label="Video Podcast Preview" checked={showVideo} onChange={setShowVideo} />
              <ToggleRow label="SMM Marketing Kit Preview" checked={showSmm} onChange={setShowSmm} />
            </div>

            {showSmm && (
              <div className="space-y-4 rounded-md border border-white/5 bg-secondary/20 p-4">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  // SMM clips (optional)
                </p>
                <MediaUploadField
                  label="Instagram Reel Clip"
                  accept=".mp4,.mov,video/*"
                  kind="clip"
                  previewType="video"
                  value={clipIg}
                  onUpload={uploadMedia}
                  onChange={setClipIg}
                  compact
                />
                <MediaUploadField
                  label="TikTok Clip"
                  accept=".mp4,.mov,video/*"
                  kind="clip"
                  previewType="video"
                  value={clipTt}
                  onUpload={uploadMedia}
                  onChange={setClipTt}
                  compact
                />
                <MediaUploadField
                  label="LinkedIn Clip"
                  accept=".mp4,.mov,video/*"
                  kind="clip"
                  previewType="video"
                  value={clipLi}
                  onUpload={uploadMedia}
                  onChange={setClipLi}
                  compact
                />
              </div>
            )}

            <Field label="Module Order (drag to reorder)">
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
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="CTA Button Text">
                <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
              </Field>
              <Field label="CTA Link">
                <Input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} />
              </Field>
            </div>

            <Button type="submit" className="btn-gradient w-full" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : isEditing ? "Save Changes" : "Create Sample"}
            </Button>
          </form>
        )}

        <section className="card-elevated p-6">
          <h2 className="text-lg mb-4">Previous Samples</h2>
          {samples.length === 0 ? (
            <p className="text-sm text-muted-foreground">No samples yet.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {samples.map((s) => {
                const url = `${origin}/sample/${s.slug}`;
                return (
                  <li key={s.id} className="py-3 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{s.business_name}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate">/sample/{s.slug}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigate({ search: { id: s.id } });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(url);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/sample/${s.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function MediaUploadField({
  label,
  accept,
  kind,
  previewType,
  value,
  onUpload,
  onChange,
  hint,
  compact,
}: {
  label: string;
  accept: string;
  kind: MediaKind;
  previewType: "audio" | "video";
  value: string | null;
  onUpload: (kind: MediaKind, file: File) => Promise<string | null>;
  onChange: (url: string | null) => void;
  hint?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await onUpload(kind, file);
      if (url) onChange(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className={cn("flex flex-wrap items-start gap-3", compact && "items-center")}>
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
          >
            <X className="size-4" /> Remove
          </Button>
        )}
        {value && (
          <div className={cn("w-full", compact ? "max-w-xs" : "max-w-md")}>
            {previewType === "audio" ? (
              <audio src={value} controls className="w-full" />
            ) : (
              <video src={value} controls className="w-full rounded-md bg-black" style={{ maxHeight: 200 }} />
            )}
          </div>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="flex items-center justify-between bg-secondary/30 rounded-md px-4 py-3">
      <span className="text-sm">{label}</span>
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
        "flex items-center gap-3 bg-secondary/40 rounded-md px-4 py-3 border border-white/5",
        isDragging && "opacity-60"
      )}
    >
      <button type="button" className="cursor-grab touch-none text-muted-foreground" {...attributes} {...listeners}>
        <GripVertical className="size-4" />
      </button>
      <Check className="size-4 text-primary" />
      <span className="text-sm">{label}</span>
    </li>
  );
}
