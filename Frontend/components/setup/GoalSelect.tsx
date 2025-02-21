import { Text, View, TouchableOpacity } from "react-native"

interface GoalSelectProps {
  selectedGoal: string | null
  onGoalSelect: (goal: string) => void
}

const GoalSelect = ({ selectedGoal, onGoalSelect }: GoalSelectProps) => {
  return (
    <View className="flex flex-1 items-center w-screen">

      <View className="px-6 items-center">
        <Text className="text-white text-3xl font-semibold mb-4 text-center">What Is Your Goal?</Text>
      
        <Text className="text-gray-400 text-base mb-12 text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </Text>
      </View>

      {/* Goal Options */}
      <View className="space-y-8 bg-primary_dark w-full py-10 px-6">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onGoalSelect("lose")}
          className={`flex-row justify-between items-center p-4 rounded-full border ${
            selectedGoal === "lose" ? "border-accent bg-accent/10" : "border-gray-600 bg-transparent"
          }`}
        >
          <Text className="text-white text-lg">Lose Weight</Text>
          <View
            className={`w-6 h-6 rounded-full border-2 ${
              selectedGoal === "lose" ? "border-accent bg-accent_light" : "border-gray-600"
            }`}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onGoalSelect("gain")}
          className={`flex-row justify-between items-center p-4 rounded-full border ${
            selectedGoal === "gain" ? "border-accent bg-accent/10" : "border-gray-600 bg-transparent"
          }`}
        >
          <Text className="text-white text-lg">Gain Weight</Text>
          <View
            className={`w-6 h-6 rounded-full border-2 ${
              selectedGoal === "gain" ? "border-accent bg-accent_light" : "border-gray-600"
            }`}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default GoalSelect;