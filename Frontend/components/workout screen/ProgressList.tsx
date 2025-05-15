// components/workout screen/ProgressList.tsx

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native"; // Added ActivityIndicator
import { ScrollView } from "react-native-gesture-handler";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import axios from 'axios'; // Import axios
import { useAuth } from '@/context/auth'; // Import useAuth hook
import { BASE_URL } from "@/constants/baseUrl"; // Import BASE_URL
import { Duration, WorkoutType } from "@/constants/types"; // Import shared types

// --- Local Types (Matching structure expected from API Response) ---
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

export interface WorkoutSession {
    _id: string;
    userId: string;
    date: string; // Date as string from backend/prop
    exercises: PopulatedExercise[];
    totalDuration?: Duration;
    totalCaloriesBurned?: number;
}

// Define WorkoutDayProgress locally or import if defined elsewhere
export interface WorkoutDayProgress {
  date: Date;
  day?: string;
  current?: boolean; // Represents if the date is the most recent in the history provided
  hasWorkout?: boolean;
}

// Props interface - No longer needs workoutHistory
export interface WorkoutProgressListProps {
  // Removed workoutHistory prop
  currentDate: Date; // Used for initial selection
}

// Helper function to format duration
const formatDuration = (duration: Duration | undefined): string => {
    if (!duration) return "00:00";
    const minutes = String(duration.minutes || 0).padStart(2, "0");
    const seconds = String(duration.seconds || 0).padStart(2, "0");
    return `${minutes}:${seconds}`;
};

