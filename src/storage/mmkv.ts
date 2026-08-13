import { Platform } from 'react-native';

class HybridStorage {
  private mmkv: any;
  private isWeb: boolean;
  private fallbackStore: Record<string, string> = {};

  constructor() {
    this.isWeb = Platform.OS === 'web';
    if (!this.isWeb) {
      try {
        const { MMKV } = require('react-native-mmkv');
        this.mmkv = new MMKV();
      } catch (e) {
        console.warn('MMKV not available in this environment. Falling back to local storage/memory.', e);
        this.mmkv = null;
      }
    }
  }

  getString(key: string): string | undefined {
    if (this.isWeb || !this.mmkv) {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key) || undefined;
      }
      return this.fallbackStore[key];
    }
    try {
      return this.mmkv.getString(key);
    } catch (e) {
      return undefined;
    }
  }

  set(key: string, value: string): void {
    if (this.isWeb || !this.mmkv) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      this.fallbackStore[key] = value;
    } else {
      try {
        this.mmkv.set(key, value);
      } catch (e) {
        console.error('MMKV write error:', e);
      }
    }
  }

  delete(key: string): void {
    if (this.isWeb || !this.mmkv) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete this.fallbackStore[key];
    } else {
      try {
        this.mmkv.delete(key);
      } catch (e) {
        console.error('MMKV delete error:', e);
      }
    }
  }

  getBoolean(key: string): boolean | undefined {
    const val = this.getString(key);
    if (val === undefined) return undefined;
    return val === 'true';
  }

  setBoolean(key: string, value: boolean): void {
    this.set(key, value ? 'true' : 'false');
  }
}

export const storage = new HybridStorage();
