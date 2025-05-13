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
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDateTime } from '../../utils/dateUtils';
import { IContest, IUser } from '../../types';
import { useContestsStore } from '../../store/contestsStore';
import apiClient from '../../utils/api';
import { useUserStore } from '../../store/userStore';
import { AUTH_ME, USER_CONTESTS, CONTESTS } from '../../routes/api';
import { useAuthStore } from '../../store/authstore';
import { ContestCardSkeleton, SkeletonItem } from '../../components/SkeletonLoading';
import React from 'react';
import * as Updates from 'expo-updates';
import { usePrivy } from "@privy-io/expo";

const sportsCategories = [
  { id: '1', name: 'Football', icon: '⚽' },
  { id: '2', name: 'Cricket', icon: '🏏' },
  { id: '3', name: 'Basketball', icon: '🏀' },
];

export default function HomeScreen() {
  const [activeSport, setActiveSport] = useState(sportsCategories[0].id);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedContest, setSelectedContest] = useState<IContest | null>(null);
  const [filteredContests, setFilteredContests] = useState<IContest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { contests, setContests, setUserContests } = useContestsStore();
  const router = useRouter();
  const featuredListRef = useRef<FlatList>(null);
  const { user } = useUserStore();
  const setUser = useUserStore((state) => state.setUser);
  const {isAuthenticated} = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const dataFetchedRef = useRef(false);
  const { isReady, user: privyUser } = usePrivy();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if(isMounted && !isAuthenticated) {
      setTimeout(() => {
        router.replace('/(auth)/signup');
      }, 0);
    }
  }, [isAuthenticated, isMounted, router]);

  useEffect(() => {
    if (isMounted && isReady) {
      fetchUser();
      fetchContests();
      checkForUpdates();
    }
  }, [isMounted, isReady]);

  useFocusEffect(
    React.useCallback(() => {
      if (isMounted) {
        fetchUser();
        
        if (contests.length === 0 || !dataFetchedRef.current) {
          setTimeout(() => {
            fetchContests();
          }, 100);
        } else {
          console.log("Contests already loaded, skipping fetch on focus");
        }
      }
      return () => {
        if (contests.length === 0) {
          dataFetchedRef.current = false;
        }
      };
    }, [isMounted, user?.id, contests.length])
  );

  async function checkForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.log('Error checking for updates:', error);
    }
  }
  const fetchUser = async () => {
    try {
      const response = await apiClient<IUser>(AUTH_ME, 'GET');
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchContests = async () => {
    if (dataFetchedRef.current && !refreshing) {
      console.log("Data already fetched, skipping redundant fetch");
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiClient<IContest[]>(CONTESTS, 'GET');
      
      if (response.success && response.data) {
        const sortedContests = response.data.sort((a, b) => {
          const dateA = new Date(a.match?.startTime || '');
          const dateB = new Date(b.match?.startTime || '');
          return dateA.getTime() - dateB.getTime();
        });
        
        setContests(sortedContests);
        
        if (user?.id) {
          try {
            const userContestsResponse = await apiClient<IContest[]>(USER_CONTESTS(user.id), 'GET');
            
            if (userContestsResponse.success) {
              if (userContestsResponse.data && userContestsResponse.data.length > 0) {
                setUserContests(userContestsResponse.data);
              } else {
                setUserContests([]);
              }
            }
          } catch (error) {
            console.error("Error fetching user contests:", error);
          }
        } else {
          setUserContests([]);
        }
        dataFetchedRef.current = true;
      } else {
        console.error("Failed to fetch contests:", response.message);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    dataFetchedRef.current = false;
    await fetchUser();
    await fetchContests();
    setRefreshing(false);
  };

  useEffect(() => {
    filterContestsBySport(activeSport);
  }, [activeSport, contests]);

  const filterContestsBySport = (sportId: string) => {
    const sportName = sportsCategories.find(sport => sport.id === sportId)?.name;
    if (!sportName || contests.length === 0) {
      if (filteredContests.length > 0) {
        setFilteredContests([]);
      }
      return;
    }

    const filtered = contests.filter(contest => {
      return contest.match?.event?.sport?.name.toLowerCase() === sportName.toLowerCase()
    });

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
    if (!item || !item.match) {
      return renderFeaturedSkeleton();
    }
    
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
                {Number(item.entryFee).toFixed(0)} Points
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>Prize</Text>
              <Text style={styles.footerValue}>
                4000 Points
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
              {isParticipating ? 'Already Participating' : 'Join for FREE'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  const renderFeaturedSkeleton = () => {
    return (
      <View style={styles.featuredCardWrapper}>
        <View style={[
          styles.stackedCard, 
          styles.secondStackedCard, 
          { 
            backgroundColor: '#9797e8',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              },
              android: {
                elevation: 6,
              },
              web: {
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
              },
            })
          }
        ]} />
        <View style={[
          styles.featuredCard, 
          { 
            backgroundColor: '#e0e0ff',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
              },
              android: {
                elevation: 5,
              },
              web: {
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.25)',
              },
            })
          }
        ]}>
          <View style={styles.cardHeader}>
            <SkeletonItem width={'60%'} height={18} style={{ marginBottom: 5 }} />
            <SkeletonItem width={30} height={30} borderRadius={15} />
          </View>
          
          <View style={styles.teamsContainer}>
            <View style={styles.teamContainer}>
              <SkeletonItem width={36} height={36} borderRadius={18} style={{ marginBottom: 6 }} />
              <SkeletonItem width={'80%'} height={14} />
            </View>
            
            <View style={styles.vsContainer}>
              <SkeletonItem width={24} height={16} style={{ marginBottom: 4 }} />
              <View style={styles.timeContainer}>
                <SkeletonItem width={45} height={16} />
              </View>
            </View>
            
            <View style={styles.teamContainer}>
              <SkeletonItem width={36} height={36} borderRadius={18} style={{ marginBottom: 6 }} />
              <SkeletonItem width={'80%'} height={14} />
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <SkeletonItem width={70} height={12} style={{ marginBottom: 4 }} />
              <SkeletonItem width={80} height={14} />
            </View>
            <View style={styles.footerItem}>
              <SkeletonItem width={40} height={12} style={{ marginBottom: 4 }} />
              <SkeletonItem width={70} height={14} />
            </View>
          </View>
          
          <View style={{ marginTop: 8 }}>
            <SkeletonItem width={'100%'} height={36} borderRadius={12} />
          </View>
        </View>
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

  const renderEmptyContestMessage = () => {
    return (
      <View style={styles.emptyContestContainer}>
        <Text style={styles.emptyContestText}>No contests available</Text>
        <Text style={styles.emptyContestSubText}>Try refreshing or check again later</Text>
        <TouchableOpacity 
          style={styles.emptyContestButton}
          onPress={onRefresh}
        >
          <Text style={styles.emptyContestButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <HeaderProfile />
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

        <View style={styles.featuredSection}>
          {loading ? (
            <View style={styles.skeletonContainer}>
              {renderFeaturedSkeleton()}
            </View>
          ) : contests.length > 0 ? (
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
            />
          ) : (
            <View style={styles.emptyFeaturedContainer}>
              {renderEmptyContestMessage()}
            </View>
          )}
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
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={{ marginBottom: 16 }}>
                <ContestCardSkeleton />
              </View>
            ))
          ) : filteredContests.length > 0 ? (
            filteredContests.map((contest) => (
              <ContestCard
                key={contest.id}
                contest={contest}
                onPress={handleContestPress}
                userContests={useContestsStore.getState().userContests}
              />
            ))
          ) : (
            renderEmptyContestMessage()
          )}
        </View>

        {paymentModalVisible && selectedContest && (
          <PaymentModal
            isVisible={paymentModalVisible}
            onClose={() => setPaymentModalVisible(false)}
            onConfirm={handleClosePaymentModal}
            contest={selectedContest}
            isUserParticipating={useContestsStore.getState().userContests.some(contest => contest.id === selectedContest.id)}
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
  featuredCardSkeleton: {
    backgroundColor: '#F5F5F5',
    opacity: 0.9,
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
    backgroundColor: '#10B981',
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
    marginBottom: 6,
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
    marginBottom: 8,
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
  contestCardContainer: {
    paddingHorizontal: 16,
    marginBottom: 100,
    marginTop: 2,
  },
  noContestsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
  },
  skeletonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  emptyContestContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginVertical: 10,
  },
  emptyFeaturedContainer: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyContestText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyContestSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyContestButton: {
    backgroundColor: '#0504dc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyContestButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

