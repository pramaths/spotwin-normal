import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';

import FirstHowItWorks from '../assets/images/1sthowitworks.svg';
import SecondHowItWorks from '../assets/images/2ndhowitworks.svg';
import ThirdHowItWorks from '../assets/images/3rdhowitworks.svg';
import FourthHowItWorks from '../assets/images/4thhowitworks.svg';

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
    title: 'Pick Your Challenge',
    description: 'Answer a few simple questions to rank higher and win more!',
    SvgComponent: SecondHowItWorks,
  },
  {
    title: 'Play and Contribute',
    description: 'Upload videos or complete tasks if needed for extra points!',
    SvgComponent: ThirdHowItWorks,
  },
  {
    title: 'The Results Are In!',
    description: 'Winners share the prize pool. Earn, repeat, and keep playing!',
    SvgComponent: FourthHowItWorks,
  },
];

interface HowItWorksModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ visible, onClose }: HowItWorksModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const isLastSlide = currentSlideIndex === howItWorksSlides.length - 1;

  const handleNextSlide = () => {
    if (currentSlideIndex < howItWorksSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const currentSlide = howItWorksSlides[currentSlideIndex];
  const Svg = currentSlide.SvgComponent;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.container} 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          {/* Title or "How it works" header */}
          <Text style={styles.headerTitle}>How it works</Text>

          {/* Current slide */}
          <View style={styles.slide}>
            {/* Render the imported SVG */}
            <Svg width={220} height={220} style={styles.svgImage} />

            <Text style={styles.slideTitle}>{currentSlide.title}</Text>
            <Text style={styles.slideDescription}>{currentSlide.description}</Text>
          </View>

          {/* Slide indicators */}
          <View style={styles.indicatorContainer}>
            {howItWorksSlides.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.indicator, 
                  index === currentSlideIndex && styles.activeIndicator
                ]} 
              />
            ))}
          </View>

          {/* Navigation buttons */}
          {isLastSlide ? (
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Got it!</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextSlide}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
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
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '80%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
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
