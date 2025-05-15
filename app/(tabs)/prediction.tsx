import { useState, useEffect, useCallback } from 'react';
import React from 'react';
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
  Image,
  Alert
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { submitPrediction, RemovePrediction, fetchUserPredictions, ChangePrediction } from '@/services/predictionsApi';
import { useLocalSearchParams } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { IDifficultyLevel, IOutcome, IUserPrediction, IQuestion, IContest } from '@/types';
import QuestionItem from '@/components/QuestionItem';
import { QUESTIONS_BY_CONTEST, CONTESTS_BY_ID, SUBMIT_PREDICTIONS } from '@/routes/api';
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
  const [unlockedQuestions, setUnlockedQuestions] = useState<string[]>([]);

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

  const totalAnsweredQuestions = () => {
    return predictions.length;
  }

  // Function to determine if max predictions reached for a difficulty level
  const isMaxPredictionsReached = (difficulty: IDifficultyLevel) => {
    const count = getAnsweredCountByDifficulty(difficulty);
    return count >= 3;
  };
  
  // Hardcoded stake amounts for each difficulty level
  const getStakeAmount = (difficulty: IDifficultyLevel) => {
    switch (difficulty) {
      case IDifficultyLevel.EASY: return 50;
      case IDifficultyLevel.MEDIUM: return 100;
      case IDifficultyLevel.HARD: return 200;
      default: return 100;
    }
  };
  
  // Function to handle unlocking a special question
  const handleUnlockQuestion = (questionId: string, difficulty: IDifficultyLevel) => {
    // Redirect to the stake tab
    router.push('/stake');
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
        acc[pred.question.id] = pred.prediction as unknown as IOutcome | null;
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
        const existingPrediction = predictions[existingPredictionIndex];
        await handleChangePrediction(existingPrediction.id, prediction, question.id);
      } else {
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
          prediction: prediction,
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
      
      setUserVotesMap((prev) => ({
        ...prev,
        [questionId]: prediction
      }));
      
      setPredictions((prev) => {
        return prev.map((p) => {
          if (p.id === predictionId) {
            return {
              ...p,
              prediction: prediction
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
    router.push({
      pathname: "/contest-detail/[id]",
      params: { id: contestId as string }
    });
  };

  // Sort questions to ensure special question is always in the middle (3rd position)
  const sortQuestionsWithSpecialInMiddle = (questions: IQuestion[]) => {
    if (questions.length <= 1) return questions;
    
    // Find special questions and regular questions
    const specialQuestions = questions.filter(q => q.specialQuestion);
    const regularQuestions = questions.filter(q => !q.specialQuestion);
    
    // If there are no special questions, return the original array
    if (specialQuestions.length === 0) return questions;
    
    // If there are multiple special questions, we'll place the first one in the middle
    const specialQuestion = specialQuestions[0];
    
    // Calculate the middle position (for 5 questions, it would be index 2, which is the 3rd position)
    const middlePosition = Math.floor(questions.length / 2);
    
    // Create a new array with regular questions
    const result = [...regularQuestions];
    
    // Insert the special question at the middle position
    result.splice(middlePosition, 0, specialQuestion);
    
    // If we have more special questions than we accounted for, append them at the end
    if (specialQuestions.length > 1) {
      result.push(...specialQuestions.slice(1));
    }
    
    // If we have too many questions (due to adding extras), trim to original length
    return result.slice(0, questions.length);
  };

  const currentQuestions = sortQuestionsWithSpecialInMiddle(questionsByDifficulty[selectedDifficulty] || []);
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
            <>
              {currentQuestions.map((q: IQuestion) => (
                <QuestionItem
                  key={q.id}
                  question={{
                    ...q,
                    // Replace question text with redacted format for locked special questions
                    question: (q.specialQuestion && !unlockedQuestions.includes(q.id)) 
                      ? q.question.replace(/[a-zA-Z0-9]/g, '█') 
                      : q.question
                  }}
                  onPrediction={(prediction: IOutcome) => handlePrediction(q, prediction)}
                  userVote={userVotesMap[q.id] || null}
                  onRemovePrediction={() => handleRemovePrediction(q.id)}
                  isLocked={q.specialQuestion && !unlockedQuestions.includes(q.id)}
                  onUnlock={() => handleUnlockQuestion(q.id, q.difficultyLevel)}
                  stakeAmount={q.specialQuestion ? `${getStakeAmount(q.difficultyLevel)} USDC` : undefined}
                />
              ))}
            </>
          ) : (
            <View style={styles.noQuestionsContainer}>
              <Text style={styles.noQuestionsText}>
                No questions available for {selectedDifficulty} level
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {(selectedDifficulty === IDifficultyLevel.EASY || 
        selectedDifficulty === IDifficultyLevel.MEDIUM) && 
        getAnsweredCountByDifficulty(selectedDifficulty) >= 3 && (
        <TouchableOpacity 
          style={styles.fixedActionButton}
          onPress={() => {
            const nextIndex = difficultyTabs.indexOf(selectedDifficulty) + 1;
            if (nextIndex < difficultyTabs.length) {
              setSelectedDifficulty(difficultyTabs[nextIndex]);
            }
          }}
        >
          <Text style={styles.actionButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      )}
      
      {selectedDifficulty === IDifficultyLevel.HARD && 
        getAnsweredCountByDifficulty(IDifficultyLevel.HARD) >= 3 && 
        totalAnsweredQuestions() === 9 && (
        <TouchableOpacity 
          style={[styles.fixedActionButton, styles.submitButton]}
          onPress={async () => {
            setPredictionMessage({
              text: "Successfully Submitted your predictions",
              type: IOutcome.YES
            });
            await apiClient(SUBMIT_PREDICTIONS, 'POST', {
              contestId: contestId as string,
            });
            setTimeout(() => {
              setPredictionMessage(null);
              router.push({
                pathname: "/contest-detail/[id]",
                params: { id: contestId as string }
              });
            }, 2000);
          }}
        >
          <Text style={styles.actionButtonText}>Submit</Text>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
        </TouchableOpacity>
      )}

      {predictionMessage && (
        <View
          style={[
            styles.predictionMessage,
            predictionMessage.type === IOutcome.YES ? styles.yesMessage : styles.noMessage
          ]}
        >
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
    fontSize: 16,
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
    paddingBottom: 120
  },
  teamSmallImage: {
    width: 30,
    height: 30,
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
  fixedActionButton: {
    position: 'absolute',
    bottom: 80, 
    right: 20,
    backgroundColor: '#3768E3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 20,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
  },
  
  lockText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  stakeAmount: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  unlockButton: {
    backgroundColor: '#3768E3',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  unlockButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
