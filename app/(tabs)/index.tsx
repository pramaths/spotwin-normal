import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  StatusBar,
  FlatList,
  Dimensions,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import HeaderProfile from '../../components/HeaderProfile';
import { ContestCard } from '../../components/ContestCard';
import PaymentModal from '../../components/PaymentModal';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDateTime } from '../../utils/dateUtils';
import { IContest, IUser } from '../../types';
import { useContestsStore } from '../../store/contestsStore';
import apiClient from '../../utils/api';
import { useUserStore } from '../../store/userStore';
import { USER, USER_CONTESTS, CONTESTS } from '../../routes/api';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuthStore } from '../../store/authstore';

const sportsCategories = [
  { id: '1', name: 'Cricket', icon: '🏏' },
  { id: '2', name: 'Football', icon: '⚽' },
  { id: '3', name: 'Basketball', icon: '🏀' },
];

export default function HomeScreen() {
  const [activeSport, setActiveSport] = useState(sportsCategories[0].id);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedContest, setSelectedContest] = useState<IContest | null>(null);
  const [filteredContests, setFilteredContests] = useState<IContest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { contests, setContests, setUserContests } = useContestsStore();
  const router = useRouter();
  const featuredListRef = useRef<FlatList>(null);
  const { user } = useUserStore();
  const setUser = useUserStore((state) => state.setUser);
  const {isAuthenticated} = useAuthStore();

  useEffect(() => {
    if(!isAuthenticated) {
      router.replace('/(auth)/signup');
    }
  }, [isAuthenticated]);
  const { notification, expoPushToken, error } = useNotification();

  if (error) {
    console.log("Error:", error);
  }
  console.log("Notification:", JSON.stringify(notification, null, 2));
  console.log("Expo Push Token:", expoPushToken);

  useEffect(() => {
    fetchContests();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const response = await apiClient<IUser>(USER(user?.id || ''), 'GET');
    if (response.success && response.data) {
      setUser(response.data);
    }
  };

  const fetchContests = async () => {
    try {
      const response = await apiClient<IContest[]>(CONTESTS, 'GET');
      if (user?.id) {
        const userContestsResponse = await apiClient<IContest[]>(USER_CONTESTS(user.id), 'GET');

        if (response.success && response.data && userContestsResponse.success) {
          setContests(response.data);
          setUserContests(userContestsResponse.data || []);
        }
      } else {
        if (response.success && response.data) {
          setContests(response.data);
          setUserContests([]);
        } else {
          console.error("Failed to fetch contests:", response.message);
        }
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContests();
    setRefreshing(false);
  };

  useEffect(() => {
    filterContestsBySport(activeSport);
  }, [activeSport, contests]);

  const filterContestsBySport = (sportId: string) => {
    const sportName = sportsCategories.find(sport => sport.id === sportId)?.name;
    if (!sportName || contests.length === 0) {
      setFilteredContests([]);
      return;
    }

    const filtered = contests.filter(contest => {
      console.log("contest.match?.event?.sport?.name", contest.match?.event?.sport?.name);
      console.log("sportName", sportName);
      return contest.match?.event?.sport?.name.toLowerCase() === sportName.toLowerCase()
    });
    console.log("filtered", filtered);

    setFilteredContests(filtered.length > 0 ? filtered : []);
  };

  const handleJoinPress = (contest: IContest) => {
    setSelectedContest(contest);
    setPaymentModalVisible(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalVisible(false);
  };

  const renderFeaturedCard = ({ item, index }: { item: IContest, index: number }) => {
    const { formattedTime } = formatDateTime(item.match?.startTime || '');
    const userContests = useContestsStore.getState().userContests;
    const isParticipating = userContests.some(contest => contest.id === item.id);

    return (
      <View style={styles.featuredCardWrapper}>
        <View style={[styles.stackedCard, styles.secondStackedCard]} />

        <LinearGradient
          colors={['#0504dc', '#0504dc', '#37348b']}
          style={styles.featuredCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.leagueText}>{item.match?.title}</Text>
            <TouchableOpacity
              style={styles.slideArrowContainer}
              onPress={() => {
                const nextIndex = (index + 1) % contests.slice(0, 3).length;
                featuredListRef.current?.scrollToIndex({
                  index: nextIndex,
                  animated: true
                });
              }}
            >
              <ChevronRight color="#FFF" size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.teamsContainer}>
            <View style={styles.teamContainer}>
              <Image
                source={{ uri: item.match?.teamA.imageUrl }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
              <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">
                {item.match?.teamA.name}
              </Text>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formattedTime}</Text>
              </View>
            </View>

            <View style={styles.teamContainer}>
              <Image
                source={{ uri: item.match?.teamB.imageUrl }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
              <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">
                {item.match?.teamB.name}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>Joining Fee</Text>
              <Text style={styles.footerValue}>
                {item.entryFee} {item.currency}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>Prize pool</Text>
              <Text style={styles.footerValue}>
                TBD
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.joinButton,
              isParticipating && styles.participatingButton
            ]}
            onPress={() => handleJoinPress(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>
              {isParticipating ? 'Already Participating' : 'Join'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  const handleSportChange = (sportId: string) => {
    setActiveSport(sportId);
  };

  const handleContestPress = (contest: IContest) => {
    setSelectedContest(contest);
    setPaymentModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        <HeaderProfile />

        <View style={styles.featuredSection}>
          <FlatList
            ref={featuredListRef}
            data={contests.slice(0, 3)}
            renderItem={renderFeaturedCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            pagingEnabled
            snapToInterval={width * 0.9 + width * 0.05 * 2} 
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

        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Events</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {sportsCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  activeSport === category.id && styles.activeCategoryButton,
                ]}
                onPress={() => handleSportChange(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    activeSport === category.id && styles.activeCategoryName,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.contestCardContainer}>
          {filteredContests.length > 0 ? filteredContests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              onPress={handleContestPress}
              userContests={useContestsStore.getState().userContests}
            />
          )) : <Text style={styles.noContestsText}>No contests available</Text>}
        </View>

        {paymentModalVisible && selectedContest && (
          <PaymentModal
            isVisible={paymentModalVisible}
            onClose={() => setPaymentModalVisible(false)}
            onConfirm={handleClosePaymentModal}
            contest={selectedContest}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  featuredSection: {
    marginTop: 8,
    marginBottom: 8,
    height: 240,
  },
  featuredCardWrapper: {
    width: width * 0.9,
    marginHorizontal: width * 0.05,
    height: 220,
    position: 'relative',
  },
  stackedCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#0504dc',
  },
  secondStackedCard: {
    bottom: -5,
    right: -5,
    opacity: 0.6,
  },
  featuredCard: {
    borderRadius: 20,
    padding: 16,
    height: '100%',
    zIndex: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leagueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  slideArrowContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,

  },
  teamContainer: {
    alignItems: 'center',
    width: '40%',
  },
  vsContainer: {
    alignItems: 'center',
    width: '30%',
  },
  vsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  teamLogo: {
    width: 36,
    height: 36,
    marginBottom: 6,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  timeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 10,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  joinButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participatingButton: {
    backgroundColor: '#10B981', // Darker green for "Already Participating"
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  eventsSection: {
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  activeCategoryButton: {
    backgroundColor: '#0504dc',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  activeCategoryName: {
    color: '#FFF',
  },
  // All contests
  contestCardContainer: {
    paddingHorizontal: 16,
    marginBottom: 100, // Increased bottom margin to ensure content doesn't get hidden behind tab bar
    marginTop: 8,
  },
  noContestsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
  },
});
