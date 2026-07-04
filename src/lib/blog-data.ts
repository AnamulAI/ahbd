// Static blog data. TODO: migrate to a Supabase `blog_posts` table once the
// admin panel backend is built.

export type BlogCategory = "Web Development" | "AI Integrator" | "AI Podcast";

export type ServicePath =
  | "/services/web-development"
  | "/services/ai-integrator"
  | "/services/ai-podcast";

/** Inline text supports `**bold**`, `*italic*`, and `[label](url)` links. */
export type ContentBlock =
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "pullquote"; text: string }
  | {
      type: "table";
      title: string;
      headers: string[];
      rows: string[][];
    }
  | {
      type: "infographic";
      title: string;
      items: { title?: string; text: string }[];
    };

export type FaqItem = { q: string; a: string };

export type SidebarCta = {
  headline: string;
  subtext: string;
  ctaLabel: string;
  href: ServicePath;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readTime: string;
  publishedDate: string; // ISO date string
  coverImage: string;
  quickAnswer: string;
  body: ContentBlock[];
  /** Raw HTML body (used for posts authored in the admin rich-text editor). */
  bodyHtml?: string;
  faq: FaqItem[];
  sidebarCta: SidebarCta;
  seoTitle?: string | null;
  seoDescription?: string | null;
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
    badgeClass: "bg-white/[0.06] text-white/85 border-white/15",
  },
  "AI Podcast": {
    label: "AI Podcast",
    badgeClass:
      "bg-[color:var(--orange)]/12 text-[color:var(--orange)] border-[color:var(--orange)]/30",
  },
};

