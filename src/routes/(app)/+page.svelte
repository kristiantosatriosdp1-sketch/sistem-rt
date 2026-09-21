<script lang="ts">
	import { formatRupiah } from "$lib/format";
	import { fade, scale } from "svelte/transition";
	let selectedAgenda = $state<any>(null);
	let selectedPengumuman = $state<any>(null);
	let selectedBerita = $state<any>(null);

	let { data } = $props();

	const saldoTotal = $derived(
		Number(data.ringkasanKas.totalMasuk) -
			Number(data.ringkasanKas.totalKeluar),
	);

	function formatTgl(iso: string | Date | null) {
		if (!iso) return "-";
		return new Date(iso).toLocaleDateString("id-ID", {
			weekday: "long",
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	}

	function formatRentangWaktu(
		mulai: string | Date | null,
		selesai: string | Date | null,
	) {
		if (!mulai) return "-";
		if (!selesai) return formatTgl(mulai);

		const start = new Date(mulai);
		const end = new Date(selesai);

		const tanggalSama =
			start.getFullYear() === end.getFullYear() &&
			start.getMonth() === end.getMonth() &&
			start.getDate() === end.getDate();

		const formatJam = (date: Date) =>
			date.toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});

		const formatTanggal = (date: Date) =>
			date.toLocaleDateString("id-ID", {
				weekday: "long",
				day: "numeric",
				month: "short",
				year: "numeric",
			});

		if (tanggalSama) {
			return `${formatTanggal(start)} ${formatJam(start)} - ${formatJam(end)}`;
		}

		return `${formatTanggal(start)} ${formatJam(start)} - ${formatTanggal(end)} ${formatJam(end)}`;
	}
</script>

<svelte:head>
	<title>Sistem RT</title>
