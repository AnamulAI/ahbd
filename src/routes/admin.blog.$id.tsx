import { createFileRoute } from "@tanstack/react-router";
import { BlogEditorPage } from "@/components/admin/BlogEditorPage";

export const Route = createFileRoute("/admin/blog/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: "Edit Post — AnamDev Admin" }] }),
  component: EditRoute,
});

function EditRoute() {
  const { id } = Route.useParams();
  return <BlogEditorPage id={id} />;
}
