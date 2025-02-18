import { View, Text, ScrollView } from "react-native"

export default function MentalWellnessScreen() {
  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="text-white text-2xl font-bold mb-4">Mental Wellness</Text>
        {/* Add mental wellness-specific content here */}
      </View>
    </ScrollView>
  )
}

