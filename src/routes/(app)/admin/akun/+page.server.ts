import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, warga } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/password';
import { invalidateAllSessionsForUser } from '$lib/server/auth';
import { generateRandomPassword } from '$lib/server/random';

const VALID_ROLES = ['admin_rt', 'pengurus', 'warga'] as const;
type Role = (typeof VALID_ROLES)[number];

export const load: PageServerLoad = async () => {
	const daftarUser = await db
		.select({
			id: users.id,
			username: users.username,
			role: users.role,
			isActive: users.isActive,
			createdAt: users.createdAt,
			namaWarga: warga.namaLengkap
		})
		.from(users)
		.leftJoin(warga, eq(users.wargaId, warga.id))
		.orderBy(users.createdAt);

	const daftarWarga = await db
		.select({ id: warga.id, namaLengkap: warga.namaLengkap })
		.from(warga)
		.orderBy(warga.namaLengkap);

	return { daftarUser, daftarWarga };
};

export const actions: Actions = {
	buatAkun: async ({ request }) => {
		const formData = await request.formData();
		const username = String(formData.get('username') || '').trim();
		const role = String(formData.get('role') || 'warga');
		const wargaIdRaw = String(formData.get('wargaId') || '');

		if (username.length < 3) {
			return fail(400, { tab: 'buat', message: 'Username minimal 3 karakter' });
		}
		if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
			return fail(400, {
				tab: 'buat',
				message: 'Username hanya boleh huruf, angka, titik, garis bawah/strip'
			});
		}
		if (!VALID_ROLES.includes(role as Role)) {
			return fail(400, { tab: 'buat', message: 'Role tidak valid' });
		}

		const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
		if (existing.length > 0) {
			return fail(400, { tab: 'buat', message: 'Username sudah dipakai, pilih yang lain' });
		}

		const passwordAwal = generateRandomPassword();
		const passwordHash = await hashPassword(passwordAwal);

		await db.insert(users).values({
			username,
			passwordHash,
			role: role as Role,
			wargaId: wargaIdRaw || null
		});

		return {
			tab: 'buat',
			success: true,
			createdUsername: username,
			createdPassword: passwordAwal
		};
	},

	toggleAktif: async (event) => {
		const formData = await event.request.formData();
		const userId = String(formData.get('userId') || '');
		const isCurrentlyActive = formData.get('isActive') === 'true';

		if (userId === event.locals.user?.id) {
			return fail(400, { tab: 'daftar', message: 'Tidak bisa menonaktifkan akun sendiri' });
		}

		await db.update(users).set({ isActive: !isCurrentlyActive }).where(eq(users.id, userId));

		if (isCurrentlyActive) {
			// baru saja dinonaktifkan -> putus semua sesi login yang sedang aktif
			await invalidateAllSessionsForUser(userId);
		}

		return { tab: 'daftar', success: true };
	},

	resetPassword: async ({ request }) => {
		const formData = await request.formData();
		const userId = String(formData.get('userId') || '');
		const username = String(formData.get('username') || '');

		const passwordBaru = generateRandomPassword();
		const passwordHash = await hashPassword(passwordBaru);

		await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
		await invalidateAllSessionsForUser(userId);

		return {
			tab: 'daftar',
			success: true,
			resetUsername: username,
			resetPassword: passwordBaru
		};
	},

	ubahRole: async (event) => {
		const formData = await event.request.formData();
		const userId = String(formData.get('userId') || '');
		const role = String(formData.get('role') || '');

		if (userId === event.locals.user?.id) {
			return fail(400, { tab: 'daftar', message: 'Tidak bisa mengubah role akun sendiri' });
		}
		if (!VALID_ROLES.includes(role as Role)) {
			return fail(400, { tab: 'daftar', message: 'Role tidak valid' });
		}

		await db.update(users).set({ role: role as Role }).where(eq(users.id, userId));

		return { tab: 'daftar', success: true };
	}
};
