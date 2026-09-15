<script lang="ts">
	import { TIPE_ORGANISASI_LABEL, TIPE_KEANGGOTAAN_LABEL } from '$lib/validation/organisasi';

	let { data } = $props();
</script>

<svelte:head>
	<title>Organisasi — Sistem RT</title>
</svelte:head>

<div class="space-y-4 px-4 py-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-900">Organisasi</h1>
		<a href="/organisasi/baru" class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
			+ Tambah
		</a>
	</div>

	<div class="space-y-2">
		{#each data.daftarOrganisasi as o (o.id)}
			<a href="/organisasi/{o.id}" class="block rounded-xl bg-white p-4 shadow-sm">
				<div class="flex items-center justify-between">
					<div>
						<div class="flex items-center gap-2">
							<p class="text-sm font-medium text-gray-900">{o.nama}</p>
							<span
								class="rounded-full px-2 py-0.5 text-xs {o.jenis === 'bisnis'
									? 'bg-amber-100 text-amber-700'
									: 'bg-blue-100 text-blue-700'}"
							>
								{o.jenis === 'bisnis' ? 'Bisnis' : 'Sosial'}
							</span>
						</div>
						<p class="mt-0.5 text-xs text-gray-400">
							{TIPE_ORGANISASI_LABEL[o.tipe]} · {TIPE_KEANGGOTAAN_LABEL[o.tipeKeanggotaan]} · {o.jumlahAnggotaAktif}
							anggota aktif
						</p>
					</div>
					<span class="text-gray-300">›</span>
				</div>
			</a>
		{:else}
			<p class="py-8 text-center text-sm text-gray-400">Belum ada organisasi.</p>
		{/each}
	</div>
</div>
