import { useState, useEffect } from 'react';
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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import HeaderProfile from '../../components/HeaderProfile';
import { ContestCard } from '../../components/ContestCard';
import PaymentModal from '../../components/PaymentModal';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDateTime } from '../../utils/dateUtils';
import { IContest } from '../../types';

// Hard-coded data
const featuredContests: IContest[] = [
  {
    id: 'f984ea94-a07e-4bff-a802-1694f5125604',
    name: 'Basketball Shootout',
    entryFee: 0.2,
    currency: 'SOL',
    description: 'A contest where two teams compete in basketball',
    status: 'OPEN',
    createdAt: '2025-03-05T10:32:19.895Z',
    updatedAt: '2025-03-05T10:32:19.895Z',
    event: {
      id: '077e38f3-6275-4c68-920f-3a7de8ba9bbf',
      title: 'ICC MEN\'S TROPHY',
      description: 'ICC MENS TROPHY',
      eventImageUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men\'s_Champions_Trophy.png',
      startDate: '2025-03-05T08:58:46.130Z',
      endDate: '2025-03-05T08:58:46.130Z',
      status: 'OPEN',
      createdAt: '2025-03-05T09:04:41.701Z',
      updatedAt: '2025-03-05T09:27:20.389Z',
      sport: {
        id: '3dc44aff-9748-44fc-aa74-1379213a4363',
        name: 'Cricket',
        description: 'A team sport played with a ball',
        imageUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg',
        isActive: true,
        createdAt: '2025-03-02T18:07:04.227Z',
        updatedAt: '2025-03-02T18:07:04.227Z',
      },
      teamA: {
        id: '4ec72fe7-263b-42e5-af1f-b0c26fed97a7',
        name: 'INDIA',
        imageUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/2502a671-38ac-4ae0-a076-ad202300bfa1-india.png',
        country: 'INDIA',
      },
      teamB: {
        id: '59217b82-77ae-4340-ba13-483bea11a7d6',
        name: 'PAKISTAN',
        imageUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/f105ff41-e9aa-4d90-b551-2f9b488b0e5b-pak.png',
        country: 'PAKISTAN',
      },
    },
  },
  {
    id: 'f984ea94-a07e-4bff-a802-1694f51256045',
    name: 'Basketball Shootout',
    entryFee: 0.2,
    currency: 'SOL',
    description: 'A contest where two teams compete in basketball',
    status: 'OPEN',
    createdAt: '2025-03-05T10:32:19.895Z',
    updatedAt: '2025-03-05T10:32:19.895Z',
    event: {
      id: '077e38f3-6275-4c68-920f-3a7de8ba9bbf',
      title: 'ICC MEn TROPHY',
      description: 'ICC MENS TROPHY',
      eventImageUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men\'s_Champions_Trophy.png',
      startDate: '2025-03-05T08:58:46.130Z',
      endDate: '2025-03-05T08:58:46.130Z',
      status: 'OPEN',
      createdAt: '2025-03-05T09:04:41.701Z',
      updatedAt: '2025-03-05T09:27:20.389Z',
      sport: {
        id: '3dc44aff-9748-44fc-aa74-1379213a4363',
        name: 'Cricket',
        description: 'A team sport played with a ball',
        imageUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg',
        isActive: true,
        createdAt: '2025-03-02T18:07:04.227Z',
        updatedAt: '2025-03-02T18:07:04.227Z',
      },
      teamA: {
        id: '4ec72fe7-263b-42e5-af1f-b0c26fed97a7',
        name: 'INDIA',
        imageUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/2502a671-38ac-4ae0-a076-ad202300bfa1-india.png',
        country: 'INDIA',
      },
      teamB: {
        id: '59217b82-77ae-4340-ba13-483bea11a7d6',
        name: 'PAKISTAN',
        imageUrl: 'https://s3.ap-south-1.amazonaws.com/sizzils3/f105ff41-e9aa-4d90-b551-2f9b488b0e5b-pak.png',
        country: 'PAKISTAN',
      },
    },
  },
];

