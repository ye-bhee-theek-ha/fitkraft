import { Text, View, TouchableOpacity } from "react-native"

interface ActivityLevelSelectorProps {
  selectedLevel: string | null
  onLevelSelect: (level: string) => void
}

export default function ActivityLevelSelector({ selectedLevel, onLevelSelect }: ActivityLevelSelectorProps) {
  const levels = [
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advance", label: "Advance" },
  ]

  return (
    <View className="flex flex-1 items-center">
      <View className="px-6 items-center">
        <Text className="text-white text-3xl font-semibold mb-4 text-center">Physical Activity Level</Text>

        <Text className="text-gray-400 text-base mb-12 text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </Text>
      </View>

      <View className="space-y-8 bg-primary_dark w-full py-10 px-6">
        {levels.map((level) => (
          <TouchableOpacity
            key={level.id}
            activeOpacity={0.7}
            onPress={() => onLevelSelect(level.id)}
            className={`flex-row justify-between items-center p-4 rounded-full border ${
              selectedLevel === level.id ? "border-accent bg-accent/10" : "border-gray-600 bg-transparent"
            }`}
          >
            <Text className="text-white text-lg">{level.label}</Text>
            <View
              className={`w-6 h-6 rounded-full border-2 ${
                selectedLevel === level.id ? "border-accent bg-accent_light" : "border-gray-600"
              }`}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

