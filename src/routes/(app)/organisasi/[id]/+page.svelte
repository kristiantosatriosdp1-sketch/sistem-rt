<script lang="ts">
	import { enhance } from '$app/forms';
	import OrganisasiForm from '$lib/components/OrganisasiForm.svelte';
	import {
		TIPE_ORGANISASI_LABEL,
		TIPE_KEANGGOTAAN_LABEL,
		JENIS_ORGANISASI_LABEL,
		STATUS_ANGGOTA_LABEL
	} from '$lib/validation/organisasi';

	let { data, form } = $props();

	let mode = $state<'lihat' | 'edit'>('lihat');
	let showTambahAnggota = $state(false);
	let loadingAction = $state<string | null>(null);
	let confirmHapus = $state(false);
	let editJabatanId = $state<string | null>(null);

	const isPerOrang = $derived(data.organisasi.tipeKeanggotaan === 'per_orang');

	const editValues = $derived(
		form?.values ?? {
			nama: data.organisasi.nama,
			tipe: data.organisasi.tipe,
			tipeKeanggotaan: data.organisasi.tipeKeanggotaan,
			jenis: data.organisasi.jenis,
			deskripsi: data.organisasi.deskripsi ?? ''
		}
	);

	$effect(() => {
		if (form?.tab === 'edit' && form?.success) mode = 'lihat';
		if (form?.tab === 'anggota' && form?.success) {
			showTambahAnggota = false;
			editJabatanId = null;
		}
	});
</script>

<svelte:head>
	<title>{data.organisasi.nama} — Sistem RT</title>
</svelte:head>

