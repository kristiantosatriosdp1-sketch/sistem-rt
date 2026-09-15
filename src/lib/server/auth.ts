import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from './db';
import { sessions, users } from './db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const SESSION_DURATION_DAYS = 30;
const RENEW_THRESHOLD_DAYS = 15;

export const SESSION_COOKIE_NAME = 'session';

export type SessionValidationResult =
	| { session: typeof sessions.$inferSelect; user: typeof users.$inferSelect }
	| { session: null; user: null };

/** Token random yang dikirim ke klien lewat cookie. Tidak pernah disimpan mentah di DB. */
export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	return encodeBase32LowerCaseNoPadding(bytes);
}

/** Simpan hash dari token sebagai id session di DB (bukan token aslinya). */
export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * SESSION_DURATION_DAYS)
	};
	await db.insert(sessions).values(session);
	return session;
}

/** Validasi token dari cookie, sekaligus perpanjang masa berlaku kalau sudah mendekati expired. */
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const result = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId));

	if (result.length < 1) {
		return { session: null, user: null };
	}

	const { user, session } = result[0];

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		return { session: null, user: null };
	}

	if (!user.isActive) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		return { session: null, user: null };
	}

	if (Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * RENEW_THRESHOLD_DAYS) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * SESSION_DURATION_DAYS);
		await db
			.update(sessions)
			.set({ expiresAt: session.expiresAt })
			.where(eq(sessions.id, session.id));
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateAllSessionsForUser(userId: string) {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(SESSION_COOKIE_NAME, token, {
		expires: expiresAt,
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev(event)
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.set(SESSION_COOKIE_NAME, '', {
		maxAge: 0,
		path: '/'
	});
}

// Helper kecil supaya cookie tidak dipaksa `secure` saat dev di localhost/HTTP LAN
function dev(event: RequestEvent) {
	return event.url.hostname === 'localhost' || event.url.hostname.startsWith('192.168.');
}
