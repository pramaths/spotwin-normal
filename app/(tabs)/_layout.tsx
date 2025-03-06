import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 5 : 5,
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
          tabBarIcon: ({ }) => <Image source={require('../../assets/icons/home.svg')} />,
        }}
      />
      <Tabs.Screen
        name="contests"
        options={{
          title: 'My Contests',
          tabBarIcon: ({ }) => <Image source={require('../../assets/icons/cup.svg')} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Live Feed',
          tabBarIcon: ( ) => <Image source={require('../../assets/icons/feed.svg')} />,
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: 'My Questions',
          tabBarIcon: () => <Image source={require('../../assets/icons/question.svg')} />,
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
    height: 60,
    paddingTop: 5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});
