import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PredictionQuestionGrid from '../../components/PredictionQuestionGrid';
import HeaderProfile from '@/components/HeaderProfile';
import { IContest } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { fetchContests, fetchContestVideos, IContestVideo } from '@/services/contestApi';

const FeedsScreen = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedContest, setSelectedContest] = useState<IContest | null>(null);
  const [contests, setContests] = useState<IContest[]>([]);
  const [contestVideos, setContestVideos] = useState<IContestVideo[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

  useEffect(() => {
    const loadContests = async () => {
      try {
        const contestsData = await fetchContests();
        setContests(contestsData);
        
        // Select the first contest by default
        if (contestsData.length > 0) {
          setSelectedContest(contestsData[0]);
        }
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };
    
    loadContests();
  }, []);

  // Fetch videos for the selected contest
  useEffect(() => {
    const loadContestVideos = async () => {
      if (selectedContest) {
        setIsLoading(true);
        try {
          const videos = await fetchContestVideos(selectedContest.id);
          
          // Transform contest videos to match the expected question format
          const formattedQuestions = videos.map(video => ({
            id: video.id,
            question: video.question,
            matchImage: video.thumbnailUrl,
            league: selectedContest.event.title,
            teams: `${selectedContest.event.teamA.name} vs ${selectedContest.event.teamB.name}`,
            timeRemaining: '5:00', // Default time remaining
            videoUrl: video.videoUrl,
            contestId: video.contestId
          }));
          
          setContestVideos(formattedQuestions);
        } catch (error) {
          console.error('Error fetching contest videos:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadContestVideos();
  }, [selectedContest]);

  const handleAnswer = (id: string, answer: 'YES' | 'NO') => {
    console.log(`Question ${id} answered with: ${answer}`);
    setAnsweredQuestions([...answeredQuestions, id]);
    setTimeout(() => {
      setContestVideos(contestVideos.filter(q => q.id !== id));
    }, 500);
  };

  const handleContestSelect = (contest: IContest) => {
    setSelectedContest(contest);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderProfile />
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <FlatList
            data={contests}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.contestList}
            style={{flexGrow: 0}}
            renderItem={({ item }) => {
              const { formattedTime, formattedDate } = formatDateTime(item.event.startDate);
              return (
                <TouchableOpacity 
                  style={[
                    styles.contestItem,
                    selectedContest?.id === item.id && styles.selectedContestItem
                  ]} 
                  onPress={() => handleContestSelect(item)}
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
                    <Text style={styles.contestName}>{item.event.title}</Text>
                    <Text style={styles.contestTime}>{formattedTime} • {formattedDate}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <ScrollView 
            style={styles.predictionScrollView}
            contentContainerStyle={{ 
              paddingBottom: tabBarHeight + 16 // Add padding to the bottom to avoid tab bar overlap
            }}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading predictions...</Text>
              </View>
            ) : contestVideos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No predictions available for this contest</Text>
              </View>
            ) : (
              <PredictionQuestionGrid
                questions={contestVideos}
                onAnswer={handleAnswer}
                contests={contests}
              />
            )}
          </ScrollView>
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
  predictionScrollView: {
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
    width: 280,
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
    color: '#212b90',
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
  selectedContestItem: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default FeedsScreen;