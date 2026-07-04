import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Project, ProjectCategory } from "@/lib/projects-data";


type DbProjectRow = {
  id: string;
  slug: string;
  title: string;
  main_category: string;
  sub_category_label: string | null;
  cover_image_url: string | null;
  gallery_image_urls: string[] | null;
  description: string | null;
  tech_stack: string[] | null;
  live_url: string | null;
  is_featured: boolean | null;
  sort_order: number | null;
  created_at: string;
  challenge: string | null;
  solution: string | null;
  process_steps: unknown;
  result_stats: unknown;
  testimonial_quote: string | null;
  testimonial_name: string | null;
  testimonial_title: string | null;
};

const DB_TO_CATEGORY: Record<string, ProjectCategory> = {
  web_development: "Web Development",
  ai_integrator: "AI Integrator",
  ai_podcast: "AI Podcast",
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80";

function dbRowToProject(row: DbProjectRow): Project {
  const category = DB_TO_CATEGORY[row.main_category] ?? "Web Development";
  return {
    slug: row.slug,
    title: row.title,
    category,
    clientName: row.testimonial_name ?? "",
    industry: row.sub_category_label ?? "",
    coverImage: row.cover_image_url || DEFAULT_COVER,
    shortDescription: row.description ?? "",
    challenge: row.challenge ? [row.challenge] : [],
    solution: row.solution ? [row.solution] : [],
    techStack: row.tech_stack ?? [],
    results: [],
    galleryImages: row.gallery_image_urls ?? [],
    testimonial: {
      quote: row.testimonial_quote ?? "",
      name: row.testimonial_name ?? "",
      title: row.testimonial_title ?? "",
    },
    liveDemoUrl: row.live_url ?? "#",
  };
}

export async function fetchDbProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,slug,title,main_category,sub_category_label,cover_image_url,gallery_image_urls,description,tech_stack,live_url,is_featured,sort_order,created_at,challenge,solution,process_steps,result_stats,testimonial_quote,testimonial_name,testimonial_title",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as DbProjectRow[]).map(dbRowToProject);
}

function merge(dbProjects: Project[]): Project[] {
  const seen = new Set(dbProjects.map((p) => p.slug));
  const staticExtras = getAllProjects().filter((p) => !seen.has(p.slug));
  // DB projects first (newest admin work), then static seed projects.
  return [...dbProjects, ...staticExtras];
}

export function useAllProjects(): { projects: Project[]; loading: boolean } {
  const [projects, setProjects] = useState<Project[]>(() => merge([]));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetchDbProjects().then((db) => {
      if (!active) return;
      setProjects(merge(db));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  return { projects, loading };
}
