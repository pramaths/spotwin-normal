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
  Easing,
  ActivityIndicator
} from 'react-native';
import { ChevronLeft, Check } from 'lucide-react-native';
import { IContest } from '../types';
import { formatFullDate } from '../utils/dateUtils';
import { router } from 'expo-router';
import { useEmbeddedSolanaWallet, useFundSolanaWallet } from '@privy-io/expo';
import { Connection, PublicKey, Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { Shoot9SDK } from '../program/contract-sdk';
import { Wallet } from '@coral-xyz/anchor';
import { getUserParticipationStatus } from '../services/userContestsApi';
import { useUserStore } from '@/store/userStore';

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };
  console.log("structuredClone polyfill added");
}

const recentTransactions = new Set<string>();

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
    process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://rpc.mainnet-alpha.sonic.game',
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

        // Create a transaction signature for deduplication
        const txSignature = tx.serializeMessage().toString('base64');

        // Check if we've already processed this transaction
        if (recentTransactions.has(txSignature)) {
          console.log("Duplicate transaction detected, skipping send");
          throw new Error("This transaction has already been processed");
        }

        // Add to our set of recent transactions
        recentTransactions.add(txSignature);

        try {
          const { signature } = await provider.request({
            method: 'signTransaction',
            params: {
              transaction: tx,
              connection,
              options: {
                skipPreflight: true,
                maxRetries: 1, // Reduce retries to prevent duplicates
              }
            },
          });
          return tx as T;
        } catch (error) {
          // If there's an error, remove from our set so we can try again
          recentTransactions.delete(txSignature);
          throw error;
        }
      } else if (tx instanceof VersionedTransaction) {
        // Similar deduplication for versioned transactions
        const txSignature = tx.message.serialize().toString('base64');

        if (recentTransactions.has(txSignature)) {
          console.log("Duplicate versioned transaction detected, skipping send");
          throw new Error("This transaction has already been processed");
        }

        recentTransactions.add(txSignature);

        try {
          const { signature } = await provider.request({
            method: 'signTransaction',
            params: {
              transaction: tx,
              connection,
              options: {
                skipPreflight: true,
                maxRetries: 1,
              }
            },
          });
          return tx as T;
        } catch (error) {
          recentTransactions.delete(txSignature);
          throw error;
        }
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

          const txSignature = tx.serializeMessage().toString('base64');

          if (recentTransactions.has(txSignature)) {
            console.log("Duplicate transaction detected in batch, skipping");
            throw new Error("This transaction has already been processed");
          }

          recentTransactions.add(txSignature);

          try {
            await provider.request({
              method: 'signTransaction',
              params: {
                transaction: tx,
                connection,
                options: {
                  skipPreflight: true,
                  maxRetries: 1,
                }
              },
            });
          } catch (error) {
            recentTransactions.delete(txSignature);
            throw error;
          }
        } else if (tx instanceof VersionedTransaction) {
          const txSignature = tx.message.serialize().toString('base64');

          if (recentTransactions.has(txSignature)) {
            console.log("Duplicate versioned transaction detected in batch, skipping");
            throw new Error("This transaction has already been processed");
          }

          recentTransactions.add(txSignature);

          try {
            await provider.request({
              method: 'signTransaction',
              params: {
                transaction: tx,
                connection,
                options: {
                  skipPreflight: true,
                  maxRetries: 1,
                }
              },
            });
          } catch (error) {
            recentTransactions.delete(txSignature);
            throw error;
          }
        }
        return tx;
      }));
    },
  };
};

interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  contest: IContest;
  onConfirm?: () => void;
}

