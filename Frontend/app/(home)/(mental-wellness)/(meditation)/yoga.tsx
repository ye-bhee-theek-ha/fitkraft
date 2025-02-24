"use client"

import { View, Text, ScrollView } from "react-native"
import { yogaPoses } from "@/constants/sampledata"
import { LinearGradient } from "expo-linear-gradient"
import { TouchableOpacity } from "react-native-gesture-handler"
import { FontAwesome6 } from "@expo/vector-icons"

const YogaScreen = () => {
  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="text-white text-2xl font-bold mb-4">Yoga</Text>
        <Text className="text-white text-xl font-semibold mb-4">Guided Yoga Exercises</Text>
        <View className="space-y-4">
          {yogaPoses.map((pose, index) => (
            <TouchableOpacity key={index} className="bg-primary_dark rounded-xl overflow-hidden">
              <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0)"]} className="p-4">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white text-lg font-semibold">{pose.name}</Text>
                    <Text className="text-gray-400 text-sm">{pose.description}</Text>
                  </View>
                  <TouchableOpacity className="bg-accent/20 rounded-full p-2">
                    <FontAwesome6 name="play-circle" size={24} color="#FFC1A1" /> 
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default YogaScreen

