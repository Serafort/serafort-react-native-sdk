import type { SecureStorageAdapter } from './types.js';

declare const require: any;

class MemorySecureStorage implements SecureStorageAdapter {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export function createDefaultSecureStorage(): SecureStorageAdapter {
  try {
    // Dynamic require/import for expo-secure-store if present in Expo environment
    const SecureStore = require('expo-secure-store');
    if (SecureStore && typeof SecureStore.getItemAsync === 'function') {
      return {
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      };
    }
  } catch {
    // Fall through to memory storage
  }

  return new MemorySecureStorage();
}
