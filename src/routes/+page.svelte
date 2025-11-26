<script lang="ts">
  import { onMount } from "svelte";
  import { storage } from "$lib/services/storage";

  onMount(() => {
    storage.initializeDefaultData();
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
  <div class="max-w-2xl w-full">
    <!-- Main Card -->
    <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
      <div class="text-7xl mb-6">🎮</div>
      <h1 class="text-5xl font-bold text-gray-800 mb-4">Game Belajar Bicara</h1>
      <p class="text-xl text-gray-600 mb-8">
        Permainan interaktif untuk mengajarkan anak-anak berbicara dengan gambar dan suara
      </p>

      <!-- Main Action Buttons -->
      <div class="space-y-4 mb-8">
        <a 
          href="/select"
          class="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-8 rounded-2xl text-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          🎯 Mulai Bermain
        </a>
        
        <a 
          href="/admin"
          class="block w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 px-8 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          ⚙️ Admin Panel
        </a>
      </div>

      <!-- Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        <div class="bg-blue-50 p-4 rounded-xl">
          <div class="text-3xl mb-2">📚</div>
          <h3 class="font-bold text-gray-800 mb-1">Banyak Kategori</h3>
          <p class="text-sm text-gray-600">Kelompokkan kata berdasarkan tema</p>
        </div>
        
        <div class="bg-green-50 p-4 rounded-xl">
          <div class="text-3xl mb-2">🎁</div>
          <h3 class="font-bold text-gray-800 mb-1">Reward Menarik</h3>
          <p class="text-sm text-gray-600">Setiap grup punya reward spesial</p>
        </div>
        
        <div class="bg-purple-50 p-4 rounded-xl">
          <div class="text-3xl mb-2">🎤</div>
          <h3 class="font-bold text-gray-800 mb-1">Belajar Bicara</h3>
          <p class="text-sm text-gray-600">Menggunakan teknologi speech recognition</p>
        </div>
      </div>
    </div>

    <!-- Info Card -->
    <div class="mt-6 bg-white bg-opacity-90 rounded-2xl shadow-lg p-6 text-center">
      <p class="text-gray-600">
        <strong>Catatan:</strong> Pastikan mikrofon browser sudah diizinkan untuk pengalaman terbaik
      </p>
    </div>
  </div>
</div>
