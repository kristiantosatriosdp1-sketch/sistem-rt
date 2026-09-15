import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { pushSubscription } from '$lib/server/db/schema';

// Catatan: contoh ini pakai user_id dummy. Ganti dengan session/auth
// user yang sedang login (locals.user.id) setelah auth diimplementasikan.
export const POST: RequestHandler = async ({ request, locals }) => {
	const sub = await request.json();

	if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
		throw error(400, 'Payload subscription tidak valid');
	}

	const userId = locals.user?.id;
	if (!userId) {
		throw error(401, 'Belum login');
	}

	await db
		.insert(pushSubscription)
		.values({
			userId,
			endpoint: sub.endpoint,
			keysP256dh: sub.keys.p256dh,
			keysAuth: sub.keys.auth
		})
		.onConflictDoNothing();

	return json({ ok: true });
};
