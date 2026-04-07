import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

/**
 * Thin client-side store that mirrors the authenticated user.
 * The source of truth is Supabase Auth; this store is used for
 * instant UI updates without waiting for a server round-trip.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
