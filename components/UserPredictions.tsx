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
import { IContest, OutcomeType } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { GET_PREDICTION_BY_USER_AND_CONTEST } from '@/routes/api';
import apiClient from '@/utils/api';

interface UserPredictionsProps {
  contestId: string;
  userId?: string;
}

interface IVideo {
  id: string;
  submissionId: string;
  videoUrl: string;
  question: string | null;
  thumbnailUrl: string;
  userId: string;
  contestId: string;
  correctOutcome: string | null;
  numberOfBets: number;
  createdAt: string;
  updatedAt: string;
}

export interface IUserPrediction {
  id: string;
  userId: string;
  contestId: string;
  videoId: string;
  prediction: string;
  isCorrect: boolean | null;
  createdAt: string;
  updatedAt: string;
  video: IVideo;
  question?: string; // For backward compatibility with existing code
  thumbnailUrl?: string; // For backward compatibility with existing code
  outcome?: OutcomeType; // For backward compatibility with existing code
}

const fetchUserPredictions = async (contestId: string, userId?: string): Promise<IUserPrediction[]> => {
  try {
    const response = await apiClient<IUserPrediction[]>(GET_PREDICTION_BY_USER_AND_CONTEST(contestId, userId || ''), 'GET');
    console.log('response', response);
    if (response.success && response.data) {
      return response.data.map((prediction: IUserPrediction) => ({
        ...prediction,
        question: prediction.video.question || '',
        thumbnailUrl: prediction.video.thumbnailUrl,
        outcome: prediction.prediction === 'YES' ? OutcomeType.YES : OutcomeType.NO
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching user predictions:', error);
    throw new Error('Failed to fetch predictions');
  }
};

const UserPredictions = ({ contestId, userId }: UserPredictionsProps) => {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<IUserPrediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const totalPredictionsNeeded = 9;

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

  return (
    <View style={styles.mainContainer}>
      <View style={styles.progressContainer}>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressTitle}>Your Predictions</Text>
          <Text style={styles.progressCount}>
            <Text style={styles.currentCount}>{predictions.length}</Text>
            <Text style={styles.totalCount}>/{totalPredictionsNeeded}</Text>
          </Text>
        </View>
        
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${(predictions.length / totalPredictionsNeeded) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {predictions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No predictions yet. Make some predictions to join this contest!</Text>
        </View>
      ) : (
        <FlatList
          data={predictions}
          renderItem={({ item }) => (
            <View style={styles.predictionCard}>
              <Image source={{ uri: item.thumbnailUrl || item.video.thumbnailUrl }} style={styles.thumbnail} />

              <View style={styles.contentContainer}>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>{item.question || item.video.question || 'No question available'}</Text>
                </View>

                <View style={styles.bottomSection}>
                  <View style={[
                    styles.outcomeContainer,
                    (item.outcome === OutcomeType.YES || item.prediction === 'YES') ? styles.yesContainer : styles.noContainer
                  ]}>
                    <Text style={[
                      styles.outcomeText,
                      (item.outcome === OutcomeType.YES || item.prediction === 'YES') ? styles.yesText : styles.noText
                    ]}>
                      {(item.outcome === OutcomeType.YES || item.prediction === 'YES') ? 'YES' : 'NO'}
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
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  progressCount: {
    fontSize: 16,
  },
  currentCount: {
    fontWeight: '700',
    color: '#0504dc',
  },
  totalCount: {
    color: '#666',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0504dc',
    borderRadius: 4,
  },
  listContainer: {
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
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    margin: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
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
    backgroundColor: '#f0f0f0',
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
    lineHeight: 20,
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
  },
  yesText: {
    color: '#00C853',
  },
  noText: {
    color: '#FF2D55',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(5, 4, 220, 0.1)',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#0504dc',
  },
});

export default UserPredictions;
