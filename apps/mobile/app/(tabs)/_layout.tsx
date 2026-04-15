import React from 'react';
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors } from '../../src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({ name, color }: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={19} name={name} color={color} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryLight,
        tabBarInactiveTintColor: Colors.textFaint,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom + 2,
          paddingTop: 5,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <TabIcon name="folder-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="issues"
        options={{
          title: 'All Work',
          tabBarIcon: ({ color }) => <TabIcon name="check-square-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Dashboards',
          tabBarIcon: ({ color }) => <TabIcon name="th-large" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <TabIcon name="bell-o" color={color} />,
        }}
      />
    </Tabs>
  );
}
