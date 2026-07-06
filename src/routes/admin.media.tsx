import { createFileRoute } from "@tanstack/react-router";
import { MediaManagerPage } from "@/components/admin/MediaManagerPage";

export const Route = createFileRoute("/admin/media")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Media Manager — AnamDev Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MediaManagerPage,
});
