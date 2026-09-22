# @serafort/react-native

Enterprise IAM, secure token storage (`expo-secure-store` / Keychain), React hooks, and wildcard RBAC for React Native and Expo applications.

## Features

- 🔒 **Encrypted Hardware Storage**: Native Keychain and Android KeyStore integration via `expo-secure-store` with memory fallback for unit tests.
- ⚡ **React Hooks**: `useAuth()`, `useUser()`, `useTenant()`, `usePermissions()`, `useRoles()`, and `useSerafort()`.
- 🛡️ **Wildcard RBAC**: Granular permission checking (`hasPermission('org:*')`).
- 🏢 **Multi-Tenant Isolation**: Built-in verification for tenant boundaries.
- 📱 **Expo & Bare React Native**: Seamlessly works across Expo managed workflows and bare React Native apps.

## Installation

```bash
npm install @serafort/react-native @serafort/core expo-secure-store
```

## Quick Start

### 1. Wrap with `SerafortProvider`

```tsx
// App.tsx
import React from 'react';
import { SerafortProvider } from '@serafort/react-native';
import MainScreen from './src/MainScreen';

export default function App() {
  return (
    <SerafortProvider
      config={{
        endpoint: 'https://api.serafort.com',
        clientId: 'mobile_client_id',
      }}
    >
      <MainScreen />
    </SerafortProvider>
  );
}
```

### 2. Consume in Components

```tsx
// src/MainScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth, useUser, usePermissions } from '@serafort/react-native';

export default function MainScreen() {
  const { isAuthenticated, logout } = useAuth();
  const user = useUser();
  const { hasPermission } = usePermissions();

  if (!isAuthenticated) {
    return <Text>Please log in</Text>;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>User ID: {user?.userId}</Text>
      <Text>Tenant ID: {user?.tenantId}</Text>

      {hasPermission('org:members:invite') && (
        <Button title="Invite Team Member" onPress={() => {}} />
      )}

      <Button title="Log Out" onPress={logout} />
    </View>
  );
}
```
