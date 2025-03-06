import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  ViewToken,
  ViewabilityConfig,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { Play, Volume2, VolumeX, ChevronLeft } from 'lucide-react-native';
import { IFeaturedVideo, IFeaturedVideos } from '@/types';
import { router } from 'expo-router';
import { fetchPredictionVideos, submitPrediction } from '@/api/predictionVideos';

const { height, width } = Dimensions.get('window');

// Separate component for each video item
const VideoItem = ({ 
  item, 
  index, 
  isVisible, 
  muteState, 
  hasSelected,
  selection,
  onPrediction
}: { 
  item: IFeaturedVideo, 
  index: number, 
  isVisible: boolean, 
  muteState: boolean,
  hasSelected: boolean,
  selection: string | undefined,
  onPrediction: (prediction: string, index: number) => void
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalQuestions] = useState(9); // Hardcoded for now, but could come from API
  const [questionsLeft] = useState(totalQuestions); // Could be calculated based on progress
  
  const videoPlayer = useVideoPlayer(
    { uri: item.videoUrl }, 
    (player) => {
      player.loop = true;
      
      if (isVisible) {
        player.play();
      } else {
        player.pause();
      }
      
      player.muted = muteState;
    }
  );
  
  const { isPlaying } = useEvent(videoPlayer, 'playingChange', { 
    isPlaying: videoPlayer?.playing || false 
  });
  
  const { status } = useEvent(videoPlayer, 'statusChange', { 
    status: videoPlayer?.status || 'unknown',
  });
  
  useEffect(() => {
    try {
      if (videoPlayer && typeof videoPlayer === 'object') {
        if (isVisible) {
          videoPlayer.play();
        } else {
          videoPlayer.pause();
        }
        videoPlayer.muted = muteState;
      }
    } catch (err:any) {
      console.log(`Error handling video player: ${err.message}`);
    }
  }, [isVisible, muteState, videoPlayer]);

  // Pause video when component unmounts
  useEffect(() => {
    return () => {
      try {
        // Only attempt to pause if videoPlayer exists and has a valid reference
        if (videoPlayer && typeof videoPlayer === 'object' && videoPlayer.status !== 'error') {
          console.log(`Safely cleaning up video player for index ${index}`);
          videoPlayer.pause();
        }
      } catch (err:any) {
        // Silent catch to prevent unmount errors
        console.log(`Error during video cleanup: ${err.message}`);
      }
    };
  }, [videoPlayer, index]);

  const handleVideoPress = () => {
    if (videoPlayer) {
      if (videoPlayer.playing) {
        videoPlayer.pause();
      } else {
        videoPlayer.play();
      }
    }
  };

  if (error) {
    return (
      <View style={[styles.videoContainer, styles.errorContainer]}>
        <Text style={styles.errorText}>
          {error}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setError(null)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.videoContainer}>
      <TouchableOpacity 
        activeOpacity={1}
        style={styles.videoTouchable} 
        onPress={handleVideoPress}
      >
        {videoPlayer && (
          <>
            <VideoView
              player={videoPlayer}
              style={styles.videoPlayer}
              nativeControls={false}
            />
            
            {!isPlaying && (
              <View style={styles.pauseOverlay}>
                <Play color="#FFF" size={48} />
              </View>
            )}
            
            {/* Questions left counter - centered at top */}
            <View style={styles.questionsLeftContainer}>
              <View style={styles.questionsLeftBadge}>
                <Text style={styles.questionsLeftText}>{questionsLeft} Questions left</Text>
              </View>
            </View>
            
            {/* Question and answers at bottom - matching reference image */}
            <View style={styles.questionFooter}>
              <Text style={styles.questionText}>{item.question}</Text>
              
              <View style={styles.predictionButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.predictionButton,
                    styles.yesButton,
                    hasSelected && selection === 'yes' && styles.selectedYesButton
                  ]}
                  onPress={() => onPrediction('yes', index)}
                  disabled={hasSelected}
                >
                  <Text style={styles.predictionButtonText}>YES</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.predictionButton,
                    styles.noButton,
                    hasSelected && selection === 'no' && styles.selectedNoButton
                  ]}
                  onPress={() => onPrediction('no', index)}
                  disabled={hasSelected}
                >
                  <Text style={styles.predictionButtonText}>NO</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
      
      {/* Selected prediction indicator */}
      {hasSelected && (
        <View style={styles.predictionIndicator}>
          <Text style={styles.predictionIndicatorText}>
            Your prediction: {selection === 'yes' ? 'YES' : 'NO'}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function VideoPredictionScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [visibleVideos, setVisibleVideos] = useState<Record<number, boolean>>({0: true});
  const [muteState, setMuteState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<IFeaturedVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList<IFeaturedVideo> | null>(null);
  
  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50
  }).current;
  
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchPredictionVideos();
        
        if (data.length === 0) {
          setError('No prediction videos available');
        } else {
          setVideos(data);
          // Initialize the first video as visible
          setVisibleVideos({ 0: true });
        }
      } catch (err) {
        setError('Failed to load prediction videos');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadVideos();

    return () => {
      console.log('Cleaning up VideoPredictionScreen');
    };
  }, []);
  
  const handleViewableItemsChanged = useCallback(({ 
    viewableItems 
  }: { 
    viewableItems: Array<ViewToken> 
  }) => {
    if (viewableItems.length > 0) {
      // Build a new visibility map
      const newVisibleVideos: Record<number, boolean> = {};
      
      // Mark currently visible items
      viewableItems.forEach((viewToken) => {
        if (viewToken.index !== null) {
          newVisibleVideos[viewToken.index] = true;
        }
      });
      
      // Update current index to the first visible video
      if (viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
      
      setVisibleVideos(newVisibleVideos);
    }
  }, []);

  const handlePrediction = useCallback(async (prediction: string, index: number) => {
    try {
      setSelections(prev => ({ ...prev, [index]: prediction }));
      
      if (videos[index]) {
        await submitPrediction(videos[index].id, prediction);
      }

      setTimeout(() => {
        if (index < videos.length - 1) {
          flatListRef.current?.scrollToIndex({
            index: index + 1,
            animated: true,
            viewPosition: 0
          });
        }
      }, 300);
    } catch (err) {
      console.error('Error submitting prediction:', err);
    }
  }, [videos]);

  // Handle mute toggle for all videos
  const handleMuteToggle = () => {
    setMuteState(!muteState);
  };

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  const renderItem = useCallback(({ item, index }: { item: IFeaturedVideo, index: number }) => (
    <VideoItem 
      item={item}
      index={index}
      isVisible={visibleVideos[index] || false}
      muteState={muteState}
      hasSelected={selections[index] !== undefined}
      selection={selections[index]}
      onPrediction={handlePrediction}
    />
  ), [visibleVideos, muteState, selections, handlePrediction]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading prediction videos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="always"
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
      
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.muteButton} onPress={handleMuteToggle}>
          {muteState ? (
            <VolumeX color="#FFF" size={24} />
          ) : (
            <Volume2 color="#FFF" size={24} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoContainer: {
    width,
    height: Platform.OS === 'ios' ? height : height - 48, // Adjust for Android tab bar
    backgroundColor: '#000',
    position: 'relative',
  },
  videoTouchable: {
    flex: 1,
  },
  videoPlayer: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  muteButton: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
  questionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20, // Adjust for iOS home indicator
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  questionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  predictionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: 20,
  },
  predictionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesButton: {
    backgroundColor: '#27ae60', // Exact green from reference
  },
  noButton: {
    backgroundColor: '#e74c3c', // Exact red from reference
  },
  selectedYesButton: {
    backgroundColor: '#2ECC71',
    opacity: 0.8,
  },
  selectedNoButton: {
    backgroundColor: '#E74C3C',
    opacity: 0.8,
  },
  predictionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  predictionIndicator: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(54, 114, 233, 0.8)',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  predictionIndicatorText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3672E9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 10,
  },
  questionsLeftContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  questionsLeftBadge: {
    backgroundColor: '#1a2a47', // Dark blue like in the image
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  questionsLeftText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});