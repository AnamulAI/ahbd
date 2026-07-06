/** Converts an image File to WebP entirely in the browser (Canvas API) before
 *  upload — no server round trip, no new dependency. Returns both the Blob
 *  (for size reporting) and a base64 data URL (for sending to the server fn). */
export async function convertImageToWebP(
  file: File,
  quality = 0.82,
): Promise<{ blob: Blob; dataUrl: string }> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("WebP conversion failed"))),
      "image/webp",
      quality,
    );
  });

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Could not read converted image"));
    reader.readAsDataURL(blob);
  });

  return { blob, dataUrl };
}
