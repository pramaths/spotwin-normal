import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PredictionQuestionGrid from '../../components/PredictionQuestionGrid';
import HeaderProfile from '@/components/HeaderProfile';
import { IContest, IQuestion, IOutcome, IDifficultyLevel } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { ContestCardSkeleton } from '@/components/SkeletonLoading';
import { CONTESTS } from '@/routes/api';
import apiClient from '@/utils/api';
import { useContestsStore } from '@/store/contestsStore';

interface PredictionQuestion {
  id: string;
  question: string;
  difficultyLevel: IDifficultyLevel;
  contestId: string;
}

const FeedsScreen = () => {
  const [selectedContest, setSelectedContest] = useState<IContest | null>(null);
  const [contests, setContests] = useState<IContest[]>([]);
  const [contestQuestions, setContestQuestions] = useState<IQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContestsLoading, setIsContestsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

  const processContestsWithQuestions = (contestsData: IContest[]) => {
    return contestsData.map(contest => {
      const processedContest = { ...contest };
      
      const questions = Array.isArray(contest.questions)   
        ? [...contest.questions] 
        : [];
      
      while (questions.length < 3) {
        questions.push({
          id: `placeholder-${contest.id}-${questions.length}`,
          contestId: contest.id,
          question: 'Want to see more questions? Join the contest now!',
          outcome: IOutcome.YES,
          difficultyLevel: IDifficultyLevel.EASY,
        });
      }
      questions.push({
        id: `placeholder-${contest.id}-${questions.length}`,
        contestId: contest.id,
        question: 'Want to see more questions? Join the contest now!',
        outcome: IOutcome.YES,
        difficultyLevel: IDifficultyLevel.EASY,
      }) 
      processedContest.questions = questions;
      
      return processedContest;
    });
  };

  const fetchActiveContests = async () => {
    try {
      setIsContestsLoading(true);
      const response = await apiClient<IContest[]>(CONTESTS, 'GET');
      
      if (response.success && response.data) {
        console.log("response.data", response.data.map(contest => contest.questions));
        const processedContests = processContestsWithQuestions(response.data);
        setContests(processedContests);
        setSelectedContest(processedContests[0]);
      }
    } catch (error) {
      console.error('Error fetching active contests:', error);
    } finally {
      setIsContestsLoading(false);
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveContests();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchActiveContests();
  }, []);

  useEffect(() => {
    if (selectedContest) {
      setContestQuestions(selectedContest.questions || []);
    }
  }, [selectedContest]);

  const handleContestSelect = (contest: IContest) => {
    setSelectedContest(contest);
  };

  const renderContestItem = ({ item }: { item: IContest }) => {
    const { formattedTime, formattedDate } = formatDateTime(item.match?.startTime || '');
    return (
      <TouchableOpacity 
        style={[
          styles.contestItem,
          selectedContest?.id === item.id && styles.selectedContestItem
        ]} 
        onPress={() => handleContestSelect(item)}
      >
        <View style={styles.teamsContainer}>
          <View style={styles.teamSection}>
            <Image 
              source={{uri: item.match?.teamA?.imageUrl}} 
              style={styles.teamLogo} 
              resizeMode="contain"
            />
            <Text style={styles.teamName} numberOfLines={1}>{item.match?.teamA?.name || ''}</Text>
          </View>
          
          <Text style={styles.vsText}>VS</Text>
          
          <View style={styles.teamSection}>
            <Image 
              source={{uri: item.match?.teamB?.imageUrl}} 
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <Text style={styles.teamName} numberOfLines={1}>{item.match?.teamB?.name || ''}</Text>
          </View>
        </View>

        <View style={styles.contestInfo}>
          <View style={styles.contestTimeContainer}>
            <Text style={styles.contestName}>{item.match?.event?.title}</Text>
            <Text style={styles.contestTime}>{formattedTime} • {formattedDate}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.contestTime}>{item.entryFee} points</Text>
            <Text style={styles.entryFeeText}>Entry Fee</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContestSkeletons = () => {
    return (
      <FlatList
        data={[1, 2, 3]} 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contestList}
        style={{flexGrow: 0}}
        renderItem={() => <ContestCardSkeleton />}
        keyExtractor={(item) => `skeleton-${item}`}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderProfile />
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {isContestsLoading ? (
            renderContestSkeletons()
          ) : (
            <FlatList
              data={contests}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contestList}
              style={{flexGrow: 0}}
              renderItem={renderContestItem}
              keyExtractor={(item) => item.id}
            />
          )}
          <ScrollView 
            style={styles.predictionScrollView}
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
            <PredictionQuestionGrid
              questions={contestQuestions}
              selectedContest={selectedContest}
              isLoading={isLoading}
            />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  predictionScrollView: {
    flex: 1,
  },
  contestList: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  contestItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedContestItem: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamSection: {
    alignItems: 'center',
    width: 100,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  contestInfo: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contestTimeContainer: {
    flex: 1,
  },
  contestName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contestTime: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  entryFeeText: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default FeedsScreen;