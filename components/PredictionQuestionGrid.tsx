import { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import PredictionQuestion from './PredictionQuestion';
import PaymentModal from './PaymentModal';
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
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  
  // Mock contest for demo purposes - in a real app, you would match the question ID to a contest
  const mockContest: IContest = {
    id: "mock-contest-id",
    name: "Prediction Contest",
    entryFee: 0.5,
    currency: "SOL",
    description: "Answer prediction questions to win prizes",
    status: "OPEN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    event: {
      id: "mock-event-id",
      title: "Sports Prediction",
      description: "Sports prediction event",
      eventImageUrl: questions.length > 0 ? questions[0].matchImage : "",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sport: {
        id: "mock-sport-id",
        name: "Mixed Sports",
        description: "Various sports predictions",
        imageUrl: "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      teamA: {
        id: "team-a-id",
        name: "Team A",
        imageUrl: "",
        country: "Country A"
      },
      teamB: {
        id: "team-b-id",
        name: "Team B",
        imageUrl: "",
        country: "Country B"
      }
    }
  };

  const handleQuestionPress = (id: string) => {
    setSelectedQuestionId(id);
    setPaymentModalVisible(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalVisible(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No prediction questions available</Text>
      </View>
    );
  }

  // Create pairs of questions for the grid layout
  const createPairs = (items: Question[]) => {
    const pairs = [];
    for (let i = 0; i < items.length; i += 2) {
      pairs.push(items.slice(i, i + 2));
    }
    return pairs;
  };

  const questionPairs = createPairs(questions);

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
                />
              </View>
            ))}
            {pair.length === 1 && <View style={styles.emptySlot} />}
          </View>
        ))}
      </ScrollView>

      {paymentModalVisible && (
        <PaymentModal
          isVisible={paymentModalVisible}
          onClose={handleClosePaymentModal}
          contest={mockContest}
        />
      )}
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