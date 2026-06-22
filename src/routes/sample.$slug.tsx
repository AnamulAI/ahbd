import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, Captions, Play } from "lucide-react";
import { SiSpotify, SiApplepodcasts, SiYoutube, SiInstagram, SiTiktok, SiLinkedin } from "react-icons/si";

import { cn } from "@/lib/utils";

const getSampleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: row, error } = await client
      .from("sample_previews")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    return row;
  });

const sampleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["sample", slug],
    queryFn: () => getSampleBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/sample/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(sampleQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Your Podcast Preview — ${loaderData.business_name}` : "Podcast Preview" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SamplePage,
  notFoundComponent: NotFoundView,
});

function NotFoundView() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl">This preview link is no longer valid</h1>
        <p className="text-sm text-muted-foreground">
          The custom preview you're looking for may have been removed.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 btn-gradient px-5 py-2.5 rounded-md text-sm font-medium">
          Visit AnamDev <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  );
}

function SamplePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(sampleQuery(slug));
  if (!data) return <NotFoundView />;

  const platforms = (data.platforms as string[]) ?? [];
  const moduleOrder = (data.module_order as string[]) ?? [];
  const episodeTitle =
    data.episode_title?.trim() ||
    (data.topic ? `Episode 1: ${data.topic.split(/[.!?\n]/)[0].trim()}` : "Episode 1");

  return (
    <main className="min-h-screen bg-background">
      {/* Minimal branding */}
      <div className="px-6 py-5">
        <Link to="/" className="font-mono text-sm text-foreground/80 hover:text-foreground transition-colors">
          {"{AnamDev}"}
        </Link>
      </div>

      {/* Hero */}
      <section className="section-glow-hero relative overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          {data.logo_url && (
            <img
              src={data.logo_url}
              alt={`${data.business_name} logo`}
              className="mx-auto mb-6 max-h-24 rounded-lg bg-white/95 object-contain p-3"
            />
          )}
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            // YOUR CUSTOM PODCAST PREVIEW
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            A Custom Podcast Preview for{" "}
            <span className="text-gradient-vo">{data.business_name}</span>
          </h1>
          <h2 className="mt-3 text-xl sm:text-2xl text-muted-foreground font-normal">
            Here's What Your Podcast Could Look Like
          </h2>
          {data.topic && (
            <p className="mt-6 text-base text-foreground/80 italic">
              Based on: "{data.topic}"
            </p>
          )}
          <p className="mt-6 text-sm text-muted-foreground">
            This is a free custom preview — no commitment required.
          </p>
        </div>
      </section>

      {/* Dynamic modules */}
      {moduleOrder.map((mod) => {
        if (mod === "platforms" && platforms.length > 0) {
          return (
            <PlatformsModule
              key="platforms"
              platforms={platforms}
              businessName={data.business_name}
              logoUrl={data.logo_url}
              episodeTitle={episodeTitle}
              topic={data.topic}
            />
          );
        }
        if (mod === "video" && data.show_video) {
          return (
            <VideoModule
              key="video"
              businessName={data.business_name}
              episodeTitle={episodeTitle}
            />
          );
        }
        if (mod === "smm" && data.show_smm) {
          return <SmmModule key="smm" topic={data.topic} businessName={data.business_name} />;
        }
        return null;
      })}

      {/* Closing CTA */}
      <section className="section-glow-cta relative overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-4xl sm:text-5xl">Like What You See?</h2>
          <p className="mt-5 text-lg text-muted-foreground">
            This was just a preview. Let's make it real — fully produced, branded, and published
            everywhere your audience listens.
          </p>
          <div className="mt-8">
            <a
              href={data.cta_link}
              className="btn-gradient inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
            >
              {data.cta_text} <ArrowRight className="size-4" />
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            No recording equipment needed · Real episodes delivered in days
          </p>
        </div>
      </section>
    </main>
  );
}

/* ---------- Modules ---------- */

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center mb-10">
      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2>
    </div>
  );
}

function PlatformsModule({
  platforms,
  businessName,
  logoUrl,
  episodeTitle,
  topic,
}: {
  platforms: string[];
  businessName: string;
  logoUrl: string | null;
  episodeTitle: string;
  topic: string;
}) {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="// PLATFORM PREVIEW"
          title="See Your Show, Live On The Platforms You Choose"
        />
        <div className={cn(
          "grid gap-6",
          platforms.length === 1 && "max-w-sm mx-auto",
          platforms.length === 2 && "sm:grid-cols-2",
          platforms.length === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        )}>
          {platforms.includes("spotify") && (
            <SpotifyMock businessName={businessName} logoUrl={logoUrl} episodeTitle={episodeTitle} topic={topic} />
          )}
          {platforms.includes("apple") && (
            <AppleMock businessName={businessName} logoUrl={logoUrl} episodeTitle={episodeTitle} topic={topic} />
          )}
          {platforms.includes("youtube") && (
            <YouTubeMock businessName={businessName} logoUrl={logoUrl} episodeTitle={episodeTitle} />
          )}
        </div>
      </div>
    </section>
  );
}

function LogoTile({ logoUrl, label, className }: { logoUrl: string | null; label: string; className?: string }) {
  if (logoUrl) {
    return (
      <img src={logoUrl} alt="" className={cn("object-contain bg-white", className)} />
    );
  }
  return (
    <div className={cn("flex items-center justify-center text-2xl font-bold text-white/80 bg-gradient-to-br from-primary to-orange", className)}>
      {label.slice(0, 1).toUpperCase()}
    </div>
  );
}

function SpotifyMock({ businessName, logoUrl, episodeTitle, topic }: {
  businessName: string; logoUrl: string | null; episodeTitle: string; topic: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: "#121212" }}>
      <div className="p-5 flex items-center gap-2 text-white">
        <SiSpotify className="size-7" style={{ color: "#1DB954" }} />
        <span className="font-semibold text-sm">Spotify</span>
      </div>
      <div className="px-5 pb-5 flex gap-4 items-end">
        <LogoTile logoUrl={logoUrl} label={businessName} className="size-32 rounded-md shadow-xl" />
        <div className="pb-2">
          <p className="text-[10px] uppercase text-white/60 tracking-wider">Podcast</p>
          <h3 className="text-white font-bold text-2xl leading-tight">{businessName}</h3>
        </div>
      </div>
      <div className="px-5 pb-5">
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ background: "#1DB954" }}
          aria-label="Play"
        >
          <Play className="size-6 text-black fill-black ml-0.5" />
        </button>
        <div className="space-y-3">
          <div className="border-t border-white/10 pt-3">
            <p className="text-white font-medium text-sm">{episodeTitle}</p>
            {topic && <p className="text-white/60 text-xs mt-1 line-clamp-2">{topic}</p>}
            <p className="text-white/40 text-xs mt-2">Just now · 12 min</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppleMock({ businessName, logoUrl, episodeTitle, topic }: {
  businessName: string; logoUrl: string | null; episodeTitle: string; topic: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-black/10 shadow-2xl bg-white text-neutral-900">
      <div className="p-5 flex items-center gap-2">
        <SiApplepodcasts className="size-7" style={{ color: "#9933CC" }} />
        <span className="font-semibold text-sm">Apple Podcasts</span>
      </div>
      <div className="px-5 pb-5 text-center">
        <LogoTile
          logoUrl={logoUrl}
          label={businessName}
          className="size-36 mx-auto rounded-2xl shadow-lg"
        />
        <h3 className="mt-4 font-bold text-xl">{businessName}</h3>
        <p className="text-xs" style={{ color: "#9933CC" }}>Business · Updated today</p>
      </div>
      <div className="border-t border-black/5 px-5 py-4 bg-neutral-50">
        <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Latest Episode</p>
        <p className="font-medium text-sm">{episodeTitle}</p>
        {topic && <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{topic}</p>}
        <button
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
          style={{ background: "linear-gradient(135deg, #9933CC, #E91E63)" }}
        >
          <Play className="size-3 fill-white" /> Play
        </button>
      </div>
    </div>
  );
}

function YouTubeMock({ businessName, logoUrl, episodeTitle }: {
  businessName: string; logoUrl: string | null; episodeTitle: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-black/10 shadow-2xl bg-white text-neutral-900">
      <div className="p-4 flex items-center gap-2 border-b border-black/5">
        <SiYoutube className="size-7" style={{ color: "#FF0000" }} />
        <span className="font-semibold text-sm">YouTube Podcasts</span>
      </div>
      <div className="relative aspect-video bg-neutral-900">
        <LogoTile logoUrl={logoUrl} label={businessName} className="absolute inset-0 size-full opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
            <Play className="size-8 text-white fill-white ml-1" />
          </div>
        </div>
        <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 text-white px-1.5 py-0.5 rounded">12:34</span>
      </div>
      <div className="p-4">
        <p className="font-semibold text-sm leading-snug line-clamp-2">{episodeTitle}</p>
        <p className="text-xs text-neutral-600 mt-1">{businessName}</p>
        <p className="text-xs text-neutral-500 mt-1">2.4K views · 1 hour ago</p>
      </div>
    </div>
  );
}

function VideoModule({ businessName, episodeTitle }: { businessName: string; episodeTitle: string }) {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeader eyebrow="// VIDEO PODCAST" title="Your Episode, Also As a Video" />
        <div className="rounded-xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl">
          <div className="relative aspect-video bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
            {/* Waveform style */}
            <div className="absolute inset-x-0 bottom-1/3 flex items-end justify-center gap-1 px-12 opacity-40">
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: `${20 + Math.abs(Math.sin(i * 0.6)) * 60}px`,
                    background: i % 2 === 0 ? "var(--primary)" : "var(--orange)",
                  }}
                />
              ))}
            </div>
            <button className="relative z-10 size-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
              <Play className="size-9 text-black fill-black ml-1" />
            </button>
            <div className="absolute top-5 left-5 right-5">
              <p className="text-white/60 text-xs font-mono">{businessName} · Video Podcast</p>
              <p className="text-white font-bold text-xl mt-1 line-clamp-2">{episodeTitle}</p>
            </div>
            <div className="absolute bottom-4 left-5 right-5 flex items-center gap-2 bg-black/70 backdrop-blur rounded-lg px-3 py-2">
              <Captions className="size-4 text-white/80" />
              <p className="text-xs text-white/90 italic line-clamp-1">
                "Auto-captioned, perfectly synced for every viewer..."
              </p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-muted-foreground text-sm max-w-xl mx-auto">
          Every episode can also be delivered as a publish-ready video — formatted for YouTube,
          TikTok, Instagram Reels, and more.
        </p>
      </div>
    </section>
  );
}

function SmmModule({ topic, businessName }: { topic: string; businessName: string }) {
  const snippet = (topic || businessName).slice(0, 60);
  const cards = [
    { brand: "instagram", Icon: SiInstagram, color: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)", label: "Instagram Reel" },
    { brand: "tiktok", Icon: SiTiktok, color: "#000000", label: "TikTok" },
    { brand: "linkedin", Icon: SiLinkedin, color: "#0A66C2", label: "LinkedIn Clip" },
  ];

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="// SOCIAL REPURPOSING" title="Clips Ready for Every Platform" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ brand, Icon, color, label }) => (
            <div key={brand} className="rounded-xl overflow-hidden border border-white/10 bg-neutral-950 shadow-2xl">
              <div className="p-4 flex items-center gap-2 border-b border-white/5">
                <Icon className="size-5" style={{ color: brand === "tiktok" ? "#fff" : undefined }} />
                <span className="text-sm font-medium text-white/90">{label}</span>
              </div>
              <div className="relative aspect-[9/16]" style={{ background: color }}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-14 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="size-7 text-black fill-black ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-semibold drop-shadow line-clamp-3">
                    "{snippet}{snippet.length >= 60 ? "..." : ""}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-muted-foreground text-sm max-w-xl mx-auto">
          Each episode gets repurposed into short, platform-ready clips for Instagram, TikTok, and
          LinkedIn — so your podcast also feeds your social presence.
        </p>
      </div>
    </section>
  );
}
