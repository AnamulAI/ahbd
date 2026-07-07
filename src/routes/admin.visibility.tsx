import { createFileRoute } from "@tanstack/react-router";
import { VisibilityControlPage } from "@/components/admin/VisibilityControlPage";

export const Route = createFileRoute("/admin/visibility")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Visibility Control — AnamDev Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VisibilityControlPage,
});
