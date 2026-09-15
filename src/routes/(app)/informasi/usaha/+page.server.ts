import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { usahaWarga, rumah } from '$lib/server/db/schema';
import { parseUsahaWargaForm, validateUsahaWargaInput } from '$lib/validation/informasi';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async () => {
	const daftarUsaha = await db
		.select({
			id: usahaWarga.id,
			rumahId: usahaWarga.rumahId,
			alamatRumah: rumah.alamat,
			blokRt: rumah.blokRt,
			namaUsaha: usahaWarga.namaUsaha,
			kategori: usahaWarga.kategori,
			deskripsi: usahaWarga.deskripsi,
			kontak: usahaWarga.kontak,
			fotoUrl: usahaWarga.fotoUrl,
			createdAt: usahaWarga.createdAt
		})
		.from(usahaWarga)
		.leftJoin(rumah, eq(usahaWarga.rumahId, rumah.id))
		.orderBy(desc(usahaWarga.createdAt));

	const semuaRumah = await db
		.select({ id: rumah.id, alamat: rumah.alamat, blokRt: rumah.blokRt })
		.from(rumah)
		.orderBy(rumah.alamat);

	return {
		daftarUsaha,
		semuaRumah
	};
};

export const actions: Actions = {
	tambah: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const input = parseUsahaWargaForm(formData);
		const errors = validateUsahaWargaInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'tambah', errors, values: input });
		}

		await db.insert(usahaWarga).values({
			rumahId: input.rumahId,
			namaUsaha: input.namaUsaha,
			kategori: input.kategori || null,
			deskripsi: input.deskripsi || null,
			kontak: input.kontak || null,
			fotoUrl: input.fotoUrl || null
		});

		return { action: 'tambah', success: true };
	},

	edit: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');
		const input = parseUsahaWargaForm(formData);
		const errors = validateUsahaWargaInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'edit', id, errors, values: input });
		}

		await db
			.update(usahaWarga)
			.set({
				rumahId: input.rumahId,
				namaUsaha: input.namaUsaha,
				kategori: input.kategori || null,
				deskripsi: input.deskripsi || null,
				kontak: input.kontak || null,
				fotoUrl: input.fotoUrl || null
			})
			.where(eq(usahaWarga.id, id));

		return { action: 'edit', success: true };
	},

	hapus: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');

		await db.delete(usahaWarga).where(eq(usahaWarga.id, id));
		return { action: 'hapus', success: true };
	}
};
