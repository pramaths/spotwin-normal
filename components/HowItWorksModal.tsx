import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useState } from 'react';

import FirstHowItWorks from '../assets/images/1sthowitworks.svg';
import SecondHowItWorks from '../assets/images/2ndhowitworks.svg';
import ThirdHowItWorks from '../assets/images/3rdhowitworks.svg';
import leaderboard from '../assets/images/leaderboard.svg';

import { useAuthStore } from '../store/authstore';

const { width } = Dimensions.get('window');

interface SlideData {
  title: string;
  description: string;
  SvgComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}


const howItWorksSlides: SlideData[] = [
  {
    title: 'Join the contest!',
    description: 'Tap "Join" on any contest you like and jump into the action!',
    SvgComponent: FirstHowItWorks,
  },
  {
    title: 'Answer ANY 9 Questions',
    description: 'Out of the 30 questions, answer any 9 with YES or NO options',
    SvgComponent: SecondHowItWorks,
  },
  {
    title: 'Play and Contribute',
    description: 'Upload relevant videos and questions and stand a chance to get a rank boost in the leaderboard i.e more rewards',
    SvgComponent: ThirdHowItWorks,
  },
  {
    title: 'Leaderboard',
    description: 'Winners share the prize pool. Earn, repeat, and keep playing!, To understand more about the our rankin mechanism, click on the check details button',
    SvgComponent: leaderboard,
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

  const handleNextSlide = () => {
    if (currentSlideIndex < howItWorksSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handleClose = () => {
    setCurrentSlideIndex(0); // Reset to first slide when closing
    onClose();
  };

  const openLearnMoreLink = () => {
    Linking.openURL('https://9shoot.fun/how-it-works');
  };

  const currentSlide = howItWorksSlides[currentSlideIndex];
  const Svg = currentSlide.SvgComponent;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>How it works</Text>

          <View style={styles.slide}>
            <Svg width={220} height={220} style={styles.svgImage} />
            <Text style={styles.slideTitle}>{currentSlide.title}</Text>
            <Text style={styles.slideDescription}>{currentSlide.description}</Text>
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
              <TouchableOpacity style={styles.learnMoreButton} onPress={openLearnMoreLink}>
                <Text style={styles.learnMoreButtonText}>Check Details</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextSlide}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
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
    width: width * 0.8, // Slightly less than screen width
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
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    paddingHorizontal: 10,
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
