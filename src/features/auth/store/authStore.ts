import { create } from 'zustand';
import { storage } from '../../../storage/mmkv';
import { mockCredentials } from '../../../shared/mock/credentials';

export interface UserSession {
  id: string;
  name: string;
  mobileNumber: string;
  role: 'STORE_MANAGER';
  storeName: string;
}

interface AuthState {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (user: UserSession, token: string) => void;
  clearSession: () => void;
}

const AUTH_USER_KEY = 'auth_session_user';
const AUTH_TOKEN_KEY = 'auth_session_token';

export const useAuthStore = create<AuthState>((set) => {
  // Load session from MMKV
  const persistedToken = storage.getString(AUTH_TOKEN_KEY) || null;
  const persistedUserStr = storage.getString(AUTH_USER_KEY);
  let persistedUser: UserSession | null = null;
  let finalAuthenticated = !!persistedToken;

  if (persistedUserStr) {
    try {
      persistedUser = JSON.parse(persistedUserStr);
      if (persistedUser) {
        // Validate active status against mock store at startup
        const record = mockCredentials.find((c) => c.mobileNumber === persistedUser!.mobileNumber);
        if (!record || !record.isActive) {
          // Account was deactivated or not found, clear storage immediately
          storage.delete(AUTH_TOKEN_KEY);
          storage.delete(AUTH_USER_KEY);
          persistedUser = null;
          finalAuthenticated = false;
        }
      }
    } catch (e) {
      persistedUser = null;
      finalAuthenticated = false;
    }
  }

  return {
    user: persistedUser,
    token: persistedUser ? persistedToken : null,
    isAuthenticated: finalAuthenticated,
    setSession: (user, token) => {
      storage.set(AUTH_TOKEN_KEY, token);
      storage.set(AUTH_USER_KEY, JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    clearSession: () => {
      storage.delete(AUTH_TOKEN_KEY);
      storage.delete(AUTH_USER_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
