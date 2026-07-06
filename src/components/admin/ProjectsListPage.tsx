import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  FolderKanban,
  GripVertical,
  ExternalLink,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import {
  CATEGORY_OPTIONS,
  CATEGORY_COLOR,
  CATEGORY_LABEL,
} from "@/lib/admin-content-helpers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  title: string;
  slug: string;
  main_category: string;
  sub_category_label: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  sort_order: number;
};

const UNCATEGORIZED = "__uncategorized__";

export async function fetchSubCategoriesFor(mainCategory: string): Promise<string[]> {
  if (mainCategory === "web_development") {
    const { data } = await supabase
      .from("builder_use_cases")
      .select("label,is_active,display_order")
      .eq("is_active", true)
      .order("display_order");
    return (data ?? []).map((r) => r.label as string);
  }
  if (mainCategory === "ai_integrator") {
    const { data } = await supabase
      .from("builder_ai_types")
      .select("label,is_active,display_order")
      .eq("is_active", true)
      .order("display_order");
    return (data ?? []).map((r) => r.label as string);
  }
  if (mainCategory === "ai_podcast") {
    const { data } = await supabase
      .from("builder_podcast_types")
      .select("label,is_active,display_order")
      .eq("is_active", true)
      .order("display_order");
    return (data ?? []).map((r) => r.label as string);
  }
  return [];
}

