<script lang="ts">
	import { page } from "$app/stores";

	let { children, data } = $props();

	const navItems = [
		{
			href: "/",
			label: "Beranda",
			icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 10.5 12 3l9 7.5"/>
				<path d="M5 9.5V21h14V9.5"/>
				<path d="M9 21v-6h6v6"/>
			</svg>`,
		},
		{
			href: "/warga",
			label: "Warga",
			icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
				<circle cx="9" cy="7" r="4"/>
				<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
				<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
			</svg>`,
		},
		{
			href: "/kas",
			label: "Kas",
			icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="2" y="5" width="20" height="14" rx="2"/>
				<path d="M2 10h20"/>
				<circle cx="12" cy="14" r="2"/>
			</svg>`,
		},
		{
			href: "/profil",
			label: "Profil",
			icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="8" r="4"/>
				<path d="M4 21a8 8 0 0 1 16 0"/>
			</svg>`,
		},
	];
</script>

<div class="min-h-screen bg-gray-50 pb-20">
	<div
		class="flex items-center justify-between bg-white px-4 py-2 text-xs text-gray-500 shadow-sm"
	>
		<span
			>Masuk sebagai <a
				href="/profil"
				class="font-bold text-brand-700 hover:underline"
				>{data.user.username}</a
			>
			({data.user.role})</span
		>
		<div class="flex items-center gap-3">
			<a
				href="/profil"
				class="font-medium text-gray-700 hover:text-brand-600">Profil</a
			>
			{#if data.user.role === "admin_rt"}
				<a href="/admin/akun" class="text-brand-600">Kelola Akun</a>
			{/if}
			<form method="POST" action="/logout">
				<button type="submit" class="text-red-600">Keluar</button>
			</form>
		</div>
	</div>

	{@render children()}
</div>

<nav
	class="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-gray-200 bg-white py-2 pb-[env(safe-area-inset-bottom)]"
>
	{#each navItems as item (item.href)}
		<a
			href={item.href}
			class="flex flex-1 flex-col items-center gap-0.5 px-3 py-1 text-xs transition
				{$page.url.pathname === item.href
				? 'font-medium text-emerald-600'
				: 'text-gray-500 hover:text-emerald-500'}"
		>
			<span class="flex h-5 w-5 items-center justify-center">
				{@html item.icon}
			</span>

			<span>{item.label}</span>
		</a>
	{/each}
</nav>
