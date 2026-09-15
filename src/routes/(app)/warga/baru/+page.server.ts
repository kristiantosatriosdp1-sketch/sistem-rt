import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { warga } from '$lib/server/db/schema';
import { parseWargaForm, validateWargaInput } from '$lib/validation/warga';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async (event) => {
	requireRole(event, 'admin_rt', 'pengurus');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const input = parseWargaForm(formData);
		const errors = validateWargaInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: input });
		}

		const nikDipakai = await db.select({ id: warga.id }).from(warga).where(eq(warga.nik, input.nik));
		if (nikDipakai.length > 0) {
			return fail(400, { errors: { nik: 'NIK sudah terdaftar' }, values: input });
		}

		const [created] = await db
			.insert(warga)
			.values({
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
					| 'cerai_mati'
			})
			.returning({ id: warga.id });

		throw redirect(303, `/warga/${created.id}`);
	}
};
