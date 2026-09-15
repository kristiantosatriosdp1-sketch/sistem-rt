import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { hewanPeliharaan, rumah } from '$lib/server/db/schema';
import { parseHewanPeliharaanForm, validateHewanPeliharaanInput } from '$lib/validation/informasi';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async () => {
	const daftarHewan = await db
		.select({
			id: hewanPeliharaan.id,
			rumahId: hewanPeliharaan.rumahId,
			alamatRumah: rumah.alamat,
			blokRt: rumah.blokRt,
			nama: hewanPeliharaan.nama,
			jenis: hewanPeliharaan.jenis,
			keterangan: hewanPeliharaan.keterangan
		})
		.from(hewanPeliharaan)
		.leftJoin(rumah, eq(hewanPeliharaan.rumahId, rumah.id));

	const semuaRumah = await db
		.select({ id: rumah.id, alamat: rumah.alamat, blokRt: rumah.blokRt })
		.from(rumah)
		.orderBy(rumah.alamat);

	return {
		daftarHewan,
		semuaRumah
	};
};

export const actions: Actions = {
	tambah: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const input = parseHewanPeliharaanForm(formData);
		const errors = validateHewanPeliharaanInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'tambah', errors, values: input });
		}

		await db.insert(hewanPeliharaan).values({
			rumahId: input.rumahId,
			nama: input.nama || null,
			jenis: input.jenis || null,
			keterangan: input.keterangan || null
		});

		return { action: 'tambah', success: true };
	},

	edit: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');
		const input = parseHewanPeliharaanForm(formData);
		const errors = validateHewanPeliharaanInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'edit', id, errors, values: input });
		}

		await db
			.update(hewanPeliharaan)
			.set({
				rumahId: input.rumahId,
				nama: input.nama || null,
				jenis: input.jenis || null,
				keterangan: input.keterangan || null
			})
			.where(eq(hewanPeliharaan.id, id));

		return { action: 'edit', success: true };
	},

	hapus: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');

		await db.delete(hewanPeliharaan).where(eq(hewanPeliharaan.id, id));
		return { action: 'hapus', success: true };
	}
};
