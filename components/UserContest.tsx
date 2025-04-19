import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, GestureResponderEvent } from 'react-native';
import { IContest } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { router } from 'expo-router';

interface UserContestCardProps {
  contest: IContest;
}

export const UserContestCard: React.FC<UserContestCardProps> = ({ contest }: UserContestCardProps) => {
  const { entryFee, id, match } = contest;

  const handlePress = () => {
    router.push({
      pathname: "/contest-detail/[id]",
      params: { id }
    });

  };

  const handleLeaderboardPress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    router.push({
      pathname: "/leaderboard/[id]",
      params: { id }
    });

  };

  const { formattedTime, formattedDate } = formatDateTime(match?.startTime || '');
  const isCompleted = contest.status === 'COMPLETED';

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <Text style={styles.leagueName} numberOfLines={1} ellipsizeMode="tail">{match?.title}</Text>
          <View style={[
            styles.statusContainer,
            { backgroundColor: isCompleted ? '#10B981' : '#3B82F6' }
          ]}>
            <Text style={styles.statusText}>
              {isCompleted ? 'Completed' : 'Active'}
            </Text>
          </View>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.teamContainer}>
            <Image
              source={{ uri: match?.teamA.imageUrl }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">{match?.teamA.name}</Text>
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.teamContainer}>
            <Image
              source={{ uri: match?.teamB.imageUrl }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">{match?.teamB.name}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Entry Fee</Text>
            <Text style={styles.statValue}>{entryFee} Points</Text>
          </View>

          <View style={styles.dateTimeContainer}>
            <Text style={styles.timeText}>{formattedTime}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {isCompleted && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.leaderboardButton}
            onPress={handleLeaderboardPress}
            activeOpacity={0.7}
          >
            <Text style={styles.leaderboardButtonText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leagueName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamContainer: {
    flex: 2,
    alignItems: 'center',
  },
  teamLogo: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  teamName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
    width: '100%',
  },
  timeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  vsText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'flex-start',
    width: '50%',
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
    width: '50%',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  leaderboardButton: {
    backgroundColor: '#0504dc',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
  },
  leaderboardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});