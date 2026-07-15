import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BlogCategory = {
  key: string;
  label: string;
  color: string;
  sort_order: number;
};

const FALLBACK: BlogCategory[] = [
  { key: "web_development", label: "Web Development", color: "#3B82F6", sort_order: 10 },
  { key: "ai_integrator", label: "AI Integrator", color: "#F97316", sort_order: 20 },
  { key: "ai_podcast", label: "AI Podcast", color: "#22C55E", sort_order: 30 },
];

export function useBlogCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("blog_categories")
      .select("key,label,color,sort_order")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true });
    if (!error && data && data.length) setCategories(data as BlogCategory[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const labelOf = (key: string) =>
    categories.find((c) => c.key === key)?.label ?? key;
  const colorOf = (key: string) =>
    categories.find((c) => c.key === key)?.color ?? "#64748B";

  return { categories, loading, reload: load, labelOf, colorOf };
}
