<script lang="ts">
	import { enhance } from '$app/forms';
	import RumahForm from '$lib/components/RumahForm.svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Tambah Rumah — Sistem RT</title>
</svelte:head>

<div class="px-4 py-4">
	<h1 class="mb-4 text-lg font-semibold text-gray-900">Tambah Rumah</h1>

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
		<RumahForm values={form?.values} errors={form?.errors} submitLabel="Simpan Rumah" {loading} />
	</form>
</div>
