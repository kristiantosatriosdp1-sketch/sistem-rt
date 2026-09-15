import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { transaksiKas } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const [ringkasan] = await db
		.select({
			totalMasuk: sql<string>`coalesce(sum(${transaksiKas.jumlah}) filter (where ${transaksiKas.jenis} = 'masuk'), 0)`,
			totalKeluar: sql<string>`coalesce(sum(${transaksiKas.jumlah}) filter (where ${transaksiKas.jenis} = 'keluar'), 0)`
		})
		.from(transaksiKas);

	return { ringkasanKas: ringkasan ?? { totalMasuk: '0', totalKeluar: '0' } };
};
