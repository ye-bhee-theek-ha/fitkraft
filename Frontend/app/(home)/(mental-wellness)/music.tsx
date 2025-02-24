"use client"

import { View, Text, Image, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { TouchableOpacity } from "react-native-gesture-handler"
import { FontAwesome6 } from "@expo/vector-icons"
import type { MusicItem } from "@/constants/types"
import { useState } from "react"
import MusicModal from "@/components/mental-wellness/musicModal"

const MusicScreen = () => {
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | undefined>()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const musicItems: MusicItem[] = [
    {
      title: "Relaxing Music",
      description: "Techniques, Benefits, and a Beginner's How-To",
      image: require("@/assets/images/MentalWellness/Music/relaxing music.png"),
    },
    {
      title: "Nature",
      description: "Techniques, Benefits, and a Beginner's How-To",
      image: require("@/assets/images/MentalWellness/Music/nature.png"),
    },
    {
      title: "Exercise Music",
      description: "Techniques, Benefits, and a Beginner's How-To",
      image: require("@/assets/images/MentalWellness/Music/workout music.png"),
    },
  ]

  const handleMusicPress = (music: MusicItem) => {
    setSelectedMusic(music)
    setIsModalVisible(true)
  }

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="text-white text-2xl font-bold mb-4">Music</Text>
        <View className="space-y-4">
          {musicItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="bg-primary_dark rounded-3xl overflow-hidden border-2 border-white/20"
              onPress={() => handleMusicPress(item)}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute bottom-0 left-0 h-full w-full"
              />
              <View className="flex-row items-center justify-between m-4">
                <View className="flex-1">
                  <Text numberOfLines={1} adjustsFontSizeToFit className="text-white text-heading font-semibold mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-gray-400 pl-2 text-sm">{item.description}</Text>
                  <View className="flex-row items-center mt-4 ml-3">
                    <Text className="text-black text-small rounded-lg bg-white mr-2 border-2 border-white/25 px-3 py-1">
                      Play Now
                    </Text>
                    <FontAwesome6 name="play-circle" size={24} color="#FFC1A1" />
                  </View>
                </View>
                <View className="w-20 h-20 justify-center items-center">
                  <Image source={item.image} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <MusicModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} music={selectedMusic} />
    </ScrollView>
  )
}

export default MusicScreen

