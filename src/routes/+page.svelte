<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { authService } from '$lib/services/auth';
  import { goto } from '$app/navigation';

  let user = $derived($authStore.user);
  let loading = $derived($authStore.loading);

  async function handleLogout() {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
</script>

<svelte:head>
  <title>Game Belajar Anak - Permainan Edukasi Anak Interaktif</title>
  <meta name="description" content="Permainan interaktif untuk mengajarkan anak-anak membaca dengan gambar dan suara. Banyak kategori, hadiah menarik, dan menggunakan teknologi speech recognition." />
</svelte:head>

<div class="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
  <div class="w-full max-w-2xl">
    <!-- Main Card -->
    <div class="p-8 text-center bg-white shadow-2xl rounded-3xl md:p-12">
      <div class="mb-6 text-7xl">🎮</div>
      <h1 class="mb-4 text-5xl font-bold text-gray-800">Game Belajar Anak</h1>
      <p class="mb-8 text-xl text-gray-600">
        Permainan interaktif untuk mengajarkan anak-anak membaca dengan gambar dan suara
      </p>

      <!-- Auth Status -->
      {#if !loading}
        {#if user}
          <div class="p-4 mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
            <p class="text-sm text-gray-600">Selamat datang kembali,</p>
            <p class="text-lg font-bold text-gray-800">{user.email}</p>
            <button
              onclick={handleLogout}
              class="px-4 py-2 mt-2 text-sm font-semibold text-white transition bg-red-500 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        {:else}
          <div class="p-4 mb-6 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50">
            <p class="mb-3 text-sm text-gray-700">
              <strong>Mode Preview:</strong> Anda dapat mencoba 1 grup dengan 5 contoh soal.
              Untuk akses penuh, silakan masuk atau daftar!
            </p>
            <div class="flex gap-2">
              <a
                href="/login"
                class="flex-1 px-4 py-2 font-semibold text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Masuk
              </a>
              <a
                href="/register"
                class="flex-1 px-4 py-2 font-semibold text-white transition bg-purple-500 rounded-lg hover:bg-purple-600"
              >
                Daftar
              </a>
            </div>
          </div>
        {/if}
      {/if}

      <!-- Main Action Buttons -->
      <div class="mb-8 space-y-4">
        <a 
          href="/select"
          class="block w-full px-8 py-4 text-2xl font-bold text-white transition-all transform shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl hover:shadow-xl hover:scale-105"
        >
          🎯 {user ? 'Mulai Bermain' : 'Coba Sekarang (Preview)'}
        </a>
        
        {#if user}
          <a 
            href="/admin"
            class="block w-full px-8 py-4 text-xl font-bold text-white transition-all transform shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl hover:shadow-xl hover:scale-105"
          >
            ⚙️ Admin Panel
          </a>
        {/if}
      </div>

      <!-- Features -->
      <div class="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
        <div class="p-4 bg-blue-50 rounded-xl">
          <div class="mb-2 text-3xl">📚</div>
          <h3 class="mb-1 font-bold text-gray-800">Banyak Kategori</h3>
          <p class="text-sm text-gray-600">Anda dapat mengelompokkan kata atau kalimat berdasarkan tema</p>
        </div>
        
        <div class="p-4 bg-green-50 rounded-xl">
          <div class="mb-2 text-3xl">🎁</div>
          <h3 class="mb-1 font-bold text-gray-800">Hadiah Menarik</h3>
          <p class="text-sm text-gray-600">Anda bisa menentukan sendiri hadiah untuk setiap groupnya</p>
        </div>
        
        <div class="p-4 bg-purple-50 rounded-xl">
          <div class="mb-2 text-3xl">🎤</div>
          <h3 class="mb-1 font-bold text-gray-800">Belajar Membaca</h3>
          <p class="text-sm text-gray-600">Menggunakan teknologi speech recognition</p>
        </div>
      </div>
    </div>

    <!-- Info Card -->
    <div class="p-6 mt-6 text-center bg-white shadow-lg bg-opacity-90 rounded-2xl">
      <p class="text-gray-600">
        <strong>Catatan:</strong> Pastikan mikrofon pada browser anda telah diaktifkan
      </p>
    </div>
  </div>
</div>
