import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Modal,
  StatusBar,
  Platform
} from 'react-native';
import { User } from '../types';
import EmptyWalletIcon from '../assets/icons/empty-wallet.svg';
import ProfileScreen from './Profile';
import HowItWorksModal from './HowItWorksModal';
import { CircleHelp } from 'lucide-react-native'

// Default user if none provided
const defaultUser: User = {
  id: '1',
  name: 'toly',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
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

  const handleWalletPress = () => {
    // Open the same profile modal but focused on wallet section
    setProfileModalVisible(true);
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
          </View>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleWalletPress}
            activeOpacity={0.7}
          >
            <EmptyWalletIcon />
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
});

export default HeaderProfile;
