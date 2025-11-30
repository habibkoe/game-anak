import { supabase } from '$lib/supabaseClient';
import type { Category, Group, GameWord } from '$lib/types/game';

interface SupabaseCategory {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

interface SupabaseGroup {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description: string | null;
  difficulty: string;
  final_reward_text: string;
  final_reward_image: string | null;
  created_at: string;
}

interface SupabaseWord {
  id: string;
  user_id: string;
  group_id: string;
  text: string;
  image_src: string;
  order_position: number;
  content_type: string;
  math_question: string | null;
  math_answer: string | null;
  math_operator: string | null;
  created_at: string;
}

// Helper functions to convert between our types and Supabase types
function toCategory(row: SupabaseCategory): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    icon: row.icon || '📚',
    createdAt: new Date(row.created_at)
  };
}

function toGroup(row: SupabaseGroup): Group {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description || '',
    difficulty: (row.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
    finalRewardText: row.final_reward_text,
    finalRewardImage: row.final_reward_image || '',
    createdAt: new Date(row.created_at)
  };
}

function toWord(row: SupabaseWord): GameWord {
  return {
    id: row.id,
    groupId: row.group_id,
    text: row.text,
    imageSrc: row.image_src,
    order: row.order_position,
    contentType: (row.content_type || 'word') as 'word' | 'math',
    mathQuestion: row.math_question || undefined,
    mathAnswer: row.math_answer || undefined,
    mathOperator: row.math_operator as '+' | '-' | '×' | '÷' | undefined
  };
}

export const supabaseGame = {
  // ==================== CATEGORIES ====================
  
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return (data || []).map(toCategory);
  },

  async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }

    return data ? toCategory(data) : null;
  },

  async addCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        description: category.description || null,
        icon: category.icon || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      return null;
    }

    return data ? toCategory(data) : null;
  },

  async updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<boolean> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.icon !== undefined) updateData.icon = updates.icon || null;

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
      return false;
    }

    return true;
  },

  async deleteCategory(id: string): Promise<boolean> {
    // First delete all related groups (cascade will handle words)
    const { error: groupError } = await supabase
      .from('groups')
      .delete()
      .eq('category_id', id);

    if (groupError) {
      console.error('Error deleting groups:', groupError);
      return false;
    }

    // Then delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }

    return true;
  },

  // ==================== GROUPS ====================

  async getGroups(): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching groups:', error);
      return [];
    }

    return (data || []).map(toGroup);
  },

  async getGroupsByCategory(categoryId: string): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching groups by category:', error);
      return [];
    }

    return (data || []).map(toGroup);
  },

  async getGroupById(id: string): Promise<Group | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching group:', error);
      return null;
    }

    return data ? toGroup(data) : null;
  },

  async addGroup(group: Omit<Group, 'id' | 'createdAt'>): Promise<Group | null> {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        category_id: group.categoryId,
        name: group.name,
        description: group.description || null,
        difficulty: group.difficulty,
        final_reward_text: group.finalRewardText,
        final_reward_image: group.finalRewardImage || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding group:', error);
      return null;
    }

    return data ? toGroup(data) : null;
  },

  async updateGroup(id: string, updates: Partial<Omit<Group, 'id' | 'createdAt'>>): Promise<boolean> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
    if (updates.finalRewardText !== undefined) updateData.final_reward_text = updates.finalRewardText;
    if (updates.finalRewardImage !== undefined) updateData.final_reward_image = updates.finalRewardImage || null;

    const { error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating group:', error);
      return false;
    }

    return true;
  },

  async deleteGroup(id: string): Promise<boolean> {
    // First delete all related words
    const { error: wordError } = await supabase
      .from('words')
      .delete()
      .eq('group_id', id);

    if (wordError) {
      console.error('Error deleting words:', wordError);
      return false;
    }

    // Then delete the group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting group:', error);
      return false;
    }

    return true;
  },

  // ==================== WORDS ====================

  async getWords(): Promise<GameWord[]> {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('order_position', { ascending: true });

    if (error) {
      console.error('Error fetching words:', error);
      return [];
    }

    return (data || []).map(toWord);
  },

  async getWordsByGroup(groupId: string): Promise<GameWord[]> {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('group_id', groupId)
      .order('order_position', { ascending: true });

    if (error) {
      console.error('Error fetching words by group:', error);
      return [];
    }

    return (data || []).map(toWord);
  },

  async getWordById(id: string): Promise<GameWord | null> {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching word:', error);
      return null;
    }

    return data ? toWord(data) : null;
  },

  async addWord(word: Omit<GameWord, 'id'>): Promise<GameWord | null> {
    const { data, error } = await supabase
      .from('words')
      .insert({
        group_id: word.groupId,
        text: word.text,
        image_src: word.imageSrc,
        order_position: word.order,
        content_type: word.contentType || 'word',
        math_question: word.mathQuestion || null,
        math_answer: word.mathAnswer || null,
        math_operator: word.mathOperator || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding word:', error);
      return null;
    }

    return data ? toWord(data) : null;
  },

  async updateWord(id: string, updates: Partial<Omit<GameWord, 'id'>>): Promise<boolean> {
    const updateData: any = {};
    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.groupId !== undefined) updateData.group_id = updates.groupId;
    if (updates.imageSrc !== undefined) updateData.image_src = updates.imageSrc;
    if (updates.order !== undefined) updateData.order_position = updates.order;
    if (updates.contentType !== undefined) updateData.content_type = updates.contentType;
    if (updates.mathQuestion !== undefined) updateData.math_question = updates.mathQuestion || null;
    if (updates.mathAnswer !== undefined) updateData.math_answer = updates.mathAnswer || null;
    if (updates.mathOperator !== undefined) updateData.math_operator = updates.mathOperator || null;

    const { error } = await supabase
      .from('words')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating word:', error);
      return false;
    }

    return true;
  },

  async deleteWord(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting word:', error);
      return false;
    }

    return true;
  },

  // ==================== COMBINED QUERIES ====================

  async getCategoriesWithGroups(): Promise<(Category & { groups: Group[] })[]> {
    const categories = await this.getCategories();
    const groups = await this.getGroups();

    return categories.map(category => ({
      ...category,
      groups: groups.filter(g => g.categoryId === category.id)
    }));
  },

  async getGroupWithWords(groupId: string): Promise<(Group & { words: GameWord[] }) | null> {
    const group = await this.getGroupById(groupId);
    if (!group) return null;

    const words = await this.getWordsByGroup(groupId);

    return {
      ...group,
      words
    };
  }
};
