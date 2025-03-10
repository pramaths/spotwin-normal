import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  Image,
  Easing
} from 'react-native';
import { ChevronLeft, Check } from 'lucide-react-native';
import { IContest } from '../types';
import { formatFullDate } from '../utils/dateUtils';
import { router } from 'expo-router';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import idl from "../program/shoot_9_solana.json"; // Replace with your Anchor IDL JSON


interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  contest: IContest;
  onConfirm?: () => void;
}

const PaymentModal = ({ isVisible, onClose, contest, onConfirm }: PaymentModalProps) => {
  const [amount, setAmount] = useState(contest?.entryFee || 1);
  const [showSuccess, setShowSuccess] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkStroke = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets[0];

  const provider = await wallet.getProvider();
  const connection = new Connection(process.env.EXPO_PUBLIC_CONNECTION_URL);


  const animateSuccess = () => {
    setShowSuccess(true);

    // Reset animation values
    successScale.setValue(0);
    successOpacity.setValue(0);
    checkmarkStroke.setValue(0);
    checkmarkScale.setValue(0);

    // Sequence of animations
    Animated.sequence([
      // First fade in the background
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
      // Then animate the checkmark
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

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!wallets || wallets.length === 0) {
        throw new Error("No wallet connected");
      }
      
      const wallet = wallets[0];
      const provider = await wallet.getProvider();
      
      const connection = new Connection(process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com');
      
      const sdk = new Shoot9SDK(connection, wallet);
      
      const contestCreator = new PublicKey(contest.contestPublicKey);
      
      const contestId = parseInt(contest.solanaContestId);
      
      const txId = await sdk.enterContest(contestCreator, contestId);
      console.log("Transaction successful:", txId);
      
      animateSuccess();
      
      if (onConfirm) {
        onConfirm();
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayAndContribute = () => {
    animateSuccess();

    setTimeout(() => {
      router.push('/(tabs)/contribute?contestId=' + contest.id);
    }, 1800);
  };

  useEffect(() => {
    if (isVisible) {
      setAmount(contest?.entryFee || 1);
      setShowSuccess(false);
    }
  }, [isVisible, contest]);

  if (!contest) return null;

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
            <Text style={styles.headerTitle}>Fee Payment</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.matchInfo}>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{contest.event.teamA.name}</Text>
              <Image style={styles.teamLogo} source={{ uri: contest.event.teamA.imageUrl }} />
            </View>

            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Start time</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>{formatFullDate(contest.event.startDate)}</Text>
              </View>
            </View>

            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{contest.event.teamB.name}</Text>
              <Image style={styles.teamLogo} source={{ uri: contest.event.teamB.imageUrl }} />
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Joining fee</Text>
              <Text style={styles.statValue}>${contest.entryFee}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Prize pool</Text>
              <Text style={styles.statValue}>24 SOL</Text>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>Your current balance: <Text style={styles.balanceAmount}>1000 SOL</Text></Text>
          </View>
          {contest.status === 'OPEN' && (
            <TouchableOpacity
              style={styles.contributeButton}
              onPress={handlePayAndContribute}
            >
              <Text style={styles.payButtonText}>Play and Contribute</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayment}
          >
            <Text style={styles.payButtonText}>Play</Text>
          </TouchableOpacity>

          {/* Success overlay with animated checkmark */}
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
                Payment successful!
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
  balanceText: {
    fontSize: 14,
    color: '#333',
  },
  balanceAmount: {
    fontWeight: '600',
    color: '#000',
  },
  contributeButton: {
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
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});

export default PaymentModal;