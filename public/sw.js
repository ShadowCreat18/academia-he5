const CACHE_NAME = 'he5-pwa-cache-v2';
const OFFLINE_URL = '/offline.html'; // We will create this static file

const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/images/he5-round-logo.png',
    '/offline.html',
    // In a real PWA you'd precache build assets here, 
    // but Vite hashes them, so we'll rely on runtime caching
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Solo manejamos peticiones GET
    if (event.request.method !== 'GET') return;

    // Ignoramos peticiones a Stripe, API, o validaciones de Inertia XHR si lo preferimos,
    // pero Inertia usa peticiones GET con cabecera X-Inertia para navegaciones.

    const request = event.request;

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Network First: Intentamos obtener el recurso de red.
                // Si es un recurso válido, lo cacheamos para el futuro.
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(async () => {
                // Si falla la red (offline), intentamos servirlo desde el caché.
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Si es una petición de navegación (HTML o Inertia) y falla, devolvemos la página offline
                if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
                    return caches.match(OFFLINE_URL);
                }

                return new Response('Network error happened', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' },
                });
            })
    );
});
