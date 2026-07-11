import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { registerServiceWorker } from "../lib/pwa-register";
import { Toaster } from "@/components/ui/sonner";
import { ScrollUX } from "@/components/site/ScrollUX";
import { VisitorTrackerMount } from "@/components/site/VisitorTrackerMount";
import { SiteHeadInjector, OrganizationJsonLd } from "@/lib/seo-runtime";
import { supabase } from "@/integrations/supabase/client";

type SsrHeadMeta = Record<string, string>;

/**
 * Parse the raw HTML in `custom_head_scripts` and extract any <meta> tags
 * so they can be emitted into the SSR head. Verification bots (Impact
 * Radius, some Search Console flows) fetch the raw HTML and do not execute
 * JavaScript, so client-side injection via <SiteHeadInjector> is invisible
 * to them. We keep <SiteHeadInjector> for scripts (GA4, pixels) and mirror
 * only <meta> tags server-side.
 */
function extractMetaTagsFromHtml(html: string): SsrHeadMeta[] {
  if (!html) return [];
  const tags: SsrHeadMeta[] = [];
  const metaRe = /<meta\s+([^>]*?)\/?>/gi;
  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = metaRe.exec(html)) !== null) {
    const attrs: SsrHeadMeta = {};
    let a: RegExpExecArray | null;
    attrRe.lastIndex = 0;
    while ((a = attrRe.exec(m[1])) !== null) {
      attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? "";
    }
    if (
      attrs.name === "impact-site-verification" &&
      attrs.value &&
      !attrs.content
    ) {
      attrs.content = attrs.value;
    }
    if (Object.keys(attrs).length) tags.push(attrs);
  }
  return tags;
}

async function loadSsrSeoMeta(): Promise<SsrHeadMeta[]> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_key,setting_value")
      .in("setting_key", [
        "custom_head_scripts",
        "google_site_verification",
        "bing_site_verification",
        "facebook_domain_verification",
        "pinterest_domain_verification",
      ]);
    const map = new Map<string, string>();
    for (const row of data ?? []) {
      map.set(
        (row as { setting_key: string }).setting_key,
        (row as { setting_value: string | null }).setting_value ?? "",
      );
    }
    const out: SsrHeadMeta[] = [];
    const g = map.get("google_site_verification")?.trim();
    if (g) out.push({ name: "google-site-verification", content: g });
    const b = map.get("bing_site_verification")?.trim();
    if (b) out.push({ name: "msvalidate.01", content: b });
    const f = map.get("facebook_domain_verification")?.trim();
    if (f) out.push({ name: "facebook-domain-verification", content: f });
    const p = map.get("pinterest_domain_verification")?.trim();
    if (p) out.push({ name: "p:domain_verify", content: p });
    for (const t of extractMetaTagsFromHtml(map.get("custom_head_scripts") ?? "")) {
      out.push(t);
    }
    return out;
  } catch {
    return [];
  }
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => ({ ssrMeta: await loadSsrSeoMeta() }),
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Anamul Hoque" },
      { name: "description", content: "I Help Brands Build Stronger Authority and a Sharper Digital Presence." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Anamul Hoque" },
      { property: "og:description", content: "I Help Brands Build Stronger Authority and a Sharper Digital Presence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Anamul Hoque" },
      { name: "twitter:description", content: "I Help Brands Build Stronger Authority and a Sharper Digital Presence." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/beb83e00-1058-4240-9aef-fb329e64d5c7" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/beb83e00-1058-4240-9aef-fb329e64d5c7" },
      { name: "theme-color", content: "#0A0E1A" },
      ...(loaderData?.ssrMeta ?? []),
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <ScrollUX />
      <VisitorTrackerMount />
      <Toaster position="top-center" theme="dark" richColors />
      <SiteHeadInjector />
      <OrganizationJsonLd />
    </QueryClientProvider>
  );
}
