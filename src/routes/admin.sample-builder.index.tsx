import { createFileRoute } from "@tanstack/react-router";
import { SampleBuilderListPage } from "@/components/admin/SampleBuilderListPage";

export const Route = createFileRoute("/admin/sample-builder/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sample Builder — AnamDev Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SampleBuilderListPage,
});
