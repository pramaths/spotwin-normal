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
import { usePrivy, useEmbeddedSolanaWallet } from '@privy-io/expo';
import * as web3 from '@solana/web3.js';
import { useFundSolanaWallet } from "@privy-io/expo";
import { fetchSolanaBalance, formatSolBalance } from '../utils/solanaUtils';
import { useUserStore } from '../store/userStore';

interface HeaderProfileProps {
  user?: User;
  onProfilePress?: () => void;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({
  onProfilePress,
}) => {
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [howItWorksModalVisible, setHowItWorksModalVisible] = useState(false);
  const [signatureMessage, setSignatureMessage] = useState<string>('');
  const { fundWallet } = useFundSolanaWallet();
  const { wallets } = useEmbeddedSolanaWallet();
  const [solBalance, setSolBalance] = useState<number>(0);
  const { user } = useUserStore();
  
  useEffect(() => {
    if (!wallets || wallets.length === 0) {
      setSolBalance(0);
      return;
    }
    const solBalance = fetchSolanaBalance(wallets[0]?.address || '');
    setSolBalance(Number(solBalance));
  }, [wallets])


  const handleFundwallet = async () => {
    if (!wallets || wallets.length === 0) return;

    await fundWallet({
      address: wallets[0].address,
      asset: 'native-currency',
      amount: "0.2",
    });
  }

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
            source={{ uri: user?.imageUrl }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>gm, {user?.twitterUsername}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleFundwallet}
            activeOpacity={0.7}
          >
            <EmptyWalletIcon />
            { }
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
