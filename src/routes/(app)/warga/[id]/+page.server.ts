import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { warga, penghuni, rumah } from '$lib/server/db/schema';
import { parseWargaForm, validateWargaInput } from '$lib/validation/warga';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async ({ params }) => {
	const [w] = await db.select().from(warga).where(eq(warga.id, params.id));
	if (!w) throw error(404, 'Warga tidak ditemukan');

	const riwayatHunian = await db
		.select({
			id: penghuni.id,
			status: penghuni.status,
			jangkaWaktuMenempati: penghuni.jangkaWaktuMenempati,
			rumahId: rumah.id,
			alamatRumah: rumah.alamat
		})
		.from(penghuni)
		.innerJoin(rumah, eq(penghuni.rumahId, rumah.id))
		.where(eq(penghuni.wargaId, params.id));

	return { warga: w, riwayatHunian };
};

export const actions: Actions = {
	update: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const input = parseWargaForm(formData);
		const errors = validateWargaInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { tab: 'edit', errors, values: input });
		}

		const nikDipakai = await db
			.select({ id: warga.id })
			.from(warga)
			.where(eq(warga.nik, input.nik));
		if (nikDipakai.length > 0 && nikDipakai[0].id !== event.params.id) {
			return fail(400, { tab: 'edit', errors: { nik: 'NIK sudah dipakai warga lain' }, values: input });
		}

		await db
			.update(warga)
			.set({
				namaLengkap: input.namaLengkap,
				nik: input.nik,
				noKk: input.noKk,
				jenisKelamin: input.jenisKelamin as 'L' | 'P',
				tanggalLahir: input.tanggalLahir,
				namaPanggilan: input.namaPanggilan || null,
				pekerjaan: input.pekerjaan || null,
				alamatKtp: input.alamatKtp,
				noHp: input.noHp || null,
				statusPernikahan: input.statusPernikahan as
					| 'belum_menikah'
					| 'menikah'
					| 'cerai_hidup'
					| 'cerai_mati',
				updatedAt: new Date()
			})
			.where(eq(warga.id, event.params.id));

		return { tab: 'edit', success: true };
	},

	hapus: async (event) => {
		requireRole(event, 'admin_rt');
		await db.delete(warga).where(eq(warga.id, event.params.id));
		throw redirect(303, '/warga');
	}
};
