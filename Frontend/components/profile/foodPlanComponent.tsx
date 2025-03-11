import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { DietaryItem, MealTimeName } from "@/constants/types";
import { BlurView } from "expo-blur";

interface WeeklyMealPlanProps {
  weeklyMeals: DietaryItem[][];
}

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
      return <MaterialCommunityIcons name="food-variant" size={28} color="white" />;
    case "post-workout":
      return <MaterialIcons name="local-drink" size={28} color="white" />;
    case "workout":
      return <MaterialIcons name="fitness-center" size={28} color="white" />;
    default:
      return null;
  }
};

const WeeklyMealPlanComponent: React.FC<WeeklyMealPlanProps> = ({ weeklyMeals }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View className="bg-primary_dark rounded-3xl">

      {/* Meal List Header */}
      <View className="flex-row items-center m-2 mb-2 mt-0">
        <MaterialCommunityIcons name="food-apple" size={28} color="white" />
        <Text className="text-white text-heading font-semibold ml-2">Daily Meal Plan</Text>
      </View>


      {/* Day Selector */}
      <View className="flex-row justify-between mb-3 rounded-lg">
        {daysOfWeek.map((day, index) => (
          <Pressable 
            key={day} 
            onPress={() => setSelectedDay(index)}
            className={` rounded-2xl  ${selectedDay === index ? 'bg-white/20' : ''}`}
          >
            <Text className="text-white text-sm py-4 px-3">{day}</Text>
          </Pressable>
        ))}
      </View>


      {/* Meal List Container */}
      <View className="border-2 border-white/20 rounded-3xl overflow-hidden relative">
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.1)"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: 15 }}
          className="absolute bottom-0 left-0 h-full w-full"
        />
        <ScrollView
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          className={`py-4 h-[80%]`}
        >
          <View className="h-full mb-14 space-y-4">
            {weeklyMeals[selectedDay].map((diet, index) => (
              <View className="mx-3">
                <View className="flex flex-row">
                  <View className="flex-row mb-1 ">
                    <Text className="text-gray-400 font-semibold text-text ml-2 ">
                      {diet.time_name}
                    </Text>
                  </View>

                  <View className="flex-row flex flex-1 justify-end p-2">
                    {diet.completed && (
                    <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex items-center justify-center">
                      <AntDesign name="checkcircle" size={10} color="#63F19E" />
                    </View>
                    )}
                    <View className="w-1" />
                    {diet.fats !== undefined && (
                      <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                        <MaterialIcons name="water-drop" size={10} color="#6dd5fa" />
                        <Text className="text-white text-icon_text ml-1">{diet.fats}g</Text>
                      </View>
                    )}
                    <View className="w-1" />
                    {diet.proteins !== undefined && (
                      <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                        <MaterialCommunityIcons name="chemical-weapon" size={10} color="#7bffba" />
                        <Text className="text-white text-icon_text ml-1">{diet.proteins}g</Text>
                      </View>
                    )}
                    <View className="w-1" />
                    {diet.carbohydrates !== undefined && (
                      <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center">
                        <FontAwesome6 name="jar-wheat" size={10} color="#fff3d4" />
                        <Text className="text-white text-icon_text ml-1">{diet.carbohydrates}g</Text>
                      </View>
                    )}
                  </View>

                </View>
                <BlurView
                  className="border border-white/50"
                  intensity={20}
                  tint="light"
                  style={{
                    flexDirection: 'row',
                    height: 60,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 12, // p-3 (approx.)
                    paddingVertical: 8, // py-2
                    marginBottom: 4, // mb-1
                    borderRadius: 12, // rounded-lg
                    overflow: "hidden",
                  }}
                >
                  <View className="flex-row items-center flex-1 h-full">
                    <View className="h-full flex justify-center flex-col mr-2">
                      {GetIconForTime(diet.time_name)}
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-white font-semibold text-btn_title pr-2">
                          {diet.name}
                        </Text>
                      </View>
                    </View>
                  </View>
                </BlurView>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default WeeklyMealPlanComponent;
