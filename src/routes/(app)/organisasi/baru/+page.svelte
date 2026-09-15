<script lang="ts">
	import { enhance } from '$app/forms';
	import OrganisasiForm from '$lib/components/OrganisasiForm.svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Tambah Organisasi — Sistem RT</title>
</svelte:head>

<div class="px-4 py-4">
	<h1 class="mb-4 text-lg font-semibold text-gray-900">Tambah Organisasi</h1>

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
		<OrganisasiForm values={form?.values} errors={form?.errors} submitLabel="Simpan Organisasi" {loading} />
	</form>
</div>
