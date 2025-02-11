import { useState } from "react"
import { SafeAreaView, View } from "react-native"

import Header, { Section } from "@/components/header"
import WorkoutList from "@/components/home screen/WorkoutListHome"
import DietaryList from "@/components/home screen/DietaryListHome"


const Home = () => {
  const [currentSection, setCurrentSection] = useState<Section>("Workout")



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
        <View className="w-[90%] my-12 ">
          <DietaryList diets={DietaryData} />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Home
