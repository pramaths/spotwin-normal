import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { IContest } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { router } from 'expo-router';

interface UserContestCardProps {
  contest: IContest;
  onPress?: (contest: IContest) => void;
  onLeaderboardPress?: (contestId: string) => void;
}

export const UserContestCard: React.FC<UserContestCardProps> = ({ contest, onPress, onLeaderboardPress }) => {
  const { event, entryFee, name, currency, id } = contest;
  
  const handlePress = () => {
    if (onPress) {
      onPress(contest);
    } else {
      router.push({
        pathname: "/contest-detail/[id]",
        params: { id }
      });
    }
  };
  
  const { formattedTime, formattedDate } = formatDateTime(event.startDate);
  const isCompleted = contest.status === 'COMPLETED';

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.leagueName}>{event.title}</Text>
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
            source={{ uri: event.teamA.imageUrl }} 
            style={styles.teamLogo}
            resizeMode="contain" 
          />
          <Text style={styles.teamName} numberOfLines={1}>{event.teamA.name}</Text>
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        
        <View style={styles.teamContainer}>
          <Image 
            source={{ uri: event.teamB.imageUrl }} 
            style={styles.teamLogo}
            resizeMode="contain" 
          />
          <Text style={styles.teamName} numberOfLines={1}>{event.teamB.name}</Text>
        </View>
      </View>
      
      {/* Team country flags below team names */}
      <View style={styles.teamFlagsContainer}>
        <View style={styles.teamFlagItem}>
        </View>
        
        <View style={styles.teamFlagItem}>
        </View>
        
        <View style={styles.teamFlagItem}>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Entry Fee</Text>
          <Text style={styles.statValue}>{entryFee} {currency}</Text>
        </View>
        
        <View style={styles.dateTimeContainer}>
          <Text style={styles.timeText}>{formattedTime}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        {isCompleted && onLeaderboardPress && (
          <TouchableOpacity 
            style={styles.leaderboardButton}
            onPress={() => onLeaderboardPress(id)}
          >
            <Text style={styles.leaderboardButtonText}>Leaderboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leagueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamContainer: {
    alignItems: 'center',
    width: '40%',
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  teamFlagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamFlagItem: {
    alignItems: 'center',
    width: '40%',
  },
  countryText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  timeContainer: {
    alignItems: 'center',
    width: '20%',
  },
  vsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0504dc',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  leaderboardButton: {
    backgroundColor: '#0504dc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  leaderboardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});