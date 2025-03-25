import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Medal } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '@/utils/api';
import { LEADERBOARD_API } from '@/routes/api';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  score: number;
  prize?: string;
}

const mockLeaderboardData: LeaderboardEntry[] = [
  { id: '1', rank: 1, username: 'champion123', score: 1250, prize: '0.5 SOL' },
  { id: '2', rank: 2, username: 'sportsfan', score: 1100, prize: '0.3 SOL' },
  { id: '3', rank: 3, username: 'gamemaster', score: 950, prize: '0.2 SOL' },
  { id: '4', rank: 4, username: 'player4', score: 820 },
  { id: '5', rank: 5, username: 'player5', score: 780 },
  { id: '6', rank: 6, username: 'player6', score: 750 },
  { id: '7', rank: 7, username: 'player7', score: 720 },
  { id: '8', rank: 8, username: 'player8', score: 690 },
  { id: '9', rank: 9, username: 'player9', score: 650 },
  { id: '10', rank: 10, username: 'player10', score: 600 },
];

// Medal icons for top 3 positions
const MedalIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <Trophy size={24} color="#FFD700" />; // Gold
  } else if (rank === 2) {
    return <Medal size={22} color="#C0C0C0" />; // Silver
  } else if (rank === 3) {
    return <Medal size={20} color="#CD7F32" />; // Bronze
  }
  return null;
};

export default function LeaderboardScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contestName, setContestName] = useState<string>('Contest Leaderboard');
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await apiClient<LeaderboardEntry[]>(LEADERBOARD_API(id as string), 'GET');
        if (response.success && response.data) {
          setLeaderboard(response.data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard(mockLeaderboardData);
      }
    };
    fetchLeaderboard();
  }, [id]);

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    // Animation for list items
    const inputRange = [-1, 0, 100 * index, 100 * (index + 2)];
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.9],
      extrapolate: 'clamp',
    });
    
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.5],
      extrapolate: 'clamp',
    });

    // Set background for top 3
    const isTopThree = item.rank <= 3;
    const getCardGradient = () => {
      if (item.rank === 1) return ['#FFF9C4', '#FFE082'] as const; // Gold gradient
      if (item.rank === 2) return ['#F5F5F5', '#E0E0E0'] as const; // Silver gradient
      if (item.rank === 3) return ['#FFE0B2', '#FFCC80'] as const; // Bronze gradient
      return ['#FFFFFF', '#FFFFFF'] as const; // Default white
    };

    return (
      <Animated.View style={[
        styles.leaderboardItemContainer,
        {
          transform: [{ scale }],
          opacity,
          elevation: isTopThree ? 8 : 2,
          shadowOpacity: isTopThree ? 0.2 : 0.1,
        }
      ]}>
        {isTopThree ? (
          <LinearGradient
            colors={getCardGradient()}
            style={styles.topThreeCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {renderItemContent(item)}
          </LinearGradient>
        ) : (
          <View style={styles.regularCard}>
            {renderItemContent(item)}
          </View>
        )}
      </Animated.View>
    );
  };

  const renderItemContent = (item: LeaderboardEntry) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        {item.rank <= 3 ? (
          <MedalIcon rank={item.rank} />
        ) : (
          <View style={styles.circleRank}>
            <Text style={styles.rankText}>{item.rank}</Text>
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={[
          styles.username,
          item.rank <= 3 && styles.topThreeUsername
        ]}>
          {item.username}
        </Text>
        <Text style={styles.score}>
          {item.score.toLocaleString()} points
        </Text>
      </View>

      {item.prize && (
        <View style={[
          styles.prizeContainer,
          item.rank <= 3 && styles.topThreePrize
        ]}>
          <Text style={styles.prizeText}>{item.prize}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4B79A1', '#283E51'] as const}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{contestName}</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <Animated.FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>Rank</Text>
            <Text style={[styles.listHeaderText, { flex: 1, marginLeft: 60 }]}>Player</Text>
            <Text style={styles.listHeaderText}>Prize</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: 16,
    paddingTop: 24,
  },
  listHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  leaderboardItemContainer: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  topThreeCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  regularCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: 12,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#334155',
    marginBottom: 4,
  },
  topThreeUsername: {
    fontSize: 18,
    color: '#0F172A',
  },
  score: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  prizeContainer: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  topThreePrize: {
    backgroundColor: '#10B981',
  },
  prizeText: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
}); 