"use client"

import { View, Text, Image, ScrollView } from "react-native"
import { sleepContent } from "@/constants/sampledata"
import { LinearGradient } from "expo-linear-gradient"
import { TouchableOpacity } from "react-native-gesture-handler"
import { FontAwesome6 } from "@expo/vector-icons"

const SleepScreen = () => {
  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="text-white text-2xl font-bold mb-4">Sleep</Text>
        <View className="space-y-4">
          {sleepContent.map((item, index) => (
            <TouchableOpacity key={index} className="bg-primary_dark rounded-xl overflow-hidden">
              <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0)"]} className="p-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-white text-xl font-semibold mb-1">{item.title}</Text>
                    <Text className="text-gray-400 text-sm">{item.description}</Text>
                    <View className="flex-row items-center mt-2">
                      <Text className="text-accent text-sm mr-2">Play now</Text>
                        <FontAwesome6 name="play-circle" size={24} color="#FFC1A1" /> 
                      </View>
                  </View>
                  {item.image && <Image source={{ uri: item.image }} className="w-20 h-20" resizeMode="contain" />}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default SleepScreen

