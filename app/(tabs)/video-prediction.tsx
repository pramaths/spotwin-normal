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
    if (videoPlayer) {
      if (isVisible) {
        videoPlayer.play();
      } else {
        videoPlayer.pause();
      }
      videoPlayer.muted = muteState;
    }
  }, [isVisible, muteState, videoPlayer]);

  // Pause video when component unmounts
  useEffect(() => {
    return () => {
      if (videoPlayer) {
        videoPlayer.pause();
      }
    };
  }, [videoPlayer]);

  // Handle play/pause toggle
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
              nativeControls ={false}
            />
            
            {/* Play/Pause indicator */}
            {!isPlaying  && (
              <View style={styles.pauseOverlay}>
                <Play color="#FFF" size={48} />
              </View>
            )}
            
            {/* Question overlay at bottom */}
            <View style={styles.questionContainer}>
              <View style={styles.questionBubble}>
                <Text style={styles.questionText}>{item.question}</Text>
              </View>
              
              {/* Yes/No prediction buttons */}
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
  
  // Create a ref for the viewability config to avoid recreating it on each render
  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50
  }).current;
  
  // Fetch videos on component mount
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // You can pass eventId and contestId if needed
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

    // Cleanup function when component unmounts or when navigating away
    return () => {
      // Any cleanup needed when component unmounts
      console.log('Cleaning up VideoPredictionScreen');
    };
  }, []);
  
  const handleViewableItemsChanged = ({ 
    viewableItems 
  }: { 
    viewableItems: Array<ViewToken> 
  }) => {
    if (viewableItems.length > 0) {
      const visibleIndexes: Record<number, boolean> = {};
      
      viewableItems.forEach(viewable => {
        if (viewable.index !== undefined && viewable.index !== null) {
          visibleIndexes[viewable.index] = true;
        }
      });
      
      // Set current visible videos
      setVisibleVideos(visibleIndexes);
            if (viewableItems[0]?.index !== undefined && viewableItems[0]?.index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  };

  const handlePrediction = useCallback(async (prediction: string, index: number) => {
    try {
      // Update UI immediately for better UX
      setSelections(prev => ({ ...prev, [index]: prediction }));
      
      // Submit prediction to API if there's a valid video
      if (videos[index]) {
        await submitPrediction(videos[index].id, prediction);
      }

      // Automatically scroll to next video after a short delay
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
      // We could show an error toast here, but we'll keep the UI selection for better UX
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
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading prediction videos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
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
    <View style={styles.container}>
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
        initialScrollIndex={0}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
      
      {/* Controls overlay */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Center content for loading and error states
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoContainer: {
    width,
    height,
    backgroundColor: '#000',
    position: 'relative',
  },
  // Touchable area for video
  videoTouchable: {
    flex: 1,
  },
  // Video player styles
  videoPlayer: {
    flex: 1,
  },
  // Top controls container (back button and mute toggle)
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  // Back button styling
  backButton: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  // Mute button styling
  muteButton: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  // Overlay when video is paused
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Overlay when video is buffering
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Text shown during buffering
  bufferingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
  // Container for the question at the bottom
  questionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  questionBubble: {
    backgroundColor: '#3672E9',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  // Question text styling
  questionText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Container for prediction buttons
  predictionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  // Individual prediction button
  predictionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  yesButton: {
    backgroundColor: '#34C759',
  },
  noButton: {
    backgroundColor: '#FF3B30',
  },
  // Selected button style
  selectedYesButton: {
    backgroundColor: '#2ECC71',
    borderColor: '#FFFF00',
    borderWidth: 3,
  },
  selectedNoButton: {
    backgroundColor: '#E74C3C',
    borderColor: '#FFFF00',
    borderWidth: 3,
  },
  // Prediction button text
  predictionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Container for showing user's prediction
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
  // Text for prediction indicator
  predictionIndicatorText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Error container
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Error text
  errorText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  // Retry button
  retryButton: {
    backgroundColor: '#3672E9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 150,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  // Retry button text
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Loading text
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 10,
  },
});