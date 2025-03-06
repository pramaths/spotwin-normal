import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PredictionQuestionGrid from '../../components/PredictionQuestionGrid';
import HeaderProfile from '@/components/HeaderProfile';
import { IContest } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';

const mockQuestions = [
  {
    id: '1',
    question: 'Will there be a goal in next 5 minutes?',
    matchImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=500&auto=format&fit=crop',
    league: 'Premier League',
    teams: 'Manchester United vs Arsenal',
    timeRemaining: '4:30',
  },
  {
    id: '2',
    question: 'Will there be a goal in next 5 minutes?',
    matchImage: 'https://images.unsplash.com/photo-1590552515252-3a5a1bce7bed?q=80&w=500&auto=format&fit=crop',
    league: 'La Liga',
    teams: 'Real Madrid vs Barcelona',
    timeRemaining: '3:45',
  },
  {
    id: '3',
    question: 'Will there be a goal in next 5 minutes?',
    matchImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500&auto=format&fit=crop',
    league: 'Serie A',
    teams: 'Juventus vs AC Milan',
    timeRemaining: '2:15',
  },
];

const mockContests: IContest[] = [
  {
    id: "f984ea94-a07e-4bff-a802-1694f5125606",
    name: "Cricket World Cup",
    entryFee: 101,
    currency: "SOL",
    description: "A contest where two teams compete against each other in cricket",
    status: "OPEN",
    createdAt: "2025-03-05T10:32:19.895Z",
    updatedAt: "2025-03-05T10:32:19.895Z",
    event: {
      id: "077e38f3-6275-4c68-920f-3a7de8ba9bbf",
      title: "ICC MEN'S TROPHY",
      description: "ICC MENS TROPHY",
      eventImageUrl: "https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men's_Champions_Trophy.png",
      startDate: "2025-03-05T08:58:46.130Z",
      endDate: "2025-03-05T08:58:46.130Z",
      status: "OPEN",
      createdAt: "2025-03-05T09:04:41.701Z",
      updatedAt: "2025-03-05T09:27:20.389Z",
      sport: {
        id: "3dc44aff-9748-44fc-aa74-1379213a4363",
        name: "Cricket",
        description: "A team sport played with a ball",
        imageUrl: "https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg",
        isActive: true,
        createdAt: "2025-03-02T18:07:04.227Z",
        updatedAt: "2025-03-02T18:07:04.227Z"
      },
      teamA: {
        id: "4ec72fe7-263b-42e5-af1f-b0c26fed97a7",
        name: "INDIA",
        imageUrl: "https://s3.ap-south-1.amazonaws.com/sizzils3/2502a671-38ac-4ae0-a076-ad202300bfa1-india.png",
        country: "INDIA"
      },
      teamB: {
        id: "59217b82-77ae-4340-ba13-483bea11a7d6",
        name: "PAKISTAN",
        imageUrl: "https://s3.ap-south-1.amazonaws.com/sizzils3/f105ff41-e9aa-4d90-b551-2f9b488b0e5b-pak.png",
        country: "PAKISTAN"
      }
    }
  },
  {
    id: "f984ea94-a07e-4bff-a802-1694f5125604",
    name: "Premier League Showdown",
    entryFee: 100,
    currency: "SOL",
    description: "A contest for the Premier League match",
    status: "OPEN",
    createdAt: "2025-03-05T10:32:19.895Z",
    updatedAt: "2025-03-05T10:32:19.895Z",
    event: {
      id: "077e38f3-6275-4c68-920f-3a7de8ba9bbf",
      title: "Premier League",
      description: "Premier League Match",
      eventImageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=500&auto=format&fit=crop",
      startDate: "2025-03-05T08:58:46.130Z",
      endDate: "2025-03-05T08:58:46.130Z",
      status: "OPEN",
      createdAt: "2025-03-05T09:04:41.701Z",
      updatedAt: "2025-03-05T09:27:20.389Z",
      sport: {
        id: "3dc44aff-9748-44fc-aa74-1379213a4363",
        name: "Football",
        description: "A team sport played with a ball",
        imageUrl: "https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg",
        isActive: true,
        createdAt: "2025-03-02T18:07:04.227Z",
        updatedAt: "2025-03-02T18:07:04.227Z"
      },
      teamA: {
        id: "4ec72fe7-263b-42e5-af1f-b0c26fed97a7",
        name: "Manchester United",
        imageUrl: "https://s3.ap-south-1.amazonaws.com/sizzils3/2502a671-38ac-4ae0-a076-ad202300bfa1-man-utd.png",
        country: "England"
      },
      teamB: {
        id: "59217b82-77ae-4340-ba13-483bea11a7d6",
        name: "Arsenal",
        imageUrl: "https://s3.ap-south-1.amazonaws.com/sizzils3/f105ff41-e9aa-4d90-b551-2f9b488b0e5b-arsenal.png",
        country: "England"
      }
    }
  },
  {
    id: "f984ea94-a07e-4bff-a802-1694f5125605",
    name: "La Liga Classic",
    entryFee: 150,
    currency: "SOL",
    description: "A contest for the La Liga match",
    status: "OPEN",
    createdAt: "2025-03-05T10:32:19.895Z",
    updatedAt: "2025-03-05T10:32:19.895Z",
    event: {
      id: "077e38f3-6275-4c68-920f-3a7de8ba9bbc",
      title: "La Liga",
      description: "La Liga Match",
      eventImageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7485?q=80&w=500&auto=format&fit=crop",
      startDate: "2025-03-05T08:58:46.130Z",
      endDate: "2025-03-05T08:58:46.130Z",
      status: "OPEN",
      createdAt: "2025-03-05T09:04:41.701Z",
      updatedAt: "2025-03-05T09:27:20.389Z",
      sport: {
        id: "3dc44aff-9748-44fc-aa74-1379213a4364",
        name: "Football",
        description: "A team sport played with a ball",
        imageUrl: "https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg",
        isActive: true,
        createdAt: "2025-03-02T18:07:04.227Z",
        updatedAt: "2025-03-02T18:07:04.227Z"
      },
      teamA: {
        id: "4ec72fe7-263b-42e5-af1f-b0c26fed97a8",
        name: "Barcelona",
        imageUrl: "https://s3.ap-south-1.amazonaws.com/sizzils3/2502a671-38ac-4ae0-a076-ad202300bfa1-barca.png",
        country: "Spain"
      },
      teamB: {
        id: "59217b82-77ae-4340-ba13-483bea11a7d7",
        name: "Real Madrid",
        imageUrl: "https://s3.ap-south-1.amazonaws.com/sizzils3/f105ff41-e9aa-4d90-b551-2f9b488b0e5b-real.png",
        country: "Spain"
      }
    }
  }
];

