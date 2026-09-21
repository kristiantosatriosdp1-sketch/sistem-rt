<script lang="ts">
	let { data } = $props();

	let modalOpen = $state(false);
	let activeGroup = $state<
		| "semua"
		| "lakiLaki"
		| "perempuan"
		| "balita"
		| "anak"
		| "remaja"
		| "pemuda"
		| "dewasa"
		| "lansia"
	>("semua");
	let modalSearch = $state("");

	function umur(tanggalLahir: string | Date | null) {
		if (!tanggalLahir) return null;

		let lahir: Date;

		if (tanggalLahir instanceof Date) {
			lahir = new Date(tanggalLahir);
		} else {
			const parts = tanggalLahir.split("T")[0].split("-");

			lahir =
				parts.length === 3
					? new Date(
							Number(parts[0]),
							Number(parts[1]) - 1,
							Number(parts[2]),
						)
					: new Date(tanggalLahir);
		}

		const now = new Date();

		let usia = now.getFullYear() - lahir.getFullYear();

		const belumUlangTahun =
			now.getMonth() < lahir.getMonth() ||
			(now.getMonth() === lahir.getMonth() &&
				now.getDate() < lahir.getDate());

		if (belumUlangTahun) usia--;

		return Math.max(0, usia);
	}

	function openModal(group: typeof activeGroup) {
		activeGroup = group;
		modalSearch = "";
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		modalSearch = "";
	}

	function field(w: any, names: string[], fallback = "") {
		for (const name of names) {
			if (
				w?.[name] !== undefined &&
				w?.[name] !== null &&
				String(w[name]).trim() !== ""
			) {
				return String(w[name]);
			}
		}

		return fallback;
	}

	function photo(w: any) {
		return field(
			w,
			[
				"fotoProfil",
				"photoProfil",
				"foto",
				"photo",
				"fotoUrl",
				"photoUrl",
			],
			"",
		);
	}

	function alamat(w: any) {
		return field(
			w,
			["alamatLengkap", "alamat", "alamatDomisili"],
			"Alamat belum tersedia",
		);
	}

	function hp(w: any) {
		return field(
			w,
			[
				"noHp",
				"nomorHp",
				"noTelepon",
				"nomorTelepon",
				"telepon",
				"phone",
			],
			"Nomor HP belum tersedia",
		);
	}

	const groupLabels: Record<typeof activeGroup, string> = {
		semua: "Semua Warga",
		lakiLaki: "Warga Laki-laki",
		perempuan: "Warga Perempuan",
		balita: "Balita",
		anak: "Anak",
		remaja: "Remaja",
		pemuda: "Pemuda",
		dewasa: "Dewasa",
		lansia: "Lansia",
	};

	const activeMembers = $derived(data.kelompokWarga[activeGroup] ?? []);

	const filteredMembers = $derived(
		activeMembers.filter((w: any) =>
			String(w.namaLengkap ?? "")
				.toLowerCase()
				.includes(modalSearch.trim().toLowerCase()),
		),
	);
</script>

<svelte:head>
	<title>Demografi Warga — Sistem RT</title>
</svelte:head>

<div
	class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 pt-6 pb-5 text-white rounded-b-[0.55rem] shadow-lg shadow-emerald-500/20"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-3">
			<div class="bg-white/10 p-2 rounded-2xl backdrop-blur-md">
				<svg
					class="w-6 h-6 text-white"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					></path>
				</svg>
			</div>

			<h1 class="text-xl font-bold tracking-wide">Kanal Warga</h1>
		</div>

		<div class="flex items-center space-x-3">
			<button
				aria-label="Notifikasi"
				class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition"
			>
				<svg
					class="w-5 h-5 text-white"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					></path>
				</svg>
			</button>

			<a
				href="/logout"
				class="w-10 h-10 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center backdrop-blur-md transition group"
				title="Keluar"
			>
				<svg
					class="w-5 h-5 text-white group-hover:text-red-200 transition"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
					></path>
				</svg>
			</a>
		</div>
	</div>
</div>