// ---------- Post 1: Web Development ----------
const POST_WEB: BlogPost = {
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
  quickAnswer:
    "WordPress is rarely 'free' once themes, plugins, and capable hosting are added — most business sites land at $400–$1,500+ in year one. Custom code usually has a higher upfront build cost but lower ongoing cost, and wins as soon as the site needs real business logic, integrations, or speed.",
  body: [
    {
      type: "p",
      text: 'Every client conversation about a new website eventually arrives at the same question: "Why not just use WordPress? It\'s free."',
    },
    {
      type: "p",
      text: "WordPress isn't free. The software is, but almost nothing else is — and the hidden costs are exactly why this comparison matters.",
    },
    { type: "h2", text: "The Real Cost of 'Free'", id: "the-real-cost-of-free" },
    {
      type: "p",
      text: 'A typical WordPress business site needs a theme (often $60-200/year), 5-10 plugins for the features a modern site actually needs (forms, SEO, caching, security, page builders), and hosting that can handle plugin overhead. Add those up and a "free" platform often costs $400-1,500 a year before anyone writes a line of content.',
    },
    {
      type: "p",
      text: "Custom-coded sites have no plugin tax. The features you need are built directly into the code, which means no recurring license fees and no plugin conflicts breaking your site at 11pm before a launch.",
    },
    {
      type: "table",
      title: "Typical First-Year Cost Comparison",
      headers: ["Cost Item", "WordPress", "Custom Code"],
      rows: [
        ["Platform / Framework", "Free (open-source)", "Free (open-source)"],
        ["Theme / Template", "$60–$200/year", "Included in build"],
        ["Essential Plugins (5–10)", "$200–$600/year", "Built into the code"],
        ["Hosting (plugin-capable)", "$120–$300/year", "$60–$180/year"],
        ["Update / Maintenance Time", "Ongoing, recurring", "Lower, code-based"],
        [
          "**Typical Year 1 Total**",
          "**$400–$1,500+**",
          "**One-time build, lower ongoing**",
        ],
      ],
    },
    { type: "h2", text: "Where WordPress Still Wins", id: "where-wordpress-still-wins" },
    {
      type: "p",
      text: "This isn't a custom-code-always-wins argument. WordPress is genuinely the better choice when:",
    },
    {
      type: "ul",
      items: [
        "The client's team needs to edit content themselves daily, with zero technical help",
        "The site is content-heavy (a blog-first business) rather than feature-heavy",
        "Budget is the single deciding factor and the site's needs are simple",
      ],
    },
    { type: "h2", text: "Where Custom Code Wins", id: "where-custom-code-wins" },
    {
      type: "p",
      text: "[Custom development](/services/web-development) pulls ahead once a site needs to do something specific — a booking flow with business logic, a dashboard, an integration with a CRM or payment processor, or performance that has to be near-instant. Every plugin added to WordPress to chase that functionality adds page weight, security surface area, and another thing that can break on a future plugin update.",
    },
    {
      type: "p",
      text: 'There\'s also a compounding cost most people don\'t see: an agency unfamiliar with the original developer\'s plugin stack often quotes more to "fix" a tangled WordPress build than it would have cost to build it custom from the start.',
    },
    {
      type: "pullquote",
      text: "There's no universally 'right' answer here. There's only the right answer for what a specific site actually needs to do.",
    },
    { type: "h2", text: "The Practical Test", id: "the-practical-test" },
    {
      type: "p",
      text: "Before choosing either, ask one question: will this site mostly display content, or will it run a process? Display-heavy sites lean WordPress. Process-heavy sites — anything with custom logic, calculations, or integrations — lean custom code, because that's where plugin stacking starts costing more than it saves.",
    },
    {
      type: "infographic",
      title: "5-Question Decision Checklist",
      items: [
        {
          title: "Will the team edit content themselves daily?",
          text: "Lean WordPress.",
        },
        {
          title:
            "Does the site need custom business logic (bookings, calculators, dashboards)?",
          text: "Lean Custom Code.",
        },
        {
          title: "Is performance / speed mission-critical?",
          text: "Lean Custom Code.",
        },
        {
          title:
            "Is the budget the single deciding factor with simple needs?",
          text: "Lean WordPress.",
        },
        {
          title:
            "Will the site integrate with a CRM, payment processor, or internal tool?",
          text: "Lean Custom Code.",
        },
      ],
    },
    {
      type: "p",
      text: "There's only the right answer for what a specific site actually needs to do — and that's the first thing worth figuring out before comparing prices.",
    },
  ],
  faq: [
    {
      q: "Is WordPress really free?",
      a: "The core software is free and open-source, but a functional business site needs a theme, several plugins, and capable hosting — which typically adds $400–$1,500+ in the first year.",
    },
    {
      q: "Can I switch from WordPress to custom code later?",
      a: "Yes, though it usually means rebuilding rather than migrating — most agencies treat it as a fresh build using the old site as a content/design reference.",
    },
    {
      q: "Is custom code more expensive upfront?",
      a: "Often yes for the initial build, but it usually has lower ongoing costs since there's no recurring plugin licensing or plugin-conflict maintenance.",
    },
    {
      q: "What if I need both — easy content editing AND custom features?",
      a: "This is common, and it's solvable with a custom-built site that still includes an easy-to-use content management area for the team — it's not an all-or-nothing choice.",
    },
    {
      q: "How do I know which one my business actually needs?",
      a: "Start from what the site needs to do, not just display. A quick discovery conversation usually makes the right path obvious within minutes.",
    },
  ],
  sidebarCta: {
    headline: "Need a Site Built Right?",
    subtext:
      "Get a recommendation based on what your site actually needs to do.",
    ctaLabel: "Discuss Your Project",
    href: "/services/web-development",
  },
};

