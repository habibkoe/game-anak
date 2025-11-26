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

<div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-6">
  <div class="max-w-7xl mx-auto">
    <div class="bg-white rounded-2xl shadow-xl p-8 mb-6">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">🎮 Admin Panel</h1>
      <p class="text-gray-600">Kelola konten permainan untuk anak-anak</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{categories.length}</h3>
            <p class="text-gray-600">Kategori</p>
          </div>
          <div class="text-4xl">📁</div>
        </div>
        <a href="/admin/categories" class="block w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg text-center font-semibold">
          Kelola Kategori
        </a>
      </div>

      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{groups.length}</h3>
            <p class="text-gray-600">Grup</p>
          </div>
          <div class="text-4xl">📦</div>
        </div>
        <a href="/admin/groups" class="block w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-center font-semibold">
          Kelola Grup
        </a>
      </div>

      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{words.length}</h3>
            <p class="text-gray-600">Kata/Kalimat</p>
          </div>
          <div class="text-4xl">📝</div>
        </div>
        <a href="/admin/words" class="block w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-center font-semibold">
          Kelola Kata
        </a>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">🎯 Quick Actions</h2>
        <div class="space-y-3">
          <a href="/" class="block w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg text-center font-semibold">
            ▶️ Mainkan Game
          </a>
          <a href="/select" class="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-center font-semibold">
            📚 Pilih Kategori & Grup
          </a>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">ℹ️ Informasi</h2>
        <div class="text-gray-600 space-y-2 text-sm">
          <p><strong>Kategori:</strong> Kelompok besar konten (misalnya: Aktivitas, Hewan, dll)</p>
          <p><strong>Grup:</strong> Kumpulan kata dalam satu kategori dengan reward akhir</p>
          <p><strong>Kata:</strong> Teks yang harus dibaca anak dengan gambar pendukung</p>
        </div>
      </div>
    </div>
  </div>
</div>
