import { fail } from '@sveltejs/kit';
import { eq, desc, asc, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { agenda, organisasi } from '$lib/server/db/schema';
import { parseAgendaForm, validateAgendaInput } from '$lib/validation/informasi';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async () => {
	const daftarAgenda = await db
		.select({
			id: agenda.id,
			organisasiId: agenda.organisasiId,
			namaOrganisasi: organisasi.nama,
			judul: agenda.judul,
			deskripsi: agenda.deskripsi,
			tanggalMulai: agenda.tanggalMulai,
			tanggalSelesai: agenda.tanggalSelesai,
			lokasi: agenda.lokasi,
			createdAt: agenda.createdAt
		})
		.from(agenda)
		.leftJoin(organisasi, eq(agenda.organisasiId, organisasi.id))
		.orderBy(desc(agenda.tanggalMulai));

	const semuaOrganisasi = await db
		.select({ id: organisasi.id, nama: organisasi.nama })
		.from(organisasi)
		.orderBy(organisasi.nama);

	return {
		daftarAgenda,
		semuaOrganisasi
	};
};

export const actions: Actions = {
	tambah: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const input = parseAgendaForm(formData);
		const errors = validateAgendaInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'tambah', errors, values: input });
		}

		await db.insert(agenda).values({
			organisasiId: input.organisasiId,
			judul: input.judul,
			deskripsi: input.deskripsi || null,
			tanggalMulai: new Date(input.tanggalMulai),
			tanggalSelesai: input.tanggalSelesai ? new Date(input.tanggalSelesai) : null,
			lokasi: input.lokasi || null
		});

		return { action: 'tambah', success: true };
	},

	edit: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');
		const input = parseAgendaForm(formData);
		const errors = validateAgendaInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'edit', id, errors, values: input });
		}

		await db
			.update(agenda)
			.set({
				organisasiId: input.organisasiId,
				judul: input.judul,
				deskripsi: input.deskripsi || null,
				tanggalMulai: new Date(input.tanggalMulai),
				tanggalSelesai: input.tanggalSelesai ? new Date(input.tanggalSelesai) : null,
				lokasi: input.lokasi || null
			})
			.where(eq(agenda.id, id));

		return { action: 'edit', success: true };
	},

	hapus: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');
		const formData = await event.request.formData();
		const id = String(formData.get('id') || '');

		await db.delete(agenda).where(eq(agenda.id, id));
		return { action: 'hapus', success: true };
	}
};
