import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import HeaderProfile from '../../components/HeaderProfile';
import { UserContestCard } from '../../components/UserContest';
import { IContest} from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export type ContestStatus = 'LIVE' | 'OPEN' | 'COMPLETED' | 'UPCOMING';

const activeContests: IContest[] = [
  {
    id: 'f984ea94-a07e-4bff-a802-1694f51256045',
    name: 'Europa League',
    entryFee: 0.2,
    currency: 'SOL',
    description: 'A contest where two teams compete in basketball',
    status: 'OPEN',
    createdAt: '2025-03-05T10:32:19.895Z',
    updatedAt: '2025-03-05T10:32:19.895Z',
    event: {
      id: '077e38f3-6275-4c68-920f-3a7de8ba9bbf',
      title: 'Europa League',
      description: 'ICC MENS TROPHY',
      eventImageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png ',
      startDate: '2025-03-05T08:58:46.130Z',
      endDate: '2025-03-05T08:58:46.130Z',
      status: 'OPEN',
      createdAt: '2025-03-05T09:04:41.701Z',
      updatedAt: '2025-03-05T09:27:20.389Z',
      sport: {
        id: '3dc44aff-9748-44fc-aa74-1379213a4363',
        name: 'Cricket',
        description: 'A team sport played with a ball',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/manutd.png',
        isActive: true,
        createdAt: '2025-03-02T18:07:04.227Z',
        updatedAt: '2025-03-02T18:07:04.227Z',
      },
      teamA: {
        id: '4ec72fe7-263b-42e5-af1f-b0c26fed97a7',
        name: 'Manchester United',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/manutd.png',
        country: 'Manchester United',
      },
      teamB: {
        id: '59217b82-77ae-4340-ba13-483bea11a7d6',
        name: 'Real Sociedad',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/realsociedad.png',
        country: 'Real Sociedad',
      },
    },
  },
  {
    id: 'f984ea94-a07e-4bff-a802-1694f51256045999hhh',
    name: 'NBA',
    entryFee: 0.2,
    currency: 'SOL',
    description: 'A contest where two teams compete in basketball',
    status: 'OPEN',
    createdAt: '2025-03-05T10:32:19.895Z',
    updatedAt: '2025-03-05T10:32:19.895Z',
    event: {
      id: '077e38f3-6275-4c68-920f-3a7de8ba9bbf',
      title: 'NBA',
      description: 'ICC MENS TROPHY',
      eventImageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png ',
      startDate: '2025-03-05T08:58:46.130Z',
      endDate: '2025-03-05T08:58:46.130Z',
      status: 'OPEN',
      createdAt: '2025-03-05T09:04:41.701Z',
      updatedAt: '2025-03-05T09:27:20.389Z',
      sport: {
        id: '3dc44aff-9748-44fc-aa74-1379213a4363',
        name: 'Basketball',
        description: 'A team sport played with a ball',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/manutd.png',
        isActive: true,
        createdAt: '2025-03-02T18:07:04.227Z',
        updatedAt: '2025-03-02T18:07:04.227Z',
      },
      teamA: {
        id: '4ec72fe7-263b-42e5-af1f-b0c26fed97a7',
        name: 'Houston Rockets ',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/arsenal.png',
        country: 'Arsenal ',
      },
      teamB: {
        id: '59217b82-77ae-4340-ba13-483bea11a7d6',
        name: 'Houston Rockets',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/mavericks.png',
        country: 'Houston Rockets',
      },
    },
  },
]

const completedContests: IContest[] = [
  {
    id: 'f984ea94-a07e-4bff-a802-1694f51256045',
    name: 'Europa League',
    entryFee: 0.2,
    currency: 'SOL',
    description: 'A contest where two teams compete in basketball',
    status: 'OPEN',
    createdAt: '2025-03-05T10:32:19.895Z',
    updatedAt: '2025-03-05T10:32:19.895Z',
    event: {
      id: '077e38f3-6275-4c68-920f-3a7de8ba9bbf',
      title: 'Europa League',
      description: 'ICC MENS TROPHY',
      eventImageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/ucl.png ',
      startDate: '2025-03-05T08:58:46.130Z',
      endDate: '2025-03-05T08:58:46.130Z',
      status: 'OPEN',
      createdAt: '2025-03-05T09:04:41.701Z',
      updatedAt: '2025-03-05T09:27:20.389Z',
      sport: {
        id: '3dc44aff-9748-44fc-aa74-1379213a4363',
        name: 'Cricket',
        description: 'A team sport played with a ball',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/manutd.png',
        isActive: true,
        createdAt: '2025-03-02T18:07:04.227Z',
        updatedAt: '2025-03-02T18:07:04.227Z',
      },
      teamA: {
        id: '4ec72fe7-263b-42e5-af1f-b0c26fed97a7',
        name: 'Manchester United',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/manutd.png',
        country: 'Manchester United',
      },
      teamB: {
        id: '59217b82-77ae-4340-ba13-483bea11a7d6',
        name: 'Real Sociedad',
        imageUrl: 'https://9shootnew.s3.us-east-1.amazonaws.com/realsociedad.png',
        country: 'Real Sociedad',
      },
    },
  },
]

type TabOption = 'ACTIVE' | 'COMPLETED';

export default function ContestsScreen() {
  const [selectedTab, setSelectedTab] = useState<TabOption>('ACTIVE');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

  const handleTabPress = (tab: TabOption) => {
    setSelectedTab(tab);
  }

  const getContests = () => {
    return selectedTab === 'ACTIVE' ? activeContests : completedContests;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, you would fetch fresh data here
    // For example:
    // const freshContests = await fetchContests();
    // updateContests(freshContests);
    
    // Simulate a network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLeaderboardPress = (id: string) => {
    router.push({
      pathname: "/contest-detail/[id]",
      params: { id }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <HeaderProfile />
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, selectedTab === 'ACTIVE' && styles.activeTab]}
            onPress={() => handleTabPress('ACTIVE')}
          >
            <Text 
              style={[styles.tabText, selectedTab === 'ACTIVE' && styles.activeTabText]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, selectedTab === 'COMPLETED' && styles.activeTab]}
            onPress={() => handleTabPress('COMPLETED')}
          >
            <Text 
              style={[styles.tabText, selectedTab === 'COMPLETED' && styles.activeTabText]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={getContests()}
          renderItem={({ item }) => (
            <UserContestCard 
              contest={item} 
              onLeaderboardPress={() => handleLeaderboardPress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: tabBarHeight }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3498db']}
              tintColor="#3498db"
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#0504dc',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#FFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});