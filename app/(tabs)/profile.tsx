import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, ActivityIndicator, Clipboard, Linking, TextInput, TouchableWithoutFeedback, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, CircleHelp as HelpCircle, LogOut, RefreshCcw, Copy, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { useUserStore } from '../../store/userStore';
import { IUser } from '../../types';
import { CHANGE_USERNAME, AUTH_ME } from '@/routes/api';
import apiClient from '@/utils/api';
import * as SecureStore from 'expo-secure-store';
import { handleInvite } from '@/utils/common';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [copied, setCopied] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingPoints, setIsRefreshingPoints] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const inputRef = useRef<TextInput>(null);

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
    try {
      const response = await apiClient(AUTH_ME, 'GET');
      if (response.success && response.data) {
        const newUserData = response.data as IUser;
        if (JSON.stringify(user) !== JSON.stringify(newUserData)) {
          if (user?.username && user.username !== newUserData.username) {
            newUserData.username = user.username;
          }
          setUser(newUserData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshingPoints(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogOut = async () => {
    await SecureStore.deleteItemAsync("token")
    router.push('/(auth)/signup');
  };

  const handleCopyReferralCode = () => {
    if (user?.referralCode) {
      Clipboard.setString(user.referralCode);
      setCopiedItem('referralCode');
      setCopied(true);
      ToastAndroid.show('Referral code copied', ToastAndroid.SHORT);
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
      ToastAndroid.show('Phone number copied', ToastAndroid.SHORT);
      setTimeout(() => {
        setCopied(false);
        setCopiedItem(null);
      }, 3000);
    }
  };

  const handleSaveUsername = async () => {
    if (isSavingUsername) return;

    setIsSavingUsername(true);
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
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleCloseUsernameEdit = () => {
    setIsEditingUsername(false);
    setNewUsername(user?.username || '');
  };

  const refreshUserPoints = () => {
    setIsRefreshingPoints(true);
    fetchUser();
  };

  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/spotwin.in');
  };

  const handleDeleteAccount = () => {
    const subject = encodeURIComponent('Delete my account');
    const email = 'rahul@sizzil.app';
    const body = encodeURIComponent(`Hello,\n\nPlease delete my account.\n\nReason: [Please fill in your reason for account deletion]\n\nPhone Number: ${user?.phoneNumber || 'N/A'}\nUsername: ${user?.username || 'N/A'}\n\nThank you.`);

    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  useEffect(() => {
    if (isEditingUsername) {
      inputRef.current?.focus();
    }
  }, [isEditingUsername]);

  const SkeletonText = ({ width, height = 14, style }: { width: number | string, height?: number, style?: any }) => (
    <View style={[styles.skeleton, { width: width as number, height }, style]} />
  );

  const ProfileSkeleton = () => (
    <>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={[styles.skeleton, styles.profileImageSkeleton]} />
          <View style={styles.profileInfo}>
            <SkeletonText width={150} height={24} />
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <SkeletonText width={100} />
          <View style={{ marginTop: 8 }}>
            <SkeletonText width={180} height={18} />
          </View>
        </View>

        <View style={styles.infoItem}>
          <SkeletonText width={60} />
          <View style={{ marginTop: 8 }}>
            <SkeletonText width={100} height={24} />
          </View>
        </View>

        <View style={styles.infoItem}>
          <SkeletonText width={100} />
          <View style={{ marginTop: 8 }}>
            <SkeletonText width={180} height={18} />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <SkeletonText width={40} height={20} />
            <SkeletonText width={60} height={14} style={{ marginTop: 8 }} />
          </View>
          <View style={styles.statItem}>
            <SkeletonText width={40} height={20} />
            <SkeletonText width={40} height={14} style={{ marginTop: 8 }} />
          </View>
          <View style={styles.statItem}>
            <SkeletonText width={40} height={20} />
            <SkeletonText width={60} height={14} style={{ marginTop: 8 }} />
          </View>
        </View>
      </View>
    </>
  );

  return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea} edges={['right', 'left', 'top']}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {isLoading ? (
              <ProfileSkeleton />
            ) : (
              <>
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
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                          <View style={styles.editUsernameContainer}>
                            <TextInput
                              ref={inputRef}
                              style={styles.usernameInput}
                              value={newUsername}
                              onChangeText={setNewUsername}
                              placeholder="Enter new username"
                              onBlur={handleCloseUsernameEdit}
                            />
                            <TouchableOpacity
                              style={[styles.saveButton, isSavingUsername && styles.disabledButton]}
                              onPress={handleSaveUsername}
                              disabled={isSavingUsername}
                            >
                              {isSavingUsername ? (
                                <ActivityIndicator size="small" color="#FFF" />
                              ) : (
                                <Text style={styles.saveButtonText}>Save</Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        </TouchableWithoutFeedback>
                      ) : (
                        <View style={styles.usernameContainer}>
                          <Text style={styles.profileName}>{user?.username}</Text>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              setIsEditingUsername(true);
                            }}
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
                      {isRefreshingPoints ? (
                        <View style={styles.pointsValueContainer}>
                          <SkeletonText width={80} height={24} />
                        </View>
                      ) : (
                        <Text style={styles.pointsValue}>{user?.points || 0}</Text>
                      )}
                      <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={refreshUserPoints}
                        disabled={isRefreshingPoints}
                      >
                        {isRefreshingPoints ? (
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
              </>
            )}

            <View style={styles.menuSection}>
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

            <View style={styles.menuSection}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleInvite(user?.referralCode || '')}
              >
                <View style={styles.menuIconContainer}>
                  <HelpCircle size={24} color="#000" />
                </View>
                <Text style={styles.menuText}>Invite friends</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogOut}
            >
              <LogOut size={20} color="#FF3B30" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <Trash2 size={20} color="#FF3B30" />
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
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
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    resizeMode: 'contain',
  },
  profileInfo: {
    marginLeft: 14,
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
    borderRadius: 14,
    marginHorizontal: 14,
    marginTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
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
    marginHorizontal: 14,
    marginTop: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
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
    borderRadius: 14,
    marginHorizontal: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  infoItem: {
    marginBottom: 14,
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
  pointsValueContainer: {
    height: 24,
    justifyContent: 'center',
  },
  pointsValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#0504dc',
  },
  refreshButton: {
    marginLeft: 10,
    padding: 6,
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
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
    marginLeft: 6,
    padding: 6,
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
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
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: '#FFFFFF',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 30,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
  },
  deleteAccountText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
  // Skeleton styles
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImageSkeleton: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
});