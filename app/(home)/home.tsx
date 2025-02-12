import { useCallback, useRef, useState } from "react"
import { Dimensions, SafeAreaView, View } from "react-native"

import Header, { Section } from "@/components/header"
import WorkoutList from "@/components/home screen/WorkoutListHome"
import DietaryList from "@/components/home screen/DietaryListHome"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

const Home = () => {
  const [currentSection, setCurrentSection] = useState<Section>("Workout")

  const translateX = useSharedValue(0)
  const context = useRef({ x: 0 })

  // const handleCardChange = useCallback(
  //   (section: Section) => {
  //     translateX.value = withSpring(section === "Workout" ? 0 : -SCREEN_WIDTH * 0.9)
  //   },
  //   [translateX],
  // )

  const panGesture = Gesture.Pan()
    .onStart(() => {
      translateX.value = translateX.value
    })
    .onUpdate((event) => {
      translateX.value = (event.translationX * 0.1) + translateX.value
    })
    .onEnd((event) => {
      const shouldSnapToEnd =
        event.velocityX < -500 ||
        (event.velocityX >= -5000 && event.velocityX <= 5000 && translateX.value > SCREEN_WIDTH*0.5 )
      translateX.value = withSpring(shouldSnapToEnd ? -SCREEN_WIDTH - 40 : 0, { velocity: 1 })
    })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    }
  })

  const handleSectionChange = (section: Section) => {
    setCurrentSection(section)
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
        completed: true
    },
    {
        name: "Chicken Salad",
        time: "lunch",
        fats: 15,
        proteins: 25,
        carbohydrates: 10,
        completed: false
    },
    {
        name: "Protein Shake",
        time: "pre-workout",
        fats: 2,
        proteins: 20,
        carbohydrates: 5,
        completed: false
    },
    {
        name: "Grilled Salmon",
        time: "dinner",
        fats: 20,
        proteins: 30,
        carbohydrates: 0,
        completed: true
    }
]



  return (
    <GestureHandlerRootView>
      <SafeAreaView className="flex-1 flex">
        <Header
          username="GD"
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
          onProfilePress={handleProfilePress}
        />
        <View className="w-full flex flex-1 items-center">
          <GestureDetector gesture={panGesture}>
              <Animated.View className="w-[90%] flex-row my-12" style={animatedStyle}>
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
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default Home
