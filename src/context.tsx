import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SerafortClient, type UserContext } from '@serafort/core';
import { createDefaultSecureStorage } from './storage.js';
import type { SerafortRNConfig, AuthState, SerafortContextValue } from './types.js';

export const SerafortContext = createContext<SerafortContextValue | null>(null);

export interface SerafortProviderProps {
  config: SerafortRNConfig;
  children: React.ReactNode;
}

export function SerafortProvider({ config, children }: SerafortProviderProps) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  const storage = useMemo(
    () => config.storageAdapter || createDefaultSecureStorage(),
    [config.storageAdapter]
  );

  const client = useMemo(
    () =>
      config.client ||
      new SerafortClient({
        endpoint: config.endpoint,
      }),
    [config.client, config.endpoint]
  );

  const keyPrefix = config.keyPrefix || '__serafort';
  const tokenKey = `${keyPrefix}_access_token`;

  const initialize = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const storedToken = await storage.getItem(tokenKey);
      if (!storedToken) {
        setState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      const user = await client.b2b.validateToken(storedToken);
      setState({
        isAuthenticated: true,
        user,
        token: storedToken,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      await storage.removeItem(tokenKey);
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: err?.message || 'Token restoration failed',
      });
    }
  }, [client, storage, tokenKey]);

  useEffect(() => {
    if (config.autoInitialize !== false) {
      void initialize();
    }
  }, [config.autoInitialize, initialize]);

  const setToken = useCallback(
    async (token: string): Promise<UserContext> => {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const user = await client.b2b.validateToken(token);
        await storage.setItem(tokenKey, token);
        setState({
          isAuthenticated: true,
          user,
          token,
          isLoading: false,
          error: null,
        });
        return user;
      } catch (err: any) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err?.message || 'Invalid token',
        }));
        throw err;
      }
    },
    [client, storage, tokenKey]
  );

  const logout = useCallback(async () => {
    await storage.removeItem(tokenKey);
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  }, [storage, tokenKey]);

  const hasRole = useCallback(
    (role: string): boolean => {
      return state.user?.roles.includes(role) ?? false;
    },
    [state.user]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!state.user) return false;
      return client.b2b.hasPermission(state.user, permission);
    },
    [client, state.user]
  );

  const hasTenant = useCallback(
    (tenantId: string): boolean => {
      return state.user?.tenantId === tenantId;
    },
    [state.user]
  );

  const value: SerafortContextValue = useMemo(
    () => ({
      state,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      token: state.token,
      isLoading: state.isLoading,
      error: state.error,
      client,
      setToken,
      logout,
      hasRole,
      hasPermission,
      hasTenant,
      initialize,
    }),
    [state, client, setToken, logout, hasRole, hasPermission, hasTenant, initialize]
  );

  return <SerafortContext.Provider value={value}>{children}</SerafortContext.Provider>;
}
