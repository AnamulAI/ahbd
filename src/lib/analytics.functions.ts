import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RangeSchema = z.object({
  days: z.number().int().min(1).max(3650).nullable().optional(),
  includeAdmin: z.boolean().optional(),
});

type Range = z.infer<typeof RangeSchema>;

function sinceIso(days: number | null | undefined): string | null {
  if (!days) return null;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

async function assertAnalyticsAccess(context: any) {
  const sb = context.supabase as any;
  const { data, error } = await sb.rpc("has_section_access", {
    _user_id: context.userId,
    _section: "analytics",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

async function fetchVisitsBetween(
  context: any,
  fromIso: string | null,
  toIso: string | null,
  includeAdmin: boolean,
) {
  const sb = context.supabase as any;
  let q = sb.from("page_visits").select("*").eq("is_bot", false);
  if (!includeAdmin) q = q.eq("is_admin", false);
  if (fromIso) q = q.gte("visited_at", fromIso);
  if (toIso) q = q.lt("visited_at", toIso);
  const { data, error } = await q.order("visited_at", { ascending: false }).limit(50000);
  if (error) throw new Error(error.message);
  return (data ?? []) as any[];
}

async function baseVisitsQuery(context: any, range: Range) {
  const since = range.days ? new Date(Date.now() - range.days * 24 * 60 * 60 * 1000).toISOString() : null;
  return fetchVisitsBetween(context, since, null, Boolean(range.includeAdmin));
}

function computeTotals(visits: any[]) {
  const uniqueVisitors = new Set(visits.map((v) => v.visitor_id)).size;
  const newVisitors = visits.filter((v) => v.is_new_visitor).length;
  const returningVisitors = visits.length - newVisitors;
  const bySession = new Map<string, any[]>();
  for (const v of visits) {
    const arr = bySession.get(v.session_id) ?? [];
    arr.push(v);
    bySession.set(v.session_id, arr);
  }
  let totalDuration = 0;
  let countedSessions = 0;
  let bouncedSessions = 0;
  for (const [, rows] of bySession) {
    const dur = rows.reduce((acc, r) => acc + (r.time_on_page_seconds || 0), 0);
    if (rows.length > 0) countedSessions++;
    totalDuration += dur;
    if (rows.length === 1) bouncedSessions++;
  }
  return {
    pageviews: visits.length,
    uniqueVisitors,
    newVisitors,
    returningVisitors,
    avgSessionSeconds: countedSessions > 0 ? Math.round(totalDuration / countedSessions) : 0,
    bounceRate: bySession.size > 0 ? bouncedSessions / bySession.size : 0,
  };
}

export const getAnalyticsOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RangeSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAnalyticsAccess(context);
    const visits = await baseVisitsQuery(context, data);
    const totals = computeTotals(visits);

    // Previous-period totals for trend deltas (only when a bounded range is set).
    let previousTotals: ReturnType<typeof computeTotals> | null = null;
    if (data.days) {
      const now = Date.now();
      const rangeMs = data.days * 24 * 60 * 60 * 1000;
      const prevFrom = new Date(now - rangeMs * 2).toISOString();
      const prevTo = new Date(now - rangeMs).toISOString();
      const prev = await fetchVisitsBetween(context, prevFrom, prevTo, Boolean(data.includeAdmin));
      if (prev.length > 0) previousTotals = computeTotals(prev);
    }

    // countries
    const countryMap = new Map<string, number>();
    for (const v of visits) {
      const key = v.country || "Unknown";
      countryMap.set(key, (countryMap.get(key) ?? 0) + 1);
    }
    const countries = [...countryMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // device / browser
    const bucket = (list: any[], key: string) => {
      const m = new Map<string, number>();
      for (const v of list) {
        const k = v[key] || "Other";
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };
    const devices = bucket(visits, "device_type");
    const browsers = bucket(visits, "browser");

    // sources
    const sources = bucket(visits, "referrer_category");

    // per-domain breakdown of external referrals (backlinks from other sites)
    const referralDomainMap = new Map<string, number>();
    for (const v of visits) {
      if (v.referrer_category !== "referral") continue;
      const host = (v.referrer_raw as string | null) || "(unknown)";
      referralDomainMap.set(host, (referralDomainMap.get(host) ?? 0) + 1);
    }
    const referralDomains = [...referralDomainMap.entries()]
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);


    // top pages
    const pageMap = new Map<string, { count: number; totalTime: number; timeCount: number }>();
    for (const v of visits) {
      const cur = pageMap.get(v.path) ?? { count: 0, totalTime: 0, timeCount: 0 };
      cur.count++;
      if (v.time_on_page_seconds) {
        cur.totalTime += v.time_on_page_seconds;
        cur.timeCount++;
      }
      pageMap.set(v.path, cur);
    }
    const topPages = [...pageMap.entries()]
      .map(([path, s]) => ({
        path,
        visits: s.count,
        avgTime: s.timeCount > 0 ? Math.round(s.totalTime / s.timeCount) : 0,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 20);

    // over time (daily)
    const dayMap = new Map<string, number>();
    for (const v of visits) {
      const d = new Date(v.visited_at as string).toISOString().slice(0, 10);
      dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
    }
    const overTime = [...dayMap.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // campaigns
    const campaignMap = new Map<string, number>();
    for (const v of visits) {
      if (!v.utm_source && !v.utm_campaign) continue;
      const key = `${v.utm_source || "(unknown)"} / ${v.utm_campaign || "(none)"}`;
      campaignMap.set(key, (campaignMap.get(key) ?? 0) + 1);
    }
    const campaigns = [...campaignMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    const sampleLinkVisits = visits.filter((v) => (v.path as string).startsWith("/sample/")).length;

    return {
      totals,
      previousTotals,
      countries,
      devices,
      browsers,
      sources,
      topPages,
      overTime,
      campaigns,
      sampleLinkVisits,
    };
  });

export const getConversionsSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RangeSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAnalyticsAccess(context);
    const sb = context.supabase as any;
    const since = sinceIso(data.days ?? null);

    let cq = sb.from("conversion_events").select("*");
    if (since) cq = cq.gte("created_at", since);
    const { data: convs, error } = await cq.limit(50000);
    if (error) throw new Error(error.message);

    const visits = await baseVisitsQuery(context, data);
    const visitBySession = new Map<string, any>();
    for (const v of visits) {
      // keep first (chronological) visit per session
      const prev = visitBySession.get(v.session_id);
      if (!prev || new Date(v.visited_at) < new Date(prev.visited_at)) {
        visitBySession.set(v.session_id, v);
      }
    }

    const leads = (convs ?? []).filter((c: any) => c.event_type === "lead_submitted");
    const subs = (convs ?? []).filter((c: any) => c.event_type === "newsletter_subscribed");

    const attributionByType = (list: any[]) => {
      const sources = new Map<string, number>();
      const pages = new Map<string, number>();
      for (const c of list) {
        const v = visitBySession.get(c.session_id);
        const src = v?.referrer_category || "unknown";
        sources.set(src, (sources.get(src) ?? 0) + 1);
        const p = c.path || v?.path || "(unknown)";
        pages.set(p, (pages.get(p) ?? 0) + 1);
      }
      return {
        sources: [...sources.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        pages: [...pages.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10),
      };
    };

    return {
      leadCount: leads.length,
      subscriberCount: subs.length,
      leadAttribution: attributionByType(leads),
      subscriberAttribution: attributionByType(subs),
    };
  });

export const getLiveVisitors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ includeAdmin: z.boolean().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAnalyticsAccess(context);
    const sb = context.supabase as any;
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    let q = sb
      .from("page_visits")
      .select("session_id, path, country, city, device_type, browser, visited_at")
      .gte("visited_at", since)
      .eq("is_bot", false);
    if (!data.includeAdmin) q = q.eq("is_admin", false);
    const { data: rows, error } = await q.order("visited_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);

    const bySession = new Map<string, any>();
    for (const r of (rows ?? []) as any[]) {
      const prev = bySession.get(r.session_id);
      if (!prev || new Date(r.visited_at) > new Date(prev.visited_at)) bySession.set(r.session_id, r);
    }
    return {
      count: bySession.size,
      sessions: [...bySession.values()].sort(
        (a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
      ),
    };
  });
