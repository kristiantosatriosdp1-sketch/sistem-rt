<script lang="ts">
	import {
		TIPE_ORGANISASI_LABEL,
		TIPE_KEANGGOTAAN_LABEL,
		JENIS_ORGANISASI_LABEL
	} from '$lib/validation/organisasi';

	let {
		values = { nama: '', tipe: '', tipeKeanggotaan: 'per_rumah', jenis: 'sosial', deskripsi: '' },
		errors = {},
		submitLabel = 'Simpan',
		loading = false,
		kunciTipeKeanggotaan = false
	}: {
		values?: Record<string, string>;
		errors?: Record<string, string>;
		submitLabel?: string;
		loading?: boolean;
		/** kunci saat edit supaya tidak berubah setelah ada anggota terdaftar */
		kunciTipeKeanggotaan?: boolean;
	} = $props();
</script>

<div class="space-y-3">
	<div>
		<label for="nama" class="mb-1 block text-sm font-medium text-gray-700">Nama Organisasi *</label>
		<input
			id="nama"
			name="nama"
			type="text"
			placeholder="misal: Karang Taruna RT 03"
			value={values.nama}
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.nama
				? 'border-red-400 focus:ring-red-400'
				: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
		/>
		{#if errors.nama}<p class="mt-1 text-xs text-red-600">{errors.nama}</p>{/if}
	</div>

	<div>
		<label for="tipe" class="mb-1 block text-sm font-medium text-gray-700">Tipe Organisasi *</label>
		<select
			id="tipe"
			name="tipe"
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.tipe
				? 'border-red-400 focus:ring-red-400'
				: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
		>
			<option value="" selected={!values.tipe}>Pilih</option>
			{#each Object.entries(TIPE_ORGANISASI_LABEL) as [value, label] (value)}
				<option {value} selected={values.tipe === value}>{label}</option>
			{/each}
		</select>
		{#if errors.tipe}<p class="mt-1 text-xs text-red-600">{errors.tipe}</p>{/if}
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div>
			<label for="tipeKeanggotaan" class="mb-1 block text-sm font-medium text-gray-700">Keanggotaan</label>
			<select
				id="tipeKeanggotaan"
				name="tipeKeanggotaan"
				disabled={kunciTipeKeanggotaan}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-400"
			>
				{#each Object.entries(TIPE_KEANGGOTAAN_LABEL) as [value, label] (value)}
					<option {value} selected={values.tipeKeanggotaan === value}>{label}</option>
				{/each}
			</select>
			{#if kunciTipeKeanggotaan}
				<p class="mt-1 text-xs text-gray-400">Tidak bisa diubah setelah ada anggota terdaftar</p>
			{/if}
		</div>
		<div>
			<label for="jenis" class="mb-1 block text-sm font-medium text-gray-700">Jenis</label>
			<select
				id="jenis"
				name="jenis"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
			>
				{#each Object.entries(JENIS_ORGANISASI_LABEL) as [value, label] (value)}
					<option {value} selected={values.jenis === value}>{label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div>
		<label for="deskripsi" class="mb-1 block text-sm font-medium text-gray-700">Deskripsi (opsional)</label>
		<textarea
			id="deskripsi"
			name="deskripsi"
			rows="2"
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">{values.deskripsi}</textarea
		>
	</div>

	<button
		type="submit"
		disabled={loading}
		class="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white disabled:opacity-60"
	>
		{loading ? 'Menyimpan...' : submitLabel}
	</button>
</div>
