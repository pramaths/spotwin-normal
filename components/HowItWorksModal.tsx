import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useState, useEffect } from 'react';

import { useAuthStore } from '../store/authstore';

const { width } = Dimensions.get('window');

interface SlideData {
  title: string;
  description: string;
}

const howItWorksSlides: SlideData[] = [
  {
    title: 'Join the contest!',
    description: 'Tap "Join" to enter the contest for FREE',
  },
  {
    title: 'Answer 9 Questions',
    description: 'Answer 3 questions each from Easy, Medium and Hard sections',
  },
  {
    title: 'Leaderboard',
    description: 'Lucky winners get FREE Points, which can be redeemed for tickets',
  },
];

interface HowItWorksModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ visible, onClose }: HowItWorksModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const isLastSlide = currentSlideIndex === howItWorksSlides.length - 1;
  const setIsNewUser = useAuthStore((state) => state.setIsNewUser);
  const isNewUser = useAuthStore((state) => state.isNewUser);

  // Reset slide index when modal is opened
  useEffect(() => {
    if (visible) {
      setCurrentSlideIndex(0);
    }
  }, [visible]);

  const handleNextSlide = () => {
    if (currentSlideIndex < howItWorksSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handleClose = () => {
    // Reset slide index and close modal
    setCurrentSlideIndex(0);
    setIsNewUser(false);
    onClose();
  };

  const currentSlide = howItWorksSlides[currentSlideIndex];

  // Helper function to highlight difficulty words with color
  const colorizeText = (text: string) => {
    const words = text.split(' ');
    return words.map((word, index) => {
      let color = '';
      if (word.toLowerCase() === 'easy') color = '#4CAF50'; // Green
      else if (word.toLowerCase() === 'medium') color = '#FFC107'; // Yellow
      else if (word.toLowerCase() === 'hard') color = '#F44336'; // Red
      
      return (
        <Text key={index} style={[styles.slideDescriptionText, color ? { color } : null]}>
          {word}{index < words.length - 1 ? ' ' : ''}
        </Text>
      );
    });
  };

  // We don't need to use Modal here since it's already wrapped in a Modal in HeaderProfile
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>How it works</Text>

        <View style={styles.slide}>
          <Text style={styles.slideTitle}>{currentSlide.title}</Text>
          <View style={styles.slideDescription}>
            {currentSlide.description.toLowerCase().includes('easy') || 
             currentSlide.description.toLowerCase().includes('medium') || 
             currentSlide.description.toLowerCase().includes('hard') 
             ? colorizeText(currentSlide.description)
             : <Text style={styles.slideDescriptionText}>{currentSlide.description}</Text>}
          </View>
        </View>

        <View style={styles.indicatorContainer}>
          {howItWorksSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentSlideIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {isLastSlide ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextSlide}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 26,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  slide: {
    width: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  svgImage: {
    marginBottom: 16,
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  slideDescription: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  slideDescriptionText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#007AFF',
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    gap: 12,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  learnMoreButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  learnMoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '80%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
