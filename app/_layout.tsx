import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authstore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrivyProvider, PrivyElements } from '@privy-io/expo';
import { PrivyWalletCheck } from '../components/PrivyWalletCheck';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);


  if (isLoading) {
    return null;
  }

  const privyAppId = process.env.EXPO_PUBLIC_PRIVY_APP_ID as string;
  const privyClientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID as string;

  return (
    <SafeAreaProvider>
      <PrivyProvider
        appId={privyAppId}
        clientId={privyClientId}
        config={{
          embedded: {
            solana: {
              createOnLogin: 'all-users',
            },
          },
        }}
      >
        <PrivyWalletCheck>
          <Slot />
        </PrivyWalletCheck>
        <PrivyElements config={{ appearance: { accentColor: '#00AF55' } }} />
      </PrivyProvider>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
    </SafeAreaProvider>
  );
}
