<script lang="ts">
	import { formatRupiah } from '$lib/format';

	let { data } = $props();

	const menuInformasi = $derived([
		{
			href: '/informasi/agenda',
			label: 'Agenda',
			icon: '📅',
			desc: 'Jadwal kegiatan & rapat RT',
			count: data.stats.agenda,
			unit: 'kegiatan',
			color: 'bg-blue-50 text-blue-700 border-blue-200'
		},
		{
			href: '/informasi/pengumuman',
			label: 'Pengumuman',
			icon: '📢',
			desc: 'Siaran info penting warga',
			count: data.stats.pengumuman,
			unit: 'pengumuman',
			color: 'bg-amber-50 text-amber-700 border-amber-200'
		},
		{
			href: '/informasi/berita',
			label: 'Berita',
			icon: '📰',
			desc: 'Kabar wilayah & eksternal',
			count: data.stats.berita,
			unit: 'berita',
			color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
		},
		{
			href: '/informasi/aset',
			label: 'Aset RT',
			icon: '📦',
			desc: 'Inventaris & peralatan bersama',
			count: data.stats.aset,
			unit: 'barang',
			sublabel: data.stats.asetNilai > 0 ? formatRupiah(data.stats.asetNilai) : undefined,
			color: 'bg-purple-50 text-purple-700 border-purple-200'
		},
		{
			href: '/informasi/usaha',
			label: 'Usaha Warga',
			icon: '🏪',
			desc: 'Katalog UMKM & jasa warga',
			count: data.stats.usaha,
			unit: 'usaha',
			color: 'bg-orange-50 text-orange-700 border-orange-200'
		},
		{
			href: '/informasi/hewan',
			label: 'Hewan Peliharaan',
			icon: '🐾',
			desc: 'Daftar hewan di lingkungan RT',
			count: data.stats.hewan,
			unit: 'terdaftar',
			color: 'bg-teal-50 text-teal-700 border-teal-200'
		},
		{
			href: '/informasi/kontak',
			label: 'Kontak Darurat',
			icon: '🚨',
			desc: 'Ambulan, polisi, damkar, PLN',
			count: data.stats.kontak,
			unit: 'nomor',
			color: 'bg-red-50 text-red-700 border-red-200'
		},
		{
			href: '/informasi/sop',
			label: 'SOP & Tata Tertib',
			icon: '📜',
			desc: 'Panduan & prosedur administrasi',
			count: data.stats.sop,
			unit: 'dokumen',
			color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
		}
	]);

	function formatTgl(isoStr: string | Date | null) {
		if (!isoStr) return '-';
		return new Date(isoStr).toLocaleDateString('id-ID', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Pusat Informasi - Sistem RT</title>
</svelte:head>

<header class="bg-brand-600 px-4 pt-6 pb-8 text-white">
	<h1 class="text-xl font-semibold">Pusat Informasi</h1>
	<p class="text-sm text-brand-50 opacity-90">Agenda, pengumuman, direktori, dan layanan warga</p>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Agenda & Pengumuman Terbaru Preview -->
	{#if data.upcomingAgenda.length > 0 || data.recentPengumuman.length > 0}
		<section class="space-y-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
			{#if data.upcomingAgenda.length > 0}
				<div>
					<div class="flex items-center justify-between pb-2">
						<h2 class="text-xs font-bold uppercase tracking-wider text-gray-800">📅 Agenda Terdekat</h2>
						<a href="/informasi/agenda" class="text-xs font-bold text-brand-700 hover:underline">Lihat Semua →</a>
					</div>
					<div class="space-y-2">
						{#each data.upcomingAgenda as a (a.id)}
							<a
								href="/informasi/agenda"
								class="block rounded-xl border border-gray-100 bg-gray-50/70 p-2.5 transition hover:bg-gray-100"
							>
								<p class="text-sm font-semibold text-gray-900">{a.judul}</p>
								<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
									<span>🕒 {formatTgl(a.tanggalMulai)}</span>
									{#if a.lokasi}<span>📍 {a.lokasi}</span>{/if}
									{#if a.namaOrganisasi}<span>🏛️ {a.namaOrganisasi}</span>{/if}
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}

			{#if data.recentPengumuman.length > 0}
				<div class={data.upcomingAgenda.length > 0 ? 'border-t border-gray-100 pt-3' : ''}>
					<div class="flex items-center justify-between pb-2">
						<h2 class="text-xs font-bold uppercase tracking-wider text-gray-800">📢 Pengumuman Baru</h2>
						<a href="/informasi/pengumuman" class="text-xs font-bold text-brand-700 hover:underline">Lihat Semua →</a>
					</div>
					<div class="space-y-2">
						{#each data.recentPengumuman as p (p.id)}
							<a
								href="/informasi/pengumuman"
								class="block rounded-xl border border-amber-100 bg-amber-50/40 p-2.5 transition hover:bg-amber-50/70"
							>
								<p class="text-sm font-semibold text-gray-900">{p.judul}</p>
								<p class="mt-0.5 text-xs text-gray-600">
									📅 {new Date(p.tanggalMulai).toLocaleDateString('id-ID', {
										day: 'numeric',
										month: 'short',
										year: 'numeric'
									})}
									{#if p.namaOrganisasi} • 🏛️ {p.namaOrganisasi}{/if}
								</p>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</section>
	{/if}

	<!-- 8 Modul Navigasi Grid -->
	<section>
		<h2 class="mb-3 px-1 text-sm font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
			<span>📁</span>
			<span>Kategori Informasi</span>
		</h2>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-2">
			{#each menuInformasi as menu (menu.href)}
				<a
					href={menu.href}
					class="group relative flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md"
				>
					<div>
						<div class="flex items-center justify-between">
							<span class="text-2xl">{menu.icon}</span>
							<span class="rounded-full px-2 py-0.5 text-xs font-bold {menu.color}">
								{menu.count} {menu.unit}
							</span>
						</div>
						<h3 class="mt-2.5 text-base font-bold text-gray-900 group-hover:text-brand-700">
							{menu.label}
						</h3>
						<p class="mt-1 text-xs leading-relaxed text-gray-600">{menu.desc}</p>
					</div>

					{#if menu.sublabel}
						<div class="mt-3 border-t border-gray-100 pt-2 text-[11px] font-semibold text-purple-700">
							Nilai: {menu.sublabel}
						</div>
					{/if}
				</a>
			{/each}
		</div>
	</section>
</main>