const ProgressList: React.FC<WorkoutProgressListProps> = ({ currentDate }) => {
  // --- Local State ---
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]); // State to hold fetched history
  const [isLoadingHistory, setIsLoadingHistory] = useState(true); // Loading state
  const [historyError, setHistoryError] = useState<string | null>(null); // Error state
  const { authUser, jwt } = useAuth(); // Get auth info

  // Initialize selectedDate based on fetched history or current date
  const initialSelectedDate = useMemo(() => {
       if (workoutHistory && workoutHistory.length > 0) {
            const sortedDates = [...workoutHistory]
               .map(w => new Date(w.date))
               .sort((a, b) => b.getTime() - a.getTime());
            return sortedDates[0];
       }
       return currentDate;
  }, [workoutHistory, currentDate]);

  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);
  const [previousWorkout, setPreviousWorkout] = useState<WorkoutSession | undefined>(undefined);
  const slideOutAnimation = useSharedValue(0);
  const slideInAnimation = useSharedValue(1);

   // --- Fetch Full Workout History ---
   useEffect(() => {
        const fetchWorkoutHistory = async () => {
            if (!authUser?._id || !jwt) {
                setHistoryError("User not authenticated.");
                setIsLoadingHistory(false);
                return;
            }

            setIsLoadingHistory(true);
            setHistoryError(null);
            try {
                // Fetch all workouts using GET /workout/get/:userId
                const response = await axios.get<WorkoutSession[]>(`${BASE_URL}/workout/get/${authUser._id}`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                    timeout: 7000,
                });
                const fetchedHistory = response.data || [];
                setWorkoutHistory(fetchedHistory);

                // Update initial selected date after fetching
                if (fetchedHistory.length > 0) {
                     const sortedDates = [...fetchedHistory]
                        .map(w => new Date(w.date))
                        .sort((a, b) => b.getTime() - a.getTime());
                     setSelectedDate(sortedDates[0]); // Select the most recent date from fetched history
                } else {
                    setSelectedDate(currentDate); // Fallback if history is empty
                }

            } catch (err) {
                console.error("Error fetching workout history:", err);
                if (axios.isAxiosError(err)) {
                    const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch workout history';
                    setHistoryError(errorMessage);
                } else if (err instanceof Error) {
                     setHistoryError(err.message);
                } else {
                    setHistoryError('An unexpected error occurred');
                }
                 setWorkoutHistory([]); // Clear history on error
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchWorkoutHistory();
    }, [authUser?._id, jwt, currentDate]); // Rerun if auth changes

  // Calculate the 7-day progress view based on the available history
  const weekProgress: WorkoutDayProgress[] = useMemo(() => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const result: WorkoutDayProgress[] = [];
    const sortedDates = workoutHistory
      .map((workout) => new Date(workout.date))
      .sort((a, b) => b.getTime() - a.getTime());
    const mostRecentWorkoutDate = sortedDates[0] || new Date();
    mostRecentWorkoutDate.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(mostRecentWorkoutDate);
      date.setDate(mostRecentWorkoutDate.getDate() - i);
      date.setHours(0,0,0,0);
      const workoutForDate = workoutHistory.find((workout) => {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0,0,0,0);
        return workoutDate.getTime() === date.getTime();
      });
      result.push({ date, day: days[date.getDay()], current: date.getTime() === mostRecentWorkoutDate.getTime(), hasWorkout: !!workoutForDate });
    }
    return result;
  }, [workoutHistory]);

  // Find the workout corresponding to the currently selected date button
  const selectedWorkout = useMemo(() => {
    return workoutHistory.find((workout) => {
      const workoutDate = new Date(workout.date);
      return workoutDate.toDateString() === selectedDate.toDateString();
    });
  }, [workoutHistory, selectedDate]);

  // Handle clicking on a date button
  const handleDatePress = useCallback((date: Date) => {
      const workoutToSlideOut = workoutHistory.find((workout) =>
          new Date(workout.date).toDateString() === selectedDate.toDateString()
      );
      setPreviousWorkout(workoutToSlideOut);
      setSelectedDate(date);
      slideOutAnimation.value = 0;
      slideInAnimation.value = 1;
      slideOutAnimation.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      slideInAnimation.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    },
    [slideOutAnimation, slideInAnimation, selectedDate, workoutHistory]
  );

  // Animation styles remain the same
  const animatedStyleOut = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(slideOutAnimation.value * -100, { duration: 300 }) }],
    opacity: withTiming(1 - slideOutAnimation.value, { duration: 300 }),
    position: 'absolute', top: 0, left: 0, right: 0,
  }));
  const animatedStyleIn = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(slideInAnimation.value * 100, { duration: 300 }) }],
    opacity: withTiming(1 - slideInAnimation.value, { duration: 300 }),
  }));

  // Helper function to render exercise details
  const renderExercise = (exercise: PopulatedExercise, index: number) => (
     <View key={exercise._id || index} className="flex-row items-center justify-between p-3 rounded-lg">
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
  );

  // --- Render Logic ---
  if (isLoadingHistory) {
       return (
           <View className="bg-primary_dark/50 rounded-3xl p-4 h-40 flex items-center justify-center">
               <ActivityIndicator size="large" color="#FFFFFF" />
               <Text className="text-white text-center mt-2">Loading Progress...</Text>
           </View>
       );
  }

  if (historyError) {
       return (
           <TouchableOpacity onPress={() => setHistoryError(null)}> {/* Allow dismissing error */}
               <View className="bg-red-900/50 border border-red-500 rounded-3xl p-4 h-40 flex items-center justify-center">
                    <MaterialIcons name="error-outline" size={40} color="#FF6F61" />
                    <Text className="text-red-300 text-center mt-2 px-4">{historyError}</Text>
                    <Text className="text-red-400 text-xs mt-1">(Tap to dismiss)</Text>
               </View>
           </TouchableOpacity>
       );
  }

  // Main component render
  return (
    <View className="bg-primary_dark/50 rounded-3xl p-4">
      {/* Weekday Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row space-x-2">
          {weekProgress.map((day, index) => (
            <TouchableOpacity
              key={index} onPress={() => handleDatePress(day.date)}
              className={`items-center justify-center w-12 h-14 rounded-2xl ${ day.date.toDateString() === selectedDate.toDateString() ? "bg-white" : "border border-white/20 bg-primary_dark/5" }`}
            >
              <Text className={`text-xs font-medium ${ day.date.toDateString() === selectedDate.toDateString() ? "text-primary" : "text-gray-400" }`}>{day.day}</Text>
              <Text className={`text-base font-bold ${ day.date.toDateString() === selectedDate.toDateString() ? "text-primary" : "text-white" }`}>{day.date.getDate()}</Text>
              {day.hasWorkout && day.date.toDateString() !== selectedDate.toDateString() && ( <View className="w-1.5 h-1.5 bg-accent_blue rounded-full absolute bottom-1"/> )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Animated Workout Details Container */}
      <View className="relative overflow-hidden min-h-[150px]">
        {/* Previous Workout (Sliding Out) */}
        <Animated.View style={animatedStyleOut}>
          {previousWorkout ? (
            <View className="border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden">
              <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.1)"]} locations={[0, 0.5, 1]} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: 15 }} />
              <ScrollView scrollEnabled={previousWorkout.exercises.length > 3} showsVerticalScrollIndicator={false} className={`${previousWorkout.exercises.length > 3 ? "h-52" : ""}`}>
                {previousWorkout.exercises.map(renderExercise)}
              </ScrollView>
            </View>
          ) : <View className="h-[1px]" />}
        </Animated.View>

        {/* Selected Workout (Sliding In) */}
        <Animated.View style={animatedStyleIn}>
          {selectedWorkout ? (
            <View className="border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden">
              <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.1)"]} locations={[0, 0.5, 1]} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: 15 }} />
              <ScrollView scrollEnabled={selectedWorkout.exercises.length > 3} showsVerticalScrollIndicator={false} className={`${selectedWorkout.exercises.length > 3 ? "h-52" : ""}`}>
                {selectedWorkout.exercises.map(renderExercise)}
              </ScrollView>
            </View>
          ) : (
            <View className="flex items-center justify-center h-[150px]">
                <Ionicons name="calendar-outline" size={30} color="#a1a1aa" />
                <Text className="text-zinc-400 mt-2">No workout recorded for this day.</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

export default ProgressList;
