<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let showFormTambah = $state(false);
	let editingId = $state<string | null>(null);
	let search = $state('');
	let loadingAction = $state<string | null>(null);

	const usahaTersaring = $derived(
		data.daftarUsaha.filter((u) => {
			if (!search.trim()) return true;
			const q = search.toLowerCase();
			return (
				u.namaUsaha.toLowerCase().includes(q) ||
				(u.kategori && u.kategori.toLowerCase().includes(q)) ||
				(u.deskripsi && u.deskripsi.toLowerCase().includes(q)) ||
				(u.alamatRumah && u.alamatRumah.toLowerCase().includes(q))
			);
		})
	);

	function formatWaLink(nomor: string | null) {
		if (!nomor) return null;
		let clean = nomor.replace(/[^0-9]/g, '');
		if (clean.startsWith('0')) clean = '62' + clean.slice(1);
		return `https://wa.me/${clean}`;
	}
</script>

<svelte:head>
	<title>Direktori Usaha & UMKM Warga - Sistem RT</title>
</svelte:head>

<header class="bg-brand-600 px-4 pt-6 pb-8 text-white">
	<div class="flex items-center justify-between">
		<div>
			<a href="/informasi" class="inline-flex items-center text-xs text-brand-100 hover:text-white">
				← Kembali ke Pusat Info
			</a>
			<h1 class="mt-1 text-xl font-semibold">🏪 Usaha & Jasa Warga</h1>
		</div>
		<button
			onclick={() => {
				showFormTambah = !showFormTambah;
				editingId = null;
			}}
			class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-brand-700 shadow-sm transition active:scale-95"
		>
			{showFormTambah ? '✕ Tutup' : '+ Daftarkan Usaha'}
		</button>
	</div>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Form Tambah Usaha -->
	{#if showFormTambah}
		<section class="rounded-2xl bg-white p-4 shadow-sm border border-brand-100">
			<h2 class="text-sm font-semibold text-gray-900 mb-3">Daftarkan Usaha / Layanan Warga</h2>
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
					<label for="usaha-rumah" class="text-xs font-medium text-gray-700">Rumah / Alamat Domisili *</label>
					<select
						id="usaha-rumah"
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

				<div>
					<label for="usaha-nama" class="text-xs font-medium text-gray-700">Nama Usaha / Toko / Jasa *</label>
					<input
						id="usaha-nama"
						name="namaUsaha"
						type="text"
						placeholder="Misal: Warung Kelontong Berkah, Servis AC Pak Budi"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					/>
					{#if form?.action === 'tambah' && form?.errors?.namaUsaha}
						<p class="mt-0.5 text-xs text-red-600">{form.errors.namaUsaha}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="usaha-kategori" class="text-xs font-medium text-gray-700">Kategori</label>
						<input
							id="usaha-kategori"
							name="kategori"
							type="text"
							placeholder="Kuliner, Jasa, Sembako..."
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="usaha-kontak" class="text-xs font-medium text-gray-700">No. WhatsApp / HP</label>
						<input
							id="usaha-kontak"
							name="kontak"
							type="text"
							placeholder="08123456789"
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="usaha-desc" class="text-xs font-medium text-gray-700">Deskripsi Produk / Layanan</label>
					<textarea
						id="usaha-desc"
						name="deskripsi"
						rows="2"
						placeholder="Menu yang dijual, jam buka, layanan antar gratis untuk tetangga RT..."
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					></textarea>
				</div>

				<button
					type="submit"
					disabled={loadingAction === 'tambah'}
					class="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
				>
					{loadingAction === 'tambah' ? 'Menyimpan...' : 'Simpan Usaha'}
				</button>
			</form>
		</section>
	{/if}

	<!-- Search bar -->
	<div>
		<input
			type="text"
			placeholder="Cari warung, makanan, jasa servis..."
			bind:value={search}
			class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
		/>
	</div>

	<!-- List Usaha Warga -->
	{#if usahaTersaring.length === 0}
		<div class="rounded-2xl bg-white p-8 text-center text-gray-400 shadow-sm">
			<p class="text-3xl">🏪</p>
			<p class="mt-2 text-sm font-medium text-gray-600">Belum ada usaha warga terdaftar</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each usahaTersaring as u (u.id)}
				<article class="relative rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
					{#if editingId === u.id}
						<!-- Form Edit Inline -->
						<h3 class="text-sm font-semibold text-gray-900 mb-2">Edit Usaha</h3>
						<form
							method="POST"
							action="?/edit"
							use:enhance={() => {
								loadingAction = `edit-${u.id}`;
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
							<input type="hidden" name="id" value={u.id} />
							<div>
								<label for="edit-rumah-u-{u.id}" class="text-xs font-medium text-gray-700">Rumah</label>
								<select
									id="edit-rumah-u-{u.id}"
									name="rumahId"
									required
									value={u.rumahId}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>
									{#each data.semuaRumah as r (r.id)}
										<option value={r.id}>
											{r.alamat} {r.blokRt ? `(Blok ${r.blokRt})` : ''}
										</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="edit-nama-u-{u.id}" class="text-xs font-medium text-gray-700">Nama Usaha</label>
								<input
									id="edit-nama-u-{u.id}"
									name="namaUsaha"
									type="text"
									required
									value={u.namaUsaha}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								/>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div>
									<label for="edit-kat-u-{u.id}" class="text-xs font-medium text-gray-700">Kategori</label>
									<input
										id="edit-kat-u-{u.id}"
										name="kategori"
										type="text"
										value={u.kategori ?? ''}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
								<div>
									<label for="edit-kontak-u-{u.id}" class="text-xs font-medium text-gray-700">No. Kontak</label>
									<input
										id="edit-kontak-u-{u.id}"
										name="kontak"
										type="text"
										value={u.kontak ?? ''}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
							</div>
							<div>
								<label for="edit-desc-u-{u.id}" class="text-xs font-medium text-gray-700">Deskripsi</label>
								<textarea
									id="edit-desc-u-{u.id}"
									name="deskripsi"
									rows="2"
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>{u.deskripsi ?? ''}</textarea>
							</div>
							<div class="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={loadingAction === `edit-${u.id}`}
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
									{#if u.kategori}
										<span
											class="inline-block rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700"
										>
											🏷️ {u.kategori}
										</span>
									{/if}
									{#if u.alamatRumah}
										<span class="text-[11px] text-gray-500">
											🏠 {u.alamatRumah} {u.blokRt ? `(Blok ${u.blokRt})` : ''}
										</span>
									{/if}
								</div>
								<h3 class="mt-1 text-base font-semibold text-gray-900">{u.namaUsaha}</h3>
							</div>

							<div class="flex items-center gap-1.5">
								<button
									onclick={() => (editingId = u.id)}
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
									<input type="hidden" name="id" value={u.id} />
									<button
										type="submit"
										onclick={(e) => {
											if (!confirm(`Hapus data usaha "${u.namaUsaha}"?`)) e.preventDefault();
										}}
										class="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
										title="Hapus"
									>
										🗑️
									</button>
								</form>
							</div>
						</div>

						{#if u.deskripsi}
							<p class="mt-2 text-xs leading-relaxed text-gray-600">
								{u.deskripsi}
							</p>
						{/if}

						{#if u.kontak}
							{@const waLink = formatWaLink(u.kontak)}
							<div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
								<span class="text-xs text-gray-500">📞 {u.kontak}</span>
								{#if waLink}
									<a
										href={waLink}
										target="_blank"
										rel="noreferrer"
										class="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700"
									>
										💬 Hubungi via WhatsApp
									</a>
								{/if}
							</div>
						{/if}
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</main>
