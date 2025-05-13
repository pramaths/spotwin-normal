import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authstore';
import { useUserStore } from '@/store/userStore';
import apiClient from '@/utils/api';
import { AUTH_ME, UPDATE_EXPO_PUSH_TOKEN } from '@/routes/api';
import { IUser } from '@/types';
import { useNotification } from '@/contexts/NotificationContext';
import { usePrivy } from '@privy-io/expo';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUser = useUserStore((state) => state.setUser);
  const { notification, expoPushToken, error } = useNotification();
  const { isReady, user } = usePrivy();

  if (error) {
    console.log("error:", error);
  }

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await apiClient<IUser>(AUTH_ME, 'GET');

        if (response.success && response.data) {
          if (!response.data.expoPushToken || (expoPushToken && response.data.expoPushToken !== expoPushToken)) {
            await apiClient(UPDATE_EXPO_PUSH_TOKEN(response.data.id), 'POST', {
              expoPushToken: expoPushToken
            });
          }
          setUser(response.data);
          setAuthenticated(true);
        } else {
          console.log('Authentication failed, clearing token');
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (isReady) {
      if (user) {
        checkAuthentication();
      } else {
        setAuthenticated(false);
        setUser(null);
        setIsLoading(false);
      }
    }
  }, [setAuthenticated, setUser, expoPushToken, isReady, user]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Redirect href={useAuthStore.getState().isAuthenticated ? "/(tabs)" : "/(auth)/signup"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
}); 