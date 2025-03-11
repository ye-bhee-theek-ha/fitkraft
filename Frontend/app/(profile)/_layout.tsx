// app/(profile)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      initialRouteName='index'
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: {
          backgroundColor: '#212835',
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="badges" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="foodPlan" />
      <Stack.Screen name="workoutPlan" />
    </Stack>
  );
}

