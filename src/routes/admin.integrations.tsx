import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/admin/IntegrationsPage";

export const Route = createFileRoute("/admin/integrations")({
  ssr: false,
  head: () => ({ meta: [{ title: "Integrations — AnamDev Admin" }] }),
  component: IntegrationsPage,
});
