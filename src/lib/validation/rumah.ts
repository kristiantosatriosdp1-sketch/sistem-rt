export type RumahInput = {
	alamat: string;
	blokRt: string;
	kepemilikan: string;
};

export const KEPEMILIKAN_LABEL: Record<string, string> = {
	milik_sendiri: 'Milik Sendiri',
	sewa: 'Sewa',
	kos: 'Kos',
	dinas: 'Dinas',
	lainnya: 'Lainnya'
};

export const STATUS_PENGHUNI_LABEL: Record<string, string> = {
	aktif: 'Aktif',
	pindah: 'Pindah',
	kerja_luar_kota: 'Kerja Luar Kota',
	meninggal: 'Meninggal'
};

export function parseRumahForm(formData: FormData): RumahInput {
	return {
		alamat: String(formData.get('alamat') || '').trim(),
		blokRt: String(formData.get('blokRt') || '').trim(),
		kepemilikan: String(formData.get('kepemilikan') || 'milik_sendiri')
	};
}

export function validateRumahInput(input: RumahInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (input.alamat.length < 5) errors.alamat = 'Alamat minimal 5 karakter';
	if (!['milik_sendiri', 'sewa', 'kos', 'dinas', 'lainnya'].includes(input.kepemilikan)) {
		errors.kepemilikan = 'Pilih status kepemilikan';
	}

	return errors;
}
