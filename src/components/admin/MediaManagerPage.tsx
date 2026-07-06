import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Images,
  HardDrive,
  Copy,
  Trash2,
  UploadCloud,
  Search,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell, useAdminGate } from "@/components/admin/AdminShell";
import { useMyProfile } from "@/hooks/use-my-permissions";
import {
  listMediaImages,
  getMediaStorageUsage,
  uploadMediaImage,
  deleteMediaImage,
  STORAGE_QUOTA_BYTES,
  type ImageBucket,
  type MediaImage,
} from "@/lib/media-manager.functions";
import { fmtBytes } from "@/lib/admin-content-helpers";
import { convertImageToWebP } from "@/lib/image-webp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BUCKET_LABELS: Record<ImageBucket, string> = {
  "profile-avatars": "Profile Avatars",
  "content-images": "Content Images",
  "sample-logos": "Sample Logos",
};

const BUCKET_SHORT: Record<ImageBucket, string> = {
  "profile-avatars": "Avatar",
  "content-images": "Content",
  "sample-logos": "Logo",
};

const FILTER_OPTIONS: { key: ImageBucket | "all"; label: string }[] = [
  { key: "all", label: "All Images" },
  { key: "profile-avatars", label: "Profile Avatars" },
  { key: "content-images", label: "Content Images" },
  { key: "sample-logos", label: "Sample Logos" },
];

export function MediaManagerPage() {
  const gate = useAdminGate();
  const { data: profile } = useMyProfile();
  const qc = useQueryClient();

  const [bucketFilter, setBucketFilter] = useState<ImageBucket | "all">("all");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<MediaImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const listFn = useServerFn(listMediaImages);
  const usageFn = useServerFn(getMediaStorageUsage);
  const uploadFn = useServerFn(uploadMediaImage);
  const deleteFn = useServerFn(deleteMediaImage);

  const canAccess = !profile || profile.is_primary_owner || Boolean(profile.sections.media_manager);

  const imagesQuery = useQuery({
    queryKey: ["media-images"],
    queryFn: () => listFn(),
    enabled: gate.status === "ok" && canAccess,
  });
  const usageQuery = useQuery({
    queryKey: ["media-usage"],
    queryFn: () => usageFn(),
    enabled: gate.status === "ok" && canAccess,
  });

  const loadError = imagesQuery.data && !imagesQuery.data.ok ? imagesQuery.data.error : null;

  const filtered = useMemo(() => {
    const images = imagesQuery.data?.ok ? imagesQuery.data.images : [];
    return images.filter((img) => {
      if (bucketFilter !== "all" && img.bucket !== bucketFilter) return false;
      if (search && !img.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [imagesQuery.data, bucketFilter, search]);

  const uploadTargetBucket: ImageBucket = bucketFilter === "all" ? "content-images" : bucketFilter;

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["media-images"] });
    qc.invalidateQueries({ queryKey: ["media-usage"] });
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const { dataUrl } = await convertImageToWebP(file);
      const filename = `${file.name.replace(/\.[^./]+$/, "")}.webp`;
      const res = await uploadFn({
        data: { bucket: uploadTargetBucket, filename, base64: dataUrl },
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Image uploaded (converted to WebP)");
      invalidateAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setConfirmDelete(null);
    const res = await deleteFn({ data: { bucket: target.bucket, name: target.name } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Image deleted");
    invalidateAll();
  }

  async function handleCopyLink(img: MediaImage) {
    await navigator.clipboard.writeText(img.url);
    toast.success("Link copied");
  }

  if (gate.status !== "ok") {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  const usage = usageQuery.data;
  const usedBytes = usage?.ok ? usage.totalBytes : 0;
  const quotaBytes = usage?.ok ? usage.quotaBytes : STORAGE_QUOTA_BYTES;
  const usagePct = Math.min(100, (usedBytes / quotaBytes) * 100);
  const usageBarColor =
    usagePct >= 90
      ? "from-red-500 to-red-600"
      : usagePct >= 70
        ? "from-amber-500 to-orange-500"
        : "from-[#3B82F6] to-[#F97316]";

  return (
    <AdminShell email={gate.email}>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3B82F6]">
          // media manager
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
          Media Manager
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Browse, upload, and manage images across every image bucket.
        </p>
      </div>

      <div className="mt-6 card-elevated p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
              Storage Used
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-white">
              {fmtBytes(usedBytes)}
              <span className="ml-1.5 text-sm font-normal text-white/40">
                / {fmtBytes(quotaBytes)}
              </span>
            </div>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[#3B82F6]/15 text-[#3B82F6] ring-1 ring-[#3B82F6]/30">
            <HardDrive className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${usageBarColor} transition-all`}
            style={{ width: `${usagePct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          Computed from object sizes across all 7 storage buckets (Supabase Free Plan quota).
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-1.5">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setBucketFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                bucketFilter === f.key
                  ? "border border-[#3B82F6]/50 bg-[#3B82F6]/20 text-white"
                  : "border border-transparent text-white/60 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[200px] flex-1 sm:flex-none">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filename…"
            className="w-full rounded-md border border-white/[0.1] bg-[#16181D] pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 transition-colors duration-[250ms] ease hover:border-white/20 focus:border-[#3B82F6]/60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#3B82F6] to-[#F97316] px-4 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-95 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="h-4 w-4" />
          )}
          Upload to {BUCKET_LABELS[uploadTargetBucket]}
        </button>
      </div>

      <div className="mt-6 card-elevated overflow-hidden p-5">
        {imagesQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        ) : loadError ? (
          <EmptyState icon={Images} title="Could not load media" hint={loadError} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No images yet"
            hint="Upload one with the button above — it'll be auto-converted to WebP."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((img) => (
              <MediaCard
                key={`${img.bucket}/${img.name}`}
                image={img}
                onCopy={() => handleCopyLink(img)}
                onDelete={() => setConfirmDelete(img)}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent className="bg-[#0F1320] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/55">
              "{confirmDelete?.name}" will be permanently removed from{" "}
              {confirmDelete ? BUCKET_LABELS[confirmDelete.bucket] : "storage"}. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function MediaCard({
  image,
  onCopy,
  onDelete,
}: {
  image: MediaImage;
  onCopy: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-md border border-white/[0.08] bg-[#0B0F1A]">
      <img src={image.url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/85 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-[#3B82F6]"
          aria-label="Copy link"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-red-500/10 hover:text-red-400"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-2">
        <div className="truncate text-[11px] text-white/70">{image.name}</div>
        <div className="mt-0.5 flex items-center justify-between text-[10px] text-white/40">
          <span className="truncate font-mono uppercase tracking-wider">
            {BUCKET_SHORT[image.bucket]}
          </span>
          <span>{fmtBytes(image.size)}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-white/50">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-sm font-medium text-white/70">{title}</div>
      {hint && <div className="mt-1 max-w-xs text-xs text-white/45">{hint}</div>}
    </div>
  );
}
