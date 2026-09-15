<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let showFormTambah = $state(false);
	let editingId = $state<string | null>(null);
	let filterStatus = $state<'semua' | 'aktif' | 'berakhir'>('aktif');
	let loadingAction = $state<string | null>(null);

	const today = new Date().toISOString().slice(0, 10);

	const pengumumanTersaring = $derived(
		data.daftarPengumuman.filter((p) => {
			const sudahMulai = p.tanggalMulai <= today;
			const belumBerakhir = !p.tanggalBerakhir || p.tanggalBerakhir >= today;
			const isAktif = sudahMulai && belumBerakhir;

			if (filterStatus === 'aktif') return isAktif;
			if (filterStatus === 'berakhir') return !isAktif;
			return true;
		})
	);

	function formatTgl(d: string | null) {
		if (!d) return '-';
		return new Date(d).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Pengumuman Warga - Sistem RT</title>
</svelte:head>

<header class="bg-brand-600 px-4 pt-6 pb-8 text-white">
	<div class="flex items-center justify-between">
		<div>
			<a href="/informasi" class="inline-flex items-center text-xs text-brand-100 hover:text-white">
				← Kembali ke Pusat Info
			</a>
			<h1 class="mt-1 text-xl font-semibold">📢 Pengumuman Warga</h1>
		</div>
		<button
			onclick={() => {
				showFormTambah = !showFormTambah;
				editingId = null;
			}}
			class="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-brand-800 shadow-md transition hover:bg-brand-50 active:scale-95"
		>
			{showFormTambah ? '✕ Tutup' : '+ Buat Pengumuman'}
		</button>
	</div>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Form Tambah Pengumuman -->
	{#if showFormTambah}
		<section class="rounded-2xl bg-white p-4 shadow-sm border border-brand-100">
			<h2 class="text-sm font-semibold text-gray-900 mb-3">Siarkan Pengumuman Baru</h2>
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
					<label for="peng-org" class="text-xs font-medium text-gray-700">Sumber / Organisasi (opsional)</label>
					<select
						id="peng-org"
						name="organisasiId"
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					>
						<option value="">-- Pengurus RT (Umum) --</option>
						{#each data.semuaOrganisasi as org (org.id)}
							<option value={org.id}>{org.nama}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="peng-judul" class="text-xs font-medium text-gray-700">Judul Pengumuman *</label>
					<input
						id="peng-judul"
						name="judul"
						type="text"
						placeholder="Misal: Pemadaman Listrik Sementara Hari Rabu"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					/>
					{#if form?.action === 'tambah' && form?.errors?.judul}
						<p class="mt-0.5 text-xs text-red-600">{form.errors.judul}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="peng-mulai" class="text-xs font-medium text-gray-700">Tanggal Tayang *</label>
						<input
							id="peng-mulai"
							name="tanggalMulai"
							type="date"
							required
							value={today}
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="peng-selesai" class="text-xs font-medium text-gray-700">Sampai Tanggal (opsional)</label>
						<input
							id="peng-selesai"
							name="tanggalBerakhir"
							type="date"
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="peng-isi" class="text-xs font-medium text-gray-700">Isi Pengumuman *</label>
					<textarea
						id="peng-isi"
						name="isi"
						rows="4"
						required
						placeholder="Tuliskan isi pengumuman lengkap untuk warga..."
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					></textarea>
					{#if form?.action === 'tambah' && form?.errors?.isi}
						<p class="mt-0.5 text-xs text-red-600">{form.errors.isi}</p>
					{/if}
				</div>

				<button
					type="submit"
					disabled={loadingAction === 'tambah'}
					class="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
				>
					{loadingAction === 'tambah' ? 'Menyimpan...' : 'Terbitkan Pengumuman'}
				</button>
			</form>
		</section>
	{/if}

	<!-- Tab Filter -->
	<div class="flex gap-2 rounded-xl bg-gray-200/70 p-1 text-xs">
		<button
			onclick={() => (filterStatus = 'aktif')}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus === 'aktif'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Aktif Sekarang
		</button>
		<button
			onclick={() => (filterStatus = 'berakhir')}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus === 'berakhir'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Sudah Berakhir
		</button>
		<button
			onclick={() => (filterStatus = 'semua')}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus === 'semua'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Semua ({data.daftarPengumuman.length})
		</button>
	</div>

	<!-- List Pengumuman -->
	{#if pengumumanTersaring.length === 0}
		<div class="rounded-2xl bg-white p-8 text-center text-gray-400 shadow-sm">
			<p class="text-3xl">📢</p>
			<p class="mt-2 text-sm font-medium text-gray-600">Tidak ada pengumuman pada kategori ini</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each pengumumanTersaring as p (p.id)}
				<article class="relative rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
					{#if editingId === p.id}
						<!-- Form Edit Inline -->
						<h3 class="text-sm font-semibold text-gray-900 mb-2">Edit Pengumuman</h3>
						<form
							method="POST"
							action="?/edit"
							use:enhance={() => {
								loadingAction = `edit-${p.id}`;
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
							<input type="hidden" name="id" value={p.id} />
							<div>
								<label for="edit-org-p-{p.id}" class="text-xs font-medium text-gray-700">Organisasi</label>
								<select
									id="edit-org-p-{p.id}"
									name="organisasiId"
									value={p.organisasiId ?? ''}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>
									<option value="">-- Pengurus RT (Umum) --</option>
									{#each data.semuaOrganisasi as org (org.id)}
										<option value={org.id}>{org.nama}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="edit-judul-p-{p.id}" class="text-xs font-medium text-gray-700">Judul</label>
								<input
									id="edit-judul-p-{p.id}"
									name="judul"
									type="text"
									required
									value={p.judul}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								/>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div>
									<label for="edit-mulai-p-{p.id}" class="text-xs font-medium text-gray-700">Mulai</label>
									<input
										id="edit-mulai-p-{p.id}"
										name="tanggalMulai"
										type="date"
										required
										value={p.tanggalMulai}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
								<div>
									<label for="edit-selesai-p-{p.id}" class="text-xs font-medium text-gray-700">Berakhir</label>
									<input
										id="edit-selesai-p-{p.id}"
										name="tanggalBerakhir"
										type="date"
										value={p.tanggalBerakhir ?? ''}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
							</div>
							<div>
								<label for="edit-isi-p-{p.id}" class="text-xs font-medium text-gray-700">Isi</label>
								<textarea
									id="edit-isi-p-{p.id}"
									name="isi"
									rows="3"
									required
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>{p.isi}</textarea>
							</div>
							<div class="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={loadingAction === `edit-${p.id}`}
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
										class="inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
									>
										🏛️ {p.namaOrganisasi ?? 'Pengurus RT'}
									</span>
									{#if p.tanggalBerakhir && p.tanggalBerakhir < today}
										<span class="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
											Berakhir
										</span>
									{:else}
										<span class="rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
											Aktif
										</span>
									{/if}
								</div>
								<h3 class="mt-1 text-base font-semibold text-gray-900">{p.judul}</h3>
							</div>

							<div class="flex items-center gap-1.5">
								<button
									onclick={() => (editingId = p.id)}
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
									<input type="hidden" name="id" value={p.id} />
									<button
										type="submit"
										onclick={(e) => {
											if (!confirm(`Hapus pengumuman "${p.judul}"?`)) e.preventDefault();
										}}
										class="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
										title="Hapus"
									>
										🗑️
									</button>
								</form>
							</div>
						</div>

						<p class="mt-1 text-[11px] text-gray-400">
							📅 {formatTgl(p.tanggalMulai)}
							{#if p.tanggalBerakhir}
								s/d {formatTgl(p.tanggalBerakhir)}
							{/if}
						</p>

						<div class="mt-2.5 rounded-xl bg-gray-50/80 p-3 text-xs leading-relaxed text-gray-700 whitespace-pre-line">
							{p.isi}
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</main>
