import * as React from "react";

/**
 * Detects YouTube URLs (watch, youtu.be, shorts, embed) and returns an
 * `embedUrl` suitable for a YouTube iframe. Returns null for anything else
 * (direct file URLs, uploaded media, etc.).
 */
export function parseYouTubeUrl(url: string): { id: string; isShorts: boolean; embedUrl: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    let isShorts = false;

    if (host === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0] || null;
    } else if (host.endsWith("youtube.com") || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2] || null;
        isShorts = true;
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2] || null;
      }
    }
    if (!id || !/^[A-Za-z0-9_-]{6,}$/.test(id)) return null;
    return {
      id,
      isShorts,
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
    };
  } catch {
    return null;
  }
}

/**
 * Smart video renderer.
 *  - YouTube URLs -> responsive iframe embed.
 *  - Direct video URLs -> native <video> with controls.
 *
 * `aspect` controls the outer container aspect ratio:
 *  - "16/9" — landscape (Video Podcast / YouTube mockup)
 *  - "9/16" — vertical (SMM clip cards). For 16:9 YouTube videos, the embed
 *    is centered/letterboxed inside the 9:16 frame with black bars; native
 *    portrait uploads fill the frame. YouTube Shorts URLs render the same
 *    embed (YouTube auto-detects vertical content).
 */
export function ProjectVideo({
  url,
  poster,
  aspect = "16/9",
  autoPlay = false,
  className = "",
}: {
  url: string;
  poster?: string | null;
  aspect?: "16/9" | "9/16";
  autoPlay?: boolean;
  className?: string;
}) {
  const yt = parseYouTubeUrl(url);
  const isVertical = aspect === "9/16";

  if (yt) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-black ${className}`}
        style={{ aspectRatio: isVertical ? "9 / 16" : "16 / 9" }}
      >
        {/* Center a 16/9 iframe inside the frame — letterboxes on 9/16. */}
        <iframe
          src={`${yt.embedUrl}${autoPlay ? "&autoplay=1" : ""}`}
          title="Video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className={
            isVertical
              ? "absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
              : "absolute inset-0 h-full w-full"
          }
        />
      </div>
    );
  }

  return (
    <video
      src={url}
      controls
      autoPlay={autoPlay}
      preload="metadata"
      poster={poster || undefined}
      playsInline
      className={`w-full bg-black ${className}`}
      style={{ aspectRatio: isVertical ? "9 / 16" : "16 / 9" }}
    />
  );
}
