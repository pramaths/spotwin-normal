import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Keyboard,
  Dimensions
} from 'react-native';
import { ClipboardPaste, ArrowRight, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

interface ReferralProps {
  onSubmit?: (code: string) => void;
}

const { width } = Dimensions.get('window');

const Referral: React.FC<ReferralProps> = ({ onSubmit }) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isPasting, setIsPasting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  
  // Animation values
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check if code is complete and valid
    const fullCode = code.join('');
    setIsValid(fullCode.length === 6);
  }, [code]);

  const handleInputChange = (text: string, index: number) => {
    if (/^[a-zA-Z0-9]$/.test(text) || text === '') {
      const newCode = [...code];
      newCode[index] = text.toUpperCase();
      setCode(newCode);
      
      // Move to next input if character entered
      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const animateShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear
      })
    ]).start();
  };

  const animateSuccess = () => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.timing(successScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.elastic(1)
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true
        })
      ])
    ]).start();
  };

  const handlePaste = async () => {
    try {
      setIsPasting(true);
      const clipboardContent = await Clipboard.getStringAsync();
      
      if (clipboardContent) {
        // Keep only alphanumeric characters
        const cleanContent = clipboardContent.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
        
        if (cleanContent.length > 0) {
          const newCode = Array(6).fill('');
          for (let i = 0; i < Math.min(cleanContent.length, 6); i++) {
            newCode[i] = cleanContent[i].toUpperCase();
          }
          setCode(newCode);
          
          // Focus the last filled input or the next empty one
          const focusIndex = Math.min(cleanContent.length, 6) - 1;
          setTimeout(() => {
            inputRefs.current[focusIndex]?.focus();
          }, 100);
        }
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    } finally {
      setIsPasting(false);
    }
  };

  const handleSubmit = () => {
    if (!isValid) {
      animateShake();
      return;
    }
    
    setIsSubmitting(true);
    const fullCode = code.join('');
    
    setTimeout(() => {
      setIsSubmitting(false);
      animateSuccess();
      
      if (onSubmit) {
        onSubmit(fullCode);
      }
    }, 1000);
  };

  const resetForm = () => {
    setCode(Array(6).fill(''));
    setShowSuccess(false);
    successScale.setValue(0);
    successOpacity.setValue(0);
    checkmarkScale.setValue(0);
    inputRefs.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Referral Code</Text>
      <Text style={styles.subtitle}>
        Enter the 6-character code from your friend to claim your bonus
      </Text>

      {!showSuccess ? (
        <>
          <Animated.View 
            style={[
              styles.inputContainer, 
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                style={[
                  styles.inputBox,
                  digit ? styles.filledInputBox : {},
                  (isSubmitting && !digit) ? styles.errorInputBox : {}
                ]}
                value={digit}
                onChangeText={text => handleInputChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                maxLength={1}
                autoCapitalize="characters"
                keyboardType="default"
                autoCorrect={false}
              />
            ))}
          </Animated.View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.pasteButton} 
              onPress={handlePaste}
              disabled={isPasting || isSubmitting}
            >
              <ClipboardPaste size={18} color="#6366F1" />
              <Text style={styles.pasteButtonText}>
                {isPasting ? 'Pasting...' : 'Paste Code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.submitButton,
                isValid ? styles.submitButtonActive : {}
              ]} 
              onPress={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Verifying...</Text>
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Submit</Text>
                  <ArrowRight size={18} color={isValid ? "#fff" : "#9EA3AE"} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Animated.View 
          style={[
            styles.successContainer,
            {
              opacity: successOpacity,
              transform: [{ scale: successScale }]
            }
          ]}
        >
          <View style={styles.checkmarkCircle}>
            <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
              <Check size={32} color="#fff" />
            </Animated.View>
          </View>
          <Text style={styles.successTitle}>Code Applied!</Text>
          <Text style={styles.successMessage}>
            You've successfully applied the referral code. Your bonus will be credited to your account.
          </Text>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={resetForm}
          >
            <Text style={styles.doneButtonText}>Enter Another Code</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  inputBox: {
    width: Math.min(48, (width - 60) / 6),
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filledInputBox: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  errorInputBox: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  pasteButtonText: {
    color: '#6366F1',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 120,
  },
  submitButtonActive: {
    backgroundColor: '#6366F1',
  },
  submitButtonText: {
    color: '#9EA3AE',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  checkmarkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  doneButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Referral;
