import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authstore';
import { SafeAreaView } from 'react-native-safe-area-context';

import SignupBg from '../../assets/images/signupbg.svg';
import TrophyIcon from '../../assets/icons/Trophy.svg';
import XIcon from '../../assets/icons/x.svg';
import GoogleIcon from '../../assets/icons/googleicon.svg';

export default function SignupScreen() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const router = useRouter();

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
          <TrophyIcon width={80} height={80} style={styles.trophyIcon} />

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Watch, Play, Win, Repeat</Text>
            <Text style={styles.subtitle}>
              Join contests, vote on videos, and earn rewards!
            </Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.twitterButton]}
                onPress={handleSignup}
              >
                <View style={styles.buttonContent}>
                  <XIcon width={20} height={20} />
                  <Text style={styles.twitterButtonText}>Sign in with Twitter</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.googleButton]}
                onPress={handleSignup}
              >
                <View style={styles.buttonContent}>
                  <GoogleIcon width={20} height={20}/>
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </View>
              </TouchableOpacity>
            </View>

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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },

  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  trophyIcon: {
    alignSelf: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
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
  },

  twitterButton: {
    backgroundColor: '#000',
  },
  twitterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  googleButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
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