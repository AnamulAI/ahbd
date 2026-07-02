import * as React from "react";

/**
 * "Built for" client logo/photo badge rendered above the project title in
 * the shared hero header. Returns null when no logo is provided so the layout
 * collapses cleanly.
 */
export function ClientLogoBadge({
  logoUrl,
  clientName,
}: {
  logoUrl: string | null | undefined;
  clientName?: string | null;
}) {
  if (!logoUrl) return null;
  const name = clientName?.trim() || "";
  return (
    <div className="mb-5 flex items-center justify-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Built for
      </span>
      <span
        aria-hidden
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.04] shadow-[0_6px_20px_-8px_rgba(59,130,246,0.4)] sm:h-14 sm:w-14"
      >
        <img
          src={logoUrl}
          alt={name ? `${name} logo` : "Client logo"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </span>
      {name && (
        <span className="text-sm font-semibold text-white/90">{name}</span>
      )}
    </div>
  );
}
