"use client"

import { useEffect, useMemo } from "react"
import { View, Text, BackHandler, ScrollView } from "react-native"
import { router, useFocusEffect } from "expo-router"
import type { WorkoutData, WorkoutDayProgress } from "@/constants/types"
import TasksList from "@/components/workout screen/TasksList"
import ProgressList from "@/components/workout screen/ProgressList"

const workoutDataHistory: WorkoutData[] = [
  {
    date: "2023-05-01",
    userID: "user1",
    Exercises: [
      {
        name: "Dumbbell Rows",
        duration: { minutes: 4, seconds: 15 },
        repetitions: 5,
        completed: true,
        caloriesBurned: 235,
      },
      {
        name: "Russian Twists",
        duration: { minutes: 2, seconds: 30 },
        repetitions: 3,
        completed: false,
        caloriesBurned: 45,
      },
      {
        name: "Squats",
        duration: { minutes: 0, seconds: 30 },
        repetitions: 3,
        completed: true,
        caloriesBurned: 45,
      },
    ],
  },
  {
    date: "2023-05-02",
    userID: "user1",
    Exercises: [
      {
        name: "Push Ups",
        duration: { minutes: 3, seconds: 0 },
        repetitions: 4,
        completed: true,
        caloriesBurned: 150,
      },
      {
        name: "Plank",
        duration: { minutes: 1, seconds: 30 },
        repetitions: 2,
        completed: true,
        caloriesBurned: 50,
      },
      {
        name: "Lunges",
        duration: { minutes: 2, seconds: 0 },
        repetitions: 3,
        completed: false,
        caloriesBurned: 100,
      },
    ],
  },
  {
    date: "2023-05-03",
    userID: "user1",
    Exercises: [
      {
        name: "Bicep Curls",
        duration: { minutes: 2, seconds: 45 },
        repetitions: 4,
        completed: true,
        caloriesBurned: 120,
      },
      {
        name: "Tricep Dips",
        duration: { minutes: 2, seconds: 15 },
        repetitions: 3,
        completed: false,
        caloriesBurned: 80,
      },
      {
        name: "Jumping Jacks",
        duration: { minutes: 1, seconds: 30 },
        repetitions: 3,
        completed: true,
        caloriesBurned: 60,
      },
    ],
  },
  {
    date: "2023-05-04",
    userID: "user1",
    Exercises: [
      {
        name: "Bench Press",
        duration: { minutes: 3, seconds: 30 },
        repetitions: 4,
        completed: true,
        caloriesBurned: 200,
      },
      {
        name: "Deadlifts",
        duration: { minutes: 4, seconds: 0 },
        repetitions: 3,
        completed: false,
        caloriesBurned: 250,
      },
      {
        name: "Burpees",
        duration: { minutes: 2, seconds: 0 },
        repetitions: 3,
        completed: true,
        caloriesBurned: 100,
      },
    ],
  },
  {
    date: "2023-05-05",
    userID: "user1",
    Exercises: [
      {
        name: "Pull Ups",
        duration: { minutes: 2, seconds: 30 },
        repetitions: 4,
        completed: true,
        caloriesBurned: 180,
      },
      {
        name: "Mountain Climbers",
        duration: { minutes: 1, seconds: 45 },
        repetitions: 3,
        completed: false,
        caloriesBurned: 90,
      },
      {
        name: "Leg Raises",
        duration: { minutes: 2, seconds: 15 },
        repetitions: 3,
        completed: true,
        caloriesBurned: 70,
      },
    ],
  },
  {
    date: "2023-05-06",
    userID: "user1",
    Exercises: [
      {
        name: "Sit Ups",
        duration: { minutes: 3, seconds: 0 },
        repetitions: 4,
        completed: true,
        caloriesBurned: 140,
      },
      {
        name: "High Knees",
        duration: { minutes: 2, seconds: 30 },
        repetitions: 3,
        completed: false,
        caloriesBurned: 110,
      },
      {
        name: "Side Plank",
        duration: { minutes: 1, seconds: 30 },
        repetitions: 2,
        completed: true,
        caloriesBurned: 60,
      },
    ],
  },
  {
    date: "2023-05-07",
    userID: "user1",
    Exercises: [
      {
        name: "Chest Fly",
        duration: { minutes: 3, seconds: 15 },
        repetitions: 4,
        completed: true,
        caloriesBurned: 160,
      },
      {
        name: "Leg Press",
        duration: { minutes: 4, seconds: 0 },
        repetitions: 3,
        completed: false,
        caloriesBurned: 220,
      },
      {
        name: "Bicycle Crunches",
        duration: { minutes: 2, seconds: 0 },
        repetitions: 3,
        completed: true,
        caloriesBurned: 90,
      },
    ],
  },
]

export default function WorkoutScreen() {
  // useFocusEffect(() => {
  //   router.setParams({ section: "Workout" as Section })
  // })

  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
  //     router.push("/home")
  //     return true
  //   })

  //   return () => backHandler.remove()
  // }, [])


  const currentDate = useMemo(() => new Date(), [])


  return (
    <ScrollView className="flex-1">
      <View className="px-4">
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-4">Tasks Today</Text>
          <TasksList workouts={workoutDataHistory[0].Exercises} />
        </View>

        <View>
          <Text className="text-white text-2xl font-bold mb-4">Progress Tracking</Text>
          <ProgressList WorkoutDataHistory={workoutDataHistory} currentDate={currentDate} />
        </View>
      </View>
    </ScrollView>
  )
}

