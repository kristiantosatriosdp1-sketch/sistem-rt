export const TIPE_KAS_LABEL: Record<string, string> = {
	wajib_bulanan: 'Wajib Bulanan',
	jimpitan: 'Jimpitan',
	kas_organisasi: 'Kas Organisasi',
	sosial: 'Sosial',
	sampah: 'Sampah',
	keamanan: 'Keamanan',
	lainnya: 'Lainnya'
};

// =========================================================
// Kategori Kas
// =========================================================

export type KategoriKasInput = {
	nama: string;
	tipe: string;
	organisasiId: string; // kosong = kas umum RT (tidak terikat organisasi)
	nominalDefault: string;
};

export function parseKategoriKasForm(formData: FormData): KategoriKasInput {
	return {
		nama: String(formData.get('nama') || '').trim(),
		tipe: String(formData.get('tipe') || ''),
		organisasiId: String(formData.get('organisasiId') || ''),
		nominalDefault: String(formData.get('nominalDefault') || '').trim()
	};
}

export function validateKategoriKasInput(input: KategoriKasInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (input.nama.length < 3) errors.nama = 'Nama minimal 3 karakter';
	if (!Object.keys(TIPE_KAS_LABEL).includes(input.tipe)) errors.tipe = 'Pilih tipe kas';
	if (input.nominalDefault) {
		const n = Number(input.nominalDefault);
		if (isNaN(n) || n < 0) errors.nominalDefault = 'Nominal harus angka positif';
	}

	return errors;
}

// =========================================================
// Transaksi Kas
// =========================================================

export type TransaksiInput = {
	jenis: string;
	jumlah: string;
	tanggal: string;
	keterangan: string;
	wargaId: string;
	rumahId: string;
};

export function parseTransaksiForm(formData: FormData): TransaksiInput {
	return {
		jenis: String(formData.get('jenis') || 'masuk'),
		jumlah: String(formData.get('jumlah') || '').trim(),
		tanggal: String(formData.get('tanggal') || ''),
		keterangan: String(formData.get('keterangan') || '').trim(),
		wargaId: String(formData.get('wargaId') || ''),
		rumahId: String(formData.get('rumahId') || '')
	};
}

export function validateTransaksiInput(input: TransaksiInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!['masuk', 'keluar'].includes(input.jenis)) errors.jenis = 'Pilih jenis transaksi';

	const jumlahNum = Number(input.jumlah);
	if (!input.jumlah || isNaN(jumlahNum) || jumlahNum <= 0) {
		errors.jumlah = 'Jumlah harus angka lebih dari 0';
	}
	if (!input.tanggal) errors.tanggal = 'Tanggal wajib diisi';

	return errors;
}
