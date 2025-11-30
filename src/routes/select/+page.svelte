<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { supabaseStorage } from '$lib/services/supabaseStorage';
  import type { Category, Group } from '$lib/types/game';

  let user = $derived($authStore.user);
  let categories = $state<Category[]>([]);
  let groups = $state<Group[]>([]);
  let groupWordCounts = $state<Record<string, number>>({});
  let publicContent = $state<any>(null);
  let selectedCategory = $state<string | null>(null);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      if (user) {
        // Load user's own content
        categories = await supabaseStorage.getCategories();
        groups = await supabaseStorage.getGroups();
        
        // Load word counts for each group
        for (const group of groups) {
          try {
            const words = await supabaseStorage.getWordsByGroup(group.id);
            groupWordCounts[group.id] = words.length;
          } catch {
            groupWordCounts[group.id] = 0;
          }
        }
      } else {
        // Load public preview content
        publicContent = await supabaseStorage.getPublicContent();
      }
    } catch (e: any) {
      error = 'Gagal memuat data: ' + e.message;
      console.error('Error loading content:', e);
    } finally {
      loading = false;
    }
  });

  let filteredGroups = $derived(
    selectedCategory 
      ? groups.filter(g => g.categoryId === selectedCategory)
      : groups
  );

  function selectGroup(groupId: string) {
    goto(`/play?group=${groupId}`);
  }

  function selectPublicPreview() {
    goto(`/play?preview=true`);
  }

  function getDifficultyBadge(difficulty: 'easy' | 'medium' | 'hard') {
    const badges = {
      easy: { text: 'Mudah', color: 'bg-green-100 text-green-800', icon: '⭐' },
      medium: { text: 'Sedang', color: 'bg-yellow-100 text-yellow-800', icon: '⭐⭐' },
      hard: { text: 'Sulit', color: 'bg-red-100 text-red-800', icon: '⭐⭐⭐' }
    };
    return badges[difficulty];
  }
</script>

<svelte:head>
  <title>Pilih Permainan - Game Belajar Anak</title>
  <meta name="description" content="Pilih kategori dan grup permainan untuk mulai belajar membaca. Berbagai pilihan tema dan level untuk anak-anak." />
</svelte:head>

<div class="min-h-screen p-6" style="background-image: url('/assets/bg-garden.svg'); background-size: cover; background-position: center; background-attachment: fixed;">
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

    {#if loading}
      <div class="flex items-center justify-center p-12">
        <div class="text-center">
          <div class="inline-block w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p class="mt-4 text-gray-600">Memuat konten...</p>
        </div>
      </div>
    {:else if !user && publicContent}
      <!-- Preview Mode Content -->
      <div class="p-6 mb-6 border-2 border-yellow-400 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50">
        <h2 class="mb-2 text-xl font-bold text-gray-800">🎯 Mode Preview</h2>
        <p class="mb-4 text-sm text-gray-700">
          Anda dapat mencoba 1 grup dengan {publicContent.words.length} contoh soal.
          <a href="/register" class="font-semibold text-blue-600 hover:underline">Daftar sekarang</a> untuk membuat konten sendiri!
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <button
          onclick={selectPublicPreview}
          class="p-6 text-left transition-all bg-white shadow-lg rounded-2xl hover:shadow-2xl hover:scale-105"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="text-5xl">🎮</div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-800">{publicContent.groupName}</h3>
              <p class="text-sm text-gray-500">{publicContent.categoryName}</p>
            </div>
          </div>

          {#if publicContent.groupDescription}
            <p class="mb-4 text-sm text-gray-600">{publicContent.groupDescription}</p>
          {/if}

          <div class="p-3 mb-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
            <p class="mb-1 text-xs font-semibold text-yellow-800">🎁 REWARD AKHIR:</p>
            <p class="text-sm font-bold text-yellow-900">{publicContent.finalRewardText}</p>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">
              📝 {publicContent.words.length} kata
            </span>
            <span class="px-4 py-2 font-semibold text-white bg-green-500 rounded-full">
              Coba Sekarang →
            </span>
          </div>
        </button>
      </div>
    {:else if categories.length === 0}
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
            {@const wordsCount = groupWordCounts[group.id] || 0}
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

              <div class="flex items-center gap-2 mb-3">
                <span class="px-2 py-1 text-xs font-semibold rounded-full {getDifficultyBadge(group.difficulty).color}">
                  {getDifficultyBadge(group.difficulty).icon} {getDifficultyBadge(group.difficulty).text}
                </span>
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
