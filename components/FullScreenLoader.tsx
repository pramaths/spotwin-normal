import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Vibration, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../assets/logo.svg';

export default function FullScreenLoader() {
  // All animations use the same driver type (JS-driven)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const glowOpacityAnim = useRef(new Animated.Value(0.3)).current;
  const glowSizeAnim = useRef(new Animated.Value(150)).current;

  useEffect(() => {
    // Improved vibration handling for both iOS and Android
    const startVibration = () => {
      try {
        // For Android, we can use patterns
        if (Platform.OS === 'android') {
          // More noticeable pattern: vibrate for 100ms, pause for 200ms, vibrate for 200ms
          const pattern = [0, 100, 200, 200, 200, 300];
          
          // Start immediate vibration
          Vibration.vibrate(pattern, true); // true means repeat until canceled
          
          return () => Vibration.cancel();
        } 
        // For iOS, we need to use simpler vibrations
        else {
          // iOS doesn't support patterns as well, so we'll use a timer approach
          Vibration.vibrate(500); // Initial longer vibration
          
          const interval = setInterval(() => {
            Vibration.vibrate(300);
          }, 1000); // Vibrate every second
          
          return () => {
            clearInterval(interval);
            Vibration.cancel();
          };
        }
      } catch (error) {
        console.error('Vibration error:', error);
        return () => {};
      }
    };

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // Use JS driver consistently
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // Use JS driver consistently
        }),
      ])
    ).start();

    // Floating animation (up and down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateYAnim, {
          toValue: -10,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // Use JS driver consistently
        }),
        Animated.timing(translateYAnim, {
          toValue: 10,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // Use JS driver consistently
        }),
      ])
    ).start();

    // Glow size animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowSizeAnim, {
          toValue: 180,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowSizeAnim, {
          toValue: 150,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Glow opacity animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacityAnim, {
          toValue: 0.7,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowOpacityAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Opacity animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // Use JS driver consistently
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // Use JS driver consistently
        }),
      ])
    ).start();

    // Start vibration
    const cleanupVibration = startVibration();
    
    // Clean up all animations and vibrations when component unmounts
    return () => {
      if (cleanupVibration) cleanupVibration();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loaderContainer}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: translateYAnim }
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          <Logo width={100} height={100} />
        </Animated.View>
        <Animated.View 
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacityAnim,
              width: glowSizeAnim,
              height: glowSizeAnim,
              borderRadius: Animated.divide(glowSizeAnim, new Animated.Value(2)),
            }
          ]} 
        />
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
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoWrapper: {
    padding: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: '#1d9bf0',
    shadowColor: '#1d9bf0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 2,
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'rgba(29, 155, 240, 0.3)',
    zIndex: 1,
  },
});
