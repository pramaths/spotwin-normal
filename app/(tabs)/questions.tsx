import { View, StyleSheet, ScrollView, Text, Platform, RefreshControl } from 'react-native';
import MyQuestionCard from '../../components/MyQuestionCard';
import HeaderProfile from '@/components/HeaderProfile';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import apiClient from '@/utils/api';
import { QUESTIONS } from '@/routes/api';
import { useUserStore } from '@/store/userStore'; 

interface Question {
  id: string;
  contestId: string;
  question: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  teams: string;
  eventImage: string;
  eventName: string;
  contestName: string;
  username: string;
  userId: string;
}

export default function QuestionScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const { user } = useUserStore(); 
  
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

  const fetchQuestions = async () => {
    try {
      if (!user?.id) return;
      const response = await apiClient<Question[]>(QUESTIONS(user.id), 'GET');
      if (response.success && response.data) {
        setQuestions(response.data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuestions();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderProfile />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 16
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        {questions.length > 0 ? (
          questions.map((question) => (
            <MyQuestionCard 
              key={question.id}
              question={question.question}
              matchImage={question.eventImage}
              league={question.eventName}
              leagueImage={question.eventImage}
              teams={question.teams}
              timeRemaining="--:--" 
              status={question.status.toLowerCase() as 'pending' | 'approved' | 'rejected'}
              answer={null}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No questions found</Text>
          </View>
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});