const PaymentModal = ({ isVisible, onClose, contest, onConfirm }: PaymentModalProps) => {
  const [amount, setAmount] = useState(contest?.entryFee || 0.2);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactElement | null>(null);
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkStroke = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const { wallets } = useEmbeddedSolanaWallet();
  const { user } = useUserStore();
  const [userBalance, setUserBalance] = useState<number | null>(0);
  const [isFundingWallet, setIsFundingWallet] = useState(false);
  const { fundWallet } = useFundSolanaWallet();

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
      console.log("Balance fetch error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        errorObject: err
      });
      return null;
    }
  };

  const handlePayment = async () => {
    // Prevent multiple clicks
    if (isLoading) return;

    try {
      const userParticipationStatus = await getUserParticipationStatus(user?.id || '');
      if (userParticipationStatus) {
        setError("You have already participated in this contest");
        return;
      }
      setIsLoading(true);
      setError(null); // Clear any previous errors

      if (!wallets || wallets.length === 0) {
        throw new Error("No wallet connected");
      }

      const balance = await fetchUserBalance();
      if (balance === null || balance === undefined) {
        throw new Error("Failed to fetch wallet balance");
      }

      const requiredAmount = contest?.entryFee || 0.2;
      if (balance < requiredAmount) {
        setIsLoading(false);
        setError(
          <Text style={styles.errorText}>
            Insufficient balance. You need at least {requiredAmount} SOL to enter this contest. Add funds by clicking on the wallet icon.
          </Text>
        );
        return;
      }

      const privyWallet = wallets[0];
      const connection = new Connection(
        process.env.EXPO_PUBLIC_SOLANA_RPC_URL as string,
      );

      try {
        const anchorWallet = adaptPrivyWalletToAnchor(privyWallet);

        try {
          const sdk = new Shoot9SDK(connection, anchorWallet);
          const contestId = parseInt(contest.solanaContestId);
          let creatorPublicKey = new PublicKey(contest.contestCreator);

          try {
            const contestAccount = await sdk.getContest(creatorPublicKey, contestId);
            const userPubkeyString = anchorWallet.publicKey.toString();

            if (contestAccount.participants.some(p => p.toString() === userPubkeyString)) {
              console.log("User is already a participant in this contest");
              animateSuccess(); // Show success since they're already in
              return;
            }
          } catch (checkError) {
            console.error("Error checking participant status:", checkError);
          }

          try {
            const txId = await sdk.enterContest(creatorPublicKey, contestId);
            console.log("Transaction successful:", txId);
            animateSuccess();
          } catch (txError) {
            console.error("Transaction error:", txError);
            throw txError; 
          }

        } catch (sdkError) {
          console.error("SDK error:", sdkError);
          const errorMessage = sdkError instanceof Error ? sdkError.message : "SDK operation failed";
          throw new Error(errorMessage);
        }
      } catch (adapterError) {
        console.error("Wallet adapter error:", adapterError);
        const errorString = JSON.stringify(adapterError);
        if (errorString.includes("already been processed")) {
          console.log("Transaction was already processed (adapter error), showing success");
          animateSuccess();
          return;
        }

        throw new Error(adapterError instanceof Error ? adapterError.message : "Failed to adapt wallet");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Failed to process payment");

      if (err instanceof Error &&
        (err.message.includes("Insufficient balance") ||
          err.message.includes("debit an account"))) {
        await fetchUserBalance();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayAndContribute = () => {
    if (isLoading) return;
    handlePayment();

    setTimeout(() => {
      router.push({
        pathname: '/(tabs)/contribute',
        params: { contestId: contest.id }
      });
    }, 1800);
  };

  useEffect(() => {
    if (isVisible) {
      console.log("Modal opened, fetching initial balance");
      console.log("Fund wallet function available:", !!fundWallet);
      setAmount(contest?.entryFee || 0.2);
      setShowSuccess(false);
      fetchUserBalance();
    }
  }, [isVisible, contest]);

  // Add check for fundWallet availability
  useEffect(() => {
    console.log("Checking fundWallet availability:", {
      isFundWalletAvailable: !!fundWallet,
      wallets: wallets?.length
    });
  }, [fundWallet, wallets]);

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
            <Text style={styles.balanceText}>Your current balance: <Text style={styles.balanceAmount}>{userBalance?.toFixed(2) || '0.00'} SOL</Text></Text>
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

          {/* Loading overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0504dc" />
                <Text style={styles.loadingText}>Processing payment...</Text>
              </View>
            </View>
          )}

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              {typeof error === 'string' ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                error
              )}
            </View>
          )}

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
});

export default PaymentModal;