</svelte:head>
<div class="min-h-screen bg-gray-50 pb-10">
	<!-- 1. Header Hijau Gradasi -->
	<div
		class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 pt-6 pb-40 text-white rounded-b-[0.55rem] shadow-lg shadow-emerald-500/20"
	>
		<div class="flex items-center justify-between">
			<!-- Logo & Nama Aplikasi -->
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

			<!-- Tombol Notifikasi & Logout -->
			<div class="flex items-center space-x-3">
				<!-- Tombol Notifikasi -->
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button
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

				<!-- Tombol Logout -->
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

	<!-- 2. Container Utama / Card Profil -->
	<div class="px-4 -mt-30">
		<!-- Card Profil Pengguna -->
		<div
			class="bg-white/95 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl p-4 flex items-center justify-between"
		>
			<div class="flex items-center space-x-3.5">
				<!-- Avatar -->
				<div
					class="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white shadow-md"
				>
					<svg
						class="w-7 h-7"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						></path>
					</svg>
				</div>

				<!-- Detail Info Warga -->
				<div>
					<h2 class="font-bold text-gray-800 text-base">
						Antok Kingdom
					</h2>

					<p class="text-xs text-gray-500 font-medium">
						RT 04 / RW 09
					</p>

					<!-- <span
						class="inline-block mt-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
					>
						Warga Aktif
					</span> -->
				</div>
			</div>

			<!-- Tombol Profil -->
			<a
				href="/profil"
				class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-sm rounded-xl transition shadow-sm"
			>
				Profil
			</a>
		</div>
	</div>

	<div class="px-4 mt-15 mb-8">
		<div class="grid grid-cols-5 gap-x-3 gap-y-5 text-center">
			<!-- 8. Nomor Darurat -->
			<a
				href="/informasi/kontak"
				class="flex flex-col items-center group"
			>
				<div
					class="w-14 h-14 bg-emerald-50 group-hover:bg-red-50 rounded-full flex items-center justify-center mb-2 transition shadow-sm border border-emerald-100/50"
				>
					<svg
						class="w-6 h-6 text-emerald-600 group-hover:text-red-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.8"
							d="M18.5 16.5l-2.1-2.1a1.5 1.5 0 00-2.1 0l-1 1a12.5 12.5 0 01-4.7-4.7l1-1a1.5 1.5 0 000-2.1L7.5 5.5a1.5 1.5 0 00-2.1 0l-1 1c-.5.5-.7 1.2-.5 1.9 1.5 6.1 6.3 10.9 12.4 12.4.7.2 1.4 0 1.9-.5l1-1a1.5 1.5 0 000-2.1z"
						/>
					</svg>
				</div>
				<span
					class="text-[11px] font-medium text-gray-700 leading-tight"
				>
					Nomor Darurat
				</span>
			</a>

			<!-- 7. Marketplace -->
			<a href="/informasi/usaha" class="flex flex-col items-center group">
				<div
					class="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-100 rounded-full flex items-center justify-center mb-2 transition shadow-sm border border-emerald-100/50"
				>
					<svg
						class="w-6 h-6 text-emerald-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.8"
							d="M3 9h18M5 9l1-5h12l1 5M5 9v10a2 2 0 002 2h10a2 2 0 002-2V9M9 13h6"
						/>
					</svg>
				</div>
				<span
					class="text-[11px] font-medium text-gray-700 leading-tight"
				>
					Marketplace
				</span>
			</a>

			<!-- 4. Organisasi -->
			<a href="/organisasi" class="flex flex-col items-center group">
				<div
					class="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-100 rounded-full flex items-center justify-center mb-2 transition shadow-sm border border-emerald-100/50"
				>
					<svg
						class="w-6 h-6 text-emerald-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.8"
							d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-4-4h-1M16 3.13a4 4 0 010 7.75"
						/>
					</svg>
				</div>
				<span
					class="text-[11px] font-medium text-gray-700 leading-tight"
				>
					Organisasi
				</span>
			</a>

			<!-- 6. SOP -->
			<a href="/informasi/sop" class="flex flex-col items-center group">
				<div
					class="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-100 rounded-full flex items-center justify-center mb-2 transition shadow-sm border border-emerald-100/50"
				>
					<svg
						class="w-6 h-6 text-emerald-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.8"
							d="M7 3h8l4 4v14H7a2 2 0 01-2-2V5a2 2 0 012-2zM15 3v5h5M9 13h6M9 17h6"
						/>
					</svg>
				</div>
				<span
					class="text-[11px] font-medium text-gray-700 leading-tight"
				>
					Tata Tertib
				</span>
			</a>

			<!--Aset Warga -->
			<a href="/informasi/aset" class="flex flex-col items-center group">
				<div
					class="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-100 rounded-full flex items-center justify-center mb-2 transition shadow-sm border border-emerald-100/50"
				>
					<svg
						class="w-6 h-6 text-emerald-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.8"
							d="M4 20h16M6 20V9l6-5 6 5v11M9 20v-6h6v6M9 10h.01M12 10h.01M15 10h.01"
						/>
					</svg>
				</div>
				<span
					class="text-[11px] font-medium text-gray-700 leading-tight"
				>
					Inventaris
				</span>
			</a>
		</div>
	</div>

	<div class="mt-4 space-y-4 px-4">
		<!-- Live Widgets: Agenda & Pengumuman -->
		{#if data.upcomingAgenda.length > 0 || data.recentPengumuman.length > 0}
			<section class="space-y-3 rounded-2xl p-1">
				{#if data.upcomingAgenda.length > 0}
					<div class="space-y- mt-5 border-t border-gray-400 mb-5">
						<div
							class="flex items-center justify-between pb-2 mt-5"
						>
							<h2 class="font-bold text-gray-900 text-base">
								AGENDA MENDATANG
							</h2>

							<a
								href="/informasi/agenda"
								class="text-xs font-medium text-brand-600"
							>
								Semua →
							</a>
						</div>

						{#each data.upcomingAgenda as a}
							<button
								type="button"
								onclick={() => (selectedAgenda = a)}
								class="group mb-2 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 text-left text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-emerald-700"
							>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-semibold">
										{a.judul}
									</p>

									<div
										class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-emerald-50"
									>
										<span
											class="inline-flex items-center gap-1"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-3.5 w-3.5"
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

											{formatRentangWaktu(
												a.tanggalMulai,
												a.tanggalSelesai,
											)}
										</span>

										{#if a.lokasi}
											<span
												class="inline-flex items-center gap-1 truncate"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-3.5 w-3.5 shrink-0"
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

												{a.lokasi}
											</span>
										{/if}
									</div>
								</div>

								<!-- Arrow -->
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition group-hover:bg-white/20"
								>
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
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</div>
							</button>
						{/each}
					</div>
				{/if}

				{#if data.recentPengumuman.length > 0}
					<div class="mt-5 border-t border-gray-400 pt-5">
						<div class="flex items-center justify-between pb-3">
							<h2 class="text-base font-bold text-gray-900">
								PENGUMUMAN TERBARU
							</h2>

							<a
								href="/informasi/pengumuman"
								class="text-xs font-medium text-brand-600"
							>
								Semua →
							</a>
						</div>

						<div class="space-y-2">
							{#each data.recentPengumuman as p (p.id)}
								<button
									type="button"
									onclick={() => (selectedPengumuman = p)}
									class="group flex w-full items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-left text-white shadow-md shadow-gray-500/20 transition hover:from-gray-600 hover:to-gray-700"
								>
									<!-- Icon Pengumuman -->
									<div
										class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-600 text-emerald-600 backdrop-blur-sm"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-7 w-7"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="1.8"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
											/>
										</svg>
									</div>

									<!-- Informasi Pengumuman -->
									<div class="min-w-0 flex-1">
										<p
											class="truncate text-sm font-semibold text-emerald-600"
										>
											{p.judul}
										</p>

										<div
											class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-700"
										>
											<!-- Tanggal -->
											<span
												class="inline-flex items-center gap-1"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-3.5 w-3.5"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													stroke-width="2"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
													/>
												</svg>

												{formatTgl(p.tanggalMulai)}
											</span>

											<!-- Organisasi -->
											{#if p.namaOrganisasi}
												<span>•</span>

												<span
													class="inline-flex items-center gap-1 truncate"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														class="h-3.5 w-3.5 shrink-0"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														stroke-width="2"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
														/>
													</svg>

													{p.namaOrganisasi}
												</span>
											{/if}
										</div>
									</div>

									<!-- Arrow -->
									<div
										class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition group-hover:bg-white/20"
									>
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
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if data.updateBerita.length > 0}
					<div class="space-y- mt-5 border-t border-gray-400 mb-5">
						<div
							class="flex items-center justify-between pb-2 mt-5"
						>
							<h2 class="font-bold text-gray-900 text-base">
								BERITA TERBARU
							</h2>

							<a
								href="/informasi/berita"
								class="text-xs font-medium text-brand-600"
							>
								Semua →
							</a>
						</div>

						{#each data.updateBerita as b}
							<button
								type="button"
								onclick={() => (selectedBerita = b)}
								class="group mb-2 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 text-left text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-emerald-700"
							>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-semibold">
										{b.judul}
									</p>

									<div
										class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-emerald-50"
									>
										<span
											class="inline-flex items-center gap-1"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-3.5 w-3.5"
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

											{formatTgl(b.tanggal)}
										</span>

										{#if b.tingkat}
											<span
												class="inline-flex items-center gap-1 truncate"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-3.5 w-3.5 shrink-0"
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

												Berita Tingkat {b.tingkat}
											</span>
										{/if}
									</div>
								</div>

								<!-- Arrow -->
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition group-hover:bg-white/20"
								>
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
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</section>
		{:else}
			<section
				class="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 text-center text-gray-400 py-6"
			>
				<p class="text-2xl">📋</p>
				<p class="mt-1.5 text-sm font-medium text-gray-600">
					Pusat Informasi Siap Digunakan
				</p>
				<p class="text-xs text-gray-400 mt-0.5">
					Kelola agenda, pengumuman, aset, SOP, dan kontak darurat
					warga.
				</p>
				<a
					href="/informasi"
					class="inline-block mt-3 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
				>
					Buka Pusat Informasi →
				</a>
			</section>
		{/if}
	</div>
</div>

<!--- MODAL AGENDA-->
<!--- MODAL AGENDA-->
<!--- MODAL AGENDA-->
<!--- MODAL AGENDA-->
<!--- MODAL AGENDA-->

{#if selectedAgenda}
	<!-- Overlay -->
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				selectedAgenda = null;
			}
		}}
		transition:fade={{ duration: 180 }}
	>
		<!-- Modal -->
		<div
			class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="agenda-title"
			transition:scale={{ duration: 200, start: 0.92 }}
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 text-white"
			>
				<!-- Judul -->
				<h4 class="text-lg font-bold leading-snug text-white">
					{selectedAgenda.judul}
				</h4>

				<button
					type="button"
					onclick={() => (selectedAgenda = null)}
					class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-white/20"
					aria-label="Tutup"
				>
					×
				</button>
			</div>

			<!-- Isi Modal -->
			<div class="p-5">
				<!-- Info: Tanggal & Lokasi -->
				<div class="grid grid-cols-2 gap-3 border-t border-gray-100">
					<!-- Tanggal -->
					<div class="flex items-start gap-2">
						<div
							class="mb-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>

						<div class="min-w-0 p-2">
							<p class="text-[11px] text-gray-400">Tanggal</p>

							<p
								class="text-xs font-semibold leading-relaxed text-gray-800"
							>
								{formatTgl(selectedAgenda.tanggalMulai)}
							</p>
						</div>
					</div>

					<!-- Lokasi -->
					{#if selectedAgenda.lokasi}
						<div class="flex items-start gap-2">
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
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
							</div>

							<div class="min-w-0">
								<p class="text-[11px] text-gray-400">Lokasi</p>

								<p
									class="truncate text-xs font-semibold leading-relaxed text-gray-800"
								>
									{selectedAgenda.lokasi}
								</p>
							</div>
						</div>
					{/if}
				</div>

				<!-- Deskripsi -->
				{#if selectedAgenda.deskripsi}
					<div class="mt-3">
						<p class="text-sm leading-relaxed text-gray-600">
							{selectedAgenda.deskripsi}
						</p>
					</div>
				{/if}

				<!-- Tombol -->
				<button
					type="button"
					onclick={() => (selectedAgenda = null)}
					class="mt-5 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
				>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}

<!--- MODAL PENGUMUMAN-->
<!--- MODAL PENGUMUMAN-->
<!--- MODAL PENGUMUMAN-->
<!--- MODAL PENGUMUMAN-->
<!--- MODAL PENGUMUMAN-->
{#if selectedPengumuman}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				selectedPengumuman = null;
			}
		}}
		transition:fade={{ duration: 180 }}
	>
		<div
			class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="pengumuman-title"
			transition:scale={{ duration: 200, start: 0.92 }}
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 text-white"
			>
				<h3 class="text-base font-bold">Detail Pengumuman</h3>

				<button
					type="button"
					onclick={() => (selectedPengumuman = null)}
					class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-white/20"
					aria-label="Tutup"
				>
					×
				</button>
			</div>

			<!-- Content -->
			<div class="p-5">
				<h4
					id="pengumuman-title"
					class="text-lg font-bold leading-snug text-gray-900"
				>
					{selectedPengumuman.judul}
				</h4>

				<!-- Deskripsi -->
				{#if selectedPengumuman.isi}
					<div class="mt-3">
						<p class="text-sm leading-relaxed text-gray-600">
							{selectedPengumuman.isi}
						</p>
					</div>
				{/if}

				<!-- Info kiri kanan -->
				<div
					class="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4"
				>
					<!-- Waktu -->
					<div class="flex items-start gap-2">
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.8"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>

						<div class="min-w-0">
							<p class="text-[11px] text-gray-400">Waktu</p>

							<p
								class="text-xs font-semibold leading-relaxed text-gray-800"
							>
								{formatTgl(selectedPengumuman.tanggalMulai)}
							</p>
						</div>
					</div>

					<!-- Organisasi -->
					{#if selectedPengumuman.namaOrganisasi}
						<div class="flex items-start gap-2">
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.8"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>

							<div class="min-w-0">
								<p class="text-[11px] text-gray-400">
									Organisasi
								</p>

								<p
									class="truncate text-xs font-semibold leading-relaxed text-gray-800"
								>
									{selectedPengumuman.namaOrganisasi}
								</p>
							</div>
						</div>
					{/if}
				</div>

				<!-- Tombol -->
				<button
					type="button"
					onclick={() => (selectedPengumuman = null)}
					class="mt-5 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
				>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}

{#if selectedBerita}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				selectedBerita = null;
			}
		}}
		transition:fade={{ duration: 180 }}
	>
		<div
			class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="berita-title"
			transition:scale={{ duration: 200, start: 0.92 }}
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 text-white"
			>
				<h3 class="text-base font-bold">{selectedBerita.judul}</h3>

				<button
					type="button"
					onclick={() => (selectedBerita = null)}
					class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-white/20"
					aria-label="Tutup"
				>
					×
				</button>
			</div>

			<!-- Isi -->
			<div class="p-5">
				<!-- Isi / Deskripsi Berita -->
				{#if selectedBerita.deskripsi}
					<div class="mt-3">
						<p
							class="whitespace-pre-line text-sm leading-relaxed text-gray-600"
						>
							{selectedBerita.deskripsi}
						</p>
					</div>
				{:else if selectedBerita.isi}
					<div class="mt-3">
						<p
							class="whitespace-pre-line text-sm leading-relaxed text-gray-600"
						>
							{selectedBerita.isi}
						</p>
					</div>
				{/if}

				<!-- Informasi -->
				<div
					class="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4"
				>
					<!-- Tanggal -->
					<div class="flex items-start gap-2">
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.8"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>

						<div class="min-w-0">
							<p class="text-[11px] text-gray-400">Tanggal</p>

							<p
								class="text-xs font-semibold leading-relaxed text-gray-800"
							>
								{formatTgl(selectedBerita.tanggal)}
							</p>
						</div>
					</div>

					<!-- Tingkat -->
					{#if selectedBerita.tingkat}
						<div class="flex items-start gap-2">
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.8"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3 12l9-9 9 9-9 9-9-9z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 7v10M7 12h10"
									/>
								</svg>
							</div>

							<div class="min-w-0">
								<p class="text-[11px] text-gray-400">
									Tingkat Berita
								</p>

								<p
									class="text-xs font-semibold leading-relaxed text-gray-800"
								>
									{selectedBerita.tingkat}
								</p>
							</div>
						</div>
					{/if}
				</div>

				<!-- Tombol Tutup -->
				<button
					type="button"
					onclick={() => (selectedBerita = null)}
					class="mt-5 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
				>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}
