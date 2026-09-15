<script lang="ts">
	import { enhance } from '$app/forms';
	import WargaForm from '$lib/components/WargaForm.svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Tambah Warga — Sistem RT</title>
</svelte:head>

<div class="px-4 py-4">
	<h1 class="mb-4 text-lg font-semibold text-gray-900">Tambah Warga</h1>

	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
		class="rounded-xl bg-white p-4 shadow-sm"
	>
		<WargaForm values={form?.values} errors={form?.errors} submitLabel="Simpan Warga" {loading} />
	</form>
</div>
