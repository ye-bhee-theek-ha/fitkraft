"use client"

import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native"
import { Href, router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"


const menuItems = [
  {
    title: "Meditation",
    description: "Techniques, Benefits, and\na Beginner's How-To",
    image: require('@/assets/images/MentalWellness/Index/meditation.png'),
    route: "/(mental-wellness)/meditation",
  },
  {
    title: "Music",
    description: "Techniques, Benefits, and\na Beginner's How-To",
    image: require('@/assets/images/MentalWellness/Index/music.png'),
    route: "/(mental-wellness)/music",
  },
  // {
  //   title: "Sleep",
  //   description: "Techniques, Benefits, and\na Beginner's How-To",
  //   image: require('@/assets/images/MentalWellness/Index/sleep.png'),
  //   route: "/(mental-wellness)/sleep",
  // },
  {
    title: "Relaxing Videos",
    description: "Techniques, Benefits, and\na Beginner's How-To",
    image: require('@/assets/images/MentalWellness/Index/Relaxing Videos.png'),
    route: "/(mental-wellness)/RelaxingVideos",
  },
]

const MenuItemCard = ({ item }: { item: (typeof menuItems)[0] }) => (
  <TouchableOpacity
    key={item.title}
    className="bg-primary_dark rounded-3xl overflow-hidden border-2 border-white/20 mb-4"
    onPress={() => router.push(item.route as Href<string | object>)}
    style={{ elevation: 3 }}
    accessibilityLabel={`Open ${item.title}`}
    accessible={true}
  >
    <LinearGradient
      colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="absolute bottom-0 left-0 h-full w-full"
    />
    
    <View className="p-6 flex-1 flex">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-white text-heading font-bold mb-2">{item.title}</Text>
          <Text className="text-white/70 text-medium">{item.description}</Text>
        </View>
        <View className="w-20 h-20 justify-center items-center">
          <Image
            source={item.image}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  </TouchableOpacity>
)

const MentalWellnessScreen = () => {
  return (
    <ScrollView className="flex-1">
      <View className="p-4 space-y-4">
        {menuItems.map((item) => (
          <MenuItemCard key={item.title} item={item} />
        ))}
      </View>
    </ScrollView>
  )
}

export default MentalWellnessScreen
