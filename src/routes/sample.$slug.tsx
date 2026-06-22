import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play, Rss } from "lucide-react";
import {
  SiSpotify, SiApplepodcasts, SiYoutube, SiInstagram, SiTiktok,
  SiFacebook, SiX, SiGoogle,
} from "react-icons/si";
import { Linkedin as SiLinkedin } from "lucide-react";

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
    const { signSampleRow } = await import("@/lib/sample-builder.functions");
    return await signSampleRow(row);
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

/* ---------- URL helpers ---------- */

function youTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

function isYouTubeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return youTubeVideoId(url) !== null;
}

function youTubeThumbnail(url: string): string | null {
  const id = youTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

function isSoundCloudUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "").endsWith("soundcloud.com");
  } catch {
    return false;
  }
}

function soundCloudEmbedSrc(url: string): string {
  const params = new URLSearchParams({
    url,
    color: "#ff5500",
    auto_play: "true",
    hide_related: "true",
    show_comments: "false",
    show_user: "false",
    show_reposts: "false",
    show_teaser: "false",
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

function YouTubeEmbed({
  url,
  className,
  autoplay = false,
  minimal = false,
}: {
  url: string;
  className?: string;
  autoplay?: boolean;
  minimal?: boolean;
}) {
  const id = youTubeVideoId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    ...(minimal ? { controls: "0", showinfo: "0", iv_load_policy: "3" } : {}),
  });
  return (
    <iframe
      src={`https://www.youtube.com/embed/${id}?${params.toString()}`}
      title="YouTube player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className={cn("size-full border-0", className)}
    />
  );
}

function YouTubeThumb({ url, className }: { url: string; className?: string }) {
  const src = youTubeThumbnail(url);
  if (!src) return null;
  const id = youTubeVideoId(url);
  return (
    <img
      src={src}
      alt=""
      className={cn("size-full object-cover", className)}
      onError={(e) => {
        if (id) (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }}
    />
  );
}

function SoundCloudEmbed({ url, className }: { url: string; className?: string }) {
  return (
    <iframe
      src={soundCloudEmbedSrc(url)}
      title="SoundCloud player"
      allow="autoplay"
      scrolling="no"
      frameBorder={0}
      className={cn("w-full border-0", className)}
    />
  );
}

type AudienceCategory = "marketers" | "creators" | "businesses" | "educators";

const AUDIENCE_HERO_COPY: Record<AudienceCategory, string> = {
  marketers:
    "B2B and content marketers use this service to repurpose blog posts, case studies, and campaign briefs into branded audio — published to Spotify, Apple Podcasts, LinkedIn, and 10+ platforms in one click.",
  creators:
    "Content creators use this service to transform YouTube videos, newsletters, and blog posts into podcast episodes — reaching audio-first audiences on Spotify and Apple Podcasts without extra hours of recording.",
  businesses:
    "SMBs and growing brands use this service to launch and run thought-leadership podcasts that reach customers on Spotify, Apple Podcasts, LinkedIn, and YouTube — without hiring a production team.",
  educators:
    "Teachers, course creators, and trainers use this service to convert PDFs, lesson plans, and written material into engaging audio episodes — accessible on Spotify, Apple Podcasts, or as private student podcast feeds.",
};

type CtaCopy = { headlinePrefix: string; emphasis: string; headlineSuffix?: string; subheadline: string };

const AUDIENCE_CTA_COPY: Record<AudienceCategory, CtaCopy> = {
  marketers: {
    headlinePrefix: "Your Content Library Is Already a ",
    emphasis: "Podcast",
    subheadline:
      "Stop letting blog posts die on the page. This service turns everything you've already written into professional audio — published everywhere, automatically.",
  },
  creators: {
    headlinePrefix: "Your Videos and Newsletters Are Already ",
    emphasis: "Episodes",
    subheadline:
      "Launch your podcast today — no mic, no editing, no extra hours. Paste your content, pick a voice, and publish to Spotify and Apple Podcasts.",
  },
  businesses: {
    headlinePrefix: "Your Brand Deserves a ",
    emphasis: "Podcast",
    subheadline:
      "Launch your thought-leadership show today. Professional quality, zero production overhead, published everywhere automatically.",
  },
  educators: {
    headlinePrefix: "Your Lesson Plans Are Ready to ",
    emphasis: "Listen To",
    subheadline:
      "Upload your PDFs. This service narrates, formats, and distributes — students learn on their own schedule.",
  },
};

function normalizeAudience(value: unknown): AudienceCategory {
  return value === "marketers" || value === "creators" || value === "businesses" || value === "educators"
    ? value
    : "businesses";
}

function SamplePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(sampleQuery(slug));
  if (!data) return <NotFoundView />;

  const platforms = (data.platforms as string[]) ?? [];
  const moduleOrder = (data.module_order as string[]) ?? [];
  const audience = normalizeAudience((data as any).audience_category);
  const heroCopy = AUDIENCE_HERO_COPY[audience];
  const ctaCopy = AUDIENCE_CTA_COPY[audience];
  const episodeTitle =
    data.episode_title?.trim() ||
    (data.topic ? `Episode 1: ${data.topic.split(/[.!?\n]/)[0].trim()}` : "Episode 1");

  return (
    <main className="min-h-screen bg-background">
      <section className="section-glow-hero relative overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          {data.logo_url ? (
            <img
              src={data.logo_url}
              alt={`${data.business_name} logo`}
              className="mx-auto mb-6 max-h-24 rounded-lg bg-white/95 object-contain p-3"
            />
          ) : (
            <div className="mx-auto mb-6 size-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-orange text-4xl font-bold text-white">
              {data.business_name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            // YOUR PODCAST PREVIEW
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            A Podcast Preview for{" "}
            <span className="text-gradient-vo">{data.business_name}</span>
          </h1>
          <h2 className="mt-3 text-xl sm:text-2xl text-muted-foreground font-normal">
            Here's What Your Podcast Could Look Like
          </h2>
          <p className="mt-6 text-base text-foreground/80 max-w-2xl mx-auto">
            {heroCopy}
          </p>

          <p className="mt-6 text-sm text-muted-foreground">
            This is a free preview — no commitment required.
          </p>
        </div>
      </section>

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
              audioUrl={data.audio_url}
              videoUrl={data.video_url}
            />
          );
        }
        if (mod === "video" && data.show_video) {
          return (
            <VideoModule
              key="video"
              businessName={data.business_name}
              episodeTitle={episodeTitle}
              videoUrl={data.video_url}
            />
          );
        }
        if (mod === "smm" && data.show_smm) {
          return (
            <SmmModule
              key="smm"
              topic={data.topic}
              businessName={data.business_name}
              clipInstagram={data.clip_instagram_url}
              clipTiktok={data.clip_tiktok_url}
              clipLinkedin={data.clip_linkedin_url}
            />
          );
        }
        return null;
      })}

      <section className="section-glow-cta relative overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-4xl sm:text-5xl">
            {ctaCopy.headlinePrefix}
            <span className="text-gradient-vo">{ctaCopy.emphasis}</span>
            {ctaCopy.headlineSuffix}
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            {ctaCopy.subheadline}
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

