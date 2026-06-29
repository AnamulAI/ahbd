import { useState, type RefObject } from "react";
import { Download, ImageDown, Loader2 } from "lucide-react";
import { shareCardAsImage } from "@/lib/share-card-as-image";

type Variant = "primary" | "secondary";

type Props = {
  /** Ref to the card DOM element that should be captured. */
  targetRef: RefObject<HTMLElement | null>;
  /** PNG filename (no extension). */
  filename: string;
  /** WhatsApp pre-fill message to send alongside the image. */
  waMessage: string;
  /** Visual variant. */
  variant?: Variant;
  /** Button label. */
  label?: string;
  /** Extra class names. */
  className?: string;
};

/**
 * Reusable share-as-image button. Renders the parent card as a PNG
 * and either shares it via the Web Share API (mobile) or downloads it
 * and opens WhatsApp with a short prompt (desktop / unsupported).
 *
 * Mark sibling action buttons with `data-share-exclude` so they are
 * stripped from the captured image.
 */
export function ShareQuoteButton({
  targetRef,
  filename,
  waMessage,
  variant = "primary",
  label = "Share Quote as Image",
  className = "",
}: Props) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!targetRef.current || busy) return;
    setBusy(true);
    try {
      await shareCardAsImage({
        node: targetRef.current,
        filename,
        waMessage,
      });
    } catch (err) {
      console.error("Share as image failed", err);
      // Best-effort fallback: open WhatsApp text only.
      window.open(
        `https://wa.me/8801777768353?text=${encodeURIComponent(waMessage)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } finally {
      setBusy(false);
    }
  };

  const base =
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all disabled:opacity-70";
  const variantClass =
    variant === "primary"
      ? "btn-gradient text-black shadow-[0_10px_30px_-12px_var(--vo-glow)] hover:scale-[1.02] hover:brightness-110"
      : "border border-[color:var(--primary)]/50 text-white hover:bg-[color:var(--primary)]/10";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      data-share-exclude
      className={[base, variantClass, className].join(" ")}
    >
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Generating image…
        </>
      ) : (
        <>
          {variant === "primary" ? (
            <ImageDown className="h-4 w-4" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          {label}
        </>
      )}
    </button>
  );
}
