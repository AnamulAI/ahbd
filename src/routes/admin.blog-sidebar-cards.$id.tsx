import { createFileRoute } from "@tanstack/react-router";
import { SidebarCardEditorPage } from "@/components/admin/SidebarCardEditorPage";

export const Route = createFileRoute("/admin/blog-sidebar-cards/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: "Edit Sidebar Card — AnamDev Admin" }] }),
  component: EditRoute,
});

function EditRoute() {
  const { id } = Route.useParams();
  return <SidebarCardEditorPage id={id} />;
}
