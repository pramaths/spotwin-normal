import { useState, useEffect, useRef } from 'react';
import React from 'react';
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
import { IUser } from '../types';
import EmptyWalletIcon from '../assets/icons/empty-wallet.svg';
import ProfileScreen from './Profile';
import HowItWorksModal from './HowItWorksModal';
import { CircleHelp, X, Copy } from 'lucide-react-native'
import { usePrivy, useEmbeddedSolanaWallet } from '@privy-io/expo';
import * as web3 from '@solana/web3.js';
import { useFundSolanaWallet } from "@privy-io/expo";
import { fetchSolanaBalance, formatSolBalance } from '../utils/solanaUtils';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authstore';
import QRCode from 'react-native-qrcode-svg';

interface HeaderProfileProps {
  user?: IUser;
  onProfilePress?: () => void;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({
  onProfilePress,
}) => {
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [howItWorksModalVisible, setHowItWorksModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [signatureMessage, setSignatureMessage] = useState<string>('');
  const { fundWallet } = useFundSolanaWallet();
  const { wallets } = useEmbeddedSolanaWallet();
  const [solBalance, setSolBalance] = useState<number>(0);
  const { user, setUser } = useUserStore();
  const balanceUpdatedRef = useRef(false);
  const { isNewUser, setIsNewUser } = useAuthStore();
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallets || wallets.length === 0) {
        setSolBalance(0);
        balanceUpdatedRef.current = false;
        return;
      }
      
      try {
        const solBalance = await fetchSolanaBalance(wallets[0]?.address || '');
        const numBalance = Number(solBalance);
        setSolBalance(numBalance);
        
        // Only update user if we have a user and the balance hasn't been updated yet
        // or if the balance has changed
        if (user && (!balanceUpdatedRef.current || user.balance !== numBalance)) {
          setUser({
            ...user,
            balance: numBalance
          });
          balanceUpdatedRef.current = true;
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    
    fetchBalance();
  }, [wallets, setUser]); // Remove user from dependencies

  const handleWalletPress = () => {
    setDepositModalVisible(true);
  };

  const handleCopyAddress = () => {
    if (wallets && wallets.length > 0) {
      // Clipboard functionality would go here
      Alert.alert('Address copied to clipboard');
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      setProfileModalVisible(true);
    }
  };

  useEffect(() => {
    if (isNewUser) {
      setHowItWorksModalVisible(true);
    }
  }, [isNewUser]);

  const handleHowItWorksPress = () => {
    setHowItWorksModalVisible(true);
  };

  const closeProfileModal = () => {
    setProfileModalVisible(false);
  };

  const closeHowItWorksModal = () => {
    setIsNewUser(false);
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
            source={{ uri: user?.imageUrl }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>gm, {user?.twitterUsername}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.walletContainer}
            onPress={handleWalletPress}
            activeOpacity={0.7}
          >
             {solBalance > 0 && (
              <Text style={styles.balanceText}>{formatSolBalance(solBalance)}</Text>
            )}
            <View style={styles.walletIconWrapper}>
              <EmptyWalletIcon />
            </View>
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

      <Modal
        visible={depositModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setDepositModalVisible(false)}
            >
              <X size={20} color="#000" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Deposit SOL</Text>
            <Text style={styles.modalSubtitle}>Scan QR code or copy address</Text>

            <View style={styles.chainInfoBox}>
              <Text style={styles.chainInfoText}>Chain: Sonic</Text>
              <Text style={styles.bridgeInfoText}>Convert SOL to SNIC using Sonic Bridge</Text>
            </View>

            <View style={styles.qrContainer}>
              {wallets && wallets.length > 0 && (
                <QRCode
                  value={wallets[0].address}
                  size={200}
                  backgroundColor="white"
                />
              )}
            </View>

            <View style={styles.addressBox}>
              <Text style={styles.addressText}>{wallets && wallets.length > 0 ? wallets[0].address : 'No wallet connected'}</Text>
              <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
                <Copy size={20} color="#0504dc" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    fontSize: 14,
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
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 8,
    marginRight: 2,
    height: 40,
  },
  walletIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  balanceText: {
    color: '#0504dc',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  chainInfoBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  chainInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bridgeInfoText: {
    fontSize: 14,
    color: '#666',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    alignSelf: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
  },
  copyButton: {
    padding: 5,
  },
});

export default HeaderProfile;
