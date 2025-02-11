import type React from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface WorkoutItem {
  name: string
  duration: {
    minutes: number
    seconds: number
  }
  repetitions: number
  completed: boolean
  caloriesBurned: number
}

interface WorkoutListProps {
  workouts: WorkoutItem[]
}

const WorkoutList: React.FC<WorkoutListProps> = ({ workouts }) => {
  const formatDuration = (duration: { minutes: number; seconds: number }) => {
    const minutes = String(duration.minutes).padStart(2, "0")
    const seconds = String(duration.seconds).padStart(2, "0")
    return `${minutes}:${seconds}`
  }

  return (
    <View className="bg-primary_dark p-3 rounded-3xl">
    <View className="flex-row items-center m-2 mb-3">
      <Ionicons name="barbell-outline" size={24} color="white" style={{ transform: [{ rotate: '45deg' }] }} />
      <Text className="text-white text-text font-semibold ml-2">Workout</Text>
    </View>

      <View className="space-y-3 border-2 border-white/20 rounded-lg rounded-b-3xl bg-gradient-to-br from-white/100 to-white/0">
        {workouts.map((workout, index) => (
          <View key={index} className="flex-row items-center justify-between p-3 rounded-lg">
            <View className="flex-row items-center flex-1">
              <View className={`w-2 h-8 rounded-full mr-3 ${workout.completed ? "bg-green-500" : "bg-gray-500"}`} />

              <View className="flex-1">
                <Text className="text-white font-medium">{workout.name}</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                  <Text className="text-gray-400 text-sm ml-1">{formatDuration(workout.duration)}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text className="text-gray-400 mr-2">Repetition {workout.repetitions}x</Text>
              {workout.completed && (
                <View className="bg-green-500/20 p-1 rounded-full">
                  <Ionicons name="checkmark" size={16} color="#22C55E" />
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default WorkoutList

