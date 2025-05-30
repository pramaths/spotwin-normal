import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import HeaderProfile from '../../components/HeaderProfile';
import { UserContestCard } from '../../components/UserContest';
import { IContest } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useContestsStore } from '../../store/contestsStore';
import apiClient from '../../utils/api';
import { CONTESTS, USER_CONTESTS } from '../../routes/api';
import { useUserStore } from '../../store/userStore';

type TabOption = 'ACTIVE' | 'COMPLETED';

export default function ContestsScreen() {
  const [selectedTab, setSelectedTab] = useState<TabOption>('ACTIVE');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userContests, setContests, setUserContests } = useContestsStore();
  const { user } = useUserStore();
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

  useEffect(() => {
    fetchContests();
  }, [user?.id]);

  const handleTabPress = (tab: TabOption) => {
    setSelectedTab(tab);
  }

  const getContests = (): IContest[] => {
    if (!userContests || userContests.length === 0) return [];
  
    let filteredContests: IContest[] = [];
  
    if (selectedTab === 'ACTIVE') {
      filteredContests = userContests.filter(
        (contest) => contest && (contest.status === 'OPEN')
      );
    } else {
      filteredContests = userContests
        .filter((contest) => contest && contest.status === 'COMPLETED')
        .sort((a, b) => {
          const timeA = new Date(a.match?.startTime || '').getTime();
          const timeB = new Date(b.match?.startTime || '').getTime();
          return timeB - timeA; 
        });
    }
  
    return filteredContests;
  };
  

  const fetchContests = async () => {
    try {
      const response = await apiClient<IContest[]>(CONTESTS, 'GET');
      const userContestsResponse = await apiClient<IContest[]>(USER_CONTESTS, 'GET');

      if (response.success && response.data && userContestsResponse.success) {
        let availableContests = response.data.filter((contest: IContest) => !userContestsResponse.data?.some((userContest: IContest) => userContest.id === contest.id));
        setContests(availableContests);
        setUserContests(userContestsResponse.data || []);
      } else {
        console.error("Failed to fetch contests:", response.message);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    fetchContests();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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

        {(!userContests || userContests.length === 0) ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No contests available</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={getContests()}
            renderItem={({ item }) => (
              <UserContestCard
                contest={item}
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
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  {selectedTab === 'ACTIVE' ? 'No active contests' : 'No completed contests'}
                </Text>
              </View>
            }
          />
        )}
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#0504dc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  refreshButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFF',
  },
});