import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { installVisitorTracking, trackPageview } from "@/lib/analytics-tracker";

export function VisitorTrackerMount() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    installVisitorTracking();
  }, []);

  useEffect(() => {
    // Skip admin panel routes — they are for management, not public visitors.
    if (pathname.startsWith("/admin")) return;
    // trackPageview reads the current URL to grab utm params & referrer.
    trackPageview(pathname);
  }, [pathname]);

  return null;
}
