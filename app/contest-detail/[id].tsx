import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import UserPredictions from '@/components/UserPredictions';
import { IContest } from '@/types';

// Sample data - in a real app, this would come from an API
const getContestById = (id: string): IContest | undefined => {
  const contests = [
    {
      "id": "f984ea94-a07e-4bff-a802-1694f5125604",
      "name": "Premier League Prediction",
      "entryFee": 0.2,
      "currency": "SOL",
      "description": "Manchester United vs Arsenal",
      "status": "OPEN",
      "createdAt": "2025-03-05T10:32:19.895Z",
      "updatedAt": "2025-03-05T10:32:19.895Z",
      "event": {
        "id": "077e38f3-6275-4c68-920f-3a7de8ba9bbf",
        "title": "Premier League",
        "description": "Premier League match",
        "eventImageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men's_Champions_Trophy.png",
        "startDate": "2025-03-05T08:58:46.130Z",
        "endDate": "2025-03-05T08:58:46.130Z",
        "status": "OPEN",
        "createdAt": "2025-03-05T09:04:41.701Z",
        "updatedAt": "2025-03-05T09:27:20.389Z",
        "sport": {
          "id": "3dc44aff-9748-44fc-aa74-1379213a4363",
          "name": "Football",
          "description": "The most popular sport in the world",
          "imageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg",
          "isActive": true,
          "createdAt": "2025-03-02T18:07:04.227Z",
          "updatedAt": "2025-03-02T18:07:04.227Z"
        },
        "teamA": {
          "id": "4ec72fe7-263b-42e5-af1f-b0c26fed97a7",
          "name": "Manchester United",
          "imageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/2502a671-38ac-4ae0-a076-ad202300bfa1-india.png",
          "country": "England"
        },
        "teamB": {
          "id": "59217b82-77ae-4340-ba13-483bea11a7d6",
          "name": "Arsenal",
          "imageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/f105ff41-e9aa-4d90-b551-2f9b488b0e5b-pak.png",
          "country": "England"
        }
      }
    },
  ];
  
  return contests.find(contest => contest.id === id);
};

export default function ContestDetailScreen() {
  const { id: contestId } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState<IContest | undefined>();
  const [error, setError] = useState<string | null>(null);
  
  // In a real app, would use a global state for userId
  const userId = 'current-user-id';

  useEffect(() => {
    if (!contestId) {
      setError('Contest ID is required');
      setLoading(false);
      return;
    }

    // Simulate API call to get contest details
    const loadContest = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        const contestData = getContestById(contestId);
        
        if (!contestData) {
          setError('Contest not found');
          setLoading(false);
          return;
        }
        
        setContest(contestData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load contest');
        setLoading(false);
      }
    };

    loadContest();
  }, [contestId]);

  const handleBack = () => {
    router.back();
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
            <ActivityIndicator size="large" color="#3B3B6D" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !contest) {
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
            <Text style={styles.errorText}>{error || 'Contest not found'}</Text>
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
          <Text style={styles.headerTitle}>{contest.name}</Text>
        </View>
        
        <View style={styles.contestInfoContainer}>
          <Text style={styles.teamsText}>{contest.event.teamA.name} vs {contest.event.teamB.name}</Text>
          <Text style={styles.descriptionText}>{contest.description}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Your Predictions</Text>
        
        <View style={styles.predictionsContainer}>
          <UserPredictions contestId={contestId} userId={userId} />
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
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  teamsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  predictionsContainer: {
    flex: 1,
  },
});
