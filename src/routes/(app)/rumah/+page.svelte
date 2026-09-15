<script lang="ts">
	import { KEPEMILIKAN_LABEL } from '$lib/validation/rumah';

	let { data } = $props();
</script>

<svelte:head>
	<title>Data Rumah — Sistem RT</title>
</svelte:head>

<div class="space-y-4 px-4 py-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-900">Data Rumah</h1>
		<a href="/rumah/baru" class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
			+ Tambah
		</a>
	</div>

	<form method="GET" class="flex gap-2">
		<input
			type="search"
			name="q"
			value={data.q}
			placeholder="Cari alamat..."
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
		/>
	</form>

	<a href="/warga" class="block text-sm text-brand-600">Lihat data Warga →</a>

	<div class="space-y-2">
		{#each data.daftarRumah as r (r.id)}
			<a href="/rumah/{r.id}" class="block rounded-xl bg-white p-4 shadow-sm">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-900">{r.alamat}</p>
						<p class="mt-0.5 text-xs text-gray-400">
							{KEPEMILIKAN_LABEL[r.kepemilikan]}
							{#if r.blokRt}· {r.blokRt}{/if}
							· {r.jumlahPenghuniAktif} penghuni aktif
						</p>
					</div>
					<span class="text-gray-300">›</span>
				</div>
			</a>
		{:else}
			<p class="py-8 text-center text-sm text-gray-400">
				{data.q ? 'Tidak ada rumah yang cocok dengan pencarian.' : 'Belum ada data rumah.'}
			</p>
		{/each}
	</div>
</div>
