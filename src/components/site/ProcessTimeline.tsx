import * as React from "react";

export type TimelineStep = { title: string; description: string };

/**
 * Premium "Process — Step by Step" timeline used on all project detail pages.
 * - Gradient (blue→orange) circular step badges
 * - Continuous vertical connector line running through the badge centers
 * - Rows get a subtle hover highlight on desktop
 */
export function ProcessTimeline({ steps }: { steps: TimelineStep[] }) {
  if (!steps || steps.length === 0) return null;
  return (
    <ol className="relative mt-10">
      {/* Vertical connector — spans between the first and last badge centers.
          Badge is 44px (11 * 4). Vertical center = 22px from top of first row.
          Add bottom offset so the line stops at the LAST badge center, not
          running past the final step. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-[22px] top-[22px] bottom-[22px] w-px bg-[#1E293B]"
      />
      <div className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="group relative">
            <div className="flex items-start gap-5 rounded-xl px-2 py-4 transition-colors duration-200 sm:px-3 md:hover:bg-[#121A2E]/60">
              <span
                aria-hidden
                className="relative z-[1] inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--orange)] font-display text-[13px] font-bold text-white shadow-[0_6px_20px_-8px_var(--vo-glow)] ring-4 ring-background"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 pt-1.5">
                <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                  {s.title}
                </h3>
                {s.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                    {s.description}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </div>
    </ol>
  );
}
