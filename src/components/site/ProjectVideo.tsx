import * as React from "react";

/**
 * Detects YouTube URLs and returns an `embedUrl` suitable for a YouTube
 * iframe. Includes params that suppress most of YouTube's own branding
 * chrome (title bar overlay, related videos, share/watch-later chip).
 */
export function parseYouTubeUrl(
  url: string,
): { id: string; isShorts: boolean; embedUrl: string } | null {
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
    // Params that suppress YouTube's own branding UI:
    //   modestbranding=1 — remove YouTube word-mark from control bar
    //   rel=0            — hide related videos from other channels at end
    //   iv_load_policy=3 — hide video annotations
    //   showinfo=0       — legacy hide-info flag (kept defensively)
    //   playsinline=1    — no iOS full-screen takeover
    //   fs=1             — allow fullscreen from our own controls
    //   color=white      — subtle color tweak of progress bar
    const params =
      "rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&playsinline=1&fs=1&color=white";
    return {
      id,
      isShorts,
      embedUrl: `https://www.youtube.com/embed/${id}?${params}`,
    };
  } catch {
    return null;
  }
}

/**
 * Smart video renderer.
 *  - YouTube URLs -> responsive iframe embed (with chrome-hiding params, and
 *    an optional CSS crop that shifts the iframe up + extends its height to
 *    hide any residual title/channel bar YouTube renders anyway).
 *  - Direct video URLs -> native <video> with controls.
 */
export function ProjectVideo({
  url,
  poster,
  aspect = "16/9",
  autoPlay = false,
  className = "",
  /** Apply a small CSS crop to hide YouTube's residual title/channel bar. */
  hideYouTubeChrome = true,
}: {
  url: string;
  poster?: string | null;
  aspect?: "16/9" | "9/16";
  autoPlay?: boolean;
  className?: string;
  hideYouTubeChrome?: boolean;
}) {
  const yt = parseYouTubeUrl(url);
  const isVertical = aspect === "9/16";

  if (yt) {
    // Crop offset — pixels shifted from top + added to iframe height.
    // Small enough not to visibly distort content, large enough to hide
    // the residual title/channel overlay YouTube renders on some videos.
    const crop = hideYouTubeChrome ? 44 : 0;

    return (
      <div
        className={`relative w-full overflow-hidden bg-black ${className}`}
        style={{ aspectRatio: isVertical ? "9 / 16" : "16 / 9" }}
      >
        <iframe
          src={`${yt.embedUrl}${autoPlay ? "&autoplay=1&mute=1" : ""}`}
          title="Video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute left-0 w-full"
          style={{ top: `-${crop}px`, height: `calc(100% + ${crop * 2}px)` }}
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
