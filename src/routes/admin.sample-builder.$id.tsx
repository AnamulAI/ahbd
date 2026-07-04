import { createFileRoute } from "@tanstack/react-router";
import { SampleEditorPage } from "@/components/admin/SampleEditorPage";

export const Route = createFileRoute("/admin/sample-builder/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Edit Sample — AnamDev Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EditRoute,
});

function EditRoute() {
  const { id } = Route.useParams();
  return <SampleEditorPage id={id} />;
}
