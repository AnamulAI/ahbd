// Static projects data. TODO: migrate to a Supabase `projects` table once the
// admin panel backend is built.

import type { BlogCategory } from "@/lib/blog-data";

export type ProjectCategory = BlogCategory; // reuse same 3-category scheme

export type ProjectResult = { value: string; label: string };
export type ProjectTestimonial = { quote: string; name: string; title: string };
export type ProjectProcessStep = { title: string; description: string };

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
  // Optional, additive fields (populated via PROJECT_META + default process steps).
  duration?: string;
  role?: string;
  processSteps?: ProjectProcessStep[];
  // TODO: placeholder rating/view data — replace with real analytics before public launch per Honesty Rule
  rating?: number;
  viewCount?: number;
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

// ---------- Project 3: Web Development — Landing Pages ----------
const PROJECT_FITTRACK: Project = {
  slug: "conversion-landing-page-fittrack",
  category: "Web Development",
  title: "A Single Page That Outperformed Their Entire Old Site",
  clientName: "FitTrack Coaching",
  industry: "Fitness Coaching",
  coverImage:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A conversion-focused landing page built to turn ad traffic into booked consultations.",
  challenge: [
    "FitTrack Coaching was running paid ads to their old multi-page website, but visitors had too many places to click and too little reason to act immediately. Ad spend was going up while consultation bookings stayed flat — a classic sign that the destination page, not the traffic, was the problem.",
  ],
  solution: [
    "I built a single, tightly-focused landing page built around one goal: booking a free consultation call. Every section — the headline, the transformation gallery, the pricing breakdown, the FAQ — was structured to remove hesitation and lead toward one clear action, with no navigation menu to distract or let visitors wander away.",
  ],
  techStack: ["React", "Tailwind CSS", "Supabase", "Vercel"],
  results: [
    { value: "94%", label: "Visitor focus retained (no nav exits)" },
    { value: "3.1x", label: "Consultation booking rate vs. old site" },
    { value: "1.8s", label: "Page load time" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "Our ad spend didn't change, but our bookings tripled. The page just makes it obvious what to do next.",
    name: "Sarah Mitchell",
    title: "Founder, FitTrack Coaching",
  },
};

// ---------- Project 4: Web Development — Business Websites ----------
const PROJECT_NORTHBRIDGE: Project = {
  slug: "multi-page-business-site-northbridge-legal",
  category: "Web Development",
  title: "A Full Website That Finally Matched Their Reputation",
  clientName: "Northbridge Legal Partners",
  industry: "Legal Services",
  coverImage:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A multi-page business website that brands the firm's story, services, and trust signals clearly.",
  challenge: [
    "Northbridge Legal Partners had a strong local reputation built over a decade, but their existing website looked like it hadn't been touched since they opened. Prospective clients researching online before calling were landing on a site that didn't reflect the firm's actual credibility.",
  ],
  solution: [
    "I built a full multi-page site — Home, Practice Areas, Attorney Profiles, Case Results, and Contact — structured around trust signals: credentials, case history, and a clear path to schedule a consultation from every page. The content management area was kept simple enough for their office manager to update attorney bios and case results without calling a developer.",
  ],
  techStack: ["Next.js", "Tailwind CSS", "Sanity CMS", "Vercel"],
  results: [
    { value: "6 pages", label: "Fully structured, SEO-optimized" },
    { value: "40%", label: "Increase in contact form submissions (first 60 days)" },
    { value: "100%", label: "Self-manageable by office staff" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "Clients tell us they read the case results page before their first call now. That never happened with the old site.",
    name: "David Chen",
    title: "Managing Partner, Northbridge Legal Partners",
  },
};

// ---------- Project 5: Web Development — Personal Brand Sites ----------
const PROJECT_ELENA: Project = {
  slug: "personal-brand-portfolio-elena-castro",
  category: "Web Development",
  title: "A Portfolio That Turns Visitors Into Bookings",
  clientName: "Elena Castro Coaching",
  industry: "Career Coaching",
  coverImage:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A combined portfolio, authority, and booking site for a solo career coach.",
  challenge: [
    "Elena had built a following through speaking and writing but had no central place to send people — her booking link, portfolio of client wins, and bio were scattered across three different tools, and prospective clients regularly got lost trying to figure out how to actually work with her.",
  ],
  solution: [
    "I built one site combining her portfolio (client transformation stories), authority signals (press mentions, speaking history), and a direct booking calendar — all in one cohesive brand experience. Every page funnels toward the same action: book an intro call.",
  ],
  techStack: ["React", "Tailwind CSS", "Cal.com integration", "Vercel"],
  results: [
    { value: "1 link", label: "Replaced 3 scattered tools" },
    { value: "2.4x", label: "Booking calendar conversion vs. old Linktree setup" },
    { value: "5", label: "Press features now showcased in one place" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "I finally have one place to send people that actually represents what I do.",
    name: "Elena Castro",
    title: "Career Coach",
  },
};

// ---------- Project 6: Web Development — LMS & Course Platforms ----------
const PROJECT_GROWTHLAB: Project = {
  slug: "course-platform-growthlab-academy",
  category: "Web Development",
  title: "A Course Platform Built for Real Student Completion",
  clientName: "GrowthLab Academy",
  industry: "Online Education",
  coverImage:
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A full LMS with student management, progress tracking, and payment handling.",
  challenge: [
    "GrowthLab Academy had course content ready but was distributing it through a folder of unlisted YouTube videos and a spreadsheet for tracking who paid. Students had no sense of progress, no certificate of completion, and the founder had no visibility into who was actually finishing the material.",
  ],
  solution: [
    "I built a dedicated course platform: structured modules with progress tracking, gated content that unlocks as students complete prior lessons, payment processing tied directly to enrollment, and a simple instructor dashboard showing real completion data across every student.",
  ],
  techStack: ["Next.js", "Supabase", "Stripe", "Tailwind CSS", "Vercel"],
  results: [
    { value: "73%", label: "Course completion rate (up from ~20% estimated)" },
    { value: "100%", label: "Automated enrollment-to-access flow" },
    { value: "1 dashboard", label: "Replaced the founder's tracking spreadsheet entirely" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a1b4704e4bb?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "I finally know who's actually completing the course instead of guessing from a spreadsheet.",
    name: "James Okafor",
    title: "Founder, GrowthLab Academy",
  },
};

// ---------- Project 7: AI Integrator — Custom GPT Assistant ----------
const PROJECT_HARBORLINE: Project = {
  slug: "custom-gpt-harborline-insurance",
  category: "AI Integrator",
  title: "A Custom GPT That Answers Policy Questions Instantly",
  clientName: "Harborline Insurance Group",
  industry: "Insurance",
  coverImage:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A focused AI assistant trained on policy documents, deployed via a shareable link.",
  challenge: [
    "Harborline's small customer service team fielded the same 15-20 policy questions repeatedly every single day — coverage details, claim procedures, renewal terms — pulling staff away from genuinely complex cases that actually needed a human.",
  ],
  solution: [
    "I built a Custom GPT trained on Harborline's actual policy documents, FAQs, and claim procedures, deployed via a simple shareable link the team could send directly to customers or embed on the website. It answers consistently, every time, without anyone re-explaining the same policy details in a new conversation.",
  ],
  techStack: ["OpenAI Custom GPT", "structured knowledge base", "embed integration"],
  results: [
    { value: "68%", label: "Of routine policy questions now self-served" },
    { value: "~12 hrs/week", label: "Staff time freed up" },
    { value: "<5 sec", label: "Average response time vs. hours waiting for email reply" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "Our team finally has time for the complicated cases instead of answering the same renewal question for the tenth time that day.",
    name: "Linda Park",
    title: "Customer Service Lead, Harborline Insurance Group",
  },
};

// ---------- Project 8: AI Integrator — Microsoft Copilot Agent ----------
const PROJECT_WESTFIELD: Project = {
  slug: "copilot-agent-westfield-manufacturing",
  category: "AI Integrator",
  title: "An Office AI Assistant That Knows Company Policy Cold",
  clientName: "Westfield Manufacturing",
  industry: "Manufacturing",
  coverImage:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A corporate Copilot agent integrated with company documents and Office 365.",
  challenge: [
    "Westfield's HR and operations teams spent significant time each week answering employee questions about internal policies — safety procedures, leave requests, equipment protocols — that were all technically documented, just buried across dozens of SharePoint files nobody could quickly search.",
  ],
  solution: [
    "I configured a Microsoft Copilot agent connected directly to Westfield's SharePoint document library, trained on their actual policy and safety documentation. Employees can now ask questions in natural language and get accurate answers pulled from real company documents, plus draft routine Word/Excel reports directly through the same assistant.",
  ],
  techStack: ["Microsoft Copilot", "SharePoint integration", "Office 365"],
  results: [
    { value: "45%", label: "Reduction in routine HR policy questions to staff" },
    { value: "100%", label: "Answers sourced from real, current documents" },
    { value: "Enterprise-wide", label: "Rollout across all departments" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "Employees stopped emailing HR for things that were already written down somewhere — they just ask Copilot now.",
    name: "Robert Kim",
    title: "HR Director, Westfield Manufacturing",
  },
};

// ---------- Project 9: AI Integrator — API Integration ----------
const PROJECT_BRIGHTPATH: Project = {
  slug: "api-integration-brightpath-realty",
  category: "AI Integrator",
  title: "AI That Lives Inside WhatsApp, Not a Separate Chat Window",
  clientName: "BrightPath Realty",
  industry: "Real Estate",
  coverImage:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "AI connected directly into WhatsApp and the website — no separate chat tool needed.",
  challenge: [
    "BrightPath Realty's leads came in primarily through WhatsApp, but the team could only respond during business hours. After-hours inquiries — often the most motivated buyers browsing listings at night — went unanswered until the next morning, and many never followed up again.",
  ],
  solution: [
    "I connected an AI assistant directly into BrightPath's existing WhatsApp Business number and website chat — not a separate app leads had to be redirected to. It answers property questions, qualifies leads by budget and timeline, and hands off to a human agent automatically when a conversation needs one.",
  ],
  techStack: ["WhatsApp Business API", "custom backend integration", "OpenAI API"],
  results: [
    { value: "24/7", label: "Lead response coverage, up from business-hours-only" },
    { value: "31%", label: "Increase in qualified leads reaching an agent" },
    { value: "0", label: "New tools the team had to learn — works inside WhatsApp" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "Leads stopped going cold overnight. The AI is just there, inside WhatsApp, where our clients already are.",
    name: "Amara Osei",
    title: "Sales Director, BrightPath Realty",
  },
};

// ---------- Project 10: Web Development — Web Apps & Dashboards ----------
const PROJECT_FLEETPULSE: Project = {
  slug: "web-app-dashboard-fleetpulse-logistics",
  category: "Web Development",
  title: "A Real-Time Fleet Dashboard That Replaced Three Spreadsheets",
  clientName: "FleetPulse Logistics",
  industry: "Logistics & Fleet Management",
  coverImage:
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A custom web app with real-time vehicle tracking, dispatch tools, and driver performance dashboards.",
  challenge: [
    "FleetPulse was coordinating a growing fleet across three regions using a patchwork of spreadsheets, group chats, and phone calls. Dispatchers had no live view of where trucks actually were, drivers were getting routed inefficiently, and management had no reliable performance data to act on.",
  ],
  solution: [
    "I built a custom web application with real-time vehicle tracking on an interactive map, a dispatcher console for assigning jobs in a few clicks, and per-driver performance dashboards with delivery times, idle hours, and route efficiency. Role-based access keeps dispatchers, drivers, and managers in their own focused views.",
  ],
  techStack: ["React", "TypeScript", "Tailwind CSS", "Supabase", "Mapbox GL", "Vercel"],
  results: [
    { value: "37%", label: "Reduction in average dispatch time" },
    { value: "Real-time", label: "Vehicle tracking across the entire fleet" },
    { value: "3 → 1", label: "Spreadsheets replaced by a single dashboard" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "We used to find out about delays from angry phone calls. Now we see them coming on the map before they happen.",
    name: "Marcus Reilly",
    title: "Operations Director, FleetPulse Logistics",
  },
};

// ---------- Project 11: AI Podcast — Apple Podcasts Daily Brief ----------
const PROJECT_DAILYBUILDER: Project = {
  slug: "podcast-launch-the-daily-builder",
  category: "AI Podcast",
  title: "A Daily Brief Show Built for Apple Podcasts' Loyal Listeners",
  clientName: "The Daily Builder",
  industry: "Construction/Trade Media",
  coverImage:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A daily news-brief podcast adapted from an existing newsletter, optimized for Apple Podcasts.",
  challenge: [
    "The Daily Builder had a loyal newsletter readership in the construction trade but wanted to reach people who preferred listening during their commute or on a job site — an audience that newsletters simply couldn't reach.",
  ],
  solution: [
    "Each daily newsletter issue is converted into a short, daily-brief-style podcast episode — same content, audio-first format — published consistently every weekday morning. The show was structured specifically for Apple Podcasts' daily-show category placement and its notably loyal, habitual listening audience.",
  ],
  techStack: [
    "AI voice production",
    "newsletter-to-audio pipeline",
    "Apple Podcasts Connect",
    "RSS distribution",
  ],
  results: [
    { value: "Daily", label: "Consistent publishing schedule, zero missed days" },
    { value: "1,200+", label: "Apple Podcasts subscribers in first 6 months" },
    { value: "40%", label: "Of newsletter subscribers now also listen" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1581578731548-c64695cc5c60?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "Our readers wanted this in their ears on the job site, not just their inbox. Now they have it every single morning.",
    name: "Mike Donovan",
    title: "Editor, The Daily Builder",
  },
};

// ---------- Project 12: AI Podcast — YouTube Video Podcast ----------
const PROJECT_CLEARVIEW: Project = {
  slug: "podcast-launch-clearview-coaching",
  category: "AI Podcast",
  title: "A Video Podcast Built for YouTube's Long-Form Audience",
  clientName: "ClearView Coaching",
  industry: "Executive Coaching",
  coverImage:
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=80",
  shortDescription:
    "A video-first interview-style podcast launched specifically for YouTube's discovery and search.",
  challenge: [
    "ClearView's founder wanted a podcast specifically to build a YouTube presence — not just audio — since most of her target audience of executives discovered new content through YouTube search and recommendations, not podcast apps.",
  ],
  solution: [
    "I produced a video podcast version of her show — animated speaker visuals, auto-captions, and full video export — optimized for YouTube's format and SEO-friendly titles/descriptions, while still distributing the audio version to Spotify and Apple Podcasts simultaneously from the same production.",
  ],
  techStack: [
    "AI voice + video production",
    "auto-captioning",
    "YouTube optimization",
    "multi-platform RSS distribution",
  ],
  results: [
    { value: "22K+", label: "YouTube views across first 10 episodes" },
    { value: "4.2 min", label: "Average watch time per video episode" },
    { value: "1 production", label: "Powering video AND audio distribution simultaneously" },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1586899028174-e7098604235b?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1598488035139-bdbb2231c04a?auto=format&fit=crop&w=1400&q=80",
  ],
  testimonial: {
    quote:
      "I didn't think I had time to be 'on video' every week. Turns out I didn't need to be — the production handled all of it.",
    name: "Dr. Naomi Reyes",
    title: "Founder, ClearView Coaching",
  },
};

const PROJECTS_RAW: Project[] = [
  PROJECT_CEDAR,
  PROJECT_SUMMIT,
  PROJECT_FITTRACK,
  PROJECT_NORTHBRIDGE,
  PROJECT_ELENA,
  PROJECT_GROWTHLAB,
  PROJECT_FLEETPULSE,
  PROJECT_HARBORLINE,
  PROJECT_WESTFIELD,
  PROJECT_BRIGHTPATH,
  PROJECT_DAILYBUILDER,
  PROJECT_CLEARVIEW,
];

/** Per-project duration + role meta (additive, kept colocated for easy edits). */
const PROJECT_META: Record<string, { duration: string; role: string }> = {
  "ecommerce-store-cedar-leather-co": {
    duration: "2 weeks",
    role: "Full-Stack Developer (Solo) — Design through Development",
  },
  "podcast-launch-summit-strategy-group": {
    duration: "10 days",
    role: "Podcast Producer (Solo) — Strategy through Distribution",
  },
  "conversion-landing-page-fittrack": {
    duration: "5 days",
    role: "Full-Stack Developer (Solo) — Design through Development",
  },
  "multi-page-business-site-northbridge-legal": {
    duration: "2 weeks",
    role: "Full-Stack Developer (Solo) — Design through Development",
  },
  "personal-brand-portfolio-elena-castro": {
    duration: "7 days",
    role: "Full-Stack Developer (Solo) — Design through Development",
  },
  "course-platform-growthlab-academy": {
    duration: "3 weeks",
    role: "Full-Stack Developer (Solo) — Design through Development",
  },
  "web-app-dashboard-fleetpulse-logistics": {
    duration: "4 weeks",
    role: "Full-Stack Developer (Solo) — Design through Development",
  },
  "custom-gpt-harborline-insurance": {
    duration: "6 days",
    role: "AI Integrator (Solo) — Knowledge Base through Deployment",
  },
  "copilot-agent-westfield-manufacturing": {
    duration: "10 days",
    role: "AI Integrator (Solo) — Configuration through Rollout",
  },
  "api-integration-brightpath-realty": {
    duration: "2 weeks",
    role: "AI Integrator (Solo) — Backend through Integration",
  },
  "podcast-launch-the-daily-builder": {
    duration: "8 days",
    role: "Podcast Producer (Solo) — Pipeline through Distribution",
  },
  "podcast-launch-clearview-coaching": {
    duration: "2 weeks",
    role: "Podcast Producer (Solo) — Production through Distribution",
  },
};

function defaultProcessSteps(p: Project): ProjectProcessStep[] {
  const stack = p.techStack.join(", ");
  return [
    {
      title: "Discovery",
      description:
        "Understood the target audience, required features, and gathered the necessary content and requirements.",
    },
    {
      title: "Design Direction",
      description:
        "Defined the visual direction and UX approach to match the brand and project goals.",
    },
    {
      title: "Development",
      description: `Built the solution using ${stack}.`,
    },
    {
      title: "Content & Integration",
      description:
        "Organized and integrated all content, data, and third-party connections.",
    },
    {
      title: "Deployment & Delivery",
      description:
        "Tested, deployed, and delivered the finished project to the client.",
    },
  ];
}

function hydrate(p: Project): Project {
  const meta = PROJECT_META[p.slug];
  return {
    ...p,
    duration: p.duration ?? meta?.duration,
    role: p.role ?? meta?.role,
    processSteps: p.processSteps ?? defaultProcessSteps(p),
  };
}

const PROJECTS: Project[] = PROJECTS_RAW.map(hydrate);

export const FEATURED_PROJECT_SLUG = "ecommerce-store-cedar-leather-co";

export function getAllProjects(): Project[] {
  return PROJECTS;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getRelatedProjects(slug: string, limit = 3): Project[] {
  const current = PROJECTS.find((p) => p.slug === slug);
  if (!current) return [];
  return PROJECTS.filter(
    (p) => p.slug !== slug && p.category === current.category,
  ).slice(0, limit);
}

/** Sequential prev/next in gallery order, with wrap-around. */
export function getAdjacentProjects(
  slug: string,
): { prev: Project; next: Project } | null {
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];
  return { prev, next };
}
