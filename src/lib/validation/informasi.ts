// =========================================================
// LABELS & CONSTANTS
// =========================================================

export const TINGKAT_BERITA_LABEL: Record<string, string> = {
	rw: 'RW',
	kelurahan: 'Kelurahan / Desa',
	kecamatan: 'Kecamatan',
	kota: 'Kota / Kabupaten',
	provinsi: 'Provinsi',
	nasional: 'Nasional'
};

export const KATEGORI_KONTAK_LABEL: Record<string, string> = {
	ambulan: 'Ambulan / Medis',
	damkar: 'Pemadam Kebakaran',
	polisi: 'Polisi / Keamanan',
	pln: 'PLN / Listrik',
	pdam: 'PDAM / Air Bersih',
	lainnya: 'Lainnya'
};

// =========================================================
// 1. AGENDA
// =========================================================

export type AgendaInput = {
	organisasiId: string;
	judul: string;
	deskripsi: string;
	tanggalMulai: string;
	tanggalSelesai: string;
	lokasi: string;
};

export function parseAgendaForm(formData: FormData): AgendaInput {
	return {
		organisasiId: String(formData.get('organisasiId') || ''),
		judul: String(formData.get('judul') || '').trim(),
		deskripsi: String(formData.get('deskripsi') || '').trim(),
		tanggalMulai: String(formData.get('tanggalMulai') || ''),
		tanggalSelesai: String(formData.get('tanggalSelesai') || ''),
		lokasi: String(formData.get('lokasi') || '').trim()
	};
}

export function validateAgendaInput(input: AgendaInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!input.organisasiId) errors.organisasiId = 'Pilih organisasi penyelenggara';
	if (input.judul.length < 3) errors.judul = 'Judul minimal 3 karakter';
	if (!input.tanggalMulai) errors.tanggalMulai = 'Waktu mulai wajib diisi';

	return errors;
}

// =========================================================
// 2. PENGUMUMAN
// =========================================================

export type PengumumanInput = {
	organisasiId: string;
	judul: string;
	isi: string;
	tanggalMulai: string;
	tanggalBerakhir: string;
};

export function parsePengumumanForm(formData: FormData): PengumumanInput {
	return {
		organisasiId: String(formData.get('organisasiId') || ''),
		judul: String(formData.get('judul') || '').trim(),
		isi: String(formData.get('isi') || '').trim(),
		tanggalMulai: String(formData.get('tanggalMulai') || ''),
		tanggalBerakhir: String(formData.get('tanggalBerakhir') || '')
	};
}

export function validatePengumumanInput(input: PengumumanInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (input.judul.length < 3) errors.judul = 'Judul minimal 3 karakter';
	if (input.isi.length < 5) errors.isi = 'Isi pengumuman minimal 5 karakter';
	if (!input.tanggalMulai) errors.tanggalMulai = 'Tanggal mulai wajib diisi';

	return errors;
}

// =========================================================
// 3. BERITA
// =========================================================

export type BeritaInput = {
	tingkat: string;
	judul: string;
	isi: string;
	sumberUrl: string;
	tanggal: string;
};

export function parseBeritaForm(formData: FormData): BeritaInput {
	return {
		tingkat: String(formData.get('tingkat') || 'rw'),
		judul: String(formData.get('judul') || '').trim(),
		isi: String(formData.get('isi') || '').trim(),
		sumberUrl: String(formData.get('sumberUrl') || '').trim(),
		tanggal: String(formData.get('tanggal') || '')
	};
}

export function validateBeritaInput(input: BeritaInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!Object.keys(TINGKAT_BERITA_LABEL).includes(input.tingkat)) {
		errors.tingkat = 'Pilih tingkat berita';
	}
	if (input.judul.length < 3) errors.judul = 'Judul minimal 3 karakter';
	if (input.isi.length < 5) errors.isi = 'Isi berita minimal 5 karakter';
	if (!input.tanggal) errors.tanggal = 'Tanggal berita wajib diisi';

	return errors;
}

// =========================================================
// 4. ASET
// =========================================================

export type AsetInput = {
	organisasiId: string;
	nama: string;
	deskripsi: string;
	nilai: string;
	kondisi: string;
	fotoUrl: string;
};

