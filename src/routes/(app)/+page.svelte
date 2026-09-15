<script lang="ts">
	import { formatRupiah } from '$lib/format';

	let { data } = $props();

	const saldoTotal = $derived(Number(data.ringkasanKas.totalMasuk) - Number(data.ringkasanKas.totalKeluar));
</script>

<svelte:head>
	<title>Sistem RT</title>
</svelte:head>

<header class="bg-brand-600 px-4 pt-6 pb-8 text-white">
	<h1 class="text-xl font-semibold">Sistem RT</h1>
	<p class="text-sm text-brand-50 opacity-90">Selamat datang 👋</p>
</header>

<main class="-mt-4 space-y-4 px-4">
	<a href="/kas" class="block rounded-2xl bg-white p-4 shadow-sm">
		<p class="text-xs text-gray-400">Total Saldo Kas</p>
		<p class="mt-1 text-xl font-semibold {saldoTotal < 0 ? 'text-red-600' : 'text-gray-900'}">
			{formatRupiah(saldoTotal)}
		</p>
	</a>

	<section class="grid grid-cols-2 gap-3">
		<a href="/warga" class="rounded-2xl bg-white p-4 shadow-sm">
			<p class="text-2xl">👥</p>
			<p class="mt-1 text-sm font-medium text-gray-800">Warga</p>
		</a>
		<a href="/rumah" class="rounded-2xl bg-white p-4 shadow-sm">
			<p class="text-2xl">🏠</p>
			<p class="mt-1 text-sm font-medium text-gray-800">Rumah</p>
		</a>
		<a href="/organisasi" class="rounded-2xl bg-white p-4 shadow-sm">
			<p class="text-2xl">🤝</p>
			<p class="mt-1 text-sm font-medium text-gray-800">Organisasi</p>
		</a>
		<a href="/kas" class="rounded-2xl bg-white p-4 shadow-sm">
			<p class="text-2xl">💰</p>
			<p class="mt-1 text-sm font-medium text-gray-800">Kas & Iuran</p>
		</a>
	</section>

	<section class="rounded-2xl bg-white p-4 shadow-sm">
		<h2 class="mb-2 text-sm font-semibold text-gray-500">Ringkasan</h2>
		<p class="text-sm text-gray-400">Widget agenda & pengumuman terbaru menyusul di modul Informasi.</p>
	</section>
</main>
