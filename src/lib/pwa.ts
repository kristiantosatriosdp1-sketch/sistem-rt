/** Daftarkan service worker (dipanggil sekali dari root layout) */
export async function registerServiceWorker() {
	if (!('serviceWorker' in navigator)) return null;
	return navigator.serviceWorker.register('/service-worker.js', { type: 'module' });
}

/** Minta izin notifikasi + subscribe push, lalu kirim subscription ke server untuk disimpan */
export async function subscribeToPush(vapidPublicKey: string) {
	const permission = await Notification.requestPermission();
	if (permission !== 'granted') {
		throw new Error('Izin notifikasi ditolak');
	}

	const registration = await navigator.serviceWorker.ready;
	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
	});

	await fetch('/api/push/subscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(subscription)
	});

	return subscription;
}

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
