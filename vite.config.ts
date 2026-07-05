// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Vercel automatically sets process.env.VERCEL during its build step.
  // Use the "vercel" Nitro preset only on Vercel; fall back to Lovable's
  // default "cloudflare-module" preset everywhere else (Lovable's own
  // Live Preview build), so both environments work without manual switching.
  nitro: {
    preset: process.env.VERCEL ? "vercel" : "cloudflare-module",
  },
});
