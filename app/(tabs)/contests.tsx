import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import HeaderProfile from '../../components/HeaderProfile';
import { UserContestCard } from '../../components/UserContest';
import { IContest} from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Define types and interfaces
export type ContestStatus = 'LIVE' | 'OPEN' | 'COMPLETED' | 'UPCOMING';

const activeContests: IContest[] = [
  {
    "id": "f984ea94-a07e-4bff-a802-1694f5125604",
    "name": "Basketball Shootout",
    "entryFee": 0.2,
    "currency": "SOL",
    "description": "A contest where two teams compete against each other in basketball",
    "status": "OPEN",
    "createdAt": "2025-03-05T10:32:19.895Z",
    "updatedAt": "2025-03-05T10:32:19.895Z",
    "event": {
      "id": "077e38f3-6275-4c68-920f-3a7de8ba9bbf",
      "title": "ICC MEN'S TROPHY",
      "description": "ICC MENS TROPHY",
      "eventImageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men's_Champions_Trophy.png",
      "startDate": "2025-03-05T08:58:46.130Z",
      "endDate": "2025-03-05T08:58:46.130Z",
      "status": "OPEN",
      "createdAt": "2025-03-05T09:04:41.701Z",
      "updatedAt": "2025-03-05T09:27:20.389Z",
      "sport": {
        "id": "3dc44aff-9748-44fc-aa74-1379213a4363",
        "name": "Cricket",
        "description": "A team sport played with a ball",
        "imageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg",
        "isActive": true,
        "createdAt": "2025-03-02T18:07:04.227Z",
        "updatedAt": "2025-03-02T18:07:04.227Z"
      },
      "teamA": {
        "id": "4ec72fe7-263b-42e5-af1f-b0c26fed97a7",
        "name": "INDIA",
        "imageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/2502a671-38ac-4ae0-a076-ad202300bfa1-india.png",
        "country": "INDIA"
      },
      "teamB": {
        "id": "59217b82-77ae-4340-ba13-483bea11a7d6",
        "name": "PAKISTAN",
        "imageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/f105ff41-e9aa-4d90-b551-2f9b488b0e5b-pak.png",
        "country": "PAKISTAN"
      }
    }
  },
]

const completedContests: IContest[] = [
  {
    "id": "a984ea94-a07e-4bff-a802-1694f5125605",
    "name": "Cricket Final",
    "entryFee": 0.5,
    "currency": "SOL",
    "description": "The final match of the cricket tournament",
    "status": "COMPLETED",
    "createdAt": "2025-02-15T10:32:19.895Z",
    "updatedAt": "2025-03-01T10:32:19.895Z",
    "event": {
      "id": "077e38f3-6275-4c68-920f-3a7de8ba9bbc",
      "title": "T20 WORLD CUP",
      "description": "T20 WORLD CUP FINAL",
      "eventImageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/5829da6d-3660-43b2-a6df-2d2e775a29b3-Men's_Champions_Trophy.png",
      "startDate": "2025-02-15T08:58:46.130Z",
      "endDate": "2025-03-01T08:58:46.130Z",
      "status": "COMPLETED",
      "createdAt": "2025-02-15T09:04:41.701Z",
      "updatedAt": "2025-03-01T09:27:20.389Z",
      "sport": {
        "id": "3dc44aff-9748-44fc-aa74-1379213a4363",
        "name": "Cricket",
        "description": "A team sport played with a ball",
        "imageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/e2b67264-426b-4499-9b7c-266f1556f38b-5492.jpg",
        "isActive": true,
        "createdAt": "2025-03-02T18:07:04.227Z",
        "updatedAt": "2025-03-02T18:07:04.227Z"
      },
      "teamA": {
        "id": "4ec72fe7-263b-42e5-af1f-b0c26fed97a7",
        "name": "INDIA",
        "imageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/2502a671-38ac-4ae0-a076-ad202300bfa1-india.png",
        "country": "INDIA"
      },
      "teamB": {
        "id": "59217b82-77ae-4340-ba13-483bea11a7d6",
        "name": "AUSTRALIA",
        "imageUrl": "https://s3.ap-south-1.amazonaws.com/sizzils3/f105ff41-e9aa-4d90-b551-2f9b488b0e5b-aus.png",
        "country": "AUSTRALIA"
      }
    }
  },
]

type TabOption = 'ACTIVE' | 'COMPLETED';

export default function ContestsScreen() {
  const [selectedTab, setSelectedTab] = useState<TabOption>('ACTIVE');
  const insets = useSafeAreaInsets();
  
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

  const handleTabPress = (tab: TabOption) => {
    setSelectedTab(tab);
  }

  const getContests = () => {
    return selectedTab === 'ACTIVE' ? activeContests : completedContests;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <HeaderProfile />
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, selectedTab === 'ACTIVE' && styles.activeTab]}
            onPress={() => handleTabPress('ACTIVE')}
          >
            <Text 
              style={[styles.tabText, selectedTab === 'ACTIVE' && styles.activeTabText]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, selectedTab === 'COMPLETED' && styles.activeTab]}
            onPress={() => handleTabPress('COMPLETED')}
          >
            <Text 
              style={[styles.tabText, selectedTab === 'COMPLETED' && styles.activeTabText]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={getContests()}
          renderItem={({ item }) => <UserContestCard contest={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: tabBarHeight + 16 } // Add padding to the bottom to avoid tab bar overlap
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#3B3B6D',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#FFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});