import { useEffect, useState, useRef } from "react";
import { ChevronUp } from "lucide-react";

/**
 * Site-wide scroll UX:
 *  - Top gradient progress bar (blue → orange) tracking scroll depth.
 *  - Floating "scroll to top" button that fades in after the hero area.
 * Both respect prefers-reduced-motion.
 */
export function ScrollUX() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const compute = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = (doc.scrollHeight - doc.clientHeight) || 1;
      const p = Math.min(100, Math.max(0, (scrollTop / max) * 100));
      setProgress(p);
      setShowTop(scrollTop > 500);
      rafRef.current = null;
    };
    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleTop = () => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <>
      {/* Progress bar */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
      >
        <div
          className="h-full origin-left btn-gradient scroll-progress-bar"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>

      {/* Scroll-to-top */}
      <button
        type="button"
        onClick={handleTop}
        aria-label="Scroll to top"
        tabIndex={showTop ? 0 : -1}
        className={[
          "fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full",
          "border border-white/10 bg-[#16181D] text-foreground",
          "shadow-[0_15px_40px_-10px_var(--vo-glow)]",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-0.5 hover:border-[color:var(--primary)]/50 hover:shadow-[0_22px_55px_-10px_var(--vo-glow)]",
          "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-60 blur-md btn-gradient -z-10"
        />
        <ChevronUp className="h-5 w-5 text-white" strokeWidth={2.5} />
      </button>
    </>
  );
}

export default ScrollUX;
