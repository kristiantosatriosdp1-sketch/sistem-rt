/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE_NAME = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
			.then(() => self.clients.claim())
	);
});

// Strategi: cache-first untuk asset build, network-first untuk sisanya (dengan fallback ke cache saat offline)
self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE_NAME);

		if (ASSETS.includes(url.pathname)) {
			const cached = await cache.match(event.request);
			if (cached) return cached;
		}

		try {
			const response = await fetch(event.request);
			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}
			return response;
		} catch {
			const cached = await cache.match(event.request);
			if (cached) return cached;
			throw new Error('Offline dan halaman belum pernah di-cache');
		}
	}

	event.respondWith(respond());
});

// Terima push notification dari server
self.addEventListener('push', (event) => {
	const data = event.data ? event.data.json() : {};
	event.waitUntil(
		self.registration.showNotification(data.judul || 'Sistem RT', {
			body: data.isi || '',
			icon: '/icons/icon-192.png',
			badge: '/icons/icon-192.png',
			data: { url: data.url || '/' }
		})
	);
});

// Klik notifikasi -> buka/fokus halaman terkait
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(
		self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
			const url = event.notification.data?.url || '/';
			const existing = clientsArr.find((c) => c.url.includes(url));
			if (existing) return existing.focus();
			return self.clients.openWindow(url);
		})
	);
});
