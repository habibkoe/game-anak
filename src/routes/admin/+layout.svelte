<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { authService } from '$lib/services/auth';

	let { children } = $props();
	let loading = $state(true);
	let user = $derived($authStore.user);

	onMount(() => {
		// Check if user is authenticated
		const checkAuth = async () => {
			try {
				const currentUser = await authService.getUser();
				if (!currentUser) {
					goto('/login');
					return;
				}
				loading = false;
			} catch (error) {
				goto('/login');
			}
		};

		checkAuth();
	});

	async function handleLogout() {
		try {
			await authService.signOut();
			goto('/');
		} catch (error) {
			console.error('Logout error:', error);
		}
	}
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
		<div class="text-center">
			<div class="inline-block w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
			<p class="mt-4 text-gray-600">Memuat...</p>
		</div>
	</div>
{:else if user}
	<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
		<!-- Header with user info and logout -->
		<header class="bg-white shadow-sm">
			<div class="container px-4 py-4 mx-auto">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-2xl font-bold text-gray-800">Panel Admin</h1>
						<p class="text-sm text-gray-600">Kelola konten game Anda</p>
					</div>
					<div class="flex items-center gap-4">
						<div class="text-right">
							<p class="text-sm font-semibold text-gray-800">{user.email}</p>
							<p class="text-xs text-gray-500">Admin</p>
						</div>
						<button
							onclick={handleLogout}
							class="px-4 py-2 text-sm font-semibold text-white transition bg-red-500 rounded-lg hover:bg-red-600"
						>
							Logout
						</button>
					</div>
				</div>
			</div>
		</header>

		<!-- Admin content -->
		<main class="container px-4 py-8 mx-auto">
			{@render children()}
		</main>
	</div>
{/if}
