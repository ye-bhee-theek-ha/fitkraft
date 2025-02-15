import { useState } from "react"
import { Dimensions, View } from "react-native"

import WorkoutList from "@/components/home screen/WorkoutListHome"
import DietaryList from "@/components/home screen/DietaryListHome"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { Gesture, GestureDetector, GestureHandlerRootView, ScrollView } from "react-native-gesture-handler"
import { BarChart } from "react-native-gifted-charts"

type Section = "Home" | "Workout" | "Dietary"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export default function Home() {
  const [currentSection, setCurrentSection] = useState<Section>("Home")

  const translateX = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .onStart(() => {
      translateX.value = translateX.value
    })
    .onUpdate((event) => {
      translateX.value = event.translationX * 0.1 + translateX.value
    })
    .onEnd((event) => {
      const shouldSnapToEnd =
        event.velocityX < -500 ||
        (event.velocityX >= -5000 && event.velocityX <= 5000 && translateX.value > SCREEN_WIDTH * 0.5)
      translateX.value = withSpring(shouldSnapToEnd ? -SCREEN_WIDTH - 40 : 0, { velocity: 1, stiffness: 70 })
    })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    }
  })

  const handleSectionChange = (section: Section) => {
    currentSection === section ? setCurrentSection("Home") : setCurrentSection(section)
  }

  const handleSearchPress = () => {
    console.log("Search pressed")
  }

  const handleNotificationPress = () => {
    console.log("Notifications pressed")
  }

  const handleProfilePress = () => {
    console.log("Profile pressed")
  }

  const workoutData = [
    {
      name: "Dumbbell Rows",
      duration: { minutes: 4, seconds: 15 },
      repetitions: 5,
      completed: true,
      caloriesBurned: 235,
    },
    {
      name: "Dumbbell Rows",
      duration: { minutes: 2, seconds: 30 },
      repetitions: 3,
      completed: false,
      caloriesBurned: 45,
    },
    {
      name: "Dumbbell Rows",
      duration: { minutes: 0, seconds: 30 },
      repetitions: 3,
      completed: true,
      caloriesBurned: 45,
    },
    {
      name: "Dumbbell Dumbbell Rows",
      duration: { minutes: 0, seconds: 30 },
      repetitions: 3,
      completed: true,
      caloriesBurned: 45,
    },
  ]

  const DietaryData = [
    {
      name: "Oatmeal with Fruits",
      time: "breakfast",
      fats: 5,
      proteins: 10,
      carbohydrates: 30,
      completed: true,
    },
    {
      name: "Chicken Salad",
      time: "lunch",
      fats: 15,
      proteins: 25,
      carbohydrates: 10,
      completed: false,
    },
    {
      name: "Protein Shake",
      time: "pre-workout",
      fats: 2,
      proteins: 20,
      carbohydrates: 5,
      completed: false,
    },
    {
      name: "Grilled Salmon",
      time: "dinner",
      fats: 20,
      proteins: 30,
      carbohydrates: 0,
      completed: true,
    },
  ]

  const data = [
    { value: 2500, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Jan" },
    { value: 2400, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 3500, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Feb" },
    { value: 3000, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 4500, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Mar" },
    { value: 4000, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 5200, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Apr" },
    { value: 4900, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 3000, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "May" },
    { value: 2800, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 4500, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Mar" },
    { value: 4000, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    { value: 5200, frontColor: "#006DFF", gradientColor: "#009FFF", spacing: 6, label: "Apr" },
    { value: 4900, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },
  ]

  return (
    <GestureHandlerRootView>
      <ScrollView className="flex-1">
          <View>
            <View className="w-full flex items-center">
              <GestureDetector gesture={panGesture}>
                <Animated.View className="w-[90%] flex-row my-6" style={animatedStyle}>
                  <View className="w-full">
                    <DietaryList diets={DietaryData} />
                  </View>
                  <View className="w-20"></View>
                  <View className="w-full">
                    <WorkoutList workouts={workoutData} />
                  </View>
                </Animated.View>
              </GestureDetector>
            </View>
            <View className="w-full flex items-center justify-center mb-6">
              <View className="w-[90%] bg-primary_dark rounded-3xl p-3 border-2 border-white/20 overflow-hidden">
                <BarChart
                  data={data}
                  barWidth={16}
                  initialSpacing={10}
                  spacing={14}
                  barBorderRadius={4}
                  showGradient
                  yAxisThickness={0}
                  xAxisType={"dashed"}
                  xAxisColor={"lightgray"}
                  yAxisLabelWidth={0}
                  stepValue={1000}
                  maxValue={6000}
                  noOfSections={6}
                  labelWidth={40}
                  xAxisLabelTextStyle={{ color: "lightgray", textAlign: "center" }}
                  showLine
                  lineConfig={{
                    color: "#F29C6E",
                    thickness: 3,
                    curved: true,
                    hideDataPoints: true,
                    shiftY: 20,
                    initialSpacing: -30,
                  }}
                />
              </View>
            </View>
          </View>
      </ScrollView>
    </GestureHandlerRootView>
  )
}

