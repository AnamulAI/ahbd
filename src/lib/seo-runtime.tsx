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
  // Part 1 + 2
  bing_site_verification: string;
  facebook_domain_verification: string;
  tiktok_pixel_id: string;
  pinterest_tag_id: string;
  pinterest_domain_verification: string;
  linkedin_partner_id: string;
  // Part 3
  newsletter_webhook_url: string;
  // Part 4 — stored as "true" / "false"
  allow_gptbot: string;
  allow_google_extended: string;
  allow_claudebot: string;
  allow_perplexitybot: string;
  allow_ccbot: string;
  // Part 5
  llms_txt_content: string;
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
  bing_site_verification: "",
  facebook_domain_verification: "",
  tiktok_pixel_id: "",
  pinterest_tag_id: "",
  pinterest_domain_verification: "",
  linkedin_partner_id: "",
  newsletter_webhook_url: "",
  allow_gptbot: "true",
  allow_google_extended: "true",
  allow_claudebot: "true",
  allow_perplexitybot: "true",
  allow_ccbot: "true",
  llms_txt_content: "",
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
/* Head tag helpers                                                            */
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
/* <PageSeo />                                                                 */
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
      useTitleTemplate={false}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* <JsonLd />                                                                  */
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
/* <SiteHeadInjector />                                                        */
/* -------------------------------------------------------------------------- */

const INJECTED_ATTR = "data-lovable-seo-injected";

function injectRawHtml(target: HTMLElement, html: string, tag: string): Node[] {
  if (typeof document === "undefined" || !html.trim()) return [];
  const template = document.createElement("template");
  template.innerHTML = html;
  const nodes: Node[] = [];
  Array.from(template.content.childNodes).forEach((child) => {
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

function appendInlineScript(text: string, tag: string): () => void {
  const s = document.createElement("script");
  s.setAttribute(INJECTED_ATTR, tag);
  s.text = text;
  document.head.appendChild(s);
  return () => s.remove();
}

export function SiteHeadInjector() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (typeof document === "undefined" || !settings) return;
    const cleanups: Array<() => void> = [];

    // --- Verification meta tags ---
    if (settings.google_site_verification.trim()) {
      cleanups.push(
        setMetaTag('meta[name="google-site-verification"]', {
          name: "google-site-verification",
          content: settings.google_site_verification.trim(),
        }),
      );
    }
    if (settings.bing_site_verification.trim()) {
      cleanups.push(
        setMetaTag('meta[name="msvalidate.01"]', {
          name: "msvalidate.01",
          content: settings.bing_site_verification.trim(),
        }),
      );
    }
    if (settings.facebook_domain_verification.trim()) {
      cleanups.push(
        setMetaTag('meta[name="facebook-domain-verification"]', {
          name: "facebook-domain-verification",
          content: settings.facebook_domain_verification.trim(),
        }),
      );
    }
    if (settings.pinterest_domain_verification.trim()) {
      cleanups.push(
        setMetaTag('meta[name="p:domain_verify"]', {
          name: "p:domain_verify",
          content: settings.pinterest_domain_verification.trim(),
        }),
      );
    }

    // --- GA4 ---
    const ga4 = settings.ga4_measurement_id.trim();
    if (ga4 && /^G-[A-Z0-9]+$/i.test(ga4)) {
      const gtagLoader = document.createElement("script");
      gtagLoader.async = true;
      gtagLoader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`;
      gtagLoader.setAttribute(INJECTED_ATTR, "ga4-loader");
      document.head.appendChild(gtagLoader);
      cleanups.push(() => gtagLoader.remove());
      cleanups.push(
        appendInlineScript(
          `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`,
          "ga4-init",
        ),
      );
    }

    // --- Facebook Pixel ---
    const fb = settings.facebook_pixel_id.trim();
    if (fb && /^[0-9]+$/.test(fb)) {
      cleanups.push(
        appendInlineScript(
          `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fb}');fbq('track','PageView');`,
          "fb-pixel",
        ),
      );
    }

    // --- TikTok Pixel ---
    const tk = settings.tiktok_pixel_id.trim();
    if (tk) {
      const safe = tk.replace(/[^A-Za-z0-9]/g, "");
      cleanups.push(
        appendInlineScript(
          `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('${safe}');ttq.page();}(window, document, 'ttq');`,
          "tiktok-pixel",
        ),
      );
    }

    // --- Pinterest Tag ---
    const pin = settings.pinterest_tag_id.trim();
    if (pin) {
      const safe = pin.replace(/[^A-Za-z0-9]/g, "");
      cleanups.push(
        appendInlineScript(
          `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${safe}');pintrk('page');`,
          "pinterest-tag",
        ),
      );
    }

    // --- LinkedIn Insight Tag ---
    const li = settings.linkedin_partner_id.trim();
    if (li && /^[0-9]+$/.test(li)) {
      cleanups.push(
        appendInlineScript(
          `_linkedin_partner_id="${li}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})(window.lintrk);`,
          "linkedin-insight",
        ),
      );
    }

    // --- Custom head + body raw HTML ---
    const headNodes = injectRawHtml(document.head, settings.custom_head_scripts, "custom-head");
    cleanups.push(() => headNodes.forEach((n) => n.parentNode?.removeChild(n)));

    const bodyNodes = injectRawHtml(document.body, settings.custom_body_scripts, "custom-body");
    cleanups.push(() => bodyNodes.forEach((n) => n.parentNode?.removeChild(n)));

    return () => {
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
    };
  }, [settings]);

  return null;
}