/* ---------- Audio hook ---------- */

function useAudioPlayer(src: string | null) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audio.preload = "metadata";
    ref.current = audio;
    const onTime = () => {
      if (audio.duration > 0) setProgress(audio.currentTime / audio.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      ref.current = null;
    };
  }, [src]);

  const toggle = () => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return { playing, progress, toggle, available: !!src };
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
  platforms, businessName, logoUrl, episodeTitle, topic, audioUrl, videoUrl,
}: {
  platforms: string[];
  businessName: string;
  logoUrl: string | null;
  episodeTitle: string;
  topic: string;
  audioUrl: string | null;
  videoUrl: string | null;
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
            <SpotifyMock businessName={businessName} logoUrl={logoUrl} episodeTitle={episodeTitle} topic={topic} audioUrl={audioUrl} />
          )}
          {platforms.includes("apple") && (
            <AppleMock businessName={businessName} logoUrl={logoUrl} episodeTitle={episodeTitle} topic={topic} audioUrl={audioUrl} />
          )}
          {platforms.includes("youtube") && (
            <YouTubeMock businessName={businessName} logoUrl={logoUrl} episodeTitle={episodeTitle} videoUrl={videoUrl} />
          )}
        </div>
      </div>
    </section>
  );
}

function LogoTile({ logoUrl, label, className }: { logoUrl: string | null; label: string; className?: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" className={cn("object-contain bg-white", className)} />;
  }
  return (
    <div className={cn("flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br from-primary to-orange", className)}>
      {label.slice(0, 1).toUpperCase()}
    </div>
  );
}

