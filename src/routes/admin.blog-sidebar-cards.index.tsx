import { createFileRoute } from "@tanstack/react-router";
import { SidebarCardsListPage } from "@/components/admin/SidebarCardsListPage";

export const Route = createFileRoute("/admin/blog-sidebar-cards/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Blog Sidebar Cards — AnamDev Admin" }] }),
  component: SidebarCardsListPage,
});
