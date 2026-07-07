import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getSiteContent,
  DEFAULT_SITE_CONTENT_TEXT,
  type NavLinkRow,
  type NavPlacement,
} from "@/lib/site-content.functions";
import type { DeviceVisibility } from "@/lib/site-section-visibility.functions";

export function useSiteContent() {
  const fetchContent = useServerFn(getSiteContent);
  const { data, isLoading } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => fetchContent(),
    staleTime: 60_000,
  });

  function linksFor(placement: NavPlacement): NavLinkRow[] {
    return (data?.navLinks ?? []).filter((l) => l.placement === placement);
  }

  // Defaults to "both" (fully visible) if a section has no row yet — additive,
  // never breaks rendering for sections not (yet) covered by Visibility Control.
  function visibilityFor(sectionKey: string): DeviceVisibility {
    return data?.sectionVisibility?.[sectionKey] ?? "both";
  }

  return {
    text: data?.text ?? DEFAULT_SITE_CONTENT_TEXT,
    linksFor,
    visibilityFor,
    isLoading,
  };
}
