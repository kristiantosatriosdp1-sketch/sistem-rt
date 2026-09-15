<script lang="ts">
	import { page } from '$app/stores';

	let { children, data } = $props();

	const navItems = [
		{ href: '/', label: 'Beranda', icon: '🏠' },
		{ href: '/warga', label: 'Warga', icon: '👥' },
		{ href: '/kas', label: 'Kas', icon: '💰' },
		{ href: '/informasi', label: 'Info', icon: '📋' },
		{ href: '/profil', label: 'Profil', icon: '👤' }
	];
</script>

<div class="min-h-screen bg-gray-50 pb-20">
	<div class="flex items-center justify-between bg-white px-4 py-2 text-xs text-gray-500 shadow-sm">
		<span>Masuk sebagai <a href="/profil" class="font-bold text-brand-700 hover:underline">{data.user.username}</a> ({data.user.role})</span>
		<div class="flex items-center gap-3">
			<a href="/profil" class="font-medium text-gray-700 hover:text-brand-600">Profil</a>
			{#if data.user.role === 'admin_rt'}
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
	class="fixed inset-x-0 bottom-0 flex justify-around border-t border-gray-200 bg-white py-2 pb-[env(safe-area-inset-bottom)]"
>
	{#each navItems as item (item.href)}
		<a
			href={item.href}
			class="flex flex-col items-center gap-0.5 px-3 py-1 text-xs {$page.url.pathname === item.href
				? 'text-brand-600 font-medium'
				: 'text-gray-500'}"
		>
			<span class="text-lg">{item.icon}</span>
			{item.label}
		</a>
	{/each}
</nav>
