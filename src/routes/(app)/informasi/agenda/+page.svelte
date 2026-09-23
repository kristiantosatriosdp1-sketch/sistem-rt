<script lang="ts">
	import { enhance } from "$app/forms";

	let { data, form } = $props();

	let showFormTambah = $state(false);
	let editingId = $state<string | null>(null);
	let loadingAction = $state<string | null>(null);

	function isAgendaLewat(tanggal: string | Date | null) {
		if (!tanggal) return false;
		return new Date(tanggal).getTime() < Date.now();
	}

	function formatWaktuAgenda(
		mulai: string | Date | null,
		selesai: string | Date | null,
	) {
		if (!mulai) return "-";

		const start = new Date(mulai);

		const formatTanggal = (date: Date) =>
			date.toLocaleDateString("id-ID", {
				weekday: "long",
				day: "numeric",
				month: "short",
				year: "numeric",
			});

		const formatJam = (date: Date) =>
			date.toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});

		if (!selesai) {
			return `${formatTanggal(start)}, ${formatJam(start)}`;
		}

		const end = new Date(selesai);

		// Tanggal sama → tanggal cukup ditulis sekali
		if (
			start.getFullYear() === end.getFullYear() &&
			start.getMonth() === end.getMonth() &&
			start.getDate() === end.getDate()
		) {
			return `${formatTanggal(start)}, ${formatJam(start)} - ${formatJam(end)}`;
		}

		// Tanggal berbeda → tampilkan tanggal lengkap keduanya
		return `${formatTanggal(start)}, ${formatJam(start)} - ${formatTanggal(end)}, ${formatJam(end)}`;
	}

	function toDatetimeLocal(d: string | Date | null) {
		if (!d) return "";

		const date = new Date(d);
		const pad = (n: number) => n.toString().padStart(2, "0");

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

<header class="px-4 mt-6">
	<div class="flex items-center justify-between mb-5">
		<div>
			<h1 class="text-lg font-semibold text-gray-900">Agenda Kegiatan</h1>
		</div>
		<button
			onclick={() => {
				showFormTambah = !showFormTambah;
				editingId = null;
			}}
			class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
		>
			{showFormTambah ? "✕ Tutup" : "+ Tambah Agenda"}
		</button>
	</div>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Form Tambah Agenda -->
	{#if showFormTambah}
		<section
			class="rounded-2xl bg-white p-4 shadow-sm border border-brand-100"
		>
			<h2 class="text-sm font-semibold text-gray-900 mb-3">
				Buat Agenda Kegiatan Baru
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
						for="agenda-org"
						class="text-xs font-medium text-gray-700"
						>Organisasi Penyelenggara *</label
					>
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
					{#if form?.action === "tambah" && form?.errors?.organisasiId}
						<p class="mt-0.5 text-xs text-red-600">
							{form.errors.organisasiId}
						</p>
					{/if}
				</div>

				<div>
					<label
						for="agenda-judul"
						class="text-xs font-medium text-gray-700"
						>Judul Kegiatan *</label
					>
					<input
						id="agenda-judul"
						name="judul"
						type="text"
						placeholder="Misal: Kerja Bakti Bersih Saluran"
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
							for="agenda-mulai"
							class="text-xs font-medium text-gray-700"
							>Waktu Mulai *</label
						>
						<input
							id="agenda-mulai"
							name="tanggalMulai"
							type="datetime-local"
							required
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
					<div>
						<label
							for="agenda-selesai"
							class="text-xs font-medium text-gray-700"
							>Waktu Selesai (opsional)</label
						>
						<input
							id="agenda-selesai"
							name="tanggalSelesai"
							type="datetime-local"
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label
						for="agenda-lokasi"
						class="text-xs font-medium text-gray-700"
						>Lokasi (opsional)</label
					>
					<input
						id="agenda-lokasi"
						name="lokasi"
						type="text"
						placeholder="Misal: Balai RT 04 / Pos Ronda"
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					/>
				</div>

				<div>
					<label
						for="agenda-deskripsi"
						class="text-xs font-medium text-gray-700"
						>Deskripsi / Detail Acara</label
					>
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
					disabled={loadingAction === "tambah"}
					class="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
				>
					{loadingAction === "tambah"
						? "Menyimpan..."
						: "Simpan Agenda"}
				</button>
			</form>
		</section>
	{/if}

	<!-- Tab Filter -->
	<!-- <div class="flex gap-2 rounded-xl bg-gray-200/70 p-1 text-xs mt-10">
		<button
			onclick={() => (filterStatus = "mendatang")}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus ===
			'mendatang'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Mendatang
		</button>
		<button
			onclick={() => (filterStatus = "lewat")}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus ===
			'lewat'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Selesai
		</button>
		<button
			onclick={() => (filterStatus = "semua")}
			class="flex-1 rounded-lg py-1.5 font-medium transition {filterStatus ===
			'semua'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600'}"
		>
			Semua ({data.daftarAgenda.length})
		</button>
	</div> -->

	<!-- List Agenda -->
	<!-- List Agenda -->
	{#if data.daftarAgenda.length === 0}
		<div
			class="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm"
		>
			<div
				class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-2xl"
			>
				📅
			</div>

			<p class="mt-3 text-sm font-semibold text-gray-700">
				Belum ada agenda
			</p>

			<p class="mt-1 text-xs text-gray-400">
				Klik tombol di atas untuk membuat agenda kegiatan baru.
			</p>
		</div>
	{:else}
		<div class="mt-10 space-y-3">
			{#each data.daftarAgenda as a (a.id)}
				{@const lewat = isAgendaLewat(a.tanggalMulai)}

				<article
					class={`relative overflow-hidden rounded-2xl border shadow-sm transition ${
						lewat
							? "border-gray-100 bg-gray-200 text-gray-400"
							: "border-emerald-500/30 bg-emerald-50"
					}`}
				>
					<!-- Accent -->
					<div
						class={`absolute left-0 top-0 h-full w-1 ${
							lewat ? "bg-gray-300" : "bg-emerald-400"
						}`}
					></div>

					<div class="p-4 pl-5">
						{#if editingId === a.id}
							<!-- ========================= -->
							<!-- FORM EDIT -->
							<!-- ========================= -->

							<form
								method="POST"
								action="?/edit"
								use:enhance={() => {
									loadingAction = `edit-${a.id}`;

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
								<input type="hidden" name="id" value={a.id} />

								<div>
									<label
										for={`edit-org-${a.id}`}
										class={`text-xs font-medium ${
											lewat
												? "text-gray-700"
												: "text-gray-300"
										}`}
									>
										Organisasi
									</label>

									<select
										id={`edit-org-${a.id}`}
										name="organisasiId"
										required
										class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
									>
										{#each data.semuaOrganisasi as org (org.id)}
											<option
												value={org.id}
												selected={org.id ===
													a.organisasiId}
											>
												{org.nama}
											</option>
										{/each}
									</select>
								</div>

								<div>
									<label
										for={`edit-judul-${a.id}`}
										class={`text-xs font-medium ${
											lewat
												? "text-gray-700"
												: "text-gray-300"
										}`}
									>
										Judul Kegiatan
									</label>

									<input
										id={`edit-judul-${a.id}`}
										name="judul"
										type="text"
										value={a.judul}
										required
										class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
									/>
								</div>

								<div
									class="grid grid-cols-1 gap-2 sm:grid-cols-2"
								>
									<div>
										<label
											for={`edit-mulai-${a.id}`}
											class={`text-xs font-medium ${
												lewat
													? "text-gray-700"
													: "text-gray-300"
											}`}
										>
											Waktu Mulai
										</label>

										<input
											id={`edit-mulai-${a.id}`}
											name="tanggalMulai"
											type="datetime-local"
											value={toDatetimeLocal(
												a.tanggalMulai,
											)}
											required
											class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
										/>
									</div>

									<div>
										<label
											for={`edit-selesai-${a.id}`}
											class={`text-xs font-medium ${
												lewat
													? "text-gray-700"
													: "text-gray-300"
											}`}
										>
											Waktu Selesai
										</label>

										<input
											id={`edit-selesai-${a.id}`}
											name="tanggalSelesai"
											type="datetime-local"
											value={toDatetimeLocal(
												a.tanggalSelesai,
											)}
											class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
										/>
									</div>
								</div>

								<div>
									<label
										for={`edit-lokasi-${a.id}`}
										class={`text-xs font-medium ${
											lewat
												? "text-gray-700"
												: "text-gray-300"
										}`}
									>
										Lokasi
									</label>

									<input
										id={`edit-lokasi-${a.id}`}
										name="lokasi"
										type="text"
										value={a.lokasi ?? ""}
										class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
									/>
								</div>

								<div>
									<label
										for={`edit-deskripsi-${a.id}`}
										class={`text-xs font-medium ${
											lewat
												? "text-gray-700"
												: "text-gray-300"
										}`}
									>
										Deskripsi
									</label>

									<textarea
										id={`edit-deskripsi-${a.id}`}
										name="deskripsi"
										rows="3"
										class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
										>{a.deskripsi ?? ""}</textarea
									>
								</div>

								<div class="flex gap-2 pt-1">
									<button
										type="submit"
										disabled={loadingAction ===
											`edit-${a.id}`}
										class="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
									>
										{loadingAction === `edit-${a.id}`
											? "Menyimpan..."
											: "Simpan Perubahan"}
									</button>

									<button
										type="button"
										onclick={() => (editingId = null)}
										class="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
									>
										Batal
									</button>
								</div>
							</form>
						{:else}
							<!-- ========================= -->
							<!-- HEADER CARD -->
							<!-- ========================= -->

							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0 flex-1">
									<div
										class="flex flex-wrap items-center gap-2"
									>
										<span
											class={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
												lewat
													? "bg-gray-100 text-gray-900"
													: "bg-emerald-500 text-white"
											}`}
										>
											{lewat ? "Selesai" : "Akan Datang"}
										</span>

										<span
											class={`text-[11px] font-medium ${
												lewat
													? "text-blue-600"
													: "text-blue-600"
											}`}
										>
											🏛️ {a.namaOrganisasi ?? "RT"}
										</span>
									</div>

									<h3
										class={`mt-4 text-base font-bold leading-snug ${
											lewat
												? "text-gray-500"
												: "text-black"
										}`}
									>
										{a.judul}
									</h3>
								</div>

								{#if !lewat}
									<!-- Edit hanya untuk agenda yang belum lewat -->
									<button
										type="button"
										onclick={() => (editingId = a.id)}
										class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
										title="Edit agenda"
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
											loadingAction = `hapus-${a.id}`;

											return async ({ update }) => {
												loadingAction = null;
												await update();
											};
										}}
									>
										<input
											type="hidden"
											name="id"
											value={a.id}
										/>

										<button
											type="submit"
											onclick={(e) => {
												if (
													!confirm(
														"Yakin ingin menghapus agenda ini?",
													)
												) {
													e.preventDefault();
												}
											}}
											disabled={loadingAction ===
												`hapus-${a.id}`}
											class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
											title="Hapus agenda"
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
												<path d="M19 6l-1 14H6L5 6" />
												<path d="M10 11v6" />
												<path d="M14 11v6" />
												<path d="M9 6V4h6v2" />
											</svg>
										</button>
									</form>
								{/if}
							</div>

							<!-- ========================= -->
							<!-- DETAIL -->
							<!-- ========================= -->

							<div
								class={`mt-1 space-y-1.5 border-t pt-3 text-xs ${
									lewat
										? "border-gray-100 text-gray-400"
										: "border-white/10 text-black"
								}`}
							>
								<p class="flex items-start gap-2">
									<span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4.5 w-4.5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</span>

									<strong
										class={lewat
											? "text-gray-400"
											: "text-black"}
									>
										{formatWaktuAgenda(
											a.tanggalMulai,
											a.tanggalSelesai,
										)}
									</strong>
								</p>

								{#if a.lokasi}
									<p class="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4 shrink-0"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
											/>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
										<span>{a.lokasi}</span>
									</p>
								{/if}
							</div>

							{#if a.deskripsi}
								<p
									class={`mt-3 rounded-xl p-3 text-xs leading-relaxed whitespace-pre-line ${
										lewat
											? "bg-gray-50 text-gray-500"
											: "bg-white/5 text-black"
									}`}
								>
									{a.deskripsi}
								</p>
							{/if}
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</main>
