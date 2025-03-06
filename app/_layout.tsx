import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { useAuthStore } from '../store/authstore';
// import { PrivyProvider } from '@privy-io/expo';

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

  useEffect(() => {
    if (!isAuthenticated && segments[0] !== '(auth)' && !isLoading) {
      router.replace('/(auth)/signup');
    }
  }, [isAuthenticated, segments, router, isLoading]);

  if (isLoading) {
    return null;
  }

  const privyAppId = process.env.EXPO_PUBLIC_PRIVY_APP_ID as string;
  const privyClientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID as string;

  return (
    <>
      {/* <PrivyProvider
        appId={privyAppId}
        clientId={privyClientId}> */}
        <Slot />
        <StatusBar style='dark' />
      {/* </PrivyProvider> */}
    </>
  );
}
