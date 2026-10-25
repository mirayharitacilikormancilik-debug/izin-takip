/* İzin Takip — çevrimdışı açılış ve otomatik güncelleme.
   Uygulama dosyaları her açılışta önce internetten istenir (yeni sürüm hemen gelir);
   internet yoksa son kaydedilen sürüm açılır. Sunucu (Supabase) istekleri hiç saklanmaz. */
var CACHE = "izin-takip-v1";
var CORE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function(e){ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE) }).catch(function(){})) });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== CACHE }).map(function(k){ return caches["delete"](k) })) }).then(function(){ return self.clients.claim() })) });
self.addEventListener("fetch", function(e){
  var req = e.request, url = new URL(req.url);
  if(req.method !== "GET") return;
  var same = url.origin === self.location.origin;
  var lib = /cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host);
  if(!same && !lib) return;
  e.respondWith(fetch(req).then(function(res){
    if(res && (res.ok || res.type === "opaque")){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy) }) }
    return res;
  }).catch(function(){ return caches.match(req).then(function(m){ return m || (req.mode === "navigate" ? caches.match("index.html") : undefined) }) }));
});
