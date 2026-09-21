import { sql, desc, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { transaksiKas, agenda, pengumuman, berita, organisasi } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const now = new Date();

	const [ringkasan] = await db
		.select({
			totalMasuk: sql<string>`coalesce(sum(${transaksiKas.jumlah}) filter (where ${transaksiKas.jenis} = 'masuk'), 0)`,
			totalKeluar: sql<string>`coalesce(sum(${transaksiKas.jumlah}) filter (where ${transaksiKas.jenis} = 'keluar'), 0)`
		})
		.from(transaksiKas);

	const upcomingAgenda = await db
		.select({
			id: agenda.id,
			judul: agenda.judul,
			tanggalMulai: agenda.tanggalMulai,
			tanggalSelesai: agenda.tanggalSelesai,
			lokasi: agenda.lokasi,
			namaOrganisasi: organisasi.nama,
			deskripsi: agenda.deskripsi,
		})
		.from(agenda)
		.leftJoin(organisasi, sql`${agenda.organisasiId} = ${organisasi.id}`)
		.where(gte(agenda.tanggalMulai, now))
		.orderBy(agenda.tanggalMulai)
		.limit(3);

	const recentPengumuman = await db
		.select({
			id: pengumuman.id,
			judul: pengumuman.judul,
			tanggalMulai: pengumuman.tanggalMulai,
			namaOrganisasi: organisasi.nama,
			isi: pengumuman.isi
		})
		.from(pengumuman)
		.leftJoin(organisasi, sql`${pengumuman.organisasiId} = ${organisasi.id}`)
		.orderBy(desc(pengumuman.tanggalMulai), desc(pengumuman.createdAt))
		.limit(2);

	const updateBerita = await db
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
		.orderBy(desc(berita.tanggal), desc(berita.createdAt))
		.limit(3);

	return {
		ringkasanKas: ringkasan ?? { totalMasuk: '0', totalKeluar: '0' },
		upcomingAgenda,
		recentPengumuman,
		updateBerita
	};
};
