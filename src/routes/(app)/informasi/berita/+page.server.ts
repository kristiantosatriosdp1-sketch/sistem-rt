import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { berita } from '$lib/server/db/schema';
import { parseBeritaForm, validateBeritaInput } from '$lib/validation/informasi';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async () => {
	const daftarBerita = await db
		.select({
			id: berita.id,
			tingkat: berita.tingkat,
			judul: berita.judul,
			isi: berita.isi,
			sumberUrl: berita.sumberUrl,
			tanggal: berita.tanggal,
			createdAt: berita.createdAt
		})
		.from(berita)
		.orderBy(desc(berita.tanggal), desc(berita.createdAt));

	return {
		daftarBerita
	};
};

export const actions: Actions = {
	tambah: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const input = parseBeritaForm(formData);
		const errors = validateBeritaInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'tambah', errors, values: input });
		}

		await db.insert(berita).values({
			tingkat: input.tingkat as 'rw' | 'kelurahan' | 'kecamatan' | 'kota' | 'provinsi' | 'nasional',
			judul: input.judul,
			isi: input.isi,
			sumberUrl: input.sumberUrl || null,
			tanggal: input.tanggal
		});

		return { action: 'tambah', success: true };
	},

	edit: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');
		const input = parseBeritaForm(formData);
		const errors = validateBeritaInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'edit', id, errors, values: input });
		}

		await db
			.update(berita)
			.set({
				tingkat: input.tingkat as 'rw' | 'kelurahan' | 'kecamatan' | 'kota' | 'provinsi' | 'nasional',
				judul: input.judul,
				isi: input.isi,
				sumberUrl: input.sumberUrl || null,
				tanggal: input.tanggal
			})
			.where(eq(berita.id, id));

		return { action: 'edit', success: true };
	},

	hapus: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');

		await db.delete(berita).where(eq(berita.id, id));
		return { action: 'hapus', success: true };
	}
};
