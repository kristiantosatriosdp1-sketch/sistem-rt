<script lang="ts">
	let { data } = $props();

	function umur(tanggalLahir: string) {
		const lahir = new Date(tanggalLahir);
		const now = new Date();
		let usia = now.getFullYear() - lahir.getFullYear();
		const belumUlangTahun =
			now.getMonth() < lahir.getMonth() ||
			(now.getMonth() === lahir.getMonth() && now.getDate() < lahir.getDate());
		if (belumUlangTahun) usia--;
		return usia;
	}
</script>

<svelte:head>
	<title>Data Warga — Sistem RT</title>
</svelte:head>

<div class="space-y-4 px-4 py-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-900">Data Warga</h1>
		<a href="/warga/baru" class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
			+ Tambah
		</a>
	</div>

	<form method="GET" class="flex gap-2">
		<input
			type="search"
			name="q"
			value={data.q}
			placeholder="Cari nama, NIK, atau No KK..."
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
		/>
	</form>

	<a href="/rumah" class="block text-sm text-brand-600">Lihat data Rumah →</a>

	<div class="space-y-2">
		{#each data.daftarWarga as w (w.id)}
			<a href="/warga/{w.id}" class="block rounded-xl bg-white p-4 shadow-sm">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-900">
							{w.namaLengkap}
							{#if w.namaPanggilan}<span class="font-normal text-gray-400">({w.namaPanggilan})</span
								>{/if}
						</p>
						<p class="mt-0.5 text-xs text-gray-400">
							{w.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} · {umur(w.tanggalLahir)} tahun
							{#if w.pekerjaan}· {w.pekerjaan}{/if}
						</p>
						<p class="mt-0.5 text-xs text-gray-400">NIK {w.nik}</p>
					</div>
					<span class="text-gray-300">›</span>
				</div>
			</a>
		{:else}
			<p class="py-8 text-center text-sm text-gray-400">
				{data.q ? 'Tidak ada warga yang cocok dengan pencarian.' : 'Belum ada data warga.'}
			</p>
		{/each}
	</div>
</div>
