import { or, ilike, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { warga } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() || '';

	let query = db.select().from(warga).orderBy(desc(warga.createdAt)).limit(100).$dynamic();

	if (q) {
		query = query.where(
			or(ilike(warga.namaLengkap, `%${q}%`), ilike(warga.nik, `%${q}%`), ilike(warga.noKk, `%${q}%`))
		);
	}

	const daftarWarga = await query;

	return { daftarWarga, q };
};
