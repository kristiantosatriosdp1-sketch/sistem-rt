<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatRupiah } from '$lib/format';

	let { data, form } = $props();

	let showFormTambah = $state(false);
	let editingId = $state<string | null>(null);
	let search = $state('');
	let loadingAction = $state<string | null>(null);

	const asetTersaring = $derived(
		data.daftarAset.filter((a) => {
			if (!search.trim()) return true;
			const q = search.toLowerCase();
			return (
				a.nama.toLowerCase().includes(q) ||
				(a.deskripsi && a.deskripsi.toLowerCase().includes(q)) ||
				(a.namaOrganisasi && a.namaOrganisasi.toLowerCase().includes(q)) ||
				(a.kondisi && a.kondisi.toLowerCase().includes(q))
			);
		})
	);

	const totalNilaiKeseluruhan = $derived(
		data.daftarAset.reduce((acc, curr) => acc + (curr.nilai ? Number(curr.nilai) : 0), 0)
	);
</script>

<svelte:head>
	<title>Inventaris & Aset RT - Sistem RT</title>
</svelte:head>

<header class="bg-brand-600 px-4 pt-6 pb-8 text-white">
	<div class="flex items-center justify-between">
		<div>
			<a href="/informasi" class="inline-flex items-center text-xs text-brand-100 hover:text-white">
				← Kembali ke Pusat Info
			</a>
			<h1 class="mt-1 text-xl font-semibold">📦 Inventaris & Aset RT</h1>
		</div>
		<button
			onclick={() => {
				showFormTambah = !showFormTambah;
				editingId = null;
			}}
			class="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-brand-800 shadow-md transition hover:bg-brand-50 active:scale-95"
		>
			{showFormTambah ? '✕ Tutup' : '+ Tambah Aset'}
		</button>
	</div>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Summary Card -->
	<section class="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm">
		<div>
			<p class="text-xs text-gray-400">Total Item Aset</p>
			<p class="mt-1 text-lg font-semibold text-gray-900">{data.daftarAset.length} barang</p>
		</div>
		<div class="border-l border-gray-100 pl-3">
			<p class="text-xs text-gray-400">Total Estimasi Nilai</p>
			<p class="mt-1 text-lg font-semibold text-purple-700">{formatRupiah(totalNilaiKeseluruhan)}</p>
		</div>
	</section>

	<!-- Form Tambah Aset -->
	{#if showFormTambah}
		<section class="rounded-2xl bg-white p-4 shadow-sm border border-brand-100">
			<h2 class="text-sm font-semibold text-gray-900 mb-3">Registrasi Aset Baru</h2>
			<form
				method="POST"
				action="?/tambah"
				use:enhance={() => {
					loadingAction = 'tambah';
					return async ({ result, update }) => {
						loadingAction = null;
						if (result.type === 'success') {
							showFormTambah = false;
						}
						await update();
					};
				}}
				class="space-y-3"
			>
				<div>
					<label for="aset-org" class="text-xs font-medium text-gray-700">Organisasi Pemilik *</label>
					<select
						id="aset-org"
						name="organisasiId"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					>
						<option value="">-- Pilih Organisasi --</option>
						{#each data.semuaOrganisasi as org (org.id)}
							<option value={org.id}>{org.nama}</option>
						{/each}
					</select>
					{#if form?.action === 'tambah' && form?.errors?.organisasiId}
						<p class="mt-0.5 text-xs text-red-600">{form.errors.organisasiId}</p>
					{/if}
				</div>

				<div>
					<label for="aset-nama" class="text-xs font-medium text-gray-700">Nama Barang / Aset *</label>
					<input
						id="aset-nama"
						name="nama"
						type="text"
						placeholder="Misal: Tenda Terop 4x6 Meter, Sound System Portable"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					/>
					{#if form?.action === 'tambah' && form?.errors?.nama}
						<p class="mt-0.5 text-xs text-red-600">{form.errors.nama}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="aset-nilai" class="text-xs font-medium text-gray-700">Estimasi Nilai (Rp)</label>
						<input
							id="aset-nilai"
							name="nilai"
							type="number"
							min="0"
							step="1000"
							placeholder="1500000"
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="aset-kondisi" class="text-xs font-medium text-gray-700">Kondisi</label>
						<select
							id="aset-kondisi"
							name="kondisi"
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						>
							<option value="Baik">Baik / Siap Pakai</option>
							<option value="Rusak Ringan">Rusak Ringan</option>
							<option value="Rusak Berat">Rusak Berat</option>
							<option value="Dalam Perbaikan">Dalam Perbaikan</option>
						</select>
					</div>
				</div>

				<div>
					<label for="aset-desc" class="text-xs font-medium text-gray-700">Deskripsi / Lokasi Penyimpanan</label>
					<textarea
						id="aset-desc"
						name="deskripsi"
						rows="2"
						placeholder="Disimpan di gudang RT, nomor seri/kelengkapan..."
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					></textarea>
				</div>

				<button
					type="submit"
					disabled={loadingAction === 'tambah'}
					class="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
				>
					{loadingAction === 'tambah' ? 'Menyimpan...' : 'Simpan Aset'}
				</button>
			</form>
		</section>
	{/if}

	<!-- Pencarian -->
	<div>
		<input
			type="text"
			placeholder="Cari aset, nama barang, kondisi..."
			bind:value={search}
			class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
		/>
	</div>

	<!-- List Aset -->
	{#if asetTersaring.length === 0}
		<div class="rounded-2xl bg-white p-8 text-center text-gray-400 shadow-sm">
			<p class="text-3xl">📦</p>
			<p class="mt-2 text-sm font-medium text-gray-600">Tidak ada aset ditemukan</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each asetTersaring as a (a.id)}
				<article class="relative rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
					{#if editingId === a.id}
						<!-- Form Edit Inline -->
						<h3 class="text-sm font-semibold text-gray-900 mb-2">Edit Aset</h3>
						<form
							method="POST"
							action="?/edit"
							use:enhance={() => {
								loadingAction = `edit-${a.id}`;
								return async ({ result, update }) => {
									loadingAction = null;
									if (result.type === 'success') {
										editingId = null;
									}
									await update();
								};
							}}
							class="space-y-2.5"
						>
							<input type="hidden" name="id" value={a.id} />
							<div>
								<label for="edit-org-a-{a.id}" class="text-xs font-medium text-gray-700">Organisasi</label>
								<select
									id="edit-org-a-{a.id}"
									name="organisasiId"
									required
									value={a.organisasiId}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>
									{#each data.semuaOrganisasi as org (org.id)}
										<option value={org.id}>{org.nama}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="edit-nama-a-{a.id}" class="text-xs font-medium text-gray-700">Nama Barang</label>
								<input
									id="edit-nama-a-{a.id}"
									name="nama"
									type="text"
									required
									value={a.nama}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								/>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div>
									<label for="edit-nilai-a-{a.id}" class="text-xs font-medium text-gray-700">Nilai (Rp)</label>
									<input
										id="edit-nilai-a-{a.id}"
										name="nilai"
										type="number"
										value={a.nilai ? Math.round(Number(a.nilai)) : ''}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
								<div>
									<label for="edit-kondisi-a-{a.id}" class="text-xs font-medium text-gray-700">Kondisi</label>
									<select
										id="edit-kondisi-a-{a.id}"
										name="kondisi"
										value={a.kondisi ?? 'Baik'}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									>
										<option value="Baik">Baik</option>
										<option value="Rusak Ringan">Rusak Ringan</option>
										<option value="Rusak Berat">Rusak Berat</option>
										<option value="Dalam Perbaikan">Dalam Perbaikan</option>
									</select>
								</div>
							</div>
							<div>
								<label for="edit-desc-a-{a.id}" class="text-xs font-medium text-gray-700">Deskripsi</label>
								<textarea
									id="edit-desc-a-{a.id}"
									name="deskripsi"
									rows="2"
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>{a.deskripsi ?? ''}</textarea>
							</div>
							<div class="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={loadingAction === `edit-${a.id}`}
									class="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
								>
									Simpan Perubahan
								</button>
								<button
									type="button"
									onclick={() => (editingId = null)}
									class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700"
								>
									Batal
								</button>
							</div>
						</form>
					{:else}
						<div class="flex items-start justify-between gap-2">
							<div>
								<div class="flex items-center gap-1.5">
									<span
										class="inline-block rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700"
									>
										🏛️ {a.namaOrganisasi ?? 'RT'}
									</span>
									{#if a.kondisi}
										<span
											class="rounded-md px-1.5 py-0.5 text-[10px] font-medium {a.kondisi === 'Baik'
												? 'bg-green-50 text-green-700'
												: a.kondisi === 'Rusak Ringan'
													? 'bg-amber-50 text-amber-700'
													: 'bg-red-50 text-red-700'}"
										>
											{a.kondisi}
										</span>
									{/if}
								</div>
								<h3 class="mt-1 text-base font-semibold text-gray-900">{a.nama}</h3>
							</div>

							<div class="flex items-center gap-1.5">
								<button
									onclick={() => (editingId = a.id)}
									class="rounded-lg p-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
									title="Edit"
								>
									✏️
								</button>
								<form
									method="POST"
									action="?/hapus"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
										};
									}}
								>
									<input type="hidden" name="id" value={a.id} />
									<button
										type="submit"
										onclick={(e) => {
											if (!confirm(`Hapus aset "${a.nama}"?`)) e.preventDefault();
										}}
										class="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
										title="Hapus"
									>
										🗑️
									</button>
								</form>
							</div>
						</div>

						<div class="mt-2 flex items-center justify-between text-xs">
							<span class="text-gray-500">Estimasi Nilai:</span>
							<strong class="font-semibold text-gray-900">
								{a.nilai ? formatRupiah(Number(a.nilai)) : 'Tidak dicatat'}
							</strong>
						</div>

						{#if a.deskripsi}
							<p class="mt-2.5 rounded-xl bg-gray-50/80 p-2.5 text-xs leading-relaxed text-gray-600">
								{a.deskripsi}
							</p>
						{/if}
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</main>
