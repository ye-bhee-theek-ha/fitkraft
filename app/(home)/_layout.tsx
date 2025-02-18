"use client"

import { useCallback, useEffect, useState } from "react"
import { router, Stack, usePathname } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import Header from "@/components/header"
import { memo } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Section } from "@/constants/types"

const MemoizedHeader = memo(function MemoizedHeader() {

  const [currentSection, setCurrentSection] = useState<Section>("Home")
  const pathname = usePathname()


  const handleSectionChange = useCallback((section: Section) => {
    if (currentSection === section) {
      setCurrentSection("Home");
      router.dismissAll()
    }
    else {
      setCurrentSection(section);

      router.canGoBack() && router.back()

      section === "Dietary" ? router.push("/(home)/dietary") :
      section === "Mental Wellness" ? router.push("/(home)/mentalWellness"):
      router.push("/(home)/workout")
    }
  }, [])

  useEffect(() => {
    // Update the current section based on the pathname
    if (pathname === "/home") {
      setCurrentSection("Home")
    } else if (pathname === "/workout") {
      setCurrentSection("Workout")
    } else if (pathname === "/dietary") {
      setCurrentSection("Dietary")
    } else if (pathname === "/mental-wellness") {
      setCurrentSection("Mental Wellness")
    }
  }, [pathname])


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
      currentSection={currentSection}
      onSectionChange={handleSectionChange}
      onSearchPress={handleSearchPress}
      onNotificationPress={handleNotificationPress}
      onProfilePress={handleProfilePress}
    />
  )
})

export default function HomeLayout() {
  return (
    <GestureHandlerRootView>
      <SafeAreaView className="flex-1 bg-primary">
        <MemoizedHeader />
        <Stack
          initialRouteName="home"
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
          <Stack.Screen
            name="dietary"
            options={{
              animation: "slide_from_right",
              animationDuration: 200,
            }}
          />
          <Stack.Screen
            name="mentalWellness"
            options={{
              animation: "slide_from_right",
              animationDuration: 200,
            }}
          />
        </Stack>
      </SafeAreaView>
    </GestureHandlerRootView>

  )
}

