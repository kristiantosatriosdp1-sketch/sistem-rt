import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { verifyPassword } from '$lib/server/password';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (typeof username !== 'string' || username.trim().length < 3) {
			return fail(400, { message: 'Username minimal 3 karakter', username: '' });
		}
		if (typeof password !== 'string' || password.length < 6) {
			return fail(400, { message: 'Password minimal 6 karakter', username });
		}

		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.username, username.trim()));

		// Pesan error digeneralisir (tidak bilang "username tidak ditemukan" vs "password salah")
		// supaya tidak bisa dipakai untuk menebak username mana yang terdaftar.
		if (!existingUser) {
			return fail(400, { message: 'Username atau password salah', username });
		}
		if (!existingUser.isActive) {
			return fail(400, { message: 'Akun nonaktif, hubungi pengurus RT', username });
		}

		const validPassword = await verifyPassword(existingUser.passwordHash, password);
		if (!validPassword) {
			return fail(400, { message: 'Username atau password salah', username });
		}

		const token = generateSessionToken();
		const session = await createSession(token, existingUser.id);
		setSessionTokenCookie(event, token, session.expiresAt);

		const redirectTo = event.url.searchParams.get('redirectTo') || '/';
		throw redirect(302, redirectTo);
	}
};
