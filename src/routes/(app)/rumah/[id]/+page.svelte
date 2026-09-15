<script lang="ts">
	import { enhance } from '$app/forms';
	import RumahForm from '$lib/components/RumahForm.svelte';
	import { STATUS_PENGHUNI_LABEL, KEPEMILIKAN_LABEL } from '$lib/validation/rumah';

	let { data, form } = $props();

	let mode = $state<'lihat' | 'edit'>('lihat');
	let showTambahPenghuni = $state(false);
	let loadingAction = $state<string | null>(null);
	let confirmHapus = $state(false);

	const editValues = $derived(
		form?.values ?? {
			alamat: data.rumah.alamat,
			blokRt: data.rumah.blokRt ?? '',
			kepemilikan: data.rumah.kepemilikan
		}
	);

	$effect(() => {
		if (form?.tab === 'edit' && form?.success) mode = 'lihat';
		if (form?.tab === 'penghuni' && form?.success) showTambahPenghuni = false;
	});
</script>

<svelte:head>
	<title>{data.rumah.alamat} — Sistem RT</title>
</svelte:head>

<div class="space-y-4 px-4 py-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-900">{mode === 'lihat' ? 'Detail Rumah' : 'Edit Rumah'}</h1>
		<button type="button" onclick={() => (mode = mode === 'lihat' ? 'edit' : 'lihat')} class="text-sm text-brand-600">
			{mode === 'lihat' ? 'Edit' : 'Batal'}
		</button>
	</div>

	{#if mode === 'lihat'}
		<div class="rounded-xl bg-white p-4 shadow-sm">
			<p class="text-base font-medium text-gray-900">{data.rumah.alamat}</p>
			<p class="mt-1 text-sm text-gray-400">
				{KEPEMILIKAN_LABEL[data.rumah.kepemilikan]}{#if data.rumah.blokRt}· {data.rumah.blokRt}{/if}
			</p>
		</div>

		<!-- Daftar Penghuni -->
		<div class="rounded-xl bg-white p-4 shadow-sm">
			<div class="mb-2 flex items-center justify-between">
				<h2 class="text-sm font-semibold text-gray-700">Penghuni</h2>
				<button type="button" onclick={() => (showTambahPenghuni = !showTambahPenghuni)} class="text-sm text-brand-600">
					{showTambahPenghuni ? 'Tutup' : '+ Tambah'}
				</button>
			</div>

			{#if form?.message}
				<p class="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{form.message}</p>
			{/if}

			{#if showTambahPenghuni}
				<form
					method="POST"
					action="?/tambahPenghuni"
					use:enhance={() => {
						loadingAction = 'tambah';
						return async ({ update }) => {
							await update();
							loadingAction = null;
						};
					}}
					class="mb-3 space-y-2 rounded-lg border border-gray-100 p-3"
				>
					<select name="wargaId" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
						<option value="">— Pilih warga —</option>
						{#each data.semuaWarga as w (w.id)}
							<option value={w.id}>{w.namaLengkap}</option>
						{/each}
					</select>
					<div class="grid grid-cols-2 gap-2">
						<input
							name="tanggalMulaiMenempati"
							type="date"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
						<select name="status" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
							{#each Object.entries(STATUS_PENGHUNI_LABEL) as [value, label] (value)}
								<option {value} selected={value === 'aktif'}>{label}</option>
							{/each}
						</select>
					</div>
					<input
						name="jangkaWaktuMenempati"
						type="text"
						placeholder="Jangka waktu (misal: sejak 2019)"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
					/>
					<button
						type="submit"
						disabled={loadingAction === 'tambah'}
						class="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white disabled:opacity-60"
					>
						{loadingAction === 'tambah' ? 'Menyimpan...' : 'Tambah Penghuni'}
					</button>
				</form>
			{/if}

			<div class="space-y-2">
				{#each data.daftarPenghuni as p (p.id)}
					<div class="rounded-lg border border-gray-100 p-3">
						<div class="flex items-center justify-between">
							<a href="/warga/{p.wargaId}" class="text-sm font-medium text-gray-800">{p.namaLengkap}</a>
							{#if p.jangkaWaktuMenempati}
								<span class="text-xs text-gray-400">{p.jangkaWaktuMenempati}</span>
							{/if}
						</div>
						<div class="mt-2 flex flex-wrap items-center gap-2">
							<form
								method="POST"
								action="?/ubahStatusPenghuni"
								use:enhance={() => {
									loadingAction = `status-${p.id}`;
									return async ({ update }) => {
										await update();
										loadingAction = null;
									};
								}}
							>
								<input type="hidden" name="penghuniId" value={p.id} />
								<select
									name="status"
									value={p.status}
									disabled={loadingAction === `status-${p.id}`}
									onchange={(e) => e.currentTarget.form?.requestSubmit()}
									class="rounded-lg border border-gray-300 px-2 py-1 text-xs"
								>
									{#each Object.entries(STATUS_PENGHUNI_LABEL) as [value, label] (value)}
										<option {value}>{label}</option>
									{/each}
								</select>
							</form>

							<form
								method="POST"
								action="?/hapusPenghuni"
								use:enhance={() => {
									loadingAction = `hapus-${p.id}`;
									return async ({ update }) => {
										await update();
										loadingAction = null;
									};
								}}
							>
								<input type="hidden" name="penghuniId" value={p.id} />
								<button
									type="submit"
									disabled={loadingAction === `hapus-${p.id}`}
									class="rounded-lg border border-gray-300 px-2 py-1 text-xs text-red-600 disabled:opacity-60"
								>
									Hapus dari rumah ini
								</button>
							</form>
						</div>
					</div>
				{:else}
					<p class="text-sm text-gray-400">Belum ada penghuni tercatat.</p>
				{/each}
			</div>
		</div>

		<div class="rounded-xl bg-white p-4 shadow-sm">
			{#if !confirmHapus}
				<button type="button" onclick={() => (confirmHapus = true)} class="text-sm text-red-600">
					Hapus data rumah ini
				</button>
			{:else}
				<p class="mb-2 text-sm text-gray-600">
					Yakin hapus rumah ini? Data penghuni yang tercatat di sini ikut terhapus. Tindakan ini tidak bisa
					dibatalkan.
				</p>
				<div class="flex gap-2">
					<form method="POST" action="?/hapusRumah">
						<button type="submit" class="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white">Ya, Hapus</button>
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
				loadingAction = 'edit';
				return async ({ update }) => {
					await update();
					loadingAction = null;
				};
			}}
			class="rounded-xl bg-white p-4 shadow-sm"
		>
			<RumahForm values={editValues} errors={form?.errors} submitLabel="Simpan Perubahan" loading={loadingAction === 'edit'} />
		</form>
	{/if}
</div>
