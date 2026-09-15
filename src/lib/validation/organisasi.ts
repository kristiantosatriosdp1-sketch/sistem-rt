export type OrganisasiInput = {
	nama: string;
	tipe: string;
	tipeKeanggotaan: string;
	jenis: string;
	deskripsi: string;
};

export const TIPE_ORGANISASI_LABEL: Record<string, string> = {
	rt: 'RT',
	dawis: 'Dawis',
	koperasi: 'Koperasi',
	pemuda: 'Pemuda',
	remaja: 'Remaja',
	keagamaan: 'Keagamaan',
	lainnya: 'Lainnya'
};

export const TIPE_KEANGGOTAAN_LABEL: Record<string, string> = {
	per_orang: 'Per Orang',
	per_rumah: 'Per Rumah (KK)'
};

export const JENIS_ORGANISASI_LABEL: Record<string, string> = {
	bisnis: 'Bisnis',
	sosial: 'Sosial'
};

export const STATUS_ANGGOTA_LABEL: Record<string, string> = {
	aktif: 'Aktif',
	nonaktif: 'Nonaktif'
};

export function parseOrganisasiForm(formData: FormData): OrganisasiInput {
	return {
		nama: String(formData.get('nama') || '').trim(),
		tipe: String(formData.get('tipe') || ''),
		tipeKeanggotaan: String(formData.get('tipeKeanggotaan') || 'per_rumah'),
		jenis: String(formData.get('jenis') || 'sosial'),
		deskripsi: String(formData.get('deskripsi') || '').trim()
	};
}

export function validateOrganisasiInput(input: OrganisasiInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (input.nama.length < 3) errors.nama = 'Nama minimal 3 karakter';
	if (!Object.keys(TIPE_ORGANISASI_LABEL).includes(input.tipe)) errors.tipe = 'Pilih tipe organisasi';
	if (!Object.keys(TIPE_KEANGGOTAAN_LABEL).includes(input.tipeKeanggotaan)) {
		errors.tipeKeanggotaan = 'Pilih tipe keanggotaan';
	}
	if (!Object.keys(JENIS_ORGANISASI_LABEL).includes(input.jenis)) errors.jenis = 'Pilih jenis organisasi';

	return errors;
}
