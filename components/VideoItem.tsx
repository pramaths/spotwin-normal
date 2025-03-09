import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView, VideoPlayer } from 'expo-video';
import { Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

interface IFeaturedVideo {
  id: string;
  question: string;
  videoUrl: string;
}

interface VideoItemProps {
  item: IFeaturedVideo;
  isVisible: boolean;
  muteState: boolean;
  onPrediction: (prediction: 'yes' | 'no') => void;
}

const VideoItem = ({
  item,
  isVisible,
  muteState,
  onPrediction,
}: VideoItemProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no' | null>(null);
  const playerRef = useRef<VideoPlayer | null>(null);

  // Create video player with the video source initially
  const videoPlayer = useVideoPlayer(
    { uri: item.videoUrl },
    (player) => {
      playerRef.current = player;

      try {
        player.loop = true;
        player.muted = muteState;
      } catch (err) {
        setError('Video player initialization error');
      }
    }
  );

  useEffect(() => {
    if (!videoPlayer) return;
    
    const statusChangeListener = videoPlayer.addListener('statusChange', (payload) => {
      if (payload.status === 'readyToPlay') {
        setIsLoading(false);
        if (isVisible) {
          videoPlayer.play();
          setIsPlaying(true);
        }
      } else if (payload.status === 'error' && payload.error) {
        setError('Failed to load video');
        setIsLoading(false);
      }
    });
    
    return () => {
      statusChangeListener.remove();
    };
  }, [videoPlayer, isVisible]);

  // Handle visibility and mute state changes
  useEffect(() => {
    if (!videoPlayer) return;

    try {
      videoPlayer.muted = muteState;

      if (isVisible && !isLoading) {
        videoPlayer.play();
        setIsPlaying(true);
      } else {
        videoPlayer.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Failed to update video playback state:', err);
    }
  }, [isVisible, muteState, videoPlayer, isLoading]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      try {
        if (playerRef.current) {
          playerRef.current.pause();
          playerRef.current.release();
        }
      } catch (err) {
        console.error('Error cleaning up video player:', err);
      }
    };
  }, []);

  const handleVideoPress = () => {
    if (!videoPlayer || isLoading) return;

    try {
      if (isPlaying) {
        videoPlayer.pause();
        setIsPlaying(false);
      } else {
        videoPlayer.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError('Failed to toggle playback');
    }
  };

  const handlePrediction = (prediction: 'yes' | 'no') => {
    setSelectedOption(prediction);
    setTimeout(() => {
      onPrediction(prediction); 
      setSelectedOption(null);
    }, 800);
  };

  if (error) {
    return (
      <View style={[styles.videoContainer, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Skeleton loading UI
  const renderSkeletonUI = () => {
    return (
      <View style={[styles.videoContainer, styles.skeletonContainer]}>
        <Animatable.View 
          animation="pulse" 
          easing="ease-in-out" 
          iterationCount="infinite" 
          duration={1500}
          style={styles.skeletonVideo} 
        />
        
        <View style={styles.bottomContainer}>
          <View style={styles.questionContainer}>
            <Animatable.View 
              animation="pulse" 
              easing="ease-in-out" 
              iterationCount="infinite" 
              duration={1500}
              style={styles.skeletonQuestion} 
            />
          </View>
          
          {/* Prediction buttons skeleton */}
          <View style={styles.predictionContainer}>
            <Animatable.View 
              animation="pulse" 
              easing="ease-in-out" 
              iterationCount="infinite" 
              duration={1500}
              style={[styles.predictionButton, styles.skeletonButton]} 
            />
            <Animatable.View 
              animation="pulse" 
              easing="ease-in-out" 
              iterationCount="infinite" 
              duration={1500}
              style={[styles.predictionButton, styles.skeletonButton]} 
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.videoContainer}>
      {isLoading ? (
        renderSkeletonUI()
      ) : (
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
                allowsFullscreen
              />

              {!isPlaying && (
                <View style={styles.pauseOverlay}>
                  <Play color="#FFF" size={48} />
                </View>
              )}

              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
              />

              <View style={styles.bottomContainer}>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>{item.question}</Text>
                </View>
                <View style={styles.predictionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.predictionButton,
                      styles.yesButton,
                      selectedOption === 'yes' && styles.selectedButton
                    ]}
                    onPress={() => handlePrediction('yes')}
                  >
                    <Text style={styles.yesText}>YES</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.predictionButton,
                      styles.noButton,
                      selectedOption === 'no' && styles.selectedButton
                    ]}
                    onPress={() => handlePrediction('no')}
                  >
                    <Text style={styles.noText}>NO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    width,
    height,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  videoTouchable: {
    flex: 1,
  },
  videoPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: '100%',
  },
  bottomContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  questionContainer: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(40px)',
    width: '100%',
  },
  questionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'left',
  },
  predictionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
    },
  predictionButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  yesButton: {
    backgroundColor: '#4CAF50',
  },
  noButton: {
    backgroundColor: '#F44336',
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  yesText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  noText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Skeleton styles
  skeletonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#333',
  },
  skeletonQuestion: {
    height: 18,
    width: '80%',
    backgroundColor: '#555',
    borderRadius: 4,
    alignSelf: 'center',
  },
  skeletonButton: {
    backgroundColor: '#555',
  },
});

export default VideoItem;