// ---------- Post 2: AI Integrator ----------
const POST_AI: BlogPost = {
  slug: "custom-gpt-vs-chatgpt-plus-business",
  title: "Why a Custom GPT Beats ChatGPT Plus for Business Use Cases",
  excerpt:
    "ChatGPT Plus is a great personal tool. For a business process, it's the wrong tool for a very specific reason — it doesn't know your business.",
  category: "AI Integrator",
  readTime: "6 min read",
  publishedDate: "2026-06-10",
  coverImage:
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
  quickAnswer:
    "ChatGPT Plus is a general personal-productivity tool that doesn't know your business. A Custom GPT is scoped to your specific documents, tone, and rules — so it gives consistent, on-brand answers to the repetitive 80% of questions, freeing your team for the 20% that genuinely need a human.",
  body: [
    {
      type: "p",
      text: 'A lot of business owners already pay for ChatGPT Plus and assume that covers their "AI strategy." For personal productivity, that\'s often true. For an actual business process — customer support, lead qualification, internal documentation lookup — it usually isn\'t, and the reason is simpler than most people expect.',
    },
    {
      type: "h2",
      text: "The Core Difference: Memory vs. Knowledge",
      id: "the-core-difference-memory-vs-knowledge",
    },
    {
      type: "p",
      text: "ChatGPT Plus has memory of a conversation. A Custom GPT has *knowledge* of a business — its specific pricing, policies, tone of voice, FAQs, and edge cases — built in from the start, every single time, for every person who uses it.",
    },
    {
      type: "p",
      text: 'Ask plain ChatGPT "What\'s our refund policy?" and it has no idea, because it has never seen that document. Ask a Custom GPT built with that policy embedded, and it answers correctly, consistently, every time — without anyone re-explaining the policy in the chat first.',
    },
    {
      type: "table",
      title: "ChatGPT Plus vs. Custom GPT for Business Use",
      headers: ["Capability", "ChatGPT Plus", "Custom GPT"],
      rows: [
        [
          "Knows company-specific policies",
          "No (unless re-explained each time)",
          "Yes, built in",
        ],
        [
          "Consistent answers across users",
          "Varies by phrasing",
          "Consistent by design",
        ],
        ["Scoped access per team", "No", "Yes"],
        ["Setup required", "None", "Knowledge base + instructions"],
        [
          "**Best for**",
          "**Personal productivity**",
          "**Repeatable business processes**",
        ],
      ],
    },
    { type: "h2", text: "Where This Actually Matters", id: "where-this-actually-matters" },
    {
      type: "p",
      text: "The gap shows up most in three places:",
    },
    {
      type: "p",
      text: "**Consistency.** A general AI chat gives a slightly different answer depending on how a question is phrased. A Custom GPT, scoped to a specific knowledge base and instruction set, gives the same correct answer regardless of phrasing — which matters enormously for anything customer-facing.",
    },
    {
      type: "p",
      text: '**Onboarding speed.** A new team member using plain ChatGPT has to learn the business first, then prompt well. A Custom GPT already "knows" the business — the new hire just asks it questions from day one.',
    },
    {
      type: "p",
      text: "**Access control.** Custom GPTs can be scoped to exactly the information a specific team needs (sales sees pricing logic, support sees policy documents) — something a shared general ChatGPT account can't cleanly do.",
    },
    {
      type: "h2",
      text: "What a Custom GPT Actually Needs to Work",
      id: "what-a-custom-gpt-actually-needs-to-work",
    },
    {
      type: "p",
      text: "The quality of a [Custom GPT](/services/ai-integrator) comes down to three things: the documents/knowledge base it's given, the instructions defining its tone and boundaries (what it should never say or do), and ongoing refinement based on real questions it gets wrong. Skipping any of these three is the most common reason a Custom GPT underperforms — not the underlying model.",
    },
    {
      type: "infographic",
      title: "3 Things Every Custom GPT Needs",
      items: [
        {
          title: "Knowledge Base",
          text: "The actual documents, policies, and FAQs it should know.",
        },
        {
          title: "Instructions",
          text: "Clear tone, boundaries, and what it should never say or do.",
        },
        {
          title: "Ongoing Refinement",
          text: "Continuous correction based on real questions it gets wrong.",
        },
      ],
    },
    {
      type: "pullquote",
      text: "A Custom GPT is the difference between access to AI and AI that actually works for your business specifically.",
    },
    { type: "h2", text: "The Honest Limitation", id: "the-honest-limitation" },
    {
      type: "p",
      text: "A Custom GPT isn't magic, and it isn't a replacement for a real support team on complex or sensitive issues — it's a force multiplier for the repetitive 80% of questions that take up a team's time, so humans can focus on the 20% that actually need a human.",
    },
    {
      type: "p",
      text: 'For a business asking "haven\'t we already got AI with our ChatGPT Plus subscription?" — the honest answer is: you have access to a general-purpose model. A Custom GPT is the difference between access to AI and AI that actually works *for your business specifically*.',
    },
  ],
  faq: [
    {
      q: "Do I need a developer to build a Custom GPT?",
      a: "Not necessarily for the basic setup, but getting the knowledge base, instructions, and edge-case handling right for a real business process usually benefits from someone experienced doing the setup and testing.",
    },
    {
      q: "Will a Custom GPT replace my support team?",
      a: "No — it's built to handle the repetitive, predictable questions so your team can focus on the complex or sensitive ones that genuinely need a human.",
    },
    {
      q: "How is this different from just uploading documents to ChatGPT in a conversation?",
      a: "A Custom GPT retains that knowledge permanently and consistently for every user and every conversation — not just for the one chat session where you uploaded a file.",
    },
    {
      q: "Can a Custom GPT integrate with our other business tools?",
      a: "Yes, depending on the platform — many Custom GPT and AI agent setups can connect to calendars, CRMs, and other tools via integrations or APIs.",
    },
    {
      q: "How long does it take to set one up properly?",
      a: "It depends on the complexity of the knowledge base, but a focused, well-scoped Custom GPT for a specific process can often be built and refined within days, not months.",
    },
  ],
  sidebarCta: {
    headline: "Want AI That Knows Your Business?",
    subtext: "Let's scope out what a Custom GPT could handle for you.",
    ctaLabel: "Discuss Your Project",
    href: "/services/ai-integrator",
  },
};

