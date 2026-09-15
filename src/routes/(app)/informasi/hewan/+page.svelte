<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let showFormTambah = $state(false);
	let editingId = $state<string | null>(null);
	let search = $state('');
	let loadingAction = $state<string | null>(null);

	const hewanTersaring = $derived(
		data.daftarHewan.filter((h) => {
			if (!search.trim()) return true;
			const q = search.toLowerCase();
			return (
				(h.nama && h.nama.toLowerCase().includes(q)) ||
				(h.jenis && h.jenis.toLowerCase().includes(q)) ||
				(h.keterangan && h.keterangan.toLowerCase().includes(q)) ||
				(h.alamatRumah && h.alamatRumah.toLowerCase().includes(q))
			);
		})
	);
</script>

<svelte:head>
	<title>Data Hewan Peliharaan Warga - Sistem RT</title>
</svelte:head>

<header class="bg-brand-600 px-4 pt-6 pb-8 text-white">
	<div class="flex items-center justify-between">
		<div>
			<a href="/informasi" class="inline-flex items-center text-xs text-brand-100 hover:text-white">
				← Kembali ke Pusat Info
			</a>
			<h1 class="mt-1 text-xl font-semibold">🐾 Hewan Peliharaan</h1>
		</div>
		<button
			onclick={() => {
				showFormTambah = !showFormTambah;
				editingId = null;
			}}
			class="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-brand-800 shadow-md transition hover:bg-brand-50 active:scale-95"
		>
			{showFormTambah ? '✕ Tutup' : '+ Catat Hewan'}
		</button>
	</div>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Form Tambah Hewan -->
	{#if showFormTambah}
		<section class="rounded-2xl bg-white p-4 shadow-sm border border-brand-100">
			<h2 class="text-sm font-semibold text-gray-900 mb-3">Catat Hewan Peliharaan Baru</h2>
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
					<label for="hewan-rumah" class="text-xs font-medium text-gray-700">Rumah Pemilik *</label>
					<select
						id="hewan-rumah"
						name="rumahId"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					>
						<option value="">-- Pilih Rumah --</option>
						{#each data.semuaRumah as r (r.id)}
							<option value={r.id}>
								{r.alamat} {r.blokRt ? `(Blok ${r.blokRt})` : ''}
							</option>
						{/each}
					</select>
					{#if form?.action === 'tambah' && form?.errors?.rumahId}
						<p class="mt-0.5 text-xs text-red-600">{form.errors.rumahId}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="hewan-jenis" class="text-xs font-medium text-gray-700">Jenis Hewan *</label>
						<input
							id="hewan-jenis"
							name="jenis"
							type="text"
							placeholder="Kucing, Anjing, Burung..."
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="hewan-nama" class="text-xs font-medium text-gray-700">Nama Panggilan Hewan</label>
						<input
							id="hewan-nama"
							name="nama"
							type="text"
							placeholder="Mimi, Brownie..."
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="hewan-ket" class="text-xs font-medium text-gray-700">Keterangan / Vaksinasi</label>
					<textarea
						id="hewan-ket"
						name="keterangan"
						rows="2"
						placeholder="Warna bulu, ciri khusus, status vaksin rabies/steril..."
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					></textarea>
				</div>

				<button
					type="submit"
					disabled={loadingAction === 'tambah'}
					class="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
				>
					{loadingAction === 'tambah' ? 'Menyimpan...' : 'Simpan Data Hewan'}
				</button>
			</form>
		</section>
	{/if}

	<!-- Search bar -->
	<div>
		<input
			type="text"
			placeholder="Cari jenis hewan, nama, alamat rumah..."
			bind:value={search}
			class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
		/>
	</div>

	<!-- List Hewan -->
	{#if hewanTersaring.length === 0}
		<div class="rounded-2xl bg-white p-8 text-center text-gray-400 shadow-sm">
			<p class="text-3xl">🐾</p>
			<p class="mt-2 text-sm font-medium text-gray-600">Belum ada data hewan peliharaan terdaftar</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each hewanTersaring as h (h.id)}
				<article class="relative rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
					{#if editingId === h.id}
						<!-- Form Edit Inline -->
						<h3 class="text-sm font-semibold text-gray-900 mb-2">Edit Data Hewan</h3>
						<form
							method="POST"
							action="?/edit"
							use:enhance={() => {
								loadingAction = `edit-${h.id}`;
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
							<input type="hidden" name="id" value={h.id} />
							<div>
								<label for="edit-rumah-h-{h.id}" class="text-xs font-medium text-gray-700">Rumah</label>
								<select
									id="edit-rumah-h-{h.id}"
									name="rumahId"
									required
									value={h.rumahId}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>
									{#each data.semuaRumah as r (r.id)}
										<option value={r.id}>
											{r.alamat} {r.blokRt ? `(Blok ${r.blokRt})` : ''}
										</option>
									{/each}
								</select>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div>
									<label for="edit-jenis-h-{h.id}" class="text-xs font-medium text-gray-700">Jenis</label>
									<input
										id="edit-jenis-h-{h.id}"
										name="jenis"
										type="text"
										value={h.jenis ?? ''}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
								<div>
									<label for="edit-nama-h-{h.id}" class="text-xs font-medium text-gray-700">Nama</label>
									<input
										id="edit-nama-h-{h.id}"
										name="nama"
										type="text"
										value={h.nama ?? ''}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
							</div>
							<div>
								<label for="edit-ket-h-{h.id}" class="text-xs font-medium text-gray-700">Keterangan</label>
								<textarea
									id="edit-ket-h-{h.id}"
									name="keterangan"
									rows="2"
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>{h.keterangan ?? ''}</textarea>
							</div>
							<div class="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={loadingAction === `edit-${h.id}`}
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
										class="inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800"
									>
										🐾 {h.jenis || 'Hewan Peliharaan'}
									</span>
									{#if h.alamatRumah}
										<span class="text-[11px] text-gray-500">
											🏠 {h.alamatRumah} {h.blokRt ? `(Blok ${h.blokRt})` : ''}
										</span>
									{/if}
								</div>
								<h3 class="mt-1 text-base font-semibold text-gray-900">
									{h.nama ? `"${h.nama}"` : `(${h.jenis || 'Tanpa Nama'})`}
								</h3>
							</div>

							<div class="flex items-center gap-1.5">
								<button
									onclick={() => (editingId = h.id)}
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
									<input type="hidden" name="id" value={h.id} />
									<button
										type="submit"
										onclick={(e) => {
											if (!confirm(`Hapus data hewan "${h.nama || h.jenis}"?`)) e.preventDefault();
										}}
										class="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
										title="Hapus"
									>
										🗑️
									</button>
								</form>
							</div>
						</div>

						{#if h.keterangan}
							<p class="mt-2 text-xs leading-relaxed text-gray-600">
								{h.keterangan}
							</p>
						{/if}
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</main>
