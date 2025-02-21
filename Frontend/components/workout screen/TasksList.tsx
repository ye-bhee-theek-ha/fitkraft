import type React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { WorkoutData, WorkoutListProps } from "@/constants/types"
import { Ionicons } from "@expo/vector-icons"

const TasksList: React.FC<WorkoutListProps> = ({ workouts }) => {
  const formatDuration = (duration: { minutes: number; seconds: number }) => {
    return `${String(duration.minutes).padStart(2, "0")}:${String(duration.seconds).padStart(2, "0")}`
  }

  return (
    <View className="bg-primary_dark/50 rounded-3xl p-2">
      <View className="space-y-3">
        {workouts.map((exercise, index) => (
          <View key={index} className="bg-primary_dark rounded-2xl border-2 border-white/20 p-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  exercise.completed ? "bg-green" : "bg-primary_light"
                }`}
              >
                {exercise.completed ? <Ionicons name="checkmark-done-circle" size={24} color="#212835" /> : <View className="rounded-full w-7 h-7 border border-white/20 bg-primary_dark" />}
              </TouchableOpacity>
              <View className="ml-4 flex-1">
                <Text className="text-white text-lg font-semibold">{exercise.name}</Text>
                <View className="flex-row items-center mt-1">
                  <MaterialIcons name="timer" size={14} color="#9CA3AF" />
                  <Text className="text-gray-400 ml-1">{formatDuration(exercise.duration)}</Text>
                </View>
              </View>
              <View className="items-end">
                {exercise.caloriesBurned && (
                    <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                        <MaterialIcons name="local-fire-department" size={10} color="#FF6F61" />
                        <Text className="text-white text-icon_text ml-1">
                            {exercise.caloriesBurned}
                        </Text>
                    </View>
                )}
                <Text className="text-gray-400 text-sm mt-1">Repetition {exercise.repetitions}x</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default TasksList

