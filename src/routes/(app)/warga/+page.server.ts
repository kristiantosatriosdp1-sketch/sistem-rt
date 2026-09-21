import { or, ilike, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { warga } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() || '';

	// =========================================================
	// DAFTAR WARGA
	// =========================================================
	let query = db
		.select()
		.from(warga)
		.orderBy(desc(warga.createdAt))
		.limit(100)
		.$dynamic();

	if (q) {
		query = query.where(
			or(
				ilike(warga.namaLengkap, `%${q}%`),
				ilike(warga.nik, `%${q}%`),
				ilike(warga.noKk, `%${q}%`)
			)
		);
	}

	const daftarWarga = await query;

	// =========================================================
	// SEMUA WARGA
	// Dipakai untuk statistik dan modal
	// =========================================================
	const semuaWarga = await db
		.select()
		.from(warga);

	// =========================================================
	// HITUNG UMUR
	// =========================================================
	function hitungUmur(tanggalLahir: Date | string | null) {
		if (!tanggalLahir) return null;

		let lahir: Date;

		if (typeof tanggalLahir === 'string') {
			const parts = tanggalLahir.split('T')[0].split('-');

			if (parts.length === 3) {
				lahir = new Date(
					Number(parts[0]),
					Number(parts[1]) - 1,
					Number(parts[2])
				);
			} else {
				lahir = new Date(tanggalLahir);
			}
		} else {
			lahir = new Date(tanggalLahir);
		}

		const sekarang = new Date();

		let usia =
			sekarang.getFullYear() - lahir.getFullYear();

		const bulan =
			sekarang.getMonth() - lahir.getMonth();

		if (
			bulan < 0 ||
			(bulan === 0 &&
				sekarang.getDate() < lahir.getDate())
		) {
			usia--;
		}

		return Math.max(0, usia);
	}

	// =========================================================
	// KELOMPOK WARGA
	// =========================================================
	const lakiLaki = semuaWarga.filter(
		(w) => w.jenisKelamin === 'L'
	);

	const perempuan = semuaWarga.filter(
		(w) => w.jenisKelamin === 'P'
	);

	const balita = semuaWarga.filter((w) => {
		const usia = hitungUmur(w.tanggalLahir);
		return usia !== null && usia >= 0 && usia <= 3;
	});

	const anak = semuaWarga.filter((w) => {
		const usia = hitungUmur(w.tanggalLahir);
		return usia !== null && usia >= 4 && usia <= 11;
	});

	const remaja = semuaWarga.filter((w) => {
		const usia = hitungUmur(w.tanggalLahir);
		return usia !== null && usia >= 12 && usia <= 19;
	});

	const pemuda = semuaWarga.filter((w) => {
		const usia = hitungUmur(w.tanggalLahir);
		return usia !== null && usia >= 20 && usia <= 40;
	});

	const dewasa = semuaWarga.filter((w) => {
		const usia = hitungUmur(w.tanggalLahir);
		return usia !== null && usia >= 41 && usia <= 55;
	});

	const lansia = semuaWarga.filter((w) => {
		const usia = hitungUmur(w.tanggalLahir);
		return usia !== null && usia >= 56;
	});

	// =========================================================
	// TOTAL KK
	// =========================================================
	const daftarKK = new Set(
		semuaWarga
			.map((w) => w.noKk)
			.filter(
				(noKk) =>
					noKk &&
					noKk.trim() !== ''
			)
	);

	const totalKK = daftarKK.size;

	// =========================================================
	// KELOMPOK KK + ANGGOTA
	// =========================================================
	const kelompokKK = Array.from(daftarKK).map((noKk) => ({
		noKk,
		anggota: semuaWarga.filter(
			(w) => w.noKk === noKk
		)
	}));

	// =========================================================
	// RETURN
	// =========================================================
	return {
		daftarWarga,
		q,

		// Untuk modal
		kelompokWarga: {
			semua: semuaWarga,
			lakiLaki,
			perempuan,
			balita,
			anak,
			remaja,
			pemuda,
			dewasa,
			lansia
		},

		kelompokKK,

		statistikWarga: {
			totalWarga: semuaWarga.length,

			totalLakiLaki: lakiLaki.length,
			totalPerempuan: perempuan.length,

			totalBalita: balita.length,

			totalAnak: anak.length,
			anakLakiLaki: anak.filter(
				(w) => w.jenisKelamin === 'L'
			).length,
			anakPerempuan: anak.filter(
				(w) => w.jenisKelamin === 'P'
			).length,

			totalRemaja: remaja.length,
			remajaLakiLaki: remaja.filter(
				(w) => w.jenisKelamin === 'L'
			).length,
			remajaPerempuan: remaja.filter(
				(w) => w.jenisKelamin === 'P'
			).length,

			totalPemuda: pemuda.length,
			pemudaLakiLaki: pemuda.filter(
				(w) => w.jenisKelamin === 'L'
			).length,
			pemudaPerempuan: pemuda.filter(
				(w) => w.jenisKelamin === 'P'
			).length,

			totalDewasa: dewasa.length,
			dewasaLakiLaki: dewasa.filter(
				(w) => w.jenisKelamin === 'L'
			).length,
			dewasaPerempuan: dewasa.filter(
				(w) => w.jenisKelamin === 'P'
			).length,

			totalLansia: lansia.length,
			lansiaLakiLaki: lansia.filter(
				(w) => w.jenisKelamin === 'L'
			).length,
			lansiaPerempuan: lansia.filter(
				(w) => w.jenisKelamin === 'P'
			).length,

			totalKK
		}
	};
};