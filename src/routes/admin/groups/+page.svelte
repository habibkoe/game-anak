<script lang="ts">
  import { onMount } from 'svelte';
  import { storage } from '$lib/services/storage';
  import type { Group, Category } from '$lib/types/game';

  let groups = $state<Group[]>([]);
  let categories = $state<Category[]>([]);
  let showForm = $state(false);
  let editingId = $state<string | null>(null);
  let selectedCategory = $state<string>('all');
  
  let formData = $state({
    name: '',
    categoryId: '',
    description: '',
    finalRewardText: '',
    finalRewardImage: ''
  });

  onMount(() => {
    loadData();
  });

  function loadData() {
    groups = storage.getGroups();
    categories = storage.getCategories();
  }

  let filteredGroups = $derived(selectedCategory === 'all' 
    ? groups 
    : groups.filter(g => g.categoryId === selectedCategory));

  function openForm(group?: Group) {
    if (group) {
      editingId = group.id;
      formData = {
        name: group.name,
        categoryId: group.categoryId,
        description: group.description || '',
        finalRewardText: group.finalRewardText,
        finalRewardImage: group.finalRewardImage || ''
      };
    } else {
      editingId = null;
      formData = { 
        name: '', 
        categoryId: categories[0]?.id || '', 
        description: '', 
        finalRewardText: '',
        finalRewardImage: ''
      };
    }
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingId = null;
  }

  function saveGroup() {
    if (!formData.name.trim() || !formData.categoryId || !formData.finalRewardText.trim()) {
      alert('Nama grup, kategori, dan reward akhir harus diisi!');
      return;
    }

    if (editingId) {
      storage.updateGroup(editingId, {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        finalRewardText: formData.finalRewardText,
        finalRewardImage: formData.finalRewardImage
      });
    } else {
      const newGroup: Group = {
        id: `group-${Date.now()}`,
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        finalRewardText: formData.finalRewardText,
        finalRewardImage: formData.finalRewardImage,
        createdAt: new Date()
      };
      storage.addGroup(newGroup);
    }

    loadData();
    closeForm();
  }

  function deleteGroup(id: string) {
    const words = storage.getWordsByGroup(id);
    if (words.length > 0) {
      const confirm = window.confirm(
        `Grup ini memiliki ${words.length} kata. Menghapus grup akan menghapus semua kata terkait. Lanjutkan?`
      );
      if (!confirm) return;
    }

    storage.deleteGroup(id);
    loadData();
  }

  function getCategoryName(categoryId: string): string {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  }

  function getCategoryIcon(categoryId: string): string {
    return categories.find(c => c.id === categoryId)?.icon || '📦';
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
  <div class="max-w-6xl mx-auto">
    <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">📦 Kelola Grup</h1>
          <p class="text-gray-600">Buat grup dengan reward akhir</p>
        </div>
        <div class="flex gap-3">
          <a href="/admin" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold">
            ← Kembali
          </a>
          <button 
            onclick={() => openForm()} 
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
            disabled={categories.length === 0}
          >
            + Tambah Grup
          </button>
        </div>
      </div>

      {#if categories.length > 0}
        <div class="flex gap-2 flex-wrap">
          <button
            onclick={() => selectedCategory = 'all'}
            class="px-4 py-2 rounded-lg font-semibold {selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
          >
            Semua ({groups.length})
          </button>
          {#each categories as category}
            <button
              onclick={() => selectedCategory = category.id}
              class="px-4 py-2 rounded-lg font-semibold {selectedCategory === category.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
            >
              {category.icon} {category.name} ({groups.filter(g => g.categoryId === category.id).length})
            </button>
          {/each}
        </div>
      {/if}
    </div>

    {#if categories.length === 0}
      <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="text-6xl mb-4">📁</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Buat kategori terlebih dahulu</h3>
        <p class="text-gray-600 mb-6">Anda perlu membuat kategori sebelum membuat grup</p>
        <a href="/admin/categories" class="inline-block bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold">
          Kelola Kategori
        </a>
      </div>
    {:else if filteredGroups.length === 0}
      <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="text-6xl mb-4">📦</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Belum ada grup</h3>
        <p class="text-gray-600 mb-6">Mulai dengan membuat grup pertama Anda</p>
        <button onclick={() => openForm()} class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
          + Tambah Grup
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each filteredGroups as group}
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-3xl">{getCategoryIcon(group.categoryId)}</span>
                <div>
                  <h3 class="text-xl font-bold text-gray-800">{group.name}</h3>
                  <p class="text-xs text-gray-500">{getCategoryName(group.categoryId)}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button onclick={() => openForm(group)} class="text-blue-500 hover:text-blue-700 font-semibold text-sm">
                  ✏️
                </button>
                <button onclick={() => deleteGroup(group.id)} class="text-red-500 hover:text-red-700 font-semibold text-sm">
                  🗑️
                </button>
              </div>
            </div>
            
            <p class="text-gray-600 text-sm mb-4">{group.description || 'Tidak ada deskripsi'}</p>
            
            <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 mb-3">
              <p class="text-xs font-semibold text-yellow-800 mb-1">🎁 REWARD AKHIR:</p>
              <p class="text-sm font-bold text-yellow-900">{group.finalRewardText}</p>
              {#if group.finalRewardImage}
                <p class="text-xs text-yellow-700 mt-1">🖼️ {group.finalRewardImage}</p>
              {/if}
            </div>

            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>{storage.getWordsByGroup(group.id).length} kata</span>
              <a href="/admin/words?group={group.id}" class="text-blue-500 hover:text-blue-700 font-semibold">
                Kelola Kata →
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Modal Form -->
{#if showForm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 my-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        {editingId ? 'Edit Grup' : 'Tambah Grup'}
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Kategori *</label>
          <select
            bind:value={formData.categoryId}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih kategori</option>
            {#each categories as category}
              <option value={category.id}>{category.icon} {category.name}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Nama Grup *</label>
          <input
            type="text"
            bind:value={formData.name}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Level 1 - Mudah"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
          <textarea
            bind:value={formData.description}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Deskripsi grup..."
          ></textarea>
        </div>

        <div class="border-t pt-4">
          <h3 class="font-bold text-gray-800 mb-3">🎁 Reward Akhir</h3>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nama Reward *</label>
            <input
              type="text"
              bind:value={formData.finalRewardText}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Mobil Lego"
            />
            <p class="text-xs text-gray-500 mt-1">Reward yang akan ditampilkan setelah menyelesaikan semua kata</p>
          </div>

          <div class="mt-3">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Gambar Reward (opsional)</label>
            <input
              type="text"
              bind:value={formData.finalRewardImage}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/images/lego-car.png"
            />
            <p class="text-xs text-gray-500 mt-1">URL atau path gambar reward</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button onclick={closeForm} class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold">
          Batal
        </button>
        <button onclick={saveGroup} class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold">
          {editingId ? 'Simpan' : 'Tambah'}
        </button>
      </div>
    </div>
  </div>
{/if}
