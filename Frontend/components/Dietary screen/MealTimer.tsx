"use client";

import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Pressable,
} from "react-native";
import Svg, { Path, Defs, Mask, Rect } from "react-native-svg";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
  AntDesign,
  FontAwesome6,
  Ionicons,
} from "@expo/vector-icons";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import type { DietaryItem, DietaryTimeInterfaceProps, MealItem, MealTimeName, TooltipState } from "@/constants/types";
import EditMealModal from "./EditMealModal"
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/context/app";
import { useAuth } from "@/context/auth";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "@/constants/baseUrl";

const AnimatedRect = Animated.createAnimatedComponent(Rect);



const { width } = Dimensions.get("window");
const ITEM_WIDTH = width - 48; // FlatList item width
const SVG_WIDTH = width - 48; // Assuming 24px padding on each side
const SVG_HEIGHT = SVG_WIDTH / 2;
const CENTER_X = SVG_WIDTH / 2;
const CENTER_Y = SVG_HEIGHT;
const RADIUS_X = (SVG_WIDTH - 40) / 2;
const RADIUS_Y = SVG_HEIGHT - 20;

interface BackendMealInput {
    name: string;
    calories: number;
    protein: number; 
    carbs: number; 
    fats: number;
    category: MealTimeName;
}

type PositionedMealItem = MealItem & {
  computedTime: string;
  x: number;
  y: number;
};

