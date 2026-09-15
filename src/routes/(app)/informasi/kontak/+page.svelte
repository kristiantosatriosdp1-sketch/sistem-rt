<script lang="ts">
	import { enhance } from '$app/forms';
	import { KATEGORI_KONTAK_LABEL } from '$lib/validation/informasi';

	let { data, form } = $props();

	let showFormTambah = $state(false);
	let editingId = $state<string | null>(null);
	let search = $state('');
	let loadingAction = $state<string | null>(null);

	const iconMap: Record<string, string> = {
		ambulan: '🚑',
		damkar: '🚒',
		polisi: '🚓',
		pln: '⚡',
		pdam: '💧',
		lainnya: '📞'
	};

	const kontakTersaring = $derived(
		data.daftarKontak.filter((k) => {
			if (!search.trim()) return true;
			const q = search.toLowerCase();
			return (
				k.nama.toLowerCase().includes(q) ||
				k.nomor.toLowerCase().includes(q) ||
				(k.keterangan && k.keterangan.toLowerCase().includes(q)) ||
				(KATEGORI_KONTAK_LABEL[k.kategori] && KATEGORI_KONTAK_LABEL[k.kategori].toLowerCase().includes(q))
			);
		})
	);
</script>

<svelte:head>
	<title>Kontak Darurat & Penting - Sistem RT</title>
</svelte:head>

<header class="bg-red-600 px-4 pt-6 pb-8 text-white">
	<div class="flex items-center justify-between">
		<div>
			<a href="/informasi" class="inline-flex items-center text-xs text-red-100 hover:text-white">
				← Kembali ke Pusat Info
			</a>
			<h1 class="mt-1 text-xl font-semibold">🚨 Kontak Darurat</h1>
		</div>
		<button
			onclick={() => {
				showFormTambah = !showFormTambah;
				editingId = null;
			}}
			class="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-red-800 shadow-md transition hover:bg-red-50 active:scale-95"
		>
			{showFormTambah ? '✕ Tutup' : '+ Tambah Kontak'}
		</button>
	</div>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Form Tambah Kontak -->
	{#if showFormTambah}
		<section class="rounded-2xl bg-white p-4 shadow-sm border border-red-100">
			<h2 class="text-sm font-semibold text-gray-900 mb-3">Tambah Nomor Kontak Darurat</h2>
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
					<label for="kontak-kategori" class="text-xs font-medium text-gray-700">Kategori Instansi *</label>
					<select
						id="kontak-kategori"
						name="kategori"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
					>
						{#each Object.entries(KATEGORI_KONTAK_LABEL) as [val, lbl]}
							<option value={val}>{iconMap[val] ?? '📞'} {lbl}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="kontak-nama" class="text-xs font-medium text-gray-700">Nama Instansi / Petugas *</label>
					<input
						id="kontak-nama"
						name="nama"
						type="text"
						placeholder="Misal: Polsek Setempat, RSUD Kota, Babinsa"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
					/>
					{#if form?.action === 'tambah' && form?.errors?.nama}
						<p class="mt-0.5 text-xs text-red-600">{form.errors.nama}</p>
					{/if}
				</div>

				<div>
					<label for="kontak-nomor" class="text-xs font-medium text-gray-700">Nomor Telepon / Hotline *</label>
					<input
						id="kontak-nomor"
						name="nomor"
						type="text"
						placeholder="Misal: 110, 112, 021-1234567, 08123456789"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
					/>
					{#if form?.action === 'tambah' && form?.errors?.nomor}
						<p class="mt-0.5 text-xs text-red-600">{form.errors.nomor}</p>
					{/if}
				</div>

				<div>
					<label for="kontak-ket" class="text-xs font-medium text-gray-700">Keterangan Tambahan</label>
					<textarea
						id="kontak-ket"
						name="keterangan"
						rows="2"
						placeholder="Layanan 24 jam, nama petugas jaga, ekstensi..."
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
					></textarea>
				</div>

				<button
					type="submit"
					disabled={loadingAction === 'tambah'}
					class="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
				>
					{loadingAction === 'tambah' ? 'Menyimpan...' : 'Simpan Kontak'}
				</button>
			</form>
		</section>
	{/if}

	<!-- Search bar -->
	<div>
		<input
			type="text"
			placeholder="Cari polisi, ambulan, damkar, PLN..."
			bind:value={search}
			class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-red-500 focus:outline-none"
		/>
	</div>

	<!-- List Kontak -->
	{#if kontakTersaring.length === 0}
		<div class="rounded-2xl bg-white p-8 text-center text-gray-400 shadow-sm">
			<p class="text-3xl">🚨</p>
			<p class="mt-2 text-sm font-medium text-gray-600">Belum ada nomor kontak darurat terdaftar</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each kontakTersaring as k (k.id)}
				<article class="relative rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
					{#if editingId === k.id}
						<!-- Form Edit Inline -->
						<h3 class="text-sm font-semibold text-gray-900 mb-2">Edit Kontak Darurat</h3>
						<form
							method="POST"
							action="?/edit"
							use:enhance={() => {
								loadingAction = `edit-${k.id}`;
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
							<input type="hidden" name="id" value={k.id} />
							<div>
								<label for="edit-kat-k-{k.id}" class="text-xs font-medium text-gray-700">Kategori</label>
								<select
									id="edit-kat-k-{k.id}"
									name="kategori"
									required
									value={k.kategori}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>
									{#each Object.entries(KATEGORI_KONTAK_LABEL) as [val, lbl]}
										<option value={val}>{iconMap[val] ?? '📞'} {lbl}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="edit-nama-k-{k.id}" class="text-xs font-medium text-gray-700">Nama Instansi</label>
								<input
									id="edit-nama-k-{k.id}"
									name="nama"
									type="text"
									required
									value={k.nama}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								/>
							</div>
							<div>
								<label for="edit-nomor-k-{k.id}" class="text-xs font-medium text-gray-700">Nomor Telepon</label>
								<input
									id="edit-nomor-k-{k.id}"
									name="nomor"
									type="text"
									required
									value={k.nomor}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								/>
							</div>
							<div>
								<label for="edit-ket-k-{k.id}" class="text-xs font-medium text-gray-700">Keterangan</label>
								<textarea
									id="edit-ket-k-{k.id}"
									name="keterangan"
									rows="2"
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>{k.keterangan ?? ''}</textarea>
							</div>
							<div class="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={loadingAction === `edit-${k.id}`}
									class="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
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
							<div class="flex items-start gap-3">
								<span class="text-2xl">{iconMap[k.kategori] ?? '📞'}</span>
								<div>
									<span
										class="inline-block rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700"
									>
										{KATEGORI_KONTAK_LABEL[k.kategori] ?? k.kategori}
									</span>
									<h3 class="mt-0.5 text-base font-semibold text-gray-900">{k.nama}</h3>
									{#if k.keterangan}
										<p class="mt-1 text-xs text-gray-500">{k.keterangan}</p>
									{/if}
								</div>
							</div>

							<div class="flex items-center gap-1.5">
								<button
									onclick={() => (editingId = k.id)}
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
									<input type="hidden" name="id" value={k.id} />
									<button
										type="submit"
										onclick={(e) => {
											if (!confirm(`Hapus kontak "${k.nama}"?`)) e.preventDefault();
										}}
										class="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
										title="Hapus"
									>
										🗑️
									</button>
								</form>
							</div>
						</div>

						<div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
							<span class="text-sm font-semibold tracking-wider text-gray-900">{k.nomor}</span>
							<a
								href="tel:{k.nomor}"
								class="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
							>
								📞 Panggil Sekarang
							</a>
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</main>
