<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { storage } from '$lib/services/storage';
  import type { Category, Group } from '$lib/types/game';

  let categories = $state<Category[]>([]);
  let groups = $state<Group[]>([]);
  let selectedCategory = $state<string | null>(null);

  onMount(() => {
    storage.initializeDefaultData();
    categories = storage.getCategories();
    groups = storage.getGroups();
  });

  let filteredGroups = $derived(
    selectedCategory 
      ? groups.filter(g => g.categoryId === selectedCategory)
      : groups
  );

  function selectGroup(groupId: string) {
    goto(`/play?group=${groupId}`);
  }

  function getWordsCount(groupId: string): number {
    return storage.getWordsByGroup(groupId).length;
  }
</script>

<svelte:head>
  <title>Pilih Permainan - Game Belajar Membaca</title>
  <meta name="description" content="Pilih kategori dan grup permainan untuk mulai belajar membaca. Berbagai pilihan tema dan level untuk anak-anak." />
</svelte:head>

<div class="min-h-screen p-6 bg-gradient-to-br from-blue-100 to-purple-100">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="p-8 mb-6 text-center bg-white shadow-xl rounded-2xl">
      <h1 class="mb-2 text-4xl font-bold text-gray-800">🎮 Pilih Permainan</h1>
      <p class="text-gray-600">Pilih kategori dan grup untuk mulai belajar</p>
      <div class="flex justify-center gap-3 mt-4">
        <a href="/" class="px-4 py-2 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600">
          ← Kembali
        </a>
        <a href="/admin" class="px-4 py-2 font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600">
          ⚙️ Admin Panel
        </a>
      </div>
    </div>

    {#if categories.length === 0}
      <div class="p-12 text-center bg-white shadow-lg rounded-2xl">
        <div class="mb-4 text-6xl">📦</div>
        <h3 class="mb-2 text-2xl font-bold text-gray-800">Belum ada konten</h3>
        <p class="mb-6 text-gray-600">Silakan tambahkan kategori dan grup melalui admin panel</p>
        <a href="/admin" class="inline-block px-6 py-3 font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600">
          Buka Admin Panel
        </a>
      </div>
    {:else}
      <!-- Category Filter -->
      <div class="p-6 mb-6 bg-white shadow-lg rounded-2xl">
        <h2 class="mb-4 text-xl font-bold text-gray-800">📁 Pilih Kategori</h2>
        <div class="flex flex-wrap gap-3">
          <button
            onclick={() => selectedCategory = null}
            class="px-6 py-3 rounded-lg font-semibold {selectedCategory === null ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
          >
            Semua Kategori
          </button>
          {#each categories as category}
            <button
              onclick={() => selectedCategory = category.id}
              class="px-6 py-3 rounded-lg font-semibold {selectedCategory === category.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
            >
              {category.icon} {category.name}
            </button>
          {/each}
        </div>
      </div>

      <!-- Groups Grid -->
      {#if filteredGroups.length === 0}
        <div class="p-12 text-center bg-white shadow-lg rounded-2xl">
          <div class="mb-4 text-6xl">📦</div>
          <h3 class="mb-2 text-2xl font-bold text-gray-800">Tidak ada grup di kategori ini</h3>
          <p class="text-gray-600">Pilih kategori lain atau tambahkan grup melalui admin panel</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each filteredGroups as group}
            {@const category = categories.find(c => c.id === group.categoryId)}
            {@const wordsCount = getWordsCount(group.id)}
            <button
              onclick={() => selectGroup(group.id)}
              disabled={wordsCount === 0}
              class="p-6 text-left transition-all bg-white shadow-lg rounded-2xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="text-5xl">{category?.icon || '📦'}</div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-800">{group.name}</h3>
                  <p class="text-sm text-gray-500">{category?.name || 'Unknown'}</p>
                </div>
              </div>

              {#if group.description}
                <p class="mb-4 text-sm text-gray-600">{group.description}</p>
              {/if}

              <div class="p-3 mb-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                <p class="mb-1 text-xs font-semibold text-yellow-800">🎁 REWARD AKHIR:</p>
                <p class="text-sm font-bold text-yellow-900">{group.finalRewardText}</p>
              </div>

              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">
                  📝 {wordsCount} kata
                </span>
                {#if wordsCount > 0}
                  <span class="px-4 py-2 font-semibold text-white bg-green-500 rounded-full">
                    Mulai →
                  </span>
                {:else}
                  <span class="px-4 py-2 font-semibold text-gray-600 bg-gray-300 rounded-full">
                    Belum ada kata
                  </span>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>
