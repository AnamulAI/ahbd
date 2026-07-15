import { createFileRoute } from "@tanstack/react-router";
import { BlogCategoriesPage } from "@/components/admin/BlogCategoriesPage";

export const Route = createFileRoute("/admin/blog/categories")({
  ssr: false,
  head: () => ({ meta: [{ title: "Blog Categories — AnamDev Admin" }] }),
  component: BlogCategoriesPage,
});
