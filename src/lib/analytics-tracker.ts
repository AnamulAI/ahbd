// Client-side visit tracker. Loaded once from the root layout on the browser.
import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "ahbd_visitor_id";
const SESSION_KEY = "ahbd_session_id";
const VISITOR_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

const BOT_UA_RE =
  /bot|crawler|spider|crawling|googlebot|bingbot|yahoo|duckduckbot|baiduspider|yandex|sogou|exabot|facebookexternalhit|ia_archiver|gptbot|claudebot|anthropic-ai|perplexitybot|ccbot|semrushbot|ahrefsbot|dotbot|mj12bot|petalbot|bytespider|applebot/i;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getOrCreateVisitorId(): { id: string; isNew: boolean } {
  try {
    const raw = localStorage.getItem(VISITOR_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; ts: number };
      if (parsed?.id && Date.now() - parsed.ts < VISITOR_MAX_AGE_MS) {
        // refresh timestamp so it stays alive
        localStorage.setItem(VISITOR_KEY, JSON.stringify({ id: parsed.id, ts: Date.now() }));
        return { id: parsed.id, isNew: false };
      }
    }
  } catch {}
  const id = uuid();
  try {
    localStorage.setItem(VISITOR_KEY, JSON.stringify({ id, ts: Date.now() }));
  } catch {}
  return { id, isNew: true };
}

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = uuid();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return uuid();
  }
}

export function getSessionId(): string {
  return getOrCreateSessionId();
}

function detectDevice(ua: string): string {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  return "Other";
}

function detectOS(ua: string): string {
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other";
}

function categorizeReferrer(ref: string): {
  category: "direct" | "organic_search" | "social" | "ai_engine" | "referral";
  raw: string | null;
} {
  if (!ref) return { category: "direct", raw: null };
  let host = "";
  try {
    host = new URL(ref).hostname.toLowerCase();
  } catch {
    return { category: "direct", raw: null };
  }
  // Same-origin doesn't count as an external referrer.
  if (typeof window !== "undefined" && host === window.location.hostname) {
    return { category: "direct", raw: null };
  }
  if (/(^|\.)(google|bing|yahoo|duckduckgo|yandex|baidu|ecosia|brave)\./.test(host)) {
    return { category: "organic_search", raw: host };
  }
  if (
    /(^|\.)(facebook|instagram|tiktok|linkedin|twitter|t\.co|pinterest|reddit|youtube|whatsapp|telegram)\./.test(
      host,
    ) ||
    host === "x.com" ||
    host.endsWith(".x.com") ||
    host.endsWith("lnkd.in")
  ) {
    return { category: "social", raw: host };
  }
  if (
    host === "chat.openai.com" ||
    host === "chatgpt.com" ||
    host === "perplexity.ai" ||
    host === "www.perplexity.ai" ||
    host === "claude.ai" ||
    host === "gemini.google.com" ||
    host === "copilot.microsoft.com" ||
    host === "you.com" ||
    host === "phind.com"
  ) {
    return { category: "ai_engine", raw: host };
  }
  return { category: "referral", raw: host };
}

async function isAdminSession(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) return false;
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    return Boolean(role);
  } catch {
    return false;
  }
}

let currentVisitId: string | null = null;
let visitStartMs = 0;
let heartbeatTimer: number | null = null;
let lastTrackedPath: string | null = null;

async function sendHeartbeat(final = false) {
  if (!currentVisitId) return;
  const seconds = Math.max(0, Math.round((Date.now() - visitStartMs) / 1000));
  const payload = JSON.stringify({ id: currentVisitId, seconds });
  const url = "/api/public/track-heartbeat";
  try {
    if (final && "sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: final,
      });
    }
  } catch {}
}

function stopHeartbeat() {
  if (heartbeatTimer !== null) {
    window.clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") sendHeartbeat(false);
  }, 20_000);
}

export async function trackPageview(pathOverride?: string) {
  if (typeof window === "undefined") return;
  const path = pathOverride ?? window.location.pathname + window.location.search;
  if (path === lastTrackedPath) return;
  lastTrackedPath = path;

  // finish previous visit's time first
  if (currentVisitId) await sendHeartbeat(true);
  currentVisitId = null;
  visitStartMs = Date.now();

  const ua = navigator.userAgent || "";
  const isBot = BOT_UA_RE.test(ua);
  const visitor = getOrCreateVisitorId();
  const session = getOrCreateSessionId();
  const { category, raw } = categorizeReferrer(document.referrer || "");
  const url = new URL(window.location.href);
  const utm_source = url.searchParams.get("utm_source");
  const utm_medium = url.searchParams.get("utm_medium");
  const utm_campaign = url.searchParams.get("utm_campaign");

  const isAdmin = await isAdminSession();

  const body = {
    session_id: session,
    visitor_id: visitor.id,
    path: window.location.pathname,
    device_type: detectDevice(ua),
    browser: detectBrowser(ua),
    os: detectOS(ua),
    referrer_raw: raw,
    referrer_category: category,
    utm_source,
    utm_medium,
    utm_campaign,
    is_new_visitor: visitor.isNew,
    is_admin: isAdmin,
    is_bot: isBot,
    user_agent: ua,
  };

  try {
    const res = await fetch("/api/public/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const json = (await res.json()) as { id?: string };
      if (json.id) {
        currentVisitId = json.id;
        startHeartbeat();
      }
    }
  } catch {}
}

let listenersInstalled = false;
export function installVisitorTracking() {
  if (typeof window === "undefined") return;
  if (listenersInstalled) return;
  listenersInstalled = true;

  window.addEventListener("beforeunload", () => sendHeartbeat(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sendHeartbeat(false);
  });
}

export async function recordConversion(
  eventType: "lead_submitted" | "newsletter_subscribed",
  path?: string,
) {
  try {
    await supabase.from("conversion_events").insert({
      session_id: getOrCreateSessionId(),
      event_type: eventType,
      path: path ?? (typeof window !== "undefined" ? window.location.pathname : null),
    });
  } catch {}
}
