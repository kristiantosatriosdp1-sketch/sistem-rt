<script lang="ts">
	import { enhance } from '$app/forms';
	import { STATUS_PERNIKAHAN_LABEL } from '$lib/validation/warga';
	import { KEPEMILIKAN_LABEL, STATUS_PENGHUNI_LABEL } from '$lib/validation/rumah';

	let { data, form } = $props();

	let activeTab = $state<'profil' | 'kependudukan' | 'keamanan'>('profil');
	let loadingAction = $state<string | null>(null);

	// Preview foto profil
	let fotoPreview = $state<string>('');
	let showPasswordLama = $state(false);
	let showPasswordBaru = $state(false);

	const profilValues = $derived(
		form?.tab === 'profil' && 'values' in form && form.values ? form.values : null
	);

	const profilErrors = $derived(
		form?.tab === 'profil' && 'errors' in form && form.errors ? form.errors : null
	);

	const passwordErrors = $derived(
		form?.tab === 'password' && 'errors' in form && form.errors ? form.errors : null
	);

	function handleFotoChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// Convert file to Base64 image
		const reader = new FileReader();
		reader.onload = (event) => {
			const res = event.target?.result as string;
			fotoPreview = res;
		};
		reader.readAsDataURL(file);
	}

	function formatTgl(isoStr: string | null) {
		if (!isoStr) return '-';
		return new Date(isoStr).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Profil Saya — Sistem RT</title>
</svelte:head>

<header class="bg-brand-600 px-4 pt-6 pb-8 text-white">
	<div class="flex items-center gap-3.5">
		<div class="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-white/20 text-xl font-bold shadow-inner">
			{#if fotoPreview || data.dataWarga?.fotoUrl}
				<img
					src={fotoPreview || data.dataWarga?.fotoUrl}
					alt="Foto Profil"
					class="h-full w-full object-cover"
				/>
			{:else}
				<span>👤</span>
			{/if}
		</div>
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-lg font-bold">
					{data.dataWarga?.namaLengkap ?? data.currentUser.username}
				</h1>
				<span class="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
					{data.currentUser.role.replace('_', ' ')}
				</span>
			</div>
			<p class="text-xs text-brand-100">
				@{data.currentUser.username}
				{#if data.dataWarga?.namaPanggilan}
					• Panggilan: "{data.dataWarga.namaPanggilan}"
				{/if}
			</p>
		</div>
	</div>
</header>

<main class="-mt-4 space-y-4 px-4">
	<!-- Alert Notifikasi Feedback -->
	{#if form?.success && 'message' in form && form?.message}
		<div class="rounded-2xl border border-green-200 bg-green-50 p-3.5 text-xs font-semibold text-green-800 shadow-sm">
			✅ {form.message}
		</div>
	{/if}
	{#if form && 'error' in form && form.error}
		<div class="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800 shadow-sm">
			⚠️ {form.error}
		</div>
	{/if}

	<!-- Tab Navigasi Profil -->
	<div class="flex rounded-2xl bg-gray-200/80 p-1 text-xs shadow-inner">
		<button
			onclick={() => (activeTab = 'profil')}
			class="flex-1 rounded-xl py-2 font-bold transition {activeTab === 'profil'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600 hover:text-gray-900'}"
		>
			✏️ Edit Profil
		</button>
		<button
			onclick={() => (activeTab = 'kependudukan')}
			class="flex-1 rounded-xl py-2 font-bold transition {activeTab === 'kependudukan'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600 hover:text-gray-900'}"
		>
			📋 Data Warga
		</button>
		<button
			onclick={() => (activeTab = 'keamanan')}
			class="flex-1 rounded-xl py-2 font-bold transition {activeTab === 'keamanan'
				? 'bg-white text-gray-900 shadow-sm'
				: 'text-gray-600 hover:text-gray-900'}"
		>
			🔐 Password
		</button>
	</div>

	<!-- ========================================================= -->
	<!-- TAB 1: EDIT PROFIL MANDIRI WARGA -->
	<!-- ========================================================= -->
	{#if activeTab === 'profil'}
		<section class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
			<div class="mb-3.5 flex items-center justify-between border-b border-gray-100 pb-2.5">
				<div>
					<h2 class="text-sm font-bold text-gray-900">Informasi Personal</h2>
					<p class="text-xs text-gray-500">Data berikut dapat Anda perbarui secara mandiri.</p>
				</div>
			</div>

			{#if !data.dataWarga}
				<div class="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
					ℹ️ Akun Anda belum ditautkan ke data induk kependudukan warga. Silakan hubungi Admin RT untuk penautan akun.
				</div>
			{:else}
				<form
					method="POST"
					action="?/updateProfil"
					use:enhance={() => {
						loadingAction = 'updateProfil';
						return async ({ update }) => {
							loadingAction = null;
							await update();
						};
					}}
					class="space-y-3.5"
				>
					<!-- Input Foto Profil -->
					<div>
						<label for="foto-input" class="text-xs font-semibold text-gray-800">Foto Profil</label>
						<div class="mt-1.5 flex items-center gap-3">
							<div class="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-100 text-2xl shadow-inner">
								{#if fotoPreview || data.dataWarga.fotoUrl}
									<img src={fotoPreview || data.dataWarga.fotoUrl} alt="Preview Foto" class="h-full w-full object-cover" />
								{:else}
									<span>👤</span>
								{/if}
							</div>
							<div class="flex-1 space-y-1">
								<input
									id="foto-input"
									type="file"
									accept="image/*"
									onchange={handleFotoChange}
									class="block w-full text-xs text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-brand-50 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
								/>
								<input type="hidden" name="fotoUrl" value={fotoPreview || data.dataWarga.fotoUrl || ''} />
								<p class="text-[10px] text-gray-400">Format: JPG, PNG, WebP (Maks. 2MB)</p>
							</div>
						</div>
					</div>

					<!-- Nama Panggilan -->
					<div>
						<label for="prof-panggilan" class="text-xs font-semibold text-gray-800">Nama Panggilan / Alias</label>
						<input
							id="prof-panggilan"
							name="namaPanggilan"
							type="text"
							placeholder="Misal: Mas Budi, Bu Dewi"
							value={profilValues?.namaPanggilan ?? data.dataWarga.namaPanggilan ?? ''}
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>

					<!-- Pekerjaan -->
					<div>
						<label for="prof-pekerjaan" class="text-xs font-semibold text-gray-800">Pekerjaan / Profesi</label>
						<input
							id="prof-pekerjaan"
							name="pekerjaan"
							type="text"
							placeholder="Misal: Karyawan Swasta, Wiraswasta, Dokter, Guru"
							value={profilValues?.pekerjaan ?? data.dataWarga.pekerjaan ?? ''}
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
					</div>

					<!-- No WhatsApp / HP -->
					<div>
						<label for="prof-nohp" class="text-xs font-semibold text-gray-800">Nomor WhatsApp / HP Aktif</label>
						<input
							id="prof-nohp"
							name="noHp"
							type="text"
							placeholder="08123456789"
							value={profilValues?.noHp ?? data.dataWarga.noHp ?? ''}
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
						/>
						{#if profilErrors?.noHp}
							<p class="mt-0.5 text-xs text-red-600">{profilErrors.noHp}</p>
						{/if}
						<p class="mt-1 text-[11px] text-gray-400">
							Nomor ini dipakai pengurus RT untuk mengirimkan notifikasi agenda & informasi penting.
						</p>
					</div>

					<button
						type="submit"
						disabled={loadingAction === 'updateProfil'}
						class="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 active:scale-95 disabled:opacity-60"
					>
						{loadingAction === 'updateProfil' ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
					</button>
				</form>
			{/if}
		</section>
	{/if}

	<!-- ========================================================= -->
	<!-- TAB 2: DATA KEPENDUDUKAN (READ-ONLY RESMI ADMIN RT) -->
	<!-- ========================================================= -->
	{#if activeTab === 'kependudukan'}
		<section class="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
			<div class="flex items-start justify-between border-b border-gray-100 pb-2.5">
				<div>
					<h2 class="text-sm font-bold text-gray-900">Data Kependudukan Resmi</h2>
					<p class="text-xs text-gray-500">Sesuai arsip Kartu Keluarga & KTP di RT.</p>
				</div>
				<span class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
					🔒 Terverifikasi Admin
				</span>
			</div>

			{#if !data.dataWarga}
				<div class="rounded-xl bg-gray-50 p-4 text-center text-xs text-gray-500">
					Belum ada data kependudukan yang terhubung dengan akun ini.
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
					<div class="rounded-xl bg-gray-50 p-2.5">
						<span class="text-gray-400">Nama Lengkap (KTP)</span>
						<p class="mt-0.5 font-bold text-gray-900">{data.dataWarga.namaLengkap}</p>
					</div>
					<div class="rounded-xl bg-gray-50 p-2.5">
						<span class="text-gray-400">NIK</span>
						<p class="mt-0.5 font-bold tracking-wider text-gray-900">{data.dataWarga.nik}</p>
					</div>
					<div class="rounded-xl bg-gray-50 p-2.5">
						<span class="text-gray-400">Nomor Kartu Keluarga (KK)</span>
						<p class="mt-0.5 font-bold tracking-wider text-gray-900">{data.dataWarga.noKk}</p>
					</div>
					<div class="rounded-xl bg-gray-50 p-2.5">
						<span class="text-gray-400">Jenis Kelamin</span>
						<p class="mt-0.5 font-bold text-gray-900">
							{data.dataWarga.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
						</p>
					</div>
					<div class="rounded-xl bg-gray-50 p-2.5">
						<span class="text-gray-400">Tanggal Lahir</span>
						<p class="mt-0.5 font-bold text-gray-900">{formatTgl(data.dataWarga.tanggalLahir)}</p>
					</div>
					<div class="rounded-xl bg-gray-50 p-2.5">
						<span class="text-gray-400">Status Pernikahan</span>
						<p class="mt-0.5 font-bold text-gray-900">
							{STATUS_PERNIKAHAN_LABEL[data.dataWarga.statusPernikahan] ?? data.dataWarga.statusPernikahan}
						</p>
					</div>
					<div class="sm:col-span-2 rounded-xl bg-gray-50 p-2.5">
						<span class="text-gray-400">Alamat Sesuai KTP</span>
						<p class="mt-0.5 font-semibold text-gray-800">{data.dataWarga.alamatKtp}</p>
					</div>
				</div>

				<!-- Hunian & Domisili RT -->
				<div class="border-t border-gray-100 pt-3">
					<h3 class="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">🏠 Domisili Rumah di RT</h3>
					{#if data.daftarHunian.length === 0}
						<p class="text-xs text-gray-400 italic">Belum terdaftar di data rumah RT.</p>
					{:else}
						<div class="space-y-2">
							{#each data.daftarHunian as h (h.id)}
								<div class="rounded-xl border border-gray-100 bg-gray-50/70 p-2.5 text-xs">
									<div class="flex items-center justify-between">
										<p class="font-bold text-gray-900">{h.alamat ?? '-'} {h.blokRt ? `(Blok ${h.blokRt})` : ''}</p>
										<span class="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
											{STATUS_PENGHUNI_LABEL[h.statusPenghuni] ?? h.statusPenghuni}
										</span>
									</div>
									<p class="mt-0.5 text-gray-500">
										Status Kepemilikan: {h.kepemilikan ? (KEPEMILIKAN_LABEL[h.kepemilikan] ?? h.kepemilikan) : '-'}
										{#if h.jangkaWaktu} • {h.jangkaWaktu}{/if}
									</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Keanggotaan Organisasi -->
				{#if data.daftarOrganisasi.length > 0}
					<div class="border-t border-gray-100 pt-3">
						<h3 class="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">🤝 Keanggotaan Organisasi / Paguyuban</h3>
						<div class="flex flex-wrap gap-2">
							{#each data.daftarOrganisasi as org (org.id)}
								<div class="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-1.5 text-xs text-blue-900">
									<span class="font-bold">{org.namaOrganisasi ?? '-'}</span>
									{#if org.jabatan}<span class="text-blue-700"> ({org.jabatan})</span>{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-2.5 text-[11px] text-gray-500">
					💡 <em>Jika terdapat kesalahan pada NIK, nama KTP, atau KK, silakan mengajukan koreksi data ke Sekretaris / Ketua RT.</em>
				</div>
			{/if}
		</section>
	{/if}

	<!-- ========================================================= -->
	<!-- TAB 3: KEAMANAN & GANTI PASSWORD -->
	<!-- ========================================================= -->
	{#if activeTab === 'keamanan'}
		<section class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
			<div class="mb-3.5 border-b border-gray-100 pb-2.5">
				<h2 class="text-sm font-bold text-gray-900">Keamanan Akun & Password</h2>
				<p class="text-xs text-gray-500">Ganti password secara berkala untuk menjaga keamanan akun Anda.</p>
			</div>

			<form
				method="POST"
				action="?/gantiPassword"
				use:enhance={() => {
					loadingAction = 'gantiPassword';
					return async ({ update }) => {
						loadingAction = null;
						await update();
					};
				}}
				class="space-y-3.5"
			>
				<div>
					<label for="pass-lama" class="text-xs font-semibold text-gray-800">Password Saat Ini *</label>
					<div class="relative mt-1">
						<input
							id="pass-lama"
							name="passwordLama"
							type={showPasswordLama ? 'text' : 'password'}
							required
							placeholder="Masukkan password lama Anda"
							class="w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-brand-500 focus:outline-none"
						/>
						<button
							type="button"
							onclick={() => (showPasswordLama = !showPasswordLama)}
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
						>
							{showPasswordLama ? '🙈' : '👁️'}
						</button>
					</div>
					{#if passwordErrors?.passwordLama}
						<p class="mt-0.5 text-xs text-red-600">{passwordErrors.passwordLama}</p>
					{/if}
				</div>

				<div>
					<label for="pass-baru" class="text-xs font-semibold text-gray-800">Password Baru *</label>
					<div class="relative mt-1">
						<input
							id="pass-baru"
							name="passwordBaru"
							type={showPasswordBaru ? 'text' : 'password'}
							required
							minlength="6"
							placeholder="Minimal 6 karakter"
							class="w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-brand-500 focus:outline-none"
						/>
						<button
							type="button"
							onclick={() => (showPasswordBaru = !showPasswordBaru)}
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
						>
							{showPasswordBaru ? '🙈' : '👁️'}
						</button>
					</div>
					{#if passwordErrors?.passwordBaru}
						<p class="mt-0.5 text-xs text-red-600">{passwordErrors.passwordBaru}</p>
					{/if}
				</div>

				<div>
					<label for="pass-konfirm" class="text-xs font-semibold text-gray-800">Konfirmasi Password Baru *</label>
					<input
						id="pass-konfirm"
						name="konfirmasiPasswordBaru"
						type="password"
						required
						placeholder="Ulangi password baru"
						class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
					/>
					{#if passwordErrors?.konfirmasiPasswordBaru}
						<p class="mt-0.5 text-xs text-red-600">{passwordErrors.konfirmasiPasswordBaru}</p>
					{/if}
				</div>

				<button
					type="submit"
					disabled={loadingAction === 'gantiPassword'}
					class="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-black active:scale-95 disabled:opacity-60"
				>
					{loadingAction === 'gantiPassword' ? 'Memproses...' : 'Ubah Password'}
				</button>
			</form>
		</section>
	{/if}
</main>
