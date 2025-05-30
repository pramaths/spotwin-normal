import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, ActivityIndicator, ToastAndroid, Animated, Easing, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderProfile from '@/components/HeaderProfile';
import { useUserStore } from '@/store/userStore';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UsdcIcon from '@/assets/icons/usdc.svg';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import {
  TransactionMessage,
  PublicKey,
  VersionedTransaction,
  Connection
} from '@solana/web3.js';
import { SpotwinClient } from '@/solana/sdk';
import { adaptPrivyWalletToAnchor } from '@/utils/walletAdpater';
import { STAKE, TOKENANDSTAKEBALANCE } from '@/routes/api';
import { BN } from '@coral-xyz/anchor'; 
import apiClient from '@/utils/api';
interface StakeNotificationProps {
  message: string;
  amount: string;
  visible: boolean;
  onHide: () => void;
  tabBarHeight: number;
}

const StakeNotification: React.FC<StakeNotificationProps> = ({ message, amount, visible, onHide, tabBarHeight }) => {
  // For immediate display without animation
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const checkmarkScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          })
        ]),
        // Then animate the checkmark with a slight delay
        Animated.delay(150),
        // Scale up the checkmark
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();

      // Auto hide after 2 seconds as requested
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -50, // Move up and fade out for a nicer exit
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => {
          if (onHide) onHide();
        });
      }, 2000); // Changed to 2 seconds as requested

      return () => clearTimeout(timer);
    }
  }, [visible, translateY, scale, opacity, checkmarkScale, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.notificationContainer,
        { opacity }
      ]}
    >
      <Animated.View
        style={[
          styles.notificationInnerContainer,
          {
            transform: [
              { translateY },
              { scale }
            ]
          }
        ]}
      >
        <View style={styles.notificationCard}>
          <Animated.View
            style={[
              styles.checkmarkCircle,
              { transform: [{ scale: checkmarkScale }] }
            ]}
          >
            <Text style={styles.checkmarkText}>✓</Text>
          </Animated.View>
          <Text style={styles.messageText}>Successfully staked {amount} SPOT</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const StakeScreen = () => {

  const wallet = useEmbeddedSolanaWallet();
  const adaptWallet = adaptPrivyWalletToAnchor(wallet?.wallets?.[0], false);
  const connection = new Connection(process.env.EXPO_PUBLIC_SOLANA_RPC_URL!);
  const spotwinClient = new SpotwinClient(adaptWallet, connection);

  const { user } = useUserStore();
  const [stakeAmount, setStakeAmount] = useState('0');
  const [sliderValue, setSliderValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ message: '', amount: '' });
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  // Fetch balances when component loads
  useEffect(() => {
    const fetchBalances = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          await useUserStore.getState().updateBalances();
        } catch (error) {
          console.error('Error fetching initial balances:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchBalances();
  }, [user?.id]);

  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);
  
  const USDC_DECIMALS = 6; 
  
  const formatTokenBalance = (rawBalance: number | string, decimals: number): number => {
    if (typeof rawBalance === 'string') {
      rawBalance = parseFloat(rawBalance);
    }
    return rawBalance / Math.pow(10, decimals);
  };
  
  const usdcBalance = formatTokenBalance(user?.usdcBalance || 0, USDC_DECIMALS);
  const currentStake = formatTokenBalance(user?.totalStaked || 0, USDC_DECIMALS);

  const prepareSponsoredTransaction = async (instructions: any, feePayerAddress: string) => {
    const embeddedWallet = wallet?.wallets?.[0];
    if (!embeddedWallet) {
      throw new Error("No wallet found");
    }
    if (!feePayerAddress) {
      throw new Error("No fee payer address found");
    }

    const connection = new Connection(process.env.EXPO_PUBLIC_SOLANA_RPC_URL as string, "confirmed")
    const { blockhash } = await connection.getLatestBlockhash();

    const message = new TransactionMessage({
      payerKey: new PublicKey(feePayerAddress),
      recentBlockhash: blockhash,
      instructions: instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);
    const serializedMessage = Buffer.from(transaction.message.serialize()).toString('base64');
    const provider = await embeddedWallet.getProvider();
    const { signature: serializedUserSignature } = await provider.request({
      method: 'signMessage',
      params: {
        message: serializedMessage
      }
    });

    const userSignature = Buffer.from(serializedUserSignature, 'base64');
    transaction.addSignature(new PublicKey(embeddedWallet.address), userSignature);

    // Serialize the transaction to send to backend
    const serializedTransaction = Buffer.from(transaction.serialize()).toString('base64');

    return serializedTransaction;
  }

  const handleStakeAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, '');

    if (numericValue === '' || isNaN(Number(numericValue))) {
      setStakeAmount('0');
      setSliderValue(0);
    } else {
      const value = Math.min(Number(numericValue), usdcBalance);
      setStakeAmount(value.toString());
      setSliderValue(value);
    }
  };

  const handlePercentagePress = (percentage: number) => {
    const value = Math.floor((percentage / 100) * usdcBalance);
    setStakeAmount(value.toString());
    setSliderValue(value);
  };

  const handleMaxPress = () => {
    setStakeAmount(usdcBalance.toString());
    setSliderValue(usdcBalance);
  };

  const handleStakeNow = async () => {
    if (Number(stakeAmount) <= 0) {
      // For Android, still show a toast for validation errors
      if (Platform.OS === 'android') {
        ToastAndroid.show('Please enter a valid stake amount', ToastAndroid.SHORT);
      }
      return;
    }

    setIsStaking(true);
    const feePayerAddress = process.env.EXPO_PUBLIC_FEE_PAYER!;

    try {
      const ix = await spotwinClient.stakeTokens(new BN((Number(stakeAmount)*1000000)), new PublicKey(feePayerAddress));
      const serializedTransaction = await prepareSponsoredTransaction([ix], feePayerAddress);
      const response = await apiClient(STAKE, 'POST', {
        instructions: serializedTransaction,
        stakeAmount: Number(stakeAmount) * (10 ** USDC_DECIMALS) // Use the decimal constant
      });
      
      // Show fancy notification instead of toast
      showPositionedNotification('Your tokens have been successfully staked', stakeAmount);
      
      // Update balances after staking
      await useUserStore.getState().updateBalances();
    } catch (error) {
      console.error('Error staking tokens:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to stake tokens', ToastAndroid.SHORT);
      }
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (currentStake <= 0) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('You have no staked tokens to unstake', ToastAndroid.SHORT);
      }
      return;
    }

    setIsStaking(true);

    // Simulate API call
    setTimeout(() => {
      // Show fancy notification instead of toast
      showPositionedNotification('Your tokens have been successfully unstaked', currentStake.toString());
      setIsStaking(false);
      // In a real implementation, you would update the user's stake and balance
    }, 1500);
  };

  const SkeletonItem = ({ width, height = 16, style }: { width: string | number, height?: number, style?: any }) => (
    <View
      style={[{
        height,
        width,
        backgroundColor: '#E1E1E1',
        borderRadius: 4,
        opacity: 0.7,
        marginVertical: 4
      }, style]}
    />
  );

  const BalanceSkeleton = () => (
    <View style={styles.balanceCard}>
      <View style={styles.skeletonContainer}>
        <SkeletonItem width="40%" />
        <SkeletonItem width="60%" height={24} style={{ marginTop: 8 }} />
        <SkeletonItem width="40%" style={{ marginTop: 8 }} />
      </View>
    </View>
  );

  const StakeInputSkeleton = () => (
    <View style={styles.stakeInputCard}>
      <View style={styles.skeletonContainer}>
        <SkeletonItem width="40%" />
        <SkeletonItem width="90%" height={40} style={{ marginTop: 8 }} />
        <SkeletonItem width="100%" height={20} style={{ marginTop: 16 }} />
        <SkeletonItem width="90%" height={50} style={{ marginTop: 16, borderRadius: 25 }} />
      </View>
    </View>
  );

  const StakeInfoSkeleton = () => (
    <View style={styles.stakeInfoCard}>
      <View style={styles.skeletonContainer}>
        <SkeletonItem width="40%" />
        <SkeletonItem width="60%" style={{ marginTop: 8 }} />
        <SkeletonItem width="50%" style={{ marginTop: 8 }} />
      </View>
    </View>
  );
  const showPositionedNotification = (message: string, amount: string) => {
    setNotificationData({ message, amount });
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await useUserStore.getState().updateBalances();
    } catch (error) {
      console.error('Error refreshing data:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to refresh balances', ToastAndroid.SHORT);
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderProfile />
      {showNotification && (
        <View style={styles.notificationContainer}>
          <StakeNotification
            message={notificationData.message}
            amount={notificationData.amount}
            visible={showNotification}
            onHide={() => setShowNotification(false)}
            tabBarHeight={tabBarHeight}
          />
        </View>
      )}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 16,
          paddingHorizontal: 16
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0504dc', '#22C55E']}
            tintColor={'#0504dc'}
            title={'Refreshing...'}
            titleColor={'#333333'}
          />
        }
      >
        {isLoading ? (
          <>
            <BalanceSkeleton />
            <StakeInputSkeleton />
            <StakeInfoSkeleton />
          </>
        ) : (
          <>
            {/* Balance Card */}
            <LinearGradient
              colors={['#0504dc', '#0504dc', '#37348b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}
            >
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <View style={styles.balanceValueContainer}>
                  <Text style={styles.balanceAmount}>{usdcBalance.toLocaleString()}</Text>
                  {usdcBalance > 0 &&
                    <View style={styles.tokenIconContainer}>
                      <UsdcIcon width={28} height={28} />
                    </View>}
                </View>
              </View>
            </LinearGradient>

            {/* Stake Input Card */}
            <View style={styles.stakeInputCard}>
              <Text style={styles.stakeLabel}>Stake Amount</Text>
              <View style={styles.stakeInputRow}>
                <TextInput
                  style={styles.stakeInput}
                  value={stakeAmount}
                  onChangeText={handleStakeAmountChange}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={styles.percentageButtons}>
                <TouchableOpacity
                  style={styles.percentButton}
                  onPress={() => handlePercentagePress(10)}
                >
                  <Text style={styles.percentButtonText}>10%</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.percentButton}
                  onPress={() => handlePercentagePress(25)}
                >
                  <Text style={styles.percentButtonText}>25%</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.percentButton}
                  onPress={() => handlePercentagePress(50)}
                >
                  <Text style={styles.percentButtonText}>50%</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.percentButton}
                  onPress={handleMaxPress}
                >
                  <Text style={styles.percentButtonText}>Max</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity

                style={styles.stakeButton}
                onPress={handleStakeNow}
                disabled={isStaking}
              >
                {isStaking ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.stakeButtonText}>Stake for Alpha</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Total Amount Staked Card */}
            <View style={styles.stakeInfoCard}>
              <View style={styles.stakeInfoHeader}>
                <Text style={styles.yourStakeLabel}>Total Amount Staked</Text>
                <View style={styles.stakeInfoRow}>
                 <Text style={styles.stakeInfoAmount}>{currentStake.toFixed(0).toLocaleString()} </Text>
                 <UsdcIcon width={24} height={24} style={styles.tokenIcon} />
                </View>
              </View>
              {/* {currentStake > 0 && (
                <TouchableOpacity 
                  style={styles.unstakeButton}
                  onPress={handleUnstake}
                  disabled={isStaking}
                >
                  {isStaking ? (
                    <ActivityIndicator color="#007AFF" size="small" />
                  ) : (
                    <Text style={styles.unstakeButtonText}>Unstake</Text>
                  )}
                </TouchableOpacity>
              )} */}
            </View>

            <View style={styles.infoCard}>
              <View style={styles.imageContainer}>
                <Image source={require('@/assets/icons/stake.png')} style={styles.stakeInfoImage} />
              </View>
              <View style={styles.bulletPoint}>
                <Text style={[styles.bulletText, { fontWeight: 'bold' }]}>Stake 50 USDC to unlock premium questions + AI AGENT</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  notificationContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 40, // Pushed down a bit more
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  notificationInnerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
    maxWidth: 400,
  },
  checkmarkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
  },
  container: {
    flex: 1,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  balanceLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  tokenIcon: {
    width: 28,
    height: 28,
    marginLeft: 2,
    resizeMode: 'contain',
  },
  stakeInfoImage: {
    width: 400,
    height: 80,
    resizeMode: 'contain',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  apyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 4,
  },
  stakeInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stakeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  stakeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stakeInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: '500',
  },
  maxButton: {
    marginLeft: 12,
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  maxButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  percentageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  percentButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  percentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  stakeButton: {
    backgroundColor: '#22C55E',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stakeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stakeInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stakeInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  yourStakeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  stakeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stakeInfoAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 2,
  },
  unstakeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  unstakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tokenIconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  skeletonContainer: {
    width: '100%',
  },
});

export default StakeScreen;