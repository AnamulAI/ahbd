// Static blog data. TODO: migrate to a Supabase `blog_posts` table once the
// admin panel backend is built.

export type BlogCategory = "Web Development" | "AI Integrator" | "AI Podcast";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readTime: string;
  publishedDate: string; // ISO date string
  coverImage: string;
  /** Markdown-ish body: lines starting with `## ` => h2, `### ` => h3, `- ` => list item, `**...**` => bold. */
  body: string;
};

export const CATEGORY_STYLES: Record<
  BlogCategory,
  { badgeClass: string; label: string }
> = {
  "Web Development": {
    label: "Web Development",
    badgeClass:
      "bg-[color:var(--primary)]/12 text-[color:var(--primary)] border-[color:var(--primary)]/30",
  },
  "AI Integrator": {
    label: "AI Integrator",
    badgeClass:
      "bg-white/[0.06] text-white/85 border-white/15",
  },
  "AI Podcast": {
    label: "AI Podcast",
    badgeClass:
      "bg-[color:var(--orange)]/12 text-[color:var(--orange)] border-[color:var(--orange)]/30",
  },
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ai-voice-cloning-guide-for-podcasters",
    title: "The Complete Guide to AI Voice Cloning for Podcasters",
    excerpt:
      "Clone a voice from under a minute of audio, then use it for every future episode. Here's how the technology actually works, and what it's realistically good for today.",
    category: "AI Podcast",
    readTime: "6 min read",
    publishedDate: "2026-06-20",
    coverImage:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1600&q=80",
    body: `Voice cloning sounds like science fiction until you see how short the input actually needs to be. Most modern voice-cloning systems need somewhere around 60 seconds of clean audio to build a usable voice model — not hours of studio recording, just one short, clear sample.

## How It Actually Works (Without the Jargon)

A voice-cloning model listens to the sample audio and learns the specific characteristics that make a voice sound like *that* voice — pitch, pacing, accent, the way certain sounds are formed. It's not literally copying recorded clips and stitching them together; it's learning a pattern, then generating entirely new speech in that same pattern for text it has never seen before.

That's the part that surprises people: a cloned voice can read a script that didn't exist when the sample was recorded, and it will still sound like the same person speaking it.

## What It's Genuinely Good For

**Consistency at scale.** Once a voice is cloned, every future episode sounds like the same host — without that host needing to sit down and record every single time.

**Multi-language reach.** Many voice-cloning systems can carry a cloned voice across languages the original speaker may not even speak fluently — useful for podcasters wanting to publish the same show internationally without hiring multiple narrators.

**Accessibility for non-native speakers or those who dislike their recorded voice.** Some people are excellent writers and terrible at performing their own scripts on mic. Voice cloning separates "who wrote this" from "who has to read it out loud."

## The Honest Limitations

Voice cloning today is very good at *narration* — calm, structured speech. It's noticeably weaker at *spontaneous emotion* — genuine laughter, interruption, the messiness of real unscripted conversation. For solo commentary or scripted interview formats, that's rarely an issue. For shows built entirely around unscripted chemistry between hosts, it's a real limitation worth knowing about upfront.

## The Ethics Question, Briefly

Cloning someone else's voice without clear, explicit consent is where this technology gets genuinely problematic — and is exactly why any responsible voice-cloning workflow should only ever clone a voice with the direct permission of the person it belongs to, ideally the podcaster's own voice or a guest who has explicitly agreed.

## Where This Fits Into a Real Podcast Workflow

The practical use case isn't "replace yourself entirely" — it's removing the bottleneck of needing to be physically available to record every episode. Write or approve a script, let the cloned voice narrate it, and a show keeps a consistent publishing schedule even during weeks when sitting down at a microphone simply isn't possible.`,
  },
  {
    slug: "custom-code-vs-wordpress-2026",
    title:
      "Custom Code vs. WordPress: Which One Actually Saves You Money in 2026?",
    excerpt:
      "WordPress looks cheaper on day one. For most growing businesses, it quietly becomes the more expensive choice by year two. Here's the real cost breakdown.",
    category: "Web Development",
    readTime: "7 min read",
    publishedDate: "2026-06-15",
    coverImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80",
    body: `Every client conversation about a new website eventually arrives at the same question: "Why not just use WordPress? It's free."

WordPress isn't free. The software is, but almost nothing else is — and the hidden costs are exactly why this comparison matters.

## The Real Cost of "Free"

A typical WordPress business site needs a theme (often $60-200/year), 5-10 plugins for the features a modern site actually needs (forms, SEO, caching, security, page builders), and hosting that can handle plugin overhead. Add those up and a "free" platform often costs $400-1,500 a year before anyone writes a line of content.

Custom-coded sites have no plugin tax. The features you need are built directly into the code, which means no recurring license fees and no plugin conflicts breaking your site at 11pm before a launch.

## Where WordPress Still Wins

This isn't a custom-code-always-wins argument. WordPress is genuinely the better choice when:
- The client's team needs to edit content themselves daily, with zero technical help
- The site is content-heavy (a blog-first business) rather than feature-heavy
- Budget is the single deciding factor and the site's needs are simple

## Where Custom Code Wins

Custom development pulls ahead once a site needs to do something specific — a booking flow with business logic, a dashboard, an integration with a CRM or payment processor, or performance that has to be near-instant. Every plugin added to WordPress to chase that functionality adds page weight, security surface area, and another thing that can break on a future plugin update.

There's also a compounding cost most people don't see: an agency unfamiliar with the original developer's plugin stack often quotes more to "fix" a tangled WordPress build than it would have cost to build it custom from the start.

## The Practical Test

Before choosing either, ask one question: will this site mostly display content, or will it run a process? Display-heavy sites lean WordPress. Process-heavy sites — anything with custom logic, calculations, or integrations — lean custom code, because that's where plugin stacking starts costing more than it saves.

There's no universally "right" answer here. There's only the right answer for what a specific site actually needs to do — and that's the first thing worth figuring out before comparing prices.`,
  },
  {
    slug: "custom-gpt-vs-chatgpt-plus-business",
    title: "Why a Custom GPT Beats ChatGPT Plus for Business Use Cases",
    excerpt:
      "ChatGPT Plus is a great personal tool. For a business process, it's the wrong tool for a very specific reason — it doesn't know your business.",
    category: "AI Integrator",
    readTime: "6 min read",
    publishedDate: "2026-06-10",
    coverImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
    body: `A lot of business owners already pay for ChatGPT Plus and assume that covers their "AI strategy." For personal productivity, that's often true. For an actual business process — customer support, lead qualification, internal documentation lookup — it usually isn't, and the reason is simpler than most people expect.

## The Core Difference: Memory vs. Knowledge

ChatGPT Plus has memory of a conversation. A Custom GPT has *knowledge* of a business — its specific pricing, policies, tone of voice, FAQs, and edge cases — built in from the start, every single time, for every person who uses it.

Ask plain ChatGPT "What's our refund policy?" and it has no idea, because it has never seen that document. Ask a Custom GPT built with that policy embedded, and it answers correctly, consistently, every time — without anyone re-explaining the policy in the chat first.

## Where This Actually Matters

The gap shows up most in three places:

**Consistency.** A general AI chat gives a slightly different answer depending on how a question is phrased. A Custom GPT, scoped to a specific knowledge base and instruction set, gives the same correct answer regardless of phrasing — which matters enormously for anything customer-facing.

**Onboarding speed.** A new team member using plain ChatGPT has to learn the business first, then prompt well. A Custom GPT already "knows" the business — the new hire just asks it questions from day one.

**Access control.** Custom GPTs can be scoped to exactly the information a specific team needs (sales sees pricing logic, support sees policy documents) — something a shared general ChatGPT account can't cleanly do.

## What a Custom GPT Actually Needs to Work

The quality of a Custom GPT comes down to three things: the documents/knowledge base it's given, the instructions defining its tone and boundaries (what it should never say or do), and ongoing refinement based on real questions it gets wrong. Skipping any of these three is the most common reason a Custom GPT underperforms — not the underlying model.

## The Honest Limitation

A Custom GPT isn't magic, and it isn't a replacement for a real support team on complex or sensitive issues — it's a force multiplier for the repetitive 80% of questions that take up a team's time, so humans can focus on the 20% that actually need a human.

For a business asking "haven't we already got AI with our ChatGPT Plus subscription?" — the honest answer is: you have access to a general-purpose model. A Custom GPT is the difference between access to AI and AI that actually works *for your business specifically*.`,
  },
];

export function getSortedPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) =>
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function formatPublishedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
