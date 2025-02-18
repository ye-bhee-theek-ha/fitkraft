import { MaterialIcons } from "@expo/vector-icons"
import type React from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"

interface MealPlanGeneratorProps {
  onGenerate: () => void
  videoCount: number
}

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({ onGenerate, videoCount }) => {
  return (
    <TouchableOpacity
      onPress={onGenerate}
      className="bg-primary_dark/50 rounded-3xl p-6 flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1">
        <Image
          source={{
            uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dietary-JRkb8oEQ9gFRKVFNpuO0KMpMxUyLnu.png",
          }}
          className="w-20 h-20 rounded-full"
          resizeMode="cover"
        />
        <View className="ml-4 flex-1">
          <Text className="text-white text-2xl font-semibold">Generate</Text>
          <Text className="text-white text-2xl font-semibold">Meal Plan</Text>
          <View className="h-0.5 bg-white/20 w-full mt-2" />
          <Text className="text-gray-400 mt-2">{videoCount} Videos</Text>
        </View>
      </View>
      <View className="bg-green w-12 h-12 rounded-full items-center justify-center">
        <MaterialIcons name="keyboard-double-arrow-right" size={24} color="white" />
      </View>
    </TouchableOpacity>
  )
}

export default MealPlanGenerator

