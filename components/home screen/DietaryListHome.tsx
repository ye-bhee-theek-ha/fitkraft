"use client"

import type React from "react"
import { View, Text, ScrollView, Animated, Pressable } from "react-native"
import AntDesign from "@expo/vector-icons/AntDesign"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import Feather from "@expo/vector-icons/Feather"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import { LinearGradient } from "expo-linear-gradient"
import { useRef, useState, useEffect } from "react"

interface DietaryItem {
  name: string
  time: string
  fats?: number
  proteins?: number
  carbohydrates?: number
  completed: boolean
}

interface DietaryListProps {
  diets: DietaryItem[]
}

interface TooltipState {
  visible: boolean
  text: string
  index: number
}

const DietaryList: React.FC<DietaryListProps> = ({ diets }) => {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, text: "", index: -1 })
  const fadeAnim = useRef(new Animated.Value(0)).current
  const tooltipTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current)
      }
    }
  }, [])

  const showTooltip = (text: string, index: number) => {
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current)
    }

    setTooltip({ visible: true, text, index })
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()

    tooltipTimeout.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setTooltip({ visible: false, text: "", index: -1 })
      })
    }, 5000)
  }

  const GetIconForTime = (time: string) => {
    switch (time) {
      case "breakfast":
        return <Feather name="sunrise" size={28} color="white" />
      case "lunch":
        return <Feather name="sun" size={28} color="white" />
      case "dinner":
        return <Feather name="sunset" size={28} color="white" />
      case "snack":
        return <MaterialCommunityIcons name="food-croissant" size={28} color="white" />
      case "pre-workout":
        return <MaterialCommunityIcons name="food-variant" size={28} color="white" />
      case "post-workout":
        return <MaterialIcons name="local-drink" size={28} color="white" />
      default:
        return null
    }
  }

  return (
    <View className="bg-primary_dark p-3 rounded-3xl">
      <View className="flex-row items-center m-2 mb-2 mt-0">
        <MaterialCommunityIcons name="food-apple" size={24} color="white" />
        <Text className="text-white text-text font-semibold ml-2">Diet</Text>
      </View>
      <View className="border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden">
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.1)"]}
          locations={[0, 0.5, 1]}
          style={{ flex: 1, borderRadius: 15 }}
          className="absolute bottom-0 left-0 h-full w-full"
        />
        <ScrollView
          scrollEnabled={diets.length > 3}
          showsVerticalScrollIndicator={false}
          className={`${diets.length > 3 ? "h-52" : ""}`}
        >
          {diets.map((diet, index) => (
            <View key={index} className="flex-row h-16 items-center justify-between p-3 mb-1 rounded-lg">
              <View className="flex-row items-center flex-1 h-full">
                <View className="h-full flex justify-end flex-col mr-2">{GetIconForTime(diet.time)}</View>

                <View className="flex-1">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-400 font-semibold text-medium ml-2">{diet.time}</Text>

                    <View className="flex-row">
                      {diet.completed && (
                        <View className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex items-center justify-center">
                          <AntDesign name="checkcircle" size={10} color="#63F19E" />
                        </View>
                      )}

                      <View className="w-1" />

                      {diet.fats && (
                        <Pressable
                            onLongPress={() => showTooltip("Fats", index)}
                            className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center"
                        >
                            <MaterialIcons name="water-drop" size={10} color="#6dd5fa" />
                            <Text className="text-white text-icon_text ml-1">{diet.fats}</Text>
                        </Pressable>
                      )}

                      <View className="w-1" />

                      {diet.proteins && (
                        <Pressable
                            onLongPress={() => showTooltip("Proteins", index)}
                            className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center"
                        >
                            <MaterialCommunityIcons name="chemical-weapon" size={10} color="#7bffba" />
                            <Text className="text-white text-icon_text ml-1">{diet.proteins}</Text>
                        </Pressable>
                      )}

                      <View className="w-1" />

                      {diet.carbohydrates !== null && (
                        <Pressable
                            onLongPress={() => showTooltip("Carbohydrates", index)}
                            className="bg-white/10 border border-white/30 px-1.5 py-0.5 rounded-md flex flex-row items-center"
                        >
                            <FontAwesome6 name="jar-wheat" size={10} color="#fff3d4" />
                            <Text className="text-white text-icon_text ml-1">{diet.carbohydrates}</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                  <View className="flex-row items-center relative">
                    <Text className="text-white font-semibold text-btn_title pr-2">{diet.name}</Text>
                    {tooltip.visible && tooltip.index === index && (
                      <Animated.View
                        style={{
                          opacity: fadeAnim,
                          position: "absolute",
                          top: -60,
                          right: 0,
                        }}
                        className="bg-black/70 border-2 border-black rounded-md px-4 py-1"
                      >
                        <Text className="text-white text-xs">{tooltip.text}</Text>
                      </Animated.View>
                    )}
                  </View>
                </View>
              </View>

              <View className="flex-col items-start h-full"></View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

export default DietaryList

