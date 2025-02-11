import WorkoutList from "@/components/home screen/WorkoutListHome"
import { SafeAreaView, View } from "react-native"

const App = () => {
  const workoutData = [
    {
      name: "Dumbbell Rows",
      duration: { minutes: 0, seconds: 30 },
      repetitions: 3,
      completed: true,
      caloriesBurned: 45,
    },
    {
      name: "Dumbbell Rows",
      duration: { minutes: 0, seconds: 30 },
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
  ]

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <View className="w-[90%] p-2 ">
        <WorkoutList workouts={workoutData} />
      </View>
    </SafeAreaView>
  )
}

export default App

