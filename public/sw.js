/* Personal pages are network-first. Only same-origin, successful passport HTML is saved. */
const VERSION = "edelweiss-passport-v1";
const ASSETS = `${VERSION}-assets`, PAGES = `${VERSION}-pages`;
const personal = /^\/p\/[\w-]{43}$/;
const safeAsset = path => path.startsWith("/_next/static/") || path.startsWith("/_next/image") || path.startsWith("/stamps/") || ["/map.png", "/edelweiss-logo.png", "/reward-card.png", "/apple-icon.png", "/icon-192.png", "/android-chrome-512x512.png"].includes(path);
self.addEventListener("install", event => event.waitUntil((async () => {
  const cache = await caches.open(ASSETS);
  const slots = await fetch("/slots.json").then(r => r.json());
  await cache.addAll(["/offline.html", "/map.png", "/edelweiss-logo.png", "/reward-card.png", "/icon-192.png", "/android-chrome-512x512.png", ...slots.stops.map(s => `/${s.stamp}`)]);
  await self.skipWaiting();
})()));
self.addEventListener("activate", event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith("edelweiss-passport-") && ![ASSETS, PAGES].includes(name)) await caches.delete(name);
  await self.clients.claim();
})()));
async function savePage(request, response) {
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return;
  const html = await response.clone().text();
  const pages = await caches.open(PAGES);
  if (!html.includes('data-passport-valid="true"')) { await pages.delete(request); return; }
  await pages.put(request, response.clone());
  // Hydration chunks/fonts must also be available after an offline cold launch.
  const assets = await caches.open(ASSETS);
  const urls = [...new Set([...html.matchAll(/(?:src|href)="(\/_next\/(?:static|image)[^"]+)"/g)].map(m => m[1].replaceAll("&amp;", "&")))];
  await Promise.allSettled(urls.map(async url => { const r = await fetch(url); if (r.ok) await assets.put(url, r); }));
}
self.addEventListener("message", event => {
  if (event.data?.type !== "CACHE_PASSPORT" || !personal.test(event.data.path)) return;
  event.waitUntil((async () => { const request = new Request(new URL(event.data.path, self.location.origin), { cache: "no-store" }); const response = await fetch(request); await savePage(request, response); })().catch(() => {}));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== "GET") return;
  if (event.request.mode === "navigate" && personal.test(url.pathname)) {
    event.respondWith((async () => {
      const request = new Request(url.origin + url.pathname, { cache: "no-store" });
      try {
        const response = await fetch(event.request);
        // A server failure may use the last good copy; a 404 must never resurrect an invalid passport.
        if (response.status >= 500) throw new Error("Unavailable");
        await savePage(request, response);
        return response;
      } catch { return await (await caches.open(PAGES)).match(request) || await (await caches.open(ASSETS)).match("/offline.html"); }
    })()); return;
  }
  if (safeAsset(url.pathname)) event.respondWith((async () => { const cache = await caches.open(ASSETS); const cached = await cache.match(event.request); if (cached) return cached; const response = await fetch(event.request); if (response.ok) await cache.put(event.request, response.clone()); return response; })());
});
