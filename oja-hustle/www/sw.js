// Offline support: stores every game file on the device the first time
// the game is opened, so it keeps working with no internet.
// Change CACHE whenever you publish an update, so players get the new files.
const CACHE = "oja-hustle-v1.1.0";
const FILES = [
  "./", "index.html", "manifest.webmanifest", "css/style.css",
  "fonts/Poppins-Regular.ttf", "fonts/Poppins-Medium.ttf", "fonts/Poppins-Bold.ttf",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png",
  "js/main.js", "js/engine/game.js", "js/engine/street.js",
  "js/data/config.js", "js/data/stages.js", "js/data/products.js", "js/data/chapters.js",
  "js/data/quiz.js", "js/data/scams.js", "js/data/events.js",
  "js/ui/screens.js", "js/ui/screens2.js", "js/ui/market.js", "js/ui/icons.js", "js/ui/audio.js", "js/ui/util.js", "js/ui/street.js",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
