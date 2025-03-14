// File: components/mental-wellness/FullPlayer.tsx
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions, Pressable } from "react-native";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Reanimated from "react-native-reanimated";
import { useMusicPlayer } from "@/context/MusicPlayer";
import { QueueList } from "./QueueList";

type FullPlayerProps = {
  style: any;
  screenHeight: number;
};

export const FullPlayer: React.FC<FullPlayerProps> = ({ style, screenHeight }) => {
  const { 
    playbackState, 
    currentSong,
    togglePlay, 
    skipToNext, 
    skipToPrevious, 
    seek,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    toggleExpanded
  } = useMusicPlayer();
  
  const insets = useSafeAreaInsets();
  
  // Add local slider state to fix slider issues
  const [sliderValue, setSliderValue] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  // Update local slider value when not sliding
  React.useEffect(() => {
    if (!isSliding) {
      setSliderValue(playbackState.currentPosition);
    }
    // console.log(playbackState)
  }, [playbackState.currentPosition, isSliding]);


  // Format time function
  const formatTime = (milliseconds: number) => {
    if (milliseconds <= 0) return "0:00";
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  
  if (!currentSong) return null;
  
  // Separate player controls from animated components
  const renderControls = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 40,
        marginBottom: 32,
      }}
    >
      <TouchableOpacity
        onPress={toggleShuffle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome6
          name="shuffle"
          size={20}
          color={playbackState.shuffle ? "#FFC1A1" : "rgba(255, 255, 255, 0.6)"}
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={skipToPrevious}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome6 name="backward-step" size={28} color="white" />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={togglePlay}
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: "rgba(255, 193, 161, 0.2)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FontAwesome6
          name={playbackState.isPlaying ? "pause" : "play"}
          size={28}
          color="#FFC1A1"
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={skipToNext}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome6 name="forward-step" size={28} color="white" />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={toggleRepeat}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons
          name={playbackState.repeat === "one" ? "repeat-one" : "repeat"}
          size={26}
          color={
            playbackState.repeat !== "off"
              ? "#FFC1A1"
              : "rgba(255, 255, 255, 0.6)"
          }
        />
      </TouchableOpacity>
    </View>
  );
  
  return (
    <Reanimated.ScrollView
      style={[
        {
          height: screenHeight,
          width: "100%",
          backgroundColor: "#121225",
          position: "absolute",
          top: 0,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <LinearGradient
        colors={["rgba(30, 30, 45, 1)", "rgba(10, 10, 20, 1)"]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <TouchableOpacity
            onPress={toggleExpanded}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome6 name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
          
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            {currentSong.playlistName}
          </Text>
          
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome6 name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Album Art */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Image
            source={{ uri: currentSong.image }}
            style={{
              width: Dimensions.get("window").width * 0.7,
              height: Dimensions.get("window").width * 0.7,
              borderRadius: 12,
              marginBottom: 24,
            }}
            resizeMode="cover"
          />
        </View>
        
        {/* Song Info */}
        <View style={{ paddingHorizontal: 24, alignItems: "center" }}>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            {currentSong.title}
          </Text>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 16,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            {currentSong.artist}
          </Text>
        </View>
        
        {/* Progress - FIXED SLIDER IMPLEMENTATION */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={playbackState.duration || 1}
            value={sliderValue}
            onSlidingStart={() => setIsSliding(true)}
            onValueChange={setSliderValue}
            onSlidingComplete={(value) => {
              seek(value);
              setIsSliding(false);
            }}
            minimumTrackTintColor="#FFC1A1"
            maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
            thumbTintColor="#FFC1A1"
          />
          
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: -8,
            }}
          >
            <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}>
              {isSliding ? formatTime(sliderValue) : formatTime(playbackState.currentPosition)}
            </Text>
            <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}>
              {formatTime(playbackState.duration)}
            </Text>
          </View>
        </View>
        
        {/* Controls */}
        {renderControls()}
        
        {/* Volume - FIXED SLIDER IMPLEMENTATION */}
        {/* <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 30,
            marginBottom: 24,
          }}
        >
          <FontAwesome6
            name="volume-low"
            size={16}
            color="rgba(255, 255, 255, 0.6)"
          />
          <Slider
            style={{ flex: 1, marginHorizontal: 12, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            value={playbackState.volume}
            onValueChange={(value) => {
              setVolume(value);
            }}
            minimumTrackTintColor="#FFC1A1"
            maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
            thumbTintColor="#FFC1A1"
          />
          <FontAwesome6
            name="volume-high"
            size={16}
            color="rgba(255, 255, 255, 0.6)"
          />
        </View> */}
        
        {/* Queue */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 12,
              paddingHorizontal: 24,
            }}
          >
            Up Next
          </Text>
          
          <QueueList />
        </View>
      </LinearGradient>
    </Reanimated.ScrollView>
  );
};

export default FullPlayer;