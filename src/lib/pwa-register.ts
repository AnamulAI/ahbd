// Registers the hand-written public/sw.js (see that file for why this isn't
// vite-plugin-pwa). Skipped in dev so Vite's HMR isn't fought by a caching
// service worker while iterating locally.
export function registerServiceWorker() {
  if (import.meta.env.DEV) return;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("[PWA] Service worker registration failed", error);
    });
  });
}
