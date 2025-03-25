import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/store/authstore';
import { useUserStore } from '@/store/userStore';
import apiClient from '@/utils/api';
import { AUTH_ME, UPDATE_EXPO_PUSH_TOKEN } from '@/routes/api';
import { IUser } from '@/types';
import { useNotification } from '@/contexts/NotificationContext';

// Debug helper for token storage
const debugTokenStorage = async () => {
  try {
    // Try to write a test value
    await SecureStore.setItemAsync('test_token', 'test_value');
    const testValue = await SecureStore.getItemAsync('test_token');
    console.log('SecureStore test value:', testValue);
    
    if (testValue === 'test_value') {
      console.log('SecureStore is working properly');
    } else {
      console.log('SecureStore failed to retrieve test value');
    }
    
    // Clean up test value
    await SecureStore.deleteItemAsync('test_token');
  } catch (error) {
    console.error('SecureStore test error:', error);
  }
};

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUser = useUserStore((state) => state.setUser);
  const { notification, expoPushToken, error } = useNotification();
  
  if(error){
    console.log("error:", error);
  }
  console.log("notification:", notification);
  console.log("expoPushToken:", expoPushToken);

  useEffect(() => {
    console.log("i entered here");
    async function checkAuthentication() {
      try {
        console.log("i entered here 2");
        
        // Debug SecureStore functionality first
        await debugTokenStorage();
        
        // Try to get the token
        let token = null;
        try {
            console.log("i entered here 3");
          token = await SecureStore.getItemAsync('token');
          console.log("token from SecureStore:", token);
        } catch (tokenError) {
          console.error('Error retrieving token from SecureStore:', tokenError);
        }
        console.log("token:", token);
        if (!token) {
          console.log('No token found, setting authenticated to false');
          setAuthenticated(false);
          setIsLoading(false);
          return;
        }

        console.log('Attempting API request with token');
        const response = await apiClient<IUser>(AUTH_ME, 'GET');
        console.log('API response received:', response.success);
        
        if (response.success && response.data) {
          if(!response.data.expoPushToken && expoPushToken){
            console.log('Updating expo push token', expoPushToken);
            const res = await apiClient(UPDATE_EXPO_PUSH_TOKEN(response.data.id), 'POST', { 
              expoPushToken: expoPushToken
            });
            console.log("res:", res);
          }
          setUser(response.data);
          setAuthenticated(true);
        } else {
          console.log('Authentication failed, clearing token');
          setAuthenticated(false);
          await SecureStore.deleteItemAsync('token');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthentication();
  }, [setAuthenticated, setUser, expoPushToken]);

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