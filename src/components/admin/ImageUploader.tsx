import { useRef, useState } from "react";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";
import { uploadContentImage } from "@/lib/admin-content-helpers";
import { toast } from "sonner";

export function ImageUploader({
  value,
  onChange,
  label = "Cover image",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const url = await uploadContentImage(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-mono uppercase tracking-wider text-white/60">{label}</label>
      {value ? (
        <div className="relative overflow-hidden rounded-md border border-white/[0.08] bg-[#0B0F1A]">
          <img src={value} alt="" className="aspect-video w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/70 text-white/80 hover:bg-black/90 hover:text-white"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/[0.12] bg-[#0B0F1A] text-white/50 hover:border-[#3B82F6]/40 hover:text-white/80 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs">Click to upload</span>
            </>
          )}
        </button>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="…or paste an image URL"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex-1 rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-[#3B82F6]/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.08]"
        >
          <Upload className="h-3.5 w-3.5" /> Upload
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
