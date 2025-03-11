import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
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

export type ContestStatus = 'LIVE' | 'OPEN' | 'COMPLETED' | 'UPCOMING';

type TabOption = 'ACTIVE' | 'COMPLETED';

export default function ContestsScreen() {
  const [selectedTab, setSelectedTab] = useState<TabOption>('ACTIVE');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userContests, setContests, setUserContests } = useContestsStore();
  const { user } = useUserStore();
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

  const handleTabPress = (tab: TabOption) => {
    setSelectedTab(tab);
  }

  const getContests = () => {
    return selectedTab === 'ACTIVE'
      ? userContests.filter((data: IContest) =>
        data && (data.status === 'LIVE' || data.status === 'OPEN'))
      : userContests.filter((contest: IContest) =>
        contest && contest.status === 'COMPLETED');
  }

  const fetchContests = async () => {
    try {
      const response = await apiClient<IContest[]>(CONTESTS, 'GET');
      const userContestsResponse = await apiClient<IContest[]>(USER_CONTESTS(user?.id || ''), 'GET');


      if (response.success && response.data && userContestsResponse.success) {
        console.log("Fetched contests:", response.data.map((contest: IContest) => contest.id));
        console.log("User contests:", userContestsResponse?.data?.map((contest: IContest) => contest.id));
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