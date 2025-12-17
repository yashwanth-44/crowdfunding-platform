import { create } from 'zustand';
import { User, UserRole } from '../types/index';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  signup: (data: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.signup(data);
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login({ email, password });
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    apiClient.clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.getProfile();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await apiClient.updateProfile(data);
      set({ user: response.data });
    } catch (error) {
      throw error;
    }
  },

  hasRole: (role) => {
    const { user } = get();
    if (!user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.some((r) => user.roles.includes(r));
  },
}));
