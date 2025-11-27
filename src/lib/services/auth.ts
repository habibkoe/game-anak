import { supabase } from '$lib/supabaseClient';

export const authService = {
	/**
	 * Sign up a new user
	 */
	async signUp(email: string, password: string) {
		const { data, error } = await supabase.auth.signUp({
			email,
			password
		});

		if (error) throw error;
		return data;
	},

	/**
	 * Sign in an existing user
	 */
	async signIn(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) throw error;
		return data;
	},

	/**
	 * Sign out the current user
	 */
	async signOut() {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	},

	/**
	 * Get current session
	 */
	async getSession() {
		const { data, error } = await supabase.auth.getSession();
		if (error) throw error;
		return data.session;
	},

	/**
	 * Get current user
	 */
	async getUser() {
		const { data, error } = await supabase.auth.getUser();
		if (error) throw error;
		return data.user;
	},

	/**
	 * Reset password
	 */
	async resetPassword(email: string) {
		const { error } = await supabase.auth.resetPasswordForEmail(email);
		if (error) throw error;
	}
};
