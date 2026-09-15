import { eq, sql, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { kategoriKas, transaksiKas, organisasi } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const daftarKategori = await db
		.select({
			id: kategoriKas.id,
			nama: kategoriKas.nama,
			tipe: kategoriKas.tipe,
			namaOrganisasi: organisasi.nama,
			totalMasuk: sql<string>`coalesce(sum(${transaksiKas.jumlah}) filter (where ${transaksiKas.jenis} = 'masuk'), 0)`,
			totalKeluar: sql<string>`coalesce(sum(${transaksiKas.jumlah}) filter (where ${transaksiKas.jenis} = 'keluar'), 0)`
		})
		.from(kategoriKas)
		.leftJoin(transaksiKas, eq(transaksiKas.kategoriKasId, kategoriKas.id))
		.leftJoin(organisasi, eq(kategoriKas.organisasiId, organisasi.id))
		.groupBy(kategoriKas.id, organisasi.nama)
		.orderBy(desc(kategoriKas.createdAt));

	return { daftarKategori };
};
