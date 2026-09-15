import { ilike, desc, eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { rumah, penghuni } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() || '';

	let query = db
		.select({
			id: rumah.id,
			alamat: rumah.alamat,
			blokRt: rumah.blokRt,
			kepemilikan: rumah.kepemilikan,
			jumlahPenghuniAktif: sql<number>`count(${penghuni.id}) filter (where ${penghuni.status} = 'aktif')`
		})
		.from(rumah)
		.leftJoin(penghuni, eq(penghuni.rumahId, rumah.id))
		.groupBy(rumah.id)
		.orderBy(desc(rumah.createdAt))
		.limit(100)
		.$dynamic();

	if (q) {
		query = query.where(ilike(rumah.alamat, `%${q}%`));
	}

	const daftarRumah = await query;

	return { daftarRumah, q };
};
