import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AnamDev — Mohammad Anamul Hoque" },
      {
        name: "description",
        content:
          "Freelance developer & AI specialist building modern websites, AI automations, and AI-powered podcasts.",
      },
      { property: "og:title", content: "AnamDev — Mohammad Anamul Hoque" },
      {
        property: "og:description",
        content:
          "Freelance developer & AI specialist building modern websites, AI automations, and AI-powered podcasts.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-xl">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--violet)]">
          // anamdev
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Mohammad Anamul Hoque
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Freelance developer & AI specialist. Full site coming soon — meanwhile, let's talk.
        </p>
        <Link
          to="/contact"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--orange)] px-6 text-sm font-semibold text-black shadow-[0_15px_40px_-10px_var(--orange-glow)] transition hover:brightness-110"
        >
          Get in touch
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
