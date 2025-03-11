// QueueList.tsx
import React from "react";
import { ScrollView, Image, Text, Pressable } from "react-native";
import { View } from "react-native";
import { useMusicPlayer } from "@/context/MusicPlayer";

export const QueueList: React.FC = () => {
  const { playbackState, playSong } = useMusicPlayer();
  
  // Format time function
  const formatTime = (milliseconds: number) => {
    if (milliseconds <= 0) return "0:00";
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  
  // Handle song selection
  const handleSongPress = (songIndex: number) => {
    if (songIndex === playbackState.currentSongIndex) return;
    
    // Play the selected song
    playSong(playbackState.queue[songIndex], false);
  };
  
  return (
    <ScrollView style={{ flex: 1 }}>
      {playbackState.queue.map((song, index) => (
        <Pressable
          key={`${song.id}-${index}`}
          style={({ pressed }) => [
            {
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor:
                index === playbackState.currentSongIndex
                  ? "rgba(255, 193, 161, 0.15)"
                  : pressed
                  ? "rgba(255, 255, 255, 0.05)"
                  : "transparent",
            },
          ]}
          onPress={() => handleSongPress(index)}
        >
          <Image
            source={{ uri: song.image }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 4,
              marginRight: 12,
            }}
            resizeMode="cover"
          />
          
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "white",
                fontWeight:
                  index === playbackState.currentSongIndex
                    ? "bold"
                    : "normal",
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {song.title}
            </Text>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: 12,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {song.artist}
            </Text>
          </View>
          
          <Text
            style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
          >
            {formatTime(song.duration)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};