// TODO: Migrate to Supabase / CMS once real screenshots & case studies are wired up.

export type ServiceCategory = "web-development" | "ai-integrator" | "ai-podcast";
export type WebSubType =
  | "landing-page"
  | "business-site"
  | "web-app"
  | "ecommerce"
  | "dashboard";

export interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  serviceCategory: ServiceCategory;
  subType?: WebSubType;
  coverImage: string;
  techStack: string[];
  isRealClient: boolean;
  statusBadge?: "Example Concept" | "Self-Initiated";
  liveUrl?: string;
  timeline?: string;
  role?: string;
}

// Neutral placeholder cover — gradient block. Real screenshots to be added later.
function placeholder(): string {
  return "";
}

export const PROJECTS: Project[] = [
  {
    slug: "flawless-awards",
    title: "Flawless Awards",
    oneLiner:
      "AI-powered custom corporate awards platform — crystal, glass, metal & acrylic",
    serviceCategory: "web-development",
    subType: "ecommerce",
    coverImage: placeholder(),
    techStack: ["Lovable", "Supabase", "shadcn/ui"],
    isRealClient: true,
    liveUrl: "https://flawlessawards.lovable.app",
  },
  {
    slug: "manarul-huda-madrasa",
    title: "মানারুল হুদা মাদরাসা চট্টগ্রাম",
    oneLiner:
      "Local Islamic education institution-এর জন্য সম্পূর্ণ institutional website",
    serviceCategory: "web-development",
    subType: "business-site",
    coverImage: placeholder(),
    techStack: ["React", "Tailwind CSS", "Framer Motion", "Lovable", "Supabase"],
    isRealClient: true,
    timeline: "৭ দিন",
  },
  {
    slug: "trackmate",
    title: "TrackMate",
    oneLiner:
      "Subscription, domain ও AI tool credit tracker — Bangladeshi founders-দের জন্য",
    serviceCategory: "web-development",
    subType: "web-app",
    coverImage: placeholder(),
    techStack: ["React", "Next.js", "TypeScript", "Supabase"],
    isRealClient: false,
    statusBadge: "Self-Initiated",
    liveUrl: "https://bdtrack.lovable.app",
  },
  {
    slug: "organic-maca-powder",
    title: "Organic Maca Powder",
    oneLiner:
      "Conversion-optimized single-product landing page — health supplement",
    serviceCategory: "web-development",
    subType: "landing-page",
    coverImage: placeholder(),
    techStack: ["Lovable", "Supabase"],
    isRealClient: true,
    liveUrl: "https://macapowder.lovable.app",
  },
  {
    slug: "shikho-lms",
    title: "শিখো LMS",
    oneLiner:
      "Tech skills training platform concept — live class, dashboard, course marketplace",
    serviceCategory: "web-development",
    subType: "dashboard",
    coverImage: placeholder(),
    techStack: ["Lovable", "Supabase", "shadcn/ui"],
    isRealClient: false,
    statusBadge: "Example Concept",
    liveUrl: "https://shikholms.lovable.app",
  },
  {
    slug: "viral-effects",
    title: "Viral Effects",
    oneLiner:
      "Single-course sales page for a content creator — video editing & growth education",
    serviceCategory: "web-development",
    subType: "landing-page",
    coverImage: placeholder(),
    techStack: ["Lovable", "Supabase"],
    isRealClient: true,
    liveUrl: "https://viral-effects.lovable.app",
  },
  {
    slug: "reachly",
    title: "Reachly",
    oneLiner:
      "AI-powered cold email automation SaaS — Bangladesh-focused outreach tool",
    serviceCategory: "web-development",
    subType: "web-app",
    coverImage: placeholder(),
    techStack: ["Lovable", "Supabase"],
    isRealClient: false,
    statusBadge: "Self-Initiated",
    liveUrl: "https://reachlyai.vercel.app",
  },
  {
    slug: "karigor",
    title: "Karigor",
    oneLiner:
      "On-demand skilled worker marketplace — electrical, plumbing, AC service booking",
    serviceCategory: "web-development",
    subType: "web-app",
    coverImage: placeholder(),
    techStack: ["Lovable", "Supabase"],
    isRealClient: true,
    liveUrl: "https://karigor.uttarontechnologies.com",
  },
  {
    slug: "ruposhee",
    title: "Ruposhee",
    oneLiner: "Bengali women's fashion & skincare full ecommerce platform",
    serviceCategory: "web-development",
    subType: "ecommerce",
    coverImage: placeholder(),
    techStack: ["React", "Next.js", "TypeScript", "Supabase", "Lovable"],
    isRealClient: true,
    timeline: "৩ সপ্তাহ",
    liveUrl: "https://ruposhee.com",
  },
  {
    slug: "mango-bazar",
    title: "Mango Bazar",
    oneLiner:
      "Full-featured mango ecommerce platform — multi-variant products, fraud checker, analytics",
    serviceCategory: "web-development",
    subType: "ecommerce",
    coverImage: placeholder(),
    techStack: ["Lovable", "Supabase"],
    isRealClient: true,
  },
];

export const WA_LINK = `https://wa.me/8801777768353?text=${encodeURIComponent(
  "Assalamu Alaikum! আমি একটা project নিয়ে আলাপ করতে চাই।",
)}`;