export function parseAsetForm(formData: FormData): AsetInput {
	return {
		organisasiId: String(formData.get('organisasiId') || ''),
		nama: String(formData.get('nama') || '').trim(),
		deskripsi: String(formData.get('deskripsi') || '').trim(),
		nilai: String(formData.get('nilai') || '').trim(),
		kondisi: String(formData.get('kondisi') || '').trim(),
		fotoUrl: String(formData.get('fotoUrl') || '').trim()
	};
}

export function validateAsetInput(input: AsetInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!input.organisasiId) errors.organisasiId = 'Pilih organisasi pemilik aset';
	if (input.nama.length < 3) errors.nama = 'Nama aset minimal 3 karakter';
	if (input.nilai) {
		const n = Number(input.nilai);
		if (isNaN(n) || n < 0) errors.nilai = 'Nilai aset harus berupa angka positif';
	}

	return errors;
}

// =========================================================
// 5. USAHA WARGA
// =========================================================

export type UsahaWargaInput = {
	rumahId: string;
	namaUsaha: string;
	kategori: string;
	deskripsi: string;
	kontak: string;
	fotoUrl: string;
};

export function parseUsahaWargaForm(formData: FormData): UsahaWargaInput {
	return {
		rumahId: String(formData.get('rumahId') || ''),
		namaUsaha: String(formData.get('namaUsaha') || '').trim(),
		kategori: String(formData.get('kategori') || '').trim(),
		deskripsi: String(formData.get('deskripsi') || '').trim(),
		kontak: String(formData.get('kontak') || '').trim(),
		fotoUrl: String(formData.get('fotoUrl') || '').trim()
	};
}

export function validateUsahaWargaInput(input: UsahaWargaInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!input.rumahId) errors.rumahId = 'Pilih rumah domisili usaha';
	if (input.namaUsaha.length < 3) errors.namaUsaha = 'Nama usaha minimal 3 karakter';

	return errors;
}

// =========================================================
// 6. HEWAN PELIHARAAN
// =========================================================

export type HewanPeliharaanInput = {
	rumahId: string;
	nama: string;
	jenis: string;
	keterangan: string;
};

export function parseHewanPeliharaanForm(formData: FormData): HewanPeliharaanInput {
	return {
		rumahId: String(formData.get('rumahId') || ''),
		nama: String(formData.get('nama') || '').trim(),
		jenis: String(formData.get('jenis') || '').trim(),
		keterangan: String(formData.get('keterangan') || '').trim()
	};
}

export function validateHewanPeliharaanInput(input: HewanPeliharaanInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!input.rumahId) errors.rumahId = 'Pilih rumah pemilik hewan';
	if (!input.jenis && !input.nama) {
		errors.jenis = 'Isi minimal jenis atau nama hewan';
	}

	return errors;
}

// =========================================================
// 7. KONTAK DARURAT
// =========================================================

export type KontakDaruratInput = {
	nama: string;
	kategori: string;
	nomor: string;
	keterangan: string;
};

export function parseKontakDaruratForm(formData: FormData): KontakDaruratInput {
	return {
		nama: String(formData.get('nama') || '').trim(),
		kategori: String(formData.get('kategori') || 'ambulan'),
		nomor: String(formData.get('nomor') || '').trim(),
		keterangan: String(formData.get('keterangan') || '').trim()
	};
}

export function validateKontakDaruratInput(input: KontakDaruratInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (input.nama.length < 3) errors.nama = 'Nama instansi/kontak minimal 3 karakter';
	if (!Object.keys(KATEGORI_KONTAK_LABEL).includes(input.kategori)) {
		errors.kategori = 'Pilih kategori kontak darurat';
	}
	if (!input.nomor || input.nomor.length < 3) {
		errors.nomor = 'Nomor darurat wajib diisi';
	}

	return errors;
}

// =========================================================
// 8. SOP
// =========================================================

export type SopInput = {
	judul: string;
	kategori: string;
	konten: string;
	urutan: string;
};

export function parseSopForm(formData: FormData): SopInput {
	return {
		judul: String(formData.get('judul') || '').trim(),
		kategori: String(formData.get('kategori') || '').trim(),
		konten: String(formData.get('konten') || '').trim(),
		urutan: String(formData.get('urutan') || '0').trim()
	};
}

export function validateSopInput(input: SopInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (input.judul.length < 3) errors.judul = 'Judul SOP minimal 3 karakter';
	if (input.konten.length < 5) errors.konten = 'Konten SOP minimal 5 karakter';

	return errors;
}
