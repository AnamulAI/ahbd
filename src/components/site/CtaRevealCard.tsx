import { cn } from "@/lib/utils";

/**
 * Pricing Reveal Card border/glow treatment — used as the wrapping container
 * for site-wide Closing CTA sections. Matches the $4,990 Signature Package card
 * and the Package Builder Live Quote sidebar.
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
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="absolute -inset-px rounded-[1.25rem] bg-gradient-to-r from-[#3B82F6] via-[#3B82F6]/40 to-[#F97316] opacity-60 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute -inset-px rounded-[1.25rem] bg-gradient-to-r from-[#3B82F6] to-[#F97316] opacity-80"
      />
      <div
        className={cn(
          "relative rounded-[1.15rem] bg-[oklch(0.15_0.02_260)] px-6 py-12 sm:px-10 sm:py-16",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
