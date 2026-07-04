import { createFileRoute } from "@tanstack/react-router";
import { SeoTrackingPage } from "@/components/admin/SeoTrackingPage";

export const Route = createFileRoute("/admin/seo")({
  ssr: false,
  head: () => ({ meta: [{ title: "SEO & Tracking — AnamDev Admin" }] }),
  component: SeoTrackingPage,
});