<div class="px-4 mt-6">
	<div class="flex items-center justify-between mb-5">
		<h1 class="text-lg font-semibold text-gray-900">Demografi Warga</h1>

		<a
			href="/warga/baru"
			class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
		>
			+ Tambah
		</a>
	</div>

	<!-- Total Warga -->
	<button
		type="button"
		onclick={() => openModal("semua")}
		class="w-full text-left group flex items-center justify-between gap-3 rounded-2xl bg-white border border-emerald-100 p-3.5 shadow-sm transition hover:shadow-md hover:border-emerald-200"
	>
		<div class="flex items-center gap-3 min-w-0">
			<div
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100"
			>
				<svg
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.8"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-3a4 4 0 100-8 4 4 0 000 8zm6-1a3 3 0 100-6 3 3 0 000 6z"
					/>
				</svg>
			</div>

			<div class="min-w-0">
				<p
					class="text-[11px] font-bold uppercase tracking-wider text-emerald-700/80"
				>
					Total Warga
				</p>

				<p class="text-2xl font-extrabold text-gray-900 leading-tight">
					{data.statistikWarga.totalWarga}
					<span class="text-xs font-normal text-gray-500">
						Jiwa
					</span>
				</p>
			</div>
		</div>

		<div
			class="shrink-0 rounded-xl bg-emerald-50/80 border border-emerald-100 px-3 py-1.5 text-emerald-800 text-right"
		>
			<p class="text-[10px] font-medium text-emerald-600 leading-none">
				Total KK
			</p>

			<p class="text-xs font-bold leading-tight">
				{data.statistikWarga.totalKK}
			</p>
		</div>
	</button>

	<!-- Jenis Kelamin -->
	<div class="grid grid-cols-2 gap-3 mt-3">
		<button
			type="button"
			onclick={() => openModal("lakiLaki")}
			class="group flex items-center gap-2.5 rounded-2xl bg-white border border-sky-100 p-3 shadow-sm text-left transition hover:shadow-md hover:border-sky-200"
		>
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-50 text-sky-600"
			>
				<svg
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.8"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			</div>

			<div>
				<p
					class="text-[10px] font-bold uppercase tracking-wider text-sky-700/80"
				>
					Laki-laki
				</p>

				<p class="text-lg font-extrabold text-gray-900">
					{data.statistikWarga.totalLakiLaki}
					<span class="text-[11px] font-medium text-gray-500">
						Jiwa
					</span>
				</p>
			</div>
		</button>

		<button
			type="button"
			onclick={() => openModal("perempuan")}
			class="group flex items-center gap-2.5 rounded-2xl bg-white border border-rose-100 p-3 shadow-sm text-left transition hover:shadow-md hover:border-rose-200"
		>
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-50 text-rose-600"
			>
				<svg
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.8"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			</div>

			<div>
				<p
					class="text-[10px] font-bold uppercase tracking-wider text-rose-700/80"
				>
					Perempuan
				</p>

				<p class="text-lg font-extrabold text-gray-900">
					{data.statistikWarga.totalPerempuan}
					<span class="text-[11px] font-medium text-gray-500">
						Jiwa
					</span>
				</p>
			</div>
		</button>
	</div>

	<!-- Kelompok Usia -->
	<div class="mt-4">
		<div class="flex items-center justify-between mb-2.5">
			<h2
				class="text-xs font-bold uppercase tracking-wider text-gray-500"
			>
				Kelompok Usia
			</h2>

			<span class="text-[11px] text-gray-400"> Rentang Umur </span>
		</div>

		<div class="grid grid-cols-2 gap-2.5">
			{#each [["balita", "Balita", "0–3 thn", data.statistikWarga.totalBalita], ["anak", "Anak", "4–11 thn", data.statistikWarga.totalAnak], ["remaja", "Remaja", "12–19 thn", data.statistikWarga.totalRemaja], ["pemuda", "Pemuda", "20–40 thn", data.statistikWarga.totalPemuda], ["dewasa", "Dewasa", "41–55 thn", data.statistikWarga.totalDewasa], ["lansia", "Lansia", "≥ 56 thn", data.statistikWarga.totalLansia]] as item}
				<button
					type="button"
					onclick={() => openModal(item[0] as typeof activeGroup)}
					class="flex items-center rounded-2xl bg-emerald-50 border border-emerald-100 p-3 shadow-sm text-left transition hover:shadow-md hover:border-emerald-200"
				>
					<div class="min-w-0 flex-1">
						<div class="flex items-baseline justify-between gap-1">
							<p
								class="truncate text-xs font-bold text-emerald-600"
							>
								{item[1]}
							</p>

							<span
								class="text-[10px] text-emerald-600 shrink-0 font-medium"
							>
								{item[2]}
							</span>
						</div>

						<p
							class="text-base font-extrabold text-gray-900 leading-tight"
						>
							{item[3]}
							<span class="text-[11px] font-medium text-gray-500">
								Jiwa
							</span>
						</p>
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>

<!-- Daftar Warga -->
<div class="space-y-4 px-4 py-4">
	<a href="/rumah" class="block text-sm text-brand-600">
		Lihat data Rumah →
	</a>
</div>

<!-- Modal -->
{#if modalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && closeModal()}
	>
		<div
			class="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<!-- Header Modal -->
			<div class="border-b border-gray-100 px-5 py-4">
				<div class="flex items-center justify-between gap-3">
					<div>
						<h2
							id="modal-title"
							class="text-lg font-bold text-gray-900"
						>
							{groupLabels[activeGroup]}
						</h2>

						<p class="text-xs text-gray-500">
							{filteredMembers.length} warga
						</p>
					</div>

					<button
						type="button"
						aria-label="Tutup"
						onclick={closeModal}
						class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
					>
						✕
					</button>
				</div>

				<!-- Search Modal -->
				<div class="mt-3 relative">
					<svg
						class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
						/>
					</svg>

					<input
						bind:value={modalSearch}
						type="search"
						placeholder="Cari nama warga..."
						class="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
					/>
				</div>
			</div>

			<!-- Daftar Warga dalam Modal -->
			<div class="overflow-y-auto p-4">
				<div class="space-y-2">
					{#each filteredMembers as w (w.id)}
						<div
							class="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
						>
							<div class="flex items-center gap-3">
								{#if photo(w)}
									<img
										src={photo(w)}
										alt="Foto {w.namaLengkap}"
										class="h-14 w-14 shrink-0 rounded-full object-cover border border-gray-100"
									/>
								{:else}
									<div
										class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-600"
									>
										{String(w.namaLengkap ?? "?")
											.charAt(0)
											.toUpperCase()}
									</div>
								{/if}

								<div class="min-w-0 flex-1">
									<p
										class="truncate font-semibold text-gray-900"
									>
										{w.namaLengkap}
									</p>

									<p class="text-xs text-gray-500">
										{w.jenisKelamin === "L"
											? "Laki-laki"
											: "Perempuan"}
										· {umur(w.tanggalLahir) ?? "-"} tahun
									</p>

									<p class="text-xs text-gray-500">
										{hp(w)}
									</p>

									<p class="text-xs text-gray-500">
										{alamat(w)}
									</p>
								</div>
							</div>
						</div>
					{:else}
						<div class="py-12 text-center text-sm text-gray-400">
							Tidak ada warga dengan nama tersebut.
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
