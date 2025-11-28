<script lang="ts">
  import { onMount } from 'svelte';
  import { supabaseGame } from '$lib/services/supabaseGame';
  import type { Group, Category } from '$lib/types/game';
  import ImageUploader from '$lib/components/ImageUploader.svelte';

  let groups = $state<Group[]>([]);
  let categories = $state<Category[]>([]);
  let showForm = $state(false);
  let editingId = $state<string | null>(null);
  let selectedCategory = $state<string>('all');
  let loading = $state(false);
  let saving = $state(false);
  let wordCounts = $state<Map<string, number>>(new Map());
  
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

  async function loadData() {
    loading = true;
    groups = await supabaseGame.getGroups();
    categories = await supabaseGame.getCategories();
    
    // Load word counts for each group
    const counts = new Map<string, number>();
    for (const group of groups) {
      const words = await supabaseGame.getWordsByGroup(group.id);
      counts.set(group.id, words.length);
    }
    wordCounts = counts;
    
    loading = false;
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

  async function saveGroup() {
    if (!formData.name.trim() || !formData.categoryId || !formData.finalRewardText.trim()) {
      alert('Nama grup, kategori, dan reward akhir harus diisi!');
      return;
    }

    saving = true;

    if (editingId) {
      const success = await supabaseGame.updateGroup(editingId, {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        finalRewardText: formData.finalRewardText,
        finalRewardImage: formData.finalRewardImage
      });
      
      if (!success) {
        alert('Gagal mengupdate grup. Silakan coba lagi.');
        saving = false;
        return;
      }
    } else {
      const newGroup = await supabaseGame.addGroup({
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        finalRewardText: formData.finalRewardText,
        finalRewardImage: formData.finalRewardImage
      });
      
      if (!newGroup) {
        alert('Gagal menambahkan grup. Silakan coba lagi.');
        saving = false;
        return;
      }
    }

    saving = false;
    await loadData();
    closeForm();
  }

  async function deleteGroup(id: string) {
    const words = await supabaseGame.getWordsByGroup(id);
    if (words.length > 0) {
      const confirm = window.confirm(
        `Grup ini memiliki ${words.length} kata. Menghapus grup akan menghapus semua kata terkait. Lanjutkan?`
      );
      if (!confirm) return;
    }

    const success = await supabaseGame.deleteGroup(id);
    if (success) {
      await loadData();
    } else {
      alert('Gagal menghapus grup. Silakan coba lagi.');
    }
  }

  function getCategoryName(categoryId: string): string {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  }

  function getCategoryIcon(categoryId: string): string {
    return categories.find(c => c.id === categoryId)?.icon || '📦';
  }
</script>

<div class="min-h-screen p-6">
  <div class="max-w-6xl mx-auto">
    <div class="p-6 mb-6 bg-white shadow-xl rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">📦 Kelola Grup</h1>
          <p class="text-gray-600">Buat grup dengan reward akhir</p>
        </div>
        <div class="flex gap-3">
          <a href="/admin" class="px-4 py-2 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600">
            ← Kembali
          </a>
          <button 
            onclick={() => openForm()} 
            class="px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            disabled={categories.length === 0}
          >
            + Tambah Grup
          </button>
        </div>
      </div>

      {#if categories.length > 0}
        <div class="flex flex-wrap gap-2">
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
      <div class="p-12 text-center bg-white shadow-lg rounded-2xl">
        <div class="mb-4 text-6xl">📁</div>
        <h3 class="mb-2 text-2xl font-bold text-gray-800">Buat kategori terlebih dahulu</h3>
        <p class="mb-6 text-gray-600">Anda perlu membuat kategori sebelum membuat grup</p>
        <a href="/admin/categories" class="inline-block px-6 py-3 font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600">
          Kelola Kategori
        </a>
      </div>
    {:else if filteredGroups.length === 0}
      <div class="p-12 text-center bg-white shadow-lg rounded-2xl">
        <div class="mb-4 text-6xl">📦</div>
        <h3 class="mb-2 text-2xl font-bold text-gray-800">Belum ada grup</h3>
        <p class="mb-6 text-gray-600">Mulai dengan membuat grup pertama Anda</p>
        <button onclick={() => openForm()} class="px-6 py-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
          + Tambah Grup
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        {#each filteredGroups as group}
          <div class="p-6 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-3xl">{getCategoryIcon(group.categoryId)}</span>
                <div>
                  <h3 class="text-xl font-bold text-gray-800">{group.name}</h3>
                  <p class="text-xs text-gray-500">{getCategoryName(group.categoryId)}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button onclick={() => openForm(group)} class="text-sm font-semibold text-blue-500 hover:text-blue-700">
                  ✏️
                </button>
                <button onclick={() => deleteGroup(group.id)} class="text-sm font-semibold text-red-500 hover:text-red-700">
                  🗑️
                </button>
              </div>
            </div>
            
            <p class="mb-4 text-sm text-gray-600">{group.description || 'Tidak ada deskripsi'}</p>
            
            <div class="p-3 mb-3 border-2 border-yellow-200 rounded-lg bg-yellow-50">
              <p class="mb-1 text-xs font-semibold text-yellow-800">🎁 REWARD AKHIR:</p>
              <p class="text-sm font-bold text-yellow-900">{group.finalRewardText}</p>
              {#if group.finalRewardImage}
                <p class="mt-1 text-xs text-yellow-700">🖼️ {group.finalRewardImage}</p>
              {/if}
            </div>

            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{wordCounts.get(group.id) || 0} kata</span>
              <a href="/admin/words?group={group.id}" class="font-semibold text-blue-500 hover:text-blue-700">
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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-50">
    <div class="w-full max-w-md p-6 my-8 bg-white shadow-2xl rounded-2xl">
      <h2 class="mb-4 text-2xl font-bold text-gray-800">
        {editingId ? 'Edit Grup' : 'Tambah Grup'}
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">Kategori *</label>
          <select
            bind:value={formData.categoryId}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih kategori</option>
            {#each categories as category}
              <option value={category.id}>{category.icon} {category.name}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">Nama Grup *</label>
          <input
            type="text"
            bind:value={formData.name}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Level 1 - Mudah"
          />
        </div>

        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">Deskripsi</label>
          <textarea
            bind:value={formData.description}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Deskripsi grup..."
          ></textarea>
        </div>

        <div class="pt-4 border-t">
          <h3 class="mb-3 font-bold text-gray-800">🎁 Reward Akhir</h3>
          
          <div>
            <label class="block mb-2 text-sm font-semibold text-gray-700">Nama Reward *</label>
            <input
              type="text"
              bind:value={formData.finalRewardText}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Mobil Lego"
            />
            <p class="mt-1 text-xs text-gray-500">Reward yang akan ditampilkan setelah menyelesaikan semua kata</p>
          </div>

          <div class="mt-3">
            <label class="block mb-2 text-sm font-semibold text-gray-700">Gambar Reward (opsional)</label>
            <ImageUploader
              currentImageUrl={formData.finalRewardImage}
              onImageUploaded={(url) => formData.finalRewardImage = url}
              folder="rewards"
              aspectRatio={4/3}
            />
            <p class="mt-2 text-xs text-gray-500">Upload gambar reward atau masukkan URL manual di bawah</p>
            <input
              type="text"
              bind:value={formData.finalRewardImage}
              class="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/images/lego-car.png"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button 
          onclick={closeForm} 
          disabled={saving}
          class="flex-1 py-2 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          Batal
        </button>
        <button 
          onclick={saveGroup} 
          disabled={saving}
          class="flex-1 py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : (editingId ? 'Simpan' : 'Tambah')}
        </button>
      </div>
    </div>
  </div>
{/if}
