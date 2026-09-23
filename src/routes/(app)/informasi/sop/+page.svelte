<script lang="ts">
	import { enhance } from "$app/forms";

	let { data, form } = $props();

	let showFormTambah = $state(false);
	let editingId = $state<string | null>(null);
	let search = $state("");
	let expandedId = $state<string | null>(null);
	let loadingAction = $state<string | null>(null);

	const sopTersaring = $derived(
		data.daftarSop.filter((s) => {
			if (!search.trim()) return true;
			const q = search.toLowerCase();
			return (
				s.judul.toLowerCase().includes(q) ||
				(s.kategori && s.kategori.toLowerCase().includes(q)) ||
				s.konten.toLowerCase().includes(q)
			);
		}),
	);
</script>

<svelte:head>
	<title>SOP & Tata Tertib RT - Sistem RT</title>
</svelte:head>

<header class="px-4 mt-6">
	<div class="flex items-center justify-between mb-5">
		<div>
			<h1 class="text-lg font-semibold text-gray-900">
				SOP & Tata Tertib
			</h1>
		</div>
		{#if data.user.role === "admin_rt"}
			<button
				onclick={() => {
					showFormTambah = !showFormTambah;
					editingId = null;
				}}
				class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
			>
				{showFormTambah ? "✕ Tutup" : "+ Tata Tertib Baru"}
			</button>
		{/if}
	</div>
</header>

<main class="mt-10 space-y-4 px-4">
	<!-- Form Tambah SOP -->
	{#if showFormTambah}
		<section
			class="rounded-2xl bg-white p-4 shadow-sm border border-brand-100"
		>
			<h2 class="text-sm font-semibold text-gray-900 mb-3">
				Buat Panduan / SOP / Tata Tertib Baru
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
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
					<div class="sm:col-span-2">
						<label
							for="sop-judul"
							class="text-xs font-medium text-gray-700"
							>Judul Panduan / Tata Tertib *</label
						>
						<input
							id="sop-judul"
							name="judul"
							type="text"
							placeholder="Misal: Prosedur Pengurusan Surat Pengantar Nikah"
							required
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
						{#if form?.action === "tambah" && form?.errors?.judul}
							<p class="mt-0.5 text-xs text-red-600">
								{form.errors.judul}
							</p>
						{/if}
					</div>
					<div>
						<label
							for="sop-kat"
							class="text-xs font-medium text-gray-700"
							>Kategori</label
						>
						<input
							id="sop-kat"
							name="kategori"
							type="text"
							placeholder="Administrasi, Keamanan, Lingkungan..."
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label
						for="sop-urutan"
						class="text-xs font-medium text-gray-700"
						>Nomor Urutan Tampilan (Angka)</label
					>
					<input
						id="sop-urutan"
						name="urutan"
						type="number"
						value="0"
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					/>
				</div>

				<div>
					<label
						for="sop-konten"
						class="text-xs font-medium text-gray-700"
						>Isi Prosedur & Penjelasan Lengkap *</label
					>
					<textarea
						id="sop-konten"
						name="konten"
						rows="6"
						required
						placeholder="Tuliskan butir-butir tata tertib atau langkah langkah SOP..."
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					></textarea>
					{#if form?.action === "tambah" && form?.errors?.konten}
						<p class="mt-0.5 text-xs text-red-600">
							{form.errors.konten}
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
						: "Simpan Dokumen SOP"}
				</button>
			</form>
		</section>
	{/if}

	<!-- Search bar -->
	<div>
		<input
			type="text"
			placeholder="Cari tata tertib, surat pengantar, iuran..."
			bind:value={search}
			class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
		/>
	</div>

	<!-- List SOP -->
	{#if sopTersaring.length === 0}
		<div
			class="rounded-2xl bg-white p-8 text-center text-gray-400 shadow-sm"
		>
			<p class="text-3xl">📜</p>
			<p class="mt-2 text-sm font-medium text-gray-600">
				Belum ada dokumen SOP & tata tertib
			</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each sopTersaring as s (s.id)}
				<article
					class="relative rounded-2xl bg-emerald-50 p-4 shadow-sm border border-gray-100"
				>
					{#if editingId === s.id}
						<!-- Form Edit Inline -->
						<h3 class="text-sm font-semibold text-gray-900 mb-2">
							Edit Dokumen SOP
						</h3>
						<form
							method="POST"
							action="?/edit"
							use:enhance={() => {
								loadingAction = `edit-${s.id}`;
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
							<input type="hidden" name="id" value={s.id} />
							<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
								<div class="sm:col-span-2">
									<label
										for="edit-judul-s-{s.id}"
										class="text-xs font-medium text-gray-700"
										>Judul</label
									>
									<input
										id="edit-judul-s-{s.id}"
										name="judul"
										type="text"
										required
										value={s.judul}
										class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
									/>
								</div>
								<div>
									<label
										for="edit-kat-s-{s.id}"
										class="text-xs font-medium text-gray-700"
										>Kategori</label
									>
									<input
										id="edit-kat-s-{s.id}"
										name="kategori"
										type="text"
										value={s.kategori ?? ""}
										class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
									/>
								</div>
							</div>
							<div>
								<label
									for="edit-urutan-s-{s.id}"
									class="text-xs font-medium text-gray-700"
									>Urutan</label
								>
								<input
									id="edit-urutan-s-{s.id}"
									name="urutan"
									type="number"
									value={s.urutan ?? 0}
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
								/>
							</div>
							<div>
								<label
									for="edit-konten-s-{s.id}"
									class="text-xs font-medium text-gray-700"
									>Konten Prosedur</label
								>
								<textarea
									id="edit-konten-s-{s.id}"
									name="konten"
									rows="5"
									required
									class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
									>{s.konten}</textarea
								>
							</div>
							<div class="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={loadingAction === `edit-${s.id}`}
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
							<button
								type="button"
								class="flex-1 text-left cursor-pointer focus:outline-none"
								onclick={() =>
									(expandedId =
										expandedId === s.id ? null : s.id)}
							>
								<div class="flex items-center gap-1.5">
									{#if s.kategori}
										<span
											class="inline-block rounded-md bg-emerald-500 px-2 py-0.5 text-[11px] font-medium text-white"
										>
											{s.kategori}
										</span>
									{/if}
									{#if s.urutan !== null && s.urutan !== undefined}
										<span class="text-[11px] text-gray-400"
											>#{s.urutan}</span
										>
									{/if}
								</div>
								<h3
									class="mt-1 text-base font-semibold text-gray-900 flex items-center gap-1.5"
								>
									<span>{s.judul}</span>
									<span
										class="text-xs text-gray-400 font-normal"
									>
										{expandedId === s.id ? "▲" : "▼"}
									</span>
								</h3>
							</button>

							<div class="flex items-center gap-1.5">
								<button
									onclick={() => (editingId = s.id)}
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
									<input
										type="hidden"
										name="id"
										value={s.id}
									/>
									<button
										type="submit"
										onclick={(e) => {
											if (
												!confirm(
													`Hapus SOP "${s.judul}"?`,
												)
											)
												e.preventDefault();
										}}
										class="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
										title="Hapus"
									>
										🗑️
									</button>
								</form>
							</div>
						</div>

						<!-- Preview ringkas atau Expand Full Content -->
						<div
							class="mt-2.5 rounded-xl bg-emerald-50 p-3 text-xs leading-relaxed text-gray-700 whitespace-pre-line {expandedId ===
							s.id
								? ''
								: 'line-clamp-3'}"
						>
							{s.konten}
						</div>

						<button
							onclick={() =>
								(expandedId =
									expandedId === s.id ? null : s.id)}
							class="mt-2 text-xs font-medium text-brand-600 hover:underline"
						>
							{expandedId === s.id
								? "Tutup Rincian ▲"
								: "Baca Selengkapnya ▼"}
						</button>
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</main>
