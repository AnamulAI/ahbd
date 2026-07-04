import { createFileRoute } from "@tanstack/react-router";
import { PagesAssignmentPage } from "@/components/admin/PagesAssignmentPage";

export const Route = createFileRoute("/admin/pages")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pages — AnamDev Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PagesAssignmentPage,
});
