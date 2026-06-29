import { useId } from "react";

/**
 * "Pricing Reveal Card" border treatment (updated pattern).
 *
 * Behavior:
 *   - Default (rest): the soft blue→orange ambient glow remains visible behind
 *     the card. The card's BORDER is fully invisible/transparent — no outline.
 *   - Hover: a blue→orange gradient border draws in around the perimeter
 *     (~1.2s, top-left → clockwise) via SVG stroke-dashoffset animation.
 *   - Hover-out: border fades back to invisible (no reverse trace).
 *   - reduced-motion: border is visible immediately on hover, no animation.
 *
 * Usage: place inside a card-shell element that already has its own
 *   background/padding/inner radius. Add `group/reveal` to that element so
 *   the named hover scope works without clashing with any existing `group`.
 *
 *   <div className="group/reveal relative rounded-[1.25rem] bg-... p-...">
 *     <RevealBorder rounded="rounded-[1.25rem]" radius={20} />
 *     {content}
 *   </div>
 *
 * Used by: Home $4,990 Signature Package card, DFY Builder Live Quote
 *   sidebar, Blog Featured Post card, Projects Featured Project spotlight,
 *   and the shared CtaRevealCard wrapper for closing CTAs.
 */
export function RevealBorder({
  rounded = "rounded-[1.25rem]",
  radius = 20,
}: {
  /** Tailwind rounded-* class matching the outer card radius. */
  rounded?: string;
  /** Pixel corner radius for the SVG stroke rect (match outer radius). */
  radius?: number;
}) {
  const reactId = useId();
  const gradId = `reveal-border-${reactId.replace(/[:]/g, "")}`;
  return (
    <>
      {/* Ambient glow — always visible */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-px ${rounded} bg-gradient-to-r from-[#3B82F6] via-[#3B82F6]/40 to-[#F97316] opacity-60 blur-2xl`}
      />
      {/* Draw-in gradient border — hidden at rest, traces on hover, fades on leave */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible opacity-0 transition-opacity duration-200 group-hover/reveal:opacity-100 group-focus-within/reveal:opacity-100 motion-reduce:transition-none"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx={radius}
          ry={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
          className="transition-[stroke-dashoffset] duration-[1200ms] ease-out group-hover/reveal:[stroke-dashoffset:0] group-focus-within/reveal:[stroke-dashoffset:0] motion-reduce:transition-none motion-reduce:group-hover/reveal:[stroke-dashoffset:0]"
        />
      </svg>
    </>
  );
}
