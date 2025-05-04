import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Easing, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image, ScrollView, Alert } from 'react-native';
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
import * as Haptics from 'expo-haptics';
import { ToastAndroid } from 'react-native';
import { CountryPicker } from "react-native-country-codes-picker";
import { MaterialIcons } from '@expo/vector-icons';

async function save(key: string, value: string) {
  try {
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
  isNewUser: boolean;
}

export default function SignupScreen() {
  const router = useRouter();
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isPressing, setIsPressing] = useState(false);
  const [requesId, setRequesId] = useState<string>('');
  const { setAuthenticated, setIsNewUser } = useAuthStore();
  const { setUser, user } = useUserStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<Array<TextInput | null>>([]);
  const { expoPushToken } = useNotification();
  const sendOtpButtonRef = useRef(null);
  const [authState, setAuthState] = useState<{
    status: 'idle' | 'loading' | 'error' | 'skipped';
    error: null | { message: string };
  }>({
    status: 'idle',
    error: null
  });

  const [showReferralScreen, setShowReferralScreen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const otpSubmitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

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

  const handlePhoneLogin = async (resend?: boolean) => {
    if (sendingOtp) return;
    if (!phoneNumber || phoneNumber.length < 10) {
      setAuthState({
        status: 'error',
        error: { message: 'Please enter a valid phone number' }
      });
      return;
    }

    setSendingOtp(true);
    if (!resend) {
      setAuthState({ status: 'loading', error: null });
    }

    try {
      const formattedPhoneNumber = `${countryCode}${phoneNumber}`;
      const response = await apiClient<{ requestId: string }>(LOGIN, 'POST', { phoneNumber: formattedPhoneNumber });

      if (response.success && response.data) {
        setOtpSent(true);
        setRequesId(response.data.requestId);
        setSendingOtp(false);

        setAuthState({
          status: 'idle',
          error: null
        });
        if (Platform.OS === 'ios') {
          Alert.alert('OTP sent', 'Please check your phone for the OTP');
        }else{
        ToastAndroid.show('OTP sent, Please check your phone for the OTP', ToastAndroid.BOTTOM);
        }


        setTimeout(() => {
          setShowOtp(true);
          setTimeout(() => {
            otpInputRefs.current[0]?.focus();
          }, 100);
        }, 300);
      } else {
        setSendingOtp(false);
        setAuthState({
          status: 'error',
          error: { message: response.message || 'Failed to send OTP. Please try again.' }
        });
      }
    } catch (error) {
      setSendingOtp(false);
      setAuthState({
        status: 'error',
        error: { message: 'Network error. Please check your connection.' }
      });
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    if (otpError) {
      setOtpError(null);
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move focus logic here
    if (text && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    } else if (text && index === 5) {
      otpInputRefs.current[5]?.blur();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpString?: string) => {
    const code = otpString ?? otp.join('');
    if (otpSubmitTimeoutRef.current) {
      clearTimeout(otpSubmitTimeoutRef.current);
      otpSubmitTimeoutRef.current = null;
    }

    if (code.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP');

      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setOtpError(null);
      }, 3000);

      return;
    }

    setAuthState({ status: 'loading', error: null });
    setOtpError(null);

    try {
      const formattedPhoneNumber = `${countryCode}${phoneNumber}`;
      const response = await apiClient<VerifyOtpResponse>(VERIFY_OTP, 'POST', {
        requestId: requesId,
        otp: code,
        phoneNumber: formattedPhoneNumber
      });

      if (response.success && response.data) {
        await save('token', response.data.token);
        const responseData = response.data as VerifyOtpResponse;
        setIsNewUser(responseData.isNewUser);
        setAuthenticated(true);
        setUser(responseData.user);
        if (
          (!responseData.user.expoPushToken || responseData.user.expoPushToken === '') && expoPushToken ||
          responseData.user.expoPushToken !== expoPushToken
        ) {
          await apiClient(UPDATE_EXPO_PUSH_TOKEN(response.data.user.id), 'POST', {
            expoPushToken: expoPushToken
          });
        }

        if (responseData.isNewUser) {
          setShowReferralScreen(true);
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setOtpError(response.message || 'Invalid OTP. Please try again.');
        setAuthState({
          status: 'error',
          error: { message: response.message || 'Invalid OTP. Please try again.' }
        });

        // Clear error message after 3 seconds
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
        errorTimeoutRef.current = setTimeout(() => {
          setOtpError(null);
        }, 3000);
      }
    } catch (error) {
      setOtpError('Network error. Please check your connection.');
      setAuthState({
        status: 'error',
        error: { message: 'Network error. Please check your connection.' }
      });

      // Clear error message after 3 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setOtpError(null);
      }, 3000);
    }
  };

  const handleSubmitReferralCode = async (code: string) => {
    if (code.length === 0) {
      setAuthState({ status: 'skipped', error: null });
      try {
        const user = useUserStore.getState().user;
        const response = await apiClient(REFERRAL_CODE(user?.id || ''), 'PATCH', {
          referralCode: code
        });
      } catch (error) {
        setAuthState({
          status: 'error',
          error: { message: 'Network error. Please check your connection.' }
        });
      }
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

  const handleSendOTPPress = () => {
    if (Platform.OS === 'ios' && 'impactAsync' in Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (sendingOtp) return;
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 150);

    if (keyboardVisible) {
      Keyboard.dismiss();
      setTimeout(() => {
        handlePhoneLogin();
      }, 20);
    } else {
      handlePhoneLogin();
    }
  };

  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleVerifyOtp();
    }
  }, [otp]);

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (otpSubmitTimeoutRef.current) {
        clearTimeout(otpSubmitTimeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
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
                  showOtp && styles.logoContainerOtpShown,
                  { backgroundColor: '#fff' }
                ]}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={[
                      styles.logo,
                      keyboardVisible && styles.logoSmall,
                      showOtp && styles.logoSmall
                    ]}
                    resizeMode="contain"
                  />
                </View>

                <View style={[styles.contentContainer, { backgroundColor: '#fff' }]}>
                  <Text style={[
                    styles.title,
                    keyboardVisible && styles.titleKeyboardShown,
                    showOtp && styles.titleOtpShown,
                    { backgroundColor: '#fff' }
                  ]}>
                    Play Fantasy Cricket for free and win IPL Tickets
                  </Text>

                  {authState.status === 'error' && (
                    <View style={[styles.errorContainer, { backgroundColor: '#fff' }]}>
                      <Text style={styles.errorText}>
                        {authState.error?.message || 'Authentication error'}
                      </Text>
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
                  ) : !showOtp ? (
                    <View style={[styles.authContainer, { backgroundColor: '#fff' }]}>
                      <View style={styles.phoneInputContainer}>
                        <TouchableOpacity
                          style={styles.countryCodeButton}
                          onPress={() => setShowCountryPicker(true)}
                        >
                          <Text style={styles.countryCodeText}>{countryCode}</Text>
                          <MaterialIcons name="keyboard-arrow-down" size={20} color="#000" />
                        </TouchableOpacity>
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

                      <CountryPicker
                        lang='en'
                        show={showCountryPicker}
                        pickerButtonOnPress={(item) => {
                          setCountryCode(item.dial_code);
                          setShowCountryPicker(false);
                        }}
                        onBackdropPress={() => setShowCountryPicker(false)}
                        enableModalAvoiding={false}
                        inputPlaceholder="Search country..."
                        style={{
                          modal: {
                            height: 400,
                            backgroundColor: '#1e1e1e',
                            paddingTop: 10
                          },
                          countryButtonStyles: {
                            backgroundColor: '#2a2a2a',
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10,
                            paddingHorizontal: 15
                          },
                          textInput: {
                            color: 'white',
                            backgroundColor: '#2a2a2a',
                            width: '100%',
                            zIndex: 1,
                            paddingVertical: 12,
                            paddingHorizontal: 15
                          },
                          countryName: {
                            color: 'white'
                          },
                          dialCode: {
                            color: 'white'
                          },
                          flag: {
                            marginRight: 10,
                            zIndex: 2
                          }
                        }}
                      />

                      {otpSent && !showOtp && (
                        <View style={styles.successContainer}>
                          <Text style={styles.successText}>OTP sent successfully!</Text>
                        </View>
                      )}

                      <Animated.View style={{
                        transform: [{ scale: pulseAnim }],
                        width: '100%',
                      }}>
                        <TouchableOpacity
                          ref={sendOtpButtonRef}
                          style={styles.buttonWrapper}
                          onPress={handleSendOTPPress}
                          disabled={sendingOtp}
                          activeOpacity={0.5}
                          onPressIn={() => setIsPressing(true)}
                          onPressOut={() => setIsPressing(false)}
                          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                          pressRetentionOffset={{ top: 30, bottom: 30, left: 30, right: 30 }}
                        >
                          <View style={[
                            styles.loginButton,
                            isPressing && styles.loginButtonPressed
                          ]}>
                            <View style={styles.buttonContent}>
                              {sendingOtp ? (
                                <>
                                  <ActivityIndicator size="small" color="#000" />
                                  <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>Sending OTP...</Text>
                                </>
                              ) : (
                                <>
                                  <Text style={styles.loginButtonText}>Continue</Text>
                                  <View style={styles.glow} />
                                </>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                  ) : (
                    <View style={[styles.authContainer, { backgroundColor: '#fff' }]}>
                      <Text style={styles.otpTitleNoBorder}>Enter Verification Code</Text>
                      <Text style={styles.otpSubtitleNoBorder}>
                        We've sent a 6-digit code to {countryCode} {phoneNumber}
                      </Text>

                      <View style={styles.otpContainer}>
                        {otp.map((digit, index) => {
                          return (
                            <TextInput
                              key={index.toString()}
                              ref={(ref: TextInput | null) => {
                                otpInputRefs.current[index] = ref;
                              }}
                              style={styles.otpInput}
                              value={digit}
                              onChangeText={(text) => handleOtpChange(text, index)}
                              onKeyPress={(e) => handleKeyPress(e, index)}
                              keyboardType="number-pad"
                              autoComplete='sms-otp'
                              maxLength={1}
                            />
                          );
                        })}
                      </View>

                      {otpError && (
                        <View style={styles.otpErrorContainer}>
                          <Text style={styles.otpErrorText}>{otpError}</Text>
                        </View>
                      )}

                      <Animated.View style={{
                        transform: [{ scale: pulseAnim }],
                        width: '100%',
                      }}>
                        <TouchableOpacity
                          style={styles.buttonWrapper}
                          onPress={() => {
                            // Add haptic feedback
                            if (Platform.OS === 'ios' && 'impactAsync' in Haptics) {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }

                            // Visual feedback
                            setIsPressing(true);
                            setTimeout(() => setIsPressing(false), 150);

                            if (keyboardVisible) {
                              Keyboard.dismiss();
                              setTimeout(handleVerifyOtp, 20);
                            } else {
                              handleVerifyOtp();
                            }
                          }}
                          disabled={authState.status === 'loading'}
                          activeOpacity={0.7}
                          onPressIn={() => setIsPressing(true)}
                          onPressOut={() => setIsPressing(false)}
                          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                          pressRetentionOffset={{ top: 30, bottom: 30, left: 30, right: 30 }}
                        >
                          <View style={[
                            styles.loginButton,
                            isPressing && styles.loginButtonPressed
                          ]}>
                            <View style={styles.buttonContent}>
                              {authState.status === 'loading' ? (
                                <>
                                  <ActivityIndicator size="small" color="#000" />
                                  <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>Logging in...</Text>
                                </>
                              ) : (
                                <>
                                  <Text style={styles.loginButtonText}>Login</Text>
                                  <View style={styles.glow} />
                                </>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      </Animated.View>

                      <TouchableOpacity
                        style={styles.resendContainer}
                        onPress={() => {
                          if (Platform.OS === 'ios' && 'impactAsync' in Haptics) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }

                          if (keyboardVisible) {
                            Keyboard.dismiss();
                            setTimeout(handlePhoneLogin, 20);
                          } else {
                            handlePhoneLogin(true);
                          }
                        }}
                        disabled={authState.status === 'loading'}
                        activeOpacity={0.6}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                      >
                        <Text style={styles.resendText}>Resend OTP</Text>
                      </TouchableOpacity>
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
  loginButtonPressed: {
    backgroundColor: '#e0e0e0',
    transform: [{ scale: 0.96 }],
    borderWidth: 2,
    borderColor: '#444',
  },
  loginButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
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