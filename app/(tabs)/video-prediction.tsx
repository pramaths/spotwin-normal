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
import { fetchFeaturedVideos, submitPrediction, IFeaturedVideo, RemovePrediction, fetchUserPredictions } from '../../services/videoApi';
import { useLocalSearchParams } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { OutcomeType } from '@/types';
import { IUserPrediction } from '@/components/UserPredictions';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

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
  const [predictions, setPredictions] = useState<IUserPrediction[]>([]);
  const [userVotesMap, setUserVotesMap] = useState<Record<string, OutcomeType | null>>({});

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
    const loadPredictions = async () => {
      if (!contestId) {
        setError('Contest ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data = await fetchUserPredictions(contestId as string, user?.id || '');
        setPredictions(data);
        const votesMap = data.reduce((acc, prediction) => {
          acc[prediction.video.id] = prediction.prediction as OutcomeType | null;
          return acc;
        },{} as Record<string, OutcomeType | null>);
        setUserVotesMap(votesMap);
        setAnsweredQuestions(data.map(prediction => prediction.video.id));
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load predictions');
        setLoading(false);
      }
    };

    loadPredictions();
  }, [contestId, user]);

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

  const handleRemovePrediction = async (videoId: string) => {
    try {
      await RemovePrediction(videoId as string, user?.id || '');
      
      setUserVotesMap(prev => {
        const updated = {...prev};
        delete updated[videoId];
        return updated;
      });
      
      setAnsweredQuestions(prev => prev.filter(id => id !== videoId));
      
      setPredictions(prev => prev.filter(p => p.videoId !== videoId));
      
    } catch (err) {
      console.error('Error removing prediction:', err);
    }
  };

  const handlePrediction = async (prediction: OutcomeType) => {
    if (videos.length === 0 || currentIndex >= videos.length) return;
    
    const currentVideoId = videos[currentIndex].id;
    
    try {
      // Check if we've already reached the maximum predictions
      if (Object.keys(userVotesMap).length >= 9 && !userVotesMap[currentVideoId]) {
        setPredictionMessage({
          text: 'Maximum of 9 predictions reached for this contest reached, Undo other predictions to make a new one',
          type: OutcomeType.NO
        });
        
        setTimeout(() => {
          setPredictionMessage(null);
        }, 2000);
        return;
      }
      
      await submitPrediction(currentVideoId, contestId as string, user?.id || '', prediction);
      
      if (!answeredQuestions.includes(currentVideoId)) {
        setAnsweredQuestions(prev => [...prev, currentVideoId]);
      }
      
      setUserVotesMap(prev => ({
        ...prev,
        [currentVideoId]: prediction
      }));
      
      // Show prediction message
      setPredictionMessage({
        text: `You predicted ${prediction === OutcomeType.YES ? 'YES' : 'NO'}!`,
        type: prediction
      });
      
      setTimeout(() => {
        setPredictionMessage(null);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error submitting prediction:', err);
      
      // Check for the specific max predictions error
      if (err.message && err.message.includes('maximum number of predictions')) {
        setPredictionMessage({
          text: 'Maximum of 9 predictions reached for this contest',
          type: OutcomeType.NO
        });
      } else {
        setPredictionMessage({
          text: 'Failed to submit prediction. Please try again.',
          type: OutcomeType.NO 
        });
      }
      
      setTimeout(() => {
        setPredictionMessage(null);
      }, 2000);
    }
  };

  const handleMuteToggle = () => {
    setMuteState(prev => !prev);
  };
  
  const handleBack = () => {
    setIsScreenActive(false);
    setVisibleVideos({});
    
    setTimeout(() => {
      router.back();
    }, 50);
  };
  
  const totalQuestions = 9; // Maximum allowed predictions
  const answeredQuestionsCount = Object.keys(userVotesMap).length;

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
          <Text style={styles.questionCounterText}>{answeredQuestionsCount}/{totalQuestions} questions answered</Text>
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
                userVote={userVotesMap[item.id] || null}
                onRemovePrediction={() => handleRemovePrediction(item.id)}
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