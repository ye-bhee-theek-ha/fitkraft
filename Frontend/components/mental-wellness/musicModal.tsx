"use client"

import { View, Text, Image, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { MusicItem } from "@/constants/types"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface MusicModalProps {
  isVisible: boolean
  onClose: () => void
  music?: MusicItem
}

interface Song {
  id: string
  title: string
  artist: string
  thumbnail: string
  duration: string
}

const sampleSongs: Song[] = [
  {
    id: "1",
    title: "Rollin' and Scratchin'",
    artist: "Daft Punk",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DAe0uQio6bdBeoFZa3PaVxiypBRIAF.png",
    duration: "3:45",
  },
  {
    id: "2",
    title: "Lose Yourself to Dance",
    artist: "Daft Punk",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DAe0uQio6bdBeoFZa3PaVxiypBRIAF.png",
    duration: "4:12",
  },
  {
    id: "3",
    title: "Technologic",
    artist: "Daft Punk",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DAe0uQio6bdBeoFZa3PaVxiypBRIAF.png",
    duration: "3:56",
  },
  {
    id: "4",
    title: "Veridis Quo",
    artist: "Daft Punk",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DAe0uQio6bdBeoFZa3PaVxiypBRIAF.png",
    duration: "4:24",
  },
]

export default function MusicModal({ isVisible, onClose, music }: MusicModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set())

  const toggleLike = (songId: string) => {
    setLikedSongs((prev) => {
      const newLiked = new Set(prev)
      if (newLiked.has(songId)) {
        newLiked.delete(songId)
      } else {
        newLiked.add(songId)
      }
      return newLiked
    })
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent statusBarTranslucent>
      <View className="flex-1 bg-primary">
        <LinearGradient
          colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0)", "transparent"]}
          className="absolute top-0 left-0 right-0 h-72"
        />

        {/* Header */}
        <View className="pt-12 px-4">
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <Ionicons name="ellipsis-horizontal" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Artist Info */}
          <View className="items-center mb-8">
            <Image
              source={{
                uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DAe0uQio6bdBeoFZa3PaVxiypBRIAF.png",
              }}
              className="w-48 h-48 rounded-xl mb-4"
              resizeMode="cover"
            />
            <Text className="text-white text-2xl font-bold mb-1">Daft Punk</Text>
            <Text className="text-gray-400 text-sm">6.8m listeners</Text>
          </View>

          {/* Play Button */}
          <View className="items-center mb-8">
            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              className="bg-accent w-16 h-16 rounded-full items-center justify-center"
            >
              <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#2A3445" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Song List */}
        <View className="flex-1 px-4">
          <Text className="text-white text-xl font-semibold mb-4">Latest releases</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {sampleSongs.map((song) => (
              <View key={song.id} className="flex-row items-center mb-4">
                <Image source={{ uri: song.thumbnail }} className="w-12 h-12 rounded-md mr-3" />
                <View className="flex-1">
                  <Text className="text-white font-medium">{song.title}</Text>
                  <Text className="text-gray-400 text-sm">{song.artist}</Text>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={() => toggleLike(song.id)} className="mr-4">
                    <Ionicons
                      name={likedSongs.has(song.id) ? "heart" : "heart-outline"}
                      size={20}
                      color={likedSongs.has(song.id) ? "#FFC1A1" : "white"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

