import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { rumah, penghuni, warga } from '$lib/server/db/schema';
import { parseRumahForm, validateRumahInput } from '$lib/validation/rumah';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async ({ params }) => {
	const [r] = await db.select().from(rumah).where(eq(rumah.id, params.id));
	if (!r) throw error(404, 'Rumah tidak ditemukan');

	const daftarPenghuni = await db
		.select({
			id: penghuni.id,
			status: penghuni.status,
			jangkaWaktuMenempati: penghuni.jangkaWaktuMenempati,
			wargaId: warga.id,
			namaLengkap: warga.namaLengkap,
			noHp: warga.noHp
		})
		.from(penghuni)
		.innerJoin(warga, eq(penghuni.wargaId, warga.id))
		.where(eq(penghuni.rumahId, params.id));

	const semuaWarga = await db
		.select({ id: warga.id, namaLengkap: warga.namaLengkap })
		.from(warga)
		.orderBy(warga.namaLengkap);

	return { rumah: r, daftarPenghuni, semuaWarga };
};

export const actions: Actions = {
	update: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const input = parseRumahForm(formData);
		const errors = validateRumahInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { tab: 'edit', errors, values: input });
		}

		await db
			.update(rumah)
			.set({
				alamat: input.alamat,
				blokRt: input.blokRt || null,
				kepemilikan: input.kepemilikan as 'milik_sendiri' | 'sewa' | 'kos' | 'dinas' | 'lainnya'
			})
			.where(eq(rumah.id, event.params.id));

		return { tab: 'edit', success: true };
	},

	tambahPenghuni: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const wargaId = String(formData.get('wargaId') || '');
		const jangkaWaktuMenempati = String(formData.get('jangkaWaktuMenempati') || '').trim() || null;
		const tanggalMulaiMenempati = String(formData.get('tanggalMulaiMenempati') || '') || null;
		const status = String(formData.get('status') || 'aktif');

		if (!wargaId) {
			return fail(400, { tab: 'penghuni', message: 'Pilih warga dulu' });
		}

		await db.insert(penghuni).values({
			wargaId,
			rumahId: event.params.id,
			jangkaWaktuMenempati,
			tanggalMulaiMenempati,
			status: status as 'aktif' | 'pindah' | 'kerja_luar_kota' | 'meninggal'
		});

		return { tab: 'penghuni', success: true };
	},

	ubahStatusPenghuni: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const penghuniId = String(formData.get('penghuniId') || '');
		const status = String(formData.get('status') || '');

		await db
			.update(penghuni)
			.set({
				status: status as 'aktif' | 'pindah' | 'kerja_luar_kota' | 'meninggal',
				tanggalStatusBerubah: new Date().toISOString().slice(0, 10)
			})
			.where(eq(penghuni.id, penghuniId));

		return { tab: 'penghuni', success: true };
	},

	hapusPenghuni: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const penghuniId = String(formData.get('penghuniId') || '');

		await db.delete(penghuni).where(eq(penghuni.id, penghuniId));

		return { tab: 'penghuni', success: true };
	},

	hapusRumah: async (event) => {
		requireRole(event, 'admin_rt');
		await db.delete(rumah).where(eq(rumah.id, event.params.id));
		throw redirect(303, '/rumah');
	}
};
