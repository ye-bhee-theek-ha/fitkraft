import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, ScrollView } from "react-native";

export default function BodyScanMeditation() {
  const [currentPart, setCurrentPart] = useState("Head");
  const bodyParts = ["Head", "Neck", "Shoulders", "Arms", "Hands", "Chest", "Back", "Hips", "Legs", "Feet"];
  const progress = new Animated.Value(0);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < bodyParts.length) {
        setCurrentPart(bodyParts[index]);
        Animated.timing(progress, {
          toValue: (index + 1) / bodyParts.length,
          duration: 10,
          useNativeDriver: false,
        }).start();
        index++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-green-100 p-6">
      <Text className="text-heading font-bold mb-4 text-white">Body Scan Meditation</Text>
      <ScrollView className="w-full p-4 bg-white border-2 border-accent rounded-lg shadow-md" style={{ maxHeight: 400 }}>
        <Text className="text-lg text-gray-700 mb-2">
          Sitting comfortably, take a deep breath in through the nose, and out through the mouth. As you breathe out, close your eyes and notice how your body feels.
        </Text>
        <Text className="text-lg text-gray-700 mb-2">
          Start at the top of your head and mentally scan down through your body, noticing areas of comfort and discomfort. You're not trying to change anything — just observing.
        </Text>
        <View className="h-6"/>
      </ScrollView>
      <Text className="text-lg text-accent
       font-bold text-center mt-4">Current Focus: {currentPart}</Text>
      
      <TouchableOpacity className="mt-6 px-6 py-2 bg-white/50 rounded-2xl" onPress={() => setCurrentPart("Head")}>
        <Text className="text-white text-lg">Restart</Text>
      </TouchableOpacity>
    </View>
  );
}
