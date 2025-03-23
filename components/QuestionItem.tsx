import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IQuestion, IOutcome, IDifficultyLevel } from '@/types';

export interface QuestionItemProps {
  question: IQuestion;
  userVote: IOutcome | null;
  onPrediction: (prediction: IOutcome) => void;
  onRemovePrediction: () => void;
}

export default function QuestionItem({
  question,
  userVote,
  onPrediction,
  onRemovePrediction
}: QuestionItemProps) {
  const difficultyColors = {
    [IDifficultyLevel.EASY]: '#4CAF50',   // Green for easy
    [IDifficultyLevel.MEDIUM]: '#FF9800', // Orange for medium
    [IDifficultyLevel.HARD]: '#F44336'    // Red for hard
  };

  const difficultyColor = difficultyColors[question.difficultyLevel];

  return (
    <View style={styles.itemContainer}>
      <View style={[styles.questionCard, { borderColor: difficultyColor }]}>
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
          <Text style={styles.difficultyText}>{question.difficultyLevel}</Text>
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        {userVote ? (
          <View style={styles.predictionContainer}>
            <View style={[
              styles.predictionBadge,
              userVote === IOutcome.YES ? styles.yesBadge : styles.noBadge
            ]}>
              <Text style={styles.predictionText}>
                You predicted: {userVote}
              </Text>
            </View>

            <TouchableOpacity style={styles.changeButton} onPress={onRemovePrediction}>
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.yesButton]}
              onPress={() => onPrediction(IOutcome.YES)}
            >
              <Text style={styles.buttonText}>YES</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.noButton]}
              onPress={() => onPrediction(IOutcome.NO)}
            >
              <Text style={styles.buttonText}>NO</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20
  },
  questionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative'
  },
  difficultyBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16
  },
  difficultyText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12
  },
  questionText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center'
  },
  predictionContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  predictionBadge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16
  },
  yesBadge: {
    backgroundColor: '#4CAF50'
  },
  noBadge: {
    backgroundColor: '#F44336'
  },
  predictionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  changeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2196F3',
    borderRadius: 10
  },
  changeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  yesButton: {
    backgroundColor: '#4CAF50'
  },
  noButton: {
    backgroundColor: '#F44336'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
