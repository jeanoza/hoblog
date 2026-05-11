import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initialized: boolean;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  initialized: false,

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<User>('/users/me');
      set({ user: data, isLoading: false, initialized: true });
    } catch {
      set({ user: null, isLoading: false, initialized: true });
    }
  },

  login: async (email, password) => {
    await api.post('/auth/login', { email, password });
    const { data } = await api.get<User>('/users/me');
    set({ user: data, isLoading: false, initialized: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null });
    }
  },
}));