function SpotifyMock({ businessName, logoUrl, episodeTitle, topic, audioUrl }: {
  businessName: string; logoUrl: string | null; episodeTitle: string; topic: string; audioUrl: string | null;
}) {
  const isYt = !!audioUrl && isYouTubeUrl(audioUrl);
  const isSc = !!audioUrl && isSoundCloudUrl(audioUrl);
  const nativeSrc = audioUrl && !isYt && !isSc ? audioUrl : null;
  const { playing, progress, toggle, available } = useAudioPlayer(nativeSrc);
  const [scOpen, setScOpen] = useState(false);
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
        {isYt && audioUrl ? (
          <div className="mb-3 aspect-video w-full rounded-md overflow-hidden bg-black">
            <YouTubeEmbed url={audioUrl} />
          </div>
        ) : isSc && audioUrl && scOpen ? (
          <div className="mb-3 rounded-md overflow-hidden">
            <SoundCloudEmbed url={audioUrl} className="h-[166px]" />
          </div>
        ) : (
          <>
            <button
              onClick={isSc ? () => setScOpen(true) : (available ? toggle : undefined)}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform",
                (available || isSc) && "hover:scale-105 active:scale-95",
              )}
              style={{ background: "#1DB954" }}
              aria-label={playing ? "Pause" : "Play"}
              type="button"
            >
              {playing
                ? <Pause className="size-6 text-black fill-black" />
                : <Play className="size-6 text-black fill-black ml-0.5" />}
            </button>
            {available && (
              <div className="mb-3 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${progress * 100}%`, background: "#1DB954" }} />
              </div>
            )}
          </>
        )}
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

