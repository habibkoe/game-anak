<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import "../app.css";
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabaseClient';

	let { children } = $props();

	onMount(() => {
		authStore.initialize();

		// Handle auth state changes (including email confirmations)
		const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN') {
				console.log('User signed in:', session?.user?.email);
			} else if (event === 'SIGNED_OUT') {
				console.log('User signed out');
			} else if (event === 'TOKEN_REFRESHED') {
				console.log('Token refreshed');
			} else if (event === 'USER_UPDATED') {
				console.log('User updated');
			}

			// Update the auth store
			authStore.set({
				user: session?.user ?? null,
				session: session ?? null,
				loading: false
			});
		});

		// Cleanup listener on unmount
		return () => {
			authListener?.subscription.unsubscribe();
		};
	});
</script>

<svelte:head>
	<title>Game Belajar Anak - Permainan Edukasi Anak</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
