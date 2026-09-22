<script lang="ts">
	import { KEPEMILIKAN_LABEL } from "$lib/validation/rumah";

	let { data } = $props();
</script>

<svelte:head>
	<title>Data Rumah — Sistem RT</title>
</svelte:head>

<div class="px-4 mt-6">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-900">Data Rumah</h1>
		{#if data.user.role === "admin_rt"}
			<a
				href="/rumah/baru"
				class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
			>
				+ Tambah
			</a>
		{/if}
	</div>

	<!-- Total Rumah -->
	<div class="rounded-xl bg-white p-4 shadow-sm mt-4">
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
						d="M4 20h16M6 20V9l6-5 6 5v11M9 20v-6h6v6M9 10h.01M12 10h.01M15 10h.01"
					/>
				</svg>
			</div>

			<div class="min-w-0">
				<div class="flex items-center gap-2">
					<p
						class="text-3xl font-extrabold text-gray-900 leading-none"
					>
						{data.statistikRumah.total}
					</p>

					<div class="flex flex-col">
						<span
							class="text-xs font-semibold text-gray-700 leading-tight"
						>
							Total Rumah
						</span>
						<span
							class="text-xs font-normal text-gray-500 leading-tight"
						>
							di Seluruh Lingkungan RT
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="grid grid-cols-2 gap-3 mt-3 mb-5">
		<!-- Rumah Dihuni -->
		<div class="flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm">
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
						d="M4 20h16M6 20V9l6-5 6 5v11M9 20v-6h6v6M9 10h.01M12 10h.01M15 10h.01"
					/>
				</svg>
			</div>

			<div class="min-w-0">
				<div class="flex items-center gap-2">
					<p
						class="text-3xl font-extrabold text-gray-900 leading-none"
					>
						{data.statistikRumah.dihuni}
					</p>

					<div class="flex flex-col">
						<span
							class="text-xs font-semibold text-gray-700 leading-tight"
						>
							Rumah
						</span>
						<span
							class="text-xs font-normal text-gray-500 leading-tight"
						>
							Dihuni
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Rumah Kosong -->
		<div class="flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm">
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
						d="M4 20h16M6 20V9l6-5 6 5v11M9 20v-6h6v6M9 10h.01M12 10h.01M15 10h.01"
					/>
				</svg>
			</div>

			<div class="min-w-0">
				<div class="flex items-center gap-2">
					<p
						class="text-3xl font-extrabold text-gray-900 leading-none"
					>
						{data.statistikRumah.kosong}
					</p>

					<div class="flex flex-col">
						<span
							class="text-xs font-semibold text-gray-700 leading-tight"
						>
							Rumah
						</span>
						<span
							class="text-xs font-normal text-gray-500 leading-tight"
						>
							Tak dihuni
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<form method="GET" class="flex gap-2 mb-3 mt-5">
		<input
			type="search"
			name="q"
			value={data.q}
			placeholder="Cari alamat..."
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
		/>
	</form>

	<div class="space-y-2">
		{#each data.daftarRumah as r (r.id)}
			<a
				href="/rumah/{r.id}"
				class="block rounded-xl bg-emerald-50 p-4 shadow-sm"
			>
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-900">
							{r.alamat}
						</p>
						<p class="mt-0.5 text-xs text-gray-400">
							{KEPEMILIKAN_LABEL[r.kepemilikan]}
							{#if r.blokRt}· {r.blokRt}{/if}
							· {r.jumlahPenghuniAktif} penghuni aktif
						</p>
					</div>
					<span class="text-gray-300">›</span>
				</div>
			</a>
		{:else}
			<p class="py-8 text-center text-sm text-gray-400">
				{data.q
					? "Tidak ada rumah yang cocok dengan pencarian."
					: "Belum ada data rumah."}
			</p>
		{/each}
	</div>
</div>
