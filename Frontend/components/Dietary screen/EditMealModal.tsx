"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, Pressable, BackHandler } from "react-native"
import { Feather, MaterialIcons, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons"
import type { DietaryItem, MealTimeName } from "@/constants/types"
import { RecommendedMeals } from "@/constants/sampledata"
import { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { GestureDetector, Gesture } from "react-native-gesture-handler"
import Animated from "react-native-reanimated" // Import Animated

interface EditMealModalProps {
  isVisible: boolean
  onClose: () => void
  onSave: (meal: DietaryItem) => void
  meal: DietaryItem | null
  isAdding: boolean
}

const mealCategories: MealTimeName[] = ["breakfast", "lunch", "dinner", "snack", "pre-workout", "post-workout"]

const EditMealModal: React.FC<EditMealModalProps> = ({ isVisible, onClose, onSave, meal, isAdding }) => {
  const [editedMeal, setEditedMeal] = useState<DietaryItem>(
    meal || {
      name: "",
      time_name: "breakfast",
      time: "",
      fats: 0,
      proteins: 0,
      carbohydrates: 0,
      completed: false,
    },
  )
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [recommendations, setRecommendations] = useState(RecommendedMeals)
  const fadeValue = useSharedValue(0)

  const handleSave = () => {
    onSave(editedMeal)
    onClose()
  }

  const handleInputChange = (field: keyof DietaryItem, value: string) => {
    setEditedMeal((prev) => ({
      ...prev,
      [field]: field === "name" || field === "time" || field === "time_name" ? value : Number(value),
      time_name: field === "time_name" ? (value as MealTimeName) : prev.time_name || "breakfast",
    }))
  }

  const refreshRecommendations = useCallback(() => {
    const shuffled = [...RecommendedMeals].sort(() => 0.5 - Math.random())
    setRecommendations(shuffled.slice(0, 30))
  }, [])

  const recommendRandom = useCallback(() => {
    const filteredMeals = editedMeal.time_name
      ? RecommendedMeals.filter((m) => m.time_name === editedMeal.time_name)
      : RecommendedMeals
    const randomMeal = filteredMeals[Math.floor(Math.random() * filteredMeals.length)]
    setEditedMeal(randomMeal)
  }, [editedMeal.time_name])

  const showTooltip = useCallback(
    (text: string) => {
      fadeValue.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
      const timeoutId = setTimeout(() => {
        fadeValue.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) })
      }, 2000)
      return () => clearTimeout(timeoutId)
    },
    [fadeValue],
  )

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
  }))

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((m) => m.time_name === editedMeal.time_name)
  }, [recommendations, editedMeal.time_name])

  const renderRecommendedMeal = useCallback(
    ({ item }: { item: DietaryItem }) => (
      <TouchableOpacity
        key={item.name}
        className="bg-primary_dark/50  rounded-xl mb-4 border-2 border-white/25"
        onPress={() => setEditedMeal(item)}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.1)"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, borderRadius: 10 }}
          className="absolute bottom-0 left-0 h-full w-full"
        />
        <View className="m-4">
          <View className="flex-row justify-between items-center mb-4 ">
            <Text className="text-white text-lg font-semibold">{item.name}</Text>
            <Text className="text-gray-400">{item.time}</Text>
          </View>
          <View className="flex-row justify-end space-x-2 mr-4">
            <Pressable
              onLongPress={() => showTooltip("Fats")}
              className="bg-white/10 border border-white/30 px-2 py-1 rounded-md flex flex-row items-center"
            >
              <MaterialIcons name="water-drop" size={12} color="#6dd5fa" />
              <Text className="text-white text-medium ml-1">{item.fats}</Text>
            </Pressable>
            <Pressable
              onLongPress={() => showTooltip("Proteins")}
              className="bg-white/10 border border-white/30 px-2 py-1 rounded-md flex flex-row items-center"
            >
              <MaterialCommunityIcons name="chemical-weapon" size={12} color="#7bffba" />
              <Text className="text-white text-medium ml-1">{item.proteins}</Text>
            </Pressable>
            <Pressable
              onLongPress={() => showTooltip("Carbohydrates")}
              className="bg-white/10 border border-white/30 px-2 py-1 rounded-md flex flex-row items-center"
            >
              <FontAwesome6 name="jar-wheat" size={12} color="#fff3d4" />
              <Text className="text-white text-medium ml-1">{item.carbohydrates}</Text>
            </Pressable>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [showTooltip],
  )

  const renderCategoryItem = ({ item }: { item: MealTimeName }) => (
    <TouchableOpacity
      className={`py-3 px-4 border-b border-white/10 ${editedMeal.time_name === item ? "bg-accent/20" : ""}`}
      onPress={() => {
        handleInputChange("time_name", item)
        setShowCategoryPicker(false)
      }}
    >
      <Text className="text-white text-medium capitalize">{item.replace("-", " ")}</Text>
    </TouchableOpacity>
  )

  const renderListHeader = () => (
    <>
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-bold">{isAdding ? "Add Meal" : "Edit Meal"}</Text>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View className="space-y-4 mb-6">
        <View>
          <Text className="text-white mb-2">Name</Text>
          <TextInput
            className="bg-white/10 text-white p-3 rounded-xl"
            value={editedMeal.name}
            onChangeText={(value) => handleInputChange("name", value)}
            placeholder="Meal name"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View>
          <Text className="text-white mb-2">Meal Category</Text>
          <TouchableOpacity
            className="bg-white/10 p-3 rounded-xl flex-row justify-between items-center"
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text className="text-white capitalize">
              {editedMeal.time_name ? editedMeal.time_name.replace("-", " ") : "Select category"}
            </Text>
            <Feather name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View>
          <Text className="text-white mb-2">Time</Text>
          <TextInput
            className="bg-white/10 text-white p-3 rounded-xl"
            value={editedMeal.time}
            onChangeText={(value) => handleInputChange("time", value)}
            placeholder="HH:MM"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View className="flex-row justify-between">
          <View className="w-[30%]">
            <Text className="text-white mb-2">Fats</Text>
            <View className="flex-row items-center bg-white/10 rounded-xl">
              <MaterialIcons name="water-drop" size={20} color="#6dd5fa" style={{ marginLeft: 10 }} />
              <TextInput
                className="flex-1 text-white p-3"
                value={editedMeal.fats?.toString()}
                onChangeText={(value) => handleInputChange("fats", value)}
                keyboardType="numeric"
                placeholder="Fats (g)"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>
          </View>
          <View className="w-[30%]">
            <Text className="text-white mb-2">Proteins</Text>
            <View className="flex-row items-center bg-white/10 rounded-xl">
              <MaterialCommunityIcons name="chemical-weapon" size={20} color="#7bffba" style={{ marginLeft: 10 }} />
              <TextInput
                className="flex-1 text-white p-3"
                value={editedMeal.proteins?.toString()}
                onChangeText={(value) => handleInputChange("proteins", value)}
                keyboardType="numeric"
                placeholder="Proteins (g)"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>
          </View>
          <View className="w-[30%]">
            <Text className="text-white mb-2">Carbs</Text>
            <View className="flex-row items-center bg-white/10 rounded-xl">
              <FontAwesome6 name="jar-wheat" size={20} color="#fff3d4" style={{ marginLeft: 10 }} />
              <TextInput
                className="flex-1 text-white p-3"
                value={editedMeal.carbohydrates?.toString()}
                onChangeText={(value) => handleInputChange("carbohydrates", value)}
                keyboardType="numeric"
                placeholder="Carbs (g)"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>
          </View>
        </View>
      </View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-xl font-semibold">Recommended Alternatives</Text>
        <TouchableOpacity onPress={refreshRecommendations} className="bg-accent/20 p-2 rounded-full">
          <Feather name="refresh-cw" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </>
  )

  const renderListFooter = () => (
    <View className="flex-row justify-between items-center mt-4">
      <TouchableOpacity onPress={recommendRandom} className="bg-accent/20 py-3 px-4 rounded-full items-center">
        <Text className="text-white font-semibold">Recommend Random</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSave} className="bg-accent py-3 px-6 rounded-full items-center">
        <Text className="text-primary font-bold text-lg">{isAdding ? "Add Meal" : "Save Changes"}</Text>
      </TouchableOpacity>
    </View>
  )

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isVisible) {
        onClose()
        return true
      }
      return false
    })

    return () => backHandler.remove()
  }, [isVisible, onClose])

  const swipeDownGesture = Gesture.Pan().onStart((event) => {
    if (event.translationY > 0) {
      onClose()
    }
  })

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <GestureDetector gesture={swipeDownGesture}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-primary_dark rounded-t-3xl p-6 h-5/6">
            <FlatList
              data={filteredRecommendations}
              renderItem={renderRecommendedMeal}
              keyExtractor={(item) => item.name}
              ListHeaderComponent={renderListHeader}
              ListFooterComponent={renderListFooter}
              ListEmptyComponent={
                <Text className="text-white text-center">No recommendations available for this category.</Text>
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </GestureDetector>
      <Modal visible={showCategoryPicker} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-primary_dark rounded-xl w-4/5 max-h-96">
            <FlatList data={mealCategories} renderItem={renderCategoryItem} keyExtractor={(item) => item} />
            <TouchableOpacity
              className="py-3 px-4 border-t border-white/10"
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text className="text-accent text-medium text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Animated.View style={[fadeStyle, { position: "absolute", top: 100, left: 20, right: 20, alignItems: "center" }]}>
        <View className="bg-black/70 px-4 py-2 rounded-md">
          <Text className="text-white text-medium">Long press for more info</Text>
        </View>
      </Animated.View>
    </Modal>
  )
}

export default EditMealModal