/* -------------------------------------------------------------------------- */
/* Organization + Service JSON-LD                                              */
/* -------------------------------------------------------------------------- */

const SITE_URL = "https://ahbd.lovable.app";
const ORG_NODE = {
  "@type": "Organization",
  name: "AnamDev",
  alternateName: "Mohammad Anamul Hoque",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
};

export function OrganizationJsonLd() {
  const data = useMemo(
    () => ({
      "@context": "https://schema.org",
      ...ORG_NODE,
      sameAs: [
        "https://www.linkedin.com/in/anamulhoque",
        "https://github.com/anamulhoque",
      ],
    }),
    [],
  );
  return <JsonLd id="org" data={data} />;
}

export function ServiceJsonLd({
  id,
  name,
  description,
  url,
  serviceType,
}: {
  id: string;
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}) {
  const data = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Service",
      name,
      description,
      url,
      serviceType: serviceType ?? name,
      provider: ORG_NODE,
      areaServed: { "@type": "Place", name: "Worldwide" },
    }),
    [name, description, url, serviceType],
  );
  return <JsonLd id={`service-${id}`} data={data} />;
}

/* -------------------------------------------------------------------------- */
/* Newsletter webhook (best-effort, fire-and-forget)                           */
/* -------------------------------------------------------------------------- */

export function fireNewsletterWebhook(email: string): void {
  if (typeof window === "undefined") return;
  // Fetch the URL fresh each time so admin edits take effect immediately.
  void (async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "newsletter_webhook_url")
        .maybeSingle();
      const url = ((data as { setting_value: string | null } | null)?.setting_value ?? "").trim();
      if (!url) return;
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subscribed_at: new Date().toISOString() }),
        keepalive: true,
      });
    } catch {
      /* best-effort */
    }
  })();
}

/* -------------------------------------------------------------------------- */
/* FAQ extractor                                                               */
/* -------------------------------------------------------------------------- */

const FAQ_HEADING = /(frequently\s*asked|faq|common\s*questions)/i;

export function extractFaqFromHtml(html: string): { q: string; a: string }[] {
  if (typeof window === "undefined" || !html) return [];
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const headings = Array.from(doc.querySelectorAll("h2, h3"));
    const startIdx = headings.findIndex((h) => FAQ_HEADING.test(h.textContent ?? ""));
    if (startIdx < 0) return [];
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
