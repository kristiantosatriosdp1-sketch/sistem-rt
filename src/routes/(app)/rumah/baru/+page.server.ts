import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { rumah } from '$lib/server/db/schema';
import { parseRumahForm, validateRumahInput } from '$lib/validation/rumah';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async (event) => {
	requireRole(event, 'admin_rt', 'pengurus');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const input = parseRumahForm(formData);
		const errors = validateRumahInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: input });
		}

		const [created] = await db
			.insert(rumah)
			.values({
				alamat: input.alamat,
				blokRt: input.blokRt || null,
				kepemilikan: input.kepemilikan as 'milik_sendiri' | 'sewa' | 'kos' | 'dinas' | 'lainnya'
			})
			.returning({ id: rumah.id });

		throw redirect(303, `/rumah/${created.id}`);
	}
};
