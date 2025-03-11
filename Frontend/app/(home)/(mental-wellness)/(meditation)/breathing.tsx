import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Audio } from "expo-av";

const difficultyLevels = [
  { inhale: 4, hold: 2, exhale: 4, reps: 6 },
  { inhale: 5, hold: 3, exhale: 5, reps: 7 },
  { inhale: 6, hold: 4, exhale: 6, reps: 8 },
  { inhale: 7, hold: 5, exhale: 7, reps: 9 },
  { inhale: 8, hold: 6, exhale: 8, reps: 10 },
];

export default function BreathingExercise({ difficulty = 3 }) {
  const [phase, setPhase] = useState("Breathe In");
  const [reps, setReps] = useState(0);
  const progress = useRef(new Animated.Value(0.1)).current;
  const { inhale, hold, exhale, reps: totalReps } = difficultyLevels[difficulty - 1];

  useEffect(() => {
    let cycle;
    if (reps < totalReps) {
      cycle = setTimeout(() => {}, 0); 
      animateBreath();
    } else {
      setPhase("Session Complete");
    }
    return () => clearTimeout(cycle);
  }, [reps]);

  const animateBreath = () => {
    setPhase("Breathe In");
    Animated.timing(progress, {
      toValue: 1,
      duration: inhale * 1000,
      useNativeDriver: false,
    }).start(() => {
      setPhase("Hold");
      setTimeout(() => {
        setPhase("Breathe Out");
        Animated.timing(progress, {
          toValue: 0.1,
          duration: exhale * 1000,
          useNativeDriver: false,
        }).start(() => {
          setReps((prev) => prev + 1);
        });
      }, hold * 1000);
    });
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-white text-heading font-bold mb-4">{phase}</Text>
      <Animated.View
        className="h-24 w-24 bg-accent rounded-full"
        style={{ transform: [{ scale: progress }] }}
      />
      <View className="h-2 w-5/6 bg-gray-300 mt-6">
        <Animated.View
          className="h-2 bg-accent"
          style={{
            width: progress.interpolate({
              inputRange: [0.1, 1],
              outputRange: ["10%", "100%"],
            }),
          }}
        />
      </View>
      <Text className="text-lg text-white mt-4">
        Repetitions: {reps}/{totalReps}
      </Text>
      {/* <TouchableOpacity className="mt-4 px-6 py-4 rounded-3xl bg-white/30" onPress={() => {}}>
        <Text className="text-white text-btn_title font-semibold">Start/Pause</Text>
      </TouchableOpacity> */}
    </View>
  );
}