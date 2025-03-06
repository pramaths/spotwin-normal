import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeIcon from '../../assets/icons/home.svg';
import CupIcon from '../../assets/icons/cup.svg';
import QuestionIcon from '../../assets/icons/question.svg';
import FeedIcon from '../../assets/icons/feed.svg';

import WhiteHome from '../../assets/icons/whitehome.svg';
import WhiteCup from '../../assets/icons/whitecup.svg';
import WhiteFeed from '../../assets/icons/whitefeed.svg';
import WhiteQuestion from '../../assets/icons/whitequestion.svg';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + (Platform.OS === 'ios' ? insets.bottom : 0),
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 5,
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: '#FFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => focused ? <WhiteHome /> : <HomeIcon />,
        }}
      />
      <Tabs.Screen
        name="contests"
        options={{
          title: 'Contests',
          tabBarIcon: ({ focused }) => focused ? <WhiteCup /> : <CupIcon />,
        }}
      />
      <Tabs.Screen
        name="feeds"
        options={{
          title: 'Feeds',
          tabBarIcon: ({ focused }) => focused ? <WhiteFeed /> : <FeedIcon />,
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: 'Questions',
          tabBarIcon: ({ focused }) => focused ? <WhiteQuestion /> : <QuestionIcon />,
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