const allContests: IContest[] = [
  {
    id: '124356',
    name: 'Premier League: Manchester United vs Arsenal',
    entryFee: 0.2,
    currency: 'SOL',
    description: 'A contest for the Premier League match',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    event: {
      id: '12435',
      title: 'Premier league',
      description: 'Premier League match between Manchester United and Arsenal',
      eventImageUrl:
        'https://images.unsplash.com/photo-1610990294219-54d098aa9b16?q=80&w=100&auto=format&fit=crop',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sport: {
        id: '1',
        name: 'Football',
        imageUrl:
          'https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg',
        isActive: true,
      },
      teamA: {
        id: '1',
        name: 'Manchester United',
        imageUrl:
          'https://images.unsplash.com/photo-1610990294219-54d098aa9b16?q=80&w=100&auto=format&fit=crop',
        country: 'Unknown',
      },
      teamB: {
        id: '2',
        name: 'Arsenal',
        imageUrl:
          'https://images.unsplash.com/photo-1594674686397-a1da66d212bc?q=80&w=100&auto=format&fit=crop',
        country: 'Unknown',
      },
    },
  },
];

// Sports categories for "Top Events"
const sportsCategories = [
  { id: '1', name: 'Football', icon: '⚽' },
  { id: '2', name: 'Basketball', icon: '🏀' },
  { id: '3', name: 'Cricket', icon: '🏏' },
];

export default function HomeScreen() {
  const [activeSport, setActiveSport] = useState(sportsCategories[0].id);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedContest, setSelectedContest] = useState<IContest | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Status bar styling if desired
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#000');
    }
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('dark-content');
    }
  }, []);

  // Join or press a card => show modal
  const handleJoinPress = (contest: IContest) => {
    setSelectedContest(contest);
    setPaymentModalVisible(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalVisible(false);
    if (selectedContest) {
      router.push({
        pathname: "/video-prediction",
        params: { contestId: selectedContest.id },
      });
    }
  };

  // Renders each “Blue Card” in a horizontal list
  const renderFeaturedCard = ({ item }: { item: IContest }) => {
    const { formattedTime } = formatDateTime(item.event.startDate);
    
    return (
      <View style={styles.featuredCardWrapper}>
        <LinearGradient
          colors={['#1a194e', '#2d2c5f', '#37348b']}
          style={styles.featuredCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.leagueText}>{item.event.title}</Text>
            {/* You can replace the arrow with next/prev logic if you want */}
            <TouchableOpacity style={styles.slideArrowContainer}>
              <ChevronRight color="#FFF" size={16} />
            </TouchableOpacity>
          </View>

          {/* Teams */}
          <View style={styles.teamsContainer}>
            <View style={styles.teamContainer}>
              <Image
                source={{ uri: item.event.teamA.imageUrl }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
              <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">
                {item.event.teamA.name}
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
                source={{ uri: item.event.teamB.imageUrl }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
              <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">
                {item.event.teamB.name}
              </Text>
            </View>
          </View>

          {/* Footer */}
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
                $ {item.entryFee.toLocaleString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinPress(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>Join</Text>
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
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <HeaderProfile />

        <View style={styles.featuredSection}>
          <FlatList
            data={featuredContests}
            renderItem={renderFeaturedCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            pagingEnabled
          />
        </View>

        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Events</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Show all</Text>
            </TouchableOpacity>
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

        {/* All contests below */}
        <View style={styles.contestCardContainer}>
          {allContests.map((contest) => (
            <ContestCard 
              key={contest.id} 
              contest={contest} 
              onPress={handleContestPress}
            />
          ))}
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

// Styles
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
    paddingBottom: 100, // Add extra padding at the bottom to account for tab bar
  },
  featuredSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  featuredCardWrapper: {
    width: width * 0.9, // so each card nearly fills the screen
    marginHorizontal: width * 0.05, // center it
  },
  featuredCard: {
    borderRadius: 20,
    padding: 16,
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
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamContainer: {
    alignItems: 'center',
    width: '40%',
  },
  vsContainer: {
    alignItems: 'center',
    width: '20%',
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
    marginBottom: 12,
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
    backgroundColor: '#3B3B6D',
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
});
