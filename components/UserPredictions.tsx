import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { IContest, IUserPrediction, IOutcome, IContestStatus } from '@/types';
import { GET_PREDICTION_BY_USER_AND_CONTEST } from '@/routes/api';
import apiClient from '@/utils/api';

interface UserPredictionsProps {
  contestId: string;
  userId?: string;
  status: IContestStatus
}

const fetchUserPredictions = async (contestId: string, userId?: string): Promise<IUserPrediction[]> => {
  try {
    const response = await apiClient<IUserPrediction[]>(GET_PREDICTION_BY_USER_AND_CONTEST(contestId, userId || ''), 'GET');
    console.log('response', response);
    if (response.success && response.data) {
      return response.data.map((prediction: any) => ({
        ...prediction,
        question: prediction.question,
        outcome: prediction.prediction === 'YES' ? IOutcome.YES : IOutcome.NO
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching user predictions:', error);
    throw new Error('Failed to fetch predictions');
  }
};

const UserPredictions = ({ contestId, userId, status }: UserPredictionsProps) => {
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
        if (data.length === 0) {
          router.push({
            pathname: '/(tabs)/prediction',
            params: {
              contestId: contestId
            }
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load predictions');
        setLoading(false);
      }
    };

    loadPredictions();
  }, [contestId, userId]);

  const handleEditPrediction = (prediction: IUserPrediction) => {
    if (status !== IContestStatus.COMPLETED) {
      router.push({
        pathname: '/(tabs)/prediction',
        params: {
          predictionId: prediction.id,
          questionId: prediction.question.id,
          contestId: contestId,
          edit: 'true'
        }
      });
    }
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

  const progressPercentage = (predictions.length / totalPredictionsNeeded) * 100;

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
              { width: `${progressPercentage}%` }
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
              <View style={styles.contentContainer}>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>{item.question.question || 'No question available'}</Text>
                </View>

                <View style={styles.bottomSection}>
                  <View style={[
                    styles.outcomeContainer,
                    (item.outcome === IOutcome.YES) ? styles.yesContainer : styles.noContainer
                  ]}>
                    <Text style={[
                      styles.outcomeText,
                      (item.outcome === IOutcome.YES) ? styles.yesText : styles.noText
                    ]}>
                      {item.outcome === IOutcome.YES ? 'YES' : 'NO'}
                    </Text>
                  </View>
                  {status === IContestStatus.OPEN && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditPrediction(item)}
                  >
                    <Pencil size={16} color="#0504dc" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  )}
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
    backgroundColor: '#F9FAFC',
  },
  progressContainer: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
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
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0504dc',
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
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
    margin: 20,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  predictionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.06)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contentContainer: {
    padding: 16,
  },
  questionContainer: {
    marginBottom: 6,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
    lineHeight: 22,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  outcomeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesContainer: {
    backgroundColor: 'rgba(0, 200, 83, 0.12)',
  },
  noContainer: {
    backgroundColor: 'rgba(255, 45, 85, 0.12)',
  },
  outcomeText: {
    fontSize: 13,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 4, 220, 0.08)',
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#0504dc',
  },
});

export default UserPredictions;
