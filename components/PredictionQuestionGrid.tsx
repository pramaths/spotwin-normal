import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import PredictionQuestion from './PredictionQuestion';
import { IContest } from '@/types';
import { PredictionGridSkeleton } from './SkeletonLoading';
import { useContestsStore } from '@/store/contestsStore';

interface Question {
  id: string;
  question: string;
  difficultyLevel: string;
}

interface PredictionQuestionGridProps {
  questions: Question[];
  selectedContest: IContest | null;
  isLoading?: boolean;
}

const PredictionQuestionGrid = ({ 
  questions, 
  selectedContest,
  isLoading = false
}: PredictionQuestionGridProps) => {
  const { userContests } = useContestsStore();
  
  const isUserParticipatingInContest = (contestId: string): boolean => {
    return userContests.some(contest => contest.id === contestId);
  };
  
  if (isLoading) {
    return <PredictionGridSkeleton />;
  }
  
  const questionPairs = [];
  for (let i = 0; i < questions.length; i += 2) {
    const pair = questions.slice(i, i + 2);
    questionPairs.push(pair);
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {questionPairs.map((pair, index) => (
          <View key={index} style={styles.row}>
            {pair.map((questionItem) => (
              <View key={questionItem.id} style={styles.questionWrapper}>
                <PredictionQuestion
                  id={questionItem.id}
                  question={questionItem.question}
                  difficultyLevel={questionItem.difficultyLevel}
                  contest={selectedContest}
                  isUserParticipating={selectedContest ? isUserParticipatingInContest(selectedContest.id) : false}
                />
              </View>
            ))}
            {pair.length === 1 && <View style={styles.emptySlot} />}
          </View>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questionWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptySlot: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default PredictionQuestionGrid;