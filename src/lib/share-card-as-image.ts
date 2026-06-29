import { toPng } from "html-to-image";

const WA_NUMBER = "8801777768353";
const CARD_BG = "#16181D";

export type ShareCardOptions = {
  /** The card DOM element to capture. */
  node: HTMLElement;
  /** Filename for the PNG download (without extension). */
  filename: string;
  /** Pre-filled WhatsApp message that opens after the image is generated. */
  waMessage: string;
  /** Background color for the captured image (defaults to site card bg). */
  backgroundColor?: string;
  /** Padding around the captured card in CSS pixels (defaults to 32). */
  padding?: number;
};

/**
 * Filter callback for html-to-image: drop any element marked
 * with data-share-exclude so action buttons don't appear in the
 * generated image.
 */
function shareFilter(node: HTMLElement) {
  if (!(node instanceof HTMLElement)) return true;
  if (node.dataset && node.dataset.shareExclude !== undefined) return false;
  return true;
}

/**
 * Render the given DOM node to a padded PNG data URL.
 */
async function renderCardToPngDataUrl({
  node,
  backgroundColor = CARD_BG,
  padding = 32,
}: Pick<ShareCardOptions, "node" | "backgroundColor" | "padding">) {
  // Capture card itself at 2x for crispness.
  const innerDataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor,
    filter: shareFilter,
  });

  // Compose onto a padded canvas with the dark background so the
  // image doesn't look tight-cropped on WhatsApp.
  const img = new Image();
  img.src = innerDataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load captured image"));
  });

  const dpr = 2;
  const padPx = padding * dpr;
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth + padPx * 2;
  canvas.height = img.naturalHeight + padPx * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2d context unavailable");
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, padPx, padPx);

  return canvas.toDataURL("image/png");
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function openWhatsApp(waMessage: string) {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Capture the given card element as a PNG and share it.
 *
 * Behavior:
 *   1. Generate the PNG client-side.
 *   2. If the device supports navigator.share with file attachments,
 *      use the native share sheet (smooth one-tap on mobile).
 *   3. Otherwise download the PNG and open WhatsApp with a short
 *      prompt so the user can manually attach the just-downloaded file.
 */
export async function shareCardAsImage(opts: ShareCardOptions) {
  const dataUrl = await renderCardToPngDataUrl(opts);
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], `${opts.filename}.png`, { type: "image/png" });

  const navAny = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files?: File[]; text?: string; title?: string }) => Promise<void>;
  };

  if (
    typeof navAny.canShare === "function" &&
    navAny.canShare({ files: [file] }) &&
    typeof navAny.share === "function"
  ) {
    try {
      await navAny.share({
        files: [file],
        text: opts.waMessage,
        title: "Custom quote",
      });
      return { method: "web-share" as const };
    } catch (err) {
      // User cancelled or share failed — fall through to download flow.
      if ((err as DOMException)?.name === "AbortError") {
        return { method: "cancelled" as const };
      }
    }
  }

  triggerDownload(dataUrl, opts.filename);
  openWhatsApp(
    `${opts.waMessage}\n\n(Image of my custom quote is attached — saved to your device.)`,
  );
  return { method: "download" as const };
}
