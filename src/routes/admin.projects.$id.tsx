import { createFileRoute } from "@tanstack/react-router";
import { ProjectEditorPage } from "@/components/admin/ProjectEditorPage";

export const Route = createFileRoute("/admin/projects/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: "Edit Project — AnamDev Admin" }] }),
  component: EditRoute,
});

function EditRoute() {
  const { id } = Route.useParams();
  return <ProjectEditorPage id={id} />;
}
