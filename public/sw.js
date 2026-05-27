const CACHE_NAME = "schoolsync-cache-v4";
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/logo.jpg",
  "/manifest.json"
];

// Instalação: Guarda os recursos principais na cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa versões de cache antigas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceção de pedidos (Fetch): Estratégia Stale-While-Revalidate
self.addEventListener("fetch", (event) => {
  // Ignorar pedidos externos ou de esquemas não-http (ex: extensões de browser)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Atualiza a cache em segundo plano (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignora falhas de rede silenciosamente em segundo plano
          });
        return cachedResponse;
      }

      // Se não estiver na cache, faz o pedido de rede normal
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          // Armazenamento dinâmico na cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Em caso de falha de rede total, se for navegação, serve o index.html da cache
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
    })
  );
});
