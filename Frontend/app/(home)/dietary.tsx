"use client"

import { View, ScrollView } from "react-native"
import { useFocusEffect, router } from "expo-router"
import MealTimer from "@/components/Dietary screen/MealTimer"
import MealPlanGenerator from "@/components/Dietary screen/MealPlanGenerator"
import { DietaryData } from "./home"

export default function DietaryScreen() {

  const handleMarkDone = () => {
    console.log("Marked as done")
  }

  const handleAddCustom = () => {
    console.log("Add custom meal")
  }

  const handleGenerateMealPlan = () => {
    console.log("Generate meal plan")
  }

  return (
    <ScrollView className="flex-1">
      <View className="p-4 space-y-4">
        <MealTimer
          diets={DietaryData}
          WorkoutTime="16:30" 
          onMarkDone={handleMarkDone}
           onAddCustom={handleAddCustom}
        />
        <View className="h-4" />
        <MealPlanGenerator onGenerate={handleGenerateMealPlan} />
      </View>
    </ScrollView>
  )
}

