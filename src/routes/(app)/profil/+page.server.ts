import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, warga, penghuni, rumah, anggotaOrganisasi, organisasi } from '$lib/server/db/schema';
import { hashPassword, verifyPassword } from '$lib/server/password';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const [currentUser] = await db
		.select({
			id: users.id,
			username: users.username,
			role: users.role,
			wargaId: users.wargaId,
			createdAt: users.createdAt
		})
		.from(users)
		.where(eq(users.id, locals.user.id));

	let dataWarga = null;
	let daftarHunian: Array<{
		id: string;
		alamat: string | null;
		blokRt: string | null;
		kepemilikan: string | null;
		statusPenghuni: string;
		jangkaWaktu: string | null;
	}> = [];
	let daftarOrganisasi: Array<{
		id: string;
		namaOrganisasi: string | null;
		tipeOrganisasi: string | null;
		jabatan: string | null;
		status: string;
	}> = [];

	if (currentUser?.wargaId) {
		const [w] = await db.select().from(warga).where(eq(warga.id, currentUser.wargaId));
		dataWarga = w ?? null;

		daftarHunian = await db
			.select({
				id: penghuni.id,
				alamat: rumah.alamat,
				blokRt: rumah.blokRt,
				kepemilikan: rumah.kepemilikan,
				statusPenghuni: penghuni.status,
				jangkaWaktu: penghuni.jangkaWaktuMenempati
			})
			.from(penghuni)
			.leftJoin(rumah, eq(penghuni.rumahId, rumah.id))
			.where(eq(penghuni.wargaId, currentUser.wargaId));

		daftarOrganisasi = await db
			.select({
				id: anggotaOrganisasi.id,
				namaOrganisasi: organisasi.nama,
				tipeOrganisasi: organisasi.tipe,
				jabatan: anggotaOrganisasi.jabatan,
				status: anggotaOrganisasi.status
			})
			.from(anggotaOrganisasi)
			.leftJoin(organisasi, eq(anggotaOrganisasi.organisasiId, organisasi.id))
			.where(eq(anggotaOrganisasi.wargaId, currentUser.wargaId));
	}

	return {
		currentUser,
		dataWarga,
		daftarHunian,
		daftarOrganisasi
	};
};

export const actions: Actions = {
	updateProfil: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');
		if (!locals.user.wargaId) {
			return fail(400, {
				tab: 'profil' as const,
				error: 'Akun login ini belum ditautkan ke data kependudukan warga oleh admin.',
				errors: {} as Record<string, string>,
				values: { pekerjaan: '', noHp: '', namaPanggilan: '', fotoUrl: '' }
			});
		}

		const formData = await request.formData();
		const pekerjaan = String(formData.get('pekerjaan') || '').trim();
		const noHp = String(formData.get('noHp') || '').trim();
		const namaPanggilan = String(formData.get('namaPanggilan') || '').trim();
		const fotoUrl = String(formData.get('fotoUrl') || '').trim();

		const errors: Record<string, string> = {};

		if (noHp && !/^[0-9+\s-]{8,20}$/.test(noHp)) {
			errors.noHp = 'Format nomor HP/WhatsApp tidak valid';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				tab: 'profil' as const,
				errors,
				values: { pekerjaan, noHp, namaPanggilan, fotoUrl }
			});
		}

		await db
			.update(warga)
			.set({
				pekerjaan: pekerjaan || null,
				noHp: noHp || null,
				namaPanggilan: namaPanggilan || null,
				fotoUrl: fotoUrl || null,
				updatedAt: new Date()
			})
			.where(eq(warga.id, locals.user.wargaId));

		return { tab: 'profil' as const, success: true, message: 'Profil berhasil diperbarui!' };
	},

	gantiPassword: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');

		const formData = await request.formData();
		const passwordLama = String(formData.get('passwordLama') || '');
		const passwordBaru = String(formData.get('passwordBaru') || '');
		const konfirmasiPasswordBaru = String(formData.get('konfirmasiPasswordBaru') || '');

		const errors: Record<string, string> = {};

		if (!passwordLama) {
			errors.passwordLama = 'Password lama wajib diisi';
		}

		if (!passwordBaru || passwordBaru.length < 6) {
			errors.passwordBaru = 'Password baru minimal 6 karakter';
		}

		if (passwordBaru !== konfirmasiPasswordBaru) {
			errors.konfirmasiPasswordBaru = 'Konfirmasi password baru tidak cocok';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { tab: 'password' as const, errors });
		}

		// Verifikasi password lama dari DB
		const [userRow] = await db
			.select({ passwordHash: users.passwordHash })
			.from(users)
			.where(eq(users.id, locals.user.id));

		if (!userRow) {
			return fail(400, { tab: 'password' as const, error: 'Pengguna tidak ditemukan', errors });
		}

		const isOldValid = await verifyPassword(userRow.passwordHash, passwordLama);
		if (!isOldValid) {
			return fail(400, {
				tab: 'password' as const,
				errors: { passwordLama: 'Password saat ini salah' } as Record<string, string>
			});
		}

		const newHash = await hashPassword(passwordBaru);
		await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, locals.user.id));

		return { tab: 'password' as const, success: true, message: 'Password berhasil diubah!' };
	}
};
