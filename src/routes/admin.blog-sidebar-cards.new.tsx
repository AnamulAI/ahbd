import { createFileRoute } from "@tanstack/react-router";
import { SidebarCardEditorPage } from "@/components/admin/SidebarCardEditorPage";

export const Route = createFileRoute("/admin/blog-sidebar-cards/new")({
  ssr: false,
  head: () => ({ meta: [{ title: "New Sidebar Card — AnamDev Admin" }] }),
  component: () => <SidebarCardEditorPage />,
});
