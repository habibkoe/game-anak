<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';

	let status = $state<'processing' | 'success' | 'error'>('processing');
	let errorMessage = $state('');

	onMount(async () => {
		try {
			// Get the hash params from the URL
			const hashParams = new URLSearchParams(window.location.hash.substring(1));
			
			// Check for errors in the callback
			if (hashParams.get('error')) {
				errorMessage = hashParams.get('error_description') || 'Authentication failed';
				status = 'error';
				return;
			}

			// Check if we have tokens in the hash
			const accessToken = hashParams.get('access_token');
			const refreshToken = hashParams.get('refresh_token');

			if (accessToken) {
				// Supabase client will automatically pick up the session from the URL hash
				// Give it a moment to process
				await new Promise(resolve => setTimeout(resolve, 500));
				
				// Verify the session was established
				const { data: { session }, error } = await supabase.auth.getSession();
				
				if (error) {
					throw error;
				}

				if (session) {
					status = 'success';
					// Redirect to home page after successful confirmation
					setTimeout(() => {
						goto('/');
					}, 1500);
				} else {
					throw new Error('Failed to establish session');
				}
			} else {
				throw new Error('No authentication tokens found');
			}
		} catch (err) {
			console.error('Auth callback error:', err);
			errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
			status = 'error';
		}
	});
</script>

<div class="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
	<div class="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl">
		{#if status === 'processing'}
			<div class="text-center">
				<div class="inline-block w-16 h-16 mb-4 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin"></div>
				<h2 class="mb-2 text-2xl font-bold text-gray-800">Memverifikasi Email...</h2>
				<p class="text-gray-600">Mohon tunggu sebentar</p>
			</div>
		{:else if status === 'success'}
			<div class="text-center">
				<div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
					<svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
					</svg>
				</div>
				<h2 class="mb-2 text-2xl font-bold text-gray-800">Email Terverifikasi! ✓</h2>
				<p class="mb-4 text-gray-600">Akun Anda berhasil diverifikasi</p>
				<p class="text-sm text-gray-500">Mengalihkan ke halaman utama...</p>
			</div>
		{:else}
			<div class="text-center">
				<div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full">
					<svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</div>
				<h2 class="mb-2 text-2xl font-bold text-gray-800">Verifikasi Gagal</h2>
				<p class="mb-4 text-red-600">{errorMessage}</p>
				<button
					onclick={() => goto('/login')}
					class="px-6 py-2 font-bold text-white transition-colors bg-purple-500 rounded-lg hover:bg-purple-600"
				>
					Kembali ke Login
				</button>
			</div>
		{/if}
	</div>
</div>
