<script lang="ts">
  import { onMount } from 'svelte';
  import { supabaseGame } from '$lib/services/supabaseGame';
  import type { Category } from '$lib/types/game';

  let categories = $state<Category[]>([]);
  let showForm = $state(false);
  let editingId = $state<string | null>(null);
  let loading = $state(false);
  let saving = $state(false);
  let groupCounts = $state<Map<string, number>>(new Map());
  
  let formData = $state({
    name: '',
    description: '',
    icon: '📚'
  });

  const iconOptions = ['📚', '🎯', '🐾', '🍎', '🏃', '🎨', '🔢', '🌈', '⚽', '🎵'];

  onMount(() => {
    loadCategories();
  });

  async function loadCategories() {
    loading = true;
    categories = await supabaseGame.getCategories();
    
    // Load group counts for each category
    const counts = new Map<string, number>();
    for (const category of categories) {
      const groups = await supabaseGame.getGroupsByCategory(category.id);
      counts.set(category.id, groups.length);
    }
    groupCounts = counts;
    
    loading = false;
  }

  function openForm(category?: Category) {
    if (category) {
      editingId = category.id;
      formData = {
        name: category.name,
        description: category.description || '',
        icon: category.icon || '📚'
      };
    } else {
      editingId = null;
      formData = { name: '', description: '', icon: '📚' };
    }
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingId = null;
    formData = { name: '', description: '', icon: '📚' };
  }

  async function saveCategory() {
    if (!formData.name.trim()) {
      alert('Nama kategori harus diisi!');
      return;
    }

    saving = true;

    if (editingId) {
      const success = await supabaseGame.updateCategory(editingId, {
        name: formData.name,
        description: formData.description,
        icon: formData.icon
      });
      
      if (!success) {
        alert('Gagal mengupdate kategori. Silakan coba lagi.');
        saving = false;
        return;
      }
    } else {
      const newCategory = await supabaseGame.addCategory({
        name: formData.name,
        description: formData.description,
        icon: formData.icon
      });
      
      if (!newCategory) {
        alert('Gagal menambahkan kategori. Silakan coba lagi.');
        saving = false;
        return;
      }
    }

    saving = false;
    await loadCategories();
    closeForm();
  }

  async function deleteCategory(id: string) {
    const groups = await supabaseGame.getGroupsByCategory(id);
    if (groups.length > 0) {
      const confirm = window.confirm(
        `Kategori ini memiliki ${groups.length} grup. Menghapus kategori akan menghapus semua grup dan kata terkait. Lanjutkan?`
      );
      if (!confirm) return;
    }

    const success = await supabaseGame.deleteCategory(id);
    if (success) {
      await loadCategories();
    } else {
      alert('Gagal menghapus kategori. Silakan coba lagi.');
    }
  }

  async function getGroupCount(categoryId: string): Promise<number> {
    const groups = await supabaseGame.getGroupsByCategory(categoryId);
    return groups.length;
  }
</script>

<div class="min-h-screen p-6">
  <div class="max-w-6xl mx-auto">
    <div class="p-6 mb-6 bg-white shadow-xl rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">📁 Kelola Kategori</h1>
          <p class="text-gray-600">Buat dan kelola kategori permainan</p>
        </div>
        <div class="flex gap-3">
          <a href="/admin" class="px-4 py-2 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600">
            ← Kembali
          </a>
          <button onclick={() => openForm()} class="px-4 py-2 font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600">
            + Tambah Kategori
          </button>
        </div>
      </div>
    </div>

    {#if categories.length === 0}
      <div class="p-12 text-center bg-white shadow-lg rounded-2xl">
        <div class="mb-4 text-6xl">📂</div>
        <h3 class="mb-2 text-2xl font-bold text-gray-800">Belum ada kategori</h3>
        <p class="mb-6 text-gray-600">Mulai dengan membuat kategori pertama Anda</p>
        <button onclick={() => openForm()} class="px-6 py-3 font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600">
          + Tambah Kategori
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each categories as category}
          <div class="p-6 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
            <div class="flex items-start justify-between mb-4">
              <div class="text-5xl">{category.icon || '📚'}</div>
              <div class="flex gap-2">
                <button onclick={() => openForm(category)} class="text-sm font-semibold text-blue-500 hover:text-blue-700">
                  ✏️
                </button>
                <button onclick={() => deleteCategory(category.id)} class="text-sm font-semibold text-red-500 hover:text-red-700">
                  🗑️
                </button>
              </div>
            </div>
            <h3 class="mb-2 text-xl font-bold text-gray-800">{category.name}</h3>
            <p class="mb-4 text-sm text-gray-600">{category.description || 'Tidak ada deskripsi'}</p>
            <div class="text-xs text-gray-500">
              {groupCounts.get(category.id) || 0} grup
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Modal Form -->
{#if showForm}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
      <h2 class="mb-4 text-2xl font-bold text-gray-800">
        {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">Icon</label>
          <div class="grid grid-cols-5 gap-2">
            {#each iconOptions as icon}
              <button
                onclick={() => formData.icon = icon}
                class="text-3xl p-2 rounded-lg border-2 hover:bg-gray-50 {formData.icon === icon ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}"
              >
                {icon}
              </button>
            {/each}
          </div>
        </div>

        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">Nama Kategori *</label>
          <input
            type="text"
            bind:value={formData.name}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Contoh: Aktivitas Sehari-hari"
          />
        </div>

        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">Deskripsi</label>
          <textarea
            bind:value={formData.description}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
            placeholder="Deskripsi kategori..."
          ></textarea>
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
          onclick={saveCategory} 
          disabled={saving}
          class="flex-1 py-2 font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : (editingId ? 'Simpan' : 'Tambah')}
        </button>
      </div>
    </div>
  </div>
{/if}
