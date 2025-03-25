import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { IContest } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { getUserParticipationStatus } from '../services/userContestsApi';

interface ContestCardProps {
  contest: IContest;
  onPress?: (contest: IContest) => void;
  userContests?: IContest[];
}

export const ContestCard = ({ contest, onPress, userContests = [] }: ContestCardProps) => {
  const { entryFee, name, currency, match } = contest;
  const [isParticipating, setIsParticipating] = useState(false);
  const { user } = useUserStore();
  
  useEffect(() => {
    const checkParticipation = async () => {
      if (!user?.id) return;
      
      if (userContests.length > 0) {
        const isInUserContests = userContests.some(userContest => userContest.id === contest.id);
        setIsParticipating(isInUserContests);
      } else {
        try {
          const status = await getUserParticipationStatus(user.id, contest.id);
          setIsParticipating(status);
        } catch (error) {
          console.error("Error checking participation:", error);
        }
      }
    };

    checkParticipation();
  }, [contest.id, user?.id, userContests]);
  
  const handlePress = () => {
    if (onPress) {
      onPress(contest);
    }
  };
  
  const { formattedTime, formattedDate } = formatDateTime(match?.startTime || '');
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.leagueName}>{match?.title}</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{match?.status}</Text>
        </View>
      </View>
      
      <View style={styles.teamsContainer}>
        <View style={styles.teamContainer}>
          <Image 
            source={{ uri: match?.teamA.imageUrl }} 
            style={styles.teamLogo}
            resizeMode="contain" 
          />
          <Text style={styles.teamName} numberOfLines={1}>{match?.teamA.name}</Text>
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
          <Text style={styles.teamName} numberOfLines={1}>{match?.teamB.name}</Text>
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
      
      <TouchableOpacity 
        style={[styles.joinButton, isParticipating && styles.participatingButton]}
        onPress={handlePress}
        disabled={isParticipating}
      >
        <Text style={styles.joinButtonText}>
          {isParticipating ? 'Already Participating' : 'Join Contest'}
        </Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 16,
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
  joinButton: {
    backgroundColor: '#0504dc',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  participatingButton: {
    backgroundColor: '#10B981', // Green color for "Already Participating"
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});