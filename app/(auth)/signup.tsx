import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Animated, Easing, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authstore';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import SignupBg from '../../assets/images/signupbg.svg';
import Logo from '../../assets/logo.svg';
import XIcon from '../../assets/icons/x.svg';
import apiClient from '@/utils/api';
import { LOGIN, VERIFY_OTP, REFERRAL_CODE } from '@/routes/api';
import { IUser } from '@/types';
import Referral from '@/components/Referral';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '@/store/userStore';

async function save(key: string, value: string) {
  try {
    console.log(`Attempting to save ${key} to SecureStore`);
    await SecureStore.setItemAsync(key, value);
    
    // Verify the save worked
    const savedValue = await SecureStore.getItemAsync(key);
    if (savedValue === value) {
      console.log(`Successfully saved and verified ${key} in SecureStore`);
    } else {
      console.error(`Failed to verify ${key} in SecureStore`);
    }
  } catch (error) {
    console.error(`Error saving ${key} to SecureStore:`, error);
    // As a fallback, we could use AsyncStorage, but that's less secure
    // This would require importing AsyncStorage
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
        
        if (!responseData.user.isReferralCodeUsed) {
          setShowReferralScreen(true);
          setUser(responseData.user);
          setIsNewUser(true);
          setAuthState({ status: 'idle', error: null });
        } else {
          setIsNewUser(false);
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
        referralCode: code || null 
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
            <SignupBg width={Dimensions.get('window').width} height="100%" preserveAspectRatio="xMidYMid slice" />
          </View>

          <View style={styles.overlay}>
            <View style={styles.contentWrapper}>
              <Logo width={80} height={80} style={styles.trophyIcon} />

              <View style={styles.contentContainer}>
                {!showReferralScreen ? (
                  <>
                    <Text style={styles.title}>Watch, Play, Win, Repeat</Text>
                    <Text style={styles.subtitle}>
                      Join contests, vote on videos, and earn rewards!
                    </Text>

                    {authState.status === 'error' && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                          {authState.error?.message || 'Authentication error'}
                        </Text>
                      </View>
                    )}

                    {!showOtp ? (
                      // Phone Number Input UI
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
                                  <ActivityIndicator size="small" color="#fff" />
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
                                  <ActivityIndicator size="small" color="#fff" />
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
                      <Text style={styles.referralSubheading}>Get bonus rewards when you enter a friend's referral code</Text>
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

                {!showReferralScreen && (
                  <Text style={styles.footerText}>
                    By signing in, you agree to the{' '}
                    <Text style={styles.linkText}>User Agreement</Text> &{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
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
    backgroundColor: '#fff',
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
    paddingBottom: 40,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  trophyIcon: {
    alignSelf: 'center',
    marginBottom: 120,
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
    marginBottom: 30,
    paddingHorizontal: 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  phonePrefix: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    textAlign: 'center',
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  resendContainer: {
    marginTop: 15,
  },
  resendText: {
    color: '#1d9bf0',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  buttonWrapper: {
    width: '80%',
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: '#1d9bf0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    alignSelf: 'center',

  },
  loginButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1d9bf0',
  },
  loginButtonPressed: {
    backgroundColor: '#111',
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    color: '#fff',
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
  skipButton: {
    marginTop: 20,
    padding: 12,
    alignSelf: 'center',
  },
  skipButtonText: {
    color: '#9EA3AE',
    fontSize: 16,
    textDecorationLine: 'underline',
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
  },
  referralSubheading: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
});