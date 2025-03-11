
import WeeklyMealPlanComponent from "@/components/profile/foodPlanComponent"
import WeeklyWorkoutTasks from "@/components/profile/workoutPlanComponent"
import { sampleWeeklyWorkouts } from "@/constants/sampledata"
import { DietaryItem } from "@/constants/types"
import { FontAwesome6, Ionicons } from "@expo/vector-icons"
import { router, Stack } from "expo-router"
import { SafeAreaView, TouchableOpacity, View } from "react-native"

export const WorkoutPlanScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-primary_dark">
            <Stack.Screen
                options={{
                    title: 'My Food Plan',
                    headerShown: true,
                    headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} className="mx-2">
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    ),
                    headerRight: () => (
                        // TODO: Add a button to add a new meal plan
                    <TouchableOpacity onPress={() => router.back()} className="mx-2">
                        <View className="rounded-full text-white bg-white/20 border-2 border-white p-2">
                            <FontAwesome6 name="plus" size={20} color="White" />
                        </View>
                    </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTransparent: true
                }}
            />

            <View className="flex-1 bg-primary_dark p-4 mt-20">
                <WeeklyWorkoutTasks weeklyWorkouts={sampleWeeklyWorkouts}/>
            </View>
        </SafeAreaView>
      
    )
  }
  
  export default WorkoutPlanScreen