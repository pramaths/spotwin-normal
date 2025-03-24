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
import { LOGIN, VERIFY_OTP } from '@/routes/api';

interface AuthState {
  isAuthenticated: boolean;
  isNewUser: boolean;
  setAuthenticated: (value: boolean) => void;
  setIsNewUser: (value: boolean) => void;
}

interface VerifyOtpResponse {
  token: string;
  user: {
    id: string;
    hasCompletedOnboarding: boolean;
    [key: string]: any;
  };
}

export default function SignupScreen() {
  const setAuthenticated = useAuthStore((state: AuthState) => state.setAuthenticated);
  const router = useRouter();
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isPressing, setIsPressing] = useState(false);
  const setIsNewUser = useAuthStore((state: AuthState) => state.setIsNewUser);
  const { isAuthenticated } = useAuthStore();
  
  // Phone and OTP states
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
      const response = await apiClient(LOGIN, 'POST', { phone: phoneNumber });
      
      if (response.success) {
        setShowOtp(true);
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

    // Auto-focus next input
    if (text && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current input is empty
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
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
      const response = await apiClient<VerifyOtpResponse>(VERIFY_OTP, 'POST', { 
        phone: phoneNumber,
        otp: otpString 
      });
      
      if (response.success && response.data) {
        // Store the JWT token
        const responseData = response.data as VerifyOtpResponse;
        
        // Set authentication state
        setAuthenticated(true);
        setIsNewUser(!responseData.user.hasCompletedOnboarding);
        
        // Navigate to main app
        router.replace('/(tabs)');
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
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
                  // OTP Verification UI
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

                {authState.status === 'loading' && (
                  <Text style={styles.loadingText}>
                    {showOtp ? 'Verifying...' : 'Sending OTP...'}
                  </Text>
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
});