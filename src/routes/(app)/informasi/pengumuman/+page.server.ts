import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { pengumuman, organisasi } from '$lib/server/db/schema';
import { parsePengumumanForm, validatePengumumanInput } from '$lib/validation/informasi';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async () => {
	const daftarPengumuman = await db
		.select({
			id: pengumuman.id,
			organisasiId: pengumuman.organisasiId,
			namaOrganisasi: organisasi.nama,
			judul: pengumuman.judul,
			isi: pengumuman.isi,
			tanggalMulai: pengumuman.tanggalMulai,
			tanggalBerakhir: pengumuman.tanggalBerakhir,
			createdAt: pengumuman.createdAt
		})
		.from(pengumuman)
		.leftJoin(organisasi, eq(pengumuman.organisasiId, organisasi.id))
		.orderBy(desc(pengumuman.tanggalMulai), desc(pengumuman.createdAt));

	const semuaOrganisasi = await db
		.select({ id: organisasi.id, nama: organisasi.nama })
		.from(organisasi)
		.orderBy(organisasi.nama);

	return {
		daftarPengumuman,
		semuaOrganisasi
	};
};

export const actions: Actions = {
	tambah: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const input = parsePengumumanForm(formData);
		const errors = validatePengumumanInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'tambah', errors, values: input });
		}

		await db.insert(pengumuman).values({
			organisasiId: input.organisasiId || null,
			judul: input.judul,
			isi: input.isi,
			tanggalMulai: input.tanggalMulai,
			tanggalBerakhir: input.tanggalBerakhir || null
		});

		return { action: 'tambah', success: true };
	},

	edit: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');
		const input = parsePengumumanForm(formData);
		const errors = validatePengumumanInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'edit', id, errors, values: input });
		}

		await db
			.update(pengumuman)
			.set({
				organisasiId: input.organisasiId || null,
				judul: input.judul,
				isi: input.isi,
				tanggalMulai: input.tanggalMulai,
				tanggalBerakhir: input.tanggalBerakhir || null
			})
			.where(eq(pengumuman.id, id));

		return { action: 'edit', success: true };
	},

	hapus: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');

		await db.delete(pengumuman).where(eq(pengumuman.id, id));
		return { action: 'hapus', success: true };
	}
};
