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
      league: 'Premier league',
      match: 'Manchester United vs Arsenal',
      question: 'Will Rashford score a header?',
      submittedTime: 'Submitted 2 days ago',
      status: 'approved' as const,
      leagueIcon: <Shield size={20} color="#3F1052" />,
    },
    {
      id: '2',
      league: 'LaLiga Contest',
      match: 'Manchester United vs Arsenal',
      question: 'Will Rashford score a header?',
      submittedTime: 'Submitted 1 day ago',
      status: 'pending' as const,
      leagueIcon: <Shield size={20} color="#2D3791" />,
    },
    {
      id: '3',
      league: 'Premier League',
      match: 'Manchester City vs Liverpool',
      question: 'Will Rashford score a header?',
      submittedTime: 'Submitted 3 days ago',
      status: 'rejected' as const,
      leagueIcon: <Shield size={20} color="#3F1052" />,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderProfile />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 16 // Add padding to the bottom to avoid tab bar overlap
        }}
        showsVerticalScrollIndicator={false}
      >
        {questions.map((question) => (
          <MyQuestionCard
            key={question.id}
            league={question.league}
            match={question.match}
            question={question.question}
            submittedTime={question.submittedTime}
            status={question.status}
            leagueIcon={question.leagueIcon}
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