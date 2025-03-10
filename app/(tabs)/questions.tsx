import { View, StyleSheet, ScrollView, Text, Platform } from 'react-native';
import MyQuestionCard from '../../components/MyQuestionCard';
import { Shield } from 'lucide-react-native';
import HeaderProfile from '@/components/HeaderProfile';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function QuestionScreen() {
  const insets = useSafeAreaInsets();
  
  // Calculate the tab bar height to add appropriate padding
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

  const questions = [
    {
      id: '1',
      question: 'Will Real Madrid score in the first half?',
      matchImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png',
      league: 'UCL',
      leagueImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png',
      teams: 'Real Madrid vs Atletico Madrid',
      timeRemaining: '45:00',
      status: 'approved' as const,
      answer: null,
      contestId: '',
    },
    {
      id: '2',
      question: 'Will there be a red card in the match?',
      matchImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/europa.png',
      league: 'Europa League',
      leagueImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/europa.png',
      teams: 'Manchester United vs AS Roma',
      timeRemaining: '30:15',
      status: 'pending' as const,
      answer: null,
      contestId: '',
    },
    {
      id: '3',
      question: 'Will Atletico Madrid win the match?',
      matchImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png',
      league: 'UCL',
      leagueImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png',
      teams: 'Real Madrid vs Atletico Madrid',
      timeRemaining: '15:30',
      status: 'approved' as const,
      answer: null,
      contestId: '',
    },
    {
      id: '4',
      question: 'Will there be more than 2 goals in the match?',
      matchImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/europa.png',
      league: 'Europa League',
      leagueImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/europa.png',
      teams: 'Arsenal vs Bayer Leverkusen',
      timeRemaining: '60:00',
      status: 'pending' as const,
      answer: null,
      contestId: '',
    },
    {
      id: '5',
      question: 'Will there be a penalty in the match?',
      matchImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png',
      league: 'UCL',
      leagueImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png',
      teams: 'Barcelona vs Bayern Munich',
      timeRemaining: '25:45',
      status: 'rejected' as const,
      answer: null,
      contestId: '',
    },
    {
      id: '6',
      question: 'Will the match end in a draw?',
      matchImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/europa.png',
      league: 'Europa League',
      leagueImage: 'https://9shootnew.s3.us-east-1.amazonaws.com/europa.png',
      teams: 'Sevilla vs Benfica',
      timeRemaining: '10:00',
      status: 'approved' as const,
      answer: null,
      contestId: '',
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderProfile />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 16
        }}
        showsVerticalScrollIndicator={false}
      >
        {questions.map((question) => (
          <MyQuestionCard 
            key={question.id}
            question={question.question}
            matchImage={question.matchImage}
            league={question.league}
            leagueImage={question.leagueImage}
            teams={question.teams}
            timeRemaining={question.timeRemaining}
            status={question.status}
            answer={question.answer}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 16,
  },
});