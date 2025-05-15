import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// Import MealItem type along with MealTimeName
import { MealItem, MealTimeName } from "@/constants/types"; // Adjust path if needed
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

// Interface for the component's props
interface WeeklyMealPlanProps {
    // Corrected type: Expect an array of days, where each day is an array of MealItems
    weeklyMeals: MealItem[][];
}

// Helper function to get the correct icon based on meal time
const GetIconForTime = (time: MealTimeName) => {
    switch (time) {
        case "breakfast":
            return <Feather name="sunrise" size={28} color="white" />;
        case "lunch":
            return <Feather name="sun" size={28} color="white" />;
        case "dinner":
            return <Feather name="sunset" size={28} color="white" />;
        case "snack":
            return <MaterialCommunityIcons name="food-croissant" size={28} color="white" />;
        case "pre-workout":
            return <MaterialCommunityIcons name="run" size={28} color="white" />;
        case "post-workout":
            return <MaterialIcons name="local-drink" size={28} color="white" />;
        case "workout":
             return <MaterialIcons name="fitness-center" size={28} color="white" />;
        default:
            return <MaterialCommunityIcons name="food-variant" size={28} color="white" />;
    }
};

const WeeklyMealPlanComponent: React.FC<WeeklyMealPlanProps> = ({ weeklyMeals }) => {
    // State to keep track of the currently selected day index (0 for Monday, etc.)
    const [selectedDay, setSelectedDay] = useState(0);
    // Array of day names for the selector UI
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Get the meals for the currently selected day, default to empty array if out of bounds
    // Ensure weeklyMeals itself is an array before accessing index
    const currentDayMeals = Array.isArray(weeklyMeals) && weeklyMeals[selectedDay] ? weeklyMeals[selectedDay] : [];

    console.log(`Selected Day Index: ${selectedDay}, Meals:`, currentDayMeals); // Log selected day and its meals

    return (
        <View className="bg-primary_dark rounded-3xl">

            {/* Meal List Header */}
            <View className="flex-row items-center m-2 mb-2 mt-0 p-2">
                <MaterialCommunityIcons name="food-apple" size={28} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">Daily Meal Plan</Text>
            </View>

            {/* Day Selector */}
            <View className="flex-row justify-between mb-4 px-1">
                {daysOfWeek.map((day, index) => (
                    <Pressable
                        key={day}
                        onPress={() => setSelectedDay(index)}
                        // Apply background style if the day is selected
                        className={`flex-1 items-center rounded-lg py-2 mx-0.5 ${selectedDay === index ? 'bg-white/20 border border-white/30' : ''}`}
                    >
                        {/* Ensure day name is in Text */}
                        <Text className={`text-sm font-medium ${selectedDay === index ? 'text-white' : 'text-gray-400'}`}>{day}</Text>
                    </Pressable>
                ))}
            </View>

            {/* Meal List Container */}
            <View className="border-2 border-white/20 rounded-3xl overflow-hidden relative min-h-[300px]">
                {/* Background Gradient */}
                <LinearGradient
                    colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.1)"]}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute bottom-0 left-0 h-full w-full"
                />
                {/* Scrollable Meal List */}
                <ScrollView
                    nestedScrollEnabled={true} // Important for scrollability within another ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 60 }} // Add padding for better spacing
                    className="p-3" // Add padding around the scroll content
                >
                    {/* Check if there are meals for the selected day */}
                    {currentDayMeals.length > 0 ? (
                        <View className="space-y-3">
                            {/* Map through the meals for the selected day */}
                            {currentDayMeals.map((meal, index) => (
                                // Use a fragment or View for each meal item
                                <View key={meal._id || `meal-${index}`}>
                                    {/* Meal Time Header with Macros */}
                                    <View className="flex-row justify-between items-center mb-1 px-1">
                                        {/* Meal Time Name (already in Text) */}
                                        <Text className="text-gray-300 font-semibold text-xs uppercase tracking-wider">
                                            {meal.time_name || 'Meal'} {/* Fallback text */}
                                        </Text>
                                        {/* Macros and Completed Status */}
                                        <View className="flex-row items-center space-x-1.5">
                                            {/* Conditional rendering for completed badge */}
                                            {meal.completed && (
                                                <View className="bg-green-500/20 border border-green-500/50 p-0.5 rounded-full flex items-center justify-center">
                                                    <AntDesign name="check" size={10} color="#63F19E" />
                                                </View>
                                            )}
                                            {/* Conditional rendering for fats */}
                                            {meal.fats !== undefined && meal.fats !== null && (
                                                <View className="bg-blue-500/10 border border-blue-500/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                                                    <MaterialIcons name="water-drop" size={10} color="#6dd5fa" />
                                                    {/* Ensure value is in Text */}
                                                    <Text className="text-white text-[10px] ml-1">{meal.fats}g</Text>
                                                </View>
                                            )}
                                            {/* Conditional rendering for proteins */}
                                            {meal.proteins !== undefined && meal.proteins !== null && (
                                                <View className="bg-green/10 border border-green/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                                                    <MaterialCommunityIcons name="lightning-bolt" size={10} color="#7bffba" />
                                                     {/* Ensure value is in Text */}
                                                    <Text className="text-white text-[10px] ml-1">{meal.proteins}g</Text>
                                                </View>
                                            )}
                                             {/* Conditional rendering for carbs */}
                                            {meal.carbohydrates !== undefined && meal.carbohydrates !== null && (
                                                <View className="bg-yellow-500/10 border border-yellow-500/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                                                    <FontAwesome6 name="bread-slice" size={9} color="#fff3d4" />
                                                     {/* Ensure value is in Text */}
                                                    <Text className="text-white text-[10px] ml-1">{meal.carbohydrates}g</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Meal Item Card with Blur */}
                                    <BlurView
                                        className="border border-white/30"
                                        intensity={25}
                                        tint="dark"
                                        style={{
                                            flexDirection: 'row',
                                            minHeight: 60,
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingHorizontal: 12,
                                            paddingVertical: 10,
                                            borderRadius: 12,
                                            overflow: "hidden",
                                        }}
                                    >
                                        {/* Left side: Icon and Meal Name */}
                                        <View className="flex-row items-center flex-1 mr-2">
                                            <View className="mr-3 p-1 bg-white/10 rounded-full">
                                                {/* Ensure Icon is rendered */}
                                                {GetIconForTime(meal.time_name)}
                                            </View>
                                            <View className="flex-1">
                                                {/* Ensure name is in Text */}
                                                <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                                                    {meal.name || 'Unnamed Meal'} {/* Fallback text */}
                                                </Text>
                                                {/* Ensure calories are in Text */}
                                                <Text className="text-gray-400 text-xs">
                                                    {meal.calories !== undefined && meal.calories !== null ? `${meal.calories} kcal` : ''} {/* Check and format */}
                                                </Text>
                                            </View>
                                        </View>
                                        {/* Right side: Checkbox */}
                                        <TouchableOpacity
                                            onPress={() => { /* TODO: Implement toggle completion logic */ }}
                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${meal.completed ? 'bg-accent border-accent' : 'border-gray-500'}`}
                                        >
                                            {/* Conditional rendering for checkmark */}
                                            {meal.completed && <AntDesign name="check" size={14} color="white" />}
                                        </TouchableOpacity>
                                    </BlurView>
                                </View>
                            ))}
                        </View>
                    ) : (
                         // Message when no meals are found for the selected day
                         <View className="items-center justify-center h-[200px]">
                             <Ionicons name="sad-outline" size={40} color="#94a3b8" />
                             {/* Ensure message is in Text */}
                             <Text className="text-slate-400 mt-2 text-center">No meals scheduled for {daysOfWeek[selectedDay]}.</Text>
                         </View>
                     )}
                </ScrollView>
            </View>
        </View>
    );
};

export default WeeklyMealPlanComponent;
