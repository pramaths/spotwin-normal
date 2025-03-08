import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface ErrorScreenProps {
  error: Error | unknown;
}

export default function ErrorScreen({ error }: ErrorScreenProps) {
  const router = useRouter();
  
  const handleRetry = () => {
    router.replace('/(auth)/signup');
  };

  const errorMessage = error instanceof Error 
    ? error.message 
    : 'An unknown error occurred';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Authentication Error</Text>
        <Text style={styles.message}>{errorMessage}</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1d9bf0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
