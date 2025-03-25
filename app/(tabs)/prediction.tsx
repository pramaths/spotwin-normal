import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Text,
  ActivityIndicator,
  Image
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { submitPrediction, RemovePrediction, fetchUserPredictions, ChangePrediction } from '@/services/predictionsApi';
import { useLocalSearchParams } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { IDifficultyLevel, IOutcome, IUserPrediction, IQuestion, IContest } from '@/types';
import QuestionItem from '@/components/QuestionItem';
import { QUESTIONS_BY_CONTEST, CONTESTS_BY_ID } from '@/routes/api';
import apiClient from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function PredictionScreen() {
  const { contestId } = useLocalSearchParams();
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<IDifficultyLevel>(IDifficultyLevel.EASY);
  const [contest, setContest] = useState<IContest | null>(null);
  const [predictionMessage, setPredictionMessage] = useState<{ text: string; type: IOutcome } | null>(null);
  const [predictions, setPredictions] = useState<IUserPrediction[]>([]);
  const [userVotesMap, setUserVotesMap] = useState<Record<string, IOutcome | null>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);

  const [questionsByDifficulty, setQuestionsByDifficulty] = useState<Record<IDifficultyLevel, IQuestion[]>>({
    [IDifficultyLevel.EASY]: [],
    [IDifficultyLevel.MEDIUM]: [],
    [IDifficultyLevel.HARD]: []
  });

  const { user } = useUserStore();
  const router = useRouter();

  const [difficultyTabs] = useState<IDifficultyLevel[]>([
    IDifficultyLevel.EASY,
    IDifficultyLevel.MEDIUM,
    IDifficultyLevel.HARD
  ]);

  const getAnsweredCountByDifficulty = (difficulty: IDifficultyLevel) => {
    return predictions.filter((p: IUserPrediction) => p.question.difficultyLevel === difficulty).length;
  };

  // Function to determine if max predictions reached for a difficulty level
  const isMaxPredictionsReached = (difficulty: IDifficultyLevel) => {
    const count = getAnsweredCountByDifficulty(difficulty);
    return count >= 3;
  };

  useEffect(() => {
    const loadContest = async () => {
      const response = await apiClient<IContest>(CONTESTS_BY_ID(contestId as string), 'GET');
      if (response.success && response.data) {
        setContest(response.data);
      }
    };
    loadContest();
  }, [contestId]);
  const loadQuestions = useCallback(async () => {
    if (!contestId) {
      setError('Contest ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient<IQuestion[]>(QUESTIONS_BY_CONTEST(contestId as string), 'GET');
      if (response.success && response.data) {
        const questionData = Array.isArray(response.data) ? response.data : [];
        setQuestions(questionData);

        const groupedQuestions: Record<IDifficultyLevel, IQuestion[]> = {
          [IDifficultyLevel.EASY]: [],
          [IDifficultyLevel.MEDIUM]: [],
          [IDifficultyLevel.HARD]: []
        };

        if (questionData.length > 0) {
          questionData.forEach((q: IQuestion) => {
            if (groupedQuestions[q.difficultyLevel]) {
              groupedQuestions[q.difficultyLevel].push(q);
            }
          });
        }

        setQuestionsByDifficulty(groupedQuestions);
      } else {
        setError('Failed to load questions. Please try again.');
      }
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  const loadPredictions = useCallback(async () => {
    if (!contestId) return;

    try {
      setLoading(true);
      const data = await fetchUserPredictions(contestId as string, user?.id || '');
      setPredictions(data);

      const votesMap = data.reduce((acc: Record<string, IOutcome | null>, pred: IUserPrediction) => {
        acc[pred.question.id] = pred.outcome as unknown as IOutcome | null;
        return acc;
      }, {});
      setUserVotesMap(votesMap);

      const answeredIds = data.map((p: IUserPrediction) => p.question.id);
      setAnsweredQuestions(answeredIds);
    } catch (err: any) {
      setError(err.message || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  }, [contestId, user?.id]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const handleTabPress = (difficulty: IDifficultyLevel) => {
    setSelectedDifficulty(difficulty);
  };

  const handlePrediction = async (question: IQuestion, prediction: IOutcome) => {
    try {
      const answeredQuestionsForDifficulty = predictions.filter(
        (p: IUserPrediction) => p.question.difficultyLevel === question.difficultyLevel
      );

      if (answeredQuestionsForDifficulty.length >= 3 && !userVotesMap[question.id]) {
        setPredictionMessage({
          text: `You have already answered 3 questions in ${question.difficultyLevel} section.`,
          type: IOutcome.NO
        });
        
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(200);
        }
        
        setTimeout(() => {
          setPredictionMessage(null);
        }, 4000);
        return;
      }

      // Check if this question already has a prediction
      const existingPredictionIndex = predictions.findIndex(p => p.question.id === question.id);
      
      if (existingPredictionIndex > -1) {
        // If prediction exists, use ChangePrediction
        const existingPrediction = predictions[existingPredictionIndex];
        await handleChangePrediction(existingPrediction.id, prediction, question.id);
      } else {
        // If no prediction exists, create a new one
        await submitPrediction(question.id, contestId as string, user?.id || '', prediction);
      }

      if (!answeredQuestions.includes(question.id)) {
        setAnsweredQuestions((prev: string[]) => [...prev, question.id]);
      }

      setUserVotesMap((prev) => ({
        ...prev,
        [question.id]: prediction
      }));

      setPredictions((prev: IUserPrediction[]) => {
        const existingIndex = prev.findIndex((p) => p.question.id === question.id);
        const newEntry: IUserPrediction = {
          id: existingIndex > -1 ? prev[existingIndex].id : question.id, // Keep the same ID if updating
          userId: user?.id || '',
          contestId: contestId as string,
          outcome: prediction,
          questionId: question.id,
          isCorrect: null,
          question
        };

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = newEntry;
          return updated;
        } else {
          return [...prev, newEntry];
        }
      });

      setPredictionMessage({
        text: `You predicted ${prediction === IOutcome.YES ? 'YES' : 'NO'}!`,
        type: prediction
      });
      setTimeout(() => {
        setPredictionMessage(null);
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting prediction:', err);
      setPredictionMessage({
        text: 'Failed to submit prediction. Please try again.',
        type: IOutcome.NO
      });
      setTimeout(() => {
        setPredictionMessage(null);
      }, 2000);
    }
  };

  const handleRemovePrediction = async (questionId: string) => {
    try {
      await RemovePrediction(questionId, user?.id || '');

      setUserVotesMap((prev) => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });

      setAnsweredQuestions((prev) => prev.filter((id) => id !== questionId));

      setPredictions((prev) => prev.filter((p: IUserPrediction) => p.question.id !== questionId));
    } catch (err) {
      console.error('Error removing prediction:', err);
    }
  };

  const handleChangePrediction = async (predictionId: string, prediction: IOutcome, questionId: string) => {
    try {
      await ChangePrediction(predictionId, prediction, questionId);
      
      // Update UI state for the changed prediction
      setUserVotesMap((prev) => ({
        ...prev,
        [questionId]: prediction
      }));
      
      setPredictions((prev) => {
        return prev.map((p) => {
          if (p.id === predictionId) {
            return {
              ...p,
              outcome: prediction
            };
          }
          return p;
        });
      });
    } catch (err) {
      console.error('Error changing prediction:', err);
      setPredictionMessage({
        text: 'Failed to change prediction. Please try again.',
        type: IOutcome.NO
      });
      setTimeout(() => {
        setPredictionMessage(null);
      }, 2000);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const currentQuestions = questionsByDifficulty[selectedDifficulty] || [];
  const answeredCount = getAnsweredCountByDifficulty(selectedDifficulty);

  if (loading && questions.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <ActivityIndicator size="large" color="#3768E3" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (error && questions.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadQuestions}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#181818" size={24} />
            <Text>Back</Text>
            <View style={styles.matchdetials}>
              {contest?.match?.teamA?.imageUrl && (
                <Image 
                  source={{ uri: contest.match.teamA.imageUrl }} 
                  style={styles.teamSmallImage} 
                  resizeMode="contain"
                />
              )}
              <Text style={{fontSize: 12, fontWeight: 'bold'}}> {contest?.match?.teamA.name}</Text>
              <Text style={{fontSize: 12, fontWeight: 'bold'}}> vs </Text>
              {contest?.match?.teamB?.imageUrl && (
                <Image 
                  source={{ uri: contest.match.teamB.imageUrl }} 
                  style={styles.teamSmallImage} 
                  resizeMode="contain"
                />
              )}
              <Text style={{fontSize: 12, fontWeight: 'bold'}}> {contest?.match?.teamB.name}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.tabContainer}>
            {difficultyTabs.map((difficulty: IDifficultyLevel) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.tabButton, 
                  { backgroundColor: getTabColor(difficulty, selectedDifficulty) },
                  isMaxPredictionsReached(difficulty) && styles.maxReachedTab
                ]}
                onPress={() => handleTabPress(difficulty)}
              >
                <Text style={[styles.tabText, selectedDifficulty === difficulty && styles.selectedTabText]}>
                  {difficulty}
                </Text>
                <Text 
                  style={[
                    styles.countBadge, 
                    selectedDifficulty === difficulty && styles.selectedCountBadge,
                    isMaxPredictionsReached(difficulty) && styles.maxReachedBadge
                  ]}
                >
                  {getAnsweredCountByDifficulty(difficulty)}/3
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {currentQuestions.length > 0 ? (
            currentQuestions.map((q: IQuestion) => (
              <QuestionItem
                key={q.id}
                question={q}
                onPrediction={(prediction: IOutcome) => handlePrediction(q, prediction)}
                userVote={userVotesMap[q.id] || null}
                onRemovePrediction={() => handleRemovePrediction(q.id)}
              />
            ))
          ) : (
            <View style={styles.noQuestionsContainer}>
              <Text style={styles.noQuestionsText}>
                No questions available for {selectedDifficulty} level
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {predictionMessage && (
        <View
          style={[
            styles.predictionMessage,
            predictionMessage.type === IOutcome.YES ? styles.yesMessage : styles.noMessage
          ]}
        >
          <Ionicons 
            name={predictionMessage.type === IOutcome.YES ? "checkmark-circle" : "alert-circle"} 
            size={24} 
            color="#FFF" 
            style={styles.predictionIcon}
          />
          <Text style={styles.predictionMessageText}>{predictionMessage.text}</Text>
        </View>
      )}
    </View>
  );
}

function getTabColor(difficulty: IDifficultyLevel, selected: IDifficultyLevel) {
  if (difficulty !== selected) return '#F0F4FA';
  switch (difficulty) {
    case IDifficultyLevel.EASY:
      return '#4CAF50'; // Green
    case IDifficultyLevel.MEDIUM:
      return '#FF9800'; // Orange
    case IDifficultyLevel.HARD:
      return '#F44336'; // Red
    default:
      return '#E0E0E0';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    color: '#333',
    marginTop: 10,
    fontSize: 16
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#3768E3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  backButton: {
    position: 'absolute',
    left: 8,
    top: 25,
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  backButtonText: {
    color: '#181818',
    fontSize: 16,
    fontWeight: 'bold'
  },
  matchdetials: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 30,
    fontSize: 12,
    fontWeight: 'bold'
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 50,
    marginTop: 30,
    zIndex: 5,
    width: '100%'

  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 80
  },
  tabText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14
  },
  selectedTabText: {
    color: '#FFF'
  },
  countBadge: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6
  },
  selectedCountBadge: {
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  questionCounterContainer: {
    alignSelf: 'center',
    backgroundColor: '#F0F4FA',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 16,
    zIndex: 10
  },
  questionCounterText: {
    color: '#3768E3',
    fontWeight: 'bold',
    fontSize: 14
  },
  noQuestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  noQuestionsText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center'
  },
  predictionMessage: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    width: '90%',
    maxWidth: 400,
  },
  predictionIcon: {
    marginRight: 8,
  },
  yesMessage: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)'
  },
  noMessage: {
    backgroundColor: 'rgba(244, 67, 54, 0.95)'
  },
  predictionMessageText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  scrollView: {
    flex: 1, 
    marginVertical: 6
  },
  scrollViewContent: {
    paddingBottom: 60
  },
  teamSmallImage: {
    width: 20,
    height: 20,
  },
  maxReachedTab: {
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  maxReachedBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#FFF',
    fontWeight: 'bold',
  },
});
