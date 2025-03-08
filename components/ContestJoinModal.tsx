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
import { formatFullDate } from '../utils/dateUtils';
import { router } from 'expo-router';

interface ContestJoinModalProps {
  isVisible: boolean;
  onClose: () => void;
  contest: IContest;
  onConfirm?: () => void;
}

const { height } = Dimensions.get('window');

const ContestJoinModal = ({ isVisible, onClose, contest, onConfirm }: ContestJoinModalProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkStroke = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

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

  const handlePayment = () => {
    animateSuccess();
    setTimeout(() => {
      router.push('/(tabs)/video-prediction');
    }, 1500);
  };

  useEffect(() => {
    if (isVisible) {
      setShowSuccess(false);
    }
  }, [isVisible]);

  if (!contest) return null;

  // Get thumbnail from the first video if available
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
            <Text style={styles.headerTitle}>Join Contest</Text>
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

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handlePayment}
          >
            <Text style={styles.joinButtonText}>Pay ${contest.entryFee || 49}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.balanceText}>Your current balance: $900</Text>

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
  balanceText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginVertical: 12,
    paddingBottom: 8,
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