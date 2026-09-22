import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDefaultSecureStorage } from '../src/storage.js';
import { SerafortClient, type UserContext } from '@serafort/core';

describe('@serafort/react-native Test Suite', () => {
  const mockUser: UserContext = {
    userId: 'usr_rn_777',
    tenantId: 'tenant_mobile',
    roles: ['admin', 'field_agent'],
    permissions: ['org:*', 'devices:enroll'],
    claims: {},
  };

  let mockClient: SerafortClient;

  beforeEach(() => {
    mockClient = new SerafortClient({ endpoint: 'https://api.test.serafort.com' });
    vi.spyOn(mockClient.b2b, 'validateToken').mockImplementation(async (token: string) => {
      if (token === 'valid_rn_token') {
        return mockUser;
      }
      throw new Error('Invalid token');
    });
  });

  describe('SecureStorageAdapter fallback', () => {
    it('stores, reads, and deletes values', async () => {
      const storage = createDefaultSecureStorage();
      await storage.setItem('test_key', 'secret_val');
      expect(await storage.getItem('test_key')).toBe('secret_val');

      await storage.removeItem('test_key');
      expect(await storage.getItem('test_key')).toBeNull();
    });
  });

  describe('Wildcard RBAC Evaluation', () => {
    it('evaluates wildcard and exact permissions correctly', async () => {
      const user = await mockClient.b2b.validateToken('valid_rn_token');

      expect(mockClient.b2b.hasPermission(user, 'org:users:create')).toBe(true);
      expect(mockClient.b2b.hasPermission(user, 'devices:enroll')).toBe(true);
      expect(mockClient.b2b.hasPermission(user, 'devices:wipe')).toBe(false);
      expect(mockClient.b2b.hasPermission(user, 'system:root')).toBe(false);
    });

    it('validates roles and tenant', async () => {
      const user = await mockClient.b2b.validateToken('valid_rn_token');

      expect(user.roles.includes('admin')).toBe(true);
      expect(user.roles.includes('field_agent')).toBe(true);
      expect(user.roles.includes('spectator')).toBe(false);

      expect(user.tenantId).toBe('tenant_mobile');
    });
  });
});
