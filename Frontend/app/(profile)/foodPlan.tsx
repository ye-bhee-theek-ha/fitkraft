import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    SafeAreaView
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
// Import both DietaryItem and MealItem
import { DietaryItem, MealItem } from '@/constants/types';
import { useAuth } from '@/context/auth';
import { useApp } from '@/context/app';
import axios from 'axios';
import { BASE_URL } from '@/constants/baseUrl';
import WeeklyMealPlanComponent from '@/components/profile/foodPlanComponent';
import { MealTimeName } from '../(DietaryInfo)';


export const MealPlanScreen = () => {
    // State for the processed data, now correctly typed as MealItem[][]
    const [processedWeeklyMeals, setProcessedWeeklyMeals] = useState<MealItem[][]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { jwt } = useAuth();
    const { userProfile } = useApp();

    // Fetch and process weekly meal plan from the backend
    useEffect(() => {
        const fetchAndProcessWeeklyPlan = async () => {
            if (!jwt || !userProfile?._id) {
                setError("User information is not available.");
                setIsLoading(false);
                console.log("JWT or User ID missing, cannot fetch meal plan.");
                return;
            }

            setIsLoading(true);
            setError(null);
            setProcessedWeeklyMeals([]); // Clear previous data

            try {
                const userId = userProfile._id;
                console.log(`Fetching weekly meal plan for userId: ${userId}`);

                const response = await axios.get(`${BASE_URL}/dietery/get/${userId}?period=week`, {
                  headers: { Authorization: `Bearer ${jwt}` },
                  timeout: 5000,
                });

                console.info(response)

                console.log("Weekly meal plan fetched successfully (raw):", response.data);

                if (response.data && Array.isArray(response.data.data)) {
                    const dailyDietaryItems: DietaryItem[] = response.data.data;

                    // Initialize a 7-element array representing Mon-Sun
                    const mealsByCorrectDay: MealItem[][] = Array(7).fill(null).map(() => []);

                    // Process each fetched day
                    dailyDietaryItems.forEach(item => {
                        const itemDate = new Date(item.Date);
                        const dayOfWeek = itemDate.getDay(); // 0=Sun, 1=Mon,...
                        const targetIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Map to Mon=0,... Sun=6

                        if (targetIndex >= 0 && targetIndex < 7) {
                            // Map the backend meal structure to the frontend MealItem structure
                            const frontendMeals: MealItem[] = (item.Meals || []).map((backendMeal: any) => {
                                // Perform the mapping
                                return {
                                    _id: backendMeal._id || `temp-${Math.random()}`, // Use backend ID or generate temp
                                    name: backendMeal.Name || 'Unnamed Meal', // Map Name -> name
                                    time_name: backendMeal.Category as MealTimeName,
                                    time: backendMeal.time, // Assuming 'time' might exist directly
                                    calories: backendMeal.Calories ?? 0, // Map Calories -> calories (default to 0)
                                    fats: backendMeal.Fats ?? 0, // Map Fats -> fats (default to 0)
                                    proteins: backendMeal.Protein ?? 0, // Map Protein -> proteins (default to 0)
                                    carbohydrates: backendMeal.Carbs ?? 0, // Map Carbs -> carbohydrates (default to 0)
                                    completed: backendMeal.completed ?? false // Use completed if exists, else default false
                                    // Add other MealItem fields if necessary, potentially from backendMeal
                                };
                            });
                            mealsByCorrectDay[targetIndex] = frontendMeals;
                        } else {
                            console.warn(`Invalid day index calculated: ${targetIndex} for date ${item.Date}`);
                        }
                    });

                    console.log("Processed meals mapped to Mon-Sun (MealItem[][]):", mealsByCorrectDay);
                    setProcessedWeeklyMeals(mealsByCorrectDay);

                } else {
                    console.warn("Unexpected API response structure for meal plan:", response.data);
                    setError("Received invalid data format from server.");
                    setProcessedWeeklyMeals(Array(7).fill(null).map(() => []));
                }

            } catch (err) {
                console.error('Error fetching or processing weekly meal plan:', err);
                if (axios.isAxiosError(err)) {
                    setError(`Failed to fetch meal plan: ${err.response?.data?.message || err.message}`);
                } else {
                    setError("An unexpected error occurred while fetching the meal plan.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndProcessWeeklyPlan();
    }, [jwt, userProfile?._id]);

    return (
        // Main container with safe area view
        <SafeAreaView className="flex-1 bg-primary_dark">
            {/* Stack Screen configuration for header */}
            <Stack.Screen
                options={{
                    title: 'My Food Plan',
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} className="mx-2 p-1">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>
                    ),
                    // headerRight: () => (
                    //     // Button to potentially add new meal plan items
                    //     <TouchableOpacity onPress={() => { /* TODO: Add navigation/modal logic here */ }} className="mx-2">
                    //         <View className="rounded-full bg-white/10 border border-white/30 p-2">
                    //             <FontAwesome6 name="plus" size={18} color="white" />
                    //         </View>
                    //     </TouchableOpacity>
                    // ),
                    headerStyle: { backgroundColor: '#212835' }, // Header styling
                    headerTintColor: 'white',
                    headerTransparent: true,
                }}
            />

            {/* Content Area */}
            <View className="flex-1 bg-primary_dark p-4 mt-20">
                {isLoading ? (
                    // Loading indicator
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className="text-white mt-2">Loading Meal Plan...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center p-4">
                        <Ionicons name="alert-circle-outline" size={40} color="#f87171" />
                        <Text className="text-red-400 text-center mt-2">{error}</Text>
                    </View>
                ) : processedWeeklyMeals.length === 0 ? (
                     <View className="flex-1 justify-center items-center">
                         <Ionicons name="restaurant-outline" size={50} color="#94a3b8" />
                         <Text className="text-slate-400 text-lg mt-3">No meal plan found for this week.</Text>
                         <Text className="text-slate-500 text-center mt-1">Tap the '+' button to add meals.</Text>
                     </View>
                 ) : (
                    <ScrollView>
                         <WeeklyMealPlanComponent weeklyMeals={processedWeeklyMeals} />
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

export default MealPlanScreen;
