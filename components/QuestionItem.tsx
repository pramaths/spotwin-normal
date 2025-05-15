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
  isLocked?: boolean;
  onUnlock?: () => void;
  stakeAmount?: string;
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
  isLocked = false,
  onUnlock,
  stakeAmount,
}: Props) {
  const difficultyColor = difficultyColors[question.difficultyLevel];

  const handlePrediction = (outcome: IOutcome) => {
    if (userVote === outcome) {
      onRemovePrediction();
    } else {
      onPrediction(outcome);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, isLocked && styles.lockedCard]}
      onPress={isLocked ? onUnlock : undefined}
      activeOpacity={isLocked ? 0.7 : 1}
      disabled={!isLocked}
    >
      <LinearGradient
        colors={[difficultyColor, `${difficultyColor}BB`]}
        style={styles.badge}
      >
        <Text style={styles.badgeText}>{question.difficultyLevel}</Text>
      </LinearGradient>

      <Text style={styles.questionText}>{question.question}</Text>

      {isLocked ? (
        <View style={styles.specialQuestionFooter}>
          <View style={styles.lockInfoContainer}>
            <Ionicons name="lock-closed" size={20} color="#FFD700" />
            <Text style={styles.stakeToUnlockText}>Stake to Unlock</Text>
          </View>
          {stakeAmount && <Text style={styles.stakeAmount}>{stakeAmount}</Text>}
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          {[IOutcome.YES, IOutcome.NO].map((outcome) => (
            <TouchableOpacity
              key={outcome}
              onPress={() => handlePrediction(outcome)}
              style={[
                styles.option,
                outcome === IOutcome.YES ? styles.yesOption : styles.noOption,
                userVote === outcome ? styles.selectedOption : userVote !== null ? styles.unselectedOption : null,
              ]}
            >
              <Text style={styles.optionText}>{outcome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
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
    marginVertical: 6,
    marginHorizontal: 12,
    position: 'relative',
  },
  lockedCard: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
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
    fontSize: 8,
  },
  questionText: {
    fontSize: 18,
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
    paddingVertical: 6,
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
    borderColor: '#337eef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  unselectedOption: {
    opacity: 0.6,
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  specialQuestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  lockInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stakeToUnlockText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  stakeAmount: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
