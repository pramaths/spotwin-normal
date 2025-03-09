import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Modal,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { User } from '../types';
import EmptyWalletIcon from '../assets/icons/empty-wallet.svg';
import ProfileScreen from './Profile';
import HowItWorksModal from './HowItWorksModal';
import { CircleHelp } from 'lucide-react-native'
import { usePrivy, useLoginWithSiws } from '@privy-io/expo';
import * as web3 from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

// Default user if none provided
const defaultUser: User = {
  id: '1',
  name: 'toly',
  avatar: 'https://pbs.twimg.com/profile_images/1896990528748593152/jU2rStOc_200x200.jpg'
};

interface HeaderProfileProps {
  user?: User;
  onProfilePress?: () => void;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({ 
  user = defaultUser, 
  onProfilePress,
}) => {
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [howItWorksModalVisible, setHowItWorksModalVisible] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [signatureMessage, setSignatureMessage] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Use only the properties that definitely exist in the usePrivy hook
  const { user: privyUser } = usePrivy();
  const { generateMessage, login } = useLoginWithSiws();

  // Check if user is already logged in with a wallet
  useEffect(() => {
    if (privyUser) {
      console.log('User already logged in:', privyUser);
      
      try {
        // Use type assertion to access the wallet information
        const linkedAccounts = privyUser.linked_accounts;
        
        if (linkedAccounts && Array.isArray(linkedAccounts) && linkedAccounts.length > 0) {
          // Try to find a wallet account
          for (const account of linkedAccounts) {
            if (account.type === 'wallet') {
              // Access wallet address using type assertion
              const walletAccount = account as any;
              if (walletAccount.wallet && walletAccount.wallet.address) {
                setWalletAddress(walletAccount.wallet.address);
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error accessing wallet address:', error);
      }
    }
  }, [privyUser]);

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      setProfileModalVisible(true);
    }
  };

  const handleHowItWorksPress = () => {
    setHowItWorksModalVisible(true);
  };

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      
      // Connect to external Solana wallet using Mobile Wallet Adapter
      try {
        // Use the Solana Mobile Wallet Adapter to connect to external wallets
        const result = await transact(async (wallet) => {
          // Request authorization from the wallet
          const authorizationResult = await wallet.authorize({
            cluster: 'mainnet-beta',
            identity: {
              name: '9Shoot',
              uri: 'https://9shoot.com',
              icon: 'https://9shoot.com/logo.png',
            },
          });
          
          // Get the wallet's public key
          const publicKey = authorizationResult.accounts[0].address;
          const walletAddress = publicKey;
          
          // Set the wallet address in state
          setWalletAddress(walletAddress);
          
          // Generate a message for signing
          const messageResult = await generateMessage({
            from: {
              domain: '9shoot.com',
              uri: 'https://9shoot.com'
            },
            wallet: {
              address: walletAddress
            }
          });
          
          if (!messageResult || !messageResult.message) {
            throw new Error('Failed to generate message');
          }
          
          setSignatureMessage(messageResult.message);
          
          // Request the wallet to sign the message
          const messageBuffer = new TextEncoder().encode(messageResult.message);
          const signedMessages = await wallet.signMessages({
            addresses: [publicKey],
            payloads: [messageBuffer],
          });
          
          // Convert the signature to a string format that Privy expects
          const signature = Buffer.from(signedMessages[0]).toString('hex');
          
          // Login with SIWS using the signature
          const loginResult = await login({
            signature,
            message: messageResult.message,
            wallet: {
              walletClientType: 'phantom', // or detect from wallet.name if available
              connectorType: 'mobile_wallet_protocol'
            }
          });
          
          console.log('Login successful:', loginResult);
          return { success: true, address: walletAddress };
        });
        
        if (result && result.success) {
          console.log('Wallet connected successfully:', result.address);
        } else {
          throw new Error('Wallet connection failed');
        }
      } catch (walletError) {
        console.error('Error connecting to wallet:', walletError);
        
        // If mobile wallet adapter fails, show a fallback alert
        Alert.alert(
          'Wallet Connection',
          'Would you like to try connecting to a wallet?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setIsConnecting(false);
              }
            },
            {
              text: 'Connect Wallet',
              onPress: async () => {
                // Fallback to a simpler approach or direct users to install a wallet
                Alert.alert(
                  'Install Wallet',
                  'Please install Phantom or Backpack wallet to continue.',
                  [
                    {
                      text: 'OK',
                      onPress: () => setIsConnecting(false)
                    }
                  ]
                );
              }
            }
          ]
        );
        return;
      }
      
      setIsConnecting(false);
    } catch (error) {
      console.error('Error in wallet connection flow:', error);
      Alert.alert('Error', 'Failed to connect wallet. Please try again.');
      setIsConnecting(false);
    }
  };

  const closeProfileModal = () => {
    setProfileModalVisible(false);
  };

  const closeHowItWorksModal = () => {
    setHowItWorksModalVisible(false);
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileContainer} 
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: user.avatar }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>gm, {user.name}</Text>
            {walletAddress ? (
              <Text style={styles.walletText}>
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleConnectWallet}
            activeOpacity={0.7}
            disabled={isConnecting}
          >
            <EmptyWalletIcon />
            {isConnecting && <View style={styles.connectingIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleHowItWorksPress}
            activeOpacity={0.7}
          >
            <CircleHelp color='#000' size={28} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={closeProfileModal}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
          <ProfileScreen onClose={closeProfileModal} />
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={howItWorksModalVisible}
        onRequestClose={closeHowItWorksModal}
      >
        <HowItWorksModal visible={howItWorksModalVisible} onClose={closeHowItWorksModal} />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  walletText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  connectingIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
});

export default HeaderProfile;
