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
import { router, useLocalSearchParams } from 'expo-router';
import { fetchPredictionVideos, submitPrediction, updateUserPrediction, IUserPrediction, fetchUserPredictions } from '@/api/predictionVideos';
import { IFeaturedVideo, IOutcomeType } from '@/types';

const { height, width } = Dimensions.get('window');

interface VideoItemProps {
  item: IFeaturedVideo;
  index: number;
  isVisible: boolean;
  muteState: boolean;
  hasSelected: boolean;
  selection: string | undefined;
  onPrediction: (prediction: string, index: number) => void;
  isEditing?: boolean;
}

const VideoItem = ({
  item,
  index,
  isVisible,
  muteState,
  hasSelected,
  selection,
  onPrediction,
  isEditing
}: VideoItemProps) => {
  const [loading, setLoading] = useState(true);
  const [questionsLeft, setQuestionsLeft] = useState(9);
  const [isPlayerMounted, setIsPlayerMounted] = useState(true);

  const videoPlayer = useVideoPlayer(
    { uri: item.videoUrl },
    (player) => {
      if (!isPlayerMounted) return;
      player.loop = true;
      player.muted = muteState;

      if (isVisible) {
        player.play();
      } else {
        player.pause();
      }
    }
  );

  const { isPlaying } = useEvent(videoPlayer, 'playingChange', {
    isPlaying: videoPlayer?.playing || false
  });

  // Handle visibility and mute state changes
  useEffect(() => {
    if (videoPlayer && isPlayerMounted) {
      if (isVisible) {
        videoPlayer.play();
      } else {
        videoPlayer.pause();
      }
      videoPlayer.muted = muteState;
    }
  }, [isVisible, muteState, videoPlayer, isPlayerMounted]);

  useEffect(() => {
    return () => {
      setIsPlayerMounted(false);
      try {
        if (videoPlayer) {
          videoPlayer.pause();
          videoPlayer.dispose();
        }
      } catch (err: any) {
        console.log(`Cleanup error handled: ${err.message}`);
      }
    };
  }, [videoPlayer]);

  const handleVideoPress = () => {
    if (videoPlayer && isPlayerMounted) {
      if (videoPlayer.playing) {
        videoPlayer.pause();
      } else {
        videoPlayer.play();
      }
    }
  };

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

            {/* Questions left counter - hide if editing a specific prediction */}
            {!isEditing && (
              <View style={styles.questionsLeftContainer}>
                <View style={styles.questionsLeftBadge}>
                  <Text style={styles.questionsLeftText}>{questionsLeft} Questions left</Text>
                </View>
              </View>
            )}

            <View style={styles.glassyContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionText}>{item.question}</Text>
              </View>
              <View style={styles.predictionContainer}>
                <TouchableOpacity
                  style={[
                    styles.predictionButton,
                    styles.yesButton,
                    hasSelected && selection === 'yes' && styles.selectedYesButton
                  ]}
                  onPress={() => onPrediction('yes', index)}
                  disabled={isEditing ? false : hasSelected}
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
                  disabled={isEditing ? false : hasSelected}
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
};

export default function VideoPredictionScreen() {
  const params = useLocalSearchParams<{
    predictionId?: string,
    videoId?: string,
    contestId?: string,
    edit?: string
  }>();

  const isEditing = !!(params.edit === 'true' && params.predictionId && params.videoId);
  const contestId = params.contestId;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [visibleVideos, setVisibleVideos] = useState<Record<number, boolean>>({ 0: true });
  const [muteState, setMuteState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<IFeaturedVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingPrediction, setEditingPrediction] = useState<IUserPrediction | null>(null);

  const flatListRef = useRef<FlatList<IFeaturedVideo> | null>(null);

  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50
  }).current;

  // Load videos or specific video for editing
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);

        // If we're editing a specific prediction, load just that video
        if (isEditing && params.predictionId && params.contestId) {
          // Get the user prediction details
          const predictions = await fetchUserPredictions(params.contestId);
          const prediction = predictions.find(p => p.id === params.predictionId);

          if (prediction) {
            setEditingPrediction(prediction);

            // Create a video object from the prediction
            const videoData: IFeaturedVideo[] = [{
              id: prediction.videoId,
              question: prediction.question,
              videoUrl: prediction.videoUrl
            }];

            setVideos(videoData);

            // Set initial selection based on existing prediction
            setSelections({
              0: prediction.outcome === IOutcomeType.YES ? 'yes' : 'no'
            });
          } else {
            setError('Prediction not found');
          }
        } else {
          // Normal flow - load all prediction videos
          const data = await fetchPredictionVideos(undefined, contestId);

          if (data.length === 0) {
            setError('No prediction videos available');
          } else {
            setVideos(data);
          }
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load videos');
        setLoading(false);
      }
    };

    loadVideos();
  }, [isEditing, params.predictionId, params.videoId, params.contestId]);

  // Handle visible video changes
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const firstViewable = viewableItems[0];
      const newIndex = firstViewable.index !== null ? firstViewable.index : 0;

      setCurrentIndex(newIndex);

      // Update which videos are visible
      const newVisibleVideos: Record<number, boolean> = {};
      viewableItems.forEach(item => {
        if (item.index !== null) {
          newVisibleVideos[item.index] = true;
        }
      });

      setVisibleVideos(newVisibleVideos);
    }
  }, []);

  const handlePrediction = async (prediction: string, index: number) => {
    try {
      setSelections(prev => ({ ...prev, [index]: prediction }));

      const videoId = videos[index].id;

      if (isEditing && editingPrediction) {
        // If editing, update the prediction
        await updateUserPrediction(
          editingPrediction.id,
          prediction === 'yes' ? IOutcomeType.YES : IOutcomeType.NO
        );

        // Navigate back to the contest detail page if we came from there
        if (params.contestId) {
          router.replace({
            pathname: "/contest-detail/[id]",
            params: { id: params.contestId }
          });
        } else {
          // If no contestId, just go back
          router.back();
        }
      } else {
        await submitPrediction(videoId, prediction);
        setTimeout(() => {
          if (index < videos.length - 1) {
            flatListRef.current?.scrollToIndex({
              index: index + 1,
              animated: true
            });
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error('Failed to submit prediction:', err.message);
    }
  };

  const handleMuteToggle = () => {
    setMuteState(prev => !prev);
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
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
      </View>

      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={({ item, index }) => (
          <VideoItem
            item={item}
            index={index}
            isVisible={visibleVideos[index] || false}
            muteState={muteState}
            hasSelected={selections[index] !== undefined}
            selection={selections[index]}
            onPrediction={handlePrediction}
            isEditing={isEditing}
          />
        )}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  questionHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  predictionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  glassyContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  predictionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    flexDirection: 'row'
  },
  yesButton: {
    backgroundColor: '#27ae60',
  },
  noButton: {
    backgroundColor: '#e74c3c',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  predictionIndicator: {
    position: 'absolute',
    top: 150,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3672E9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
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
    alignSelf: 'center',
    zIndex: 10,
  },
  questionsLeftBadge: {
    backgroundColor: '#1a2a47',
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
  header: {
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
  questionText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});