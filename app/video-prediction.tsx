import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Volume2, VolumeX, Play } from 'lucide-react-native';
import { IOutcomeType } from '@/types';

const { height, width } = Dimensions.get('window');

const predictionVideos = [
  {
    id: '1',
    question: 'Will Manchester United score in the first half?',
    videoUrl:
      'https://s3.ap-south-1.amazonaws.com/sizzils3/0b5233d2-f1db-4714-bcfe-bfe33dcba6aa-nvidia_5T_mcap.mp4',
  },
  {
    id: '2',
    question: 'Will Manchester United score in the first half?',
    videoUrl:
      'https://s3.ap-south-1.amazonaws.com/sizzils3/f367fad1-aff4-4a12-8e07-f0dbd0184b7e-perplexity.mp4',
  },
  ...Array(28).fill(0).map((_, i) => ({
    id: `${i + 3}`,
    question: `Prediction Question ${i + 3}`,
    videoUrl: i % 2 === 0 
      ? 'https://s3.ap-south-1.amazonaws.com/sizzils3/0b5233d2-f1db-4714-bcfe-bfe33dcba6aa-nvidia_5T_mcap.mp4'
      : 'https://s3.ap-south-1.amazonaws.com/sizzils3/f367fad1-aff4-4a12-8e07-f0dbd0184b7e-perplexity.mp4'
  }))
];

