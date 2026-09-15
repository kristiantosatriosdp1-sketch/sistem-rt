import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { kontakDarurat } from '$lib/server/db/schema';
import { parseKontakDaruratForm, validateKontakDaruratInput } from '$lib/validation/informasi';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async () => {
	const daftarKontak = await db
		.select({
			id: kontakDarurat.id,
			nama: kontakDarurat.nama,
			kategori: kontakDarurat.kategori,
			nomor: kontakDarurat.nomor,
			keterangan: kontakDarurat.keterangan
		})
		.from(kontakDarurat);

	return {
		daftarKontak
	};
};

export const actions: Actions = {
	tambah: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const input = parseKontakDaruratForm(formData);
		const errors = validateKontakDaruratInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'tambah', errors, values: input });
		}

		await db.insert(kontakDarurat).values({
			nama: input.nama,
			kategori: input.kategori as 'ambulan' | 'damkar' | 'polisi' | 'pln' | 'pdam' | 'lainnya',
			nomor: input.nomor,
			keterangan: input.keterangan || null
		});

		return { action: 'tambah', success: true };
	},

	edit: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');
		const input = parseKontakDaruratForm(formData);
		const errors = validateKontakDaruratInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'edit', id, errors, values: input });
		}

		await db
			.update(kontakDarurat)
			.set({
				nama: input.nama,
				kategori: input.kategori as 'ambulan' | 'damkar' | 'polisi' | 'pln' | 'pdam' | 'lainnya',
				nomor: input.nomor,
				keterangan: input.keterangan || null
			})
			.where(eq(kontakDarurat.id, id));

		return { action: 'edit', success: true };
	},

	hapus: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');

		await db.delete(kontakDarurat).where(eq(kontakDarurat.id, id));
		return { action: 'hapus', success: true };
	}
};
