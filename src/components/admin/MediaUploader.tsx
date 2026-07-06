import { useRef, useState } from "react";
import { Upload, X, Loader2, FileAudio, FileVideo } from "lucide-react";
import { uploadPodcastMedia } from "@/lib/admin-content-helpers";
import { toast } from "sonner";

type MediaKind = "audio" | "video";

export function MediaUploader({
  value,
  onChange,
  kind,
  label,
  accept,
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  kind: MediaKind;
  label: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const url = await uploadPodcastMedia(file);
      onChange(url);
      toast.success(`${label} uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const Icon = kind === "audio" ? FileAudio : FileVideo;
  const acceptStr =
    accept ??
    (kind === "audio" ? "audio/mpeg,audio/wav,audio/mp4,.mp3,.wav,.m4a" : "video/mp4,.mp4");

  return (
    <div className="space-y-2">
      <label className="block text-xs font-mono uppercase tracking-wider text-white/60">
        {label}
      </label>

      {value ? (
        <div className="space-y-2 rounded-md border border-white/[0.08] bg-[#0B0F1A] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 text-xs text-white/70">
              <Icon className="h-4 w-4 shrink-0 text-[#3B82F6]" />
              <span className="truncate">{value.split("/").pop()?.split("?")[0]}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-300"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {kind === "audio" ? (
            <audio src={value} controls className="w-full" preload="metadata" />
          ) : (
            <video
              src={value}
              controls
              preload="metadata"
              className="w-full rounded-md bg-black"
              style={{ maxHeight: 220 }}
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/[0.12] bg-[#0B0F1A] px-3 py-6 text-white/50 transition-colors duration-[250ms] ease hover:border-[#3B82F6]/60 hover:bg-[#3B82F6]/[0.05] hover:text-[#3B82F6] disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Icon className="h-5 w-5" />
              <span className="text-xs">Click to upload {kind === "audio" ? "audio" : "video"}</span>
            </>
          )}
        </button>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="…or paste a public URL"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex-1 rounded-md border border-white/[0.1] bg-[#16181D] px-3 py-1.5 text-xs text-white placeholder:text-white/30 transition-colors duration-[250ms] ease hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
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
        accept={acceptStr}
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
