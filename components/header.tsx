
import type React from "react"
import { View, Text, Pressable, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type Section = "Workout" | "Dietary" | "Mental Wellness" | "home";

interface HeaderProps {
  username: string
  currentSection: Section
  onSectionChange: (section: Section) => void
  onSearchPress: () => void
  onNotificationPress: () => void
  onProfilePress: () => void
}

const Header: React.FC<HeaderProps> = ({
  username,
  currentSection,
  onSectionChange,
  onSearchPress,
  onNotificationPress,
  onProfilePress,
}) => {
  const sections: Section[] = ["Workout", "Dietary", "Mental Wellness"]

  const renderNavButton = (section: Section) => {
    const isActive = currentSection === section
    return (
      <Pressable
        onPress={() => onSectionChange(section)}
        className={`px-3 py-2 rounded-full border border-white/75 shadow-lg ${isActive ? "bg-white" : "bg-white/10"}`}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <Text className={`text-small ${isActive ? "text-[#1c2632] font-semibold" : "text-white"}`}>{section}</Text>
      </Pressable>
    )
  }

  return (
    <SafeAreaView className="mt-12 px-6 pb-6">
      {/* Header Content */}
      <View className="flex-row justify-between items-start mb-6">
        <View className="">
          <Text className="text-white text-hero font-bold mb-1">Hi, {username}</Text>
          <Text className="text-gray-400">It's time to challenge your limits.</Text>
        </View>

        <View className="flex-row mt-2 items-center space-x-4">
          <Pressable
            onPress={onSearchPress}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="search" size={24} color="white" />
          </Pressable>

          <Pressable
            onPress={onNotificationPress}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="notifications" size={24} color="white" />
          </Pressable>

          <Pressable
            onPress={onProfilePress}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="person-circle" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View className="flex-row flex w-full justify-between">
        {sections.map((section) => (
          <View key={section}>{renderNavButton(section)}</View>
        ))}
      </View>
    </SafeAreaView>
  )
}

export default Header

