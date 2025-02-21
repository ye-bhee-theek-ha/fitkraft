import type React from "react"
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"

interface MealPlanGeneratorProps {
  onGenerate: () => void

}

const { width } = Dimensions.get("window")

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({ onGenerate }) => {
  return (
    <TouchableOpacity onPress={onGenerate} activeOpacity={0.9} className="border-2 border-white/25 rounded-3xl">
      <LinearGradient
        colors={["#2A3445", "#1E2532"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl p-6 shadow-lg"
        style={{ elevation: 5 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-white text-3xl font-bold mb-2">Generate Meal Plan</Text>
            <Text className="text-gray-400 text-base mb-4">Personalized nutrition, just for you</Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="restaurant-outline" size={18} color="#FFC1A1" />
              {/* <Text className="text-white ml-2">{mealCount} meals per day</Text> */}
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="flame-outline" size={18} color="#FFC1A1" />
              {/* <Text className="text-white ml-2">{calorieRange} calories</Text> */}
            </View>
            <View className="flex-row items-center">
              <Ionicons name="videocam-outline" size={18} color="#FFC1A1" />
              {/* <Text className="text-white ml-2">{videoCount} recipe videos</Text> */}
            </View>
          </View>
          <Image
            source={{
              uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dietary-JRkb8oEQ9gFRKVFNpuO0KMpMxUyLnu.png",
            }}
            style={{ width: width * 0.25, height: width * 0.25 }}
            className="rounded-2xl"
            resizeMode="cover"
          />
        </View>
        <TouchableOpacity
          onPress={onGenerate}
          className="bg-accent mt-4 py-3 rounded-full flex-row items-center justify-center"
        >
          <Text className="text-primary font-bold text-lg mr-2">Generate Now</Text>
          <MaterialIcons name="keyboard-double-arrow-right" size={24} color="#2A3445" />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export default MealPlanGenerator

