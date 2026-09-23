<script lang="ts">
	import { enhance } from "$app/forms";

	let { data, form } = $props();

	let showFormTambah = $state(false);
	let editingId = $state<string | null>(null);
	let filterStatus = $state<"semua" | "aktif" | "berakhir">("aktif");
	let loadingAction = $state<string | null>(null);

	const today = new Date().toISOString().slice(0, 10);

	const pengumumanTersaring = $derived(
		data.daftarPengumuman.filter((p) => {
			const sudahMulai = p.tanggalMulai <= today;
			const belumBerakhir =
				!p.tanggalBerakhir || p.tanggalBerakhir >= today;
			const isAktif = sudahMulai && belumBerakhir;

			if (filterStatus === "aktif") return isAktif;
			if (filterStatus === "berakhir") return !isAktif;
			return true;
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
	<title>Pengumuman Warga - Sistem RT</title>
</svelte:head>

<header class="px-4 mt-6">
	<div class="flex items-center justify-between mb-5">
		<div>
			<h1 class="text-lg font-semibold text-gray-900">Pengumuman</h1>
		</div>
		{#if data.user.role === "admin_rt"}
			<button
				onclick={() => {
					showFormTambah = !showFormTambah;
					editingId = null;
				}}
				class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
			>
				{showFormTambah ? "✕ Tutup" : "+ Pengumuman Baru"}
			</button>
		{/if}
	</div>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Form Tambah Pengumuman -->
	{#if showFormTambah}
		<section
			class="rounded-2xl bg-white p-4 shadow-sm border border-brand-100"
		>
			<h2 class="text-sm font-semibold text-gray-900 mb-3">
				Siarkan Pengumuman Baru
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
						for="peng-org"
						class="text-xs font-medium text-gray-700"
						>Sumber / Organisasi (opsional)</label
					>
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
					<label
						for="peng-judul"
						class="text-xs font-medium text-gray-700"
						>Judul Pengumuman *</label
					>
					<input
						id="peng-judul"
						name="judul"
						type="text"
						placeholder="Misal: Pemadaman Listrik Sementara Hari Rabu"
						required
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					/>
					{#if form?.action === "tambah" && form?.errors?.judul}
						<p class="mt-0.5 text-xs text-red-600">
							{form.errors.judul}
						</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label
							for="peng-mulai"
							class="text-xs font-medium text-gray-700"
							>Tanggal Tayang *</label
						>
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
						<label
							for="peng-selesai"
							class="text-xs font-medium text-gray-700"
							>Sampai Tanggal (opsional)</label
						>
						<input
							id="peng-selesai"
							name="tanggalBerakhir"
							type="date"
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label
						for="peng-isi"
						class="text-xs font-medium text-gray-700"
						>Isi Pengumuman *</label
					>
					<textarea
						id="peng-isi"
						name="isi"
						rows="4"
						required
						placeholder="Tuliskan isi pengumuman lengkap untuk warga..."
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
						: "Terbitkan Pengumuman"}
				</button>
			</form>
		</section>
	{/if}

	<!-- Tab Filter -->
	<!-- <div class="flex gap-2 rounded-xl bg-gray-200/70 p-1 text-xs">
		<button
			onclick={() => (filterStatus = "aktif")}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus ===
			'aktif'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Aktif Sekarang
		</button>
		<button
			onclick={() => (filterStatus = "berakhir")}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus ===
			'berakhir'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Sudah Berakhir
		</button>
		<button
			onclick={() => (filterStatus = "semua")}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus ===
			'semua'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Semua ({data.daftarPengumuman.length})
		</button>
	</div> -->

	<!-- List Pengumuman -->
	{#if pengumumanTersaring.length === 0}
		<div
			class="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm mt-10"
		>
			<div
				class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-2xl"
			>
				📢
			</div>

			<p class="mt-3 text-sm font-semibold text-gray-700">
				Tidak ada pengumuman
			</p>

			<p class="mt-1 text-xs text-gray-400">
				Klik tombol di atas untuk membuat pengumuman baru.
			</p>
		</div>
	{:else}
		<div class="mt-10 space-y-3">
			{#each pengumumanTersaring as p (p.id)}
				{@const berakhir =
					p.tanggalBerakhir && p.tanggalBerakhir < today}

				<article
					class={`relative overflow-hidden rounded-2xl border shadow-sm transition ${
						berakhir
							? "border-gray-100 bg-gray-200 text-gray-400"
							: "border-emerald-500/30 bg-emerald-50"
					}`}
				>
					<!-- Accent -->
					<div
						class={`absolute left-0 top-0 h-full w-1 ${
							berakhir ? "bg-gray-300" : "bg-emerald-400"
						}`}
					></div>
					{#if data.user.role === "admin_rt"}
						<div class="p-4 pl-5">
							{#if editingId === p.id}
								<!-- ========================= -->
								<!-- FORM EDIT -->
								<!-- ========================= -->

								<form
									method="POST"
									action="?/edit"
									use:enhance={() => {
										loadingAction = `edit-${p.id}`;

										return async ({ result, update }) => {
											loadingAction = null;

											if (result.type === "success") {
												editingId = null;
											}

											await update();
										};
									}}
									class="space-y-3"
								>
									<input
										type="hidden"
										name="id"
										value={p.id}
									/>

									<div>
										<label
											for={`edit-org-p-${p.id}`}
											class="text-xs font-medium text-gray-700"
										>
											Organisasi
										</label>

										<select
											id={`edit-org-p-${p.id}`}
											name="organisasiId"
											class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
										>
											<option value="">
												-- Pengurus RT (Umum) --
											</option>

											{#each data.semuaOrganisasi as org (org.id)}
												<option
													value={org.id}
													selected={org.id ===
														p.organisasiId}
												>
													{org.nama}
												</option>
											{/each}
										</select>
									</div>

									<div>
										<label
											for={`edit-judul-p-${p.id}`}
											class="text-xs font-medium text-gray-700"
										>
											Judul Pengumuman
										</label>

										<input
											id={`edit-judul-p-${p.id}`}
											name="judul"
											type="text"
											required
											value={p.judul}
											class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
										/>
									</div>

									<div
										class="grid grid-cols-1 gap-2 sm:grid-cols-2"
									>
										<div>
											<label
												for={`edit-mulai-p-${p.id}`}
												class="text-xs font-medium text-gray-700"
											>
												Tanggal Mulai
											</label>

											<input
												id={`edit-mulai-p-${p.id}`}
												name="tanggalMulai"
												type="date"
												required
												value={p.tanggalMulai}
												class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
											/>
										</div>

										<div>
											<label
												for={`edit-selesai-p-${p.id}`}
												class="text-xs font-medium text-gray-700"
											>
												Tanggal Berakhir
											</label>

											<input
												id={`edit-selesai-p-${p.id}`}
												name="tanggalBerakhir"
												type="date"
												value={p.tanggalBerakhir ?? ""}
												class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
											/>
										</div>
									</div>

									<div>
										<label
											for={`edit-isi-p-${p.id}`}
											class="text-xs font-medium text-gray-700"
										>
											Isi Pengumuman
										</label>

										<textarea
											id={`edit-isi-p-${p.id}`}
											name="isi"
											rows="4"
											required
											class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
											>{p.isi}</textarea
										>
									</div>

									<div class="flex gap-2 pt-1">
										<button
											type="submit"
											disabled={loadingAction ===
												`edit-${p.id}`}
											class="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
										>
											{loadingAction === `edit-${p.id}`
												? "Menyimpan..."
												: "Simpan Perubahan"}
										</button>

										<button
											type="button"
											onclick={() => (editingId = null)}
											class="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
										>
											Batal
										</button>
									</div>
								</form>
							{:else}
								<!-- ========================= -->
								<!-- HEADER -->
								<!-- ========================= -->

								<div
									class="flex items-start justify-between gap-3"
								>
									<div class="min-w-0 flex-1">
										<div
											class="flex flex-wrap items-center gap-2"
										>
											<span
												class={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
													berakhir
														? "bg-gray-100 text-gray-900"
														: "bg-emerald-500 text-white"
												}`}
											>
												{berakhir
													? "Berakhir"
													: "Aktif"}
											</span>

											<span
												class={`text-[11px] font-medium ${
													berakhir
														? "text-gray-500"
														: "text-blue-600"
												}`}
											>
												🏛️ {p.namaOrganisasi ??
													"Pengurus RT"}
											</span>
										</div>

										<h3
											class={`mt-4 text-base font-bold leading-snug ${
												berakhir
													? "text-gray-500"
													: "text-black"
											}`}
										>
											{p.judul}
										</h3>
									</div>

									<!-- ACTION -->
									<div class="flex items-center gap-1.5">
										<button
											type="button"
											onclick={() => (editingId = p.id)}
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
												loadingAction = `hapus-${p.id}`;

												return async ({ update }) => {
													loadingAction = null;
													await update();
												};
											}}
										>
											<input
												type="hidden"
												name="id"
												value={p.id}
											/>

											<button
												type="submit"
												onclick={(e) => {
													if (
														!confirm(
															`Hapus pengumuman "${p.judul}"?`,
														)
													) {
														e.preventDefault();
													}
												}}
												disabled={loadingAction ===
													`hapus-${p.id}`}
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
													<polyline
														points="3 6 5 6 21 6"
													/>
													<path
														d="M19 6l-1 14H6L5 6"
													/>
													<path d="M10 11v6" />
													<path d="M14 11v6" />
													<path d="M9 6V4h6v2" />
												</svg>
											</button>
										</form>
									</div>
								</div>

								<!-- ========================= -->
								<!-- DETAIL -->
								<!-- ========================= -->

								<div
									class={`mt-1 space-y-1.5 border-t pt-3 text-xs ${
										berakhir
											? "border-gray-100 text-gray-400"
											: "border-white/10 text-black"
									}`}
								>
									<p class="flex items-center gap-2">
										<span>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												stroke-width="2"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M8 7V3m8 4V3m-9 8h10M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
												/>
											</svg>
										</span>

										<strong
											class={berakhir
												? "text-gray-400"
												: "text-black"}
										>
											{formatTgl(p.tanggalMulai)}

											{#if p.tanggalBerakhir}
												&nbsp;s/d&nbsp;
												{formatTgl(p.tanggalBerakhir)}
											{/if}
										</strong>
									</p>
								</div>

								<!-- ISI -->
								<div
									class={`mt-3 rounded-xl p-3 text-xs leading-relaxed whitespace-pre-line ${
										berakhir
											? "bg-gray-50 text-gray-500"
											: "bg-white/5 text-black"
									}`}
								>
									{p.isi}
								</div>
							{/if}
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</main>
