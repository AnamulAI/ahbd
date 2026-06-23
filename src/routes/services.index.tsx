import { createFileRoute, redirect } from "@tanstack/react-router";

// TEMP: defaults to web-development until a dedicated /services overview page
// or admin-configurable default is built.
export const Route = createFileRoute("/services/")({
  beforeLoad: () => {
    throw redirect({ to: "/services/web-development" });
  },
});
