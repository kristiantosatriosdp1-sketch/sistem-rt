<script lang="ts">
	import { STATUS_PERNIKAHAN_LABEL } from '$lib/validation/warga';

	let {
		values = {
			namaLengkap: '',
			nik: '',
			noKk: '',
			jenisKelamin: '',
			tanggalLahir: '',
			namaPanggilan: '',
			pekerjaan: '',
			alamatKtp: '',
			noHp: '',
			statusPernikahan: 'belum_menikah'
		},
		errors = {},
		submitLabel = 'Simpan',
		loading = false
	}: {
		values?: Record<string, string>;
		errors?: Record<string, string>;
		submitLabel?: string;
		loading?: boolean;
	} = $props();
</script>

<div class="space-y-3">
	<div>
		<label for="namaLengkap" class="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap *</label>
		<input
			id="namaLengkap"
			name="namaLengkap"
			type="text"
			value={values.namaLengkap}
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.namaLengkap
				? 'border-red-400 focus:ring-red-400'
				: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
		/>
		{#if errors.namaLengkap}<p class="mt-1 text-xs text-red-600">{errors.namaLengkap}</p>{/if}
	</div>

	<div>
		<label for="namaPanggilan" class="mb-1 block text-sm font-medium text-gray-700">Nama Panggilan</label>
		<input
			id="namaPanggilan"
			name="namaPanggilan"
			type="text"
			value={values.namaPanggilan}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
		/>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div>
			<label for="nik" class="mb-1 block text-sm font-medium text-gray-700">NIK *</label>
			<input
				id="nik"
				name="nik"
				type="text"
				inputmode="numeric"
				maxlength="16"
				value={values.nik}
				class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.nik
					? 'border-red-400 focus:ring-red-400'
					: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
			/>
			{#if errors.nik}<p class="mt-1 text-xs text-red-600">{errors.nik}</p>{/if}
		</div>
		<div>
			<label for="noKk" class="mb-1 block text-sm font-medium text-gray-700">No KK *</label>
			<input
				id="noKk"
				name="noKk"
				type="text"
				inputmode="numeric"
				maxlength="16"
				value={values.noKk}
				class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.noKk
					? 'border-red-400 focus:ring-red-400'
					: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
			/>
			{#if errors.noKk}<p class="mt-1 text-xs text-red-600">{errors.noKk}</p>{/if}
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div>
			<label for="jenisKelamin" class="mb-1 block text-sm font-medium text-gray-700">Jenis Kelamin *</label>
			<select
				id="jenisKelamin"
				name="jenisKelamin"
				class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.jenisKelamin
					? 'border-red-400 focus:ring-red-400'
					: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
			>
				<option value="" selected={!values.jenisKelamin}>Pilih</option>
				<option value="L" selected={values.jenisKelamin === 'L'}>Laki-laki</option>
				<option value="P" selected={values.jenisKelamin === 'P'}>Perempuan</option>
			</select>
			{#if errors.jenisKelamin}<p class="mt-1 text-xs text-red-600">{errors.jenisKelamin}</p>{/if}
		</div>
		<div>
			<label for="tanggalLahir" class="mb-1 block text-sm font-medium text-gray-700">Tanggal Lahir *</label>
			<input
				id="tanggalLahir"
				name="tanggalLahir"
				type="date"
				value={values.tanggalLahir}
				class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.tanggalLahir
					? 'border-red-400 focus:ring-red-400'
					: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
			/>
			{#if errors.tanggalLahir}<p class="mt-1 text-xs text-red-600">{errors.tanggalLahir}</p>{/if}
		</div>
	</div>

	<div>
		<label for="statusPernikahan" class="mb-1 block text-sm font-medium text-gray-700">Status Pernikahan</label>
		<select
			id="statusPernikahan"
			name="statusPernikahan"
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
		>
			{#each Object.entries(STATUS_PERNIKAHAN_LABEL) as [value, label] (value)}
				<option {value} selected={values.statusPernikahan === value}>{label}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="pekerjaan" class="mb-1 block text-sm font-medium text-gray-700">Pekerjaan</label>
		<input
			id="pekerjaan"
			name="pekerjaan"
			type="text"
			value={values.pekerjaan}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
		/>
	</div>

	<div>
		<label for="noHp" class="mb-1 block text-sm font-medium text-gray-700">No HP</label>
		<input
			id="noHp"
			name="noHp"
			type="tel"
			value={values.noHp}
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.noHp
				? 'border-red-400 focus:ring-red-400'
				: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
		/>
		{#if errors.noHp}<p class="mt-1 text-xs text-red-600">{errors.noHp}</p>{/if}
	</div>

	<div>
		<label for="alamatKtp" class="mb-1 block text-sm font-medium text-gray-700">Alamat sesuai KTP/KK *</label>
		<textarea
			id="alamatKtp"
			name="alamatKtp"
			rows="2"
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.alamatKtp
				? 'border-red-400 focus:ring-red-400'
				: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}">{values.alamatKtp}</textarea
		>
		{#if errors.alamatKtp}<p class="mt-1 text-xs text-red-600">{errors.alamatKtp}</p>{/if}
	</div>

	<button
		type="submit"
		disabled={loading}
		class="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white disabled:opacity-60"
	>
		{loading ? 'Menyimpan...' : submitLabel}
	</button>
</div>
