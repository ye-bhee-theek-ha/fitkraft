import WeeklyMealPlanComponent from "@/components/profile/foodPlanComponent"
import { DietaryItem } from "@/constants/types"
import { FontAwesome6, Ionicons } from "@expo/vector-icons"
import { router, Stack } from "expo-router"
import { SafeAreaView, TouchableOpacity, View } from "react-native"



// Sample Meal Plan Data
export const sampleWeeklyMealPlan: DietaryItem[][] = [
    // Monday
    [
      {
        name: "Protein Packed Oatmeal",
        time_name: "breakfast",
        fats: 7,
        proteins: 20,
        carbohydrates: 35,
        calories: 350,
        completed: true
      },
      {
        name: "Grilled Chicken Quinoa Bowl",
        time_name: "lunch",
        fats: 8,
        proteins: 35,
        carbohydrates: 25,
        calories: 400,
        completed: false
      },
      {
        name: "Pre-Workout Protein Shake",
        time_name: "pre-workout",
        fats: 3,
        proteins: 25,
        carbohydrates: 15,
        calories: 200,
        completed: false
      },
      {
        name: "Salmon with Roasted Vegetables",
        time_name: "dinner",
        fats: 15,
        proteins: 30,
        carbohydrates: 20,
        calories: 450,
        completed: false
      }
    ],
    // Tuesday
    [
      {
        name: "Greek Yogurt Parfait",
        time_name: "breakfast",
        fats: 5,
        proteins: 15,
        carbohydrates: 30,
        calories: 300,
        completed: true
      },
      {
        name: "Turkey and Avocado Wrap",
        time_name: "lunch",
        fats: 12,
        proteins: 28,
        carbohydrates: 35,
        calories: 420,
        completed: false
      },
      {
        name: "Post-Workout Smoothie",
        time_name: "post-workout",
        fats: 4,
        proteins: 22,
        carbohydrates: 20,
        calories: 250,
        completed: false
      },
      {
        name: "Vegetarian Stir Fry",
        time_name: "dinner",
        fats: 10,
        proteins: 25,
        carbohydrates: 40,
        calories: 400,
        completed: false
      }
    ],
    // Wednesday
    [
      {
        name: "Spinach and Egg White Frittata",
        time_name: "breakfast",
        fats: 6,
        proteins: 18,
        carbohydrates: 15,
        calories: 250,
        completed: true
      },
      {
        name: "Tuna Salad with Mixed Greens",
        time_name: "lunch",
        fats: 9,
        proteins: 32,
        carbohydrates: 10,
        calories: 350,
        completed: false
      },
      {
        name: "Protein Energy Balls",
        time_name: "snack",
        fats: 7,
        proteins: 10,
        carbohydrates: 20,
        calories: 200,
        completed: false
      },
      {
        name: "Lean Beef Stir Fry",
        time_name: "dinner",
        fats: 12,
        proteins: 35,
        carbohydrates: 30,
        calories: 450,
        completed: false
      }
    ],
    // Thursday - Friday - Saturday - Sunday can follow similar patterns
    ...Array(4).fill([
      {
        name: "Protein Smoothie Bowl",
        time_name: "breakfast",
        fats: 6,
        proteins: 22,
        carbohydrates: 25,
        calories: 350,
        completed: false
      },
      {
        name: "Grilled Shrimp Salad",
        time_name: "lunch",
        fats: 8,
        proteins: 30,
        carbohydrates: 15,
        calories: 380,
        completed: false
      },
      {
        name: "Protein Bar",
        time_name: "snack",
        fats: 5,
        proteins: 15,
        carbohydrates: 20,
        calories: 220,
        completed: false
      },
      {
        name: "Baked Chicken with Quinoa",
        time_name: "dinner",
        fats: 10,
        proteins: 35,
        carbohydrates: 35,
        calories: 450,
        completed: false
      }
    ])
  ]
  


export const MealPlanScreen = () => {
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

            <View className="flex-1 bg-primary_dark p-4">
                <WeeklyMealPlanComponent weeklyMeals={sampleWeeklyMealPlan} />
            </View>
        </SafeAreaView>
      
    )
  }
  
  export default MealPlanScreen