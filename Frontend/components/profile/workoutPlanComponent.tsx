import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import Ionicons from "@expo/vector-icons/Ionicons"
import AntDesign from "@expo/vector-icons/AntDesign"
import { sampleWeeklyWorkouts } from "@/constants/sampledata"
import { Exercise, WeeklyWorkoutTasksProps, WorkoutType } from "@/constants/types"



// Utility Function for Workout Type Icons
const GetIconForWorkoutType = (type: WorkoutType) => {
  switch (type) {
    case "cardio":
      return <MaterialIcons name="directions-run" size={28} color="white" />
    case "strength":
      return <MaterialIcons name="fitness-center" size={28} color="white" />
    case "yoga":
      return <MaterialIcons name="self-improvement" size={28} color="white" />
    case "hit":
      return <MaterialIcons name="timer" size={28} color="white" />
    case "recovery":
      return <MaterialIcons name="healing" size={28} color="white" />
    default:
      return null
  }
}

// Fetching Function (Simulated Backend Request)
const fetchWeeklyWorkouts = async (): Promise<Exercise[][]> => {
  // Simulated API call - replace with actual backend fetch
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleWeeklyWorkouts)
    }, 1500)
  })
}

// Weekly Workout Tasks Component
const WeeklyWorkoutTasks: React.FC<WeeklyWorkoutTasksProps> = ({ 
  isLoading: externalLoading = false, 
  weeklyWorkouts 
}) => {
  const [isLoading, setIsLoading] = useState(externalLoading)
  const [workouts, setWorkouts] = useState<Exercise[][]>(weeklyWorkouts)

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Utility for formatting duration
  const formatDuration = (duration: { minutes: number; seconds: number }) => {
    return `${String(duration.minutes).padStart(2, "0")}:${String(duration.seconds).padStart(2, "0")}`
  }

  // Data Fetching Effect
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setIsLoading(true)
        const fetchedWorkouts = await fetchWeeklyWorkouts()
        setWorkouts(fetchedWorkouts)
      } catch (error) {
        console.error("Failed to fetch workouts", error)
        // Optionally handle error state
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkouts()
  }, [])

  // Render Loading State
  if (isLoading) {
    return (
      <View className="bg-primary_dark p-3 rounded-3xl h-96 items-center justify-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-4">Loading Workout Plan...</Text>
      </View>
    )
  }

  return (
    <View className="bg-primary_dark rounded-3xl flex-1">
      {/* Workout List Header */}
      <View className="flex-row items-center m-2 mb-2 mt-0">
        <MaterialIcons name="man" size={32} color="white" />
        <Text className="text-white text-text font-semibold ml-2">Weekly Workout Plan</Text>
      </View>

      {/* Workout List Container */}
      <View className="border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden flex-1">
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.1)"]}
          locations={[0, 0.5, 1]}
          style={{ flex: 1, borderRadius: 15 }}
          className="absolute bottom-0 left-0 h-full w-full"
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          {workouts.map((dayWorkouts, dayIndex) => (
            <View key={dayIndex} className="mb-4">
              {/* Day Header */}
              <View className="bg-white/10 px-4 py-2">
                <Text className="text-white font-semibold text-medium">
                  {daysOfWeek[dayIndex]}
                </Text>
              </View>

              {/* Workouts for the Day */}
              {dayWorkouts.map((workout) => (
                <View 
                  className="flex-row items-center justify-between p-3 mb-1 rounded-lg"
                >
                  <View className="flex-row items-center flex-1">
                    { workout.type?                      
                      <View className="flex justify-end flex-col mr-2">
                        {GetIconForWorkoutType(workout.type)}
                      </View> 
                      :
                      <View className="flex justify-end flex-col mr-2">
                        <MaterialIcons name="directions-run" size={28} color="white" />
                      </View> 
                    }

                    <View className="flex-1">
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-gray-400 font-semibold text-medium ml-2 bg-black">
                          {workout.type}
                        </Text>

                        <View className="flex-row flex-1 justify-end pl-4">
                          {workout.completed && (
                            <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex items-center justify-center">
                              <AntDesign name="checkcircle" size={10} color="#63F19E" />
                            </View>
                          )}

                          {workout.caloriesBurned !== undefined && (
                            <View className="ml-1 bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                              <MaterialIcons name="local-fire-department" size={10} color="#FF6F61" />
                              <Text className="text-white text-icon_text ml-1">
                                {workout.caloriesBurned}cal
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-white font-semibold text-medium pr-2 w-[60%]">
                          {workout.name}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-gray-400 pl-4">
                            Repetitions {workout.repetitions}x
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

export default WeeklyWorkoutTasks