import { Stack } from "expo-router"

export default function MentalWellnessLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack.Screen name="breathing" />
      <Stack.Screen name="body-scanning" />
      <Stack.Screen name="yoga" />
    </Stack>
  )
}

