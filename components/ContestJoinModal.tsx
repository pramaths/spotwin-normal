import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Platform,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { ChevronLeft, Check } from 'lucide-react-native';
import { IContest } from '../types';
import { router } from 'expo-router';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import { Connection, PublicKey, Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { Shoot9SDK } from '../program/contract-sdk';
import { Wallet } from '@coral-xyz/anchor';
import {getUserParticipationStatus} from '../services/userContestsApi';
import { useUserStore } from '@/store/userStore';

interface ContestJoinModalProps {
  isVisible: boolean;
  onClose: () => void;
  contest: IContest;
  onConfirm?: () => void;
  isUserParticipating: boolean;
}

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };
  console.log("structuredClone polyfill added");
}

const adaptPrivyWalletToAnchor = (privyWallet: any): Wallet => {
  console.log("Privy wallet details:", {
    wallet: privyWallet,
    hasAddress: !!privyWallet?.address,
    hasSignTransaction: !!privyWallet?.signTransaction,
    signTransactionType: typeof privyWallet?.signTransaction,
    methods: Object.keys(privyWallet || {})
  });

  if (!privyWallet || !privyWallet.address) {
    throw new Error("Privy wallet missing address");
  }

  const dummyPayer = Keypair.generate();
  const getConnection = () => new Connection(
    process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.testnet.v1.sonic.game',
    {
      commitment: 'confirmed',
      disableRetryOnRateLimit: false,
      confirmTransactionInitialTimeout: 120000
    }
  );

  return {
    publicKey: new PublicKey(privyWallet.address),
    payer: dummyPayer,
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
      console.log("Signing transaction with provider...");
      const provider = await privyWallet.getProvider();
      const connection = getConnection();

      const { blockhash } = await connection.getLatestBlockhash('finalized');

      if (tx instanceof Transaction) {
        tx.recentBlockhash = blockhash;
        tx.feePayer = new PublicKey(privyWallet.address);

        const { signature } = await provider.request({
          method: 'signTransaction',
          params: {
            transaction: tx,
            connection,
            options: {
              skipPreflight: true,
              maxRetries: 5,
            }
          },
        });
        console.log("Transaction sent with signature:", signature);
        return tx as T;
      } else if (tx instanceof VersionedTransaction) {
        const { signature } = await provider.request({
          method: 'sign',
          params: {
            transaction: tx,
            connection,
            options: {
              skipPreflight: true,
              maxRetries: 5,
            }
          },
        });
        console.log("Versioned transaction sent with signature:", signature);
        return tx as T;
      }

      throw new Error("Unsupported transaction type");
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
      console.log("Signing multiple transactions with provider...");
      const provider = await privyWallet.getProvider();
      const connection = getConnection();

      return await Promise.all(txs.map(async (tx) => {
        const { blockhash } = await connection.getLatestBlockhash('finalized');

        if (tx instanceof Transaction) {
          tx.recentBlockhash = blockhash;
          tx.feePayer = new PublicKey(privyWallet.address);

          await provider.request({
            method: 'sign',
            params: {
              transaction: tx,
              connection,
              options: {
                skipPreflight: true,
                maxRetries: 5,
              }
            },
          });
        } else if (tx instanceof VersionedTransaction) {
          await provider.request({
            method: 'sign',
            params: {
              transaction: tx,
              connection,
              options: {
                skipPreflight: true,
                maxRetries: 5,
              }
            },
          });
        }
        return tx;
      }));
    },
  };
};


const { height } = Dimensions.get('window');

