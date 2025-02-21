"use client"

import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

const MentalWellnessScreen = () => {
  const menuItems = [
    {
      title: "Meditation",
      description: "Techniques, Benefits, and\na Beginner's How-To",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MentalWellness-qYrm9ovQpTYeaxIR5ITAEb1pMfQucM.png",
      route: "/mental-wellness/meditation",
    },
    {
      title: "Music",
      description: "Techniques, Benefits, and\na Beginner's How-To",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Music-SNs86URZVV5SD5MEZxXgm7CuZghkWc.png",
      route: "/mental-wellness/music",
    },
    {
      title: "Sleep",
      description: "Techniques, Benefits, and\na Beginner's How-To",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sleep-SIUcRPqY5UN2jH71CYG2V0VQAWv4ub.png",
      route: "/mental-wellness/sleep",
    },
  ]

  return (
    <ScrollView className="flex-1">
      <View className="p-4 space-y-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-primary_dark/50 rounded-3xl overflow-hidden"
            onPress={() => router.push(item.route)}
            style={{ elevation: 3 }}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="p-6">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="text-white text-3xl font-bold mb-2">{item.title}</Text>
                    <Text className="text-gray-400 text-base">{item.description}</Text>
                  </View>
                  <View className="w-32 h-32 justify-center items-center">
                    <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="contain" />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

export default MentalWellnessScreen