// ---------- Post 3: AI Podcast ----------
const POST_PODCAST: BlogPost = {
  slug: "ai-voice-cloning-guide-for-podcasters",
  title: "The Complete Guide to AI Voice Cloning for Podcasters",
  excerpt:
    "Clone a voice from under a minute of audio, then use it for every future episode. Here's how the technology actually works, and what it's realistically good for today.",
  category: "AI Podcast",
  readTime: "6 min read",
  publishedDate: "2026-06-20",
  coverImage:
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1600&q=80",
  quickAnswer:
    "Modern voice cloning needs around 60 seconds of clean audio to learn a voice's pitch, pacing, and patterns — then it can narrate brand-new scripts in that same voice. It's excellent for consistent narration and multi-language reach, weaker at spontaneous unscripted emotion, and should only ever be used with explicit consent.",
  body: [
    {
      type: "p",
      text: "Voice cloning sounds like science fiction until you see how short the input actually needs to be. Most modern voice-cloning systems need somewhere around 60 seconds of clean audio to build a usable voice model — not hours of studio recording, just one short, clear sample.",
    },
    {
      type: "h2",
      text: "How It Actually Works (Without the Jargon)",
      id: "how-it-actually-works",
    },
    {
      type: "p",
      text: "A voice-cloning model listens to the sample audio and learns the specific characteristics that make a voice sound like *that* voice — pitch, pacing, accent, the way certain sounds are formed. It's not literally copying recorded clips and stitching them together; it's learning a pattern, then generating entirely new speech in that same pattern for text it has never seen before.",
    },
    {
      type: "p",
      text: "That's the part that surprises people: a cloned voice can read a script that didn't exist when the sample was recorded, and it will still sound like the same person speaking it.",
    },
    {
      type: "infographic",
      title: "How Voice Cloning Works in 3 Steps",
      items: [
        {
          title: "Sample",
          text: "Provide about 60 seconds of clean, clear audio.",
        },
        {
          title: "Learn",
          text: "The model learns pitch, pacing, and speech patterns — not literal clips.",
        },
        {
          title: "Generate",
          text: "New scripts are narrated in that same voice, never recorded before.",
        },
      ],
    },
    {
      type: "h2",
      text: "What It's Genuinely Good For",
      id: "what-its-genuinely-good-for",
    },
    {
      type: "p",
      text: "**Consistency at scale.** Once a voice is cloned, every future episode sounds like the same host — without that host needing to sit down and record every single time.",
    },
    {
      type: "p",
      text: "**Multi-language reach.** Many voice-cloning systems can carry a cloned voice across languages the original speaker may not even speak fluently — useful for podcasters wanting to publish the same show internationally without hiring multiple narrators.",
    },
    {
      type: "p",
      text: "**Accessibility for non-native speakers or those who dislike their recorded voice.** Some people are excellent writers and terrible at performing their own scripts on mic. Voice cloning separates \"who wrote this\" from \"who has to read it out loud.\"",
    },
    { type: "h2", text: "The Honest Limitations", id: "the-honest-limitations" },
    {
      type: "p",
      text: "Voice cloning today is very good at *narration* — calm, structured speech. It's noticeably weaker at *spontaneous emotion* — genuine laughter, interruption, the messiness of real unscripted conversation. For solo commentary or scripted interview formats, that's rarely an issue. For shows built entirely around unscripted chemistry between hosts, it's a real limitation worth knowing about upfront.",
    },
    {
      type: "table",
      title: "What Voice Cloning Is Good At (And What It Isn't, Yet)",
      headers: ["Good At", "Not Yet Good At"],
      rows: [
        ["Calm, structured narration", "Spontaneous laughter / reactions"],
        ["Reading new scripts naturally", "Genuine unscripted back-and-forth"],
        ["Multi-language narration", "Real-time interruption / overlap"],
        ["Consistent host voice at scale", "Emotional nuance in live debate"],
      ],
    },
    {
      type: "pullquote",
      text: "The practical use case isn't 'replace yourself entirely' — it's removing the bottleneck of needing to be physically available to record every episode.",
    },
    {
      type: "h2",
      text: "The Ethics Question, Briefly",
      id: "the-ethics-question-briefly",
    },
    {
      type: "p",
      text: "Cloning someone else's voice without clear, explicit consent is where this technology gets genuinely problematic — and is exactly why any responsible voice-cloning workflow should only ever clone a voice with the direct permission of the person it belongs to, ideally the podcaster's own voice or a guest who has explicitly agreed.",
    },
    {
      type: "h2",
      text: "Where This Fits Into a Real Podcast Workflow",
      id: "where-this-fits-into-a-real-podcast-workflow",
    },
    {
      type: "p",
      text: 'The practical use case isn\'t "replace yourself entirely" — it\'s removing the bottleneck of needing to be physically available to record every episode. Write or approve a script, let the cloned voice narrate it, and a show keeps a consistent publishing schedule even during weeks when sitting down at a microphone simply isn\'t possible. See how this fits into [a real podcast workflow](/services/ai-podcast).',
    },
  ],
  faq: [
    {
      q: "How much audio do I need to clone a voice?",
      a: "Most modern systems need around 60 seconds of clean, clear audio — far less than most people expect.",
    },
    {
      q: "Can I clone someone else's voice without asking them?",
      a: "No — responsible voice cloning always requires explicit consent from the person whose voice is being cloned.",
    },
    {
      q: "Does a cloned voice sound robotic?",
      a: "Quality varies by system, but modern voice cloning is generally very natural-sounding for narration-style speech specifically.",
    },
    {
      q: "Can a cloned voice speak languages I don't speak?",
      a: "Many systems can carry a cloned voice's characteristics across languages, which is useful for reaching international audiences without hiring separate narrators.",
    },
    {
      q: "Is voice cloning the same as a generic AI voice?",
      a: "No — a generic AI voice is a pre-built voice anyone can use. A cloned voice is built specifically from one person's actual speech sample.",
    },
  ],
  sidebarCta: {
    headline: "Turn This Into a Podcast Episode",
    subtext: "Send a topic, and get a real produced episode back.",
    ctaLabel: "Start Your Podcast",
    href: "/services/ai-podcast",
  },
};

