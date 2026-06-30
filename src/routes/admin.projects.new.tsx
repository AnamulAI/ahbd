import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProjectEditorPage } from "@/components/admin/ProjectEditorPage";

const search = z.object({
  main: z.string().optional(),
  sub: z.string().optional(),
});

export const Route = createFileRoute("/admin/projects/new")({
  ssr: false,
  head: () => ({ meta: [{ title: "New Project — AnamDev Admin" }] }),
  validateSearch: search,
  component: NewRoute,
});

function NewRoute() {
  const { main, sub } = Route.useSearch();
  return <ProjectEditorPage presetMain={main} presetSub={sub} />;
}
