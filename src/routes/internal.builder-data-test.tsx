import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/internal/builder-data-test")({
  component: BuilderDataTest,
});

const ORDERED_TABLES = [
  "builder_categories",
  "builder_tech_approaches",
  "builder_use_cases",
  "builder_tiers",
  "builder_options",
  "builder_ai_types",
  "builder_podcast_types",
] as const;

type PricingRow = {
  id: string;
  use_case_id: string;
  tech_approach_id: string;
  base_price: number;
  is_available: boolean;
  use_case_label: string;
  tech_label: string;
};

function BuilderDataTest() {
  const [data, setData] = useState<Record<string, unknown[]>>({});
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result: Record<string, unknown[]> = {};
      const errs: Record<string, string> = {};

      for (const t of ORDERED_TABLES) {
        const { data: rows, error } = await supabase
          .from(t as never)
          .select("*")
          .order("display_order", { ascending: true });
        if (error) errs[t] = error.message;
        else result[t] = rows ?? [];
      }

      // Pricing has no display_order; fetch with joined labels for readability.
      const { data: priceRows, error: priceErr } = await supabase
        .from("builder_use_case_pricing")
        .select(
          "id, use_case_id, tech_approach_id, base_price, is_available, " +
            "builder_use_cases(label), builder_tech_approaches(label)",
        );
      if (priceErr) {
        errs["builder_use_case_pricing"] = priceErr.message;
      } else {
        setPricing(
          (priceRows ?? []).map((r: any) => ({
            id: r.id,
            use_case_id: r.use_case_id,
            tech_approach_id: r.tech_approach_id,
            base_price: r.base_price,
            is_available: r.is_available,
            use_case_label: r.builder_use_cases?.label ?? "(unknown)",
            tech_label: r.builder_tech_approaches?.label ?? "(unknown)",
          })),
        );
      }

      setData(result);
      setErrors(errs);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ padding: 24, fontFamily: "monospace" }}>Loading…</div>;

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "monospace",
        color: "#ddd",
        background: "#0A0E1A",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Builder Data Test (internal)</h1>

      {ORDERED_TABLES.map((t) => (
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

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, color: "#3B82F6", borderBottom: "1px solid #333", paddingBottom: 4 }}>
          builder_use_case_pricing ({pricing.length})
        </h2>
        {errors["builder_use_case_pricing"] && (
          <pre style={{ color: "#F97316" }}>error: {errors["builder_use_case_pricing"]}</pre>
        )}
        <ul style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7, paddingLeft: 18 }}>
          {pricing
            .slice()
            .sort((a, b) =>
              a.use_case_label === b.use_case_label
                ? a.tech_label.localeCompare(b.tech_label)
                : a.use_case_label.localeCompare(b.use_case_label),
            )
            .map((r) => (
              <li key={r.id} style={{ opacity: r.is_available ? 1 : 0.55 }}>
                {r.use_case_label} × {r.tech_label} — ${Number(r.base_price).toLocaleString()}
                {!r.is_available && <span style={{ color: "#F97316" }}> (unavailable)</span>}
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
