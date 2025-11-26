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

<div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">🎮 Pilih Permainan</h1>
      <p class="text-gray-600">Pilih kategori dan grup untuk mulai belajar</p>
      <div class="flex gap-3 justify-center mt-4">
        <a href="/" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold">
          ← Kembali
        </a>
        <a href="/admin" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold">
          ⚙️ Admin Panel
        </a>
      </div>
    </div>

    {#if categories.length === 0}
      <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="text-6xl mb-4">📦</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Belum ada konten</h3>
        <p class="text-gray-600 mb-6">Silakan tambahkan kategori dan grup melalui admin panel</p>
        <a href="/admin" class="inline-block bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold">
          Buka Admin Panel
        </a>
      </div>
    {:else}
      <!-- Category Filter -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">📁 Pilih Kategori</h2>
        <div class="flex gap-3 flex-wrap">
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
        <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div class="text-6xl mb-4">📦</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">Tidak ada grup di kategori ini</h3>
          <p class="text-gray-600">Pilih kategori lain atau tambahkan grup melalui admin panel</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredGroups as group}
            {@const category = categories.find(c => c.id === group.categoryId)}
            {@const wordsCount = getWordsCount(group.id)}
            <button
              onclick={() => selectGroup(group.id)}
              disabled={wordsCount === 0}
              class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="text-5xl">{category?.icon || '📦'}</div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-800">{group.name}</h3>
                  <p class="text-sm text-gray-500">{category?.name || 'Unknown'}</p>
                </div>
              </div>

              {#if group.description}
                <p class="text-gray-600 text-sm mb-4">{group.description}</p>
              {/if}

              <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 mb-4">
                <p class="text-xs font-semibold text-yellow-800 mb-1">🎁 REWARD AKHIR:</p>
                <p class="text-sm font-bold text-yellow-900">{group.finalRewardText}</p>
              </div>

              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">
                  📝 {wordsCount} kata
                </span>
                {#if wordsCount > 0}
                  <span class="bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
                    Mulai →
                  </span>
                {:else}
                  <span class="bg-gray-300 text-gray-600 px-4 py-2 rounded-full font-semibold">
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
