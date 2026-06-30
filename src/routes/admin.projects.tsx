import { createFileRoute } from "@tanstack/react-router";
import { ProjectsListPage } from "@/components/admin/ProjectsListPage";

export const Route = createFileRoute("/admin/projects")({
  ssr: false,
  head: () => ({ meta: [{ title: "Projects — AnamDev Admin" }] }),
  component: ProjectsListPage,
});
