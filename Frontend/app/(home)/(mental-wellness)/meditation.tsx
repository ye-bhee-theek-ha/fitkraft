"use client"

import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native"
import { Href, router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { FontAwesome6 } from "@expo/vector-icons"

const MeditationScreen = () => {
  const meditationOptions = [
    {
      title: "Breathing Exercises",
      description: "Techniques, Benefits, and a Beginner's How-To",
      image: require('@/assets/images/MentalWellness/Meditation/breathing exercises.png'),
      route: "/(mental-wellness)/(meditation)/breathing",
    },
    {
      title: "Body Scanning",
      description: "Techniques, Benefits, and a Beginner's How-To",
      image: require('@/assets/images/MentalWellness/Meditation/body scanning.png'),
      route: "/(mental-wellness)/(meditation)/body-scanning",
    },
    {
      title: "Yoga",
      description: "Techniques, Benefits, and a Beginner's How-To",
      image: require('@/assets/images/MentalWellness/Meditation/yoga.png'),
      route: "/(mental-wellness)/(meditation)/yoga",
    },
  ]

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="text-white text-2xl font-bold mb-4">Meditation</Text>
        <View className="space-y-4">
          {meditationOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              className="bg-primary_dark rounded-3xl overflow-hidden border-2 border-white/20"
              onPress={() => router.push(option.route as Href<string | object>)}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute bottom-0 left-0 h-full w-full"
              />
                <View className="flex-row items-center justify-between m-4">
                  <View className="flex-1">
                    <Text numberOfLines={1} adjustsFontSizeToFit className="text-white text-heading font-semibold mb-1">{option.title}</Text>
                    <Text className="text-gray-400 pl-2 text-sm">{option.description}</Text>
                    {/* <View className="flex-row items-center mt-4 ml-3"> */}
                      {/* <Text className="text-black text-small rounded-lg bg-white mr-2 border-2 border-white/25 px-3 py-1">Start Now</Text> */}
                        {/* <FontAwesome6 name="play-circle" size={24} color="#FFC1A1" />  */}
                    {/* </View> */}
                  </View>
                  <View className="w-20 h-20 justify-center items-center">
                    <Image
                      source={option.image}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default MeditationScreen

