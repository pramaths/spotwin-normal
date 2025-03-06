import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import HomeIcon from '../../assets/icons/home.svg';
import CupIcon from '../../assets/icons/cup.svg';
import QuestionIcon from '../../assets/icons/question.svg';
import FeedIcon from '../../assets/icons/feed.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + (Platform.OS === 'ios' ? insets.bottom : 0),
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
        },
        tabBarActiveTintColor: '#17163B',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ }) => <HomeIcon />,
        }}
      />
      <Tabs.Screen
        name="contests"
        options={{
          title: 'My Contests',
          tabBarIcon: ({ }) => <CupIcon />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Live Feed',
          tabBarIcon: ( ) => <FeedIcon />,
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: 'My Questions',
          tabBarIcon: () => <QuestionIcon />,
        }}
      />
      <Tabs.Screen
        name="contribute"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1A1A3A',
    borderTopWidth: 0,
    paddingTop: 5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});
