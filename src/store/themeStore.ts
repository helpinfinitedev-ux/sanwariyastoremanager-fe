import { create } from 'zustand';
import { storage } from '../storage/mmkv';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const THEME_STORAGE_KEY = 'erp_theme_preference';

export const useThemeStore = create<ThemeState>((set) => {
  // Rehydrate initial state from persisted storage
  const persistedTheme = storage.getString(THEME_STORAGE_KEY);
  const initialTheme = persistedTheme === 'dark' || persistedTheme === 'light' ? persistedTheme : 'light';

  return {
    theme: initialTheme,
    toggleTheme: () => {
      set((state) => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        storage.set(THEME_STORAGE_KEY, nextTheme);
        return { theme: nextTheme };
      });
    },
    setTheme: (theme: 'light' | 'dark') => {
      storage.set(THEME_STORAGE_KEY, theme);
      set({ theme });
    },
  };
});