export default function VideoPredictionScreen() {
  const router = useRouter();
  const { contestId } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const maxSelections = 9;
  const flatListRef = useRef(null);
  
  const currentVideoPlayer = useVideoPlayer(
    { uri: predictionVideos[currentIndex]?.videoUrl }, 
    (player) => {
      player.loop = true;
      if (!isPaused) {
        player.play();
      }
      player.muted = isMuted;
    }
  );
  
  useEffect(() => {
    if (currentVideoPlayer) {
      if (isPaused) {
        currentVideoPlayer.pause();
      } else {
        currentVideoPlayer.play();
      }
      currentVideoPlayer.muted = isMuted;
    }
  }, [currentIndex, isPaused, isMuted]);

  const getSelectionsCount = () => Object.keys(selections).length;
  const questionsLeft = maxSelections - getSelectionsCount();

  const handleVideoPress = () => {
    setIsPaused(!isPaused);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleClose = () => {
    router.back();
  };

  const handlePayment = () => {
    // Process payment logic here
    setShowPaymentModal(false);
    
    // Navigate back after payment
    setTimeout(() => {
      router.back();
    }, 500);
  };

  const handleNextVideo = () => {
    if (currentIndex < predictionVideos.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      try {
        if (flatListRef.current) {
          setIsLoading(true);
          flatListRef.current.scrollToIndex({ 
            index: nextIndex, 
            animated: true,
            viewPosition: 0
          });
        }
      } catch (error) {
        console.error("Error scrolling to index:", error);
        // Fallback: manually scroll to the position
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({
            offset: nextIndex * height,
            animated: true
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePreviousVideo = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      
      try {
        if (flatListRef.current) {
          setIsLoading(true);
          flatListRef.current.scrollToIndex({ 
            index: prevIndex, 
            animated: true,
            viewPosition: 0
          });
        }
      } catch (error) {
        console.error("Error scrolling to index:", error);
        // Fallback: manually scroll to the position
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({
            offset: prevIndex * height,
            animated: true
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrediction = (prediction:IOutcomeType) => {
    if (getSelectionsCount() >= maxSelections && !selections.hasOwnProperty(currentIndex)) {
      return; // Optionally show "max selections" message
    }

    setSelections({ ...selections, [currentIndex]: prediction });

    // Move to next video automatically after a short delay
    setTimeout(() => {
      if (currentIndex < predictionVideos.length - 1) {
        handleNextVideo();
      } else {
        // Show payment modal when all predictions are made
        setShowPaymentModal(true);
      }
    }, 300);
  };

  const renderVideoItem = ({ item, index }) => {
    const isCurrentItem = index === currentIndex;
    
    return (
      <View style={styles.videoItemContainer}>
        <TouchableOpacity 
          activeOpacity={1}
          style={styles.videoTouchable} 
          onPress={handleVideoPress}
        >
          {isCurrentItem && currentVideoPlayer && (
            <>
              <VideoView
                player={currentVideoPlayer}
                style={styles.videoPlayer}
                nativeControls={false}
              />
              
              {/* Mute button at the top right */}
              <TouchableOpacity 
                style={styles.muteButton} 
                onPress={handleMuteToggle}
              >
                {isMuted ? (
                  <VolumeX size={24} color="#FFFFFF" />
                ) : (
                  <Volume2 size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              
              {/* Only show play button when paused */}
              {isPaused && (
                <View style={styles.playPauseButton}>
                  <Play size={40} color="#FFFFFF" />
                </View>
              )}

              {/* Questions remaining counter */}
              <View style={styles.questionsCounter}>
                <Text style={styles.questionsCounterText}>
                  {questionsLeft} Questions left
                </Text>
              </View>
            </>
          )}
          
          {!isCurrentItem && (
            <View style={[styles.videoPlayer, { backgroundColor: '#111' }]} />
          )}
          
          {/* Play/Pause indicator overlay */}
          {isPaused && isCurrentItem && (
            <View style={styles.pauseOverlay}>
              <Text style={styles.pauseText}>Tap to Play</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Question & Buttons */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{item.question}</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button, 
                styles.yesButton,
                selections[index] === true && styles.selectedButton
              ]}
              onPress={() => handlePrediction(IOutcomeType.YES)}
              disabled={
                getSelectionsCount() >= maxSelections &&
                !selections.hasOwnProperty(index)
              }
            >
              <Text style={styles.buttonText}>YES</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button, 
                styles.noButton,
                selections[index] === false && styles.selectedButton
              ]}
              onPress={() => handlePrediction(IOutcomeType.NO)}
              disabled={
                getSelectionsCount() >= maxSelections &&
                !selections.hasOwnProperty(index)
              }
            >
              <Text style={styles.buttonText}>NO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Handle scroll failures with this function
  const handleScrollToIndexFailed = (info) => {
    console.warn('Scroll to index failed:', info);
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ 
          offset: info.index * height, 
          animated: true 
        });
        setCurrentIndex(info.index);
      }
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Main Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={predictionVideos}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            vertical
            pagingEnabled
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            initialScrollIndex={currentIndex}
            onScrollToIndexFailed={handleScrollToIndexFailed}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.floor(event.nativeEvent.contentOffset.y / height);
              if (newIndex !== currentIndex && newIndex >= 0 && newIndex < predictionVideos.length) {
                setCurrentIndex(newIndex);
              }
            }}
            getItemLayout={(data, index) => ({
              length: height,
              offset: height * index,
              index,
            })}
            windowSize={3}
            maxToRenderPerBatch={3}
            updateCellsBatchingPeriod={100}
            removeClippedSubviews={true}
          />
        )}
        
        {/* Payment Modal */}
        <Modal
          visible={showPaymentModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <Text style={styles.modalText}>
                You've selected {getSelectionsCount()} predictions.
                Total amount: {(getSelectionsCount() * 0.2).toFixed(2)} SOL
              </Text>
              <TouchableOpacity
                style={styles.paymentButton}
                onPress={handlePayment}
              >
                <Text style={styles.paymentButtonText}>Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Navigation buttons to go back to tabs */}
        <View style={styles.tabButtonsContainer}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.tabButtonText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => router.push('/(tabs)/contests')}
          >
            <Text style={styles.tabButtonText}>Contests</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A3A',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoItemContainer: {
    width: width,
    height: height - 180, // Adjusted height to account for header and navigation buttons
    position: 'relative',
  },
  videoTouchable: {
    flex: 1,
    position: 'relative',
  },
  videoPlayer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  muteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  questionsCounter: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  questionsCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  playPauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 10,
    zIndex: 10,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  pauseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  questionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 16,
    fontFamily: 'Inter-Medium',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  yesButton: {
    backgroundColor: '#4CAF50',
  },
  noButton: {
    backgroundColor: '#F44336',
  },
  selectedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1A1A3A',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  modalText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  tabButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1A1A3A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
