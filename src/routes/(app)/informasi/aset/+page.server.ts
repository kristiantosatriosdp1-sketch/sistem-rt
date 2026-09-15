import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { aset, organisasi } from '$lib/server/db/schema';
import { parseAsetForm, validateAsetInput } from '$lib/validation/informasi';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async () => {
	const daftarAset = await db
		.select({
			id: aset.id,
			organisasiId: aset.organisasiId,
			namaOrganisasi: organisasi.nama,
			nama: aset.nama,
			deskripsi: aset.deskripsi,
			nilai: aset.nilai,
			kondisi: aset.kondisi,
			fotoUrl: aset.fotoUrl,
			createdAt: aset.createdAt
		})
		.from(aset)
		.leftJoin(organisasi, eq(aset.organisasiId, organisasi.id))
		.orderBy(desc(aset.createdAt));

	const semuaOrganisasi = await db
		.select({ id: organisasi.id, nama: organisasi.nama })
		.from(organisasi)
		.orderBy(organisasi.nama);

	return {
		daftarAset,
		semuaOrganisasi
	};
};

export const actions: Actions = {
	tambah: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const input = parseAsetForm(formData);
		const errors = validateAsetInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'tambah', errors, values: input });
		}

		await db.insert(aset).values({
			organisasiId: input.organisasiId,
			nama: input.nama,
			deskripsi: input.deskripsi || null,
			nilai: input.nilai ? input.nilai : null,
			kondisi: input.kondisi || null,
			fotoUrl: input.fotoUrl || null
		});

		return { action: 'tambah', success: true };
	},

	edit: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');
		const input = parseAsetForm(formData);
		const errors = validateAsetInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'edit', id, errors, values: input });
		}

		await db
			.update(aset)
			.set({
				organisasiId: input.organisasiId,
				nama: input.nama,
				deskripsi: input.deskripsi || null,
				nilai: input.nilai ? input.nilai : null,
				kondisi: input.kondisi || null,
				fotoUrl: input.fotoUrl || null
			})
			.where(eq(aset.id, id));

		return { action: 'edit', success: true };
	},

	hapus: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');

		await db.delete(aset).where(eq(aset.id, id));
		return { action: 'hapus', success: true };
	}
};
