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
		class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 pt-6 pb-5 text-white shadow-lg shadow-emerald-500/20"
	>
		<div class="flex items-center justify-between">
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

			<div class="flex items-center space-x-3">
				{#if data.user.role === "admin_rt"}
					<a
						href="/admin/akun"
						aria-label="Pengaturan"
						class="w-5 h-5 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition"
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
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							></path>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							></path>
						</svg>
					</a>
				{/if}

				<button
					aria-label="Notifikasi"
					class="w-5 h-5 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition"
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
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="w-5 h-5 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center backdrop-blur-md transition group"
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
					</button>
				</form>
			</div>
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
