<script lang="ts">
	import { KEPEMILIKAN_LABEL } from '$lib/validation/rumah';

	let {
		values = { alamat: '', blokRt: '', kepemilikan: 'milik_sendiri' },
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
		<label for="alamat" class="mb-1 block text-sm font-medium text-gray-700">Alamat Rumah *</label>
		<textarea
			id="alamat"
			name="alamat"
			rows="2"
			placeholder="misal: Jl. Mawar No. 12"
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 {errors.alamat
				? 'border-red-400 focus:ring-red-400'
				: 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}">{values.alamat}</textarea
		>
		{#if errors.alamat}<p class="mt-1 text-xs text-red-600">{errors.alamat}</p>{/if}
	</div>

	<div>
		<label for="blokRt" class="mb-1 block text-sm font-medium text-gray-700">Blok/No Rumah (opsional)</label>
		<input
			id="blokRt"
			name="blokRt"
			type="text"
			placeholder="misal: RT 03 / Blok C No.12"
			value={values.blokRt}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
		/>
	</div>

	<div>
		<label for="kepemilikan" class="mb-1 block text-sm font-medium text-gray-700">Kepemilikan Rumah</label>
		<select
			id="kepemilikan"
			name="kepemilikan"
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
		>
			{#each Object.entries(KEPEMILIKAN_LABEL) as [value, label] (value)}
				<option {value} selected={values.kepemilikan === value}>{label}</option>
			{/each}
		</select>
	</div>

	<button
		type="submit"
		disabled={loading}
		class="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white disabled:opacity-60"
	>
		{loading ? 'Menyimpan...' : submitLabel}
	</button>
</div>
