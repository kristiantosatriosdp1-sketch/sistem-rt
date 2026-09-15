import { fail } from '@sveltejs/kit';
import { eq, asc, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sop } from '$lib/server/db/schema';
import { parseSopForm, validateSopInput } from '$lib/validation/informasi';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async () => {
	const daftarSop = await db
		.select({
			id: sop.id,
			judul: sop.judul,
			kategori: sop.kategori,
			konten: sop.konten,
			urutan: sop.urutan,
			createdAt: sop.createdAt
		})
		.from(sop)
		.orderBy(asc(sop.urutan), desc(sop.createdAt));

	return {
		daftarSop
	};
};

export const actions: Actions = {
	tambah: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const input = parseSopForm(formData);
		const errors = validateSopInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'tambah', errors, values: input });
		}

		await db.insert(sop).values({
			judul: input.judul,
			kategori: input.kategori || null,
			konten: input.konten,
			urutan: input.urutan ? parseInt(input.urutan, 10) : 0
		});

		return { action: 'tambah', success: true };
	},

	edit: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');
		const input = parseSopForm(formData);
		const errors = validateSopInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'edit', id, errors, values: input });
		}

		await db
			.update(sop)
			.set({
				judul: input.judul,
				kategori: input.kategori || null,
				konten: input.konten,
				urutan: input.urutan ? parseInt(input.urutan, 10) : 0
			})
			.where(eq(sop.id, id));

		return { action: 'edit', success: true };
	},

	hapus: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');

		await db.delete(sop).where(eq(sop.id, id));
		return { action: 'hapus', success: true };
	}
};
