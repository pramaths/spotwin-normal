import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import PredictionQuestion from './PredictionQuestion';
import { IContestWithVideos } from '@/types';
import { PredictionGridSkeleton } from './SkeletonLoading';
import { useContestsStore } from '@/store/contestsStore';

interface Question {
  id: string;
  question: string;
  matchImage?: string;
  thumbnailUrl?: string;
  timeRemaining?: string;
}

interface PredictionQuestionGridProps {
  questions: Question[];
  selectedContest: IContestWithVideos | null;
  isLoading?: boolean;
}

const PredictionQuestionGrid = ({ 
  questions, 
  selectedContest,
  isLoading = false
}: PredictionQuestionGridProps) => {
  console.log("selectedContest", selectedContest);
  const { userContests } = useContestsStore();
  
  const isUserParticipatingInContest = (contestId: string): boolean => {
    return userContests.some(contest => contest.id === contestId);
  };
  
  if (isLoading) {
    return <PredictionGridSkeleton />;
  }
  
  const contestVideos = selectedContest?.featuredVideos || [];
  
  const questionPairs = [];
  for (let i = 0; i < contestVideos.length; i += 2) {
    const pair = contestVideos.slice(i, i + 2);
    questionPairs.push(pair);
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {questionPairs.map((pair, index) => (
          <View key={index} style={styles.row}>
            {pair.map((video) => (
              <View key={video.id} style={styles.questionWrapper}>
                <PredictionQuestion
                  id={video.id}
                  question={video.question || ""}
                  matchImage={video.thumbnailUrl || "https://9shootnew.s3.us-east-1.amazonaws.com/blur_img.png"}
                  timeRemaining={"0:00"}
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