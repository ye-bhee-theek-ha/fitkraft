import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import { useApp } from '@/context/app';
import axios from 'axios';
import { BASE_URL } from '@/constants/baseUrl';
import WeeklyWorkoutTasks from "@/components/profile/workoutPlanComponent"; // Adjust path if needed
import { Duration, WorkoutType } from "@/constants/types"; // Assuming these are needed by PopulatedExercise

// --- Local Types (Matching structure expected from API Response, similar to ProgressList) ---
// These types should ideally be in your '@/constants/types' if used across multiple files.
// For now, defining them here based on your ProgressList.tsx example.
export interface PopulatedExercise { // This will be our ExerciseTask for WeeklyWorkoutTasks
    _id: string;
    name: string;
    type?: WorkoutType; // e.g., 'Cardio', 'Strength'
    duration: Duration; // e.g., { minutes: 30, seconds: 0 }
    sets?: number;
    reps?: number;
    weight?: number;
    completed?: boolean;
    caloriesBurned?: number;
    // Add any other fields that your backend provides and WeeklyWorkoutTasks might need
}

export interface WorkoutSession {
    _id: string;
    userId: string;
    date: string; // Date as ISO string from backend
    exercises: PopulatedExercise[];
    totalDuration?: Duration;
    totalCaloriesBurned?: number;
    // Add any other fields for a workout session
}

// Helper function to get the start of the current week (Monday)
const getStartOfWeek = (date: Date): Date => {
    const dt = new Date(date);
    const day = dt.getDay(); // 0 = Sunday, 1 = Monday, ...
    // Adjust to make Monday the first day (index 0)
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dt.setDate(diff));
    monday.setHours(0, 0, 0, 0); // Normalize to start of day
    return monday;
};

export const WorkoutPlanScreen = () => {
    // State for the processed weekly workouts, typed as PopulatedExercise[][]
    const [processedWeeklyWorkouts, setProcessedWeeklyWorkouts] = useState<PopulatedExercise[][]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { jwt } = useAuth(); // Assuming useAuth provides jwt
    const { userProfile } = useApp(); // Assuming useApp provides userProfile with _id

    useEffect(() => {
        const fetchAndProcessWorkoutPlan = async () => {
            // Use userProfile._id from useApp context
            if (!jwt || !userProfile?._id) {
                setError("User information is not available.");
                setIsLoading(false);
                console.log("JWT or User ID (from userProfile) missing, cannot fetch workout plan.");
                return;
            }

            setIsLoading(true);
            setError(null);
            // Initialize with 7 empty arrays for Mon-Sun
            setProcessedWeeklyWorkouts(Array(7).fill(null).map(() => []));

            try {
                const userId = userProfile._id;
                console.log(`Fetching workout history for userId: ${userId}`);

                // Fetch ALL workout sessions for the user
                const response = await axios.get<WorkoutSession[]>(
                    `${BASE_URL}/workout/get/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${jwt}` },
                        timeout: 10000, // Increased timeout slightly
                    }
                );

                console.log("Full workout history fetched:", response.data);

                if (response.data && Array.isArray(response.data)) {
                    const allWorkoutSessions: WorkoutSession[] = response.data;

                    // --- Process data for the CURRENT calendar week (Monday to Sunday) ---

                    const today = new Date();
                    const startOfWeek = getStartOfWeek(today); // Monday of the current week
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday of the current week
                    endOfWeek.setHours(23, 59, 59, 999); // Ensure end of Sunday

                    console.log(`Processing workouts for current week: ${startOfWeek.toDateString()} - ${endOfWeek.toDateString()}`);

                    // Initialize a 7-element array for Mon-Sun workouts
                    const workoutsByDay: PopulatedExercise[][] = Array(7).fill(null).map(() => []);

                    allWorkoutSessions.forEach(session => {
                        const sessionDate = new Date(session.date); // Parse session date string
                        // Normalize sessionDate to compare dates accurately
                        sessionDate.setHours(0, 0, 0, 0);

                        // Check if the session falls within the current week
                        if (sessionDate >= startOfWeek && sessionDate <= endOfWeek) {
                            const dayOfWeek = sessionDate.getDay(); // 0=Sun, 1=Mon,...
                            // Adjust index: Monday (1) -> 0, ..., Sunday (0) -> 6
                            const targetIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

                            if (targetIndex >= 0 && targetIndex < 7) {
                                // Assuming session.exercises is an array of PopulatedExercise
                                // If multiple sessions fall on the same day of the week, this will overwrite.
                                // If you need to combine them, you would push/concat here.
                                workoutsByDay[targetIndex] = session.exercises || [];
                                console.log(`Workout found for ${daysOfWeek[targetIndex]} (Index ${targetIndex}) with ${session.exercises?.length || 0} exercises.`);
                            }
                        }
                    });

                    console.log("Processed workouts for current week (Mon-Sun):", workoutsByDay);
                    setProcessedWeeklyWorkouts(workoutsByDay);

                } else {
                    console.warn("Unexpected API response structure for workout history:", response.data);
                    setError("Received invalid data format from server.");
                    setProcessedWeeklyWorkouts(Array(7).fill(null).map(() => [])); // Reset
                }

            } catch (err) {
                console.error('Error fetching or processing workout plan:', err);
                if (axios.isAxiosError(err)) {
                    setError(`Failed to fetch workout plan: ${err.response?.data?.message || err.message}`);
                } else if (err instanceof Error) {
                    setError(err.message);
                }
                else {
                    setError("An unexpected error occurred while fetching the workout plan.");
                }
                 setProcessedWeeklyWorkouts(Array(7).fill(null).map(() => [])); // Reset on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndProcessWorkoutPlan();
    }, [jwt, userProfile?._id]); // Dependencies

    // For logging purposes if needed
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <SafeAreaView className="flex-1 bg-primary_dark">
            <Stack.Screen
                options={{
                    title: 'My Workout Plan',
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} className="mx-2 p-1">
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: '#212835' },
                    headerTintColor: 'white',
                    headerTransparent: true,
                }}
            />

            <View className="flex-1 bg-primary_dark p-4 mt-20">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className="text-white mt-2">Loading Workout Plan...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center p-4">
                        <Ionicons name="alert-circle-outline" size={40} color="#f87171" />
                        <Text className="text-red-400 text-center mt-2">{error}</Text>
                    </View>
                ) : processedWeeklyWorkouts.every(dayWorkouts => dayWorkouts.length === 0) ? (
                     <View className="flex-1 justify-center items-center">
                         <Ionicons name="barbell-outline" size={50} color="#94a3b8" />
                         <Text className="text-slate-400 text-lg mt-3">No workouts scheduled for this week.</Text>
                     </View>
                 ) : (
                    <ScrollView>
                         {/* Ensure WeeklyWorkoutTasks expects weeklyWorkouts: PopulatedExercise[][] */}
                         <WeeklyWorkoutTasks weeklyWorkouts={processedWeeklyWorkouts} />
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

export default WorkoutPlanScreen;