export function ProjectsListPage() {
  const gate = useAdminGate();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as {
    main?: string;
    sub?: string;
  };
  const activeMain = searchParams.main ?? "web_development";
  const activeSub = searchParams.sub ?? "all";

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subList, setSubList] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("projects")
      .select("id,title,slug,main_category,sub_category_label,cover_image_url,is_featured,sort_order")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setProjects((data ?? []) as Project[]);
    setLoading(false);
  }

  useEffect(() => {
    if (gate.status === "ok") load();
  }, [gate.status]);

  useEffect(() => {
    fetchSubCategoriesFor(activeMain).then(setSubList);
  }, [activeMain]);

  const mainProjects = useMemo(
    () => projects.filter((p) => p.main_category === activeMain),
    [projects, activeMain],
  );

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: mainProjects.length, [UNCATEGORIZED]: 0 };
    for (const s of subList) out[s] = 0;
    for (const p of mainProjects) {
      const label = p.sub_category_label;
      if (label && subList.includes(label)) out[label] = (out[label] ?? 0) + 1;
      else out[UNCATEGORIZED] = (out[UNCATEGORIZED] ?? 0) + 1;
    }
    return out;
  }, [mainProjects, subList]);

  const mainCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of CATEGORY_OPTIONS) out[c.key] = 0;
    for (const p of projects) out[p.main_category] = (out[p.main_category] ?? 0) + 1;
    return out;
  }, [projects]);

  const filtered = useMemo(() => {
    return mainProjects
      .filter((p) => {
        if (activeSub === "all") return true;
        if (activeSub === UNCATEGORIZED)
          return !p.sub_category_label || !subList.includes(p.sub_category_label);
        return p.sub_category_label === activeSub;
      })
      .filter((p) =>
        search ? p.title.toLowerCase().includes(search.toLowerCase()) : true,
      );
  }, [mainProjects, activeSub, subList, search]);

  async function toggleFeatured(p: Project) {
    const next = !p.is_featured;
    setProjects((cur) => cur.map((x) => (x.id === p.id ? { ...x, is_featured: next } : x)));
    const { error } = await supabase.from("projects").update({ is_featured: next }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      load();
    }
  }

  async function doDelete() {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setConfirmDelete(null);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Project deleted");
    setProjects((cur) => cur.filter((p) => p.id !== id));
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = filtered.map((p) => p.id);
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(filtered, oldIdx, newIdx);
    // Build new sort_order ordering across the visible list, then merge back
    const idToNewOrder = new Map<string, number>();
    reordered.forEach((p, i) => idToNewOrder.set(p.id, i));
    setProjects((cur) =>
      cur.map((p) =>
        idToNewOrder.has(p.id) ? { ...p, sort_order: idToNewOrder.get(p.id)! } : p,
      ),
    );
    const updates = reordered.map((p, i) =>
      supabase.from("projects").update({ sort_order: i }).eq("id", p.id),
    );
    const results = await Promise.all(updates);
    const err = results.find((r) => r.error)?.error;
    if (err) {
      toast.error(err.message);
      load();
    }
  }

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  const activeMainLabel = CATEGORY_LABEL[activeMain] ?? "Projects";

  function setSub(next: string) {
    navigate({
      to: "/admin/projects",
      search: { main: activeMain, sub: next === "all" ? undefined : next },
    });
  }

  return (
    <AdminShell email={gate.email}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
            // projects
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
            {activeMainLabel}
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Manage your {activeMainLabel} portfolio — drag to reorder within a sub-category.
          </p>
        </div>
        <Link
          to="/admin/projects/new"
          search={{ main: activeMain, sub: activeSub === "all" ? "" : activeSub === UNCATEGORIZED ? "" : activeSub }}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </div>

      {/* Sub-category tab row (Builder Settings pattern) */}
      <div className="mt-6 mb-2 flex flex-wrap gap-1.5 border-b border-white/[0.06] pb-2">
        <SubTab label="All" value="all" active={activeSub === "all"} count={counts.all ?? 0} onClick={setSub} />
        {subList.map((s) => (
          <SubTab
            key={s}
            label={s}
            value={s}
            active={activeSub === s}
            count={counts[s] ?? 0}
            onClick={setSub}
          />
        ))}
        {(counts[UNCATEGORIZED] ?? 0) > 0 && (
          <SubTab
            label="Uncategorized"
            value={UNCATEGORIZED}
            active={activeSub === UNCATEGORIZED}
            count={counts[UNCATEGORIZED] ?? 0}
            onClick={setSub}
            warn
          />
        )}
      </div>

      <div className="mt-4 max-w-sm relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="w-full rounded-md border border-white/[0.1] bg-[#16181D] pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors duration-[250ms] ease hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
        />
      </div>


      <div className="mt-5 card-elevated card-elevated-hover overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-white/50">
              <FolderKanban className="h-5 w-5" />
            </div>
            <p className="text-sm text-white/60">No projects in this view yet.</p>
            <Link
              to="/admin/projects/new"
              search={{ main: activeMain, sub: activeSub === "all" || activeSub === UNCATEGORIZED ? "" : activeSub }}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Add Project
            </Link>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-white/[0.05]">
                {filtered.map((p) => (
                  <SortableRow
                    key={p.id}
                    project={p}
                    onToggleFeatured={() => toggleFeatured(p)}
                    onDelete={() => setConfirmDelete(p)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.title}” will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function SubTab({
  label,
  value,
  active,
  count,
  onClick,
  warn,
}: {
  label: string;
  value: string;
  active: boolean;
  count: number;
  onClick: (v: string) => void;
  warn?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors border",
        active
          ? "bg-[#3B82F6]/20 text-white border-[#3B82F6]/50"
          : warn
            ? "border-amber-500/30 bg-amber-500/[0.06] text-amber-200/80 hover:bg-amber-500/[0.12]"
            : "text-white/60 hover:text-white hover:bg-white/[0.05] border-transparent",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-mono",
          active ? "bg-white/15 text-white/90" : "bg-white/[0.06] text-white/55",
        )}
      >
        {count}
      </span>
    </button>
  );
}


function SortableRow({
  project,
  onToggleFeatured,
  onDelete,
}: {
  project: Project;
  onToggleFeatured: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-white/30 hover:text-white/60 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="h-12 w-16 overflow-hidden rounded-md bg-[#0B0F1A] border border-white/[0.06] shrink-0">
        {project.cover_image_url && (
          <img src={project.cover_image_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          to="/admin/projects/$id"
          params={{ id: project.id }}
          className="block truncate text-sm font-medium text-white hover:text-[#3B82F6]"
        >
          {project.title}
        </Link>
        <div className="truncate text-[11px] text-white/45">
          <span style={{ color: CATEGORY_COLOR[project.main_category] }}>
            {CATEGORY_OPTIONS.find((c) => c.key === project.main_category)?.label}
          </span>
          {project.sub_category_label && (
            <>
              <span className="mx-1.5 text-white/30">·</span>
              {project.sub_category_label}
            </>
          )}
          <span className="mx-1.5 text-white/30">·</span>/{project.slug}
        </div>
      </div>
      <a
        href={`/projects/${project.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-white/50 transition-colors hover:text-[#3B82F6]"
        aria-label={`View ${project.title} live in a new tab`}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        <span>View Live</span>
      </a>
      <button
        type="button"
        onClick={onToggleFeatured}
        aria-label="Toggle featured"
        className={project.is_featured ? "text-[#F97316]" : "text-white/30 hover:text-white/60"}
      >
        <Star className="h-4 w-4" fill={project.is_featured ? "currentColor" : "none"} />
      </button>

      <Link
        to="/admin/projects/$id"
        params={{ id: project.id }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