const ContestJoinModal = ({ isVisible, onClose, contest, onConfirm, isUserParticipating }: ContestJoinModalProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkStroke = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallets } = useEmbeddedSolanaWallet();
  const { user } = useUserStore();
  const [userBalance, setUserBalance] = useState<number | null>(0);

  const fetchUserBalance = async () => {
    console.log("fetchUserBalance started", { wallets });
    if (!wallets || wallets.length === 0) {
      console.log("No wallets available for balance check");
      return;
    }
    
    try {
      const connection = new Connection(
        process.env.EXPO_PUBLIC_SOLANA_RPC_URL as string,
      );
      
      console.log("Fetching balance for address:", wallets[0].address);
      const balance = await connection.getBalance(new PublicKey(wallets[0].address));
      const balanceInSol = balance / 1_000_000_000;
      console.log("Balance fetched successfully:", balanceInSol, "SOL");
      
      setUserBalance(balanceInSol);
      return balanceInSol;
    } catch (err) {
      console.error("Error in fetchUserBalance:", err);
      return null;
    }
  };

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
  
  const handleSolanaPayment = async () => {
    try {
      const userParticipationStatus = await getUserParticipationStatus(user?.id || '');
      if(userParticipationStatus){
        setError("You have already participated in this contest");
        return false;
      }
      setIsLoading(true);
      setError(null);
      
      if (!wallets || wallets.length === 0) {
        throw new Error("No wallet connected");
      }
      
      const balance = await fetchUserBalance();
      if (balance === null || balance === undefined) {
        throw new Error("Failed to fetch wallet balance");
      }

      const requiredAmount = contest?.entryFee || 0.2;
      if (balance < requiredAmount) {
        setError(`Insufficient balance. You need at least ${requiredAmount} SOL to enter this contest. Add funds by clicking on the wallet icon.`);
        return false;
      }
      
      const privyWallet = wallets[0];
      const connection = new Connection(
        process.env.EXPO_PUBLIC_SOLANA_RPC_URL as string,
        {
          commitment: 'confirmed',
          disableRetryOnRateLimit: true,
        }
      );
      
      const anchorWallet = adaptPrivyWalletToAnchor(privyWallet);
      const sdk = new Shoot9SDK(connection, anchorWallet);

      const contestId = parseInt(contest.solanaContestId);
      
      // Validate the contest creator address
      if (!contest.contestCreator || typeof contest.contestCreator !== 'string' || 
          !contest.contestCreator.match(/^[A-Za-z0-9]{32,44}$/)) {
        throw new Error(`Invalid contest creator address: ${contest.contestCreator}`);
      }
      
      const creatorPublicKey = new PublicKey(contest.contestCreator);
      
      try {
        const txId = await sdk.enterContest(creatorPublicKey, contestId);
        console.log("Transaction successful:", txId);
        return true;
      } catch (txError) {        
        // Check if it's a duplicate transaction error
        const errorMessage = txError instanceof Error ? txError.message : String(txError);
        if (errorMessage.includes("already processed") || errorMessage.includes("0x1")) {
          console.log("Detected duplicate transaction error - this likely means the transaction was successful");
          return true;
        }
        
        throw txError;
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Failed to process payment");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    const success = await handleSolanaPayment();
    if (success) {
      animateSuccess();
      setTimeout(() => {
        router.push({
          pathname: "/video-prediction",
          params: { contestId: contest.id },
        });
      }, 1500);
    }
  };

  useEffect(() => {
    if (isVisible) {
      console.log("Modal opened, fetching initial balance");
      setShowSuccess(false);
      fetchUserBalance();
    }
  }, [isVisible]);

  // Add check for wallet availability
  useEffect(() => {
    console.log("Checking wallet availability:", {
      wallets: wallets?.length
    });
  }, [wallets]);

  if (!contest) return null;

  const thumbnailUrl = contest.event?.eventImageUrl || 'https://9shootnew.s3.us-east-1.amazonaws.com/ss1.png';

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
            {isUserParticipating ? (
            <Text style={styles.headerTitle}>Join Contest</Text>
            ) : (
              <Text style={styles.headerTitle}>Already Joined</Text>
            )}
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: thumbnailUrl }} 
              style={styles.contestImage} 
              resizeMode="cover"
            />
            <View style={styles.questionOverlay}>
              <Text style={styles.questionText}>{contest.name || "Will there be a goal in next 5 minutes?"}</Text>
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>Ends in 4:30</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Vote pool</Text>
              <Text style={styles.statValue}>$30,000</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Joining fee</Text>
              <Text style={styles.statValue}>${contest.entryFee || 49}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Prize pool</Text>
              <Text style={styles.statValue}>$8,000</Text>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>Your current balance: <Text style={styles.balanceAmount}>{userBalance?.toFixed(2) || '0.00'} SOL</Text></Text>
          </View>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handlePayment}
          >
            <Text style={styles.joinButtonText}>Pay ${contest.entryFee || 0.2}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
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
                  <Check color="#4CAF50" size={40} strokeWidth={3} />
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
    width: '100%',
    height: height * 0.9,
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  contestImage: {
    width: '100%',
    height: '100%',
  },
  questionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  questionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  timerContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  joinButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 14,
    color: '#333',
  },
  balanceAmount: {
    fontWeight: '600',
    color: '#000',
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
  successOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
  },
});

export default ContestJoinModal;