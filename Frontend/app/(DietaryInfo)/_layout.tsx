import React from 'react';
import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack
      initialRouteName='dietary'
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: {
          backgroundColor: '#212835',
        },
      }}
    >
      <Stack.Screen name="dietary" />
    </Stack>
  );
}

