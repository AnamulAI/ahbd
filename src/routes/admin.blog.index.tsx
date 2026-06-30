import { createFileRoute } from "@tanstack/react-router";
import { BlogListPage } from "@/components/admin/BlogListPage";

export const Route = createFileRoute("/admin/blog/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Blog Posts — AnamDev Admin" }] }),
  component: BlogListPage,
});
