import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { kategoriKas, organisasi } from '$lib/server/db/schema';
import { parseKategoriKasForm, validateKategoriKasInput } from '$lib/validation/kas';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async (event) => {
	requireRole(event, 'admin_rt', 'pengurus');

	const semuaOrganisasi = await db
		.select({ id: organisasi.id, nama: organisasi.nama })
		.from(organisasi)
		.orderBy(organisasi.nama);

	return { semuaOrganisasi };
};

export const actions: Actions = {
	default: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const input = parseKategoriKasForm(formData);
		const errors = validateKategoriKasInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: input });
		}

		const [created] = await db
			.insert(kategoriKas)
			.values({
				nama: input.nama,
				tipe: input.tipe as
					| 'wajib_bulanan'
					| 'jimpitan'
					| 'kas_organisasi'
					| 'sosial'
					| 'sampah'
					| 'keamanan'
					| 'lainnya',
				organisasiId: input.organisasiId || null,
				nominalDefault: input.nominalDefault || null
			})
			.returning({ id: kategoriKas.id });

		throw redirect(303, `/kas/${created.id}`);
	}
};
