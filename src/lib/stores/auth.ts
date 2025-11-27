import { writable } from 'svelte/store';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '$lib/supabaseClient';

interface AuthStore {
	user: User | null;
	session: Session | null;
	loading: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthStore>({
		user: null,
		session: null,
		loading: true
	});

	return {
		subscribe,
		set,
		update,
		initialize: async () => {
			const { data: { session } } = await supabase.auth.getSession();
			set({
				user: session?.user ?? null,
				session: session ?? null,
				loading: false
			});

			// Listen for auth changes
			supabase.auth.onAuthStateChange((_event, session) => {
				set({
					user: session?.user ?? null,
					session: session ?? null,
					loading: false
				});
			});
		}
	};
}

export const authStore = createAuthStore();
