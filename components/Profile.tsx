import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, CircleHelp as HelpCircle, Shield, LogOut, ArrowDown, ArrowUp, X, RefreshCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  useEmbeddedSolanaWallet,
  useRecoverEmbeddedWallet,
  needsRecovery,
  getUserEmbeddedSolanaWallet,
  usePrivy,
} from '@privy-io/expo';
import { fetchSolanaBalance } from '../utils/solanaUtils';
import { useUserStore } from '../store/userStore';
import { useFundSolanaWallet } from "@privy-io/expo";

interface ProfileScreenProps {
  onClose?: () => void;
}

export default function ProfileScreen({ onClose }: ProfileScreenProps) {
  const { user, logout } = usePrivy();
  const router = useRouter();
  const solanaWallet = useEmbeddedSolanaWallet();
  const { recover } = useRecoverEmbeddedWallet();
  const walletAddress = solanaWallet?.status === 'connected' ? solanaWallet.publicKey.toString() : null;
  const { user: Zuser } = useUserStore();
  const { fundWallet } = useFundSolanaWallet();

  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const getBalance = async () => {
      if (walletAddress) {
        const solBalance = await fetchSolanaBalance(walletAddress);
        setBalance(solBalance);
      }
    };

    getBalance();
  }, [walletAddress]);

  const handleWalletRecover = async () => {
    try {
      if (!solanaWallet) {
        console.error('No wallet found');
        return;
      }

      const needsWalletRecovery = needsRecovery(solanaWallet);

      if (needsWalletRecovery) {
        await recover({
          recoveryMethod: 'privy'
        });
        await solanaWallet.getProvider();
      }
    } catch (error) {
      console.error('Failed to recover wallet:', error);
    }
  };
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handlelogOut = () => {
    logout();
    router.push('/(auth)/signup');
  };

  const handleFundwallet = async () => {
    console.log("Funding wallet");
    if (!walletAddress) return;
    console.log("Wallet address:", walletAddress);
    try {
      await fundWallet({
        address: walletAddress,
        asset: 'native-currency',
        amount: "0.2",
      });
      console.log("Funding successful");
      // Refresh balance after successful funding
      const newBalance = await fetchSolanaBalance(walletAddress);
      setBalance(newBalance);
    } catch (error) {
      console.error('Fund wallet error:', error);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left', 'top']}>
      {onClose && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <X size={24} color="#000" />
        </TouchableOpacity>
      )}
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: Zuser?.imageUrl }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{Zuser?.twitterUsername}</Text>
              <Text style={styles.profileUsername}>{solanaWallet?.status === 'connected' ? solanaWallet.publicKey.toString().slice(0, 6) + '...' + solanaWallet.publicKey.toString().slice(-4) : 'Not created'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Wallet</Text>
          <Text style={styles.walletAmount}>{balance}</Text>

          <View style={styles.walletActions}>
            <TouchableOpacity 
              style={styles.depositButton}
              onPress={handleFundwallet}
            >
              <ArrowDown size={20} color="#FFF" />
              <Text style={styles.depositButtonText}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.withdrawButton}>
              <ArrowUp size={20} color="#0504dc" />
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Settings size={24} color="#000" />
            </View>
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <HelpCircle size={24} color="#000" />
            </View>
            <Text style={styles.menuText}>Help & support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}
            onPress={handleWalletRecover}>
            <View style={styles.menuIconContainer}>
              <RefreshCcw size={24} color="#000" />
            </View>
            <Text style={styles.menuText}>Recover Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Shield size={24} color="#000" />
            </View>
            <Text style={styles.menuText}>Privacy & Security</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}
          onPress={handlelogOut}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'contain',
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
  },
  profileUsername: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#0504dc',
  },
  walletCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  walletLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  walletAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#0504dc',
    marginBottom: 4,
  },
  walletDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  depositButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0504dc',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 12,
  },
  depositButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
    marginLeft: 8,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  withdrawButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#0504dc',
    marginLeft: 8,
  },
  menuSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 40,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 12,
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16 + (Platform.OS === 'ios' ? 20 : 0),
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  disabledButton: {
    opacity: 0.7,
  },
});