<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let showBuatForm = $state(false);
	let loadingAction = $state<string | null>(null);

	const roleLabel: Record<string, string> = {
		admin_rt: 'Admin RT',
		pengurus: 'Pengurus',
		warga: 'Warga'
	};

	function formatTanggal(d: string | Date) {
		return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			// clipboard API mungkin tidak tersedia (http non-secure di LAN) — biarkan user copy manual
		}
	}
</script>

<svelte:head>
	<title>Kelola Akun — Sistem RT</title>
</svelte:head>

<div class="space-y-4 px-4 py-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-900">Kelola Akun</h1>
		<button
			type="button"
			onclick={() => (showBuatForm = !showBuatForm)}
			class="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
		>
			{showBuatForm ? 'Tutup' : '+ Akun Baru'}
		</button>
	</div>

	<!-- Password hasil buat akun / reset, ditampilkan sekali saja -->
	{#if form?.success && (form.createdPassword || form.resetPassword)}
		{@const username = form.createdUsername ?? form.resetUsername}
		{@const password = form.createdPassword ?? form.resetPassword}
		<div class="rounded-xl border border-amber-300 bg-amber-50 p-4">
			<p class="mb-2 text-sm font-medium text-amber-900">
				{form.createdPassword ? 'Akun dibuat' : 'Password direset'} — catat sekarang, tidak akan
				ditampilkan lagi:
			</p>
			<div class="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
				<span class="font-mono">{username} / {password}</span>
				<button
					type="button"
					onclick={() => copyToClipboard(`${username} / ${password}`)}
					class="ml-2 shrink-0 text-brand-600">Salin</button
				>
			</div>
		</div>
	{/if}

	{#if form?.message && !form?.success}
		<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{form.message}</p>
	{/if}

	<!-- Form buat akun baru -->
	{#if showBuatForm}
		<form
			method="POST"
			action="?/buatAkun"
			use:enhance={() => {
				loadingAction = 'buat';
				return async ({ update }) => {
					await update();
					loadingAction = null;
					showBuatForm = false;
				};
			}}
			class="space-y-3 rounded-xl bg-white p-4 shadow-sm"
		>
			<div>
				<label for="username" class="mb-1 block text-sm font-medium text-gray-700">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					required
					placeholder="misal: budi.rt03"
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
				/>
			</div>

			<div>
				<label for="wargaId" class="mb-1 block text-sm font-medium text-gray-700"
					>Tautkan ke data warga (opsional)</label
				>
				<select
					id="wargaId"
					name="wargaId"
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
				>
					<option value="">— Tidak ditautkan —</option>
					{#each data.daftarWarga as w (w.id)}
						<option value={w.id}>{w.namaLengkap}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="role" class="mb-1 block text-sm font-medium text-gray-700">Role</label>
				<select
					id="role"
					name="role"
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
				>
					<option value="warga">Warga</option>
					<option value="pengurus">Pengurus</option>
					<option value="admin_rt">Admin RT</option>
				</select>
			</div>

			<p class="text-xs text-gray-400">Password awal dibuat otomatis dan ditampilkan setelah akun dibuat.</p>

			<button
				type="submit"
				disabled={loadingAction === 'buat'}
				class="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white disabled:opacity-60"
			>
				{loadingAction === 'buat' ? 'Menyimpan...' : 'Buat Akun'}
			</button>
		</form>
	{/if}

	<!-- Daftar akun -->
	<div class="space-y-2">
		{#each data.daftarUser as u (u.id)}
			<div class="rounded-xl bg-white p-4 shadow-sm">
				<div class="flex items-start justify-between">
					<div>
						<p class="text-sm font-medium text-gray-900">{u.username}</p>
						{#if u.namaWarga}
							<p class="text-xs text-gray-400">{u.namaWarga}</p>
						{/if}
						<p class="mt-0.5 text-xs text-gray-400">Dibuat {formatTanggal(u.createdAt)}</p>
					</div>
					<span
						class="rounded-full px-2 py-0.5 text-xs font-medium {u.isActive
							? 'bg-green-100 text-green-700'
							: 'bg-gray-100 text-gray-500'}"
					>
						{u.isActive ? 'Aktif' : 'Nonaktif'}
					</span>
				</div>

				<div class="mt-3 flex flex-wrap items-center gap-2">
					<!-- Ubah role -->
					<form
						method="POST"
						action="?/ubahRole"
						use:enhance={() => {
							loadingAction = `role-${u.id}`;
							return async ({ update }) => {
								await update();
								loadingAction = null;
							};
						}}
					>
						<input type="hidden" name="userId" value={u.id} />
						<select
							name="role"
							value={u.role}
							disabled={loadingAction === `role-${u.id}`}
							onchange={(e) => e.currentTarget.form?.requestSubmit()}
							class="rounded-lg border border-gray-300 px-2 py-1 text-xs"
						>
							<option value="warga">Warga</option>
							<option value="pengurus">Pengurus</option>
							<option value="admin_rt">Admin RT</option>
						</select>
					</form>

					<!-- Toggle aktif/nonaktif -->
					<form
						method="POST"
						action="?/toggleAktif"
						use:enhance={() => {
							loadingAction = `toggle-${u.id}`;
							return async ({ update }) => {
								await update();
								loadingAction = null;
							};
						}}
					>
						<input type="hidden" name="userId" value={u.id} />
						<input type="hidden" name="isActive" value={u.isActive} />
						<button
							type="submit"
							disabled={loadingAction === `toggle-${u.id}`}
							class="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600 disabled:opacity-60"
						>
							{u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
						</button>
					</form>

					<!-- Reset password -->
					<form
						method="POST"
						action="?/resetPassword"
						use:enhance={() => {
							loadingAction = `reset-${u.id}`;
							return async ({ update }) => {
								await update();
								loadingAction = null;
							};
						}}
					>
						<input type="hidden" name="userId" value={u.id} />
						<input type="hidden" name="username" value={u.username} />
						<button
							type="submit"
							disabled={loadingAction === `reset-${u.id}`}
							class="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600 disabled:opacity-60"
						>
							Reset Password
						</button>
					</form>
				</div>
			</div>
		{:else}
			<p class="py-8 text-center text-sm text-gray-400">Belum ada akun.</p>
		{/each}
	</div>
</div>
