import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import UserPredictions from '@/components/UserPredictions';
import { IContest } from '@/types';
import { useUserStore } from '@/store/userStore';
import { CONTESTS_BY_ID } from '@/routes/api';
import apiClient from '@/utils/api';

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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Image source={{ uri: contest.event.eventImageUrl }} style={styles.eventImage} />
          <Text style={styles.headerTitle}> {contest.name}</Text>
        </View>

        <View style={styles.contestInfoContainer}>
          <View style={styles.teamsContainer}>
            <View style={styles.teamSection}>
              {contest.event.teamA.imageUrl ? (
                <Image
                  source={{ uri: contest.event.teamA.imageUrl }}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.teamLogoPlaceholder, { backgroundColor: '#E8F0FE' }]}>
                  <Text style={styles.teamInitial}>{contest.event.teamA.name.charAt(0)}</Text>
                </View>
              )}
              <Text style={styles.teamName}>{contest.event.teamA.name}</Text>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.teamSection}>
              {contest.event.teamB.imageUrl ? (
                <Image
                  source={{ uri: contest.event.teamB.imageUrl }}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.teamLogoPlaceholder, { backgroundColor: '#FEE8E8' }]}>
                  <Text style={styles.teamInitial}>{contest.event.teamB.name.charAt(0)}</Text>
                </View>
              )}
              <Text style={styles.teamName}>{contest.event.teamB.name}</Text>
            </View>
          </View>

          <View style={styles.eventInfoContainer}>
            <Text style={styles.eventDate}>
              {new Date(contest.event.startDate).toLocaleDateString()} • {new Date(contest.event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        <View style={styles.predictionsContainer}>
          <UserPredictions contestId={contestId} userId={user?.id || ''} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
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
  eventImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
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
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamSection: {
    flex: 2,
    alignItems: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  teamLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  vsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
  },
  eventInfoContainer: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#555',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  predictionsContainer: {
    flex: 1,
  },
});
