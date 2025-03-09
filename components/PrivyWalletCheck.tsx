import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { usePrivy } from '@privy-io/expo';

type PrivyWalletCheckProps = {
  children: React.ReactNode;
};

export function PrivyWalletCheck({ children }: PrivyWalletCheckProps) {
  const { isReady } = usePrivy();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00AF55" />
      </View>
    );
  }

  return <>{children}</>;
}