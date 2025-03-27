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


export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUser = useUserStore((state) => state.setUser);
  const { notification, expoPushToken, error } = useNotification();
  
  if(error){
    console.log("error:", error);
  }

  useEffect(() => {
    async function checkAuthentication() {
      try {
        let token = null;
        try {
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

        const response = await apiClient<IUser>(AUTH_ME, 'GET');
        
        if (response.success && response.data) {
          if(!response.data.expoPushToken && expoPushToken && response.data.expoPushToken !== expoPushToken){
            await apiClient(UPDATE_EXPO_PUSH_TOKEN(response.data.id), 'POST', { 
              expoPushToken: expoPushToken
            });
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