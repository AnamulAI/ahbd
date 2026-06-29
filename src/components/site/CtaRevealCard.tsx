import { cn } from "@/lib/utils";
import { RevealBorder } from "./RevealBorder";

/**
 * "Pricing Reveal Card" wrapping container — used for site-wide Closing CTA
 * sections and matches the $4,990 Signature Package card, the Package Builder
 * Live Quote sidebar, the Blog Featured Post card, and the Projects Featured
 * Project spotlight card.
 *
 * Updated behavior (see RevealBorder.tsx for the canonical spec):
 *   - Default: soft blue→orange ambient glow visible behind the card, border
 *     is INVISIBLE at rest.
 *   - Hover: blue→orange gradient border draws in around the perimeter
 *     (~650ms top-left → clockwise). Fades back out on hover-leave.
 */
export function CtaRevealCard({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div className={cn("group/reveal relative", className)}>
      <RevealBorder rounded="rounded-[1.25rem]" radius={20} />
      <div
        className={cn(
          "relative rounded-[1.25rem] bg-[oklch(0.15_0.02_260)] px-6 py-12 sm:px-10 sm:py-16",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
