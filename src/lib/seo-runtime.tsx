import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* -------------------------------------------------------------------------- */
/* Types & fetchers                                                            */
/* -------------------------------------------------------------------------- */

export type SiteSettings = {
  default_meta_title_template: string;
  default_meta_description: string;
  default_og_image_url: string;
  ga4_measurement_id: string;
  facebook_pixel_id: string;
  google_site_verification: string;
  custom_head_scripts: string;
  custom_body_scripts: string;
};

const EMPTY_SETTINGS: SiteSettings = {
  default_meta_title_template: "{page} | AnamDev",
  default_meta_description: "",
  default_og_image_url: "",
  ga4_measurement_id: "",
  facebook_pixel_id: "",
  google_site_verification: "",
  custom_head_scripts: "",
  custom_body_scripts: "",
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data } = await supabase
    .from("site_settings")
    .select("setting_key,setting_value");
  const out: SiteSettings = { ...EMPTY_SETTINGS };
  for (const row of data ?? []) {
    const k = (row as { setting_key: string }).setting_key as keyof SiteSettings;
    const v = (row as { setting_value: string | null }).setting_value ?? "";
    if (k in out) (out as Record<string, string>)[k] = v;
  }
  return out;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 60_000,
  });
}

export type StaticPageSeoRow = {
  page_key: string;
  page_label: string;
  seo_title: string | null;
  seo_description: string | null;
};

export async function fetchStaticPageSeo(pageKey: string): Promise<StaticPageSeoRow | null> {
  const { data } = await supabase
    .from("static_page_seo")
    .select("page_key,page_label,seo_title,seo_description")
    .eq("page_key", pageKey)
    .maybeSingle();
  return (data as StaticPageSeoRow | null) ?? null;
}

export function useStaticPageSeo(pageKey: string) {
  return useQuery({
    queryKey: ["static_page_seo", pageKey],
    queryFn: () => fetchStaticPageSeo(pageKey),
    staleTime: 60_000,
  });
}

/* -------------------------------------------------------------------------- */
/* Head tag helpers (client-side DOM injection)                                */
/* -------------------------------------------------------------------------- */

function setMetaTag(selector: string, attrs: Record<string, string>) {
  if (typeof document === "undefined") return () => {};
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  const created = !el;
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  const previous: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(attrs)) {
    previous[k] = el.getAttribute(k);
    el.setAttribute(k, v);
  }
  return () => {
    if (created) el?.remove();
    else if (el) {
      for (const [k, v] of Object.entries(previous)) {
        if (v === null) el.removeAttribute(k);
        else el.setAttribute(k, v);
      }
    }
  };
}

function applyTitleTemplate(template: string, pageTitle: string) {
  if (!template) return pageTitle;
  if (template.includes("{page}")) return template.replace("{page}", pageTitle);
  return pageTitle;
}

/* -------------------------------------------------------------------------- */
/* <PageSeo /> — sets document.title, meta description, og:*, twitter:*        */
/* -------------------------------------------------------------------------- */

export function PageSeo({
  title,
  description,
  image,
  useTitleTemplate = true,
}: {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  useTitleTemplate?: boolean;
}) {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const cleanups: Array<() => void> = [];

    const resolvedTitle = title?.trim() || "";
    const resolvedDesc =
      description?.trim() || settings?.default_meta_description?.trim() || "";
    const resolvedImage =
      image?.trim() || settings?.default_og_image_url?.trim() || "";

    if (resolvedTitle) {
      const previousTitle = document.title;
      const finalTitle = useTitleTemplate
        ? applyTitleTemplate(
            settings?.default_meta_title_template || "",
            resolvedTitle,
          )
        : resolvedTitle;
      document.title = finalTitle;
      cleanups.push(() => {
        document.title = previousTitle;
      });
      cleanups.push(
        setMetaTag('meta[property="og:title"]', {
          property: "og:title",
          content: finalTitle,
        }),
      );
      cleanups.push(
        setMetaTag('meta[name="twitter:title"]', {
          name: "twitter:title",
          content: finalTitle,
        }),
      );
    }

    if (resolvedDesc) {
      cleanups.push(
        setMetaTag('meta[name="description"]', {
          name: "description",
          content: resolvedDesc,
        }),
      );
      cleanups.push(
        setMetaTag('meta[property="og:description"]', {
          property: "og:description",
          content: resolvedDesc,
        }),
      );
      cleanups.push(
        setMetaTag('meta[name="twitter:description"]', {
          name: "twitter:description",
          content: resolvedDesc,
        }),
      );
    }

    if (resolvedImage) {
      cleanups.push(
        setMetaTag('meta[property="og:image"]', {
          property: "og:image",
          content: resolvedImage,
        }),
      );
      cleanups.push(
        setMetaTag('meta[name="twitter:image"]', {
          name: "twitter:image",
          content: resolvedImage,
        }),
      );
    }

    return () => {
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
    };
  }, [title, description, image, useTitleTemplate, settings]);

  return null;
}

/* -------------------------------------------------------------------------- */
/* <StaticPageSeo /> — fetches static_page_seo row for a given key             */
/* -------------------------------------------------------------------------- */