const MealTimer: React.FC<DietaryTimeInterfaceProps> = ({
  WorkoutTime,
  onAddCustom,
}) => {

  const {dietary} = useApp()

  console.log(dietary)

  const [currentTime, setCurrentTime] = useState(new Date());
  const progress = useSharedValue(0);
  const flatListRef = useRef<FlatList<PositionedMealItem>>(null);
  const [selectedMealIndex, setSelectedMealIndex] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, text: "", index: -1 });

  const [isSubmittingMeal, setIsSubmittingMeal] = useState(false); 

  const { authUser, jwt } = useAuth();
  const {fetchDietaryData, selectedDate} = useApp();

  // Shared value for selected icon index to drive animated scaling/zIndex.
  const selectedIndexSV = useSharedValue(0);

  // Using reanimated shared value for tooltip fade.
  const fadeValue = useSharedValue(0);
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
  }));

  const showTooltip = useCallback((text: string, index: number) => {
    setTooltip({ visible: true, text, index });
    fadeValue.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
    const timeoutId = setTimeout(() => {
      fadeValue.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) });
      setTimeout(() => {
        setTooltip({ visible: false, text: "", index: -1 });
      }, 200);
    }, 5000);
    return () => clearTimeout(timeoutId);
  }, [fadeValue]);

  const mapFrontendMealToBackendInput = (meal: MealItem): any => {
    return {
        Name: meal.name,
        Calories: meal.calories,
        Protein: meal.proteins, // Map frontend 'proteins' to backend 'protein'
        Carbs: meal.carbohydrates, // Map frontend 'carbohydrates' to backend 'carbs'
        Fats: meal.fats,
        Category: meal.time_name, // Map frontend 'time_name' to backend 'category'
    };
};

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      const startMinutes = 7 * 60; // 07:00
      const endMinutes = 20 * 60; // 20:00
      const totalMinutes = endMinutes - startMinutes;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentProgress = Math.max(0, Math.min(1, (currentMinutes - startMinutes) / totalMinutes));
      progress.value = withTiming(currentProgress, { duration: 1000 });
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [progress]);

  const animatedMaskProps = useAnimatedProps(() => ({
    width: progress.value * SVG_WIDTH,
  }));

  // Compute positions and sort items from morning to dinner.
  const mealPositions = useMemo(() => {
    // Default times for each meal type.
    const defaultTimes: Record<string, string> = {
      breakfast: "07:00",
      lunch: "12:00",
      dinner: "19:00",
      snack: "15:00",
      "pre-workout": "14:00",
      "post-workout": "16:00",
    };
  
    // Adjust pre-workout and post-workout if WorkoutTime is provided.
    if (WorkoutTime) {
      const [workoutHourStr, workoutMinStr] = WorkoutTime.split(":");
      const workoutHour = parseInt(workoutHourStr, 10);
      const workoutMin = parseInt(workoutMinStr, 10);
      const workoutTotal = workoutHour * 60 + workoutMin;
  
      // Pre-workout: 15 minutes before WorkoutTime.
      const preWorkoutTotal = workoutTotal - 15;
      const preWorkoutHour = Math.floor(preWorkoutTotal / 60);
      const preWorkoutMin = preWorkoutTotal % 60;
      defaultTimes["pre-workout"] = `${preWorkoutHour.toString().padStart(2, "0")}:${preWorkoutMin.toString().padStart(2, "0")}`;
  
      // Post-workout: 1 hour after WorkoutTime.
      const postWorkoutTotal = workoutTotal + 60;
      const postWorkoutHour = Math.floor(postWorkoutTotal / 60);
      const postWorkoutMin = postWorkoutTotal % 60;
      defaultTimes["post-workout"] = `${postWorkoutHour.toString().padStart(2, "0")}:${postWorkoutMin.toString().padStart(2, "0")}`;
    }
  
    // Map diet items with computedTime.
    let items: (MealItem & { computedTime: string})[] = (dietary?.Meals || []).map((diet) => {
      const lookupKey = diet.time_name?.toLowerCase() || '';
      const time = diet.time || defaultTimes[lookupKey] || "12:00";
      return { ...diet, computedTime: time };
  });
    // If WorkoutTime is provided, add a new "workout" item.
    if (WorkoutTime) {
      items.push({
        name: "Workout",
        time_name: "workout" as MealTimeName, // note: "workout" is not in the original union.
        computedTime: WorkoutTime,
        completed: false,
        _id: "0",
        calories: 0,
        fats: 0,
        proteins: 0,
        carbohydrates: 0,
      });
    }
  
    // Sort items by computed time.
    items.sort((a, b) => {
      const [aHour, aMin] = a.computedTime.split(":").map(Number);
      const [bHour, bMin] = b.computedTime.split(":").map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });
  
    // Compute x, y positions along the semicircular arc.
    const times = items.map(item => {
      const [hours, minutes] = item.computedTime.split(":").map(Number);
      return hours * 60 + minutes;
    });
    const startMinutes = Math.min(...times);
    const endMinutes = Math.max(...times);
    const totalArc = endMinutes - startMinutes;
  
    return items.map((item) => {
      const [hours, minutes] = item.computedTime.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes;
      const prog = totalArc === 0 ? 0.5 : (totalMinutes - startMinutes) / totalArc;
      const angle = Math.PI * prog;
      let x, y;
      if (item.time_name === "workout") {
        // Offset the workout icon slightly.
        x = CENTER_X - 5 + (RADIUS_X - 50) * Math.cos(Math.PI - angle);
        y = CENTER_Y + 15 - (RADIUS_Y - 40 )* Math.sin(Math.PI - angle);
      } else {
        x = CENTER_X - 5 + (RADIUS_X - 10) * Math.cos(Math.PI - angle);
        y = CENTER_Y + 15 - RADIUS_Y * Math.sin(Math.PI - angle);
      }
      return { ...item, x, y };
    });
  }, [dietary, WorkoutTime]);
  
  // Modified getIconForTime accepts isSelected to change color.
  const getIconForTime = useCallback((time_name: MealTimeName, isSelected = false, size: number | null = null) => {
    const iconColor = isSelected ? "#FFC1A1" : "white";
    
    switch (time_name) {
      case "breakfast":
        return <Feather name="sunrise" size={size === null? 26: size} color={iconColor} />;
      case "lunch":
        return <Feather name="sun" size={size === null? 26: size} color={iconColor} />;
      case "dinner":
        return <Feather name="sunset" size={size === null? 26: size} color={iconColor} />;
      case "snack":
        return <MaterialCommunityIcons name="food-croissant" size={size === null? 26: size} color={iconColor} />;
      case "pre-workout":
        return <MaterialCommunityIcons name="food-variant" size={size === null? 26: size} color={iconColor} />;
      case "post-workout":
        return <MaterialCommunityIcons name="food-apple" size={size === null? 26: size} color={iconColor} />;
      case "workout":
        return <Ionicons name="barbell-outline" size={size === null? 20: size} color="#63F19E" style={{ transform: [{ rotate: "45deg" }] }} />;
      default:
        return null;
    }
  }, []);
  
  // Update the shared value when an icon is pressed.
  const handleMealIconPress = useCallback((index: number) => {
    setSelectedMealIndex(index);
    selectedIndexSV.value = index;
    flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  }, [selectedIndexSV]);
  
  useEffect(() => {
    flatListRef.current?.scrollToIndex({ index: selectedMealIndex, animated: false });
  }, [selectedMealIndex]);
 
  // A new component for the meal icon on the semicircle.
  const MealIcon = ({
    time,
    time_name,
    coordinates,
    completed,
    index,
  }: {
    time: string
    time_name: MealTimeName
    coordinates: { x: number; y: number }
    completed: boolean
    index: number
  }) => {
    const animatedIconStyle = useAnimatedStyle(() => {
      const isSelected = selectedIndexSV.value === index
      return {
        transform: [{ scale: isSelected ? withTiming(1.2, { duration: 200 }) : withTiming(1, { duration: 200 }) }],
        zIndex: isSelected ? 999 : 1,
      }
    })

    let bgColorClass = ""
    if (time_name !== "workout") {
      const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes()
      const [mealH, mealM] = time.split(":").map(Number)
      const mealMins = mealH * 60 + mealM

      // Parse WorkoutTime
      const [workoutH, workoutM] = (WorkoutTime || "").split(":").map(Number)
      const workoutMins = workoutH * 60 + workoutM

      if (time_name === "pre-workout") {
        bgColorClass = currentMins < workoutMins ? "bg-primary_dark" : completed ? "bg-green_subtle" : "bg-error_subtle"
      } else if (time_name === "post-workout") {
        bgColorClass = currentMins < workoutMins ? "bg-primary_dark" : completed ? "bg-green_subtle" : "bg-error_subtle"
      } else {
        bgColorClass = currentMins < mealMins ? "bg-primary_dark" : completed ? "bg-green_subtle" : "bg-error_subtle"
      }
    }

    return (
      <Animated.View
        style={[{ left: coordinates.x - 20, top: coordinates.y - 20 }, animatedIconStyle]}
        className="absolute w-12 h-12 items-center justify-center"
      >
        <TouchableOpacity onPress={() => handleMealIconPress(index)} disabled={time_name === "workout"}>
          <View
            className={`${time_name !== "workout" ? `${bgColorClass} border-2 border-white/20 rounded-full p-2` : ""}`}
          >
            {getIconForTime(time_name.toLowerCase() as MealTimeName, selectedMealIndex === index)}
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderMealItem = useCallback(
    ({ item: diet, index }: { item: PositionedMealItem; index: number }) => (
      <View key={index} style={{ width: ITEM_WIDTH }}>
        <View className="flex-col justify-center items-center flex-1 h-28">
          <View className="flex-row w-full justify-end">
            {diet.completed && (
              <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex items-center justify-center">
              <AntDesign name="checkcircle" size={10} color="#63F19E" />
              </View>
            )}
            <View className="w-1" />
            {diet.fats != null && (
              <Pressable
              onLongPress={() => showTooltip("Fats", index)}
              className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center ml-1"
              >
              <MaterialIcons name="water-drop" size={10} color="#6dd5fa" />
              <Text className="text-white ml-1">{diet.fats}</Text>
              </Pressable>
            )}
            <View className="w-1" />
            {diet.proteins != null && (
              <Pressable
              onLongPress={() => showTooltip("Proteins", index)}
              className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center ml-1"
              >
              <MaterialCommunityIcons name="chemical-weapon" size={10} color="#7bffba" />
              <Text className="text-white ml-1">{diet.proteins}</Text>
              </Pressable>
            )}
            <View className="w-1" />
            {diet.carbohydrates !== null && (
              <Pressable
              onLongPress={() => showTooltip("Carbohydrates", index)}
              className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center ml-1"
              >
              <FontAwesome6 name="jar-wheat" size={10} color="#fff3d4" />
              <Text className="text-white ml-1">{diet.carbohydrates}</Text>
              </Pressable>
            )}
          </View>
          <View className="w-full flex-row items-center justify-start mt-4 px-3">
            
            {getIconForTime(diet.time_name, false, 30)}

            <Text className="text-white text-heading w-[80%] font-semibold px-2">{diet.name}</Text>

            <TouchableOpacity onPressOut={() => handleEditMealPress(diet)}>
              <Feather name="edit-3" size={22} color="white" style={{opacity:0.6}} />
            </TouchableOpacity>

            {tooltip.visible && tooltip.index === index && (
              <Animated.View style={fadeStyle} className="absolute top-[-60px] z-50 right-0 bg-black/70 border-2 border-black rounded-md px-4 py-1">
              <Text className="text-white text-xs">{tooltip.text}</Text>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    ),
    [getIconForTime, tooltip, fadeStyle, showTooltip]
  );

// 
// Handle  edit meal btn press here
// 

  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingMeal, setEditingMeal] = useState<MealItem | null>(null)


  const handleEditMealPress = useCallback((meal?: MealItem) => {
    meal && setEditingMeal(meal)
    setIsEditModalVisible(true)
  }, [])

  const handleEditMealClosePress = () => {
    setEditingMeal(null)
    setIsEditModalVisible(false)
  };

  const onMarkDone = () => {
    
  }


    const handleSaveEditedMeal = useCallback(async (mealDataFromModal: MealItem) => {
        setIsSubmittingMeal(true);
        try {
            let newMealsArray: BackendMealInput[];
            const currentMeals = dietary?.Meals || [];

            if (editingMeal) { // Editing existing meal
                newMealsArray = currentMeals.map(m =>
                    m._id === editingMeal._id
                        ? mapFrontendMealToBackendInput(mealDataFromModal) // Use updated data
                        : mapFrontendMealToBackendInput(m) // Keep existing data for others
                );
            } else { // Adding new meal
                newMealsArray = [
                    ...currentMeals.map(mapFrontendMealToBackendInput),
                    mapFrontendMealToBackendInput(mealDataFromModal) // Add the new meal
                ];
            }

            const payload = {
                Meals: newMealsArray,
                userId: authUser?._id, // Backend expects userId in body
            };

            console.log(`Updating dietary log with payload:`, JSON.stringify(editingMeal, null, 2));
            console.log(`${BASE_URL}/dietery/update/meal/${editingMeal?._id}`, editingMeal);

            await axios.put(`${BASE_URL}/dietery/update/meal/${editingMeal?._id}`, mapFrontendMealToBackendInput(mealDataFromModal), {
                headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
            });

            console.log("Success", "Meal saved successfully!");
            setIsEditModalVisible(false);
            setEditingMeal(null);
            // Refresh data for the current day
            if (authUser?._id) {
                fetchDietaryData(authUser._id, selectedDate);
            }
        } catch (error) {
            console.error("Error saving meal:", error);
            const message = error instanceof AxiosError ? error.response?.data?.message || error.message : "Failed to save meal.";
            console.error("Error", message);
        } finally {
            setIsSubmittingMeal(false);
        }
    }, [dietary, editingMeal, authUser, jwt, fetchDietaryData, selectedDate]); // Added selectedDate

  
  
    console.log(
      `Meal positions: ${mealPositions.map((item) => `${item.name} (${item.x}, ${item.y})`).join(", ")}`
    )


  return (
    <View className="bg-primary_dark rounded-3xl p-2 py-4">
      <Text className="text-white text-2xl font-semibold pl-3 m-2">Meal Schedule</Text>
      <View className="items-center justify-center w-full aspect-[3/2] border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden">
        <LinearGradient
              colors={['rgba(255,255,255,0)','rgba(255,255,255,0.01)', 'rgba(255,255,255,0.1)']}
              locations={[0,.5,1]}
              style={{ flex: 1, borderRadius: 15}}
              className="absolute bottom-0 left-0 h-full w-full"
          />
        <Svg height="100%" width="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
          <Defs>
            <Mask id="mask">
              <AnimatedRect x="0" y="0" height={SVG_HEIGHT} fill="white" animatedProps={animatedMaskProps} />
            </Mask>
          </Defs>
          <Path
            d={`M20 ${CENTER_Y} A${RADIUS_X} ${RADIUS_Y} 0 0 1 ${SVG_WIDTH - 20} ${CENTER_Y}`}
            fill="none"
            stroke="#ffffff20"
            strokeWidth="4"
            strokeDasharray="8,8"
          />
          <Path
            d={`M20 ${CENTER_Y} A${RADIUS_X} ${RADIUS_Y} 0 0 1 ${SVG_WIDTH - 20} ${CENTER_Y}`}
            fill="none"
            stroke="#FFC1A1"
            strokeWidth="4"
            strokeDasharray="8,8"
            mask="url(#mask)"
          />
        </Svg>
        <View className="absolute top-0 left-0 right-0 bottom-0">
          {mealPositions.map((meal, index) => (
            <MealIcon
            key={meal._id || index}  
            time={meal.time ?? "12:00"}
            time_name={meal.time_name}
            coordinates={{ x: meal.x, y: meal.y }}
            completed={meal.completed}
            index={index}
            />
          ))}
        </View>

        {/* Center view inside the semicircle displaying the selected meal */}
        <View className="absolute bottom-0 w-full h-[70%] flex items-center justify-center">
          {mealPositions[selectedMealIndex] && (
            <>
              <Text className="text-white text-lg font-bold">
                {mealPositions[selectedMealIndex].time_name}
              </Text>
              <Text className="text-white/60 text-base">
                {mealPositions[selectedMealIndex].computedTime}
              </Text>
            </>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={mealPositions}
        renderItem={renderMealItem}
        keyExtractor={(item) => item._id} 
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{}}
        className="h-30 w-full"
        initialScrollIndex={selectedMealIndex}
        onScrollToIndexFailed={() => {}}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
      />


      <View className="flex-row space-x-4 mt-4">

        <TouchableOpacity
          onPress={onMarkDone}
          className="flex-1 bg-white/10 border border-white/20 rounded-full py-3 items-center"
        >
          <Text className="text-white font-semibold text-lg">Mark Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {handleEditMealPress()}}
          className="flex bg-white/10 border border-white/20 rounded-full p-2 items-center "
        >
          <MaterialIcons name="add-circle" size={36} color="white" />
        </TouchableOpacity>
      </View>

      
      {editingMeal && (
        <EditMealModal
          isVisible={isEditModalVisible}
          onClose={() => handleEditMealClosePress() }
          onSave={handleSaveEditedMeal}
          meal={editingMeal}
          isAdding={editingMeal ? false : true}
        />
      )}
    </View>
  );
};

export default MealTimer;
