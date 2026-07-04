import { createFileRoute } from "@tanstack/react-router";
import { SampleEditorPage } from "@/components/admin/SampleEditorPage";

export const Route = createFileRoute("/admin/sample-builder/new")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "New Sample — AnamDev Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <SampleEditorPage />,
});
