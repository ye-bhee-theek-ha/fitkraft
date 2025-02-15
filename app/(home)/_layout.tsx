"use client"

import { useCallback } from "react"
import { Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import Header from "@/components/header"
import { memo } from "react"

const MemoizedHeader = memo(function MemoizedHeader() {
  const handleSectionChange = useCallback((section: string) => {
    // Handle section changes
  }, [])

  const handleSearchPress = useCallback(() => {
    console.log("Search pressed")
  }, [])

  const handleNotificationPress = useCallback(() => {
    console.log("Notifications pressed")
  }, [])

  const handleProfilePress = useCallback(() => {
    console.log("Profile pressed")
  }, [])

  return (
    <Header
      username="GD"
      currentSection="Home"
      onSectionChange={handleSectionChange}
      onSearchPress={handleSearchPress}
      onNotificationPress={handleNotificationPress}
      onProfilePress={handleProfilePress}
    />
  )
})

export default function HomeLayout() {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <MemoizedHeader />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Stack.Screen name="home" />
        <Stack.Screen
          name="workout"
          options={{
            animation: "slide_from_right",
            animationDuration: 200,
          }}
        />
      </Stack>
    </SafeAreaView>
  )
}

