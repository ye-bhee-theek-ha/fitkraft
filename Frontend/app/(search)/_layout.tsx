import React from 'react';
import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack
      initialRouteName='search'
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: {
          backgroundColor: '#212835',
        },
      }}
    >
      <Stack.Screen name="search" />
    </Stack>
  );
}

