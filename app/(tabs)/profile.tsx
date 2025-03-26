import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, ActivityIndicator, Modal, Clipboard, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, CircleHelp as HelpCircle, Shield, LogOut, ArrowDown, ArrowUp, X, RefreshCcw, Copy, Key } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { getUserBalance } from '../../utils/common';
import { IUser } from '../../types';
import { CHANGE_USERNAME, AUTH_ME } from '@/routes/api';
import apiClient from '@/utils/api';
import * as SecureStore from 'expo-secure-store';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [copied, setCopied] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
      '#118AB2', '#073B4C', '#7209B7', '#3A86FF',
      '#FB5607', '#8338EC', '#3A0CA3', '#4361EE'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getInitial = (name: string) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  };
  

  const fetchUser = async () => {
    const response = await apiClient(AUTH_ME, 'GET');
    if (response.success && response.data) {
      setUser(response.data as IUser);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogOut = async() => {
    await SecureStore.deleteItemAsync("token")
    router.push('/(auth)/signup');
  };

  const handleCopyReferralCode = () => {
    if (user?.referralCode) {
      Clipboard.setString(user.referralCode);
      setCopiedItem('referralCode');
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setCopiedItem(null);
      }, 3000);
    }
  };

  const handleCopyPhoneNumber = () => {
    if (user?.phoneNumber) {
      Clipboard.setString(user.phoneNumber);
      setCopiedItem('phoneNumber');
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setCopiedItem(null);
      }, 3000);
    }
  };

  const handleSaveUsername = async () => {
    try {
      const response = await apiClient(CHANGE_USERNAME(user?.id || ''), 'PATCH', {
        username: newUsername
      });
      if (response.success) {
        setUser({
          ...user,
          username: newUsername
        } as IUser)
        setIsEditingUsername(false);
      }
    } catch (error) {
      console.error('Failed to update username:', error);
    }
  };

  const openInstagram = () => {
    // Open Instagram profile
    Linking.openURL('https://www.instagram.com/spotwin');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left', 'top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: getRandomColor() }]}>
                <Text style={styles.profileImagePlaceholderText}>
                  {getInitial(user?.username || '')}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              {isEditingUsername ? (
                <View style={styles.editUsernameContainer}>
                  <TextInput
                    style={styles.usernameInput}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    autoFocus
                    placeholder="Enter new username"
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveUsername}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.usernameContainer}>
                  <Text style={styles.profileName}>{user?.username}</Text>
                  <TouchableOpacity
                    onPress={() => setIsEditingUsername(true)}
                    style={styles.editButton}
                  >
                    <Settings size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <TouchableOpacity onPress={handleCopyPhoneNumber} style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{user?.phoneNumber}</Text>
              <Copy size={16} color="#0504dc" style={styles.copyIcon} />
            </TouchableOpacity>
            {copied && copiedItem === 'phoneNumber' && <Text style={styles.copiedText}>Phone number copied!</Text>}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Points</Text>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsValue}>{user?.points || 0}</Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={() => fetchUser()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#0504dc" />
                ) : (
                  <RefreshCcw size={18} color="#0504dc" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Referral Code</Text>
            <TouchableOpacity onPress={handleCopyReferralCode} style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{user?.referralCode}</Text>
              <Copy size={16} color="#0504dc" style={styles.copyIcon} />
            </TouchableOpacity>
            {copied && copiedItem === 'referralCode' && <Text style={styles.copiedText}>Referral code copied!</Text>}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.totalContests || 0}</Text>
              <Text style={styles.statLabel}>Contests</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.totalContestsWon || 0}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.referrals?.length || 0}</Text>
              <Text style={styles.statLabel}>Referrals</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setIsEditingUsername(true)}
          >
            <View style={styles.menuIconContainer}>
              <Settings size={24} color="#000" />
            </View>
            <Text style={styles.menuText}>Change Username</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={openInstagram}
          >
            <View style={styles.menuIconContainer}>
              <HelpCircle size={24} color="#000" />
            </View>
            <Text style={styles.menuText}>Help & support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogOut}
        >
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Add padding to ensure content doesn't get hidden by tab bar
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    flex: 1,
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
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyIcon: {
    marginLeft: 8,
  },
  copiedText: {
    color: '#00AF55',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '60%',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 24,
    top: 24,
    zIndex: 1,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 24,
  },
  modalSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  addressText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#000',
  },
  copyButton: {
    padding: 8,
  },
  fundButton: {
    backgroundColor: '#0504dc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  fundButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  chainInfoBox: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
  chainInfoText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  bridgeInfoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
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
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#0504dc',
  },
  refreshButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#000',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
  },
  editUsernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 4,
  },
  usernameInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#000',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 8,
    padding: 8,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    marginLeft: 8,
    backgroundColor: '#0504dc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFF',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: '#FFFFFF',
  },
});