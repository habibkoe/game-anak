<script lang="ts">
	import { authService } from '$lib/services/auth';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		if (!email || !password) {
			error = 'Email dan password harus diisi';
			return;
		}

		loading = true;
		error = '';

		try {
			await authService.signIn(email, password);
			goto('/admin');
		} catch (e: any) {
			error = e.message || 'Login gagal. Periksa email dan password Anda.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-400 to-purple-500">
	<div class="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl">
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-4xl font-bold text-gray-800">Selamat Datang! 👋</h1>
			<p class="text-gray-600">Masuk untuk mengelola konten game</p>
		</div>

		{#if error}
			<div class="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-xl">
				{error}
			</div>
		{/if}

		<form on:submit|preventDefault={handleLogin} class="space-y-6">
			<div>
				<label for="email" class="block mb-2 text-sm font-semibold text-gray-700">
					Email
				</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="nama@email.com"
					required
					class="w-full px-4 py-3 transition border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label for="password" class="block mb-2 text-sm font-semibold text-gray-700">
					Password
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					required
					class="w-full px-4 py-3 transition border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Masuk...' : 'Masuk'}
			</button>
		</form>

		<div class="mt-6 text-center">
			<p class="text-gray-600">
				Belum punya akun?
				<a href="/register" class="font-semibold text-blue-600 hover:underline">
					Daftar di sini
				</a>
			</p>
		</div>

		<div class="mt-4 text-center">
			<a href="/" class="text-sm text-gray-500 hover:text-gray-700">
				← Kembali ke Home
			</a>
		</div>
	</div>
</div>
