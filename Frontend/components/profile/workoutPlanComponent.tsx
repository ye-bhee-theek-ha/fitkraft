import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons"; // Added for consistency, though not used in provided snippet
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; // Added for consistency
import { Duration, WorkoutType } from "@/constants/types"; // Assuming these are in your global types

// Assuming PopulatedExercise is defined in types or passed correctly from WorkoutPlanScreen
// If not, you might need to define/import it here as well.
// For this example, I'm assuming it's available via the types import.
// If PopulatedExercise is defined locally in WorkoutPlanScreen,
// you'd ideally move it to constants/types.ts
// For now, let's redefine it here for clarity if it's not in constants/types
export interface PopulatedExercise {
    _id: string;
    name: string;
    type?: WorkoutType;
    duration: Duration;
    sets?: number;
    reps?: number;
    weight?: number;
    completed?: boolean;
    caloriesBurned?: number;
}

interface WeeklyWorkoutTasksProps {
    weeklyWorkouts: PopulatedExercise[][]; // Expects a 7-day array of exercise arrays
}

// Utility Function for Workout Type Icons
const GetIconForWorkoutType = (type: any) => {
    switch (type) {
        case "Cardio":
            return <MaterialIcons name="directions-run" size={28} color="white" />;
        case "Strength/Compound":
            return <MaterialIcons name="fitness-center" size={28} color="white" />;
        case "Yoga":
            return <MaterialIcons name="self-improvement" size={28} color="white" />;
        case "hit":
            return <MaterialIcons name="timer" size={28} color="white" />;
        case "Core/Isometric":
            return <MaterialIcons name="healing" size={28} color="white" />;
        default:
            return <FontAwesome6 name="dumbbell" size={24} color="white" />

    }
};

// Utility for formatting duration
const formatDuration = (duration: Duration | undefined): string => {
    if (!duration) return "00:00";
    const minutes = String(duration.minutes || 0).padStart(2, "0");
    const seconds = String(duration.seconds || 0).padStart(2, "0");
    return `${minutes}:${seconds}`;
};

// Weekly Workout Tasks Component
const WeeklyWorkoutTasks: React.FC<WeeklyWorkoutTasksProps> = ({ weeklyWorkouts }) => {
    // State to keep track of the currently selected day index (0 for Monday, etc.)
    const [selectedDay, setSelectedDay] = useState(0);
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Get the exercises for the currently selected day.
    // weeklyWorkouts should always be a 7-element array from the parent.
    const currentDayExercises = weeklyWorkouts[selectedDay] || [];

    return (
        <View className="bg-primary_dark rounded-3xl">
            {/* Header */}
            <View className="flex-row items-center p-3 mb-2">
                <FontAwesome6 name="dumbbell" size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-3">Weekly Workout Plan</Text>
            </View>

            {/* Day Selector Tabs */}
            <View className="flex-row justify-between mb-4 px-1">
                {daysOfWeek.map((day, index) => (
                    <Pressable
                        key={day}
                        onPress={() => setSelectedDay(index)}
                        className={`flex-1 items-center rounded-lg py-2 mx-0.5 ${selectedDay === index ? 'bg-white/20 border border-white/30' : ''}`}
                    >
                        <Text className={`text-sm font-medium ${selectedDay === index ? 'text-white' : 'text-gray-400'}`}>{day}</Text>
                    </Pressable>
                ))}
            </View>

            {/* Workout List Container */}
            <View className="border-2 border-white/20 rounded-3xl overflow-hidden relative min-h-[300px] max-h-[60vh]">
                <LinearGradient
                    colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0.06)"]}
                    locations={[0, 0.5, 1]}
                    className="absolute inset-0"
                />
                <ScrollView
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    className="p-3"
                >
                    {currentDayExercises.length > 0 ? (
                        <View className="space-y-3">
                            {currentDayExercises.map((exercise) => (
                                <View key={exercise._id} className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    {/* Top Row: Exercise Type and Badges (Completed, Calories) */}
                                    <View className="flex-row justify-between items-center mb-1.5">
                                        <Text className="text-gray-300 font-semibold text-xs uppercase tracking-wider">
                                            {exercise.type || 'Workout'}
                                        </Text>
                                        <View className="flex-row items-center space-x-1.5">
                                            {exercise.completed && (
                                                <View className="bg-green-500/20 border border-green-500/50 p-0.5 px-1 rounded-full flex items-center justify-center">
                                                    <AntDesign name="check" size={10} color="#63F19E" />
                                                </View>
                                            )}
                                            {exercise.caloriesBurned !== undefined && (
                                                <View className="bg-orange-500/10 border border-orange-500/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                                                    <MaterialIcons name="local-fire-department" size={10} color="#FF8C00" />
                                                    <Text className="text-white text-[10px] ml-1">{exercise.caloriesBurned} cal</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Main Content: Icon, Name, Duration */}
                                    <View className="flex-row items-center">
                                        <View className="mr-3 p-2 bg-white/10 rounded-full">
                                            {GetIconForWorkoutType(exercise.type)}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                                                {exercise.name}
                                            </Text>
                                            <Text className="text-gray-400 text-xs">
                                                Duration: {formatDuration(exercise.duration)}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => { /* TODO: Implement toggle completion */ }}
                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${exercise.completed ? 'bg-accent border-accent' : 'border-gray-500'}`}
                                        >
                                            {exercise.completed && <AntDesign name="check" size={14} color="white" />}
                                        </TouchableOpacity>
                                    </View>

                                    {/* Bottom Row: Sets, Reps, Weight (if applicable) */}
                                    {(exercise.sets || exercise.reps || exercise.weight) && (
                                        <View className="mt-2 pt-2 border-t border-white/10 flex-row justify-end space-x-2">
                                            {exercise.sets !== undefined && (
                                                <Text className="text-gray-400 text-xs">Sets: {exercise.sets}</Text>
                                            )}
                                            {exercise.reps !== undefined && (
                                                <Text className="text-gray-400 text-xs">Reps: {exercise.reps}</Text>
                                            )}
                                            {exercise.weight !== undefined && exercise.weight > 0 && (
                                                <Text className="text-gray-400 text-xs">Weight: {exercise.weight} kg</Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="items-center justify-center h-[200px]">
                            <Ionicons name="barbell-outline" size={40} color="#94a3b8" />
                            <Text className="text-slate-400 mt-2 text-center">No workouts scheduled for {daysOfWeek[selectedDay]}.</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

export default WeeklyWorkoutTasks;
