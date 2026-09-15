export type WargaInput = {
	namaLengkap: string;
	nik: string;
	noKk: string;
	jenisKelamin: 'L' | 'P' | '';
	tanggalLahir: string;
	namaPanggilan: string;
	pekerjaan: string;
	alamatKtp: string;
	noHp: string;
	statusPernikahan: string;
};

export const STATUS_PERNIKAHAN_LABEL: Record<string, string> = {
	belum_menikah: 'Belum Menikah',
	menikah: 'Menikah',
	cerai_hidup: 'Cerai Hidup',
	cerai_mati: 'Cerai Mati'
};

export function parseWargaForm(formData: FormData): WargaInput {
	return {
		namaLengkap: String(formData.get('namaLengkap') || '').trim(),
		nik: String(formData.get('nik') || '').trim(),
		noKk: String(formData.get('noKk') || '').trim(),
		jenisKelamin: String(formData.get('jenisKelamin') || '') as 'L' | 'P' | '',
		tanggalLahir: String(formData.get('tanggalLahir') || ''),
		namaPanggilan: String(formData.get('namaPanggilan') || '').trim(),
		pekerjaan: String(formData.get('pekerjaan') || '').trim(),
		alamatKtp: String(formData.get('alamatKtp') || '').trim(),
		noHp: String(formData.get('noHp') || '').trim(),
		statusPernikahan: String(formData.get('statusPernikahan') || 'belum_menikah')
	};
}

export function validateWargaInput(input: WargaInput): Record<string, string> {
	const errors: Record<string, string> = {};

	if (input.namaLengkap.length < 3) errors.namaLengkap = 'Nama minimal 3 karakter';
	if (!/^\d{16}$/.test(input.nik)) errors.nik = 'NIK harus 16 digit angka';
	if (!/^\d{16}$/.test(input.noKk)) errors.noKk = 'No KK harus 16 digit angka';
	if (!['L', 'P'].includes(input.jenisKelamin)) errors.jenisKelamin = 'Pilih jenis kelamin';
	if (!input.tanggalLahir) errors.tanggalLahir = 'Tanggal lahir wajib diisi';
	if (!['belum_menikah', 'menikah', 'cerai_hidup', 'cerai_mati'].includes(input.statusPernikahan)) {
		errors.statusPernikahan = 'Status pernikahan tidak valid';
	}
	if (!input.alamatKtp || input.alamatKtp.length < 5) {
		errors.alamatKtp = 'Alamat sesuai KTP/KK wajib diisi';
	}
	if (input.noHp && !/^[0-9+\s-]{8,20}$/.test(input.noHp)) {
		errors.noHp = 'Format no HP tidak valid';
	}

	return errors;
}
