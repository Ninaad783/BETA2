import { create } from 'zustand';
import { API_BASE_URL } from '../lib/apiClient';

export interface AuthUser {
  id: string;
  storeId: string;
  username: string;
  fullName: string;
  mobile: string | null;
  role: 'ADMIN' | 'PHARMACIST' | 'STAFF';
  preferredLanguage: 'en' | 'mr';
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const TOKEN_KEY = 'medeasy_auth_token';
const USER_KEY = 'medeasy_auth_user';

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage
  const savedToken = localStorage.getItem(TOKEN_KEY);
  const savedUserJson = localStorage.getItem(USER_KEY);
  let initialUser: AuthUser | null = null;
  if (savedUserJson) {
    try {
      initialUser = JSON.parse(savedUserJson);
    } catch {
      initialUser = null;
    }
  }

  return {
    user: initialUser,
    token: savedToken,
    isAuthenticated: !!savedToken,
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    login: async (username: string, password: string) => {
      set({ isLoading: true, error: null });

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success && data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));

          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } else {
          // If credentials wrong or API error
          const errMsg = data.message || 'Invalid username or password';
          set({ isLoading: false, error: errMsg });
          return { success: false, message: errMsg };
        }
      } catch (err: any) {
        // Fallback for offline dev or demo when database is not yet connected
        if ((username.trim() === 'ninaad_nk' || username.trim() === 'nk_007') && password === 'password123') {
          const demoUser: AuthUser = {
            id: '12a5ddc2-fde4-4a41-bb77-23d1bdc03126',
            storeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            username: username.trim(),
            fullName: 'Ninaad Kumbhar',
            mobile: '8380036778',
            role: 'ADMIN',
            preferredLanguage: 'mr',
          };
          const demoToken = 'demo_jwt_token_for_offline_development';

          localStorage.setItem(TOKEN_KEY, demoToken);
          localStorage.setItem(USER_KEY, JSON.stringify(demoUser));

          set({
            token: demoToken,
            user: demoUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        }

        const fallbackErr = 'Backend auth server unreachable. Please verify backend is running on port 5000.';
        set({ isLoading: false, error: fallbackErr });
        return { success: false, message: fallbackErr };
      }
    },

    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    },

    checkAuth: async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        set({ isAuthenticated: false, user: null, token: null });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          set({ isAuthenticated: false, user: null, token: null });
        }
      } catch {
        // Maintain existing session on network error
      }
    },
  };
});