<div class="space-y-4 px-4 py-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-900">{mode === 'lihat' ? 'Detail Organisasi' : 'Edit Organisasi'}</h1>
		<button type="button" onclick={() => (mode = mode === 'lihat' ? 'edit' : 'lihat')} class="text-sm text-brand-600">
			{mode === 'lihat' ? 'Edit' : 'Batal'}
		</button>
	</div>

	{#if mode === 'lihat'}
		<div class="rounded-xl bg-white p-4 shadow-sm">
			<div class="flex items-center gap-2">
				<p class="text-base font-medium text-gray-900">{data.organisasi.nama}</p>
				<span
					class="rounded-full px-2 py-0.5 text-xs {data.organisasi.jenis === 'bisnis'
						? 'bg-amber-100 text-amber-700'
						: 'bg-blue-100 text-blue-700'}"
				>
					{JENIS_ORGANISASI_LABEL[data.organisasi.jenis]}
				</span>
			</div>
			<p class="mt-1 text-sm text-gray-400">
				{TIPE_ORGANISASI_LABEL[data.organisasi.tipe]} · Keanggotaan {TIPE_KEANGGOTAAN_LABEL[
					data.organisasi.tipeKeanggotaan
				]}
			</p>
			{#if data.organisasi.deskripsi}
				<p class="mt-2 text-sm text-gray-600">{data.organisasi.deskripsi}</p>
			{/if}
		</div>

		<!-- Daftar Anggota -->
		<div class="rounded-xl bg-white p-4 shadow-sm">
			<div class="mb-2 flex items-center justify-between">
				<h2 class="text-sm font-semibold text-gray-700">
					Anggota ({isPerOrang ? 'per orang' : 'per rumah/KK'})
				</h2>
				<button type="button" onclick={() => (showTambahAnggota = !showTambahAnggota)} class="text-sm text-brand-600">
					{showTambahAnggota ? 'Tutup' : '+ Tambah'}
				</button>
			</div>

			{#if form?.message}
				<p class="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{form.message}</p>
			{/if}

			{#if showTambahAnggota}
				<form
					method="POST"
					action="?/tambahAnggota"
					use:enhance={() => {
						loadingAction = 'tambah';
						return async ({ update }) => {
							await update();
							loadingAction = null;
						};
					}}
					class="mb-3 space-y-2 rounded-lg border border-gray-100 p-3"
				>
					<select name="targetId" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
						<option value="">{isPerOrang ? '— Pilih warga —' : '— Pilih rumah —'}</option>
						{#if isPerOrang}
							{#each data.semuaWarga as w (w.id)}
								<option value={w.id}>{w.namaLengkap}</option>
							{/each}
						{:else}
							{#each data.semuaRumah as r (r.id)}
								<option value={r.id}>{r.alamat}</option>
							{/each}
						{/if}
					</select>
					<input
						name="jabatan"
						type="text"
						placeholder="Jabatan (opsional, misal: Ketua)"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
					/>
					<button
						type="submit"
						disabled={loadingAction === 'tambah'}
						class="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white disabled:opacity-60"
					>
						{loadingAction === 'tambah' ? 'Menyimpan...' : 'Tambah Anggota'}
					</button>
				</form>
			{/if}

			<div class="space-y-2">
				{#each data.daftarAnggota as a (a.id)}
					<div class="rounded-lg border border-gray-100 p-3">
						<div class="flex items-center justify-between">
							{#if a.wargaId}
								<a href="/warga/{a.wargaId}" class="text-sm font-medium text-gray-800">{a.namaWarga}</a>
							{:else if a.rumahId}
								<a href="/rumah/{a.rumahId}" class="text-sm font-medium text-gray-800">{a.alamatRumah}</a>
							{/if}
						</div>

						{#if editJabatanId === a.id}
							<form
								method="POST"
								action="?/ubahJabatan"
								use:enhance={() => {
									loadingAction = `jabatan-${a.id}`;
									return async ({ update }) => {
										await update();
										loadingAction = null;
									};
								}}
								class="mt-2 flex gap-2"
							>
								<input type="hidden" name="anggotaId" value={a.id} />
								<input
									name="jabatan"
									type="text"
									value={a.jabatan ?? ''}
									placeholder="Jabatan"
									class="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs"
								/>
								<button
									type="submit"
									disabled={loadingAction === `jabatan-${a.id}`}
									class="rounded-lg bg-brand-600 px-2 py-1 text-xs text-white"
								>
									Simpan
								</button>
							</form>
						{:else}
							<button
								type="button"
								onclick={() => (editJabatanId = a.id)}
								class="mt-0.5 text-xs text-gray-400 underline decoration-dotted"
							>
								{a.jabatan || 'Anggota biasa'} · ubah
							</button>
						{/if}

						<div class="mt-2 flex flex-wrap items-center gap-2">
							<form
								method="POST"
								action="?/ubahStatusAnggota"
								use:enhance={() => {
									loadingAction = `status-${a.id}`;
									return async ({ update }) => {
										await update();
										loadingAction = null;
									};
								}}
							>
								<input type="hidden" name="anggotaId" value={a.id} />
								<select
									name="status"
									value={a.status}
									disabled={loadingAction === `status-${a.id}`}
									onchange={(e) => e.currentTarget.form?.requestSubmit()}
									class="rounded-lg border border-gray-300 px-2 py-1 text-xs"
								>
									{#each Object.entries(STATUS_ANGGOTA_LABEL) as [value, label] (value)}
										<option {value}>{label}</option>
									{/each}
								</select>
							</form>

							<form
								method="POST"
								action="?/hapusAnggota"
								use:enhance={() => {
									loadingAction = `hapus-${a.id}`;
									return async ({ update }) => {
										await update();
										loadingAction = null;
									};
								}}
							>
								<input type="hidden" name="anggotaId" value={a.id} />
								<button
									type="submit"
									disabled={loadingAction === `hapus-${a.id}`}
									class="rounded-lg border border-gray-300 px-2 py-1 text-xs text-red-600 disabled:opacity-60"
								>
									Keluarkan
								</button>
							</form>
						</div>
					</div>
				{:else}
					<p class="text-sm text-gray-400">Belum ada anggota.</p>
				{/each}
			</div>
		</div>

		<div class="rounded-xl bg-white p-4 shadow-sm">
			{#if !confirmHapus}
				<button type="button" onclick={() => (confirmHapus = true)} class="text-sm text-red-600">
					Hapus organisasi ini
				</button>
			{:else}
				<p class="mb-2 text-sm text-gray-600">
					Yakin hapus <strong>{data.organisasi.nama}</strong>? Semua data anggota ikut terhapus. Tindakan ini
					tidak bisa dibatalkan.
				</p>
				<div class="flex gap-2">
					<form method="POST" action="?/hapusOrganisasi">
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
			<OrganisasiForm
				values={editValues}
				errors={form?.errors}
				submitLabel="Simpan Perubahan"
				loading={loadingAction === 'edit'}
				kunciTipeKeanggotaan={true}
			/>
		</form>
	{/if}
</div>
