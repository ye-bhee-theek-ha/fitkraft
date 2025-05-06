// components/home screen/WorkoutListHome.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react"; // Import React hooks
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native"; // Added TouchableOpacity
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from 'react-native-gesture-handler';
import axios, { AxiosError } from 'axios'; // Import AxiosError
import { useAuth } from '@/context/auth';
import { BASE_URL } from "@/constants/baseUrl";
import { Duration, WorkoutType } from "@/constants/types";

// --- Local Types based on API Response ---
// Define Exercise structure based on what GET /workout/get/:userId populates
interface PopulatedExercise {
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

// Define WorkoutSession structure based on GET /workout/get/:userId response
interface WorkoutSession {
    _id: string;
    userId: string;
    date: string; // Date as string from backend
    exercises: PopulatedExercise[];
    totalDuration?: Duration; // Optional, if backend calculates
    totalCaloriesBurned?: number; // Optional, if backend calculates
}

// Helper function to format duration
const formatDuration = (duration: Duration | undefined): string => {
    if (!duration) return "00:00";
    const minutes = String(duration.minutes || 0).padStart(2, "0");
    const seconds = String(duration.seconds || 0).padStart(2, "0");
    return `${minutes}:${seconds}`;
};

const WorkoutList: React.FC = () => {
    // --- Local State ---
    const [latestWorkout, setLatestWorkout] = useState<WorkoutSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { authUser, jwt } = useAuth();

    // --- Fetch Data ---
    const fetchWorkouts = useCallback(async (showLoading = true) => { // Added showLoading flag
        if (!authUser?._id || !jwt) {
            setError("User not authenticated.");
             if (showLoading) setLoading(false);
            return;
        }

        if (showLoading) setLoading(true);
        setError(null); // Clear previous error
        try {
            // Fetch workouts from the last 7 days (as this component shows the 'latest')
            // If you need *all* workouts, change the endpoint
            const response = await axios.get<WorkoutSession[]>(`${BASE_URL}/workout/get/last7days/${authUser._id}`, {
                headers: { Authorization: `Bearer ${jwt}` },
                timeout: 7000,
            });

            const workouts = response.data || [];

            if (workouts.length > 0) {
                const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setLatestWorkout(sortedWorkouts[0]);
            } else {
                setLatestWorkout(null); // Explicitly set to null if no workouts found
            }
        } catch (err) {
             console.error("Error fetching latest workout:", err);
             let errorMessage = 'An unexpected error occurred while fetching workouts.'; // Default error

             if (axios.isAxiosError(err)) {
                 // Check for the specific "No workouts found" error message, even if it's a 500
                 if (err.response?.status === 500 && err.response?.data?.error === "No workouts found for this user") {
                      console.log("Backend reported 500 but it's a 'No workouts found' scenario.");
                      setLatestWorkout(null); // Treat as no data found
                      setError(null); // Clear the error state in this specific case
                      errorMessage = ''; // Prevent setting generic error message
                 } else {
                     // Handle other Axios errors
                     errorMessage = err.response?.data?.message || err.message || 'Failed to fetch latest workout';
                 }
             } else if (err instanceof Error) {
                  errorMessage = err.message;
             }

             if (errorMessage) { // Only set error if it wasn't the specific "not found" 500 error
                 setError(errorMessage);
             }
             setLatestWorkout(null); // Clear data on error
        } finally {
             if (showLoading) setLoading(false);
        }
    }, [authUser?._id, jwt]); // Dependencies

    useEffect(() => {
        fetchWorkouts();
    }, [fetchWorkouts]); // Fetch on mount and when fetchWorkouts changes (due to auth changes)

    // Get exercises from the latest workout
    const exercises = latestWorkout?.exercises || [];

    // --- Render Logic ---
    if (loading) {
        return (
            <View className="bg-primary_dark p-3 rounded-3xl h-40 flex items-center justify-center">
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="text-white text-center mt-2">Loading Workout...</Text>
            </View>
        );
    }

    // Display error, unless it was the specific "not found" case handled above
    if (error) {
        return (
            <TouchableOpacity onPress={() => fetchWorkouts()}>
                <View className="bg-red-900/50 border border-red-500 rounded-3xl p-3 h-40 flex items-center justify-center">
                     <MaterialIcons name="error-outline" size={40} color="#FF6F61" />
                     <Text className="text-red-300 text-center mt-2 px-4">{error}</Text>
                     <Text className="text-red-400 text-xs mt-1">(Tap to retry)</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // Display message if no workout was found (either 200 OK with empty array, or the specific 500 error)
    if (!latestWorkout || exercises.length === 0) {
        return (
            <View className="bg-primary_dark p-3 rounded-3xl h-40 flex items-center justify-center">
                 <Ionicons name="barbell-outline" size={40} color="#a1a1aa" style={{ transform: [{ rotate: '45deg' }] }}/>
                 <Text className="text-zinc-400 text-center mt-2">No recent workout data found.</Text>
                 {/* Optionally add a button to create a workout */}
            </View>
        );
    }

    // Render the latest workout details
    return (
        <View className="bg-primary_dark p-3 rounded-3xl">
            <View className="flex-row items-center m-2 mb-2 mt-0">
                <Ionicons name="barbell-outline" size={24} color="white" style={{ transform: [{ rotate: '45deg' }] }} />
                <Text className="text-white text-text font-semibold ml-2">Workouts</Text>
            </View>
            <View className="border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden">
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.01)', 'rgba(255,255,255,0.1)']}
                    locations={[0, .5, 1]}
                    style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: 15 }}
                />
                <ScrollView
                    scrollEnabled={exercises.length > 3}
                    showsVerticalScrollIndicator={false}
                    className={`${exercises.length > 3 ? "h-52" : ""}`}
                >
                    {exercises.map((exercise: PopulatedExercise, index: number) => (
                        <View key={exercise._id || index} className=" flex-row items-center justify-between p-3 rounded-lg">
                            {/* Left side */}
                            <View className="flex-row items-center flex-1 mr-2">
                                <View className="flex flex-col w-4 mr-2 items-center">
                                    <View className={`w-3 h-7 mb-1 rounded-full ${exercise.completed ? "bg-green" : "bg-gray-500"}`} />
                                    <Ionicons name="time-sharp" size={14} color="#9CA3AF" />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-white font-medium text-medium pr-2" numberOfLines={1} ellipsizeMode="tail">{exercise.name}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-gray-400 text-sm">{formatDuration(exercise.duration)}</Text>
                                    </View>
                                </View>
                            </View>
                            {/* Right side */}
                            <View className="flex-col items-end">
                                <View className="flex-row mb-1">
                                    {exercise.completed && ( <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex items-center justify-center mr-1"><AntDesign name="checkcircle" size={10} color="#63F19E" /></View> )}
                                    {exercise.caloriesBurned !== undefined && exercise.caloriesBurned !== null && ( <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center"><MaterialIcons name="local-fire-department" size={10} color="#FF6F61" /><Text className="text-white text-icon_text ml-1">{exercise.caloriesBurned}</Text></View> )}
                                </View>
                                {(exercise.sets !== undefined || exercise.reps !== undefined) && ( <Text className="text-gray-400 text-sm">{exercise.sets ? `Sets ${exercise.sets}` : ''}{exercise.sets && exercise.reps ? ' x ' : ''}{exercise.reps ? `Reps ${exercise.reps}` : ''}</Text> )}
                                {exercise.weight !== undefined && exercise.weight !== null && exercise.weight > 0 && ( <Text className="text-gray-400 text-xs mt-0.5">{exercise.weight} kg</Text> )}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

export default WorkoutList;
