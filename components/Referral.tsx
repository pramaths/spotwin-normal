import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { ClipboardPaste, ArrowRight } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

interface ReferralProps {
  onSubmit?: (code: string) => void;
  errorMessage?: string;
  isLoading?: boolean;
}

const { width } = Dimensions.get('window');

const Referral: React.FC<ReferralProps> = ({ onSubmit, errorMessage, isLoading = false }) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isPasting, setIsPasting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsSubmitting(isLoading);
  }, [isLoading]);

  useEffect(() => {
    const fullCode = code.join('');
    setIsValid(fullCode.length === 6);
  }, [code]);

  const handleInputChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text
    setCode(newCode);
  
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus(); 
    }
  };
  
  const handleKeyPress = (e: any, index: number) => {
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
    
    const fullCode = code.join('');
    
    // Pass the code to the parent component
    if (onSubmit) {
      onSubmit(fullCode);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Referral Code</Text>
      <Text style={styles.subtitle}>
        Enter a friend's referral code to claim your bonus rewards
      </Text>

      <Animated.View 
        style={[
          styles.inputContainer, 
          { transform: [{ translateX: shakeAnimation }] }
        ]}
      >
        <View style={styles.inputBoxWrapper}>
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
              keyboardType="default"
              autoCorrect={false}
              placeholderTextColor="#444"
            />
          ))}
        </View>
      </Animated.View>

      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.pasteButton} 
          onPress={handlePaste}
          disabled={isPasting || isLoading}
        >
          <ClipboardPaste size={18} color="white" />
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
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <Text style={[styles.submitButtonText, isValid && styles.submitButtonTextActive]}>Verifying...</Text>
          ) : (
            <>
              <Text style={[styles.submitButtonText, isValid && styles.submitButtonTextActive]}>Submit</Text>
              <ArrowRight size={18} color={isValid ? "#fff" : "#fff"} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#0032ff',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputBoxWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
  },
  inputBox: {
    width: 48,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0032ff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'transparent',
    color: '#333',
  },
  filledInputBox: {
    borderColor: '#1d9bf0',
    backgroundColor: '#f0f9ff',
    color: '#1d9bf0',
  },
  errorInputBox: {
    borderColor: '#ff5252',
    backgroundColor: '#fff0f0',
  },
  errorMessage: {
    color: '#ff5252',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1d9bf0',
    backgroundColor: '#0032ff',
  },
  pasteButtonText: {
    marginLeft: 6,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#0032ff',
    gap: 8,
  },
  submitButtonActive: {
    backgroundColor: '#1d9bf0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonTextActive: {
    color: '#fff',
  },
});

export default Referral;
