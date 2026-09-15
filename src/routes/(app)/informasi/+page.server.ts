import { count, sql, desc, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	agenda,
	pengumuman,
	berita,
	aset,
	usahaWarga,
	hewanPeliharaan,
	kontakDarurat,
	sop,
	organisasi
} from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const now = new Date();

	// Hitung total di tiap tabel
	const [agendaCount] = await db.select({ val: count() }).from(agenda);
	const [pengumumanCount] = await db.select({ val: count() }).from(pengumuman);
	const [beritaCount] = await db.select({ val: count() }).from(berita);
	const [asetCount] = await db
		.select({
			total: count(),
			totalNilai: sql<string>`coalesce(sum(${aset.nilai}), 0)`
		})
		.from(aset);
	const [usahaCount] = await db.select({ val: count() }).from(usahaWarga);
	const [hewanCount] = await db.select({ val: count() }).from(hewanPeliharaan);
	const [kontakCount] = await db.select({ val: count() }).from(kontakDarurat);
	const [sopCount] = await db.select({ val: count() }).from(sop);

	// Ambil 3 agenda terdekat
	const upcomingAgenda = await db
		.select({
			id: agenda.id,
			judul: agenda.judul,
			tanggalMulai: agenda.tanggalMulai,
			lokasi: agenda.lokasi,
			namaOrganisasi: organisasi.nama
		})
		.from(agenda)
		.leftJoin(organisasi, sql`${agenda.organisasiId} = ${organisasi.id}`)
		.where(gte(agenda.tanggalMulai, now))
		.orderBy(agenda.tanggalMulai)
		.limit(3);

	// Ambil 3 pengumuman terbaru
	const recentPengumuman = await db
		.select({
			id: pengumuman.id,
			judul: pengumuman.judul,
			tanggalMulai: pengumuman.tanggalMulai,
			namaOrganisasi: organisasi.nama
		})
		.from(pengumuman)
		.leftJoin(organisasi, sql`${pengumuman.organisasiId} = ${organisasi.id}`)
		.orderBy(desc(pengumuman.tanggalMulai), desc(pengumuman.createdAt))
		.limit(3);

	return {
		stats: {
			agenda: agendaCount.val,
			pengumuman: pengumumanCount.val,
			berita: beritaCount.val,
			aset: asetCount.total,
			asetNilai: Number(asetCount.totalNilai),
			usaha: usahaCount.val,
			hewan: hewanCount.val,
			kontak: kontakCount.val,
			sop: sopCount.val
		},
		upcomingAgenda,
		recentPengumuman
	};
};
