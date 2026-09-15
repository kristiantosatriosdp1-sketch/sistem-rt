<script lang="ts">
	import { enhance } from '$app/forms';
	import WargaForm from '$lib/components/WargaForm.svelte';
	import { STATUS_PENGHUNI_LABEL } from '$lib/validation/rumah';

	let { data, form } = $props();

	let mode = $state<'lihat' | 'edit'>('lihat');
	let loading = $state(false);
	let confirmHapus = $state(false);

	const editValues = $derived(
		form?.values ?? {
			namaLengkap: data.warga.namaLengkap,
			nik: data.warga.nik,
			noKk: data.warga.noKk,
			jenisKelamin: data.warga.jenisKelamin,
			tanggalLahir: data.warga.tanggalLahir,
			namaPanggilan: data.warga.namaPanggilan ?? '',
			pekerjaan: data.warga.pekerjaan ?? '',
			alamatKtp: data.warga.alamatKtp,
			noHp: data.warga.noHp ?? '',
			statusPernikahan: data.warga.statusPernikahan
		}
	);

	$effect(() => {
		if (form?.tab === 'edit' && form?.success) {
			mode = 'lihat';
		}
	});
</script>

<svelte:head>
	<title>{data.warga.namaLengkap} — Sistem RT</title>
</svelte:head>

<div class="space-y-4 px-4 py-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-900">{mode === 'lihat' ? 'Detail Warga' : 'Edit Warga'}</h1>
		<button
			type="button"
			onclick={() => (mode = mode === 'lihat' ? 'edit' : 'lihat')}
			class="text-sm text-brand-600"
		>
			{mode === 'lihat' ? 'Edit' : 'Batal'}
		</button>
	</div>

	{#if mode === 'lihat'}
		<div class="space-y-3 rounded-xl bg-white p-4 shadow-sm">
			<div>
				<p class="text-lg font-medium text-gray-900">
					{data.warga.namaLengkap}
					{#if data.warga.namaPanggilan}<span class="text-sm font-normal text-gray-400"
							>({data.warga.namaPanggilan})</span
						>{/if}
				</p>
				<p class="text-sm text-gray-400">{data.warga.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
			</div>

			<dl class="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
				<div>
					<dt class="text-gray-400">NIK</dt>
					<dd class="text-gray-800">{data.warga.nik}</dd>
				</div>
				<div>
					<dt class="text-gray-400">No KK</dt>
					<dd class="text-gray-800">{data.warga.noKk}</dd>
				</div>
				<div>
					<dt class="text-gray-400">Tanggal Lahir</dt>
					<dd class="text-gray-800">
						{new Date(data.warga.tanggalLahir).toLocaleDateString('id-ID', {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						})}
					</dd>
				</div>
				<div>
					<dt class="text-gray-400">Status Pernikahan</dt>
					<dd class="text-gray-800">{data.warga.statusPernikahan.replace('_', ' ')}</dd>
				</div>
				<div>
					<dt class="text-gray-400">Pekerjaan</dt>
					<dd class="text-gray-800">{data.warga.pekerjaan || '-'}</dd>
				</div>
				<div>
					<dt class="text-gray-400">No HP</dt>
					<dd class="text-gray-800">{data.warga.noHp || '-'}</dd>
				</div>
			</dl>

			<div>
				<dt class="text-sm text-gray-400">Alamat sesuai KTP/KK</dt>
				<dd class="text-sm text-gray-800">{data.warga.alamatKtp}</dd>
			</div>
		</div>

		<div class="rounded-xl bg-white p-4 shadow-sm">
			<h2 class="mb-2 text-sm font-semibold text-gray-700">Riwayat Hunian</h2>
			{#if data.riwayatHunian.length === 0}
				<p class="text-sm text-gray-400">Belum tercatat tinggal di rumah manapun.</p>
			{:else}
				<div class="space-y-2">
					{#each data.riwayatHunian as r (r.id)}
						<a href="/rumah/{r.rumahId}" class="block rounded-lg border border-gray-100 p-3 text-sm">
							<p class="text-gray-800">{r.alamatRumah}</p>
							<p class="mt-0.5 text-xs text-gray-400">
								{STATUS_PENGHUNI_LABEL[r.status]}{r.jangkaWaktuMenempati ? ` · ${r.jangkaWaktuMenempati}` : ''}
							</p>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<div class="rounded-xl bg-white p-4 shadow-sm">
			{#if !confirmHapus}
				<button type="button" onclick={() => (confirmHapus = true)} class="text-sm text-red-600">
					Hapus data warga ini
				</button>
			{:else}
				<p class="mb-2 text-sm text-gray-600">
					Yakin hapus <strong>{data.warga.namaLengkap}</strong>? Riwayat hunian ikut terhapus. Tindakan ini
					tidak bisa dibatalkan.
				</p>
				<div class="flex gap-2">
					<form method="POST" action="?/hapus">
						<button type="submit" class="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white"
							>Ya, Hapus</button
						>
					</form>
					<button
						type="button"
						onclick={() => (confirmHapus = false)}
						class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600"
					>
						Batal
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="rounded-xl bg-white p-4 shadow-sm"
		>
			<WargaForm values={editValues} errors={form?.errors} submitLabel="Simpan Perubahan" {loading} />
		</form>
	{/if}
</div>