function AppleMock({ businessName, logoUrl, episodeTitle, topic, audioUrl }: {
  businessName: string; logoUrl: string | null; episodeTitle: string; topic: string; audioUrl: string | null;
}) {
  const isYt = !!audioUrl && isYouTubeUrl(audioUrl);
  const isSc = !!audioUrl && isSoundCloudUrl(audioUrl);
  const nativeSrc = audioUrl && !isYt && !isSc ? audioUrl : null;
  const { playing, progress, toggle, available } = useAudioPlayer(nativeSrc);
  const [scOpen, setScOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden border border-black/10 shadow-2xl bg-white text-neutral-900">
      <div className="p-5 flex items-center gap-2">
        <SiApplepodcasts className="size-7" style={{ color: "#9933CC" }} />
        <span className="font-semibold text-sm">Apple Podcasts</span>
      </div>
      <div className="px-5 pb-5 text-center">
        <LogoTile logoUrl={logoUrl} label={businessName} className="size-36 mx-auto rounded-2xl shadow-lg" />
        <h3 className="mt-4 font-bold text-xl">{businessName}</h3>
        <p className="text-xs" style={{ color: "#9933CC" }}>Business · Updated today</p>
      </div>
      <div className="border-t border-black/5 px-5 py-4 bg-neutral-50">
        <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Latest Episode</p>
        <p className="font-medium text-sm">{episodeTitle}</p>
        {topic && <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{topic}</p>}
        {isYt && audioUrl ? (
          <div className="mt-3 aspect-video w-full rounded-md overflow-hidden bg-black">
            <YouTubeEmbed url={audioUrl} />
          </div>
        ) : isSc && audioUrl && scOpen ? (
          <div className="mt-3 rounded-md overflow-hidden">
            <SoundCloudEmbed url={audioUrl} className="h-[166px]" />
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={isSc ? () => setScOpen(true) : (available ? toggle : undefined)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #9933CC, #E91E63)" }}
            >
              {playing
                ? <><Pause className="size-3 fill-white" /> Pause</>
                : <><Play className="size-3 fill-white" /> Play</>}
            </button>
            {available && (
              <div className="mt-3 h-1 w-full rounded-full bg-black/10 overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${progress * 100}%`, background: "linear-gradient(135deg, #9933CC, #E91E63)" }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function YouTubeMock({ businessName, logoUrl, episodeTitle, videoUrl }: {
  businessName: string; logoUrl: string | null; episodeTitle: string; videoUrl: string | null;
}) {
  const [playing, setPlaying] = useState(false);
  const youtube = videoUrl && isYouTubeUrl(videoUrl) ? videoUrl : null;
  return (
    <div className="rounded-xl overflow-hidden border border-black/10 shadow-2xl bg-white text-neutral-900">
      <div className="p-4 flex items-center gap-2 border-b border-black/5">
        <SiYoutube className="size-7" style={{ color: "#FF0000" }} />
        <span className="font-semibold text-sm">YouTube Podcasts</span>
      </div>
      <div className="relative aspect-video bg-neutral-900">
        {videoUrl && playing ? (
          youtube ? (
            <YouTubeEmbed url={youtube} className="absolute inset-0" autoplay minimal />
          ) : (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="absolute inset-0 size-full object-contain bg-black"
            />
          )
        ) : (
          <>
            {youtube ? (
              <YouTubeThumb url={youtube} className="absolute inset-0 size-full" />
            ) : (
              <LogoTile logoUrl={logoUrl} label={businessName} className="absolute inset-0 size-full opacity-90" />
            )}
            <button
              type="button"
              onClick={videoUrl ? () => setPlaying(true) : undefined}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label="Play"
            >
              <span
                className={cn(
                  "size-16 rounded-full flex items-center justify-center transition-transform",
                  videoUrl && "group-hover:scale-110",
                )}
                style={{ background: "rgba(0,0,0,0.7)" }}
              >
                <Play className="size-8 text-white fill-white ml-1" />
              </span>
            </button>
            <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 text-white px-1.5 py-0.5 rounded">12:34</span>
          </>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-sm leading-snug line-clamp-2">{episodeTitle}</p>
        <p className="text-xs text-neutral-600 mt-1">{businessName}</p>
        <p className="text-xs text-neutral-500 mt-1">2.4K views · 1 hour ago</p>
      </div>
    </div>
  );
}

function VideoModule({ businessName, episodeTitle, videoUrl }: { businessName: string; episodeTitle: string; videoUrl: string | null }) {
  const [playing, setPlaying] = useState(false);
  const youtube = videoUrl && isYouTubeUrl(videoUrl) ? videoUrl : null;
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-4xl">
        <SectionHeader eyebrow="// VIDEO PODCAST" title="Your Episode, Also As a Video" />
        <div className="rounded-xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl">
          <div className="relative aspect-video bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
            {videoUrl && playing ? (
              youtube ? (
                <YouTubeEmbed url={youtube} className="absolute inset-0" autoplay minimal />
              ) : (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="absolute inset-0 size-full object-contain bg-black"
                />
              )
            ) : (
              <>
                {youtube ? (
                  <YouTubeThumb url={youtube} className="absolute inset-0 size-full" />
                ) : (
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
                )}
                {youtube && <div className="absolute inset-0 bg-black/30" />}
                <button
                  type="button"
                  onClick={videoUrl ? () => setPlaying(true) : undefined}
                  className={cn(
                    "relative z-10 size-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl transition-transform",
                    videoUrl && "hover:scale-105 active:scale-95",
                  )}
                  aria-label="Play"
                >
                  <Play className="size-9 text-black fill-black ml-1" />
                </button>
                <div className="absolute top-5 left-5 right-5 z-10">
                  <p className="text-white/80 text-xs font-mono drop-shadow">{businessName} · Video Podcast</p>
                  {!videoUrl && <p className="text-white font-bold text-xl mt-1 line-clamp-2 drop-shadow">{episodeTitle}</p>}
                </div>
              </>
            )}
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

function SmmClipCard({
  brand, Icon, color, label, snippet, clipUrl, iconColor, iconBg,
}: {
  brand: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  label: string;
  snippet: string;
  clipUrl: string | null;
  iconColor?: string;
  iconBg?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const youtube = clipUrl && isYouTubeUrl(clipUrl) ? clipUrl : null;
  return (
    <div key={brand} className="rounded-xl overflow-hidden border border-white/10 bg-neutral-950 shadow-2xl">
      <div className="p-4 flex items-center gap-2 border-b border-white/5">
        {iconBg ? (
          <div className="size-6 rounded-md flex items-center justify-center shrink-0" style={{ background: iconBg }}>
            <Icon className="size-4" style={iconColor ? { color: iconColor } : undefined} />
          </div>
        ) : (
          <Icon className="size-5" style={iconColor ? { color: iconColor } : undefined} />
        )}
        <span className="text-sm font-medium text-white/90">{label}</span>
      </div>
      <div className="relative aspect-[9/16]" style={{ background: color }}>
        {clipUrl && playing ? (
          youtube ? (
            <YouTubeEmbed url={youtube} className="absolute inset-0" autoplay minimal />
          ) : (
            <video
              src={clipUrl}
              controls
              autoPlay
              playsInline
              className="absolute inset-0 size-full object-cover bg-black"
            />
          )
        ) : (
          <>
            {youtube && (
              <YouTubeThumb url={youtube} className="absolute inset-0 size-full" />
            )}
            <div className="absolute inset-0 bg-black/30" />
            <button
              type="button"
              onClick={clipUrl ? () => setPlaying(true) : undefined}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label="Play"
            >
              <span
                className={cn(
                  "size-14 rounded-full bg-white/90 flex items-center justify-center transition-transform",
                  clipUrl && "group-hover:scale-110",
                )}
              >
                <Play className="size-7 text-black fill-black ml-0.5" />
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SmmModule({
  topic, businessName, clipInstagram, clipTiktok, clipLinkedin,
}: {
  topic: string;
  businessName: string;
  clipInstagram: string | null;
  clipTiktok: string | null;
  clipLinkedin: string | null;
}) {
  const snippet = (topic || businessName).slice(0, 60);
  const cards = [
    { brand: "instagram", Icon: SiInstagram, color: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)", label: "Instagram Reel", clipUrl: clipInstagram, iconBg: "linear-gradient(135deg, #833AB4, #FD1D1D, #F56040)", iconColor: "#ffffff" },
    { brand: "tiktok", Icon: SiTiktok, color: "#000000", label: "TikTok", clipUrl: clipTiktok, iconBg: "#000000", iconColor: "#00F2EA" },
    { brand: "linkedin", Icon: SiLinkedin, color: "#0A66C2", label: "LinkedIn Clip", clipUrl: clipLinkedin, iconBg: "#ffffff", iconColor: "#0A66C2" },
  ];

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="// SOCIAL REPURPOSING" title="Clips Ready for Every Platform" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c) => (
            <SmmClipCard
              key={c.brand}
              brand={c.brand}
              Icon={c.Icon}
              color={c.color}
              label={c.label}
              snippet={snippet}
              clipUrl={c.clipUrl}
              iconColor={c.iconColor}
              iconBg={c.iconBg}
            />
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
