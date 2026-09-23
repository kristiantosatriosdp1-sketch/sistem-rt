<script lang="ts">
	import { enhance } from "$app/forms";
	import { TINGKAT_BERITA_LABEL } from "$lib/validation/informasi";

	let { data, form } = $props();

	let showFormTambah = $state(false);
	let editingId = $state<string | null>(null);
	let filterTingkat = $state<string>("semua");
	let loadingAction = $state<string | null>(null);

	const today = new Date().toISOString().slice(0, 10);

	const beritaTersaring = $derived(
		data.daftarBerita.filter((b) => {
			if (filterTingkat === "semua") return true;
			return b.tingkat === filterTingkat;
		}),
	);

	function formatTgl(d: string | null) {
		if (!d) return "-";
		return new Date(d).toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	}
</script>

<svelte:head>
	<title>Kabar & Berita - Sistem RT</title>
</svelte:head>

<header class="px-4 mt-6">
	<div class="flex items-center justify-between mb-5">
		<div>
			<h1 class="text-lg font-semibold text-gray-900">Kabar & Berita</h1>
		</div>
		{#if data.user.role === "admin_rt"}
			<button
				onclick={() => {
					showFormTambah = !showFormTambah;
					editingId = null;
				}}
				class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
			>
				{showFormTambah ? "✕ Tutup" : "+ Berita Baru"}
			</button>
		{/if}
	</div>
</header>

<main class="mt-10 space-y-4 px-4">
	<!-- Form Tambah Berita -->
	{#if showFormTambah}
		<section
			class="rounded-2xl bg-white p-4 shadow-sm border border-brand-100"
		>
			<h2 class="text-sm font-semibold text-gray-900 mb-3">
				Publikasikan Berita Baru
			</h2>
			<form
				method="POST"
				action="?/tambah"
				use:enhance={() => {
					loadingAction = "tambah";
					return async ({ result, update }) => {
						loadingAction = null;
						if (result.type === "success") {
							showFormTambah = false;
						}
						await update();
					};
				}}
				class="space-y-3"
			>
				<div>
					<label
						for="berita-tingkat"
						class="text-xs font-medium text-gray-700"
						>Tingkat Wilayah *</label
					>
					<select
						id="berita-tingkat"
						name="tingkat"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					>
						{#each Object.entries(TINGKAT_BERITA_LABEL) as [val, lbl]}
							<option value={val}>{lbl}</option>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="berita-judul"
						class="text-xs font-medium text-gray-700"
						>Judul Berita *</label
					>
					<input
						id="berita-judul"
						name="judul"
						type="text"
						placeholder="Misal: Penyaluran Bantuan Sosial di Kantor Kelurahan"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					/>
					{#if form?.action === "tambah" && form?.errors?.judul}
						<p class="mt-0.5 text-xs text-red-600">
							{form.errors.judul}
						</p>
					{/if}
				</div>

				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					<div>
						<label
							for="berita-tgl"
							class="text-xs font-medium text-gray-700"
							>Tanggal Berita *</label
						>
						<input
							id="berita-tgl"
							name="tanggal"
							type="date"
							required
							value={today}
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
					<div>
						<label
							for="berita-url"
							class="text-xs font-medium text-gray-700"
							>Tautan Sumber (opsional)</label
						>
						<input
							id="berita-url"
							name="sumberUrl"
							type="url"
							placeholder="https://..."
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label
						for="berita-isi"
						class="text-xs font-medium text-gray-700"
						>Isi Berita *</label
					>
					<textarea
						id="berita-isi"
						name="isi"
						rows="4"
						required
						placeholder="Uraian berita lengkap..."
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					></textarea>
					{#if form?.action === "tambah" && form?.errors?.isi}
						<p class="mt-0.5 text-xs text-red-600">
							{form.errors.isi}
						</p>
					{/if}
				</div>

				<button
					type="submit"
					disabled={loadingAction === "tambah"}
					class="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
				>
					{loadingAction === "tambah"
						? "Menyimpan..."
						: "Simpan Berita"}
				</button>
			</form>
		</section>
	{/if}

	<!-- Tab Filter Tingkat -->
	<div class="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
		<button
			onclick={() => (filterTingkat = "semua")}
			class="whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition {filterTingkat ===
			'semua'
				? 'bg-brand-600 text-white'
				: 'bg-white text-gray-600 border border-gray-200'}"
		>
			Semua ({data.daftarBerita.length})
		</button>
		{#each Object.entries(TINGKAT_BERITA_LABEL) as [val, lbl]}
			{@const jml = data.daftarBerita.filter(
				(b) => b.tingkat === val,
			).length}
			<button
				onclick={() => (filterTingkat = val)}
				class="whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition {filterTingkat ===
				val
					? 'bg-brand-600 text-white'
					: 'bg-white text-gray-600 border border-gray-200'}"
			>
				{lbl}
				{jml > 0 ? `(${jml})` : ""}
			</button>
		{/each}
	</div>

	<!-- List Berita -->
	{#if beritaTersaring.length === 0}
		<div
			class="rounded-2xl bg-white p-8 text-center text-gray-400 shadow-sm"
		>
			<p class="text-3xl">📰</p>
			<p class="mt-2 text-sm font-medium text-gray-600">
				Belum ada berita pada tingkat ini
			</p>
		</div>
	{:else}
		<div class="mt-5 space-y-3">
			{#each beritaTersaring as b (b.id)}
				<article
					class="relative rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
				>
					{#if editingId === b.id}
						<!-- Form Edit Inline -->
						<h3 class="text-sm font-semibold text-gray-900 mb-2">
							Edit Berita
						</h3>
						<form
							method="POST"
							action="?/edit"
							use:enhance={() => {
								loadingAction = `edit-${b.id}`;
								return async ({ result, update }) => {
									loadingAction = null;
									if (result.type === "success") {
										editingId = null;
									}
									await update();
								};
							}}
							class="space-y-2.5"
						>
							<input type="hidden" name="id" value={b.id} />
							<div>
								<label
									for="edit-tingkat-{b.id}"
									class="text-xs font-medium text-gray-700"
									>Tingkat Wilayah</label
								>
								<select
									id="edit-tingkat-{b.id}"
									name="tingkat"
									required
									value={b.tingkat}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								>
									{#each Object.entries(TINGKAT_BERITA_LABEL) as [val, lbl]}
										<option value={val}>{lbl}</option>
									{/each}
								</select>
							</div>
							<div>
								<label
									for="edit-judul-b-{b.id}"
									class="text-xs font-medium text-gray-700"
									>Judul</label
								>
								<input
									id="edit-judul-b-{b.id}"
									name="judul"
									type="text"
									required
									value={b.judul}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								/>
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div>
									<label
										for="edit-tgl-b-{b.id}"
										class="text-xs font-medium text-gray-700"
										>Tanggal</label
									>
									<input
										id="edit-tgl-b-{b.id}"
										name="tanggal"
										type="date"
										required
										value={b.tanggal}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
								<div>
									<label
										for="edit-url-b-{b.id}"
										class="text-xs font-medium text-gray-700"
										>Tautan Sumber</label
									>
									<input
										id="edit-url-b-{b.id}"
										name="sumberUrl"
										type="url"
										value={b.sumberUrl ?? ""}
										class="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
									/>
								</div>
							</div>
							<div>
								<label
									for="edit-isi-b-{b.id}"
									class="text-xs font-medium text-gray-700"
									>Isi</label
								>
								<textarea
									id="edit-isi-b-{b.id}"
									name="isi"
									rows="3"
									required
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
									>{b.isi}</textarea
								>
							</div>
							<div class="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={loadingAction === `edit-${b.id}`}
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
								<span
									class="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
								>
									{TINGKAT_BERITA_LABEL[b.tingkat] ??
										b.tingkat}
								</span>
								<h3
									class="mt-1 text-base font-semibold text-gray-900"
								>
									{b.judul}
								</h3>
							</div>
							<div class="flex items-center gap-1.5">
								<button
									type="button"
									onclick={() => (editingId = b.id)}
									class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
									title="Edit pengumuman"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.8"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M12 20h9" />
										<path
											d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
										/>
									</svg>
								</button>

								<form
									method="POST"
									action="?/hapus"
									use:enhance={() => {
										loadingAction = `hapus-${b.id}`;

										return async ({ update }) => {
											loadingAction = null;
											await update();
										};
									}}
								>
									<input
										type="hidden"
										name="id"
										value={b.id}
									/>

									<button
										type="submit"
										onclick={(e) => {
											if (
												!confirm(
													`Hapus pengumuman "${b.judul}"?`,
												)
											) {
												e.preventDefault();
											}
										}}
										disabled={loadingAction ===
											`hapus-${b.id}`}
										class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
										title="Hapus pengumuman"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.8"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6l-1 14H6L5 6" />
											<path d="M10 11v6" />
											<path d="M14 11v6" />
											<path d="M9 6V4h6v2" />
										</svg>
									</button>
								</form>
							</div>
						</div>

						<p class="mt-1 text-[11px] text-gray-400">
							{formatTgl(b.tanggal)}
						</p>

						<div
							class="mt-2.5 text-xs leading-relaxed text-gray-700 whitespace-pre-line"
						>
							{b.isi}
						</div>

						{#if b.sumberUrl}
							<div class="mt-3 border-t border-gray-100 pt-2">
								<a
									href={b.sumberUrl}
									target="_blank"
									rel="noreferrer"
									class="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
								>
									🔗 Baca Sumber Asli
								</a>
							</div>
						{/if}
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</main>
