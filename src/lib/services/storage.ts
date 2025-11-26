import type { Category, Group, GameWord } from '$lib/types/game';

const STORAGE_KEYS = {
  CATEGORIES: 'game_categories',
  GROUPS: 'game_groups',
  WORDS: 'game_words'
};

// Storage service for managing game data in localStorage
export const storage = {
  // Categories
  getCategories(): Category[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },

  saveCategories(categories: Category[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory(category: Category): void {
    const categories = this.getCategories();
    categories.push(category);
    this.saveCategories(categories);
  },

  updateCategory(id: string, updates: Partial<Category>): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      this.saveCategories(categories);
    }
  },

  deleteCategory(id: string): void {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(categories);
    // Also delete related groups and words
    const groups = this.getGroups().filter(g => g.categoryId !== id);
    this.saveGroups(groups);
    const words = this.getWords().filter(w => {
      const group = this.getGroup(w.groupId);
      return group && group.categoryId !== id;
    });
    this.saveWords(words);
  },

  // Groups
  getGroups(): Group[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return data ? JSON.parse(data) : [];
  },

  saveGroups(groups: Group[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  },

  getGroup(id: string): Group | undefined {
    return this.getGroups().find(g => g.id === id);
  },

  getGroupsByCategory(categoryId: string): Group[] {
    return this.getGroups().filter(g => g.categoryId === categoryId);
  },

  addGroup(group: Group): void {
    const groups = this.getGroups();
    groups.push(group);
    this.saveGroups(groups);
  },

  updateGroup(id: string, updates: Partial<Group>): void {
    const groups = this.getGroups();
    const index = groups.findIndex(g => g.id === id);
    if (index !== -1) {
      groups[index] = { ...groups[index], ...updates };
      this.saveGroups(groups);
    }
  },

  deleteGroup(id: string): void {
    const groups = this.getGroups().filter(g => g.id !== id);
    this.saveGroups(groups);
    // Also delete related words
    const words = this.getWords().filter(w => w.groupId !== id);
    this.saveWords(words);
  },

  // Words
  getWords(): GameWord[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.WORDS);
    return data ? JSON.parse(data) : [];
  },

  saveWords(words: GameWord[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
  },

  getWordsByGroup(groupId: string): GameWord[] {
    return this.getWords()
      .filter(w => w.groupId === groupId)
      .sort((a, b) => a.order - b.order);
  },

  addWord(word: GameWord): void {
    const words = this.getWords();
    words.push(word);
    this.saveWords(words);
  },

  updateWord(id: string, updates: Partial<GameWord>): void {
    const words = this.getWords();
    const index = words.findIndex(w => w.id === id);
    if (index !== -1) {
      words[index] = { ...words[index], ...updates };
      this.saveWords(words);
    }
  },

  deleteWord(id: string): void {
    const words = this.getWords().filter(w => w.id !== id);
    this.saveWords(words);
  },

  // Utility: Initialize with default data if empty
  initializeDefaultData(): void {
    if (this.getCategories().length === 0) {
      const defaultCategory: Category = {
        id: 'cat-1',
        name: 'Aktivitas Sehari-hari',
        description: 'Belajar kata-kata tentang aktivitas harian anak',
        icon: '🎯',
        createdAt: new Date()
      };
      this.addCategory(defaultCategory);

      const defaultGroup: Group = {
        id: 'group-1',
        name: 'Bermain & Aktivitas',
        categoryId: 'cat-1',
        description: 'Kata-kata tentang bermain dan aktivitas anak',
        finalRewardText: 'Mobil Lego',
        finalRewardImage: '/images/lego-car.png',
        createdAt: new Date()
      };
      this.addGroup(defaultGroup);

      const defaultWords: GameWord[] = [
        {
          id: 'word-1',
          text: 'Anak bermain bola',
          imageSrc: '/images/anak_main_bola.png',
          groupId: 'group-1',
          order: 1
        },
        {
          id: 'word-2',
          text: 'anak-anak main dengan kucing hitam dan putih',
          imageSrc: '/images/anak_main_kucing.png',
          groupId: 'group-1',
          order: 2
        },
        {
          id: 'word-3',
          text: 'anak-anak makan bersama',
          imageSrc: '/images/anak_makan.png',
          groupId: 'group-1',
          order: 3
        },
        {
          id: 'word-4',
          text: 'anak-anak memancing ikan di sungai',
          imageSrc: '/images/anak_mancing_ikan.png',
          groupId: 'group-1',
          order: 4
        },
        {
          id: 'word-5',
          text: 'anak-anak menyebrang dengan hati-hati di jalan raya',
          imageSrc: '/images/anak_nyebrang_jalan.png',
          groupId: 'group-1',
          order: 5
        }
      ];

      defaultWords.forEach(word => this.addWord(word));
    }
  },

  // Clear all data
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.WORDS);
  }
};
