// Offline cache for the GitHub Pages / installable web version. Bump CACHE when files change.
const CACHE="shelter-0.5.2";const FILES=["./", "css/style.css", "icon-192.png", "icon-512.png", "index.html", "js/archive.js", "js/audio.js", "js/boot.js", "js/data.js", "js/debug.js", "js/dialogue.js", "js/events.js", "js/game.js", "js/input.js", "js/loop.js", "js/mp.js", "js/players.js", "js/rng.js", "js/safety.js", "js/save.js", "js/sim.js", "js/state.js", "js/tests.js", "manifest.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});
