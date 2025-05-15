import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Medal, Crown, Sparkles, Target } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '@/utils/api';
import { LEADERBOARD_API } from '@/routes/api';
import { useUserStore } from '@/store/userStore';
import UsdcIcon from '@/assets/icons/usdc.svg';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  score: number;
  prize?: string;
  userId: string;
}

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

// Simple rank description
const getRankDescription = (rank: number) => {
  if (rank === 1) return "Gold";
  if (rank === 2) return "Silver";
  if (rank === 3) return "Bronze";
  if (rank <= 10) return "Top 10";
  if (rank <= 50) return "Top 50";
  if (rank <= 100) return "Top 100";
  return "Participant";
};

export default function LeaderboardScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contestName, setContestName] = useState<string>('Contest Leaderboard');
  const scrollY = useRef(new Animated.Value(0)).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;
  const user = useUserStore(state => state.user);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userIndex, setUserIndex] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await apiClient<LeaderboardEntry[]>(LEADERBOARD_API(id as string), 'GET');
        if (response.success && response.data) {
          setLeaderboard(response.data);

          // Find user's rank and index in the leaderboard
          const userEntryIndex = response.data.findIndex(entry => entry.userId === user?.id);
          if (userEntryIndex !== -1) {
            setUserRank(response.data[userEntryIndex].rank);
            setUserIndex(userEntryIndex);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
      }
    };
    fetchLeaderboard();
  }, [id, user?.id]);

  const scrollToUserPosition = () => {
    if (userIndex !== null && flatListRef.current) {
      Animated.sequence([
        Animated.timing(buttonAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      flatListRef.current.scrollToIndex({
        index: userIndex,
        animated: true,
        viewOffset: 100,
      });
    }
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
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

    const isTopThree = item.rank <= 3;
    const isCurrentUser = item.userId === user?.id;

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
          borderWidth: isCurrentUser ? 2 : 0,
          borderColor: isCurrentUser ? '#3B82F6' : 'transparent',
          borderRadius: 16,
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
          <View style={[
            styles.regularCard,
            isCurrentUser && styles.currentUserCard
          ]}>
            {renderItemContent(item)}
          </View>
        )}
      </Animated.View>
    );
  };

  const renderItemContent = (item: LeaderboardEntry) => {
    const isCurrentUser = item.userId === user?.id;

    return (
      <View style={styles.leaderboardItem}>
        <View style={styles.rankContainer}>
          {item.rank <= 3 ? (
            <MedalIcon rank={item.rank} />
          ) : (
            <View style={[
              styles.circleRank,
              isCurrentUser && styles.currentUserRank
            ]}>
              <Text style={[
                styles.rankText,
                isCurrentUser && styles.currentUserRankText
              ]}>{item.rank}</Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={[
            styles.username,
            item.rank <= 3 && styles.topThreeUsername,
            isCurrentUser && styles.currentUserName
          ]}>
            {item.username} {isCurrentUser && "• You"}
          </Text>
        </View>

        {item.prize && (
          <View style={[
            styles.prizeContainer,
            item.rank <= 3 && styles.topThreePrize,
            isCurrentUser && styles.currentUserPrize
          ]}>
            <Text style={styles.prizeText}>{item.prize}</Text>
            <UsdcIcon width={20} height={20} />
          </View>
        )}
      </View>
    );
  };
  const hardcodedLeaderboard =[
    {
      "id": "1",
      "rank": 1,
      "username": "ChainShifter",
      "score": 9821,
      "prize": "200 ",
      "userId": "user_001"
    },
    {
      "id": "2",
      "rank": 2,
      "username": "BlockWarden",
      "score": 9675,
      "prize": "100 ",
      "userId": "user_002"
    },
    {
      "id": "3",
      "rank": 3,
      "username": "SatoshiSniper",
      "score": 9510,
      "prize": "50 ",
      "userId": "user_003"
    },
    {
      "id": "4",
      "rank": 4,
      "username": "ETHGuardian",
      "score": 9390,
      "prize": "50 ",
      "userId": "user_004"
    },
    {
      "id": "5",
      "rank": 5,
      "username": "ZeroHash",
      "score": 9255,
      "prize": "50 ",
      "userId": "user_005"
    },
    {
      "id": "6",
      "rank": 6,
      "username": "DeFiDruid",
      "score": 9112,
      "prize": "50 ",
      "userId": "user_006"
    },
    {
      "id": "7",
      "rank": 7,
      "username": "BitVoyager",
      "score": 8974,
      "prize": "50 ",
      "userId": "user_007"
    },
    {
      "id": "8",
      "rank": 8,
      "username": "HodlKing",
      "score": 8860,
      "prize": "50 ",
      "userId": "user_008"
    },
    {
      "id": "9",
      "rank": 9,
      "username": "MoonMiner",
      "score": 8725,
      "prize": "50 ",
      "userId": "user_009"
    },
    {
      "id": "10",
      "rank": 10,
      "username": "WhaleHunter",
      "score": 8650,
      "prize": "50 ",
      "userId": "user_010"
    },
    {
      "id": "11",
      "rank": 11,
      "username": "GasSaver",
      "score": 8503,
      "prize": "20 ",
      "userId": "user_011"
    },
    {
      "id": "12",
      "rank": 12,
      "username": "DEXDrifter",
      "score": 8377,
      "prize": "20 ",
      "userId": "user_012"
    },
    {
      "id": "13",
      "rank": 13,
      "username": "StakingSage",
      "score": 8290,
      "prize": "20 ",
      "userId": "user_013"
    },
    {
      "id": "14",
      "rank": 14,
      "username": "TokenSeeker",
      "score": 8175,
      "prize": "20 ",
      "userId": "user_014"
    },
    {
      "id": "15",
      "rank": 15,
      "username": "FlashLoaner",
      "score": 8055,
      "prize": "20 ",
      "userId": "user_015"
    },
    {
      "id": "16",
      "rank": 16,
      "username": "SmartContractor",
      "score": 7930,
      "userId": "user_016"
    },
    {
      "id": "17",
      "rank": 17,
      "username": "DustTrader",
      "score": 7805,
      "userId": "user_017"
    },
    {
      "id": "18",
      "rank": 18,
      "username": "ColdWallet",
      "score": 7692,
      "userId": "user_018"
    },
    {
      "id": "19",
      "rank": 19,
      "username": "ArbitrumAce",
      "score": 7544,
      "userId": "user_019"
    },
    {
      "id": "20",
      "rank": 20,
      "username": "SolanaSpeedster",
      "score": 7401,
      "userId": "user_020"
    }
  ]
  
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
        ref={flatListRef}
        data={leaderboard.length === 0 ? hardcodedLeaderboard : leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        onScrollToIndexFailed={(info) => {
          // Handle scroll to index failure (this can happen with variable height items)
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }
          }, 100);
        }}
        ListHeaderComponent={() => (
          <>
            {userRank && (
              <LinearGradient
                colors={['#E0F2FE', '#DBEAFE']}
                style={styles.userRankBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.userRankTextContainer}>
                  <View style={styles.rankWithIcon}>
                    <Text style={styles.userRankPosition}>Your Position: #{userRank}</Text>
                    {userRank <= 3 && <Trophy size={18} color="#FFD700" style={styles.inlineIcon} />}
                  </View>
                  <Text style={styles.userRankMessage}>{getRankDescription(userRank)}</Text>
                </View>
              </LinearGradient>
            )}
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>Rank</Text>
              <Text style={[styles.listHeaderText, { flex: 1, marginLeft: 60 }]}>Player</Text>
              <Text style={styles.listHeaderText}>Prize </Text>
            </View>
          </>
        )}
      />

      {userRank && userIndex !== null && (
        <Animated.View
          style={[
            styles.scrollToMeButton,
            {
              transform: [
                {
                  scale: buttonAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.9],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.buttonInner}
            onPress={scrollToUserPosition}
            activeOpacity={0.8}
          >
            <Target size={24} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
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
  currentUserCard: {
    backgroundColor: '#F0F7FF',
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
  currentUserRank: {
    backgroundColor: '#DBEAFE',
  },
  rankText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  currentUserRankText: {
    color: '#3B82F6',
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
  currentUserName: {
    color: '#1E40AF',
  },
  score: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  prizeContainer: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',

  },
  topThreePrize: {
    backgroundColor: '#10B981',
  },
  currentUserPrize: {
    backgroundColor: '#93C5FD',
  },
  prizeText: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  userRankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  userRankTextContainer: {
    alignItems: 'center',
  },
  userRankPosition: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#1E40AF',
    marginBottom: 6,
  },
  userRankMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
    fontWeight: '500',
  },
  rankWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineIcon: {
    marginLeft: 6,
  },
  scrollToMeButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 999,
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  inlineTargetButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
}); 