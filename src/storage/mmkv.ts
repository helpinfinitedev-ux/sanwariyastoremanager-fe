class HybridStorage {
  private fallbackStore: Record<string, string> = {};

  getString(key: string): string | undefined {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage.getItem(key) || undefined;
    return this.fallbackStore[key];
  }

  set(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, value);
    this.fallbackStore[key] = value;
  }

  delete(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key);
    delete this.fallbackStore[key];
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
