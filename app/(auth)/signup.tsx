import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authstore';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import SignupBg from '../../assets/images/signupbg.svg';
import Logo from '../../assets/logo.svg';
import XIcon from '../../assets/icons/x.svg';

import { useLoginWithOAuth, useOAuthTokens } from '@privy-io/expo';

export default function SignupScreen() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const router = useRouter();
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isPressing, setIsPressing] = useState(false);
  
  useEffect(() => {
    const startShimmerAnimation = () => {
      Animated.loop(
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    };
    
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    };
    
    const startRotateAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    };
    
    startShimmerAnimation();
    startPulseAnimation();
    startRotateAnimation();
  }, []);

  const { login, state: oauthState } = useLoginWithOAuth({
    onSuccess: (user, isNewUser) => {
      console.log('Login successful', { user, isNewUser });
      console.log('User:', JSON.stringify(user));
      setAuthenticated(true);
      router.replace('/(tabs)');
    },
    onError: (error) => {
      console.error('Login error:', error);
    }
  });

  useOAuthTokens({
    onOAuthTokenGrant: ({
      provider
    }) => {
      console.log('OAuth tokens received', { provider });
    }
  });

  const handleTwitterLogin = () => {
    login({ provider: 'twitter' });
  };

  const handleSignup = () => {
    setAuthenticated(true);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <SignupBg width={Dimensions.get('window').width} height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>

      <View style={styles.overlay}>
        <View style={styles.contentWrapper}>
          <Logo width={80} height={80} style={styles.trophyIcon} />

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Watch, Play, Win, Repeat</Text>
            <Text style={styles.subtitle}>
              Join contests, vote on videos, and earn rewards!
            </Text>

            {oauthState.status === 'error' && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {oauthState.error?.message || 'Authentication error'}
                </Text>
              </View>
            )}

            <View style={styles.buttonsContainer}>
              <Animated.View style={{
                transform: [{ scale: pulseAnim }],
                width: '80%',
              }}>
                <TouchableOpacity
                  style={styles.buttonWrapper}
                  onPress={handleTwitterLogin}
                  disabled={oauthState.status === 'loading'}
                  activeOpacity={0.7}
                  onPressIn={() => setIsPressing(true)}
                  onPressOut={() => setIsPressing(false)}
                >
                  <View style={[
                    styles.twitterButton,
                    isPressing && styles.twitterButtonPressed
                  ]}>
                    <View style={styles.buttonContent}>
                      {oauthState.status === 'loading' ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          
                            <XIcon width={20} height={20} />
                          <Text style={styles.twitterButtonText}>Sign in with Twitter</Text>
                        
                          <View style={styles.glow} />
                        </>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {oauthState.status === 'loading' && (
              <Text style={styles.loadingText}>Authenticating...</Text>
            )}

            <Text style={styles.footerText}>
              By signing in, you agree to the{' '}
              <Text style={styles.linkText}>User Agreement</Text> &{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
    paddingBottom: 80,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  trophyIcon: {
    alignSelf: 'center',
    marginBottom: 250,
  },
  contentContainer: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 60,
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: '#1d9bf0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  button: {
    width: '80%',
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  twitterButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1d9bf0',
  },
  twitterButtonPressed: {
    backgroundColor: '#111',
    transform: [{ scale: 0.98 }],
  },
  twitterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 50,
    height: '100%',
    transform: [{ skewX: '-20deg' }],
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 50,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(29, 155, 240, 0.2)',
    opacity: 0.6,
  },
  footerText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  linkText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: '80%',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
});