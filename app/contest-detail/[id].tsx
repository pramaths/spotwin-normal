import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import UserPredictions from '@/components/UserPredictions';
import { IContest,IContestStatus } from '@/types';
import { useUserStore } from '@/store/userStore';
import { CONTESTS_BY_ID } from '@/routes/api';
import apiClient from '@/utils/api';
import { StatusBar } from 'expo-status-bar';

export default function ContestDetailScreen() {
  const { id: contestId } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState<IContest | undefined>();
  const { user } = useUserStore();

  useEffect(() => {
    const loadContest = async () => {
      try {
        setLoading(true);
        const response = await apiClient<IContest>(CONTESTS_BY_ID(contestId), 'GET');
        if (response.success && response.data) {
          setContest(response.data);
        }
      } catch (error) {
        console.error('Error loading contest:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContest();
  }, [contestId]);

  const handleBack = () => {
    router.push('/(tabs)/contests');
  };

  const formatEventDate = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return '';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return `${start.toLocaleDateString()} • ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Loading...</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0504dc" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!contest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Error</Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{'Contest not found'}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="inverted" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{contest.name}</Text>
        </View>

        <View style={styles.contestInfoContainer}>          
          <View style={styles.teamsContainer}>
            <View style={styles.teamSection}>
              {contest.match?.teamA.imageUrl ? (
                <Image
                  source={{ uri: contest.match.teamA.imageUrl }}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.teamLogoPlaceholder, { backgroundColor: '#E8F0FE' }]}>
                  <Text style={styles.teamInitial}>{contest.match?.teamA.name.charAt(0)}</Text>
                </View>
              )}
              <Text style={styles.teamName}>{contest.match?.teamA.name}</Text>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.teamSection}>
              {contest.match?.teamB.imageUrl ? (
                <Image
                  source={{ uri: contest.match.teamB.imageUrl }}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.teamLogoPlaceholder, { backgroundColor: '#FEE8E8' }]}>
                  <Text style={styles.teamInitial}>{contest.match?.teamB.name.charAt(0)}</Text>
                </View>
              )}
              <Text style={styles.teamName}>{contest.match?.teamB.name}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.predictionsContainer}>
          <UserPredictions contestId={contestId} userId={user?.id || ''} status={contest.status as IContestStatus}/>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.06)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
  contestInfoContainer: {
    margin: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  eventBanner: {
    width: '100%',
    height: 80,
    backgroundColor: '#f0f0f0',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  teamSection: {
    flex: 2,
    alignItems: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  teamLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#555',
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  vsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  eventInfoContainer: {
    backgroundColor: '#F8FAFD',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
  },
  predictionsContainer: {
    flex: 1,
  },
});
