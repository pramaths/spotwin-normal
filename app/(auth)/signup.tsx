import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Animated, Easing, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authstore';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import apiClient from '@/utils/api';
import { LOGIN, VERIFY_OTP, REFERRAL_CODE, UPDATE_EXPO_PUSH_TOKEN } from '@/routes/api';
import { IUser } from '@/types';
import Referral from '@/components/Referral';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '@/store/userStore';
import { useNotification } from '@/contexts/NotificationContext';

async function save(key: string, value: string) {
  try {
    console.log(`Attempting to save ${key} to SecureStore`);
    await SecureStore.setItemAsync(key, value);    
    const savedValue = await SecureStore.getItemAsync(key);
    if (savedValue === value) {
      console.log(`Successfully saved and verified ${key} in SecureStore`);
    } else {
      console.error(`Failed to verify ${key} in SecureStore`);
    }
  } catch (error) {
    console.error(`Error saving ${key} to SecureStore:`, error);
  }
}

interface VerifyOtpResponse {
  token: string;
  user: IUser;
}

export default function SignupScreen() {
  const router = useRouter();
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isPressing, setIsPressing] = useState(false);
  const [requesId, setRequesId] = useState<string>('');
  const { isAuthenticated, setAuthenticated, setIsNewUser } = useAuthStore();
  const {setUser, user} = useUserStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<Array<TextInput | null>>([]);
  const {expoPushToken} = useNotification();
  
  const [authState, setAuthState] = useState<{
    status: 'idle' | 'loading' | 'error';
    error: null | { message: string };
  }>({
    status: 'idle',
    error: null
  });

  const [showReferralScreen, setShowReferralScreen] = useState(false);
  const [referralCode, setReferralCode] = useState('');

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

  const handlePhoneLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setAuthState({
        status: 'error',
        error: { message: 'Please enter a valid phone number' }
      });
      return;
    }

    setAuthState({ status: 'loading', error: null });
    
    try {
      const formattedPhoneNumber = `+91${phoneNumber}`;
      const response = await apiClient<{ requestId: string }>(LOGIN, 'POST', { phoneNumber: formattedPhoneNumber });
      
      if (response.success && response.data) {
        setShowOtp(true);
        setRequesId(response.data.requestId);
        setAuthState({ status: 'idle', error: null });
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setAuthState({
          status: 'error',
          error: { message: response.message || 'Failed to send OTP. Please try again.' }
        });
      }
    } catch (error) {
      setAuthState({
        status: 'error',
        error: { message: 'Network error. Please check your connection.' }
      });
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if(!requesId) {
      setAuthState({
        status: 'error',
        error: { message: 'Please send OTP first' }
      });
      return;
    }
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setAuthState({
        status: 'error',
        error: { message: 'Please enter the complete 6-digit OTP' }
      });
      return;
    }

    setAuthState({ status: 'loading', error: null });
    
    try {
      const formattedPhoneNumber = `+91${phoneNumber}`;
      const response = await apiClient<VerifyOtpResponse>(VERIFY_OTP, 'POST', { 
        requestId: requesId,
        otp: otpString,
        phoneNumber: formattedPhoneNumber
      });
      
      if (response.success && response.data) {
        await save('token', response.data.token);
        const responseData = response.data as VerifyOtpResponse;

        setAuthenticated(true);
        setUser(responseData.user);
        if(!responseData.user.expoPushToken || responseData.user.expoPushToken === '' && expoPushToken && responseData.user.expoPushToken !== expoPushToken) {
          const res = await apiClient(UPDATE_EXPO_PUSH_TOKEN(response.data.user.id), 'POST', { 
            expoPushToken: expoPushToken
          });
        }
        
        if (!responseData.user.isReferralCodeUsed) {
          setShowReferralScreen(true);
          setIsNewUser(!user?.isReferralCodeUsed);
          setAuthState({ status: 'idle', error: null });
        } else {
          setIsNewUser(!user?.isReferralCodeUsed);
          router.replace('/(tabs)');
        }
      } else {
        setAuthState({
          status: 'error',
          error: { message: response.message || 'Invalid OTP. Please try again.' }
        });
      }
    } catch (error) {
      setAuthState({
        status: 'error',
        error: { message: 'Network error. Please check your connection.' }
      });
    }
  };

  const handleSubmitReferralCode = async (code: string) => {
    setAuthState({ status: 'loading', error: null });
    
    try {
      const user = useUserStore.getState().user;
      const response = await apiClient(REFERRAL_CODE(user?.id || ''), 'PATCH', { 
        referralCode: code 
      });
      
      if (response.success) {
        setAuthState({ status: 'idle', error: null });
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
  };

  const handleSkipReferral = async () => {
    await handleSubmitReferralCode('');
    setAuthState({ status: 'idle', error: null });
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <View style={styles.backgroundContainer}>
          </View>

          <View style={styles.overlay}>
            <View style={styles.contentWrapper}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />

              <View style={styles.contentContainer}>
                {!showReferralScreen ? (
                  <>
                    <Text style={styles.title}>Play Fantasy Cricket for free and win IPL Tickets</Text>

                    {authState.status === 'error' && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                          {authState.error?.message || 'Authentication error'}
                        </Text>
                      </View>
                    )}

                    {!showOtp ? (
                      <View style={styles.authContainer}>
                        <View style={styles.phoneInputContainer}>
                          <Text style={styles.phonePrefix}>+91</Text>
                          <TextInput
                            style={styles.phoneInput}
                            placeholder="Enter phone number"
                            placeholderTextColor="#aaa"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                          />
                        </View>
                        
                        <Animated.View style={{
                          transform: [{ scale: pulseAnim }],
                          width: '100%',
                        }}>
                          <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={handlePhoneLogin}
                            disabled={authState.status === 'loading'}
                            activeOpacity={0.7}
                            onPressIn={() => setIsPressing(true)}
                            onPressOut={() => setIsPressing(false)}
                          >
                            <View style={[
                              styles.loginButton,
                              isPressing && styles.loginButtonPressed
                            ]}>
                              <View style={styles.buttonContent}>
                                {authState.status === 'loading' ? (
                                  <ActivityIndicator size="small" color="#000" />
                                ) : (
                                  <>
                                    <Text style={styles.loginButtonText}>Send OTP</Text>
                                    <View style={styles.glow} />
                                  </>
                                )}
                              </View>
                            </View>
                          </TouchableOpacity>
                        </Animated.View>
                      </View>
                    ) : (
                      <View style={styles.authContainer}>
                        <Text style={styles.otpTitle}>Enter Verification Code</Text>
                        <Text style={styles.otpSubtitle}>
                          We've sent a 6-digit code to {phoneNumber}
                        </Text>
                        
                        <View style={styles.otpContainer}>
                          {otp.map((digit, index) => (
                            <TextInput
                              key={index}
                              ref={(ref) => {
                                otpInputRefs.current[index] = ref;
                              }}
                              style={styles.otpInput}
                              value={digit}
                              onChangeText={(text) => handleOtpChange(text, index)}
                              onKeyPress={(e) => handleKeyPress(e, index)}
                              keyboardType="number-pad"
                              maxLength={1}
                            />
                          ))}
                        </View>
                        
                        <Animated.View style={{
                          transform: [{ scale: pulseAnim }],
                          width: '100%',
                        }}>
                          <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={handleVerifyOtp}
                            disabled={authState.status === 'loading'}
                            activeOpacity={0.7}
                            onPressIn={() => setIsPressing(true)}
                            onPressOut={() => setIsPressing(false)}
                          >
                            <View style={[
                              styles.loginButton,
                              isPressing && styles.loginButtonPressed
                            ]}>
                              <View style={styles.buttonContent}>
                                {authState.status === 'loading' ? (
                                  <ActivityIndicator size="small" color="#000" />
                                ) : (
                                  <>
                                    <Text style={styles.loginButtonText}>Verify OTP</Text>
                                    <View style={styles.glow} />
                                  </>
                                )}
                              </View>
                            </View>
                          </TouchableOpacity>
                        </Animated.View>
                        
                        <TouchableOpacity 
                          style={styles.resendContainer}
                          onPress={handlePhoneLogin}
                          disabled={authState.status === 'loading'}
                        >
                          <Text style={styles.resendText}>Resend OTP</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <View style={styles.referralWrapper}>
                      <Text style={styles.referralHeading}>Invite & Earn</Text>
                      <Text style={styles.referralSubheading}>Get bonus points when you enter a friend's referral code</Text>
                      <Referral 
                        onSubmit={handleSubmitReferralCode}
                        errorMessage={authState.status === 'error' ? authState.error?.message : undefined}
                        isLoading={authState.status === 'loading'}
                      />
                      <TouchableOpacity 
                        style={styles.skipButton}
                        onPress={handleSkipReferral}
                      >
                        <Text style={styles.skipButtonText}>Skip</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {authState.status === 'loading' && !showReferralScreen && (
                  <Text style={styles.loadingText}>
                    {showOtp ? 'Verifying...' : 'Sending OTP...'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 80,
    width: 120,
    height: 120,
  },
  contentContainer: {
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000',
  },
  authContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#000',
  },
  phonePrefix: {
    color: '#000',
    fontSize: 16,
    marginRight: 10,
    fontWeight: 'bold',
  },
  phoneInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    height: '100%',
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
    color: '#fff',
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
    marginTop: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  resendText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  buttonWrapper: {
    width: '80%',
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    alignSelf: 'center',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  loginButtonPressed: {
    backgroundColor: '#f0f0f0',
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    borderColor: 'rgba(0, 0, 0, 0.2)',
    opacity: 0.6,
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
    color: '#fff',
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    borderRadius: 5,
  },
  linkText: {
    color: '#fff',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000',
  },
  referralSubheading: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
});