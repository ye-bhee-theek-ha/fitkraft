import React from 'react';
import { Stack } from 'expo-router';

export default function NotificationsLayout() {
  return (
    <Stack
      initialRouteName='notifications'
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: {
          backgroundColor: '#212835',
        },
      }}
    >
      <Stack.Screen name="notifications" />
    </Stack>
  );
}

