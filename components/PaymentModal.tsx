import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  Image,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, Check, RefreshCw } from 'lucide-react-native';
import { IContest } from '../types';
import { formatFullDate } from '../utils/dateUtils';
import { getUserParticipationStatus } from '../services/userContestsApi';
import { useUserStore } from '@/store/userStore';
import { getUserBalance } from '../utils/common';
import { JOIN_CONTEST } from '../routes/api';
import apiClient from '../utils/api';
import { router } from 'expo-router';
import { useContestsStore } from '@/store/contestsStore';
import { handleInvite } from '@/utils/common';

interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  contest: IContest;
  onConfirm?: () => void;
  isUserParticipating?: boolean;
}

const PaymentModal = ({ isVisible, onClose, contest, onConfirm, isUserParticipating = false }: PaymentModalProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactElement | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isParticipating, setIsParticipating] = useState(isUserParticipating);
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkStroke = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const { user } = useUserStore();
  const { userContests, setUserContests } = useContestsStore();
  const [userBalance, setUserBalance] = useState<number | null>(0);

  const animateSuccess = () => {
    setShowSuccess(true);

    successScale.setValue(0);
    successOpacity.setValue(0);
    checkmarkStroke.setValue(0);
    checkmarkScale.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(successScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]),
      Animated.parallel([
        Animated.timing(checkmarkScale, {
          toValue: 1,
          duration: 400,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkStroke, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ])
    ]).start();

    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      if (onConfirm) {
        onConfirm();
      }
    }, 1800);
  };

  const fetchUserBalance = async () => {
    try {
      setIsRefreshing(true);
      const balance = await getUserBalance(user?.id || '');
      setUserBalance(balance !== undefined ? balance : null);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkIfParticipating = async () => {
    if (isUserParticipating !== undefined) {
      setIsParticipating(isUserParticipating);
      return;
    }
    
    if (!user?.id || !contest?.id) return;
    
    try {
      const status = await getUserParticipationStatus(user.id, contest.id);
      setIsParticipating(status);
    } catch (error) {
      console.error("Error checking participation status:", error);
    }
  };

  const handlePayment = async () => {
    if (isLoading) return;

    if (isParticipating) {
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const balance = await getUserBalance(user?.id || '');
      if (balance === null || balance === undefined) {
        throw new Error("Failed to fetch wallet balance");
      }

      const requiredAmount = contest?.entryFee;
      if (balance < requiredAmount) {
        setIsLoading(false);
        setError(
          <Text style={styles.errorText}>
            Insufficient balance. You need at least {requiredAmount} points to enter this contest.
          </Text>
        );
        return;
      }

      const response = await apiClient<any>(JOIN_CONTEST, "POST", { 
        userId: user?.id,
        contestId: contest.id,
      });
      if(response.success) {
        setIsParticipating(true);
        fetchUserBalance();
        animateSuccess(); 
        setTimeout(() => {
          router.push({
            pathname: "/prediction",
            params: { contestId: contest.id },
          });
        }, 1800);
      } else {
        setError(response.message || "Failed to join contest");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Failed to join contest");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      console.log("Modal opened, fetching initial balance");
      setShowSuccess(false);
      setError(null);
      fetchUserBalance();
      checkIfParticipating();
    }
  }, [isVisible, contest, isUserParticipating]);

  useEffect(() => {
    setIsParticipating(isUserParticipating);
  }, [isUserParticipating]);

  if (!contest) return null;

  const canParticipate = (userBalance !== null && userBalance >= contest.entryFee);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <ChevronLeft color="#000" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isParticipating ? 'Contest Details' : 'Fee Payment'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.matchInfo}>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{contest.match?.teamA.name}</Text>
              <Image style={styles.teamLogo} source={{ uri: contest.match?.teamA.imageUrl }} />
            </View>

            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Start time</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>{formatFullDate(contest.match?.startTime || '')}</Text>
              </View>
            </View>

            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{contest.match?.teamB.name}</Text>
              <Image style={styles.teamLogo} source={{ uri: contest.match?.teamB.imageUrl }} />
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Joining Points</Text>
              <Text style={styles.statValue}>{contest.entryFee} points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>1st Prize</Text>
              <Text style={styles.statValue}>4000 Points</Text>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <View style={styles.balanceWrapper}>
              <Text style={styles.balanceText}>Your current balance: 
                <Text style={styles.balanceAmount}> {userBalance?.toFixed(2) || '0.00'} points</Text>
              </Text>
              <TouchableOpacity 
                onPress={fetchUserBalance} 
                style={styles.refreshButton}
                disabled={isRefreshing}
              >
                <RefreshCw 
                  color="#000" 
                  size={20} 
                  style={isRefreshing ? styles.refreshing : undefined} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {
            !canParticipate && !isParticipating && (
              <TouchableOpacity style={styles.inviteButton} onPress={() => handleInvite(user?.referralCode || '')}>
                <Text style={styles.payButtonText}>Invite friends to earn more points</Text>
              </TouchableOpacity>
            )
          }

          {isParticipating ? (
            <View style={styles.participatingContainer}>
              <View style={styles.participatingIcon}>
                <Check color="#fff" size={24} strokeWidth={3} />
              </View>
              <Text style={styles.participatingText}>You are already participating in this contest</Text>
              
              <TouchableOpacity
                style={[styles.payButton, styles.viewPredictionsButton]}
                onPress={() => {
                  onClose();
                  router.push({
                    pathname: "/prediction",
                    params: { contestId: contest.id },
                  });
                }}
              >
                <Text style={styles.payButtonText}>View Your Predictions</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.payButton, !canParticipate && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={!canParticipate}
            >
              <Text style={styles.payButtonText}>{canParticipate ? 'Play' : 'Insufficient Balance'}</Text>
            </TouchableOpacity>
          )}

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0504dc" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              {typeof error === 'string' ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                error
              )}
            </View>
          )}

          {showSuccess && (
            <View style={styles.successOverlay}>
              <Animated.View
                style={[
                  styles.successIconContainer,
                  {
                    transform: [{ scale: successScale }],
                    opacity: successOpacity
                  }
                ]}
              >
                <Animated.View
                  style={[
                    {
                      transform: [{ scale: checkmarkScale }],
                      opacity: checkmarkStroke
                    }
                  ]}
                >
                  <Check color="#fff" size={40} strokeWidth={3} />
                </Animated.View>
              </Animated.View>
              <Animated.Text
                style={[
                  styles.successTitle,
                  { opacity: successOpacity }
                ]}
              >
                Joined successful!
              </Animated.Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    width: '100%',
    minHeight: 300,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  teamInfo: {
    alignItems: 'center',
    width: '30%',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeBox: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  balanceContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  balanceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceText: {
    fontSize: 14,
    color: '#333',
  },
  balanceAmount: {
    fontWeight: '600',
    color: '#000',
  },
  refreshButton: {
    padding: 8,
  },
  refreshing: {
    opacity: 0.5,
  },
  contributeButton: {
    backgroundColor: '#0504dc',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  inviteButton: {
    backgroundColor: '#0504dc',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButton: {
    backgroundColor: '#0504dc',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#9e9e9e',
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  successOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
  },
  loadingOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  fundButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    minHeight: 48,
  },
  fundButtonDisabled: {
    backgroundColor: '#90CAF9',
    opacity: 0.7,
  },
  fundButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundingIndicator: {
    marginRight: 8,
  },
  fundButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  participatingContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  participatingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  participatingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
  },
  viewPredictionsButton: {
    backgroundColor: '#0504dc',
  },
});

export default PaymentModal;