// ---------- Post 4: AI Podcast — RSS Feed ----------
const POST_RSS: BlogPost = {
  slug: "what-is-a-podcast-rss-feed",
  title: "What Is a Podcast RSS Feed? (Plain-Language Guide for 2026)",
  excerpt:
    "Every podcast platform pulls your episodes from one file you'll probably never see. Here's what an RSS feed actually is, what's inside it, and why it's the reason your show can be everywhere at once.",
  category: "AI Podcast",
  readTime: "8 min read",
  publishedDate: "2026-06-22",
  coverImage:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
  quickAnswer:
    "A podcast RSS feed is a specially formatted XML file hosted at a public URL containing all the metadata and audio file links for your podcast. Platforms like Spotify, Apple Podcasts, Amazon Music, and iHeart subscribe to this feed URL and automatically pull in new episodes whenever you publish — making it the universal standard that puts a podcast everywhere at once without manually uploading to every platform separately.",
  body: [
    { type: "h2", text: "What Is a Podcast RSS Feed?", id: "definition" },
    {
      type: "p",
      text: "RSS stands for Really Simple Syndication — and for podcasting, it genuinely is that simple in concept, even if the underlying XML files and feed URLs can feel opaque the first time you encounter them.",
    },
    {
      type: "p",
      text: "A podcast RSS feed is a text file in XML format that lives at a public web address. It contains structured information about a podcast and every episode published. Instead of manually uploading a podcast to each platform separately, the feed URL is given to each platform once — from that point forward, every new episode is fetched automatically.",
    },
    {
      type: "p",
      text: "Think of it like a newspaper subscription: the paper comes to you, you don't go collect it from the printer. RSS is the subscription system for podcasts — platforms subscribe to a feed, and new episodes arrive automatically.",
    },
    {
      type: "p",
      text: "RSS is not a proprietary format owned by any single podcast company — it's an open standard (the RSS 2.0 specification) with podcast-specific extensions that every major directory recognizes.",
    },
    { type: "h2", text: "Why Podcasts Use RSS", id: "why-rss" },
    {
      type: "p",
      text: "RSS became the podcast distribution standard for a practical reason: when podcasting emerged in the early 2000s, there was no central platform. Creators needed a way to signal that new audio was available — and RSS, already used for blog syndication, was the natural fit.",
    },
    {
      type: "p",
      text: "RSS remains the backbone of podcast distribution today because:",
    },
    {
      type: "ul",
      items: [
        "**It's platform-neutral** — a feed works on every directory simultaneously, with no dependency on any single company's infrastructure",
        "**It's automatic** — once a platform subscribes, episode delivery is fully automated, with no manual re-uploads",
        "**It gives creators ownership** — the feed URL belongs to the creator; switching hosting means moving the feed, and subscribers follow automatically",
        "**It carries all metadata** — titles, descriptions, artwork, categories, durations, and audio file URLs all live in the feed, so every platform displays a show consistently",
      ],
    },
    { type: "h2", text: "What's Inside a Podcast RSS Feed", id: "inside-rss" },
    {
      type: "p",
      text: "An RSS feed is an XML file — a plain text file with a specific hierarchical structure. Writing or reading raw XML isn't necessary day-to-day (a podcast hosting platform generates it automatically), but understanding the key tags helps clarify what information actually matters.",
    },
    {
      type: "table",
      title: "Channel-Level Tags (Appear Once, Describe the Whole Show)",
      headers: ["XML Tag", "What It Contains", "Example"],
      rows: [
        ["`<title>`", "Podcast name", "The AnamDev Show"],
        ["`<description>`", "Show description", "Insights on web, AI, and podcasting"],
        ["`<link>`", "Podcast website URL", "https://example.com"],
        ["`<language>`", "Language code", "en-us"],
        ["`<itunes:image>`", "Cover art URL (3000×3000px recommended)", "https://host.com/cover.jpg"],
        ["`<itunes:category>`", "Podcast category for directories", "Technology"],
        ["`<itunes:author>`", "Host/creator name", "Jane Smith"],
        ["`<itunes:explicit>`", "Content rating", "false"],
      ],
    },
    {
      type: "table",
      title: "Item-Level Tags (Repeat for Every Episode)",
      headers: ["XML Tag", "What It Contains"],
      rows: [
        ["`<title>`", "Episode title"],
        ["`<description>`", "Episode show notes"],
        ["`<enclosure>`", "The most critical tag — direct URL to the audio file, file size, and MIME type"],
        ["`<pubDate>`", "Publication date and time"],
        ["`<itunes:duration>`", "Episode length"],
        ["`<itunes:episode>`", "Episode number"],
        ["`<itunes:season>`", "Season number"],
        ["`<guid>`", "Unique episode identifier — must never change once set"],
      ],
    },
    {
      type: "p",
      text: "The `<enclosure>` tag is the single most critical element — it tells every podcast app exactly where to find and stream the audio file. If that URL breaks or changes, the episode stops working across every platform simultaneously.",
    },
    {
      type: "pullquote",
      text: "RSS is the lifeblood of podcasting — it's what makes the medium open, interoperable, and creator-owned.",
    },
    { type: "h2", text: "How to Get a Podcast RSS Feed", id: "how-to-get" },
    {
      type: "p",
      text: "There are two practical paths to getting an RSS feed for a podcast:",
    },
    {
      type: "p",
      text: "**Traditional podcast hosting platforms** store audio files and generate an RSS feed automatically — upload the audio, fill in episode metadata, and the host builds the XML. That host-provided feed URL is then submitted to each directory manually.",
    },
    {
      type: "p",
      text: "**End-to-end [AI podcast production services](/services/ai-podcast)** handle RSS generation and directory submission as part of the publishing workflow itself — produce the episode, publish it, and the feed plus submission to Spotify, Apple Podcasts, YouTube, TikTok, and LinkedIn happens automatically, with no manual feed management required.",
    },
    {
      type: "infographic",
      title: "RSS Feed Setup: 2 Paths",
      items: [
        {
          title: "Traditional Hosting",
          text: "Upload audio manually, host generates the feed, you submit it to each directory yourself.",
        },
        {
          title: "Done-For-You AI Production",
          text: "Episode is produced and published in one step, feed + submission handled automatically.",
        },
      ],
    },
    { type: "h2", text: "RSS vs. Direct Upload: What's the Difference?", id: "rss-vs-direct" },
    {
      type: "p",
      text: "Some platforms — notably YouTube, and certain content types on other platforms — allow direct upload of audio/video without using RSS at all. Here's the comparison:",
    },
    {
      type: "table",
      title: "RSS-Based Distribution vs. Direct Upload",
      headers: ["Factor", "RSS-Based Distribution", "Direct Upload"],
      rows: [
        ["Reach", "All directories simultaneously, from one feed", "One platform at a time"],
        ["Ownership", "Creator controls the feed and audience data", "Platform controls the relationship"],
        ["Portability", "Switch hosts, keep all subscribers", "Locked to the platform"],
        ["Automation", "Publish once, every platform updates automatically", "Manual re-upload to each platform"],
        ["Best for", "Broad reach and long-term ownership", "Platform-exclusive content strategy"],
      ],
    },
    {
      type: "p",
      text: "For most podcasters, RSS-based [podcast distribution](/services/ai-podcast) is strongly preferable — it maximizes reach while keeping the creator in control.",
    },
    { type: "h2", text: "Common RSS Problems and Fixes", id: "common-problems" },
    {
      type: "p",
      text: "**Episodes not updating on a platform.** Most directories check an RSS feed every 1–24 hours. If a new episode was just published, wait up to 24 hours before assuming there's a real problem. If episodes still aren't appearing after that, verify the feed URL is publicly accessible (opening it in a browser should show XML code).",
    },
    {
      type: "p",
      text: "**Feed validation errors.** Usually caused by missing required tags, malformed XML, or invalid characters. A free RSS feed validator tool can identify the specific line-by-line errors.",
    },
    {
      type: "p",
      text: "**Cover art rejected.** Apple Podcasts requires cover art between 1400×1400 and 3000×3000 pixels in JPEG or PNG format — anything below that resolution gets rejected. Re-export at 3000×3000px and update the feed's image tag.",
    },
    {
      type: "p",
      text: "**Episodes have the wrong duration or missing metadata.** Often caused by a hosting platform not reading the audio file's embedded metadata correctly. Embedding duration, title, and author metadata directly into the audio file before uploading usually resolves this.",
    },
    {
      type: "p",
      text: "**GUID changed, causing duplicate episodes.** If an episode's unique identifier (GUID) changes — often after migrating hosting platforms — directories treat it as a brand-new episode and may show duplicates. A GUID should never change once an episode is published; when migrating hosts, confirm the original GUIDs are preserved.",
    },
  ],
  faq: [
    {
      q: "What is a podcast RSS feed?",
      a: "A podcast RSS feed is a public XML file containing all the metadata and audio file links for a podcast. When that feed URL is submitted to Spotify, Apple Podcasts, or other directories, they subscribe to it and automatically receive every new episode published — it's the universal standard that powers podcast discovery and delivery across all platforms.",
    },
    {
      q: "Do I need an RSS feed to publish a podcast?",
      a: "To distribute across multiple major platforms simultaneously — Spotify, Apple Podcasts, Amazon Music, iHeart — yes, an RSS feed is required. Some platforms (like YouTube) offer direct upload instead, but RSS is the only way to be available everywhere from one publishing action.",
    },
    {
      q: "How do I find my podcast's RSS feed URL?",
      a: "The RSS feed URL is provided by whatever podcast hosting platform or production service is being used — look for 'RSS Feed,' 'Feed URL,' or 'Distribution' in the account settings. It typically looks like a direct link to an XML file.",
    },
    {
      q: "How often do podcast directories check my RSS feed?",
      a: "Most major directories check RSS feeds every 1–24 hours. Some hosts allow 'pinging' a directory after publishing to trigger a faster check if needed.",
    },
    {
      q: "Can I change my RSS feed URL?",
      a: "Yes, but it requires a proper redirect from the old URL to the new one so directories and subscribers follow automatically. The old feed URL should never simply be abandoned — every platform pointing to it would stop receiving new episodes.",
    },
  ],
  sidebarCta: {
    headline: "Want This Handled Automatically?",
    subtext:
      "Skip the XML entirely — publish an episode and let distribution happen on its own.",
    ctaLabel: "Start Your Podcast",
    href: "/services/ai-podcast",
  },
};

export const BLOG_POSTS: BlogPost[] = [POST_RSS, POST_PODCAST, POST_WEB, POST_AI];

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
