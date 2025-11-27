import type { Category, Group, GameWord } from '$lib/types/game';
import { supabase } from '$lib/supabaseClient';

export const supabaseStorage = {
	// =============================================
	// CATEGORIES
	// =============================================
	async getCategories(): Promise<Category[]> {
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data.map(cat => ({
			...cat,
			createdAt: new Date(cat.created_at)
		}));
	},

	async addCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
		const { data, error } = await supabase
			.from('categories')
			.insert({
				name: category.name,
				description: category.description,
				icon: category.icon
			})
			.select()
			.single();

		if (error) throw error;
		return {
			...data,
			createdAt: new Date(data.created_at)
		};
	},

	async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
		const { error } = await supabase
			.from('categories')
			.update({
				name: updates.name,
				description: updates.description,
				icon: updates.icon
			})
			.eq('id', id);

		if (error) throw error;
	},

	async deleteCategory(id: string): Promise<void> {
		const { error } = await supabase
			.from('categories')
			.delete()
			.eq('id', id);

		if (error) throw error;
	},

	// =============================================
	// GROUPS
	// =============================================
	async getGroups(): Promise<Group[]> {
		const { data, error } = await supabase
			.from('groups')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data.map(group => ({
			...group,
			categoryId: group.category_id,
			finalRewardText: group.final_reward_text,
			finalRewardImage: group.final_reward_image,
			createdAt: new Date(group.created_at)
		}));
	},

	async getGroup(id: string): Promise<Group | null> {
		const { data, error } = await supabase
			.from('groups')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}

		return {
			...data,
			categoryId: data.category_id,
			finalRewardText: data.final_reward_text,
			finalRewardImage: data.final_reward_image,
			createdAt: new Date(data.created_at)
		};
	},

	async getGroupsByCategory(categoryId: string): Promise<Group[]> {
		const { data, error } = await supabase
			.from('groups')
			.select('*')
			.eq('category_id', categoryId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data.map(group => ({
			...group,
			categoryId: group.category_id,
			finalRewardText: group.final_reward_text,
			finalRewardImage: group.final_reward_image,
			createdAt: new Date(group.created_at)
		}));
	},

	async addGroup(group: Omit<Group, 'id' | 'createdAt'>): Promise<Group> {
		const { data, error } = await supabase
			.from('groups')
			.insert({
				category_id: group.categoryId,
				name: group.name,
				description: group.description,
				final_reward_text: group.finalRewardText,
				final_reward_image: group.finalRewardImage
			})
			.select()
			.single();

		if (error) throw error;
		return {
			...data,
			categoryId: data.category_id,
			finalRewardText: data.final_reward_text,
			finalRewardImage: data.final_reward_image,
			createdAt: new Date(data.created_at)
		};
	},

	async updateGroup(id: string, updates: Partial<Group>): Promise<void> {
		const updateData: any = {};
		if (updates.name !== undefined) updateData.name = updates.name;
		if (updates.description !== undefined) updateData.description = updates.description;
		if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
		if (updates.finalRewardText !== undefined) updateData.final_reward_text = updates.finalRewardText;
		if (updates.finalRewardImage !== undefined) updateData.final_reward_image = updates.finalRewardImage;

		const { error } = await supabase
			.from('groups')
			.update(updateData)
			.eq('id', id);

		if (error) throw error;
	},

	async deleteGroup(id: string): Promise<void> {
		const { error } = await supabase
			.from('groups')
			.delete()
			.eq('id', id);

		if (error) throw error;
	},

	// =============================================
	// WORDS
	// =============================================
	async getWords(): Promise<GameWord[]> {
		const { data, error } = await supabase
			.from('words')
			.select('*')
			.order('order_position', { ascending: true });

		if (error) throw error;
		return data.map(word => ({
			id: word.id,
			text: word.text,
			imageSrc: word.image_src,
			groupId: word.group_id,
			order: word.order_position
		}));
	},

	async getWordsByGroup(groupId: string): Promise<GameWord[]> {
		const { data, error } = await supabase
			.from('words')
			.select('*')
			.eq('group_id', groupId)
			.order('order_position', { ascending: true });

		if (error) throw error;
		return data.map(word => ({
			id: word.id,
			text: word.text,
			imageSrc: word.image_src,
			groupId: word.group_id,
			order: word.order_position
		}));
	},

	async addWord(word: Omit<GameWord, 'id'>): Promise<GameWord> {
		const { data, error } = await supabase
			.from('words')
			.insert({
				group_id: word.groupId,
				text: word.text,
				image_src: word.imageSrc,
				order_position: word.order
			})
			.select()
			.single();

		if (error) throw error;
		return {
			id: data.id,
			text: data.text,
			imageSrc: data.image_src,
			groupId: data.group_id,
			order: data.order_position
		};
	},

	async updateWord(id: string, updates: Partial<GameWord>): Promise<void> {
		const updateData: any = {};
		if (updates.text !== undefined) updateData.text = updates.text;
		if (updates.imageSrc !== undefined) updateData.image_src = updates.imageSrc;
		if (updates.groupId !== undefined) updateData.group_id = updates.groupId;
		if (updates.order !== undefined) updateData.order_position = updates.order;

		const { error } = await supabase
			.from('words')
			.update(updateData)
			.eq('id', id);

		if (error) throw error;
	},

	async deleteWord(id: string): Promise<void> {
		const { error } = await supabase
			.from('words')
			.delete()
			.eq('id', id);

		if (error) throw error;
	},

	// =============================================
	// PUBLIC CONTENT (for preview/demo)
	// =============================================
	async getPublicContent() {
		const { data, error } = await supabase
			.from('public_content')
			.select('*')
			.eq('is_active', true)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}

		return {
			id: data.id,
			categoryName: data.category_name,
			groupName: data.group_name,
			groupDescription: data.group_description,
			finalRewardText: data.final_reward_text,
			finalRewardImage: data.final_reward_image,
			words: data.words as Array<{
				id: string;
				text: string;
				imageSrc: string;
				order: number;
			}>,
			isActive: data.is_active
		};
	}
};
