import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useState, useEffect } from 'react';

// Mock leaderboard data - replace with actual API call
interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  score: number;
  prize?: string;
}

const mockLeaderboardData: LeaderboardEntry[] = [
  { id: '1', rank: 1, username: 'champion123', avatar: 'https://i.pravatar.cc/150?img=1', score: 1250, prize: '0.5 SOL' },
  { id: '2', rank: 2, username: 'sportsfan', avatar: 'https://i.pravatar.cc/150?img=2', score: 1100, prize: '0.3 SOL' },
  { id: '3', rank: 3, username: 'gamemaster', avatar: 'https://i.pravatar.cc/150?img=3', score: 950, prize: '0.2 SOL' },
  { id: '4', rank: 4, username: 'player4', avatar: 'https://i.pravatar.cc/150?img=4', score: 820 },
  { id: '5', rank: 5, username: 'player5', avatar: 'https://i.pravatar.cc/150?img=5', score: 780 },
  { id: '6', rank: 6, username: 'player6', avatar: 'https://i.pravatar.cc/150?img=6', score: 750 },
  { id: '7', rank: 7, username: 'player7', avatar: 'https://i.pravatar.cc/150?img=7', score: 720 },
  { id: '8', rank: 8, username: 'player8', avatar: 'https://i.pravatar.cc/150?img=8', score: 690 },
  { id: '9', rank: 9, username: 'player9', avatar: 'https://i.pravatar.cc/150?img=9', score: 650 },
  { id: '10', rank: 10, username: 'player10', avatar: 'https://i.pravatar.cc/150?img=10', score: 600 },
];

export default function LeaderboardScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contestName, setContestName] = useState<string>('Contest Leaderboard');

  useEffect(() => {
    // In a real app, fetch the leaderboard data for the specific contest
    // For now, we'll use mock data
    setLeaderboard(mockLeaderboardData);
    
    // You would also fetch the contest details to show the name
    setContestName('Europa League Leaderboard');
  }, [id]);

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={[
          styles.rankText, 
          item.rank === 1 ? styles.firstPlace : 
          item.rank === 2 ? styles.secondPlace : 
          item.rank === 3 ? styles.thirdPlace : null
        ]}>
          {item.rank}
        </Text>
      </View>
      
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.score}>{item.score} points</Text>
      </View>
      
      {item.prize && (
        <View style={styles.prizeContainer}>
          <Text style={styles.prizeText}>{item.prize}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{contestName}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
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
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  firstPlace: {
    color: '#FFD700', // Gold
  },
  secondPlace: {
    color: '#C0C0C0', // Silver
  },
  thirdPlace: {
    color: '#CD7F32', // Bronze
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  score: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  prizeContainer: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prizeText: {
    color: '#0369A1',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
}); 