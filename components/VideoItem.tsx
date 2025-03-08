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
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no' | null>(null);
  const playerRef = useRef<VideoPlayer | null>(null);

  // Create video player with null source initially
  const videoPlayer = useVideoPlayer(
    null,
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

  // Set the video source when the component mounts
  useEffect(() => {
    if (!videoPlayer) return;

    try {
      videoPlayer.replace({ uri: item.videoUrl });
    } catch (err) {
      setError('Failed to set video source');
    }

    return () => {
      try {
        if (videoPlayer) {
          videoPlayer.pause();
          // Replace with null source to fully unload the video
          videoPlayer.replace(null);
        }
      } catch (err) {
        // Silent cleanup error
      }
    };
  }, [item.videoUrl, videoPlayer]);

  // Handle visibility and mute state changes
  useEffect(() => {
    if (!videoPlayer) return;

    try {
      videoPlayer.muted = muteState;

      if (isVisible) {
        videoPlayer.play();
        setIsPlaying(true);
      } else {
        videoPlayer.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      setError('Failed to update video playback state');
    }
  }, [isVisible, muteState, videoPlayer]);

  useEffect(() => {
    return () => {
      try {
        if (playerRef.current) {
          playerRef.current.pause();
          playerRef.current.release();
        }
      } catch (err) {
      }
    };
  }, []);

  const handleVideoPress = () => {
    if (!videoPlayer) return;

    try {
      if (videoPlayer.playing) {
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
      onPrediction(prediction); setSelectedOption(null);
    }, 800);
  };

  if (error) {
    return (
      <View style={[styles.videoContainer, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
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
              allowsFullscreen
            // contentFit='fill'
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
    left: 0,
    right: 0,
    bottom: 40,
    paddingHorizontal: 16,
  },
  questionContainer: {
    backgroundColor: 'rgba(33, 33, 33, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  questionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  predictionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  predictionButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
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
});

export default VideoItem;