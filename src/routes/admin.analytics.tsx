import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/components/admin/AnalyticsPage";

export const Route = createFileRoute("/admin/analytics")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Analytics — AnamDev Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AnalyticsPage,
});
