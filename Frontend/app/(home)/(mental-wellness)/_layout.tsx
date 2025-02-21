import { Stack } from "expo-router"

export default function MentalWellnessLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="meditation" />
      <Stack.Screen name="breathing" />
      <Stack.Screen name="body-scanning" />
      <Stack.Screen name="yoga" />
      <Stack.Screen name="music" />
      <Stack.Screen name="sleep" />
    </Stack>
  )
}

