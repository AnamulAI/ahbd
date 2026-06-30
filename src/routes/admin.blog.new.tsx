import { createFileRoute } from "@tanstack/react-router";
import { BlogEditorPage } from "@/components/admin/BlogEditorPage";

export const Route = createFileRoute("/admin/blog/new")({
  ssr: false,
  head: () => ({ meta: [{ title: "New Post — AnamDev Admin" }] }),
  component: () => <BlogEditorPage />,
});
