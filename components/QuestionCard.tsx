import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, answer: 'YES' | 'NO') => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: question.imageUrl }} style={styles.image} />
      <View style={styles.overlay}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Ends in {question.endsAt}</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.yesButton]} 
              onPress={() => onAnswer(question.id, 'YES')}
            >
              <Text style={styles.buttonText}>YES</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.noButton]} 
              onPress={() => onAnswer(question.id, 'NO')}
            >
              <Text style={styles.buttonText}>NO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  timerContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    alignSelf: 'flex-end',
    borderRadius: 4,
    margin: 8,
  },
  timerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 12,
  },
  questionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#10B981',
  },
  noButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});