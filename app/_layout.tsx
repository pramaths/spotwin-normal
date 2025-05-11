import { useEffect, useState } from 'react';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationProvider } from '@/contexts/NotificationContext';
import * as Notifications from 'expo-notifications'
import { PrivyProvider } from '@privy-io/expo';
import {Inter_400Regular, Inter_500Medium, Inter_600SemiBold} from '@expo-google-fonts/inter';
import {useFonts} from 'expo-font';
import {PrivyElements} from '@privy-io/expo/ui';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

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

  return (
    <PrivyProvider
      appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID as string}
      clientId={process.env.EXPO_PUBLIC_PRIVY_APP_CLIENT_ID as string}
      config={{
        embedded: {
          solana: {
            createOnLogin: 'all-users',
          },
        },
      }}>
      <NotificationProvider>
        <SafeAreaProvider>
          <Slot />
          <PrivyElements config={{ appearance: { accentColor: '#00AF55' } }} />
          <StatusBar style="light" backgroundColor="transparent" translucent />
        </SafeAreaProvider>
      </NotificationProvider>
    </PrivyProvider>
  );
}
