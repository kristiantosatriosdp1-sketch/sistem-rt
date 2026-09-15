import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { organisasi, anggotaOrganisasi, warga, rumah } from '$lib/server/db/schema';
import { parseOrganisasiForm, validateOrganisasiInput } from '$lib/validation/organisasi';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async ({ params }) => {
	const [o] = await db.select().from(organisasi).where(eq(organisasi.id, params.id));
	if (!o) throw error(404, 'Organisasi tidak ditemukan');

	const daftarAnggota = await db
		.select({
			id: anggotaOrganisasi.id,
			jabatan: anggotaOrganisasi.jabatan,
			status: anggotaOrganisasi.status,
			tanggalBergabung: anggotaOrganisasi.tanggalBergabung,
			wargaId: warga.id,
			namaWarga: warga.namaLengkap,
			rumahId: rumah.id,
			alamatRumah: rumah.alamat
		})
		.from(anggotaOrganisasi)
		.leftJoin(warga, eq(anggotaOrganisasi.wargaId, warga.id))
		.leftJoin(rumah, eq(anggotaOrganisasi.rumahId, rumah.id))
		.where(eq(anggotaOrganisasi.organisasiId, params.id));

	const semuaWarga = await db
		.select({ id: warga.id, namaLengkap: warga.namaLengkap })
		.from(warga)
		.orderBy(warga.namaLengkap);

	const semuaRumah = await db
		.select({ id: rumah.id, alamat: rumah.alamat })
		.from(rumah)
		.orderBy(rumah.alamat);

	return { organisasi: o, daftarAnggota, semuaWarga, semuaRumah };
};

export const actions: Actions = {
	update: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const input = parseOrganisasiForm(formData);
		const errors = validateOrganisasiInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { tab: 'edit', errors, values: input });
		}

		await db
			.update(organisasi)
			.set({
				nama: input.nama,
				tipe: input.tipe as
					| 'rt'
					| 'dawis'
					| 'koperasi'
					| 'pemuda'
					| 'remaja'
					| 'keagamaan'
					| 'lainnya',
				// tipeKeanggotaan sengaja tidak diubah lewat form ini untuk mencegah data anggota jadi tidak konsisten
				jenis: input.jenis as 'bisnis' | 'sosial',
				deskripsi: input.deskripsi || null
			})
			.where(eq(organisasi.id, event.params.id));

		return { tab: 'edit', success: true };
	},

	tambahAnggota: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const [o] = await db.select().from(organisasi).where(eq(organisasi.id, event.params.id));
		if (!o) throw error(404, 'Organisasi tidak ditemukan');

		const formData = await event.request.formData();
		const targetId = String(formData.get('targetId') || '');
		const jabatan = String(formData.get('jabatan') || '').trim() || null;

		if (!targetId) {
			return fail(400, {
				tab: 'anggota',
				message: o.tipeKeanggotaan === 'per_orang' ? 'Pilih warga dulu' : 'Pilih rumah dulu'
			});
		}

		await db.insert(anggotaOrganisasi).values({
			organisasiId: event.params.id,
			wargaId: o.tipeKeanggotaan === 'per_orang' ? targetId : null,
			rumahId: o.tipeKeanggotaan === 'per_rumah' ? targetId : null,
			jabatan
		});

		return { tab: 'anggota', success: true };
	},

	ubahJabatan: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const anggotaId = String(formData.get('anggotaId') || '');
		const jabatan = String(formData.get('jabatan') || '').trim() || null;

		await db.update(anggotaOrganisasi).set({ jabatan }).where(eq(anggotaOrganisasi.id, anggotaId));

		return { tab: 'anggota', success: true };
	},

	ubahStatusAnggota: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const anggotaId = String(formData.get('anggotaId') || '');
		const status = String(formData.get('status') || '');

		await db
			.update(anggotaOrganisasi)
			.set({ status: status as 'aktif' | 'nonaktif' })
			.where(eq(anggotaOrganisasi.id, anggotaId));

		return { tab: 'anggota', success: true };
	},

	hapusAnggota: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const anggotaId = String(formData.get('anggotaId') || '');

		await db.delete(anggotaOrganisasi).where(eq(anggotaOrganisasi.id, anggotaId));

		return { tab: 'anggota', success: true };
	},

	hapusOrganisasi: async (event) => {
		requireRole(event, 'admin_rt');
		await db.delete(organisasi).where(eq(organisasi.id, event.params.id));
		throw redirect(303, '/organisasi');
	}
};
