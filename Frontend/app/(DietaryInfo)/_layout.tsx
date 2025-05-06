// app/(dietaryInfo)/_layout.tsx

import React from 'react';
import { Stack } from 'expo-router';

export default function DietaryInfo() {
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
    </Stack>
  );
}

