<script lang="ts">
	import { enhance } from '$app/forms';
	import KategoriKasForm from '$lib/components/KategoriKasForm.svelte';
	import { TIPE_KAS_LABEL } from '$lib/validation/kas';
	import { formatRupiah } from '$lib/format';

	let { data, form } = $props();

	let mode = $state<'lihat' | 'edit'>('lihat');
	let showTambahTransaksi = $state(false);
	let loadingAction = $state<string | null>(null);
	let confirmHapus = $state(false);

	const saldo = $derived(Number(data.ringkasan.totalMasuk) - Number(data.ringkasan.totalKeluar));

	const editValues = $derived(
		(form?.tab === 'edit' && form?.values && 'nama' in form.values ? form.values : null) ?? {
			nama: data.kategori.nama,
			tipe: data.kategori.tipe,
			organisasiId: data.kategori.organisasiId ?? '',
			nominalDefault: data.kategori.nominalDefault ?? '',
			namaOrganisasi: data.kategori.namaOrganisasi ?? ''
		}
	);

	const transaksiValues = $derived(
		form?.tab === 'transaksi' && form?.values && 'jumlah' in form.values ? form.values : null
	);

	const transaksiErrors = $derived(
		form?.tab === 'transaksi' && form?.errors ? form.errors : null
	);

	function formatTanggal(d: string) {
		return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	$effect(() => {
		if (form?.tab === 'edit' && form?.success) mode = 'lihat';
		if (form?.tab === 'transaksi' && form?.success) showTambahTransaksi = false;
	});
</script>

<svelte:head>
	<title>{data.kategori.nama} — Sistem RT</title>
</svelte:head>

<div class="space-y-4 px-4 py-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-900">{mode === 'lihat' ? 'Detail Kas' : 'Edit Kategori'}</h1>
		<button type="button" onclick={() => (mode = mode === 'lihat' ? 'edit' : 'lihat')} class="text-sm text-brand-600">
			{mode === 'lihat' ? 'Edit' : 'Batal'}
		</button>
	</div>

	{#if mode === 'lihat'}
		<div class="rounded-xl bg-brand-600 p-4 text-white shadow-sm">
			<p class="text-sm font-medium">{data.kategori.nama}</p>
			<p class="text-xs text-brand-50 opacity-90">
				{TIPE_KAS_LABEL[data.kategori.tipe]}{#if data.kategori.namaOrganisasi}· {data.kategori.namaOrganisasi}{:else}·
					Kas Umum RT{/if}
			</p>
			<p class="mt-2 text-2xl font-semibold">{formatRupiah(saldo)}</p>
			<div class="mt-2 flex gap-4 text-xs text-brand-50 opacity-90">
				<span>Masuk: {formatRupiah(data.ringkasan.totalMasuk)}</span>
				<span>Keluar: {formatRupiah(data.ringkasan.totalKeluar)}</span>
			</div>
			{#if data.kategori.nominalDefault}
				<p class="mt-1 text-xs text-brand-50 opacity-75">
					Nominal default: {formatRupiah(data.kategori.nominalDefault)}
				</p>
			{/if}
		</div>

		<!-- Buku Kas -->
		<div class="rounded-xl bg-white p-4 shadow-sm">
			<div class="mb-2 flex items-center justify-between">
				<h2 class="text-sm font-semibold text-gray-700">Buku Kas (50 transaksi terbaru)</h2>
				<button type="button" onclick={() => (showTambahTransaksi = !showTambahTransaksi)} class="text-sm text-brand-600">
					{showTambahTransaksi ? 'Tutup' : '+ Tambah'}
				</button>
			</div>

			{#if showTambahTransaksi}
				<form
					method="POST"
					action="?/tambahTransaksi"
					use:enhance={() => {
						loadingAction = 'tambah';
						return async ({ update }) => {
							await update();
							loadingAction = null;
						};
					}}
					class="mb-3 space-y-2 rounded-lg border border-gray-100 p-3"
				>
					<div class="grid grid-cols-2 gap-2">
						<select name="jenis" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
							<option value="masuk">Pemasukan</option>
							<option value="keluar">Pengeluaran</option>
						</select>
						<input
							name="jumlah"
							type="number"
							min="1"
							step="500"
							placeholder="Jumlah (Rp)"
							required
							value={transaksiValues?.jumlah ?? ''}
							class="w-full rounded-lg border px-3 py-2 text-sm {transaksiErrors?.jumlah
								? 'border-red-400'
								: 'border-gray-300'}"
						/>
					</div>
					{#if transaksiErrors?.jumlah}<p class="text-xs text-red-600">{transaksiErrors.jumlah}</p>{/if}

					<input
						name="tanggal"
						type="date"
						required
						value={transaksiValues?.tanggal ?? new Date().toISOString().slice(0, 10)}
						class="w-full rounded-lg border px-3 py-2 text-sm {transaksiErrors?.tanggal
							? 'border-red-400'
							: 'border-gray-300'}"
					/>

					<input
						name="keterangan"
						type="text"
						placeholder="Keterangan (opsional)"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
					/>

					<div class="grid grid-cols-2 gap-2">
						<select name="wargaId" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
							<option value="">Warga (opsional)</option>
							{#each data.semuaWarga as w (w.id)}
								<option value={w.id}>{w.namaLengkap}</option>
							{/each}
						</select>
						<select name="rumahId" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
							<option value="">Rumah (opsional)</option>
							{#each data.semuaRumah as r (r.id)}
								<option value={r.id}>{r.alamat}</option>
							{/each}
						</select>
					</div>

					<button
						type="submit"
						disabled={loadingAction === 'tambah'}
						class="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white disabled:opacity-60"
					>
						{loadingAction === 'tambah' ? 'Menyimpan...' : 'Simpan Transaksi'}
					</button>
				</form>
			{/if}

			<div class="space-y-2">
				{#each data.daftarTransaksi as t (t.id)}
					<div class="flex items-start justify-between rounded-lg border border-gray-100 p-3">
						<div>
							<p class="text-sm text-gray-800">{t.keterangan || (t.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran')}</p>
							<p class="mt-0.5 text-xs text-gray-400">
								{formatTanggal(t.tanggal)}
								{#if t.namaWarga}· {t.namaWarga}{/if}
								{#if t.alamatRumah}· {t.alamatRumah}{/if}
							</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-medium {t.jenis === 'masuk' ? 'text-green-600' : 'text-red-600'}">
								{t.jenis === 'masuk' ? '+' : '-'}{formatRupiah(t.jumlah)}
							</p>
							<form
								method="POST"
								action="?/hapusTransaksi"
								use:enhance={() => {
									loadingAction = `hapus-${t.id}`;
									return async ({ update }) => {
										await update();
										loadingAction = null;
									};
								}}
							>
								<input type="hidden" name="transaksiId" value={t.id} />
								<button
									type="submit"
									disabled={loadingAction === `hapus-${t.id}`}
									class="mt-1 text-xs text-gray-400 underline disabled:opacity-60"
								>
									Hapus
								</button>
							</form>
						</div>
					</div>
				{:else}
					<p class="text-sm text-gray-400">Belum ada transaksi.</p>
				{/each}
			</div>
		</div>

		<div class="rounded-xl bg-white p-4 shadow-sm">
			{#if !confirmHapus}
				<button type="button" onclick={() => (confirmHapus = true)} class="text-sm text-red-600">
					Hapus kategori kas ini
				</button>
			{:else}
				<p class="mb-2 text-sm text-gray-600">
					Yakin hapus <strong>{data.kategori.nama}</strong>? Semua transaksi di dalamnya ikut terhapus. Tindakan
					ini tidak bisa dibatalkan.
				</p>
				<div class="flex gap-2">
					<form method="POST" action="?/hapusKategori">
						<button type="submit" class="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white">Ya, Hapus</button>
					</form>
					<button
						type="button"
						onclick={() => (confirmHapus = false)}
						class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600"
					>
						Batal
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				loadingAction = 'edit';
				return async ({ update }) => {
					await update();
					loadingAction = null;
				};
			}}
			class="rounded-xl bg-white p-4 shadow-sm"
		>
			<KategoriKasForm
				values={editValues}
				errors={form?.errors}
				submitLabel="Simpan Perubahan"
				loading={loadingAction === 'edit'}
				kunciOrganisasi={true}
			/>
		</form>
	{/if}
</div>
