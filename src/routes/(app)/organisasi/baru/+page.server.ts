import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { organisasi } from '$lib/server/db/schema';
import { parseOrganisasiForm, validateOrganisasiInput } from '$lib/validation/organisasi';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async (event) => {
	requireRole(event, 'admin_rt', 'pengurus');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const input = parseOrganisasiForm(formData);
		const errors = validateOrganisasiInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: input });
		}

		const [created] = await db
			.insert(organisasi)
			.values({
				nama: input.nama,
				tipe: input.tipe as
					| 'rt'
					| 'dawis'
					| 'koperasi'
					| 'pemuda'
					| 'remaja'
					| 'keagamaan'
					| 'lainnya',
				tipeKeanggotaan: input.tipeKeanggotaan as 'per_orang' | 'per_rumah',
				jenis: input.jenis as 'bisnis' | 'sosial',
				deskripsi: input.deskripsi || null
			})
			.returning({ id: organisasi.id });

		throw redirect(303, `/organisasi/${created.id}`);
	}
};
