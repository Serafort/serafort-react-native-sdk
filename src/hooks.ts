import { useContext } from 'react';
import { SerafortContext } from './context.js';
import type { SerafortContextValue } from './types.js';

export function useSerafort(): SerafortContextValue {
  const context = useContext(SerafortContext);
  if (!context) {
    throw new Error('useSerafort must be used within a <SerafortProvider>');
  }
  return context;
}

export function useAuth() {
  const { isAuthenticated, isLoading, error, token, setToken, logout, initialize } = useSerafort();
  return { isAuthenticated, isLoading, error, token, setToken, logout, initialize };
}

export function useUser() {
  const { user } = useSerafort();
  return user;
}

export function useTenant() {
  const { user, hasTenant } = useSerafort();
  return {
    tenantId: user?.tenantId ?? null,
    hasTenant,
  };
}

export function usePermissions() {
  const { user, hasPermission } = useSerafort();
  return {
    permissions: user?.permissions ?? [],
    hasPermission,
  };
}

export function useRoles() {
  const { user, hasRole } = useSerafort();
  return {
    roles: user?.roles ?? [],
    hasRole,
  };
}
