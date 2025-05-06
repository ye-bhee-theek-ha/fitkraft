"use client"

import { useEffect, useMemo } from "react"
import { View, Text, BackHandler, ScrollView } from "react-native"
import { router, useFocusEffect } from "expo-router"
import type { WorkoutData, WorkoutDayProgress } from "@/constants/types"
import TasksList from "@/components/workout screen/TasksList"
import ProgressList from "@/components/workout screen/ProgressList"


export default function WorkoutScreen() {


  const currentDate = useMemo(() => new Date(), [])

  return (
    <ScrollView className="flex-1">
      <View className="px-4">
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-4">Tasks Today</Text>
          <TasksList />
        </View>

        <View>
          <Text className="text-white text-2xl font-bold mb-4">Progress Tracking</Text>
          <ProgressList currentDate={currentDate} />
        </View>
      </View>
    </ScrollView>
  )
}

