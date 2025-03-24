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
    [IDifficultyLevel.EASY]: '#4CAF50',  
    [IDifficultyLevel.MEDIUM]: '#FF9800',   
    [IDifficultyLevel.HARD]: '#F44336'    
  };

  const difficultyColor = difficultyColors[question.difficultyLevel];

  return (
    <View style={styles.itemContainer}>
      <View style={[styles.questionCard, { borderColor: difficultyColor }]}>
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
          <Text style={styles.difficultyText}>{question.difficultyLevel}</Text>
        </View>

        <Text style={styles.questionText} numberOfLines={3} ellipsizeMode="tail">
          {question.question}
        </Text>

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
    paddingVertical: 8,
    marginBottom: 12
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative'
  },
  difficultyBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12
  },
  difficultyText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 10
  },
  questionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 20,
    paddingRight: 8
  },
  predictionContainer: {
    alignItems: 'center',
    marginTop: 16
  },
  predictionBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12
  },
  yesBadge: {
    backgroundColor: '#4CAF50'
  },
  noBadge: {
    backgroundColor: '#F44336'
  },
  predictionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  changeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#3768E3',
    borderRadius: 8
  },
  changeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 12,
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
    fontSize: 14,
    fontWeight: 'bold'
  }
});
