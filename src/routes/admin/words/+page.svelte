<script lang="ts">
  import { onMount } from 'svelte';
  import { storage } from '$lib/services/storage';
  import type { GameWord, Group, Category } from '$lib/types/game';

  let words = $state<GameWord[]>([]);
  let groups = $state<Group[]>([]);
  let categories = $state<Category[]>([]);
  let showForm = $state(false);
  let editingId = $state<string | null>(null);
  let selectedGroup = $state<string>('all');
  
  let formData = $state({
    text: '',
    imageSrc: '',
    groupId: '',
    order: 1
  });

  // Check URL parameters for pre-selected group
  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const groupParam = params.get('group');
    if (groupParam) {
      selectedGroup = groupParam;
    }
    loadData();
  });

  function loadData() {
    words = storage.getWords();
    groups = storage.getGroups();
    categories = storage.getCategories();
  }

  let filteredWords = $derived(selectedGroup === 'all' 
    ? words 
    : words.filter(w => w.groupId === selectedGroup).sort((a, b) => a.order - b.order));

  function openForm(word?: GameWord) {
    if (word) {
      editingId = word.id;
      formData = {
        text: word.text,
        imageSrc: word.imageSrc,
        groupId: word.groupId,
        order: word.order
      };
    } else {
      editingId = null;
      const targetGroup = selectedGroup !== 'all' ? selectedGroup : groups[0]?.id || '';
      const existingWords = targetGroup ? storage.getWordsByGroup(targetGroup) : [];
      formData = { 
        text: '', 
        imageSrc: '',
        groupId: targetGroup,
        order: existingWords.length + 1
      };
    }
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingId = null;
  }

  function saveWord() {
    if (!formData.text.trim() || !formData.groupId || !formData.imageSrc.trim()) {
      alert('Teks, grup, dan gambar harus diisi!');
      return;
    }

    if (editingId) {
      storage.updateWord(editingId, {
        text: formData.text,
        imageSrc: formData.imageSrc,
        groupId: formData.groupId,
        order: formData.order
      });
    } else {
      const newWord: GameWord = {
        id: `word-${Date.now()}`,
        text: formData.text,
        imageSrc: formData.imageSrc,
        groupId: formData.groupId,
        order: formData.order
      };
      storage.addWord(newWord);
    }

    loadData();
    closeForm();
  }

  function deleteWord(id: string) {
    if (window.confirm('Apakah Anda yakin ingin menghapus kata ini?')) {
      storage.deleteWord(id);
      loadData();
    }
  }

  function moveWord(word: GameWord, direction: 'up' | 'down') {
    const groupWords = storage.getWordsByGroup(word.groupId);
    const currentIndex = groupWords.findIndex(w => w.id === word.id);
    
    if (direction === 'up' && currentIndex > 0) {
      const prevWord = groupWords[currentIndex - 1];
      storage.updateWord(word.id, { order: prevWord.order });
      storage.updateWord(prevWord.id, { order: word.order });
    } else if (direction === 'down' && currentIndex < groupWords.length - 1) {
      const nextWord = groupWords[currentIndex + 1];
      storage.updateWord(word.id, { order: nextWord.order });
      storage.updateWord(nextWord.id, { order: word.order });
    }
    
    loadData();
  }

  function getGroupName(groupId: string): string {
    const group = groups.find(g => g.id === groupId);
    return group?.name || 'Unknown';
  }

  function getCategoryForGroup(groupId: string): Category | undefined {
    const group = groups.find(g => g.id === groupId);
    return group ? categories.find(c => c.id === group.categoryId) : undefined;
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-6">
  <div class="max-w-7xl mx-auto">
    <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">📝 Kelola Kata/Kalimat</h1>
          <p class="text-gray-600">Tambahkan teks dan gambar untuk anak-anak baca</p>
        </div>
        <div class="flex gap-3">
          <a href="/admin" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold">
            ← Kembali
          </a>
          <button 
            onclick={() => openForm()} 
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
            disabled={groups.length === 0}
          >
            + Tambah Kata
          </button>
        </div>
      </div>

      {#if groups.length > 0}
        <div class="flex gap-2 flex-wrap">
          <button
            onclick={() => selectedGroup = 'all'}
            class="px-4 py-2 rounded-lg font-semibold {selectedGroup === 'all' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
          >
            Semua ({words.length})
          </button>
          {#each groups as group}
            {@const category = getCategoryForGroup(group.id)}
            <button
              onclick={() => selectedGroup = group.id}
              class="px-4 py-2 rounded-lg font-semibold {selectedGroup === group.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
            >
              {category?.icon || '📦'} {group.name} ({storage.getWordsByGroup(group.id).length})
            </button>
          {/each}
        </div>
      {/if}
    </div>

    {#if groups.length === 0}
      <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="text-6xl mb-4">📦</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Buat grup terlebih dahulu</h3>
        <p class="text-gray-600 mb-6">Anda perlu membuat grup sebelum menambahkan kata</p>
        <a href="/admin/groups" class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
          Kelola Grup
        </a>
      </div>
    {:else if filteredWords.length === 0}
      <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Belum ada kata</h3>
        <p class="text-gray-600 mb-6">Mulai dengan menambahkan kata pertama Anda</p>
        <button onclick={() => openForm()} class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">
          + Tambah Kata
        </button>
      </div>
    {:else}
      <div class="space-y-4">
        {#each filteredWords as word, index}
          {@const category = getCategoryForGroup(word.groupId)}
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="flex gap-6">
              <!-- Order Number -->
              <div class="flex flex-col items-center gap-2">
                <div class="bg-blue-100 text-blue-800 font-bold rounded-full w-10 h-10 flex items-center justify-center">
                  {word.order}
                </div>
                {#if selectedGroup !== 'all'}
                  <div class="flex flex-col gap-1">
                    <button 
                      onclick={() => moveWord(word, 'up')}
                      disabled={index === 0}
                      class="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button 
                      onclick={() => moveWord(word, 'down')}
                      disabled={index === filteredWords.length - 1}
                      class="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                {/if}
              </div>

              <!-- Image Preview -->
              <div class="flex-shrink-0">
                {#if word.imageSrc}
                  <img 
                    src={word.imageSrc} 
                    alt={word.text} 
                    class="w-24 h-24 object-cover rounded-lg border-2 border-gray-200" 
                    onerror={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const errorDiv = target.nextElementSibling as HTMLElement;
                      if (errorDiv) errorDiv.style.display = 'flex';
                    }}
                  />
                  <div class="w-24 h-24 bg-gray-200 rounded-lg border-2 border-gray-200 hidden items-center justify-center text-3xl">
                    ❌
                  </div>
                {:else}
                  <div class="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                    🖼️
                  </div>
                {/if}
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <p class="text-xl font-bold text-gray-800 mb-1">{word.text}</p>
                    <p class="text-sm text-gray-500">
                      {category?.icon || '📦'} {getGroupName(word.groupId)}
                      {#if category}
                        <span class="text-gray-400">• {category.name}</span>
                      {/if}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button onclick={() => openForm(word)} class="text-blue-500 hover:text-blue-700 font-semibold">
                      ✏️ Edit
                    </button>
                    <button onclick={() => deleteWord(word.id)} class="text-red-500 hover:text-red-700 font-semibold">
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
                <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  📁 {word.imageSrc}
                </p>
              </div>
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
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        {editingId ? 'Edit Kata' : 'Tambah Kata'}
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Left Column -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Grup *</label>
            <select
              bind:value={formData.groupId}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Pilih grup</option>
              {#each groups as group}
                {@const category = getCategoryForGroup(group.id)}
                <option value={group.id}>
                  {category?.icon || '📦'} {group.name}
                </option>
              {/each}
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Teks / Kalimat *</label>
            <textarea
              bind:value={formData.text}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
              placeholder="Contoh: Anak bermain bola"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">Teks yang harus dibaca anak</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Urutan</label>
            <input
              type="number"
              bind:value={formData.order}
              min="1"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p class="text-xs text-gray-500 mt-1">Urutan kata dalam grup</p>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Path Gambar *</label>
            <input
              type="text"
              bind:value={formData.imageSrc}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="/images/anak_main_bola.png"
            />
            <p class="text-xs text-gray-500 mt-1">URL atau path gambar</p>
          </div>

          <!-- Image Preview -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Preview</label>
            {#if formData.imageSrc}
              <div class="relative">
                <img 
                  src={formData.imageSrc} 
                  alt="Preview" 
                  class="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  onerror={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = target.nextElementSibling as HTMLElement;
                    if (errorDiv) errorDiv.style.display = 'flex';
                  }}
                />
                <div class="w-full h-48 bg-gray-100 rounded-lg border-2 border-gray-300 hidden items-center justify-center flex-col absolute top-0 left-0">
                  <span class="text-6xl mb-2">❌</span>
                  <span class="text-sm text-gray-600">Gambar tidak dapat dimuat</span>
                </div>
              </div>
            {:else}
              <div class="w-full h-48 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center flex-col">
                <span class="text-6xl mb-2">🖼️</span>
                <span class="text-sm text-gray-600">Masukkan path gambar</span>
              </div>
            {/if}
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-xs font-semibold text-blue-800 mb-1">💡 Tips:</p>
            <ul class="text-xs text-blue-700 space-y-1">
              <li>• Letakkan gambar di folder /static/images/</li>
              <li>• Gunakan format: /images/nama-file.png</li>
              <li>• Ukuran yang disarankan: 800x600px</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button onclick={closeForm} class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold">
          Batal
        </button>
        <button onclick={saveWord} class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold">
          {editingId ? 'Simpan' : 'Tambah'}
        </button>
      </div>
    </div>
  </div>
{/if}
