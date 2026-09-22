import type { UserContext, SerafortClient } from '@serafort/core';

export interface SecureStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface SerafortRNConfig {
  /** Serafort IAM backend endpoint */
  endpoint: string;
  /** Client ID for mobile application */
  clientId?: string;
  /** Prefix for secure storage keys. Default: '__serafort' */
  keyPrefix?: string;
  /** Custom secure storage adapter (e.g. expo-secure-store). Fallback: in-memory */
  storageAdapter?: SecureStorageAdapter;
  /** Automatically restore and validate token upon mount. Default: true */
  autoInitialize?: boolean;
  /** Pre-configured SerafortClient instance */
  client?: SerafortClient;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserContext | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SerafortContextValue {
  state: AuthState;
  isAuthenticated: boolean;
  user: UserContext | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  client: SerafortClient;

  setToken(token: string): Promise<UserContext>;
  logout(): Promise<void>;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
  hasTenant(tenantId: string): boolean;
  initialize(): Promise<void>;
}
