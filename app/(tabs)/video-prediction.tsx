import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Text,
  AppState,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Volume2, VolumeX, ChevronLeft } from 'lucide-react-native';
import VideoItem from '../../components/VideoItem';
import { useRouter, useNavigation } from 'expo-router';
import { fetchFeaturedVideos, submitPrediction, IFeaturedVideo } from '../../services/videoApi';
import { useLocalSearchParams } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { OutcomeType } from '@/types';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

// Add this polyfill at the top of your file, after the imports
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

export default function HomeScreen() {
  const { contestId } = useLocalSearchParams();
  const [videos, setVideos] = useState<IFeaturedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleVideos, setVisibleVideos] = useState<Record<number, boolean>>({});
  const [muteState, setMuteState] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [isScreenActive, setIsScreenActive] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();
  const appStateRef = useRef(AppState.currentState);
  const flatListRef = useRef<FlatList>(null);
  const isMountedRef = useRef(true);
  const { user} = useUserStore();
  const [predictionMessage, setPredictionMessage] = useState<{text: string, type: OutcomeType} | null>(null);

  const loadVideos = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    setVisibleVideos({});
    
    try {
      const data = await fetchFeaturedVideos(contestId as string);
      
      if (isMountedRef.current) {
        setVideos(data);
        setTimeout(() => {
          if (isMountedRef.current) {
            setVisibleVideos({ 0: true });
            setCurrentIndex(0);
          }
        }, 100);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Failed to load videos. Please try again.');
        console.error('Error loading videos:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setIsScreenActive(true);
      loadVideos();
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      setIsScreenActive(false);
      setVisibleVideos({});
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation, loadVideos]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        setIsScreenActive(true);
        loadVideos();
      } else if (
        appStateRef.current === 'active' && 
        nextAppState.match(/inactive|background/)
      ) {
        setIsScreenActive(false);
        setVisibleVideos({});
      }
      
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [loadVideos]);

  useEffect(() => {
    loadVideos();
    
    return () => {
      isMountedRef.current = false;
      setVisibleVideos({});
      setIsScreenActive(false);
    };
  }, [loadVideos]);

  const handlePrediction = async (prediction: OutcomeType) => {
    if (videos.length === 0 || currentIndex >= videos.length) return;
    
    const currentVideoId = videos[currentIndex].id;
    
    // Add to answered questions locally
    if (!answeredQuestions.includes(currentVideoId)) {
      setAnsweredQuestions(prev => [...prev, currentVideoId]);
    }
    
    // Show prediction message
    setPredictionMessage({
      text: `You predicted ${prediction === OutcomeType.YES ? 'YES' : 'NO'}!`,
      type: prediction
    });
    
    // Hide message after 2 seconds
    setTimeout(() => {
      setPredictionMessage(null);
    }, 2000);
    
    // Submit prediction to API
    try {
      await submitPrediction(currentVideoId, contestId as string, user?.id || '', prediction);
    } catch (err) {
      console.error('Error submitting prediction:', err);
    }
  };

  const handleMuteToggle = () => {
    setMuteState(prev => !prev);
  };
  
  const handleBack = () => {
    // Force cleanup before navigation
    setIsScreenActive(false);
    setVisibleVideos({});
    
    // Small delay to ensure cleanup happens before navigation
    setTimeout(() => {
      router.back();
    }, 50);
  };
  
  const totalQuestions = videos.length;
  const remainingQuestions = answeredQuestions.length;

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (!isScreenActive || loading) return;
    
    if (viewableItems.length > 0) {
      const firstViewable = viewableItems[0];
      setCurrentIndex(firstViewable.index);

      // Only set the current visible video and ensure all others are false
      const newVisibleVideos: Record<number, boolean> = {};
      if (firstViewable.index !== null) {
        newVisibleVideos[firstViewable.index] = true;
      }
      setVisibleVideos(newVisibleVideos);
    } else {
      // No visible items, clear all
      setVisibleVideos({});
    }
  }, [isScreenActive, loading]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  if (loading && videos.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVideos}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <SafeAreaView style={styles.safeContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.muteButton}
          onPress={handleMuteToggle}
        >
          {muteState ? (
            <VolumeX color="#FFF" size={24} />
          ) : (
            <Volume2 color="#FFF" size={24} />
          )}
        </TouchableOpacity>
        
        <View style={styles.questionCounter}>
          <Text style={styles.questionCounterText}>{remainingQuestions}/9 questions answered</Text>
        </View>

        {videos.length > 0 && (
          <FlatList
            ref={flatListRef}
            data={videos}
            renderItem={({ item, index }) => (
              <VideoItem
                key={`${item.id}-${isScreenActive}`}
                item={item}
                isVisible={(visibleVideos[index] || false) && isScreenActive}
                muteState={muteState}
                onPrediction={handlePrediction}
                contestId={contestId as string}
              />
            )}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={Platform.OS === 'ios' ? WINDOW_HEIGHT -120 : WINDOW_HEIGHT }
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            style={styles.flatList}
            removeClippedSubviews={true}
          />
        )}
      </SafeAreaView>
      
      {predictionMessage && (
        <View style={[
          styles.predictionMessage, 
          predictionMessage.type === OutcomeType.YES ? styles.yesMessage : styles.noMessage
        ]}>
          <Text style={styles.predictionMessageText}>{predictionMessage.text}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingBottom: 26,
    
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatList: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    zIndex: 10,
  },
  muteButton: {
    position: 'absolute',
    right: 20,
    top: 40,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    zIndex: 10,
  },
  questionCounter: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    borderColor: '#FFF',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  questionCounterText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  predictionMessage: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 20,
    opacity: 0.9,
  },
  yesMessage: {
    backgroundColor: '#4CAF50',
  },
  noMessage: {
    backgroundColor: '#F44336',
  },
  predictionMessageText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});