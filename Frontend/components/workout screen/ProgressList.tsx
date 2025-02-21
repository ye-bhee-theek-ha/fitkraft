"use client"

import type React from "react"
import { useMemo, useState, useCallback, useEffect } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import Ionicons from "@expo/vector-icons/Ionicons"
import { AntDesign } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated"
import type { WorkoutDayProgress, WorkoutProgressListProps } from "@/constants/types"

const ProgressList: React.FC<WorkoutProgressListProps> = ({ WorkoutDataHistory, currentDate }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [previousWorkout, setPreviousWorkout] = useState<typeof selectedWorkout>(undefined);
  const slideOutAnimation = useSharedValue(0)
  const slideInAnimation = useSharedValue(1) // Set initial value to 1 to position off-screen to the right

  const formatDuration = (duration: { minutes: number; seconds: number }) => {
    return `${String(duration.minutes).padStart(2, "0")}:${String(duration.seconds).padStart(2, "0")}`
  }

  const weekProgress: WorkoutDayProgress[] = useMemo(() => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
    const result: WorkoutDayProgress[] = []

    const sortedDates = WorkoutDataHistory
      .map((workout) => new Date(workout.date))
      .sort((a, b) => b.getTime() - a.getTime())

    const mostRecentDate = sortedDates[0] || new Date()
    mostRecentDate.setHours(0, 0, 0, 0)

    for (let i = 6; i >= 0; i--) {
      const date = new Date(mostRecentDate)
      date.setDate(mostRecentDate.getDate() - i)
      const workoutForDate = WorkoutDataHistory.find((workout) => {
        const workoutDate = new Date(workout.date)
        return workoutDate.toDateString() === date.toDateString()
      })

      result.push({
        date: date,
        day: days[date.getDay()],
        current: i === 0,
        hasWorkout: !!workoutForDate,
      })
    }

    return result
  }, [WorkoutDataHistory])

  const selectedWorkout = useMemo(() => {
    return WorkoutDataHistory.find((workout) => {
      const workoutDate = new Date(workout.date)
      return (
        workoutDate.getDate() === selectedDate.getDate() &&
        workoutDate.getMonth() === selectedDate.getMonth() &&
        workoutDate.getFullYear() === selectedDate.getFullYear()
      )
    })
  }, [WorkoutDataHistory, selectedDate])


  const handleDatePress = useCallback(
    (date: Date) => {
      setPreviousWorkout(selectedWorkout)
      setSelectedDate(date)
      slideOutAnimation.value = 0
      slideInAnimation.value = 1
      slideOutAnimation.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      })
      slideInAnimation.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      })
    },
    [slideOutAnimation, slideInAnimation, selectedWorkout],
  )

  const animatedStyleOut = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(slideOutAnimation.value * -100, { duration: 300 }) }],
    opacity: withTiming(1 - slideOutAnimation.value, { duration: 300 }),
  }))

  const animatedStyleIn = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming((slideInAnimation.value) * 100, { duration: 300 }) }],
    opacity: withTiming(1- slideInAnimation.value, { duration: 300 }),
  }))

  return (
    <View className="bg-primary_dark/50 rounded-3xl p-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row space-x-2">
          {weekProgress.map((day, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDatePress(day.date)}
              className={`items-center justify-center w-12 h-14 rounded-2xl ${
                day.date.getTime() === selectedDate.getTime() ? "bg-white" : "border border-white/20 bg-primary_dark/5"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  day.date.getTime() === selectedDate.getTime() ? "text-primary" : "text-gray-400"
                }`}
              >
                {day.day}
              </Text>
              <Text
                className={`text-base font-bold ${
                  day.date.getTime() === selectedDate.getTime() ? "text-primary" : "text-white"
                }`}
              >
                {day.date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View className="relative overflow-hidden mt-4">
        <Animated.View style={animatedStyleOut} className="absolute top-0 left-0 right-0">
          <View className="border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden">
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.1)"]}
              locations={[0, 0.5, 1]}
              style={{ flex: 1, borderRadius: 15 }}
              className="absolute bottom-0 left-0 h-full w-full"
            />
            <ScrollView
              scrollEnabled={previousWorkout && previousWorkout.Exercises.length > 3}
              showsVerticalScrollIndicator={false}
              className={`${previousWorkout && previousWorkout.Exercises.length > 3 ? "h-52" : ""}`}
            >
              {previousWorkout?.Exercises.map((exercise, index) => (
                <View key={index} className="flex-row items-center justify-between p-3 rounded-lg">
                  <View className="flex-row items-center flex-1">
                    <View className="flex flex-col w-4 mr-2">
                      <View
                        className={`w-3 h-7 mb-1 rounded-full mr-3 ${exercise.completed ? "bg-green" : "bg-gray-500"}`}
                      />
                      <Ionicons name="time-sharp" size={14} color="#9CA3AF" />
                    </View>

                    <View className="flex-1">
                      <Text className="text-white font-medium text-medium pr-2">{exercise.name}</Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-gray-400 text-sm ml-1">{formatDuration(exercise.duration)}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-col items-start">
                    <View className="flex-row">
                      {exercise.completed && (
                        <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex items-center justify-center">
                          <AntDesign name="checkcircle" size={10} color="#63F19E" />
                        </View>
                      )}
                      <View className="w-1" />
                      {exercise.caloriesBurned && (
                        <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                          <MaterialIcons name="local-fire-department" size={10} color="#FF6F61" />
                          <Text className="text-white text-icon_text ml-1">{exercise.caloriesBurned}</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-gray-400 text-sm mr-2">Repetition {exercise.repetitions}x</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
        <Animated.View style={animatedStyleIn}>
          <View className="border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden">
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.1)"]}
              locations={[0, 0.5, 1]}
              style={{ flex: 1, borderRadius: 15 }}
              className="absolute bottom-0 left-0 h-full w-full"
            />
            <ScrollView
              scrollEnabled={selectedWorkout && selectedWorkout.Exercises.length > 3}
              showsVerticalScrollIndicator={false}
              className={`${selectedWorkout && selectedWorkout.Exercises.length > 3 ? "h-52" : ""}`}
            >
              {selectedWorkout?.Exercises.map((exercise, index) => (
                <View key={index} className="flex-row items-center justify-between p-3 rounded-lg">
                  <View className="flex-row items-center flex-1">
                    <View className="flex flex-col w-4 mr-2">
                      <View
                        className={`w-3 h-7 mb-1 rounded-full mr-3 ${exercise.completed ? "bg-green" : "bg-gray-500"}`}
                      />
                      <Ionicons name="time-sharp" size={14} color="#9CA3AF" />
                    </View>

                    <View className="flex-1">
                      <Text className="text-white font-medium text-medium pr-2">{exercise.name}</Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-gray-400 text-sm ml-1">{formatDuration(exercise.duration)}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-col items-start">
                    <View className="flex-row">
                      {exercise.completed && (
                        <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex items-center justify-center">
                          <AntDesign name="checkcircle" size={10} color="#63F19E" />
                        </View>
                      )}
                      <View className="w-1" />
                      {exercise.caloriesBurned && (
                        <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                          <MaterialIcons name="local-fire-department" size={10} color="#FF6F61" />
                          <Text className="text-white text-icon_text ml-1">{exercise.caloriesBurned}</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-gray-400 text-sm mr-2">Repetition {exercise.repetitions}x</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </View>
  )
}

export default ProgressList


