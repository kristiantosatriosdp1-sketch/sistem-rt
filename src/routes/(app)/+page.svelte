<script lang="ts">
	import { formatRupiah } from '$lib/format';

	let { data } = $props();

	const saldoTotal = $derived(
		Number(data.ringkasanKas.totalMasuk) - Number(data.ringkasanKas.totalKeluar)
	);

	function formatTgl(d: string | Date | null) {
		if (!d) return '-';
		return new Date(d).toLocaleDateString('id-ID', {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		});
	}
</script>

<svelte:head>
	<title>Sistem RT</title>
</svelte:head>

<header class="bg-brand-600 px-4 pt-6 pb-8 text-white">
	<h1 class="text-xl font-semibold">Sistem RT</h1>
	<p class="text-sm text-brand-50 opacity-90">Selamat datang di portal warga RT 👋</p>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Ringkasan Kas -->
	<a href="/kas" class="block rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition hover:shadow-md">
		<div class="flex items-center justify-between">
			<p class="text-xs text-gray-400 font-medium">Total Saldo Kas RT</p>
			<span class="text-xs text-brand-600 font-medium">Detail →</span>
		</div>
		<p class="mt-1 text-2xl font-bold {saldoTotal < 0 ? 'text-red-600' : 'text-gray-900'}">
			{formatRupiah(saldoTotal)}
		</p>
	</a>

	<!-- Menu Grid Utama -->
	<section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<a
			href="/warga"
			class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-gray-200"
		>
			<p class="text-2xl">👥</p>
			<p class="mt-1.5 text-sm font-semibold text-gray-800">Data Warga</p>
			<p class="text-[11px] text-gray-400">Kependudukan & KK</p>
		</a>
		<a
			href="/rumah"
			class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-gray-200"
		>
			<p class="text-2xl">🏠</p>
			<p class="mt-1.5 text-sm font-semibold text-gray-800">Rumah & Blok</p>
			<p class="text-[11px] text-gray-400">Hunian & Penghuni</p>
		</a>
		<a
			href="/kas"
			class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-gray-200"
		>
			<p class="text-2xl">💰</p>
			<p class="mt-1.5 text-sm font-semibold text-gray-800">Kas & Iuran</p>
			<p class="text-[11px] text-gray-400">Jimpitan & Keuangan</p>
		</a>
		<a
			href="/informasi"
			class="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 shadow-sm transition hover:shadow-md hover:bg-brand-50"
		>
			<p class="text-2xl">📋</p>
			<p class="mt-1.5 text-sm font-semibold text-brand-800">Pusat Info</p>
			<p class="text-[11px] text-brand-600">Agenda, SOP, Darurat</p>
		</a>
	</section>

	<!-- Live Widgets: Agenda & Pengumuman -->
	{#if data.upcomingAgenda.length > 0 || data.recentPengumuman.length > 0}
		<section class="space-y-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
			{#if data.upcomingAgenda.length > 0}
				<div>
					<div class="flex items-center justify-between pb-2">
						<h2 class="text-xs font-semibold uppercase tracking-wider text-gray-500">📅 Agenda Mendatang</h2>
						<a href="/informasi/agenda" class="text-xs font-medium text-brand-600">Semua →</a>
					</div>
					<div class="space-y-2">
						{#each data.upcomingAgenda as a (a.id)}
							<a
								href="/informasi/agenda"
								class="block rounded-xl border border-gray-100 bg-gray-50/80 p-2.5 transition hover:bg-gray-100"
							>
								<p class="text-sm font-semibold text-gray-900">{a.judul}</p>
								<p class="mt-0.5 text-xs text-gray-500">
									🕒 {formatTgl(a.tanggalMulai)}
									{#if a.lokasi} • 📍 {a.lokasi}{/if}
								</p>
							</a>
						{/each}
					</div>
				</div>
			{/if}

			{#if data.recentPengumuman.length > 0}
				<div class={data.upcomingAgenda.length > 0 ? 'border-t border-gray-100 pt-3' : ''}>
					<div class="flex items-center justify-between pb-2">
						<h2 class="text-xs font-semibold uppercase tracking-wider text-gray-500">📢 Pengumuman Baru</h2>
						<a href="/informasi/pengumuman" class="text-xs font-medium text-brand-600">Semua →</a>
					</div>
					<div class="space-y-2">
						{#each data.recentPengumuman as p (p.id)}
							<a
								href="/informasi/pengumuman"
								class="block rounded-xl border border-amber-100 bg-amber-50/40 p-2.5 transition hover:bg-amber-50/70"
							>
								<p class="text-sm font-semibold text-gray-900">{p.judul}</p>
								<p class="mt-0.5 text-xs text-gray-500">
									📅 {formatTgl(p.tanggalMulai)}
									{#if p.namaOrganisasi} • 🏛️ {p.namaOrganisasi}{/if}
								</p>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</section>
	{:else}
		<section class="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 text-center text-gray-400 py-6">
			<p class="text-2xl">📋</p>
			<p class="mt-1.5 text-sm font-medium text-gray-600">Pusat Informasi Siap Digunakan</p>
			<p class="text-xs text-gray-400 mt-0.5">Kelola agenda, pengumuman, aset, SOP, dan kontak darurat warga.</p>
			<a
				href="/informasi"
				class="inline-block mt-3 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
			>
				Buka Pusat Informasi →
			</a>
		</section>
	{/if}
</main>
