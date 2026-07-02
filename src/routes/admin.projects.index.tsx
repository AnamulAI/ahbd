import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProjectsListPage } from "@/components/admin/ProjectsListPage";

const search = z.object({
  main: z.string().optional(),
  sub: z.string().optional(),
});

export const Route = createFileRoute("/admin/projects/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Projects — AnamDev Admin" }] }),
  validateSearch: search,
  component: ProjectsListPage,
});
