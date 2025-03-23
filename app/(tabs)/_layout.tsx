import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { useAuthStore } from '../../store/authstore';
import { User2 } from 'lucide-react-native';

import HomeIcon from '../../assets/icons/home.svg';
import CupIcon from '../../assets/icons/cup.svg';
import QuestionIcon from '../../assets/icons/question.svg';
import FeedIcon from '../../assets/icons/feed.svg';

import WhiteHome from '../../assets/icons/whitehome.svg';
import WhiteCup from '../../assets/icons/whitecup.svg';
import WhiteFeed from '../../assets/icons/whitefeed.svg';
import FullScreenLoader from '../../components/FullScreenLoader';
import ErrorScreen from '../../components/ErrorScreen';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 40 + (Platform.OS === 'ios' ? insets.bottom : 20);

  return (
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                ...styles.tabBar,
                height: tabBarHeight,
                paddingBottom: Platform.OS === 'ios' ? insets.bottom : 5,
                backgroundColor: '#1A1A3A',
                borderTopWidth: 0,
                position: 'absolute',
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
              name="profile"
              options={{
                title: 'Profile',
                tabBarIcon: ({ focused }) => focused ? <User2 color="#FFF" /> : <User2 color="rgba(255, 255, 255, 0.6)" />,
              }}
            />
            <Tabs.Screen
              name="prediction"
              options={{
                href: null,
              }}
            />
          </Tabs>
        </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1A1A3A',
    borderTopWidth: 0,
    paddingTop: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});
