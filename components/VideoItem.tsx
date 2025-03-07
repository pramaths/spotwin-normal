import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoPlayer = useVideoPlayer(
    { uri: item.videoUrl },
    (player) => {
      if (!player) return;
      
      try {
        player.loop = true;
        player.muted = muteState;
        
        if (isVisible) {
          try {
            player.play();
            setIsLoading(false);
            setIsPlaying(true);
          } catch (err) {
            setError('Failed to play video');
            setIsLoading(false);
          }
        } else {
          player.pause();
          setIsPlaying(false);
        }
      } catch (err) {
        setError('Video player error');
        setIsLoading(false);
      }
    }
  );

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
            />

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}

            {!isPlaying && !isLoading && (
              <View style={styles.pauseOverlay}>
                <Play color="#FFF" size={48} />
              </View>
            )}

            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            />

            <View style={styles.glassyContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionText}>{item.question}</Text>
              </View>
              <View style={styles.predictionContainer}>
                <TouchableOpacity
                  style={[styles.predictionButton, styles.yesButton]}
                  onPress={() => onPrediction('yes')}
                >
                  <Text style={styles.predictionButtonText}>YES</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.predictionButton, styles.noButton]}
                  onPress={() => onPrediction('no')}
                >
                  <Text style={styles.predictionButtonText}>NO</Text>
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
    height: Dimensions.get('window').height,
    backgroundColor: '#000',
  },
  videoTouchable: {
    flex: 1,
  },
  videoPlayer: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  glassyContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 20,
    padding: 10,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  questionHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  questionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  predictionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  predictionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  yesButton: {
    backgroundColor: '#2ECC71',
  },
  noButton: {
    backgroundColor: '#E74C3C',
  },
  predictionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  oddsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default VideoItem;
