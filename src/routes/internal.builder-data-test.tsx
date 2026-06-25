import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/internal/builder-data-test")({
  component: BuilderDataTest,
});

const TABLES = [
  "builder_categories",
  "builder_tech_approaches",
  "builder_use_cases",
  "builder_use_case_pricing",
  "builder_tiers",
  "builder_options",
  "builder_ai_types",
  "builder_podcast_types",
] as const;

function BuilderDataTest() {
  const [data, setData] = useState<Record<string, unknown[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result: Record<string, unknown[]> = {};
      const errs: Record<string, string> = {};
      for (const t of TABLES) {
        const { data: rows, error } = await supabase
          .from(t as never)
          .select("*")
          .order("display_order", { ascending: true });
        if (error) errs[t] = error.message;
        else result[t] = rows ?? [];
      }
      setData(result);
      setErrors(errs);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ padding: 24, fontFamily: "monospace" }}>Loading…</div>;

  return (
    <div style={{ padding: 24, fontFamily: "monospace", color: "#ddd", background: "#0A0E1A", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Builder Data Test (internal)</h1>
      {TABLES.map((t) => (
        <section key={t} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, color: "#3B82F6", borderBottom: "1px solid #333", paddingBottom: 4 }}>
            {t} {data[t] ? `(${data[t].length})` : ""}
          </h2>
          {errors[t] && <pre style={{ color: "#F97316" }}>error: {errors[t]}</pre>}
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, marginTop: 8 }}>
            {JSON.stringify(data[t] ?? [], null, 2)}
          </pre>
        </section>
      ))}
    </div>
  );
}
