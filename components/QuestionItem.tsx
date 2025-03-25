import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { IQuestion, IOutcome, IDifficultyLevel } from '@/types';

interface Props {
  question: IQuestion;
  userVote: IOutcome | null;
  onPrediction: (prediction: IOutcome) => void;
  onRemovePrediction: () => void;
  isDisabled?: boolean;
}

const difficultyColors = {
  [IDifficultyLevel.EASY]: '#6DD5FA',
  [IDifficultyLevel.MEDIUM]: '#FDC830',
  [IDifficultyLevel.HARD]: '#FF758C',
};

export default function QuestionItem({
  question,
  userVote,
  onPrediction,
  onRemovePrediction,
  isDisabled = false,
}: Props) {
  const difficultyColor = difficultyColors[question.difficultyLevel];

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[difficultyColor, `${difficultyColor}BB`]}
        style={styles.badge}
      >
        <Text style={styles.badgeText}>{question.difficultyLevel}</Text>
      </LinearGradient>

      <Text style={styles.questionText}>{question.question}</Text>

      <View style={styles.buttonContainer}>
        {[IOutcome.YES, IOutcome.NO].map((outcome) => (
          <TouchableOpacity
            key={outcome}
            onPress={() => onPrediction(outcome)}
            disabled={isDisabled && !userVote}
            style={[
              styles.option,
              userVote === outcome ? styles.selectedOption : {},
              userVote !== null && userVote !== outcome ? styles.unselectedOption : {},
              outcome === IOutcome.YES ? styles.yesOption : styles.noOption,
              isDisabled && !userVote ? styles.disabledOption : {}
            ]}
          >
            <Ionicons
              name={outcome === IOutcome.YES ? 'checkmark' : 'close'}
              size={20}
              color={userVote !== null && userVote !== outcome ? '#ffffff80' : '#fff'}
            />
            <Text style={[
              styles.optionText,
              userVote !== null && userVote !== outcome ? styles.unselectedOptionText : {}
            ]}>
              {outcome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {userVote && (
        <TouchableOpacity onPress={onRemovePrediction} style={styles.removeBtn}>
          <Text style={styles.removeText}>Change Selection</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginVertical: 8,
    marginHorizontal: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  questionText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    flex: 0.48,
  },
  yesOption: {
    backgroundColor: '#4CAF50',
  },
  noOption: {
    backgroundColor: '#F44336',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  unselectedOption: {
    opacity: 0.6,
  },
  unselectedOptionText: {
    opacity: 0.8,
  },
  disabledOption: {
    opacity: 0.4,
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  removeBtn: {
    marginTop: 10,
    alignSelf: 'center',
  },
  removeText: {
    color: '#3768E3',
    fontWeight: 'bold',
  },
});
