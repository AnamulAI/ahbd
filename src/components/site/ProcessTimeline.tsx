import * as React from "react";

export type TimelineStep = { title: string; description: string };

/**
 * Premium "Process — Step by Step" timeline used on all project detail pages.
 * - Gradient (blue→orange) circular step badges
 * - Continuous vertical connector line that PROGRESSIVELY FILLS as each step
 *   scrolls into view (IntersectionObserver). Fill only advances — it never
 *   reverses when the user scrolls back up.
 */
export function ProcessTimeline({ steps }: { steps: TimelineStep[] }) {
  const containerRef = React.useRef<HTMLOListElement | null>(null);
  const badgeRefs = React.useRef<Array<HTMLSpanElement | null>>([]);
  const [reached, setReached] = React.useState(0); // highest step index reached

  React.useEffect(() => {
    if (!steps || steps.length === 0) return;
    const observers: IntersectionObserver[] = [];
    badgeRefs.current.forEach((el, i) => {
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setReached((r) => (i > r ? i : r));
            }
          }
        },
        { rootMargin: "0px 0px -35% 0px", threshold: 0.1 },
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [steps]);

  if (!steps || steps.length === 0) return null;

  const total = steps.length;
  // Height percentage of filled line: 0% at step 0, 100% at last step reached.
  const fillPct = total <= 1 ? 100 : Math.min(100, (reached / (total - 1)) * 100);

  return (
    <ol ref={containerRef} className="relative mt-10">
      {/* Base (unfilled) line */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-[22px] top-[22px] bottom-[22px] w-px bg-[#1E293B]"
      />
      {/* Progressive gradient fill */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-[22px] top-[22px] w-px bg-gradient-to-b from-[color:var(--primary)] to-[color:var(--orange)] transition-[height] duration-500 ease-out"
        style={{ height: `calc((100% - 44px) * ${fillPct / 100})` }}
      />
      <div className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="group relative">
            <div className="flex items-start gap-5 rounded-xl px-2 py-4 transition-colors duration-200 sm:px-3 md:hover:bg-[#121A2E]/60">
              <span
                ref={(el) => {
                  badgeRefs.current[i] = el;
                }}
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
