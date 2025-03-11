import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { IContest, IOutcomeType } from '@/types';
import { IUserPrediction, fetchUserPredictions } from '@/api/predictionVideos';
import { formatDateTime } from '@/utils/dateUtils';

interface UserPredictionsProps {
  contestId: string;
  userId?: string;
}

const UserPredictions = ({ contestId, userId }: UserPredictionsProps) => {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<IUserPrediction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPredictions = async () => {
      if (!contestId) {
        setError('Contest ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchUserPredictions(contestId, userId);
        setPredictions(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load predictions');
        setLoading(false);
      }
    };

    loadPredictions();
  }, [contestId, userId]);

  const handleEditPrediction = (prediction: IUserPrediction) => {
    router.push({
      pathname: '/(tabs)/video-prediction',
      params: { 
        predictionId: prediction.id,
        videoId: prediction.videoId,
        contestId: contestId,
        edit: 'true'
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0504dc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (predictions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No predictions found for this contest</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: IUserPrediction }) => {
    return (
      <View style={styles.predictionCard}>
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        
        <View style={styles.contentContainer}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{item.question}</Text>
          </View>
          
          <View style={styles.bottomSection}>
            <View style={[
              styles.outcomeContainer,
              item.outcome === IOutcomeType.YES ? styles.yesContainer : styles.noContainer
            ]}>
              <Text style={styles.outcomeText}>
                {item.outcome === IOutcomeType.YES ? 'YES' : 'NO'}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditPrediction(item)}
            >
              <Pencil size={16} color="#0504dc" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={predictions}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100, // Add space at the bottom for tab navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  predictionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
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
  thumbnail: {
    width: 100,
    height: 100,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  questionContainer: {
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outcomeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesContainer: {
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
  },
  noContainer: {
    backgroundColor: 'rgba(255, 45, 85, 0.1)',
  },
  outcomeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 59, 109, 0.1)',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#0504dc',
  },
});

export default UserPredictions;
