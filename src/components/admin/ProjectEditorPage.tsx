import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, ArrowLeft, Save, Plus, X, Upload, GripVertical } from "lucide-react";
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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { TagInput } from "@/components/admin/TagInput";
import {
  CATEGORY_OPTIONS,
  slugify,
  uploadContentImage,
} from "@/lib/admin-content-helpers";
import { fetchSubCategoriesFor } from "@/components/admin/ProjectsListPage";

type Project = {
  id?: string;
  title: string;
  slug: string;
  main_category: string;
  sub_category_label: string | null;
  cover_image_url: string | null;
  gallery_image_urls: string[];
  description: string;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
  is_featured: boolean;
  sort_order: number;
};

const EMPTY: Project = {
  title: "",
  slug: "",
  main_category: "web_development",
  sub_category_label: null,
  cover_image_url: null,
  gallery_image_urls: [],
  description: "",
  tech_stack: [],
  live_url: "",
  github_url: "",
  is_featured: false,
  sort_order: 0,
};

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
        setProject(data as Project);
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
    const payload = {
      title: project.title.trim(),
      slug: project.slug.trim(),
      main_category: project.main_category,
      sub_category_label: project.sub_category_label || null,
      cover_image_url: project.cover_image_url,
      gallery_image_urls: project.gallery_image_urls,
      description: project.description || null,
      tech_stack: project.tech_stack,
      live_url: project.live_url || null,
      github_url: project.github_url || null,
      is_featured: project.is_featured,
      sort_order: project.sort_order,
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
      navigate({ to: "/admin/projects" });
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

  return (
    <AdminShell email={gate.email}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/projects" })}
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
            <label className={labelCls}>Tech stack</label>
            <TagInput
              value={project.tech_stack}
              onChange={(v) => update("tech_stack", v)}
              placeholder="Add a tech tag (e.g. React)…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Live URL</label>
              <input
                value={project.live_url ?? ""}
                onChange={(e) => update("live_url", e.target.value)}
                placeholder="https://"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>GitHub URL</label>
              <input
                value={project.github_url ?? ""}
                onChange={(e) => update("github_url", e.target.value)}
                placeholder="https://github.com/…"
                className={inputCls}
              />
            </div>
          </div>
          <GalleryEditor
            value={project.gallery_image_urls}
            onChange={(v) => update("gallery_image_urls", v)}
          />
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
