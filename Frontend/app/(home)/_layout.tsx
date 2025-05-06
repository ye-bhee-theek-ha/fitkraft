// app/(home)/_layout.tsx

import { useCallback, useEffect, useState } from "react"
import { router, Stack, usePathname } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import Header from "@/components/header"
import { memo } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Section } from "@/constants/types"
import { MusicPlayerProvider } from "@/context/MusicPlayer"
import MusicPlayerUI from "@/components/mental-wellness/MusicPlayer"

const MemoizedHeader = memo(function MemoizedHeader() {
  const [currentSection, setCurrentSection] = useState<Section>("Home")
  const pathname = usePathname()

  // Map pathnames to section names
  const sectionMap: { [key: string]: Section } = {
    "/home": "Home",
    "/workout": "Workout",
    "/dietary": "Dietary",
    "/mental-wellness": "Mental Wellness",
  }

  // Update the current section based on the pathname
  useEffect(() => {
    if (sectionMap[pathname]) {
      setCurrentSection(sectionMap[pathname])
    }
  }, [pathname, sectionMap])


  // Use a functional update to avoid stale state issues
  const handleSectionChange = useCallback((section: Section) => {
    setCurrentSection((prevSection) => {
    console.log(section, prevSection)
      if (prevSection === section) {
        router.dismissAll()
        return "Home"
      } else {
        if (router.canGoBack()) {
          router.back()
        }
        if (section === "Dietary") {
          router.push("/(home)/dietary")
        } else if (section === "Mental Wellness") {
          router.push("/(home)/(mental-wellness)")
        } else {
          router.push("/(home)/workout")
        }
        return section
      }
    })
  }, [])

  const handleSearchPress = useCallback(() => {
    router.push("/(search)")
  }, [])

  const handleNotificationPress = useCallback(() => {
    router.push("/(notifications)")
  }, [])

  const handleProfilePress = useCallback(() => {
    router.push("/(profile)")
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

MemoizedHeader.displayName = "MemoizedHeader"

export default function HomeLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-primary">
        <MusicPlayerProvider>
          <MemoizedHeader />
          <MusicPlayerUI />
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
            <Stack.Screen 
              name="home" 
            />
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
              name="(mental-wellness)"
              options={{
                animation: "slide_from_right",
                animationDuration: 200,
              }}
            />
          </Stack>
          
        </MusicPlayerProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}