const QuestionsScreen = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedContest, setSelectedContest] = useState<IContest | null>(null);
  const [questions, setQuestions] = useState(mockQuestions);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);

  const handleAnswer = (id: string, answer: 'YES' | 'NO') => {
    console.log(`Question ${id} answered with: ${answer}`);
    setAnsweredQuestions([...answeredQuestions, id]);
    setTimeout(() => {
      setQuestions(questions.filter(q => q.id !== id));
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderProfile />
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <FlatList
            data={mockContests}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.contestList}
            renderItem={({ item }) => {
              const { formattedTime, formattedDate } = formatDateTime(item.event.startDate);
              return (
                <TouchableOpacity 
                  style={styles.contestItem} 
                  onPress={() => {
                    setSelectedContest(item);
                    setPaymentModalVisible(true);
                  }}
                >
                  <View style={styles.teamsContainer}>
                    <View style={styles.teamSection}>
                      <Image 
                        source={{uri: item.event.teamA.imageUrl}} 
                        style={styles.teamLogo} 
                        resizeMode="contain"
                      />
                      <Text style={styles.teamName} numberOfLines={1}>{item.event.teamA.name}</Text>
                    </View>
                    
                    <Text style={styles.vsText}>VS</Text>
                    
                    <View style={styles.teamSection}>
                      <Image 
                        source={{uri: item.event.teamB.imageUrl}} 
                        style={styles.teamLogo}
                        resizeMode="contain"
                      />
                      <Text style={styles.teamName} numberOfLines={1}>{item.event.teamB.name}</Text>
                    </View>
                  </View>

                  <View style={styles.contestInfo}>
                    <Text style={styles.contestTitle}>{item.event.title}</Text>
                    <Text style={styles.contestName}>{item.name}</Text>
                    <Text style={styles.contestTime}>{formattedTime} • {formattedDate}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <PredictionQuestionGrid
            questions={questions}
            onAnswer={handleAnswer}
            contests={mockContests}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  contestList: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  contestItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 8,
  },
  contestInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  contestTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  contestName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  contestTime: {
    fontSize: 12,
    color: '#666',
  },
});

export default QuestionsScreen;