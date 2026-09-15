<script lang="ts">
	import { TIPE_KAS_LABEL } from '$lib/validation/kas';
	import { formatRupiah } from '$lib/format';

	let { data } = $props();

	const totalSaldoKeseluruhan = $derived(
		data.daftarKategori.reduce((acc, k) => acc + (Number(k.totalMasuk) - Number(k.totalKeluar)), 0)
	);
</script>

<svelte:head>
	<title>Kas & Iuran — Sistem RT</title>
</svelte:head>

<div class="space-y-4 px-4 py-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-900">Kas & Iuran</h1>
		<a href="/kas/baru" class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
			+ Kategori
		</a>
	</div>

	<div class="rounded-xl bg-brand-600 p-4 text-white shadow-sm">
		<p class="text-xs text-brand-50 opacity-90">Total Saldo Seluruh Kas</p>
		<p class="mt-1 text-2xl font-semibold">{formatRupiah(totalSaldoKeseluruhan)}</p>
	</div>

	<div class="space-y-2">
		{#each data.daftarKategori as k (k.id)}
			{@const saldo = Number(k.totalMasuk) - Number(k.totalKeluar)}
			<a href="/kas/{k.id}" class="block rounded-xl bg-white p-4 shadow-sm">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-900">{k.nama}</p>
						<p class="mt-0.5 text-xs text-gray-400">
							{TIPE_KAS_LABEL[k.tipe]}{#if k.namaOrganisasi}· {k.namaOrganisasi}{:else}· Kas Umum RT{/if}
						</p>
					</div>
					<p class="text-sm font-semibold {saldo < 0 ? 'text-red-600' : 'text-gray-900'}">
						{formatRupiah(saldo)}
					</p>
				</div>
			</a>
		{:else}
			<p class="py-8 text-center text-sm text-gray-400">Belum ada kategori kas.</p>
		{/each}
	</div>
</div>
