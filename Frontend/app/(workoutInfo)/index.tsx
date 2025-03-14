import React, { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, RouteProp } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Define the router parameters type
type RootStackParamList = {
  ExerciseDetail: { exerciseId: string };
};

type Exercise = {
  id: string;
  name: string;
  description: string;
  gifUrl: string;
  metrics: {
    duration: string;
    calories: string;
    sets: number;
    reps: string;
  };
};

const ExerciseDetailScreen: React.FC = () => {
  // Get exercise id from route params
  const route = useRoute<RouteProp<RootStackParamList, "ExerciseDetail">>();
  const { exerciseId } = route.params;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<boolean>(false);

  // Simulate fetching data from the backend
  useEffect(() => {
    setTimeout(() => {
      const fetchedExercise: Exercise = {
        id: exerciseId,
        name: "Push-ups",
        description:
          "Push-ups are a fundamental bodyweight exercise that target the chest, shoulders, triceps, and core. They help build upper body strength and stability.",
        gifUrl: "https://www.dropbox.com/s/abc123/pushups.gif?raw=1",
        metrics: {
          duration: "5 min",
          calories: "50 kcal",
          sets: 3,
          reps: "12 reps per set",
        },
      };
      setExercise(fetchedExercise);
      setLoading(false);
    }, 1500);
  }, [exerciseId]);

  if (loading || !exercise) {
    return (
      <View className="flex-1 bg-primary_dark justify-center items-center">
        <ActivityIndicator size="large" color="#FFC1A1" />
        <Text className="text-white mt-4">Loading Exercise...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary_dark">
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.15)"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 2 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header: Name and Description */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-accent">{exercise.name}</Text>
          <Text className="text-primary_light mt-2">{exercise.description}</Text>
        </View>

        {/* GIF Preview */}
        <View className="mb-6">
          <Image
            source={{ uri: exercise.gifUrl }}
            className="w-full h-48 rounded-lg"
            resizeMode="cover"
          />
        </View>

        {/* Key Metrics Card */}
        <View className="bg-button_bg p-4 rounded-lg mb-6">
          <Text className="text-white text-lg font-semibold mb-3">Key Metrics</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <MaterialIcons name="timer" size={24} color="#FFC1A1" />
              <Text className="text-white mt-1">{exercise.metrics.duration}</Text>
            </View>
            <View className="items-center">
              <MaterialIcons name="local-fire-department" size={24} color="#FFC1A1" />
              <Text className="text-white mt-1">{exercise.metrics.calories}</Text>
            </View>
            <View className="items-center">
              <MaterialIcons name="repeat" size={24} color="#FFC1A1" />
              <Text className="text-white mt-1">{exercise.metrics.sets} Sets</Text>
            </View>
            <View className="items-center">
              <MaterialIcons name="fitness-center" size={24} color="#FFC1A1" />
              <Text className="text-white mt-1">{exercise.metrics.reps}</Text>
            </View>
          </View>
        </View>

        {/* Expandable Section for Additional Information */}
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          className="bg-accent_light p-3 rounded-lg mb-6"
        >
          <Text className="text-primary_dark font-semibold">
            {expanded ? "Hide Details" : "Show More Details"}
          </Text>
        </TouchableOpacity>
        {expanded && (
          <View className="bg-accent p-3 rounded-lg mb-6">
            <Text className="text-primary_dark">
              Additional details about the exercise can be displayed here. This may include form tips, common mistakes, or other insights to maximize the benefit.
            </Text>
          </View>
        )}

        {/* Interactive Progress Indicator */}
        <View className="bg-button_bg p-3 rounded-lg">
          <Text className="text-white font-semibold mb-2">Exercise Progress</Text>
          <View className="h-2 bg-primary_light rounded-full overflow-hidden">
            <View className="h-full bg-green" style={{ width: "70%" }} />
          </View>
          <Text className="text-white mt-2">70% Completed</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ExerciseDetailScreen;
