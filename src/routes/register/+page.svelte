<script lang="ts">
	import { authService } from '$lib/services/auth';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let error = '';
	let success = '';
	let loading = false;

	async function handleRegister() {
		if (!email || !password || !confirmPassword) {
			error = 'Semua field harus diisi';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Password tidak cocok';
			return;
		}

		if (password.length < 6) {
			error = 'Password minimal 6 karakter';
			return;
		}

		loading = true;
		error = '';
		success = '';

		try {
			await authService.signUp(email, password);
			success = 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.';
			
			// Redirect to login after a short delay
			setTimeout(() => {
				goto('/login');
			}, 3000);
		} catch (e: any) {
			error = e.message || 'Registrasi gagal. Silakan coba lagi.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-400 to-pink-500">
	<div class="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl">
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-4xl font-bold text-gray-800">Daftar Akun Baru 🎮</h1>
			<p class="text-gray-600">Buat akun untuk mengelola konten game</p>
		</div>

		{#if error}
			<div class="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-xl">
				{error}
			</div>
		{/if}

		{#if success}
			<div class="px-4 py-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded-xl">
				{success}
			</div>
		{/if}

		<form on:submit|preventDefault={handleRegister} class="space-y-6">
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
					class="w-full px-4 py-3 transition border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
					placeholder="Minimal 6 karakter"
					required
					class="w-full px-4 py-3 transition border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label for="confirmPassword" class="block mb-2 text-sm font-semibold text-gray-700">
					Konfirmasi Password
				</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					placeholder="Ketik ulang password"
					required
					class="w-full px-4 py-3 transition border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Mendaftar...' : 'Daftar'}
			</button>
		</form>

		<div class="mt-6 text-center">
			<p class="text-gray-600">
				Sudah punya akun?
				<a href="/login" class="font-semibold text-purple-600 hover:underline">
					Masuk di sini
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
