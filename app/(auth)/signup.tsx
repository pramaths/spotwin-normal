import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authstore';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import apiClient from '@/utils/api';
import { LOGIN, REFERRAL_CODE, UPDATE_EXPO_PUSH_TOKEN, AUTH_ME } from '@/routes/api';
import { IUser } from '@/types';
import Referral from '@/components/Referral';
import { useUserStore } from '@/store/userStore';
import { useNotification } from '@/contexts/NotificationContext';
import { ToastAndroid } from 'react-native';
import { useLoginWithOAuth, hasError, usePrivy } from '@privy-io/expo';
import GoogleIcon from '@/assets/icons/google.svg';
import AppleIcon from '@/assets/icons/apple.svg';

export default function SignupScreen() {
  const router = useRouter();
  const { setAuthenticated, setIsNewUser } = useAuthStore();
  const { setUser, user } = useUserStore();
  const { expoPushToken } = useNotification();
  
  // Add separate loading states for each provider
  const [loadingStates, setLoadingStates] = useState({
    google: false,
    twitter: false,
    apple: false
  });
  
  const [authState, setAuthState] = useState<{
    status: 'idle' | 'loading' | 'error' | 'skipped';
    error: null | { message: string };
  }>({
    status: 'idle',
    error: null
  });
  const { login, state } = useLoginWithOAuth({
    onSuccess: async () => {
      const response = await apiClient<IUser>(LOGIN, 'POST');
      console.log('response', response);
      if (response.success && response.data) {
        setUser(response.data);
        setAuthenticated(true);
        router.replace('/(tabs)');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    },
  });

  const [showReferralScreen, setShowReferralScreen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleGoogleLogin = async () => {
    setLoadingStates(prev => ({ ...prev, google: true }));
    setAuthState({ status: 'loading', error: null });
    try {
      await login({ provider: 'google' });
    } catch (error) {
      setLoadingStates(prev => ({ ...prev, google: false }));
      setAuthState({
        status: 'error',
        error: { message: 'Google login failed. Please try again.' }
      });

      // Clear error message after 3 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setAuthState({
          status: 'idle',
          error: null
        });
      }, 3000);
    }
  };

  const handleAppleLogin = async () => {
    setLoadingStates(prev => ({ ...prev, apple: true }));
    setAuthState({ status: 'loading', error: null });
    try {
      await login({ provider: 'apple' , isLegacyAppleIosBehaviorEnabled: true});
    } catch (error) {
      setLoadingStates(prev => ({ ...prev, apple: false }));
      setAuthState({
        status: 'error',
        error: { message: 'Apple login failed. Please try again.' }
      });

      // Clear error message after 3 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setAuthState({
          status: 'idle',
          error: null
        });
      }, 3000);
    }
  };

  const handleTwitterLogin = async () => {
    setLoadingStates(prev => ({ ...prev, twitter: true }));
    setAuthState({ status: 'loading', error: null });
    try {
      await login({ provider: 'twitter' });
    } catch (error) {
      setLoadingStates(prev => ({ ...prev, twitter: false }));
      setAuthState({
        status: 'error',
        error: { message: 'Twitter login failed. Please try again.' }
      });

      // Clear error message after 3 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setAuthState({
          status: 'idle',
          error: null
        });
      }, 3000);
    }
  };

  const handleSubmitReferralCode = async (code: string) => {
    if (code.length === 0) {
      setAuthState({ status: 'skipped', error: null });
    } else {
      setAuthState({ status: 'loading', error: null });
      try {
        const user = useUserStore.getState().user;
        const response = await apiClient(REFERRAL_CODE(user?.id || ''), 'PATCH', {
          referralCode: code
        });

        if (response.success) {
          setAuthState({ status: 'idle', error: null });
          setShowReferralScreen(false);
          router.replace('/(tabs)');
        } else {
          setAuthState({
            status: 'error',
            error: { message: response.message || 'Invalid referral code. Please try again.' }
          });
        }
      } catch (error) {
        setAuthState({
          status: 'error',
          error: { message: 'Network error. Please check your connection.' }
        });
      }
    }
  };

  const handleSkipReferral = async () => {
    await handleSubmitReferralCode('');
    setAuthState({ status: 'idle', error: null });
    router.replace('/(tabs)');
  };

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Monitor state changes from OAuth login
  useEffect(() => {
    if (state.status === 'done') {
      // Reset loading states when login is complete
      setLoadingStates({ google: false, twitter: false, apple: false });
      setAuthenticated(true);
      router.replace('/(tabs)');
    } else if (state.status === 'error') {
      // Reset loading states on error
      setLoadingStates({ google: false, twitter: false, apple: false });
    }
  }, [state]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#fff' }}
        keyboardVerticalOffset={Platform.select({ ios: 10, android: 0 })}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
          <ScrollView
            style={{ flex: 1, backgroundColor: '#fff' }}
            contentContainerStyle={[styles.scrollContainer, { backgroundColor: '#fff' }]}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={[styles.contentWrapper, { backgroundColor: '#fff' }]}>
              <View style={{ flex: 1, width: '100%', backgroundColor: '#fff' }}>
                <View style={[
                  styles.logoContainer,
                  keyboardVisible && styles.logoContainerKeyboardShown,
                  { backgroundColor: '#fff' }
                ]}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={[
                      styles.logo,
                      keyboardVisible && styles.logoSmall
                    ]}
                    resizeMode="contain"
                  />
                </View>

                <View style={[styles.contentContainer, { backgroundColor: '#fff' }]}>
                  <Text style={[
                    styles.title,
                    keyboardVisible && styles.titleKeyboardShown,
                    { backgroundColor: '#fff' }
                  ]}>
                    Play fantasy trivia and win rewards!
                  </Text>

                  {authState.status === 'error' && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{authState.error?.message}</Text>
                    </View>
                  )}

                  {showReferralScreen ? (
                    <View style={styles.referralWrapper}>
                      <Referral
                        onSubmit={handleSubmitReferralCode}
                        errorMessage={authState.status === 'error' ? authState.error?.message : undefined}
                        isLoading={authState.status === 'loading'}
                      />
                      <TouchableOpacity style={styles.skipButton} onPress={handleSkipReferral}>
                        <Text style={styles.skipButtonText}>Skip</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={[styles.authContainer, { backgroundColor: '#fff' }]}>
                      {authState.status === 'error' && authState.error && (
                        <View style={styles.errorContainer}>
                          <Text style={styles.errorText}>{authState.error.message}</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={handleGoogleLogin}
                        disabled={loadingStates.google || loadingStates.twitter}
                        activeOpacity={0.7}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        pressRetentionOffset={{ top: 30, bottom: 30, left: 30, right: 30 }}
                      >
                        <View style={styles.loginButton}>
                          <View style={styles.buttonContent}>
                            {loadingStates.google ? (
                              <>
                                <ActivityIndicator size="small" color="#000" />
                                <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>Logging in...</Text>
                              </>
                            ) : (
                              <>
                                <GoogleIcon />
                                <Text style={styles.loginButtonText}>Login with Google</Text>
                              </>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={handleAppleLogin}
                        disabled={loadingStates.google || loadingStates.apple}
                        activeOpacity={0.7}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        pressRetentionOffset={{ top: 30, bottom: 30, left: 30, right: 30 }}
                      >
                        <View style={styles.loginButton}>
                          <View style={styles.buttonContent}>
                            {loadingStates.apple ? (
                              <>
                                <ActivityIndicator size="small" color="#000" />
                                <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>Logging in...</Text>
                              </>
                            ) : (
                              <>
                                <AppleIcon width={24} height={24} />
                                <Text style={styles.loginButtonText}>Login with Apple</Text>
                              </>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Twitter login temporarily disabled
                      <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={handleTwitterLogin}
                        disabled={loadingStates.google || loadingStates.twitter}
                        activeOpacity={0.7}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        pressRetentionOffset={{ top: 30, bottom: 30, left: 30, right: 30 }}
                      >
                        <View style={styles.loginButton}>
                          <View style={styles.buttonContent}>
                            {loadingStates.twitter ? (
                              <>
                                <ActivityIndicator size="small" color="#000" />
                                <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>Logging in...</Text>
                              </>
                            ) : (
                              <View style={styles.buttonContent}>
                                <Image source={require('../../assets/icons/twitter.png')} style={{ width: 24, height: 24 }} />
                                <Text style={styles.loginButtonText}>Login with Twitter</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                      */}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  logoContainer: {
    marginVertical: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoContainerKeyboardShown: {
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  logoContainerOtpShown: {
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  logo: {
    width: 140,
    height: 140,
  },
  logoSmall: {
    width: 80,
    height: 80,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
    flex: 1,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  titleKeyboardShown: {
    fontSize: 24,
    marginBottom: 30,
    backgroundColor: '#fff',
  },
  titleOtpShown: {
    fontSize: 22,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  authContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 30,
  },
  countryCodeButton: {
    height: '100%',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 65,
    maxWidth: '20%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  countryCodeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 2,
    flexShrink: 0,
  },
  phoneInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    height: '100%',
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    borderRadius: 8,
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000',
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 24,
  },
  otpInput: {
    width: 40,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    textAlign: 'center',
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#000',
  },
  resendContainer: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  resendText: {
    color: '#000',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '90%',
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    alignSelf: 'center',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  loginButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  errorContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: '80%',
    borderWidth: 1,
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
  },
  loadingText: {
    color: '#000',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
  footerText: {
    color: '#000',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
  linkText: {
    color: '#000',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 20,
    padding: 12,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  skipButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  referralWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  referralHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  referralSubheading: {
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
  },
  successContainer: {
    backgroundColor: '#e6f7e6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  successText: {
    color: '#4caf50',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  otpTitleNoBorder: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  otpSubtitleNoBorder: {
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
  },
  otpErrorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    borderWidth: 1,
    borderColor: '#ff5252',
  },
  otpErrorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 14,
  },
});