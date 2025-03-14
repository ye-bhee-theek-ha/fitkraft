import type React from "react"
import { View, Text, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient"
import { Song, PlaybackState } from "@/constants/types"

interface MusicPlayerCardProps {
  currentSong: Song | null;
  playbackState: PlaybackState;
  togglePlay: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
}

const MusicPlayerCard: React.FC<MusicPlayerCardProps> = ({ 
  currentSong, 
  playbackState, 
  togglePlay, 
  skipToNext, 
  skipToPrevious 
}) => {
  
  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  if (!currentSong) return null;

  return (
    <View className="bg-primary_dark p-3 rounded-3xl">
      <View className="flex-row items-center m-2 mb-2 mt-0">
        <Ionicons name="musical-notes" size={24} color="white" />
        <Text className="text-white text-text font-semibold ml-2">Now Playing</Text>
      </View>
      
      <View className="border-2 border-white/20 rounded-lg rounded-b-3xl overflow-hidden">
        <LinearGradient
          colors={['rgba(255,255,255,0)','rgba(255,255,255,0.01)', 'rgba(255,255,255,0.1)']}
          locations={[0,.5,1]}
          style={{ flex: 1, borderRadius: 15}}
          className="absolute bottom-0 left-0 h-full w-full"
        />
        
        <View className="p-3">
          {/* Song details */}
          <View className="flex-row items-center">
            <Image 
              source={{ uri: currentSong.image }} 
              className="w-12 h-12 rounded-lg mr-3"
            />
            
            <View className="flex-1">
              <Text className="text-white font-medium text-medium">{currentSong.title}</Text>
              <Text className="text-gray-400 text-sm">{currentSong.artist}</Text>
            </View>
            
            <View className="bg-white/10 border border-white/30 px-2 py-1 rounded-md">
              <Text className="text-white text-xs">{currentSong.playlistName}</Text>
            </View>
          </View>
          
          {/* Progress bar */}
          <View className="mt-4 mb-2">
            <View className="h-1 bg-white/20 rounded-full w-full">
              <View 
                className="h-1 bg-white rounded-full" 
                style={{ width: `${(playbackState.currentPosition / playbackState.duration) * 100}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-gray-400 text-xs">{formatDuration(playbackState.currentPosition)}</Text>
              <Text className="text-gray-400 text-xs">{formatDuration(playbackState.duration)}</Text>
            </View>
          </View>
          
          {/* Controls */}
          <View className="flex-row justify-between items-center mt-2">
            <TouchableOpacity onPress={() => skipToPrevious()}>
              <Ionicons name="play-skip-back" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => togglePlay()}
              className="bg-white/10 w-12 h-12 rounded-full items-center justify-center"
            >
              <Ionicons 
                name={playbackState.isPlaying ? "pause" : "play"} 
                size={28} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => skipToNext()}>
              <Ionicons name="play-skip-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Additional controls */}
          <View className="flex-row justify-between mt-4">
            <TouchableOpacity className="items-center">
              <MaterialIcons 
                name={playbackState.shuffle ? "shuffle-on" : "shuffle"} 
                size={20} 
                color={playbackState.shuffle ? "#63F19E" : "white"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <MaterialIcons 
                name={playbackState.repeat === "off" ? "repeat" : playbackState.repeat === "one" ? "repeat-one" : "repeat"} 
                size={20} 
                color={playbackState.repeat !== "off" ? "#63F19E" : "white"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <Ionicons name="heart-outline" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center">
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

export default MusicPlayerCard