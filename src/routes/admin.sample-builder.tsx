import { createFileRoute } from "@tanstack/react-router";
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
import { Check, Copy, ExternalLink, GripVertical, Loader2, Lock, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  createSample,
  listSamples,
  verifyPin,
} from "@/lib/sample-builder.functions";

export const Route = createFileRoute("/admin/sample-builder")({
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

function SampleBuilderPage() {
  const [pin, setPin] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPin(sessionStorage.getItem(PIN_KEY));
  }, []);

  if (pin === null && typeof window !== "undefined" && !sessionStorage.getItem(PIN_KEY)) {
    return <PinGate onUnlock={(p) => setPin(p)} />;
  }
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
  const createFn = useServerFn(createSample);
  const listFn = useServerFn(listSamples);

  const [businessName, setBusinessName] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["spotify", "apple", "youtube"]);
  const [showVideo, setShowVideo] = useState(true);
  const [showSmm, setShowSmm] = useState(true);
  const [ctaText, setCtaText] = useState("Get This Service →");
  const [ctaLink, setCtaLink] = useState("/services/ai-podcast");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoFilename, setLogoFilename] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSlug, setLastSlug] = useState<string | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Module order: include modules dynamically based on toggles
  const activeModules = useMemo(() => {
    const base: string[] = [];
    if (platforms.length > 0) base.push("platforms");
    if (showVideo) base.push("video");
    if (showSmm) base.push("smm");
    return base;
  }, [platforms.length, showVideo, showSmm]);

  const [moduleOrder, setModuleOrder] = useState<string[]>(["platforms", "video", "smm"]);

  // Keep moduleOrder in sync with active modules (preserving order)
  useEffect(() => {
    setModuleOrder((prev) => {
      const filtered = prev.filter((m) => activeModules.includes(m));
      for (const m of activeModules) if (!filtered.includes(m)) filtered.push(m);
      return filtered;
    });
  }, [activeModules]);

  const refreshList = async () => {
    try {
      const res = await listFn({ data: { pin } });
      setSamples(res.samples as Sample[]);
    } catch (err) {
      toast.error("Could not load samples");
    }
  };

  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result as string);
      setLogoFilename(file.name);
    };
    reader.readAsDataURL(file);
  };

  const togglePlatform = (id: string) => {
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return toast.error("Business name required");
    if (platforms.length === 0) return toast.error("Select at least one platform");
    setSubmitting(true);
    try {
      const res = await createFn({
        data: {
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
          logo_base64: logoDataUrl,
          logo_filename: logoFilename,
        },
      });
      setLastSlug(res.slug);
      toast.success("Sample created");
      refreshList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
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
            <h1 className="text-3xl mt-1">Sample Preview Builder</h1>
          </div>
          <Button variant="outline" onClick={onLock} size="sm">Lock</Button>
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

        <form onSubmit={onSubmit} className="card-elevated p-6 space-y-6">
          <Field label="Business / Brand Name *">
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
          </Field>

          <Field label="Logo Upload">
            <div className="flex items-center gap-4">
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="" className="size-16 rounded bg-white object-contain p-1" />
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
                  if (f) handleFile(f);
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                {logoDataUrl ? "Replace" : "Upload"}
              </Button>
              {logoDataUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setLogoDataUrl(null); setLogoFilename(null); }}>
                  Remove
                </Button>
              )}
            </div>
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
            {submitting ? <Loader2 className="size-4 animate-spin" /> : "Create Sample"}
          </Button>
        </form>

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
