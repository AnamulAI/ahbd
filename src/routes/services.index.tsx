import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { getPageAssignments } from "@/lib/pages-settings.functions";

// /services resolves to whichever service page the admin has assigned in
// the Pages settings. Falls back to web-development only if the lookup
// fails or returns no value.
export const Route = createFileRoute("/services/")({
  beforeLoad: async () => {
    try {
      const assignments = await getPageAssignments();
      const target = assignments.services_page_route || "/services/web-development";
      throw redirect({ href: target, statusCode: 302 });
    } catch (err) {
      if (isRedirect(err)) throw err;
      throw redirect({ href: "/services/web-development", statusCode: 302 });
    }
  },
});
