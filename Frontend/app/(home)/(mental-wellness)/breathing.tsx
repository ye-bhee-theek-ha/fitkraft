"use client"

import { View, Text, Image } from "react-native"
import { breathingExercises } from "@/constants/sampledata"
import { LinearGradient } from "expo-linear-gradient"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useState, useEffect } from "react"
import { FontAwesome6 } from "@expo/vector-icons"

const BreathingScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-white text-2xl font-bold mb-4">Breathing Exercise</Text>
      <View className="bg-primary_dark rounded-3xl overflow-hidden">
        <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0)"]} className="p-6">
          <View className="items-center">
            <Text className="text-white text-xl font-semibold mb-4">Guided Breathing Exercise</Text>
            <Image source={{ uri: breathingExercises[0].image }} className="w-48 h-48 mb-6" resizeMode="contain" />
            <Text className="text-white text-3xl font-bold mb-6">{formatTime(timeRemaining)}</Text>
            <TouchableOpacity
              onPress={togglePlay}
              className="bg-accent w-16 h-16 rounded-full items-center justify-center"
            >
              {isPlaying ? <FontAwesome6 name="pause-circle" size={24} color="#FFC1A1" /> : <FontAwesome6 name="play-circle" size={24} color="#FFC1A1" />}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  )
}

export default BreathingScreen

