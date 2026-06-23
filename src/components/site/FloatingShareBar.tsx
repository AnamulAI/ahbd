import { useEffect, useRef, useState } from "react";
import { Link as LinkIcon, Share2, Check } from "lucide-react";
import {
  SiX,
  SiFacebook,
  SiThreads,
  SiPinterest,
  SiWhatsapp,
  SiTelegram,
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { toast } from "sonner";

type Props = {
  title: string;
  image?: string;
};

export function FloatingShareBar({ title, image }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const eUrl = encodeURIComponent(url);
  const eTitle = encodeURIComponent(title);
  const eImg = image ? encodeURIComponent(image) : "";

  const items: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${eUrl}&text=${eTitle}`,
      icon: <SiX className="h-4 w-4" />,
      color: "#ffffff",
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${eUrl}`,
      icon: <FaLinkedin className="h-4 w-4" />,
      color: "#0A66C2",
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${eUrl}`,
      icon: <SiFacebook className="h-4 w-4" />,
      color: "#1877F2",
    },
    {
      label: "Share on Threads",
      href: `https://www.threads.net/intent/post?text=${eTitle}%20${eUrl}`,
      icon: <SiThreads className="h-4 w-4" />,
      color: "#ffffff",
    },
    {
      label: "Share on Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${eUrl}&description=${eTitle}${eImg ? `&media=${eImg}` : ""}`,
      icon: <SiPinterest className="h-4 w-4" />,
      color: "#E60023",
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${eTitle}%20${eUrl}`,
      icon: <SiWhatsapp className="h-4 w-4" />,
      color: "#25D366",
    },
    {
      label: "Share on Telegram",
      href: `https://t.me/share/url?url=${eUrl}&text=${eTitle}`,
      icon: <SiTelegram className="h-4 w-4" />,
      color: "#26A5E4",
    },
    {
      label: "Copy link",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success("Link copied!");
          setTimeout(() => setCopied(false), 1600);
        } catch {
          toast.error("Couldn't copy link");
        }
      },
      icon: copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <LinkIcon className="h-4 w-4" />
      ),
      color: "#3B82F6",
    },
  ];

  // Stack centered: half above, half below trigger. 8 items → 4 above, 4 below.
  const half = Math.ceil(items.length / 2);
  const above = items.slice(0, half);
  const below = items.slice(half);

  const btnBase =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#16181D] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08]";

  const renderItem = (
    item: (typeof items)[number],
    i: number,
    direction: "up" | "down",
  ) => {
    const delay = `${i * 35}ms`;
    const style: React.CSSProperties = {
      transitionDelay: open ? delay : "0ms",
      transform: open
        ? "translateY(0) scale(1)"
        : `translateY(${direction === "up" ? 12 : -12}px) scale(0.6)`,
      opacity: open ? 1 : 0,
      pointerEvents: open ? "auto" : "none",
      color: item.color,
    };
    const className = `${btnBase} transition-[transform,opacity,background-color] duration-200`;
    if (item.href) {
      return (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          aria-label={item.label}
          title={item.label}
          className={className}
          style={style}
        >
          {item.icon}
        </a>
      );
    }
    return (
      <button
        key={item.label}
        type="button"
        aria-label={item.label}
        title={item.label}
        onClick={item.onClick}
        className={className}
        style={style}
      >
        {item.icon}
      </button>
    );
  };

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex"
      aria-label="Share this post"
    >
      <div className="pointer-events-auto flex flex-col-reverse items-center gap-2">
        {above.map((it, i) => renderItem(it, above.length - 1 - i, "up"))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close share menu" : "Share this post"}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#16181D] text-[color:var(--primary)] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--primary)]/40 hover:bg-white/[0.08]"
      >
        <Share2 className="h-5 w-5" />
      </button>

      <div className="pointer-events-auto flex flex-col items-center gap-2">
        {below.map((it, i) => renderItem(it, i, "down"))}
      </div>
    </div>
  );
}
