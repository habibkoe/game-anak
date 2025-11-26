<script lang="ts">
  import { onMount } from 'svelte';
  import { storage } from '$lib/services/storage';
  import type { Category } from '$lib/types/game';

  let categories = $state<Category[]>([]);
  let showForm = $state(false);
  let editingId = $state<string | null>(null);
  
  let formData = $state({
    name: '',
    description: '',
    icon: '📚'
  });

  const iconOptions = ['📚', '🎯', '🐾', '🍎', '🏃', '🎨', '🔢', '🌈', '⚽', '🎵'];

  onMount(() => {
    loadCategories();
  });

  function loadCategories() {
    categories = storage.getCategories();
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

  function saveCategory() {
    if (!formData.name.trim()) {
      alert('Nama kategori harus diisi!');
      return;
    }

    if (editingId) {
      storage.updateCategory(editingId, {
        name: formData.name,
        description: formData.description,
        icon: formData.icon
      });
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        createdAt: new Date()
      };
      storage.addCategory(newCategory);
    }

    loadCategories();
    closeForm();
  }

  function deleteCategory(id: string) {
    const groups = storage.getGroupsByCategory(id);
    if (groups.length > 0) {
      const confirm = window.confirm(
        `Kategori ini memiliki ${groups.length} grup. Menghapus kategori akan menghapus semua grup dan kata terkait. Lanjutkan?`
      );
      if (!confirm) return;
    }

    storage.deleteCategory(id);
    loadCategories();
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-6">
  <div class="max-w-6xl mx-auto">
    <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">📁 Kelola Kategori</h1>
          <p class="text-gray-600">Buat dan kelola kategori permainan</p>
        </div>
        <div class="flex gap-3">
          <a href="/admin" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold">
            ← Kembali
          </a>
          <button onclick={() => openForm()} class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold">
            + Tambah Kategori
          </button>
        </div>
      </div>
    </div>

    {#if categories.length === 0}
      <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="text-6xl mb-4">📂</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Belum ada kategori</h3>
        <p class="text-gray-600 mb-6">Mulai dengan membuat kategori pertama Anda</p>
        <button onclick={() => openForm()} class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold">
          + Tambah Kategori
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each categories as category}
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div class="text-5xl">{category.icon || '📚'}</div>
              <div class="flex gap-2">
                <button onclick={() => openForm(category)} class="text-blue-500 hover:text-blue-700 font-semibold text-sm">
                  ✏️
                </button>
                <button onclick={() => deleteCategory(category.id)} class="text-red-500 hover:text-red-700 font-semibold text-sm">
                  🗑️
                </button>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
            <p class="text-gray-600 text-sm mb-4">{category.description || 'Tidak ada deskripsi'}</p>
            <div class="text-xs text-gray-500">
              {storage.getGroupsByCategory(category.id).length} grup
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Modal Form -->
{#if showForm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
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
          <label class="block text-sm font-semibold text-gray-700 mb-2">Nama Kategori *</label>
          <input
            type="text"
            bind:value={formData.name}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Contoh: Aktivitas Sehari-hari"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
          <textarea
            bind:value={formData.description}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
            placeholder="Deskripsi kategori..."
          ></textarea>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button onclick={closeForm} class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold">
          Batal
        </button>
        <button onclick={saveCategory} class="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold">
          {editingId ? 'Simpan' : 'Tambah'}
        </button>
      </div>
    </div>
  </div>
{/if}
