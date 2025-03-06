import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play, Volume2, VolumeX, Users, Timer } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { height: WINDOW_HEIGHT, width } = Dimensions.get('window');

interface IFeaturedVideo {
  id: string;
  question: string;
  videoUrl: string;
}

const SAMPLE_VIDEOS: IFeaturedVideo[] = [
  {
    id: '1',
    question: 'Will Manchester United score in the first half?',
    videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/f367fad1-aff4-4a12-8e07-f0dbd0184b7e-perplexity.mp4',
  },
  {
    id: '2',
    question: 'Will Liverpool win the match?',
    videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/f367fad1-aff4-4a12-8e07-f0dbd0184b7e-perplexity.mp4',
  },
  {
    id: '3',
    question: 'Will the match end in a draw?',
    videoUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/0b5233d2-f1db-4714-bcfe-bfe33dcba6aa-nvidia_5T_mcap.mp4',
  },
];

interface VideoItemProps {
  item: IFeaturedVideo;
  index: number;
  isVisible: boolean;
  muteState: boolean;
  onPrediction: (prediction: 'yes' | 'no') => void;
  bottomInset: number;
}

const VideoItem = ({
  item,
  isVisible,
  muteState,
  onPrediction,
  bottomInset,
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
            player.loop = true;
            player.muted = muteState;
            player.play(); // Call play() without .then()
            setIsLoading(false);
            setIsPlaying(true);
          } catch (err) {
            setError('Failed to play video');
            setIsLoading(false);
          }
        }else {
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

  const contentHeight = WINDOW_HEIGHT - bottomInset ;

  return (
    <View style={[styles.videoContainer, { height: contentHeight }]}>
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

            <View style={[
              styles.glassyContainer,
              { bottom: Platform.OS === 'ios' ? bottomInset : 40 }
            ]}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionText}>{item.question}</Text>
              </View>
              <View style={styles.predictionContainer}>
                <TouchableOpacity
                  style={[styles.predictionButton, styles.yesButton]}
                  onPress={() => onPrediction('yes')}
                >
                  <Text style={styles.predictionButtonText}>YES</Text>
                  <Text style={styles.oddsText}>2.5x</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.predictionButton, styles.noButton]}
                  onPress={() => onPrediction('no')}
                >
                  <Text style={styles.predictionButtonText}>NO</Text>
                  <Text style={styles.oddsText}>1.8x</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleVideos, setVisibleVideos] = useState<Record<number, boolean>>({ 0: true });
  const [muteState, setMuteState] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePrediction = (prediction: 'yes' | 'no') => {
    console.log(`Prediction: ${prediction} for video ${currentIndex}`);
  };

  const handleMuteToggle = () => {
    setMuteState(prev => !prev);
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const firstViewable = viewableItems[0];
      setCurrentIndex(firstViewable.index);

      const newVisibleVideos: Record<number, boolean> = {};
      viewableItems.forEach((item: any) => {
        if (item.index !== null) {
          newVisibleVideos[item.index] = true;
        }
      });
      setVisibleVideos(newVisibleVideos);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const contentHeight = WINDOW_HEIGHT - (Platform.OS === 'ios' ? 90 : 60);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <TouchableOpacity
        style={[styles.muteButton, { top: insets.top + 10 }]}
        onPress={handleMuteToggle}
      >
        {muteState ? (
          <VolumeX color="#FFF" size={24} />
        ) : (
          <Volume2 color="#FFF" size={24} />
        )}
      </TouchableOpacity>

      <FlatList
        data={SAMPLE_VIDEOS}
        renderItem={({ item, index }) => (
          <VideoItem
            item={item}
            index={index}
            isVisible={visibleVideos[index] || false}
            muteState={muteState}
            onPrediction={handlePrediction}
            bottomInset={Platform.OS === 'ios' ? 90 : 60}
          />
        )}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={contentHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(_, index) => ({
          length: contentHeight,
          offset: contentHeight * index,
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
    flex: 1,
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
  muteButton: {
    position: 'absolute',
    right: 20,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    zIndex: 10,
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 20,
    padding: 20,
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
    fontSize: 20,
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
    padding: Platform.OS === 'ios' ? 12 : 15,
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
    fontSize: Platform.OS === 'ios' ? 16 : 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  oddsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: Platform.OS === 'ios' ? 12 : 14,
    fontWeight: '500',
  },
  statsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});