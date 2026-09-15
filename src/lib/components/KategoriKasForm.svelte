<script lang="ts">
	import { TIPE_KAS_LABEL } from '$lib/validation/kas';

	let {
		values = { nama: '', tipe: '', organisasiId: '', nominalDefault: '' },
		errors = {},
		submitLabel = 'Simpan',
		loading = false,
		semuaOrganisasi = [],
		kunciOrganisasi = false
	}: {
		values?: Record<string, string>;
		errors?: Record<string, string>;
		submitLabel?: string;
		loading?: boolean;
		semuaOrganisasi?: { id: string; nama: string }[];
		kunciOrganisasi?: boolean;
	} = $props();
</script>

<div class="space-y-3">
	<div>
		<label for="nama" class="mb-1 block text-sm font-medium text-gray-700">Nama Kategori *</label>
		<input
			id="nama"
			name="nama"
			type="text"
			placeholder="misal: Kas Wajib Bulanan RT"
			value={values.nama}
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.nama
				? 'border-red-400 focus:ring-red-400'
				: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
		/>
		{#if errors.nama}<p class="mt-1 text-xs text-red-600">{errors.nama}</p>{/if}
	</div>

	<div>
		<label for="tipe" class="mb-1 block text-sm font-medium text-gray-700">Tipe Kas *</label>
		<select
			id="tipe"
			name="tipe"
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.tipe
				? 'border-red-400 focus:ring-red-400'
				: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
		>
			<option value="" selected={!values.tipe}>Pilih</option>
			{#each Object.entries(TIPE_KAS_LABEL) as [value, label] (value)}
				<option {value} selected={values.tipe === value}>{label}</option>
			{/each}
		</select>
		{#if errors.tipe}<p class="mt-1 text-xs text-red-600">{errors.tipe}</p>{/if}
	</div>

	<div>
		<label for="organisasiId" class="mb-1 block text-sm font-medium text-gray-700">Milik Organisasi</label>
		{#if kunciOrganisasi}
			<p class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
				{values.namaOrganisasi || 'Kas Umum RT (tidak terikat organisasi)'}
			</p>
			<p class="mt-1 text-xs text-gray-400">Tidak bisa diubah setelah kategori dibuat</p>
		{:else}
			<select
				id="organisasiId"
				name="organisasiId"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
			>
				<option value="" selected={!values.organisasiId}>Kas Umum RT (tidak terikat organisasi)</option>
				{#each semuaOrganisasi as o (o.id)}
					<option value={o.id} selected={values.organisasiId === o.id}>{o.nama}</option>
				{/each}
			</select>
		{/if}
	</div>

	<div>
		<label for="nominalDefault" class="mb-1 block text-sm font-medium text-gray-700"
			>Nominal Default (opsional)</label
		>
		<input
			id="nominalDefault"
			name="nominalDefault"
			type="number"
			min="0"
			step="1000"
			placeholder="misal: 20000 (untuk iuran wajib bulanan)"
			value={values.nominalDefault}
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.nominalDefault
				? 'border-red-400 focus:ring-red-400'
				: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}"
		/>
		{#if errors.nominalDefault}<p class="mt-1 text-xs text-red-600">{errors.nominalDefault}</p>{/if}
	</div>

	<button
		type="submit"
		disabled={loading}
		class="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white disabled:opacity-60"
	>
		{loading ? 'Menyimpan...' : submitLabel}
	</button>
</div>
