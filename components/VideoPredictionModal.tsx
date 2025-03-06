// VideoPredictionModal.tsx
import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

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
      'https://s3.ap-south-1.amazonaws.com/sizzils3/0b5233d2-f1db-4714-bcfe-bfe33dcba6aa-nvidia_5T_mcap.mp4',
  },
];

interface VideoPredictionModalProps {
  onClose: () => void;
  maxSelections: number;
}

export default function VideoPredictionModal({
  onClose,
  maxSelections = 9,
}: VideoPredictionModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<{ [key: string]: boolean }>({});
  const position = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);

  const getSelectionsCount = () => Object.keys(selections).length;

  // PanResponder for swipe up/down
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: 0, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        if (gestureState.dy < -100 && currentIndex < predictionVideos.length - 1) {
          // Swipe up -> next
          Animated.timing(position, {
            toValue: { x: 0, y: -height },
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            position.setValue({ x: 0, y: 0 });
            setCurrentIndex((prev) => prev + 1);
          });
        } else if (gestureState.dy > 100 && currentIndex > 0) {
          // Swipe down -> previous
          Animated.timing(position, {
            toValue: { x: 0, y: height },
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            position.setValue({ x: 0, y: 0 });
            setCurrentIndex((prev) => prev - 1);
          });
        } else {
          // Reset position
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Current video
  const currentVideo = predictionVideos[currentIndex];
  const videoSource = { uri: currentVideo.videoUrl };

  // Video setup
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });
  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  // Handle prediction (YES/NO)
  const handlePrediction = (prediction: boolean) => {
    if (getSelectionsCount() >= maxSelections && selections[currentIndex] === undefined) {
      return; // Optionally show "max selections" message
    }

    setSelections({ ...selections, [currentIndex]: prediction });

    // Move to next video automatically
    if (currentIndex < predictionVideos.length - 1) {
      Animated.timing(position, {
        toValue: { x: 0, y: -height },
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        position.setValue({ x: 0, y: 0 });
        setCurrentIndex((prev) => prev + 1);
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with “Questions left” and Close Button */}
      <View style={styles.header}>
        <Text style={styles.questionsLeft}>
          {maxSelections - getSelectionsCount()} Questions left
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Swipable Video */}
      <Animated.View
        style={[
          styles.videoContainer,
          { transform: position.getTranslateTransform() },
        ]}
        {...panResponder.panHandlers}
      >
        <VideoView
          player={player}
          style={styles.videoPlayer}
        />

        {/* Question & Buttons */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentVideo.question}</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.yesButton]}
              onPress={() => handlePrediction(true)}
              disabled={
                getSelectionsCount() >= maxSelections &&
                selections[currentIndex] === undefined
              }
            >
              <Text style={styles.buttonText}>YES</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.noButton]}
              onPress={() => handlePrediction(false)}
              disabled={
                getSelectionsCount() >= maxSelections &&
                selections[currentIndex] === undefined
              }
            >
              <Text style={styles.buttonText}>NO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${(getSelectionsCount() / maxSelections) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionsLeft: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  // Video container
  videoContainer: {
    flex: 1,
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  // Question & buttons
  questionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  questionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  button: {
    width: '45%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#4CAF50',
  },
  noButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  // Progress bar
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
});
