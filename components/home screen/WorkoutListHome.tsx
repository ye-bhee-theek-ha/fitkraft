import type React from "react"
import { View, Text, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient"

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
        <View className="flex-row items-center m-2 mb-2 mt-0">
            <Ionicons name="barbell-outline" size={24} color="white" style={{ transform: [{ rotate: '45deg' }] }} />
            <Text className="text-white text-text font-semibold ml-2">Workout</Text>
        </View>
        <View className="border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden">
            <LinearGradient
                colors={['rgba(255,255,255,0)','rgba(255,255,255,0.01)', 'rgba(255,255,255,0.1)']}
                locations={[0,.5,1]}
                style={{ flex: 1, borderRadius: 15}}
                className="absolute bottom-0 left-0 h-full w-full"
            />
            <ScrollView scrollEnabled={workouts.length > 3} showsVerticalScrollIndicator={false} className={`${workouts.length > 3 ? "h-52" : ""}`}>
                {workouts.map((workout, index) => (
                    <View key={index} className=" flex-row items-center justify-between p-3 rounded-lg">
                        <View className="flex-row items-center flex-1">
                            <View className="flex flex-col w-4 mr-2">
                                <View className={`w-3 h-7 mb-1 rounded-full mr-3 ${workout.completed ? "bg-green" : "bg-gray-500"}`} />
                                <Ionicons name="time-sharp" size={14} color="#9CA3AF" />
                            </View>

                            <View className="flex-1">
                                <Text className="text-white font-medium text-medium pr-2">{workout.name}</Text>
                                <View className="flex-row items-center mt-1">
                                <Text className="text-gray-400 text-sm ml-1">{formatDuration(workout.duration)}</Text>
                            </View>
                        </View>
                        </View>

                        <View className="flex-col items-start">
                            <View className="flex-row">
                                {workout.completed && (
                                    <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex items-center justify-center">
                                        <AntDesign name="checkcircle" size={10} color="#63F19E" />
                                    </View>
                                )}
                                <View className="w-1"/>
                                {workout.caloriesBurned && (
                                    <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                                        <MaterialIcons name="local-fire-department" size={10} color="#FF6F61" />
                                        <Text className="text-white text-icon_text ml-1">
                                            {workout.caloriesBurned}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-gray-400 text-sm mr-2">Repetition {workout.repetitions}x</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    </View>
  )
}

export default WorkoutList

