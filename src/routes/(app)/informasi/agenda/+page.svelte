<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let showFormTambah = $state(false);
	let editingId = $state<string | null>(null);
	let filterStatus = $state<'semua' | 'mendatang' | 'lewat'>('mendatang');
	let loadingAction = $state<string | null>(null);

	const now = new Date();

	const agendaTersaring = $derived(
		data.daftarAgenda.filter((a) => {
			const tgl = new Date(a.tanggalMulai);
			if (filterStatus === 'mendatang') return tgl >= now;
			if (filterStatus === 'lewat') return tgl < now;
			return true;
		})
	);

	function formatTgl(iso: string | Date | null) {
		if (!iso) return '-';
		return new Date(iso).toLocaleDateString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function toDatetimeLocal(d: string | Date | null) {
		if (!d) return '';
		const date = new Date(d);
		const pad = (n: number) => n.toString().padStart(2, '0');
		const yyyy = date.getFullYear();
		const MM = pad(date.getMonth() + 1);
		const dd = pad(date.getDate());
		const hh = pad(date.getHours());
		const mm = pad(date.getMinutes());
		return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
	}
</script>

<svelte:head>
	<title>Agenda Kegiatan - Sistem RT</title>
</svelte:head>

<header class="bg-brand-600 px-4 pt-6 pb-8 text-white">
	<div class="flex items-center justify-between">
		<div>
			<a href="/informasi" class="inline-flex items-center text-xs text-brand-100 hover:text-white">
				← Kembali ke Pusat Info
			</a>
			<h1 class="mt-1 text-xl font-semibold">📅 Agenda Kegiatan</h1>
		</div>
		<button
			onclick={() => {
				showFormTambah = !showFormTambah;
				editingId = null;
			}}
			class="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-brand-800 shadow-md transition hover:bg-brand-50 active:scale-95"
		>
			{showFormTambah ? '✕ Tutup' : '+ Tambah Agenda'}
		</button>
	</div>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Form Tambah Agenda -->
	{#if showFormTambah}
		<section class="rounded-2xl bg-white p-4 shadow-sm border border-brand-100">
			<h2 class="text-sm font-semibold text-gray-900 mb-3">Buat Agenda Kegiatan Baru</h2>
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
					<label for="agenda-org" class="text-xs font-medium text-gray-700">Organisasi Penyelenggara *</label>
					<select
						id="agenda-org"
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
					<label for="agenda-judul" class="text-xs font-medium text-gray-700">Judul Kegiatan *</label>
					<input
						id="agenda-judul"
						name="judul"
						type="text"
						placeholder="Misal: Kerja Bakti Bersih Saluran"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					/>
					{#if form?.action === 'tambah' && form?.errors?.judul}
						<p class="mt-0.5 text-xs text-red-600">{form.errors.judul}</p>
					{/if}
				</div>

				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					<div>
						<label for="agenda-mulai" class="text-xs font-medium text-gray-700">Waktu Mulai *</label>
						<input
							id="agenda-mulai"
							name="tanggalMulai"
							type="datetime-local"
							required
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="agenda-selesai" class="text-xs font-medium text-gray-700">Waktu Selesai (opsional)</label>
						<input
							id="agenda-selesai"
							name="tanggalSelesai"
							type="datetime-local"
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="agenda-lokasi" class="text-xs font-medium text-gray-700">Lokasi (opsional)</label>
					<input
						id="agenda-lokasi"
						name="lokasi"
						type="text"
						placeholder="Misal: Balai RT 04 / Pos Ronda"
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="agenda-deskripsi" class="text-xs font-medium text-gray-700">Deskripsi / Detail Acara</label>
					<textarea
						id="agenda-deskripsi"
						name="deskripsi"
						rows="3"
						placeholder="Informasi perlengkapan yang perlu dibawa, agenda rapat, dll."
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					></textarea>
				</div>

				<button
					type="submit"
					disabled={loadingAction === 'tambah'}
					class="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
				>
					{loadingAction === 'tambah' ? 'Menyimpan...' : 'Simpan Agenda'}
				</button>
			</form>
		</section>
	{/if}

	<!-- Tab Filter -->
	<div class="flex gap-2 rounded-xl bg-gray-200/70 p-1 text-xs">
		<button
			onclick={() => (filterStatus = 'mendatang')}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus === 'mendatang'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Mendatang
		</button>
		<button
			onclick={() => (filterStatus = 'lewat')}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus === 'lewat'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Selesai
		</button>
		<button
			onclick={() => (filterStatus = 'semua')}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus === 'semua'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Semua ({data.daftarAgenda.length})
		</button>
	</div>

	<!-- List Agenda -->
	{#if agendaTersaring.length === 0}
		<div class="rounded-2xl bg-white p-8 text-center text-gray-400 shadow-sm">
			<p class="text-3xl">📅</p>
			<p class="mt-2 text-sm font-medium text-gray-600">Belum ada agenda pada kategori ini</p>
			<p class="text-xs text-gray-400">Klik tombol di atas untuk membuat jadwal kegiatan baru.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each agendaTersaring as a (a.id)}
				<article class="relative rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
					{#if editingId === a.id}
						<!-- Form Edit Inline -->
						<h3 class="text-sm font-semibold text-gray-900 mb-2">Edit Agenda</h3>
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
								<label for="edit-org-{a.id}" class="text-xs font-medium text-gray-700">Organisasi</label>
								<select
									id="edit-org-{a.id}"
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
								<label for="edit-judul-{a.id}" class="text-xs font-medium text-gray-700">Judul</label>
								<input
									id="edit-judul-{a.id}"
									name="judul"
									type="text"
									required
									value={a.judul}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								/>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div>
									<label for="edit-mulai-{a.id}" class="text-xs font-medium text-gray-700">Mulai</label>
									<input
										id="edit-mulai-{a.id}"
										name="tanggalMulai"
										type="datetime-local"
										required
										value={toDatetimeLocal(a.tanggalMulai)}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
								<div>
									<label for="edit-selesai-{a.id}" class="text-xs font-medium text-gray-700">Selesai</label>
									<input
										id="edit-selesai-{a.id}"
										name="tanggalSelesai"
										type="datetime-local"
										value={toDatetimeLocal(a.tanggalSelesai)}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
							</div>
							<div>
								<label for="edit-lokasi-{a.id}" class="text-xs font-medium text-gray-700">Lokasi</label>
								<input
									id="edit-lokasi-{a.id}"
									name="lokasi"
									type="text"
									value={a.lokasi ?? ''}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								/>
							</div>
							<div>
								<label for="edit-desc-{a.id}" class="text-xs font-medium text-gray-700">Deskripsi</label>
								<textarea
									id="edit-desc-{a.id}"
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
						<!-- Tampilan Card Normal -->
						<div class="flex items-start justify-between gap-2">
							<div>
								<span
									class="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
								>
									🏛️ {a.namaOrganisasi ?? 'RT'}
								</span>
								<h3 class="mt-1 text-base font-semibold text-gray-900">{a.judul}</h3>
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
											if (!confirm(`Hapus agenda "${a.judul}"?`)) e.preventDefault();
										}}
										class="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
										title="Hapus"
									>
										🗑️
									</button>
								</form>
							</div>
						</div>

						<div class="mt-2.5 space-y-1 text-xs text-gray-600">
							<p class="flex items-center gap-1.5">
								<span>🕒</span>
								<strong class="font-medium text-gray-800">{formatTgl(a.tanggalMulai)}</strong>
								{#if a.tanggalSelesai}
									<span>s/d {formatTgl(a.tanggalSelesai)}</span>
								{/if}
							</p>
							{#if a.lokasi}
								<p class="flex items-center gap-1.5">
									<span>📍</span>
									<span>{a.lokasi}</span>
								</p>
							{/if}
						</div>

						{#if a.deskripsi}
							<p class="mt-3 rounded-xl bg-gray-50 p-2.5 text-xs leading-relaxed text-gray-600 whitespace-pre-line">
								{a.deskripsi}
							</p>
						{/if}
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</main>
