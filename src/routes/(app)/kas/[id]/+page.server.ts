import { error, fail, redirect } from '@sveltejs/kit';
import { eq, desc, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { kategoriKas, transaksiKas, organisasi, warga, rumah, users } from '$lib/server/db/schema';
import {
	parseKategoriKasForm,
	validateKategoriKasInput,
	parseTransaksiForm,
	validateTransaksiInput
} from '$lib/validation/kas';
import { requireRole } from '$lib/server/authz';

export const load: PageServerLoad = async ({ params }) => {
	const [k] = await db
		.select({
			id: kategoriKas.id,
			nama: kategoriKas.nama,
			tipe: kategoriKas.tipe,
			organisasiId: kategoriKas.organisasiId,
			namaOrganisasi: organisasi.nama,
			nominalDefault: kategoriKas.nominalDefault
		})
		.from(kategoriKas)
		.leftJoin(organisasi, eq(kategoriKas.organisasiId, organisasi.id))
		.where(eq(kategoriKas.id, params.id));

	if (!k) throw error(404, 'Kategori kas tidak ditemukan');

	const [ringkasan] = await db
		.select({
			totalMasuk: sql<string>`coalesce(sum(${transaksiKas.jumlah}) filter (where ${transaksiKas.jenis} = 'masuk'), 0)`,
			totalKeluar: sql<string>`coalesce(sum(${transaksiKas.jumlah}) filter (where ${transaksiKas.jenis} = 'keluar'), 0)`
		})
		.from(transaksiKas)
		.where(eq(transaksiKas.kategoriKasId, params.id));

	const daftarTransaksi = await db
		.select({
			id: transaksiKas.id,
			jenis: transaksiKas.jenis,
			jumlah: transaksiKas.jumlah,
			tanggal: transaksiKas.tanggal,
			keterangan: transaksiKas.keterangan,
			namaWarga: warga.namaLengkap,
			alamatRumah: rumah.alamat,
			dicatatOlehUsername: users.username
		})
		.from(transaksiKas)
		.leftJoin(warga, eq(transaksiKas.wargaId, warga.id))
		.leftJoin(rumah, eq(transaksiKas.rumahId, rumah.id))
		.leftJoin(users, eq(transaksiKas.dicatatOleh, users.id))
		.where(eq(transaksiKas.kategoriKasId, params.id))
		.orderBy(desc(transaksiKas.tanggal), desc(transaksiKas.createdAt))
		.limit(50);

	const semuaWarga = await db
		.select({ id: warga.id, namaLengkap: warga.namaLengkap })
		.from(warga)
		.orderBy(warga.namaLengkap);

	const semuaRumah = await db
		.select({ id: rumah.id, alamat: rumah.alamat })
		.from(rumah)
		.orderBy(rumah.alamat);

	return {
		kategori: k,
		ringkasan: ringkasan ?? { totalMasuk: '0', totalKeluar: '0' },
		daftarTransaksi,
		semuaWarga,
		semuaRumah
	};
};

export const actions: Actions = {
	update: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const input = parseKategoriKasForm(formData);
		const errors = validateKategoriKasInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { tab: 'edit', errors, values: input });
		}

		await db
			.update(kategoriKas)
			.set({
				nama: input.nama,
				tipe: input.tipe as
					| 'wajib_bulanan'
					| 'jimpitan'
					| 'kas_organisasi'
					| 'sosial'
					| 'sampah'
					| 'keamanan'
					| 'lainnya',
				// organisasiId sengaja tidak diubah lewat form ini - transaksi lama sudah terikat ke sini
				nominalDefault: input.nominalDefault || null
			})
			.where(eq(kategoriKas.id, event.params.id));

		return { tab: 'edit', success: true };
	},

	tambahTransaksi: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const input = parseTransaksiForm(formData);
		const errors = validateTransaksiInput(input);

		if (Object.keys(errors).length > 0) {
			return fail(400, { tab: 'transaksi', errors, values: input });
		}

		await db.insert(transaksiKas).values({
			kategoriKasId: event.params.id,
			jenis: input.jenis as 'masuk' | 'keluar',
			jumlah: input.jumlah,
			tanggal: input.tanggal,
			keterangan: input.keterangan || null,
			wargaId: input.wargaId || null,
			rumahId: input.rumahId || null,
			dicatatOleh: event.locals.user?.id ?? null
		});

		return { tab: 'transaksi', success: true };
	},

	hapusTransaksi: async (event) => {
		requireRole(event, 'admin_rt', 'pengurus');

		const formData = await event.request.formData();
		const transaksiId = String(formData.get('transaksiId') || '');

		await db.delete(transaksiKas).where(eq(transaksiKas.id, transaksiId));

		return { tab: 'transaksi', success: true };
	},

	hapusKategori: async (event) => {
		requireRole(event, 'admin_rt');
		await db.delete(kategoriKas).where(eq(kategoriKas.id, event.params.id));
		throw redirect(303, '/kas');
	}
};
