"use client"

import { useEffect } from "react"
import { View, Text, BackHandler, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { ScrollView } from "react-native-gesture-handler"

interface WorkoutTask {
  id: string
  name: string
  duration: string
  repetitions: string
  completed?: boolean
}

interface DayProgress {
  date: number
  day: string
  current?: boolean
}

const todayTasks: WorkoutTask[] = [
  {
    id: "1",
    name: "Dumbbell Rows",
    duration: "00:30",
    repetitions: "Repetition 3x",
  },
  {
    id: "2",
    name: "Russian Twists",
    duration: "00:15",
    repetitions: "Repetition 2x",
    completed: true,
  },
  {
    id: "3",
    name: "Squats",
    duration: "00:15",
    repetitions: "Repetition 2x",
  },
]

const weekProgress: DayProgress[] = [
  { date: 19, day: "MON", current: true },
  { date: 18, day: "TUE" },
  { date: 17, day: "WED" },
  { date: 16, day: "THU" },
  { date: 15, day: "FRI" },
  { date: 14, day: "SAT" },
  { date: 13, day: "SUN" },
]

const progressTasks: WorkoutTask[] = [
  {
    id: "1",
    name: "Dumbbell Rows",
    duration: "00:30",
    repetitions: "Repetition 3x",
    completed: true,
  },
  {
    id: "2",
    name: "Dumbbell Rows",
    duration: "00:30",
    repetitions: "Repetition 3x",
    completed: true,
  },
  {
    id: "3",
    name: "Dumbbell Rows",
    duration: "00:30",
    repetitions: "Repetition 3x",
    completed: true,
  },
]

export default function WorkoutScreen() {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.push("/(home)/home")
      return true
    })

    return () => backHandler.remove()
  }, [])

  return (
    <ScrollView className="flex-1">
      <View className="px-6">
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-4">Tasks Today</Text>
          <View className="space-y-3">
            {todayTasks.map((task) => (
              <View key={task.id} className="bg-primary_dark/50 rounded-2xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <TouchableOpacity
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      task.completed ? "bg-green" : "bg-primary_light"
                    }`}
                  >
                    {/* {task.completed ? <Check size={24} color="white" /> : <Play size={24} color="white" fill="white" />} */}
                  </TouchableOpacity>
                  <View className="ml-4 flex-1">
                    <Text className="text-white text-lg font-semibold">{task.name}</Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-gray-400">
                        <Text className="text-gray-400">⏱ {task.duration}</Text>
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <View className="bg-white/10 px-2 py-1 rounded-md">
                      <Text className="text-white text-xs">🔥</Text>
                    </View>
                    <Text className="text-gray-400 text-sm mt-1">{task.repetitions}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-white text-2xl font-bold mb-4">Progress Tracking</Text>
          <View className="bg-primary_dark/50 rounded-2xl p-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-4">
                {weekProgress.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`items-center justify-center w-14 h-14 rounded-full ${
                      day.current ? "bg-white" : "border border-white/20"
                    }`}
                  >
                    <Text className={`text-xs font-medium ${day.current ? "text-primary" : "text-gray-400"}`}>
                      {day.day}
                    </Text>
                    <Text className={`text-base font-bold ${day.current ? "text-primary" : "text-white"}`}>
                      {day.date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View className="mt-4 space-y-3">
              {progressTasks.map((task, index) => (
                <View key={index} className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className={`w-2 h-8 rounded-full mr-4 ${index % 2 === 0 ? "bg-green" : "bg-error"}`} />
                    <View className="flex-1">
                      <Text className="text-white font-medium">{task.name}</Text>
                      <Text className="text-gray-400 text-sm">⏱ {task.duration}</Text>
                    </View>
                    <View className="flex-row space-x-2">
                      <View className="bg-white/10 px-2 py-1 rounded-md">
                        {/* <Check size={12} color="#63F19E" /> */}
                      </View>
                      <View className="bg-white/10 px-2 py-1 rounded-md">
                        <Text className="text-white text-xs">🔥</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

