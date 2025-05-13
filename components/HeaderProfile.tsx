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
  Alert,
  Linking
} from 'react-native';
import { IUser } from '../types';
import HowItWorksModal from './HowItWorksModal';
import { CircleHelp, X, Copy } from 'lucide-react-native'
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authstore';
import { useRouter } from 'expo-router';
import UsdcIcon from '../assets/icons/usdc.svg';
interface HeaderProfileProps {
  user?: IUser;
  onProfilePress?: () => void;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({
  onProfilePress,
}) => {
  const [howItWorksModalVisible, setHowItWorksModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const { user, setUser } = useUserStore();
  const { isNewUser, setIsNewUser } = useAuthStore();
  const router = useRouter();

  // Open how it works modal when isNewUser is true
  useEffect(() => {
    if (isNewUser) {
      setHowItWorksModalVisible(true);
    }
  }, [isNewUser]);

  const handleWalletPress = () => {
    setDepositModalVisible(true);
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handleHowItWorksPress = () => {
    setHowItWorksModalVisible(true);
  };

  const closeHowItWorksModal = () => {
    setIsNewUser(false);
    setTimeout(() => {
      setHowItWorksModalVisible(false);
    }, 100);
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
            <Text style={styles.userName}>Hi, {user?.username || 'User'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.walletContainer}
            onPress={handleWalletPress}
            activeOpacity={0.7}
          >
            {user?.spotBalance && user?.spotBalance >= 0 && (
              <Text style={styles.balanceText}>{user?.spotBalance || 0}</Text>
            )}
            <View style={styles.walletIconWrapper}>
              <UsdcIcon />
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
        animationType="fade"
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
    gap: 4,
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
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
