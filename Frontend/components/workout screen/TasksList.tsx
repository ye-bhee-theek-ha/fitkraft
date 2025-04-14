import type React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/context/auth'
import Constants from 'expo-constants'
import { Workout,Exercise } from "@/constants/types"


const TasksList: React.FC = () => {
    const [workouts, setWorkouts] = useState<Workout | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const getDevServerUrl = () => {
        const manifest = Constants.manifest2 || Constants.manifest;
        const hostUri = (manifest as any)?.extra?.expoClient?.hostUri;
        if (hostUri) {
            const devServer = hostUri.split(':').slice(0, -1).join(':');
            return `http://${devServer}:5000`;
        }
        return 'http://192.168.1.100:5000';
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            const baseUrl = getDevServerUrl();
            const response = await axios.get(`${baseUrl}/workout/get/user123`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
                timeout: 5000,
            });
            const workoutData: Workout = response.data[0] || null;
            const exercisesData: Exercise[] = workoutData?.exercises || [];
            setWorkouts(workoutData);
            setExercises(exercisesData);
            setError(null);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch workouts';
                setError(errorMessage);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (duration: { minutes: number; seconds: number } | undefined) => {
        if (!duration) {
            return "00:00";
        }
        const minutes = String(duration.minutes || 0).padStart(2, "0");
        const seconds = String(duration.seconds || 0).padStart(2, "0");
        return `${minutes}:${seconds}`;
    }

    if (loading) {
        return (
            <View className="bg-primary_dark/50 rounded-3xl p-2">
                <Text className="text-white text-center">Loading workouts...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="bg-primary_dark/50 rounded-3xl p-2">
                <Text className="text-white text-center">{error}</Text>
            </View>
        );
    }

    return (
        <View className="bg-primary_dark/50 rounded-3xl p-2">
            <View className="space-y-3">
                {exercises.map((exercise, index) => (
                    <View key={index} className="bg-primary_dark rounded-2xl border-2 border-white/20 p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <TouchableOpacity
                                className={`w-10 h-10 rounded-full items-center justify-center ${
                                    exercise.completed ? "bg-green" : "bg-primary_light"
                                }`}
                            >
                                {exercise.completed ? <Ionicons name="checkmark-done-circle" size={24} color="#212835" /> : <View className="rounded-full w-7 h-7 border border-white/20 bg-primary_dark" />}
                            </TouchableOpacity>
                            <View className="ml-4 flex-1">
                                <Text className="text-white text-lg font-semibold">{exercise.name}</Text>
                                <View className="flex-row items-center mt-1">
                                    <MaterialIcons name="timer" size={14} color="#9CA3AF" />
                                    <Text className="text-gray-400 ml-1">{formatDuration(exercise.duration)}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                {workouts?.caloriesBurned && (
                                    <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                                        <MaterialIcons name="local-fire-department" size={10} color="#FF6F61" />
                                        <Text className="text-white text-icon_text ml-1">
                                            {workouts?.caloriesBurned}
                                        </Text>
                                    </View>
                                )}
                                <Text className="text-gray-400 text-sm mt-1">Sets {exercise.sets}x Reps {exercise.reps}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    )
}

export default TasksList

