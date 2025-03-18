import type React from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient"
import { ScrollView } from 'react-native-gesture-handler'
import { WorkoutListProps } from "@/constants/types";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/auth'; // Import useAuth hook
import Constants from 'expo-constants';

// Add interface at the top of the file, after imports
interface Exercise {
    name: string;
    type: string;
    duration: {
        minutes: number;
        seconds: number;
    };
    sets: number;
    reps: number;
    weight: number;
    completed: boolean;
}

interface Workout {
    _id: string;
    userId: string;
    date: string;
    duration: number;
    caloriesBurned: number;
    exercises: Exercise[];
}

const WorkoutList: React.FC = () => {
    const [workouts, setWorkouts] = useState<Workout | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth(); // Get current user from auth context

    // Get the development server URL when using Expo
    const getDevServerUrl = () => {
        const manifest = Constants.manifest2 || Constants.manifest;
        const hostUri = (manifest as any)?.extra?.expoClient?.hostUri;
        if (hostUri) {
            const devServer = hostUri.split(':').slice(0, -1).join(':');
            return `http://${devServer}:5000`;
        }
        return 'http://192.168.1.100:5000';  // Replace with your actual IP address
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
            console.log('Response:', response.data);
            const workoutData: Workout = response.data[0] || null;
            const exercisesData: Exercise[] = workoutData?.exercises || [];
            setWorkouts(workoutData);
            setExercises(exercisesData);
            setError(null);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const errorMessage = err.response?.data?.message || 
                                   err.message || 
                                   'Failed to fetch workouts';
                setError(errorMessage);
                console.error('Error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    baseUrl: getDevServerUrl() // Log the URL being used
                });
            } else {
                setError('An unexpected error occurred');
                console.error('Error fetching workouts:', err);
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
            <View className="bg-primary_dark p-3 rounded-3xl">
                <Text className="text-white text-center">Loading workouts...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="bg-primary_dark p-3 rounded-3xl">
                <Text className="text-white text-center">{error}</Text>
            </View>
        );
    }
    

    return (
        <View className="bg-primary_dark p-3 rounded-3xl">
            <View className="flex-row items-center m-2 mb-2 mt-0">
                <Ionicons name="barbell-outline" size={24} color="white" style={{ transform: [{ rotate: '45deg' }] }} />
                <Text className="text-white text-text font-semibold ml-2">Workout</Text>
            </View>
            <View className="border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden">
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.01)', 'rgba(255,255,255,0.1)']}
                    locations={[0, .5, 1]}
                    style={{ flex: 1, borderRadius: 15 }}
                    className="absolute bottom-0 left-0 h-full w-full"
                />
                <ScrollView scrollEnabled={exercises.length > 3} showsVerticalScrollIndicator={false} className={`${exercises.length > 3 ? "h-52" : ""}`}>
                    {exercises.map((exercise, index) => (
                        <View key={index} className=" flex-row items-center justify-between p-3 rounded-lg">
                            <View className="flex-row items-center flex-1">
                                <View className="flex flex-col w-4 mr-2">
                                    <View className={`w-3 h-7 mb-1 rounded-full mr-3 ${exercise.completed ? "bg-green" : "bg-gray-500"}`} />
                                    <Ionicons name="time-sharp" size={14} color="#9CA3AF" />
                                </View>

                                <View className="flex-1">
                                    <Text className="text-white font-medium text-medium pr-2">{exercise.name}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-gray-400 text-sm ml-1">{formatDuration(exercise.duration)}</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-col items-start">
                                <View className="flex-row">
                                    {exercise.completed && (
                                        <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex items-center justify-center">
                                            <AntDesign name="checkcircle" size={10} color="#63F19E" />
                                        </View>
                                    )}
                                    <View className="w-1" />
                                    {workouts?.caloriesBurned && (
                                        <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                                            <MaterialIcons name="local-fire-department" size={10} color="#FF6F61" />
                                            <Text className="text-white text-icon_text ml-1">
                                                {workouts.caloriesBurned}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                    <Text className="text-gray-400 text-sm mr-2">Sets {exercise.sets}x Reps {exercise.reps}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    )
}

export default WorkoutList

