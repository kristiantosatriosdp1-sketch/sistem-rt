import { desc, eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { organisasi, anggotaOrganisasi } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const daftarOrganisasi = await db
		.select({
			id: organisasi.id,
			nama: organisasi.nama,
			tipe: organisasi.tipe,
			tipeKeanggotaan: organisasi.tipeKeanggotaan,
			jenis: organisasi.jenis,
			jumlahAnggotaAktif: sql<number>`count(${anggotaOrganisasi.id}) filter (where ${anggotaOrganisasi.status} = 'aktif')`
		})
		.from(organisasi)
		.leftJoin(anggotaOrganisasi, eq(anggotaOrganisasi.organisasiId, organisasi.id))
		.groupBy(organisasi.id)
		.orderBy(desc(organisasi.createdAt));

	return { daftarOrganisasi };
};
