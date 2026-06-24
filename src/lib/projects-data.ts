// Static projects data. TODO: migrate to a Supabase `projects` table once the
// admin panel backend is built.

import type { BlogCategory } from "@/lib/blog-data";

export type ProjectCategory = BlogCategory; // reuse same 3-category scheme

export type ProjectResult = { value: string; label: string };
export type ProjectTestimonial = { quote: string; name: string; title: string };

export type Project = {
  slug: string;
  title: string;
  category: ProjectCategory;
  clientName: string;
  industry: string;
  coverImage: string;
  shortDescription: string;
  challenge: string[];
  solution: string[];
  techStack: string[];
  results: ProjectResult[];
  galleryImages: string[];
  testimonial: ProjectTestimonial;
};

export const PROJECT_FILTERS: ReadonlyArray<"All" | ProjectCategory> = [
  "All",
  "Web Development",
  "AI Integrator",
  "AI Podcast",
] as const;

/** Per-category closing CTA copy on the detail page. */
export const CATEGORY_CTA: Record<
  ProjectCategory,
  { subheadline: string; ctaLabel: string; href: string }
> = {
  "Web Development": {
    subheadline: "Let's talk about your website or web app.",
    ctaLabel: "Discuss Your Project",
    href: "/services/web-development",
  },
  "AI Integrator": {
    subheadline: "Let's talk about automating your business with AI.",
    ctaLabel: "Discuss Your Project",
    href: "/services/ai-integrator",
  },
  "AI Podcast": {
    subheadline: "Let's talk about launching your podcast.",
    ctaLabel: "Start Your Podcast",
    href: "/services/ai-podcast",
  },
};

// ---------- Project 1: Web Development ----------
const PROJECT_CEDAR: Project = {
  slug: "ecommerce-store-cedar-leather-co",
  category: "Web Development",
  title: "A Local Storefront That Sells Online, Built for Local Payments",
  clientName: "Cedar Leather Co.",
  industry: "Handmade Goods Retail",
  coverImage:
    "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A full eCommerce store with local payment gateway integration and smooth checkout.",
  challenge: [
    "Cedar Leather Co. sold beautifully crafted goods entirely through in-person markets and Instagram DMs. Every sale required back-and-forth messaging, manual payment confirmation, and no real way to scale beyond what one person could personally respond to.",
    "Orders were getting lost in message threads, inventory existed only in a notebook, and there was no clean way for a returning customer to simply buy again without restarting the conversation.",
  ],
  solution: [
    "I built a complete product catalog with categories, variant selection (color/size), and a checkout flow integrated with a local payment gateway customers already trusted. Order management, inventory tracking, and customer notifications all run automatically — no more manual DM-based sales.",
    "The storefront was designed to feel like an extension of the brand's in-person presence: warm photography, calm typography, and a checkout that takes well under a minute on mobile. The owner now spends her time making products instead of confirming payments.",
  ],
  techStack: ["Next.js", "Tailwind CSS", "Supabase", "Local Payment Gateway API", "Vercel"],
  results: [
    { value: "0", label: "Manual order confirmations needed" },
    { value: "58%", label: "Of total sales now online within 90 days" },
    { value: "24/7", label: "Store open vs. DM-dependent hours before" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "I used to lose orders in my DMs constantly. Now everything just works while I sleep.",
    name: "Maria Santos",
    title: "Founder, Cedar Leather Co.",
  },
};

// ---------- Project 2: AI Podcast ----------
const PROJECT_SUMMIT: Project = {
  slug: "podcast-launch-summit-strategy-group",
  category: "AI Podcast",
  title: "A Weekly Thought-Leadership Show, Built for Spotify Discovery",
  clientName: "Summit Strategy Group",
  industry: "Business Consulting",
  coverImage:
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A weekly business podcast launched and optimized for Spotify's listener base.",
  challenge: [
    "Summit Strategy Group's partners had deep expertise and wanted to build industry authority through a podcast, but none of them had time to learn audio editing, manage a recording schedule, or figure out podcast distribution on top of client work.",
    "Previous attempts had stalled out after two episodes because every step — scripting, recording, editing, publishing — required a senior partner's calendar time the firm couldn't spare.",
  ],
  solution: [
    "I turned the firm's existing blog posts and case studies into a weekly solo-commentary podcast — sending over a topic each week and receiving back a fully produced, branded episode ready to publish. The show launched with consistent branding and was optimized specifically for Spotify's discovery algorithm and playlist placement.",
    "Episode titles, descriptions, and chapter markers were structured around the search terms their target clients actually use, so episodes started showing up in Spotify's recommended feed alongside larger, established business shows.",
  ],
  techStack: [
    "AI Voice Production",
    "Branded Intro/Outro",
    "Spotify for Podcasters",
    "RSS Distribution",
  ],
  results: [
    { value: "12 episodes", label: "Published in the first quarter, zero recording required" },
    { value: "850+", label: "Spotify followers within 90 days" },
    { value: "3", label: "New client inquiries directly citing the podcast" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1551817958-d9d86fb29431?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1581368135153-a506cf13b1e1?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1487537708572-3c850b5e856e?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "We sound like a firm five times our size. And nobody on our team ever touched a microphone.",
    name: "Patricia Walsh",
    title: "Managing Partner, Summit Strategy Group",
  },
};

const PROJECTS: Project[] = [PROJECT_CEDAR, PROJECT_SUMMIT];

export function getAllProjects(): Project[] {
  return PROJECTS;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getRelatedProjects(slug: string, limit = 3): Project[] {
  return PROJECTS.filter((p) => p.slug !== slug).slice(0, limit);
}
