import { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import PredictionQuestion from './PredictionQuestion';
import ContestJoinModal from './ContestJoinModal';
import { IContest } from '@/types';

interface Question {
  id: string;
  question: string;
  matchImage: string;
  league: string;
  teams: string;
  timeRemaining: string;
}

interface PredictionQuestionGridProps {
  questions: Question[];
  onAnswer: (id: string, answer: 'YES' | 'NO') => void;
  contests?: IContest[]; // Optional array of contests to use for the payment modal
}

const PredictionQuestionGrid = ({ questions, onAnswer, contests = [] }: PredictionQuestionGridProps) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedContest, setSelectedContest] = useState<IContest | null>(null);

  const handleQuestionPress = (id: string) => {
    setSelectedQuestionId(id);
  };

  const getFixedQuestions = () => {
    let fixedQuestions = [...questions];
    
    while (fixedQuestions.length < 4) {
      if (fixedQuestions.length > 0) {
        const duplicateQuestion = {...fixedQuestions[0]};
        duplicateQuestion.id = `duplicate-${fixedQuestions.length}`;
        fixedQuestions.push(duplicateQuestion);
      } else {
        fixedQuestions.push({
          id: `placeholder-${fixedQuestions.length}`,
          question: "No question available",
          matchImage: "https://9shootnew.s3.us-east-1.amazonaws.com/blur_img.png",
          league: "",
          teams: "",
          timeRemaining: "0:00"
        });
      }
    }
    
    fixedQuestions = fixedQuestions.slice(0, 4);
    
    if (fixedQuestions.length === 4) {
      fixedQuestions[3] = {
        ...fixedQuestions[3],
        question: "" // Empty string to hide the question
      };
    }
    
    return fixedQuestions;
  };

  const fixedQuestions = getFixedQuestions();

  // Get the default contest to use
  const getDefaultContest = (): IContest => {
    if (contests.length > 0) {
      return contests[0];
    }
    
    return {
      id: "default-contest",
      name: "Prediction Contest",
      entryFee: 49,
      currency: "USD",
      description: "Answer prediction questions to win prizes",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      event: {
        id: "default-event",
        title: "Sports Prediction",
        description: "Sports prediction event",
        eventImageUrl: questions.length > 0 ? questions[0].matchImage : "",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3600000).toISOString(),
        status: "OPEN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sport: {
          id: "default-sport",
          name: "Mixed Sports",
          description: "Various sports predictions",
          imageUrl: "",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        teamA: {
          id: "team-a",
          name: "Team A",
          imageUrl: "",
          country: "Country A"
        },
        teamB: {
          id: "team-b",
          name: "Team B",
          imageUrl: "",
          country: "Country B"
        }
      }
    };
  };

  const defaultContest = getDefaultContest();

  const createPairs = (items: Question[]) => {
    const pairs = [];
    for (let i = 0; i < items.length; i += 2) {
      pairs.push(items.slice(i, i + 2));
    }
    return pairs;
  };

  const questionPairs = createPairs(fixedQuestions);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {questionPairs.map((pair, index) => (
          <View key={index} style={styles.row}>
            {pair.map((question) => (
              <View key={question.id} style={styles.questionWrapper}>
                <PredictionQuestion
                  id={question.id}
                  question={question.question}
                  matchImage={question.matchImage}
                  league={question.league}
                  teams={question.teams}
                  timeRemaining={question.timeRemaining}
                  onAnswer={onAnswer}
                  onQuestionPress={handleQuestionPress}
                  contest={defaultContest}
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