export function StaticPageSeo({
  pageKey,
  defaultTitle,
  defaultDescription,
  image,
}: {
  pageKey: string;
  defaultTitle: string;
  defaultDescription?: string;
  image?: string | null;
}) {
  const { data } = useStaticPageSeo(pageKey);
  const title = data?.seo_title?.trim() || defaultTitle;
  const description = data?.seo_description?.trim() || defaultDescription;
  return (
    <PageSeo
      title={title}
      description={description}
      image={image}
      useTitleTemplate={false /* full titles authored explicitly for static pages */}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* <JsonLd /> — inject a schema.org JSON-LD script tag                         */
/* -------------------------------------------------------------------------- */

export function JsonLd({ data, id }: { data: unknown; id: string }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-seo-id", id);
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, [data, id]);
  return null;
}

/* -------------------------------------------------------------------------- */
/* <SiteHeadInjector /> — global tracking / verification / custom scripts       */
/* -------------------------------------------------------------------------- */

const INJECTED_ATTR = "data-lovable-seo-injected";

function injectRawHtml(target: HTMLElement, html: string, tag: string): Node[] {
  if (typeof document === "undefined" || !html.trim()) return [];
  const template = document.createElement("template");
  template.innerHTML = html;
  const nodes: Node[] = [];
  Array.from(template.content.childNodes).forEach((child) => {
    // For <script> tags, we must re-create the element so browsers actually execute it.
    if (child.nodeType === 1 && (child as Element).tagName === "SCRIPT") {
      const src = child as HTMLScriptElement;
      const s = document.createElement("script");
      for (const attr of Array.from(src.attributes)) s.setAttribute(attr.name, attr.value);
      s.text = src.textContent ?? "";
      s.setAttribute(INJECTED_ATTR, tag);
      target.appendChild(s);
      nodes.push(s);
    } else {
      if (child.nodeType === 1) (child as Element).setAttribute(INJECTED_ATTR, tag);
      target.appendChild(child);
      nodes.push(child);
    }
  });
  return nodes;
}

export function SiteHeadInjector() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (typeof document === "undefined" || !settings) return;
    const cleanups: Array<() => void> = [];

    // 1. Google Site Verification
    if (settings.google_site_verification.trim()) {
      cleanups.push(
        setMetaTag('meta[name="google-site-verification"]', {
          name: "google-site-verification",
          content: settings.google_site_verification.trim(),
        }),
      );
    }

    // 2. GA4
    const ga4 = settings.ga4_measurement_id.trim();
    if (ga4 && /^G-[A-Z0-9]+$/i.test(ga4)) {
      const gtagLoader = document.createElement("script");
      gtagLoader.async = true;
      gtagLoader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`;
      gtagLoader.setAttribute(INJECTED_ATTR, "ga4-loader");
      document.head.appendChild(gtagLoader);

      const gtagInit = document.createElement("script");
      gtagInit.setAttribute(INJECTED_ATTR, "ga4-init");
      gtagInit.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`;
      document.head.appendChild(gtagInit);

      cleanups.push(() => {
        gtagLoader.remove();
        gtagInit.remove();
      });
    }

    // 3. Facebook Pixel
    const fb = settings.facebook_pixel_id.trim();
    if (fb && /^[0-9]+$/.test(fb)) {
      const fbScript = document.createElement("script");
      fbScript.setAttribute(INJECTED_ATTR, "fb-pixel");
      fbScript.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fb}');fbq('track','PageView');`;
      document.head.appendChild(fbScript);
      cleanups.push(() => fbScript.remove());
    }

    // 4. Custom head scripts (raw HTML)
    const headNodes = injectRawHtml(document.head, settings.custom_head_scripts, "custom-head");
    cleanups.push(() => headNodes.forEach((n) => n.parentNode?.removeChild(n)));

    // 5. Custom body scripts (raw HTML — appended at end of body)
    const bodyNodes = injectRawHtml(document.body, settings.custom_body_scripts, "custom-body");
    cleanups.push(() => bodyNodes.forEach((n) => n.parentNode?.removeChild(n)));

    return () => {
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
    };
  }, [settings]);

  return null;
}

/* -------------------------------------------------------------------------- */
/* Organization JSON-LD (sitewide)                                             */
/* -------------------------------------------------------------------------- */

export function OrganizationJsonLd() {
  const data = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "AnamDev",
      alternateName: "Mohammad Anamul Hoque",
      url: "https://ahbd.lovable.app",
      logo: "https://ahbd.lovable.app/favicon.ico",
      sameAs: [
        "https://www.linkedin.com/in/anamulhoque",
        "https://github.com/anamulhoque",
      ],
    }),
    [],
  );
  return <JsonLd id="org" data={data} />;
}

/* -------------------------------------------------------------------------- */
/* FAQ extractor — matches the H2/H3 FAQ-detection used in blog.$slug.tsx      */
/* -------------------------------------------------------------------------- */

const FAQ_HEADING = /(frequently\s*asked|faq|common\s*questions)/i;

export function extractFaqFromHtml(html: string): { q: string; a: string }[] {
  if (typeof window === "undefined" || !html) return [];
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const headings = Array.from(doc.querySelectorAll("h2, h3"));
    const startIdx = headings.findIndex((h) => FAQ_HEADING.test(h.textContent ?? ""));
    if (startIdx < 0) return [];
    // Collect Q/A pairs from the FAQ block: subsequent H3s + following paragraph(s).
    const items: { q: string; a: string }[] = [];
    const faqHeading = headings[startIdx];
    let node: Element | null = faqHeading.nextElementSibling;
    let currentQ: string | null = null;
    let answerParts: string[] = [];
    const flush = () => {
      if (currentQ && answerParts.length) {
        items.push({ q: currentQ.trim(), a: answerParts.join(" ").trim() });
      }
      currentQ = null;
      answerParts = [];
    };
    while (node) {
      const tag = node.tagName;
      if (tag === "H2") break;
      if (tag === "H3" || tag === "H4") {
        flush();
        currentQ = node.textContent ?? "";
      } else if (currentQ) {
        const t = (node.textContent ?? "").trim();
        if (t) answerParts.push(t);
      }
      node = node.nextElementSibling;
    }
    flush();
    return items;
  } catch {
    return [];
  }
}
