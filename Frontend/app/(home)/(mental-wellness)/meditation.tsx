"use client"

import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { FontAwesome6 } from "@expo/vector-icons"

const MeditationScreen = () => {
  const meditationOptions = [
    {
      title: "Breathing Exercises",
      description: "Techniques, Benefits, and a Beginner's How-To",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Breathing-49QjxEMwHq0IRu3tvGKMO9kM6nhHQV.png",
      route: "/mental-wellness/breathing",
    },
    {
      title: "Body Scanning",
      description: "Techniques, Benefits, and a Beginner's How-To",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BodyScan-fMLjM6lbnn6QUVkxz2C3xBGwVhYrEo.png",
      route: "/mental-wellness/body-scanning",
    },
    {
      title: "Yoga",
      description: "Techniques, Benefits, and a Beginner's How-To",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Yoga-j7fWea9kIGDQPoqW1CpoZ7MZaaVo07.png",
      route: "/mental-wellness/yoga",
    },
  ]

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="text-white text-2xl font-bold mb-4">Meditation</Text>
        <View className="space-y-4">
          {meditationOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              className="bg-primary_dark rounded-xl overflow-hidden"
              onPress={() => router.push(option.route)}
            >
              <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0)"]} className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-white text-xl font-semibold mb-1">{option.title}</Text>
                    <Text className="text-gray-400 text-sm">{option.description}</Text>
                    <View className="flex-row items-center mt-2">
                      <Text className="text-accent text-sm mr-2">watch now</Text>
                        <FontAwesome6 name="play-circle" size={24} color="#FFC1A1" /> 
                    </View>
                  </View>
                  <Image source={{ uri: option.image }} className="w-20 h-20" resizeMode="contain" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default MeditationScreen

