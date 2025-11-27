<script lang="ts">
  import { onMount } from 'svelte';
  import { storage } from '$lib/services/storage';
  import type { Category, Group, GameWord } from '$lib/types/game';

  let categories = $state<Category[]>([]);
  let groups = $state<Group[]>([]);
  let words = $state<GameWord[]>([]);

  onMount(() => {
    storage.initializeDefaultData();
    loadData();
  });

  function loadData() {
    categories = storage.getCategories();
    groups = storage.getGroups();
    words = storage.getWords();
  }
</script>

<svelte:head>
  <title>Admin Panel - Game Belajar Membaca</title>
  <meta name="description" content="Panel administrasi untuk mengelola kategori, grup, dan kata-kata dalam game belajar membaca. Atur konten permainan edukasi anak." />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen p-6 bg-gradient-to-br from-purple-100 to-blue-100">
  <div class="mx-auto max-w-7xl">
    <div class="p-8 mb-6 bg-white shadow-xl rounded-2xl">
      <h1 class="mb-2 text-4xl font-bold text-gray-800">🎮 Admin Panel</h1>
      <p class="text-gray-600">Kelola konten permainan untuk anak-anak</p>
    </div>

    <div class="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
      <div class="p-6 bg-white shadow-lg rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{categories.length}</h3>
            <p class="text-gray-600">Kategori</p>
          </div>
          <div class="text-4xl">📁</div>
        </div>
        <a href="/admin/categories" class="block w-full py-2 font-semibold text-center text-white bg-purple-500 rounded-lg hover:bg-purple-600">
          Kelola Kategori
        </a>
      </div>

      <div class="p-6 bg-white shadow-lg rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{groups.length}</h3>
            <p class="text-gray-600">Grup</p>
          </div>
          <div class="text-4xl">📦</div>
        </div>
        <a href="/admin/groups" class="block w-full py-2 font-semibold text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600">
          Kelola Grup
        </a>
      </div>

      <div class="p-6 bg-white shadow-lg rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{words.length}</h3>
            <p class="text-gray-600">Kata/Kalimat</p>
          </div>
          <div class="text-4xl">📝</div>
        </div>
        <a href="/admin/words" class="block w-full py-2 font-semibold text-center text-white bg-green-500 rounded-lg hover:bg-green-600">
          Kelola Kata
        </a>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div class="p-6 bg-white shadow-lg rounded-2xl">
        <h2 class="mb-4 text-2xl font-bold text-gray-800">🎯 Quick Actions</h2>
        <div class="space-y-3">
          <a href="/" class="block w-full py-3 font-semibold text-center text-white bg-green-500 rounded-lg hover:bg-green-600">
            ▶️ Mainkan Game
          </a>
          <a href="/select" class="block w-full py-3 font-semibold text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600">
            📚 Pilih Kategori & Grup
          </a>
        </div>
      </div>

      <div class="p-6 bg-white shadow-lg rounded-2xl">
        <h2 class="mb-4 text-2xl font-bold text-gray-800">ℹ️ Informasi</h2>
        <div class="space-y-2 text-sm text-gray-600">
          <p><strong>Kategori:</strong> Kelompok besar konten (misalnya: Aktivitas, Hewan, dll)</p>
          <p><strong>Grup:</strong> Kumpulan kata dalam satu kategori dengan reward akhir</p>
          <p><strong>Kata:</strong> Teks yang harus dibaca anak dengan gambar pendukung</p>
        </div>
      </div>
    </div>
  </div>
</div>
